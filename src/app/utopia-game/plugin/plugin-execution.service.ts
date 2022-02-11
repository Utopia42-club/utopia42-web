import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UtopiaApiService } from './utopia-api.service';
import { MatDialog } from '@angular/material/dialog';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SimpleDialogAction, SimpleDialogComponent, SimpleDialogData } from '../../simple-dialog/simple-dialog.component';
import { PluginRunningOverlayComponent } from './plugin-running-overlay/plugin-running-overlay.component';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class PluginExecutionService {
    iframeSrc: string;
    pluginOverlayRef: OverlayRef;
    private secureEvalIframe: HTMLIFrameElement;
    private windowListener: (event: MessageEvent) => void;

    constructor(readonly http: HttpClient, readonly utopiaApi: UtopiaApiService,
                readonly zone: NgZone, readonly dialog: MatDialog, readonly overlay: Overlay,
                readonly toaster: ToastrService) {
        this.http.get('../../assets/sandbox.html', { responseType: 'text' })
            .subscribe(data => this.iframeSrc = data);
    }

    public getFile(url: string): Observable<string> {
        return this.http.get(url, { responseType: 'text' });
    }

    runCode(code: string, inputs: any): Observable<PluginRunResult> {
        return of(1)
            .pipe(
                tap(v => {
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
                            let confirmationDialog = this.dialog.open(SimpleDialogComponent, {
                                data: new SimpleDialogData(
                                    'Plugin Execution',
                                    'Are you sure you want to cancel the plugin execution?',
                                    [
                                        new SimpleDialogAction('Cancel', () => {
                                            confirmationDialog.close();
                                        }, 'accent'),
                                        new SimpleDialogAction('Yes', () => {
                                            confirmationDialog.close();
                                            this.pluginOverlayRef.dispose();
                                            this.terminateFrame();
                                        }, 'primary')
                                    ]
                                )
                            });
                        });
                }),
                switchMap(o =>
                    this.doRunPlugin(code, inputs)
                ),
                catchError(err => {
                    if (this.pluginOverlayRef != null) {
                        this.pluginOverlayRef.dispose();
                    }
                    throw err;
                }),
                tap({
                    complete: () => {
                        if (this.pluginOverlayRef != null) {
                            this.pluginOverlayRef.dispose();
                        }
                    }
                })
            );
    }

    private doRunPlugin(code: string, inputs: any): Observable<PluginRunResult> {
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
                        code: code,
                        inputs: inputs
                    }
                }, '*');
            });

            let that = this;
            this.windowListener = function windowListener(event: MessageEvent) {
                if ((event.origin === 'null' && event.source === that.secureEvalIframe.contentWindow)) {
                    let message = event.data;
                    switch (message.type) {
                        case 'request': {
                            that.zone.run(() => that.utopiaApi[message.body.method].apply(that.utopiaApi, message.body.params));
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
