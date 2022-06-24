import {
    ChangeDetectorRef,
    Component,
    InjectionToken,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {AppComponent} from '../app.component';
import {ReportPlayerStateRequestBodyType, State, UtopiaBridgeService} from './utopia-bridge.service';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {UtopiaApiService} from './plugin/utopia-api.service';
import {PluginExecutionService} from './plugin/plugin-execution.service';
import {LoadingService} from '../loading/loading.service';
import {Subscription} from 'rxjs';
import {Web3Service} from '../ehtereum/web3.service';
import {Plugin} from './plugin/Plugin';
import {PluginService} from './plugin/plugin.service';
import {Overlay} from '@angular/cdk/overlay';
import {v4 as UUIdV4} from 'uuid';
import {PluginSelectionComponent} from './plugin/plugin-selection/plugin-selection.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SearchCriteria} from './plugin/SearchCriteria';
import {PlayerStateService} from './player-state.service';
import {AuthService} from '../auth.service';

export const GAME_TOKEN = new InjectionToken<UtopiaGameComponent>('GAME_TOKEN');

@Component({
    selector: 'app-utopia-game',
    templateUrl: './utopia-game.component.html',
    styleUrls: ['./utopia-game.component.scss'],
    providers: [UtopiaBridgeService, UtopiaApiService]
})
export class UtopiaGameComponent implements OnInit, OnDestroy {
    progress = 0;

    @ViewChild('gameCanvas', {static: true}) gameCanvas;

    runningPlugins = new Map<string, PluginExecutionService>();
    runningPluginsKeys = new Set<string>();

    private readonly subscription = new Subscription();
    private pluginDialogRef: MatDialogRef<PluginSelectionComponent>;
    private script: HTMLScriptElement;


    constructor(private bridge: UtopiaBridgeService, private appComponent: AppComponent,
                private readonly toaster: ToastrService, private readonly route: ActivatedRoute,
                readonly utopiaApi: UtopiaApiService, readonly zone: NgZone,
                readonly loadingService: LoadingService, readonly web3Service: Web3Service,
                readonly pluginService: PluginService, readonly dialogService: MatDialog, readonly overlay: Overlay,
                readonly vcr: ViewContainerRef, readonly cdr: ChangeDetectorRef,
                readonly playerStateService: PlayerStateService) {
        window.bridge = bridge;

        bridge.game = this;
    }

    ngOnInit(): void {
        this.subscription.add(this.appComponent.getContractSafe(null, null).subscribe(() => this.startGame()));
        this.subscription.add(this.route.queryParams.subscribe(params => {
            const position = params.position;
            if (position != null) {
                this.bridge.setStartingPosition(position);
            }
        }));
        let playSubscription = this.bridge.gameState$().subscribe(state => {
            if (state == State.PLAYING) {
                this.runAutoStartPlugins();
                playSubscription.unsubscribe();
            }
        });
        this.subscription.add(playSubscription);

        this.playerStateService.connect();

        this.subscription.add(this.playerStateService.messages.subscribe(message => {
            this.bridge.reportOtherPlayersState(JSON.parse(message.data));
        }));
    }

    openPluginDialog(mode: 'menu' | 'running') {
        if (this.pluginDialogRef != null) {
            return;
        }

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

    onPluginDialogClosed() {
        this.bridge.unFreezeGame();
        setTimeout(() => this.gameCanvas.nativeElement.focus(), 300);
        this.pluginDialogRef = null;
    }

    closePluginDialog() {
        if (this.pluginDialogRef) {
            this.pluginDialogRef.close();
        }
    }

    public runPlugin(plugin: Plugin) {
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

    private startGame() {
        let buildUrl = '/assets/game/0.20-rc21/Build';
        let loaderUrl = buildUrl + '/web.loader.js';
        let config = {
            dataUrl: buildUrl + '/web.data',
            frameworkUrl: buildUrl + '/web.framework.js',
            codeUrl: buildUrl + '/web.wasm',
            streamingAssetsUrl: 'StreamingAssets',
            companyName: 'Utopia 42',
            productName: 'Utopia 42',
            productVersion: '0.20-rc21',
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

    showBanner(msg, type) {
        if (type == 'error') {
            this.toaster.error(msg, '', {
                disableTimeOut: true
            });
        } else {
            this.toaster.info(msg);
        }
    }

    async requestClose() {
        this.runningPluginsKeys.forEach((pluginRunId) => {
            let pluginExecutionService = this.runningPlugins.get(pluginRunId);
            if (pluginExecutionService) {
                pluginExecutionService.terminateFrame();
                this.onPluginRunEnded(pluginRunId);
            }
        });
        if (this.bridge.unityInstance != null) {
            await this.bridge.unityInstance.Quit();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.bridge.game = null;
        if (this.script != null) {
            document.body.removeChild(this.script);
        }
        this.playerStateService.disconnect();
    }

    terminatePlugin(pluginRunId: string) {
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

    private onPluginRunEnded(pluginRunId: string) {
        this.runningPlugins.delete(pluginRunId);
        this.runningPluginsKeys.delete(pluginRunId);
    }

    private runAutoStartPlugins() {
        this.pluginService.getAllAutostartPluginsForUser(new SearchCriteria(null, 100)).subscribe(plugins => {
            for (let plugin of plugins) {
                console.debug('Running autostart plugin: ' + plugin.name);
                this.runPlugin(plugin);
            }
        });
    }

    reportPlayerState(body: ReportPlayerStateRequestBodyType) {
        this.playerStateService.reportPlayerState(body);
    }
}
