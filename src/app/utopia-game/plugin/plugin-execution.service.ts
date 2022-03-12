import { NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UtopiaApiService } from './utopia-api.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { SimpleDialogAction, SimpleDialogComponent, SimpleDialogData } from '../../simple-dialog/simple-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Plugin } from './Plugin';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PluginService } from './plugin.service';

export class PluginExecutionService {
    private secureEvalIframe: HTMLIFrameElement;
    private windowListener: (event: MessageEvent) => void;

    private runningPlugin: Plugin;
    private runId: string;

    resultMap = new Map<string, Subscription>();

    private terminateConfirmationDialog: MatDialogRef<SimpleDialogComponent>;

    constructor(readonly pluginService: PluginService, readonly utopiaApi: UtopiaApiService,
                readonly zone: NgZone, readonly dialog: MatDialog, readonly toaster: ToastrService) {
    }

    runPlugin(plugin: Plugin, runId: string): Observable<PluginRunResult> {
        this.runId = runId;
        this.runningPlugin = plugin;
        return this.pluginService.getFile(plugin.scriptUrl)
            .pipe(
                switchMap(code =>
                    this.doRunPlugin(code)
                ),
                catchError(err => {
                    this.closeTerminateDialog(true);
                    throw err;
                }),
                tap({
                    complete: () => {
                        this.closeTerminateDialog(true);
                    }
                })
            );
    }

    private closeTerminateDialog(terminated: boolean) {
        if (this.terminateConfirmationDialog) {
            this.terminateConfirmationDialog.close(terminated);
            this.terminateConfirmationDialog = null;
        }
    }

    public openTerminateConfirmationDialog() {
        this.terminateConfirmationDialog = this.dialog.open(SimpleDialogComponent, {
            data: new SimpleDialogData(
                'Plugin Execution',
                'Are you sure you want to cancel the plugin execution?',
                [
                    new SimpleDialogAction('Cancel', () => {
                        this.closeTerminateDialog(false);
                    }, 'accent'),
                    new SimpleDialogAction('Yes', () => {
                        this.terminateFrame();
                        this.closeTerminateDialog(true);
                    }, 'primary')
                ]
            )
        });
        return this.terminateConfirmationDialog;
    }

    private doRunPlugin(code: string): Observable<PluginRunResult> {
        return this.pluginService.getFile('../../assets/sandbox.html')
            .pipe(
                switchMap(iframeSrc => {
                    return new Observable<PluginRunResult>(subs => {
                        this.secureEvalIframe = document.createElement('iframe');
                        this.secureEvalIframe.setAttribute('sandbox', 'allow-scripts');
                        this.secureEvalIframe.setAttribute('style', 'display: none;');

                        this.secureEvalIframe.setAttribute('src', 'data:text/html;base64,' + btoa(iframeSrc));
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
                                        if (message.body.method == 'getInputsFromUser') {
                                            message.body.params.push(that.runningPlugin);
                                        }
                                        let res = that.zone.run(() => that.utopiaApi[message.body.method].apply(that.utopiaApi, message.body.params));
                                        if (res instanceof Observable) {
                                            that.resultMap.set(message.id, res.subscribe(value => {
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
                                            }, () => {
                                                that.secureEvalIframe.contentWindow.postMessage({
                                                    id: message.id,
                                                    type: 'complete'
                                                }, '*');
                                            }));
                                        }
                                        break;
                                    }
                                    case 'cancel': {
                                        if (that.resultMap.has(message.id)) {
                                            that.resultMap.get(message.id).unsubscribe();
                                            that.resultMap.delete(message.id);
                                        } else {
                                            subs.error(new Error('Invalid message from plugin: ' + message.id));
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
                })
            );
    }

    private clearPluginFrame() {
        if (this.secureEvalIframe != null) {
            window.removeEventListener('message', this.windowListener);
            document.body.removeChild(this.secureEvalIframe);
            this.secureEvalIframe = null;
            this.windowListener = null;
            this.resultMap.forEach(sub => sub.unsubscribe());
        }
    }

    private terminateFrame() {
        this.secureEvalIframe.contentWindow.postMessage({
            type: 'end',
        }, '*');
        this.clearPluginFrame(); // Do we need to wait a little to do this?
    }

    getRunningPlugin() {
        return this.runningPlugin;
    }
}

export interface PluginRunResult {
    type: string;
    body?: string;
    error?: string;

    [key: string]: any;
}

