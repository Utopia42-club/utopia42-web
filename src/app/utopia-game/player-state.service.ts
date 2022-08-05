import { Injectable, OnDestroy } from '@angular/core';
import { Configurations } from '../configurations';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthService } from "../auth/auth.service";
import { distinctUntilChanged, filter } from "rxjs/operators";

@Injectable()
export class PlayerStateService implements OnDestroy
{
    private static readonly CONTRACT_CHANGED_REASON = "CONTRACT_CHANGED_REASON";
    private contractSubscription: Subscription;
    readonly endpoint = Configurations.WS_SERVER_URL + '/position';

    ws: WebSocket;
    private readonly messages = new Subject<any>();
    readonly messages$ = this.messages.asObservable();
    private requestClose = false;
    private state: ConnectionState = ConnectionState.DISCONNECTED;

    constructor(readonly authService: AuthService)
    {
    }

    start(contract$: Observable<{ network: number, address: string }>)
    {
        if (this.contractSubscription != null)
            throw new Error("Service already started!");
        this.contractSubscription = contract$
            .pipe(filter(v => v != null),
                distinctUntilChanged(
                    (c1, c2) => c1.network != c2.network || c1.address?.toLowerCase() != c2.address.toLowerCase()
                )
            ).subscribe(contract => {
                if (this.ws != null) {
                    const ws = this.ws;
                    this.ws = null;
                    ws.close(undefined, PlayerStateService.CONTRACT_CHANGED_REASON);
                }
                this.connect(contract.network, contract.address);
            });
    }

    connect(network: number, contract: string)
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
                    this.doConnect(token, network, contract);
                }
            });
        else this.doConnect(null, network, contract);
    }

    private doConnect(token: string, network: number, contract: string)
    {
        console.log("Connecting socket...");

        var ws = this.ws = new WebSocket(`${this.endpoint}/${network}/${contract.toLowerCase()}`);
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
                    this.connect(network, contract);
                } else {
                    throw new Error(msg.slice(7, msg.length));
                }
            } else {
                let message = JSON.parse(msg as any);
                this.messages.next(message);
            }
        };
        this.ws.onclose = event => {
            if (event.reason == PlayerStateService.CONTRACT_CHANGED_REASON)
                return;
            if (this.ws != ws) return;
            console.log("Socket was closed...");

            this.ws = null;
            if (this.state != ConnectionState.CONNECTING) {
                this.state = ConnectionState.DISCONNECTED;
                if (!this.requestClose) {
                    this.doConnect(token, network, contract);
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
        if (!this.authService.isGuestSession() && this.state == ConnectionState.CONNECTED) {
            this.ws.send(playerState);
        }
    }

    ngOnDestroy()
    {
        this.contractSubscription?.unsubscribe();
    }
}

export enum ConnectionState
{
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED"
}
