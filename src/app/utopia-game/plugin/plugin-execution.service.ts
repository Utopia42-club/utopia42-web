import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtopiaApiService } from './utopia-api.service';

@Injectable({
    providedIn: 'root'
})
export class PluginExecutionService {
    iframeSrc: string;

    constructor(readonly http: HttpClient, readonly utopiaApi: UtopiaApiService,
                readonly zone: NgZone) {
        this.http.get('../../assets/sandbox.html', { responseType: 'text' })
            .subscribe(data => this.iframeSrc = data);
    }

    public getFile(url: string): Observable<string> {
        return this.http.get(url, { responseType: 'text' });
    }

    runCode(code: string, inputs: any): Observable<PluginRunResult> {
        return new Observable(subs => {
            const secureEvalIframe: HTMLIFrameElement = document.createElement('iframe');
            secureEvalIframe.setAttribute('sandbox', 'allow-scripts');
            secureEvalIframe.setAttribute('style', 'display: none;');

            secureEvalIframe.setAttribute('src', 'data:text/html;base64,' + btoa(this.iframeSrc));

            secureEvalIframe.addEventListener('load', () => {
                secureEvalIframe.contentWindow.postMessage({
                    code: code,
                    inputs: inputs
                }, '*');
            });

            window.addEventListener('message', windowListener);

            document.body.appendChild(secureEvalIframe);

            let that = this;

            function windowListener(event: MessageEvent) {
                if ((event.origin === 'null' && event.source === secureEvalIframe.contentWindow)) {
                    let message = event.data;
                    switch (message.type) {
                        case 'request': {
                            that.zone.run(() => that.utopiaApi[message.body.method].apply(that.utopiaApi, message.body.params));
                            break;
                        }
                        case 'end': {
                            window.removeEventListener('message', windowListener);
                            document.body.removeChild(secureEvalIframe);
                            subs.complete();
                            break;
                        }
                        default: {
                            subs.error(new Error('Unknown message type from plugin: ' + message.type));
                        }
                    }
                }
            }
        });
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
    type: 'text' | 'number' | 'selection';
    options?: { key: string, value: any }[];
    defaultValue?: any;
}
