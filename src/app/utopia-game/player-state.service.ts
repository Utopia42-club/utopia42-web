import {Injectable} from '@angular/core';
import {Configurations} from '../configurations';
import {Subject} from 'rxjs';
import {AuthService} from "../auth.service";

@Injectable({
    providedIn: 'root',
})
export class PlayerStateService {
    readonly endpoint = Configurations.WS_SERVER_URL + '/position';

    ws: WebSocket;
    public messages = new Subject<any>();
    private requestClose = false;
    private state: ConnectionState = ConnectionState.DISCONNECTED;

    constructor(readonly authService: AuthService) {
    }

    connect() {
        console.log('Connecting to ' + this.endpoint);
        this.state = ConnectionState.CONNECTING;
        this.authService.getAuthToken(true).subscribe(token => {
            this.doConnect(token);
        });
    }

    private doConnect(token: string) {
        this.ws = new WebSocket(this.endpoint);
        this.ws.onopen = e => {
            this.state = ConnectionState.CONNECTED;
            this.ws.send('@authToken:' + token);
        }
        this.ws.onmessage = event => {
            let msg = event.data as string;
            if (msg.startsWith('@error')) {
                if (msg.startsWith('@error:Unauthorized')) {
                    this.disconnect();
                    this.authService.RemoveCachedAuthToken();
                    this.connect();
                } else {
                    throw new Error(msg.slice(7, msg.length));
                }
            } else {
                let message = JSON.parse(msg as any);
                this.messages.next(message);
            }
        };
        this.ws.onclose = event => {
            this.ws = null;
            if (this.state != ConnectionState.CONNECTING) {
                this.state = ConnectionState.DISCONNECTED;
                if (!this.requestClose) {
                    this.doConnect(token);
                }
            }
        };
        this.ws.onerror = event => {
            this.ws = null;
            console.error(event);
        };
    }

    disconnect() {
        if (this.ws != null) {
            this.requestClose = true;
            this.ws.close();
            this.requestClose = false;
            this.ws = null;
        }
    }

    public reportPlayerState(playerState: any) {
        if (this.state == ConnectionState.CONNECTED)
            this.ws.send(playerState);
    }
}

export enum ConnectionState {
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED"
}
