import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    InjectionToken,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { AppComponent } from '../app.component';
import { ReportPlayerStateRequestBodyType, Session, State, UtopiaBridgeService } from './utopia-bridge.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { UtopiaApiService } from './plugin/utopia-api.service';
import { PluginExecutionService } from './plugin/plugin-execution.service';
import { LoadingService } from '../loading/loading.service';
import { combineLatest, of, Subscription } from 'rxjs';
import { Plugin } from './plugin/Plugin';
import { PluginService } from './plugin/plugin.service';
import { Overlay } from '@angular/cdk/overlay';
import { v4 as UUIdV4 } from 'uuid';
import { PluginSelectionComponent } from './plugin/plugin-selection/plugin-selection.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchCriteria } from './plugin/SearchCriteria';
import { PlayerStateService } from './player-state.service';
import { AuthService } from '../auth/auth.service';
import { distinctUntilChanged, filter, map, switchMap, take } from "rxjs/operators";
import { MetaverseContract } from "../multiverse/metaverse-contract";

export const GAME_TOKEN = new InjectionToken<UtopiaGameComponent>('GAME_TOKEN');

@Component({
    selector: 'app-utopia-game',
    templateUrl: './utopia-game.component.html',
    styleUrls: ['./utopia-game.component.scss'],
    providers: [UtopiaBridgeService, UtopiaApiService, PlayerStateService]
})
export class UtopiaGameComponent implements OnInit, OnDestroy
{
    progress = 0;

    @ViewChild('gameCanvas', { static: true })
    gameCanvas: ElementRef<HTMLCanvasElement>;

    runningPlugins = new Map<string, PluginExecutionService>();
    runningPluginsKeys = new Set<string>();

    private readonly subscription = new Subscription();
    private pluginDialogRef: MatDialogRef<PluginSelectionComponent>;
    private script: HTMLScriptElement;
    private closed = false;


    constructor(private bridge: UtopiaBridgeService, private appComponent: AppComponent,
                private readonly toaster: ToastrService, private readonly route: ActivatedRoute,
                readonly utopiaApi: UtopiaApiService, readonly zone: NgZone,
                readonly loadingService: LoadingService, readonly authService: AuthService,
                readonly pluginService: PluginService, readonly dialogService: MatDialog, readonly overlay: Overlay,
                readonly vcr: ViewContainerRef, readonly cdr: ChangeDetectorRef,
                readonly playerStateService: PlayerStateService)
    {
        window.bridge = bridge;

        bridge.game = this;
    }

    @HostListener('window:beforeunload', ['$event'])
    handleClose(event)
    {
        if (!this.closed)
            event.returnValue = false;
    }

    ngOnInit(): void
    {
        this.subscription.add(this.route.queryParams.subscribe(params => {
            const position = params.position;
            if (position != null) {
                this.bridge.setStartingPosition(position);
            }
            const contract = params.contract?.toString();
            const net = parseInt(`${params.network}`);
            if (contract != null && !isNaN(net)) {
                let metaverseContract = new MetaverseContract();
                metaverseContract.networkId = net;
                metaverseContract.address = contract;
                this.bridge.setStartingContract(metaverseContract)
            }
        }));
        const userSubscription = combineLatest([this.bridge.gameState$, this.bridge.session$])
            .pipe(filter(([s, u]: [State, Session]) => s == State.PLAYING),
                map(([s, u]) => u),
                distinctUntilChanged((a, b) =>
                    a.isGuest != b.isGuest || (!a.isGuest && a.walletId != b.walletId)
                ), take(1), switchMap(session => {
                    this.authService.updateSession({ walletId: session.walletId, isGuest: session.isGuest });
                    if (!this.authService.isGuestSession())
                        return this.authService.getAuthToken(true);
                    return of(null);
                })).subscribe((token) => {
                this.playerStateService.start(this.bridge.session$
                    .pipe(filter(s =>
                        s != null && s.network != null && s.contract != null
                    ), map(s => {
                        return {
                            network: s.network,
                            address: s.contract
                        }
                    }))
                );
                if (token != null)
                    this.runAutoStartPlugins();
            });
        this.subscription.add(userSubscription);

        this.subscription.add(this.playerStateService.messages$.subscribe(message => {
            this.bridge.reportOtherPlayersState(JSON.parse(message.data));
        }));
        this.startGame();
    }

    openPluginDialog(mode: 'menu' | 'running')
    {
        if (this.pluginDialogRef != null || this.authService.isGuestSession())
            return;

        this.authService.getAuthToken()
            .subscribe(token => {
                if (token != null) {
                    this.doOpenPluginDialog(mode);
                } else {
                    this.toaster.error('You should log in with metamask in order to use plugins');
                }
            });
    }

