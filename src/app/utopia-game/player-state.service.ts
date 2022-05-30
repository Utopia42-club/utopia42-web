import { Injectable } from '@angular/core';
import { Configurations } from '../configurations';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerStateService {
    readonly endpoint = Configurations.WS_SERVER_URL + '/position';

    ws: WebSocket;
    public messages = new Subject();
    private requestClose = false;

    constructor(readonly authService: AuthService) {
        authService.getAuthToken().subscribe(token => {
            this.connect(token);
        });
    }

    connect(token: string) {
        console.log('Connecting to ' + this.endpoint);
        this.ws = new WebSocket(this.endpoint);
        this.ws.onopen = e => this.ws.send(token);
        this.ws.onmessage = event => {
            this.messages.next(event.data);
        };
        this.ws.onclose = event => {
            console.error(event);
            if (!this.requestClose) {
                this.connect(token);
            }
        };
        this.ws.onerror = event => {
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
        this.ws.send(playerState);
    }

}
