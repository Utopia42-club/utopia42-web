import { NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UtopiaApiService } from './utopia-api.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
    SimpleDialogAction,
    SimpleDialogComponent,
    SimpleDialogData
} from '../../simple-dialog/simple-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Plugin } from './Plugin';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PluginService } from './plugin.service';

export class PluginExecutionService
{
    private secureEvalIframe: HTMLIFrameElement;
    private windowListener: (event: MessageEvent) => void;

    private runningPlugin: Plugin;
    private runId: string;

    readonly resultMap = new Map<string, Subscription>();

    private terminateConfirmationDialog: MatDialogRef<SimpleDialogComponent>;

    constructor(readonly pluginService: PluginService, readonly utopiaApi: UtopiaApiService,
                readonly zone: NgZone, readonly dialog: MatDialog, readonly toaster: ToastrService)
    {
    }

    runPlugin(plugin: Plugin, runId: string): Observable<PluginRunResult>
    {
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

    private closeTerminateDialog(terminated: boolean)
    {
        if (this.terminateConfirmationDialog) {
            this.terminateConfirmationDialog.close(terminated);
            this.terminateConfirmationDialog = null;
        }
    }

    public openTerminateConfirmationDialog()
    {
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

    private doRunPlugin(code: string): Observable<PluginRunResult>
    {
        return this.pluginService.getFile('assets/sandbox-0.1.html')
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

                        let executionService = this;
                        this.windowListener = function windowListener(event: MessageEvent) {
                            if ((event.origin === 'null' && event.source === executionService.secureEvalIframe.contentWindow)) {
                                let message = event.data;
                                switch (message.type) {
                                    case 'request': {
                                        if (message.body.method == 'getInputsFromUser') {
                                            message.body.params.push(executionService.runningPlugin);
                                        }
                                        let res = executionService.zone.run(() => executionService.utopiaApi[message.body.method].apply(executionService.utopiaApi, message.body.params));
                                        if (res instanceof Observable) {
                                            executionService.resultMap.set(message.id, res.subscribe(value => {
                                                executionService.secureEvalIframe.contentWindow.postMessage({
                                                    id: message.id,
                                                    type: 'response',
                                                    body: value
                                                }, '*');
                                            }, error => {
                                                executionService.resultMap.delete(message.id);
                                                executionService.secureEvalIframe.contentWindow.postMessage({
                                                    id: message.id,
                                                    type: 'responseError',
                                                    body: error
                                                }, '*');
                                            }, () => {
                                                executionService.resultMap.delete(message.id);
                                                executionService.secureEvalIframe.contentWindow.postMessage({
                                                    id: message.id,
                                                    type: 'complete'
                                                }, '*');
                                            }));
                                        }
                                        break;
                                    }
                                    case 'cancel': {
                                        if (executionService.resultMap.has(message.id)) {
                                            executionService.resultMap.get(message.id).unsubscribe();
                                            executionService.resultMap.delete(message.id);
                                        }
                                        // else {
                                        //     subs.error(new Error('Invalid message from plugin: ' + message.id));
                                        // }
                                        break;
                                    }
                                    case 'end': {
                                        executionService.clearPluginFrame();
                                        subs.complete();
                                        break;
                                    }
                                    case 'error': {
                                        executionService.clearPluginFrame();
                                        subs.error(message.body);
                                        break;
                                    }
                                    default: {
                                        executionService.clearPluginFrame();
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

    private clearPluginFrame()
    {
        if (this.secureEvalIframe != null) {
            window.removeEventListener('message', this.windowListener);
            document.body.removeChild(this.secureEvalIframe);
            this.secureEvalIframe = null;
            this.windowListener = null;
            this.resultMap.forEach(sub => sub.unsubscribe());
        }
    }

    public terminateFrame()
    {
        this.secureEvalIframe.contentWindow.postMessage({
            type: 'end',
        }, '*');
        this.clearPluginFrame(); // Do we need to wait a little to do this?
    }

    getRunningPlugin()
    {
        return this.runningPlugin;
    }
}

export interface PluginRunResult
{
    type: string;
    body?: string;
    error?: string;

    [key: string]: any;
}