    private doOpenPluginDialog(mode: 'menu' | 'running')
    {
        this.bridge.freezeGame();
        this.pluginDialogRef = this.dialogService.open(PluginSelectionComponent, {
            data: {
                mode: mode,
            },
            viewContainerRef: this.vcr,
            width: '60em',
            height: '50em',
        });
        this.pluginDialogRef.beforeClosed().subscribe(result => {
            this.onPluginDialogClosed();
        }, error => {
            this.onPluginDialogClosed();
        });
    }

    onPluginDialogClosed()
    {
        this.bridge.unFreezeGame();
        setTimeout(() => this.gameCanvas.nativeElement.focus(), 300);
        this.pluginDialogRef = null;
    }

    closePluginDialog()
    {
        if (this.pluginDialogRef) {
            this.pluginDialogRef.close();
        }
    }

    public runPlugin(plugin: Plugin)
    {
        this.closePluginDialog();
        let pluginExecutionService = new PluginExecutionService(this.pluginService, this.utopiaApi, this.zone,
            this.dialogService, this.toaster);
        let runId = UUIdV4();
        this.runningPlugins.set(runId, pluginExecutionService);
        this.runningPluginsKeys.add(runId);
        this.subscription.add(
            pluginExecutionService.runPlugin(plugin, runId)
                .subscribe(() => {
                }, error => {
                    console.error(error);
                    this.onPluginRunEnded(runId);
                    this.toaster.error('Plugin execution failed: ' + (error ?? 'Unknown error'));
                }, () => {
                    this.onPluginRunEnded(runId);
                    this.toaster.success('Plugin executed successfully');
                })
        );
    }

    private startGame()
    {
        let buildUrl = '/assets/game/0.21-rc2/Build';
        let loaderUrl = buildUrl + '/web.loader.js';
        let config = {
            dataUrl: buildUrl + '/web.data',
            frameworkUrl: buildUrl + '/web.framework.js',
            codeUrl: buildUrl + '/web.wasm',
            streamingAssetsUrl: 'StreamingAssets',
            companyName: 'Utopia 42',
            productName: 'Utopia 42',
            productVersion: '0.21-rc2',
            showBanner: (m, t) => this.showBanner(m, t),
        };

        let canvas = document.querySelector('#unity-canvas') as any;

        this.script = document.createElement('script');
        this.script.src = loaderUrl;
        this.script.onload = () => {
            window.createUnityInstance(canvas, config, (progress: any) => {
                this.progress = progress * 100;
            }).then((unityInstance: any) => {
                this.bridge.unityInstance = unityInstance;
            }).catch((message: any) => {
                alert(message);
            });
        };
        document.body.appendChild(this.script);

        document.addEventListener('pointerlockchange', () => {
            this.bridge.cursorStateChanged(document.pointerLockElement == this.gameCanvas.nativeElement);
        }, false);

    }

    showBanner(msg, type)
    {
        if (type == 'error') {
            this.toaster.error(msg, '', {
                disableTimeOut: true
            });
        } else {
            this.toaster.info(msg);
        }
    }

    async requestClose()
    {
        this.runningPluginsKeys.forEach((pluginRunId) => {
            let pluginExecutionService = this.runningPlugins.get(pluginRunId);
            if (pluginExecutionService) {
                pluginExecutionService.terminateFrame();
                this.onPluginRunEnded(pluginRunId);
            }
        });
        if (this.bridge.unityInstance != null) {
            await this.bridge.unityInstance.Quit();
            this.closed = true;
            this.playerStateService.disconnect();
            location.reload();
        }
    }

    ngOnDestroy()
    {
        this.subscription.unsubscribe();
        this.bridge.game = null;
        if (this.script != null) {
            document.body.removeChild(this.script);
        }
        this.playerStateService.disconnect();
    }

    terminatePlugin(pluginRunId: string)
    {
        let pluginExecutionService = this.runningPlugins.get(pluginRunId);
        if (pluginExecutionService) {
            pluginExecutionService.openTerminateConfirmationDialog()
                .afterClosed().subscribe(result => {
                if (result) {
                    this.onPluginRunEnded(pluginRunId);
                }
            });
        }
    }

    private onPluginRunEnded(pluginRunId: string)
    {
        this.runningPlugins.delete(pluginRunId);
        this.runningPluginsKeys.delete(pluginRunId);
    }

    private runAutoStartPlugins()
    {
        if (this.authService.isGuestSession()) return;
        this.pluginService.getAllAutostartPluginsForUser(new SearchCriteria(null, 100))
            .subscribe(plugins => {
                for (let plugin of plugins) {
                    console.debug('Running autostart plugin: ' + plugin.name);
                    this.runPlugin(plugin);
                }
            }, error => {

            });
    }

    reportPlayerState(body: ReportPlayerStateRequestBodyType)
    {
        this.playerStateService.reportPlayerState(body);
    }
}
