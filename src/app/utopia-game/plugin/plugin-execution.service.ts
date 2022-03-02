import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtopiaApiService } from './utopia-api.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SimpleDialogAction, SimpleDialogComponent, SimpleDialogData } from '../../simple-dialog/simple-dialog.component';
import { PluginRunningOverlayComponent } from './plugin-running-overlay/plugin-running-overlay.component';
import { ToastrService } from 'ngx-toastr';
import { UtopiaDialogService } from 'src/app/utopia-dialog.service';
import { Plugin } from './Plugin';
import { LoadingService } from '../../loading/loading.service';
import { MatDialogRef, MatDialogState } from '@angular/material/dialog';

@Injectable()
export class PluginExecutionService {
    iframeSrc: string;
    pluginOverlayRef: OverlayRef;
    private secureEvalIframe: HTMLIFrameElement;
    private windowListener: (event: MessageEvent) => void;

    constructor(readonly http: HttpClient, readonly utopiaApi: UtopiaApiService,
                readonly zone: NgZone, readonly dialog: UtopiaDialogService, readonly overlay: Overlay,
                readonly toaster: ToastrService, readonly loadingService: LoadingService) {
        this.http.get('../../assets/sandbox.html', { responseType: 'text' })
            .subscribe(data => this.iframeSrc = data);
    }

    public getFile(url: string): Observable<string> {
        return this.http.get(url, { responseType: 'text' });
    }

    runCode(plugin: Plugin): Observable<PluginRunResult> {
        this.utopiaApi.setRunningPlugin(plugin);
        let code;
        let confirmationDialog;
        return this.getFile(plugin.scriptUrl)
            .pipe(
                tap(c => {
                    code = c;
                    let positionStrategy = this.overlay.position()
                        .global();
                    this.pluginOverlayRef = this.overlay.create({
                        positionStrategy,
                        hasBackdrop: true,
                    });
                    const portal = new ComponentPortal(PluginRunningOverlayComponent);
                    this.pluginOverlayRef.attach(portal);
                    this.pluginOverlayRef.backdropClick()
                        .subscribe(() => {
                            confirmationDialog = this.dialog.open(SimpleDialogComponent, {
                                data: new SimpleDialogData(
                                    'Plugin Execution',
                                    'Are you sure you want to cancel the plugin execution?',
                                    [
                                        new SimpleDialogAction('Cancel', () => {
                                            confirmationDialog.subscribe((dialogRef) => {
                                                dialogRef.close();
                                            });
                                        }, 'accent'),
                                        new SimpleDialogAction('Yes', () => {
                                            confirmationDialog.subscribe((dialogRef) => {
                                                dialogRef.close();
                                            });
                                            this.pluginOverlayRef.dispose();
                                            this.terminateFrame();
                                        }, 'primary')
                                    ]
                                )
                            });
                        });
                }),
                switchMap(o =>
                    this.doRunPlugin(code)
                ),
                catchError(err => {
                    if (this.pluginOverlayRef != null) {
                        this.pluginOverlayRef.dispose();
                        if (confirmationDialog != null) {
                            confirmationDialog.subscribe((dialogRef: MatDialogRef<any>) => {
                                if (dialogRef.getState() == MatDialogState.OPEN) {
                                    dialogRef.close();
                                }
                            });
                        }
                    }
                    throw err;
                }),
                tap({
                    complete: () => {
                        if (this.pluginOverlayRef != null) {
                            this.pluginOverlayRef.dispose();
                            if (confirmationDialog != null) {
                                confirmationDialog.subscribe((dialogRef: MatDialogRef<any>) => {
                                    if (dialogRef.getState() == MatDialogState.OPEN) {
                                        dialogRef.close();
                                    }
                                });
                            }
                        }
                    }
                })
            );
    }

    private doRunPlugin(code: string): Observable<PluginRunResult> {
        return new Observable<PluginRunResult>(subs => {
            this.secureEvalIframe = document.createElement('iframe');
            this.secureEvalIframe.setAttribute('sandbox', 'allow-scripts');
            this.secureEvalIframe.setAttribute('style', 'display: none;');

            this.secureEvalIframe.setAttribute('src', 'data:text/html;base64,' + btoa(this.iframeSrc));

            document.body.appendChild(this.secureEvalIframe);

            this.secureEvalIframe.addEventListener('load', () => {
                this.secureEvalIframe.contentWindow.postMessage({
                    type: 'request',
                    body: {
                        code: code
                    }
                }, '*');
            });

            let that = this;
            this.windowListener = function windowListener(event: MessageEvent) {
                if ((event.origin === 'null' && event.source === that.secureEvalIframe.contentWindow)) {
                    let message = event.data;
                    switch (message.type) {
                        case 'request': {
                            let res = that.zone.run(() => that.utopiaApi[message.body.method].apply(that.utopiaApi, message.body.params));
                            if (res instanceof Observable) {
                                res.subscribe(value => {
                                    that.secureEvalIframe.contentWindow.postMessage({
                                        id: message.id,
                                        type: 'response',
                                        body: value
                                    }, '*');
                                }, error => {
                                    that.secureEvalIframe.contentWindow.postMessage({
                                        id: message.id,
                                        type: 'responseError',
                                        body: error
                                    }, '*');
                                });
                            }
                            break;
                        }
                        case 'end': {
                            that.clearPluginFrame();
                            subs.complete();
                            break;
                        }
                        case 'error': {
                            that.clearPluginFrame();
                            subs.error(message.body);
                            break;
                        }
                        default: {
                            that.clearPluginFrame();
                            subs.error(new Error('Unknown message type from plugin: ' + message.type));
                        }
                    }
                }
            };

            window.addEventListener('message', this.windowListener);
        });
    }

    clearPluginFrame() {
        if (this.secureEvalIframe != null) {
            window.removeEventListener('message', this.windowListener);
            document.body.removeChild(this.secureEvalIframe);
            this.secureEvalIframe = null;
            this.windowListener = null;
        }
    }

    terminateFrame() {
        this.secureEvalIframe.contentWindow.postMessage({
            type: 'end',
        }, '*');
        this.clearPluginFrame(); // Do we need to wait a little to do this?
    }
}

export interface PluginRunResult {
    type: string;
    body?: string;
    error?: string;

    [key: string]: any;
}

export class PluginParameter {
    name: string;
    label?: string;
    hint: string;
    required: boolean;
    type: 'text' | 'number' | 'selection' | 'position' | 'land' | 'blockType';
    options?: { key: string, value: any }[];
    defaultValue?: any;
}
