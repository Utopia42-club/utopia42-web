import { Injectable } from '@angular/core';
import { Configurations } from '../configurations';
import { Subject } from 'rxjs';
import { AuthService } from "../auth/auth.service";

@Injectable({
    providedIn: 'root',
})
export class PlayerStateService
{
    readonly endpoint = Configurations.WS_SERVER_URL + '/position';

    ws: WebSocket;
    public messages = new Subject<any>();
    private requestClose = false;
    private state: ConnectionState = ConnectionState.DISCONNECTED;

    constructor(readonly authService: AuthService)
    {
    }

    connect()
    {
        if (this.ws != null) {
            this.ws.close();
            return;
        }
        this.state = ConnectionState.CONNECTING;
        if (!this.authService.isGuestSession())
            this.authService.getAuthToken().subscribe(token => {
                if (token != null) {
                    console.log('Connecting to ' + this.endpoint);
                    this.doConnect(token);
                }
            });
        else this.doConnect(null);
    }

    private doConnect(token: string)
    {
        console.log("Connecting socket...");

        var ws = this.ws = new WebSocket(this.endpoint);
        this.ws.onopen = e => {
            if (this.ws != ws) return;

            console.log('Connected to ' + this.endpoint);
            this.state = ConnectionState.CONNECTED;
            if (!this.authService.isGuestSession()) {
                console.log("Authenticating on socket...")
                this.ws.send('@authToken:' + token);
            }
        }
        this.ws.onmessage = event => {
            if (this.ws != ws) return;

            let msg = event.data as string;
            if (msg.startsWith('@error')) {
                if (msg.startsWith('@error:Unauthorized')) {
                    this.disconnect();
                    this.authService.removeCachedAuthToken();
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
            if (this.ws != ws) return;
            console.log("Socket was closed...");

            this.ws = null;
            if (this.state != ConnectionState.CONNECTING) {
                this.state = ConnectionState.DISCONNECTED;
                if (!this.requestClose) {
                    this.doConnect(token);
                }
            }
        };
        this.ws.onerror = event => {
            if (this.ws != ws) return;

            this.ws.close();
            this.ws = null;
            console.error(event);
        };
    }

    disconnect()
    {
        if (this.ws != null) {
            this.requestClose = true;
            this.ws.close();
            this.requestClose = false;
            this.ws = null;
        }
    }

    public reportPlayerState(playerState: any)
    {
        if (!this.authService.isGuestSession() && this.state == ConnectionState.CONNECTED)
            this.ws.send(playerState);
    }
}

export enum ConnectionState
{
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED"
}
