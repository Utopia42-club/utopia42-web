import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Action, AppComponent } from '../app.component';
import { State, UtopiaBridgeService } from './utopia-bridge.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { PluginDialogComponent } from './plugin/plugin-dialog/plugin-dialog.component';
import { UtopiaApiService } from './plugin/utopia-api.service';
import { PluginService } from './plugin/plugin.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingService } from '../loading.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-utopia-game',
    templateUrl: './utopia-game.component.html',
    styleUrls: ['./utopia-game.component.scss'],
    providers: [UtopiaBridgeService, UtopiaApiService, PluginService]
})
export class UtopiaGameComponent implements OnInit, OnDestroy {
    fullScreenAction: Action = {
        icon: 'fullscreen', perform: () => {
        }
    };
    progress = 0;

    @ViewChild('gameCanvas', { static: true }) gameCanvas;

    pluginAction: Action;
    private sandBoxListener: (e) => void;

    private subscription = new Subscription();

    constructor(private bridge: UtopiaBridgeService, private appComponent: AppComponent,
                private readonly toaster: ToastrService, private readonly route: ActivatedRoute,
                readonly utopiaApi: UtopiaApiService, readonly zone: NgZone,
                readonly dialog: MatDialog, readonly pluginService: PluginService,
                readonly loadingService: LoadingService) {
        window.bridge = bridge;

        this.pluginAction = {
            icon: 'extension',
            perform: () => {
                this.freezeGame();
                let dialog = this.dialog.open(PluginDialogComponent);
                dialog.afterClosed().subscribe(result => {
                    this.unFreezeGame();
                    this.gameCanvas.nativeElement.focus();
                    if (result != null) {
                        this.loadingService.prepare(this.pluginService.runCode(result.code, result.inputs))
                            .subscribe(() => {
                            }, error => {
                                this.toaster.error('Plugin execution failed');
                            }, () => {
                                this.toaster.success('Plugin executed successfully');
                            });
                    }
                });
            }
        };

        this.subscription.add(this.bridge.gameState$().subscribe(value => {
            if (value == State.PLAYING) {
                this.addPluginAction();
            } else {
                this.removePluginAction();
            }
        }));
    }


    private addPluginAction() {
        let idx = this.appComponent.actions.indexOf(this.pluginAction);
        if (idx < 0) {
            this.appComponent.actions.push(this.pluginAction);
        }
    }

    private removePluginAction() {
        let ind = this.appComponent.actions.indexOf(this.pluginAction);
        if (ind >= 0) {
            this.appComponent.actions.splice(ind, 1);
        }
    }

    private addFullScreenAction() {
        let idx = this.appComponent.actions.indexOf(this.fullScreenAction);
        if (idx < 0) {
            this.appComponent.actions.push(this.fullScreenAction);
        }
    }

    private removeFullScreenAction() {
        let idx = this.appComponent.actions.indexOf(this.fullScreenAction);
        if (idx >= 0) {
            this.appComponent.actions.splice(idx, 1);
        }
    }

    ngOnInit(): void {
        this.appComponent.getContractSafe(null, null).subscribe(() => this.startGame());
        this.route.queryParams.subscribe(params => {
            const position = params.position;
            if (position != null) {
                this.bridge.setStartingPosition(position);
            }
        });
    }

    ngOnDestroy(): void {
        this.removeFullScreenAction();
        this.removePluginAction();
        window.removeEventListener('message', this.sandBoxListener);
        this.subscription.unsubscribe();
    }

    public freezeGame() {
        this.bridge.unityInstance.SendMessage('GameManager', 'FreezeGame', '');
    }

    public unFreezeGame() {
        this.bridge.unityInstance.SendMessage('GameManager', 'UnFreezeGame', '');
    }

    private startGame() {
        var buildUrl = '/assets/game/v0.9-rc3/Build';
        var config = {
            dataUrl: buildUrl + '/web.data',
            frameworkUrl: buildUrl + '/web.framework.js',
            codeUrl: buildUrl + '/web.wasm',
            streamingAssetsUrl: 'StreamingAssets',
            companyName: 'Utopia 42',
            productName: 'Utopia 42',
            productVersion: '0.9-rc3',
            showBanner: (m, t) => this.showBanner(m, t),
        };

        let canvas = document.querySelector('#unity-canvas') as any;
        // if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        //     container.className = "unity-mobile";
        //     // Avoid draining fillrate performance on mobile devices,
        //     // and default/override low DPI mode on mobile browsers.
        //     config.devicePixelRatio = 1;
        //     mobileWarning.style.display = "block";
        //     setTimeout(() => {
        //         mobileWarning.style.display = "none";
        //     }, 5000);
        // } else {
        // canvas.style.width = "960px";
        // canvas.style.height = "600px";
        // }
        // loadingBar.style.display = "block";

        window.createUnityInstance(canvas, config, (progress: any) => {
            this.progress = progress * 100;
        }).then((unityInstance: any) => {
            // loadingBar.style.display = "none";
            this.bridge.unityInstance = unityInstance;
            this.utopiaApi.unityInstance = unityInstance;
            this.fullScreenAction.perform = () => unityInstance.SetFullscreen(1);
            this.addFullScreenAction();
        }).catch((message: any) => {
            alert(message);
        });
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
}
