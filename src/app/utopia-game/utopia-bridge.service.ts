import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { ConnectionDetail } from '../ehtereum/connection-detail';
import { Land } from '../ehtereum/models';
import { Web3Service } from '../ehtereum/web3.service';
import { BridgeMessage, Response, WebToUnityRequest } from './bridge-message';
import { Clipboard } from '@angular/cdk/clipboard';
import * as uuid from 'uuid';
import { Position } from './position';
import { UtopiaGameComponent } from './utopia-game.component';
import { AuthService } from "../auth/auth.service";
import { MetaverseContract } from "../multiverse/metaverse-contract";
import { Configurations } from "../configurations";

@Injectable()
export class UtopiaBridgeService implements OnDestroy
{
    public unityInstance;
    public game: UtopiaGameComponent;
    private position?: Position;
    private startingContract: MetaverseContract;
    private readonly gameState = new BehaviorSubject<State>(null);
    public readonly gameState$ = this.gameState.asObservable();
    private readonly session = new BehaviorSubject<Session>(null);
    public readonly session$ = this.session.asObservable();

    private readonly pasteListener = (e: ClipboardEvent) => this.writeToClipboard(e);
    private readonly cutCopyListener = (e: ClipboardEvent) => this.readClipboard(e);

    private responseObservable = new Map<string, Subject<any>>(); // key: CallId, value: Observable

    constructor(private web3Service: Web3Service, private app: AppComponent, private clipboard: Clipboard,
                readonly zone: NgZone, readonly authService: AuthService)
    {
        document.addEventListener("paste", this.pasteListener);
        document.addEventListener("copy", this.cutCopyListener);
        document.addEventListener("cut", this.cutCopyListener);
    }

    ngOnDestroy(): void
    {
        document.removeEventListener("paste", this.pasteListener);
        document.removeEventListener("copy", this.cutCopyListener);
        document.removeEventListener("cut", this.cutCopyListener);
    }

    private writeToClipboard(e: ClipboardEvent)
    {
        if ((e.target as HTMLElement).tagName != "BODY")
            return;
        this.unityInstance?.SendMessage('WebBridge', 'UpdateClipboard', e.clipboardData.getData("text"));
    }

    private readClipboard(e: ClipboardEvent)
    {
        if ((e.target as HTMLElement).tagName != "BODY")
            return;
        setTimeout(() => {
            this.call('WebBridge', 'ReadClipboard', null).subscribe(v => {
                this.clipboard.copy(v)
            });
        }, 5);
    }

    public getConfigurations(): Configurations
    {
        return Configurations.Instance;
    }

    public reportGameState(payload: ReportGameStateRequest): void
    {
        this.gameState.next(State[payload.body]);
    }

    public reportPlayerState(payload: ReportPlayerStateRequest): void
    {
        this.game.reportPlayerState(payload.body);
    }

    public reportSession(payload: ReportSessionRequest): void
    {
        this.session.next({
            walletId: payload.body.WalletId,
            contract: payload.body.Contract,
            isGuest: payload.body.IsGuest,
            network: payload.body.Network,
        });
    }

    public buy(payload: BuyLandsRequest): void
    {
        this.app.buyLands(payload);
    }

    public save(payload: SaveLandsRequest): void
    {
        this.app.saveLands(payload);
    }

    public transfer(payload: TransferLandRequest): void
    {
        this.app.transferLand(payload);
    }

    public editProfile(payload: BridgeMessage<undefined>): void
    {
        this.app.editProfile(payload);
    }

    public setNft(request: SetNftRequest): void
    {
        this.app.setNft(request);
    }

    public moveToHome(payload: BridgeMessage<undefined>): void
    {
        this.game.requestClose();
    }

    public openPluginsDialog(payload: OpenPluginDialogRequest): void
    {
        if (this.gameState.getValue() == State.PLAYING) {
            this.game?.openPluginDialog(payload.body);
        }
    }

    public getAuthToken(payload: BridgeMessage<boolean>): Observable<string>
    {
        return this.authService.getAuthToken(payload.body);
    }

    public connectMetamask(payload: BridgeMessage<number>): Observable<ConnectionDetail>
    {
        return this.web3Service.connect({ openDialogIfFailed: true })
            .pipe(
                map((v) => {
                    if (!v)
                        return null;
                    return {
                        network: this.web3Service.networkId(),
                        wallet: this.web3Service.wallet(),
                        contractAddress: null,
                    };
                })
            );
    }

    public copyToClipboard(payload: BridgeMessage<string>): void
    {
        this.clipboard.copy(payload.body);
    }


    public getStartingContract(payload: BridgeMessage<string>): Observable<MetaverseContract>
    {
        console.log(this.startingContract?.networkId == null ? null : this.startingContract);
        return of(this.startingContract?.networkId == null ? null : this.startingContract);
    }

    public setStartingContract(startingContract: MetaverseContract)
    {
        this.startingContract = startingContract;
    }

    public getStartingPosition(payload: BridgeMessage<string>): Observable<Position>
    {
        return of(this.position);
    }

    public setStartingPosition(position: string)
    {
        const parameters = position.split('_');
        if (parameters.length == 3) {
            const x = parseFloat(parameters[0]);
            const y = parseFloat(parameters[1]);
            const z = parseFloat(parameters[2]);
            if (x != undefined && y != undefined && z != undefined) {
                this.position = { x: x, y: y, z: z };
                return;
            }
        }
        this.position = null;
    }

    public call(objectName: string, methodName: string, parameter: string): Observable<any>
    {
        let id = uuid.v4();
        let subject = new ReplaySubject(1);
        this.responseObservable.set(id, subject);
        let request = JSON.stringify({
            id: id,
            objectName: objectName,
            methodName: methodName,
            parameter: parameter,
        } as WebToUnityRequest);
        window.bridge.unityInstance.SendMessage('WebBridge', 'Request', request);
        return new Observable<any>(observer => {
            const subscription = subject.subscribe(observer);
            return () => {
                this.responseObservable.delete(id);
                subscription.unsubscribe();
                let cancelRequest = JSON.stringify({
                    id: id,
                    command: 'cancel',
                } as WebToUnityRequest);
                window.bridge.unityInstance.SendMessage('WebBridge', 'Request', cancelRequest);
            };
        }).pipe(map(res => JSON.parse(res)));
    }

    public respond(res: BridgeMessage<string>): void
    {
        let response: Response = JSON.parse(res.body);
        let subject = this.responseObservable.get(response.id);
        if (subject) {
            if (response.command == 'complete') {
                subject.complete();
                this.responseObservable.delete(response.id);
            } else if (response.body != null) {
                subject.next(response.body);
            } else if (response.error != null) {
                subject.error(response.error);
                subject.complete();
                this.responseObservable.delete(response.id);
            }
        } else {
            console.log('Invalid response from unity. ID: ' + response.id);
        }
    }

    public freezeGame()
    {
        this.unityInstance.SendMessage('GameManager', 'FreezeGame', '');
    }

    public unFreezeGame()
    {
        this.unityInstance.SendMessage('GameManager', 'UnFreezeGame', '');
    }

    public reportOtherPlayersState(state: ReportPlayerStateRequestBodyType)
    {
        this.unityInstance.SendMessage('Players', 'ReportOtherPlayersStateFromWeb', JSON.stringify(state));
    }

    public cursorStateChanged(locked: boolean)
    {
        if (this.gameState.getValue() != State.PLAYING) {
            return;
        }
        if (locked) {
            this.unityInstance.SendMessage('GameManager', 'LockCursor', '');
        } else {
            this.unityInstance.SendMessage('GameManager', 'UnlockCursor', '');
        }

    }
}


export type BuyLandsRequest = BridgeMessage<Land[]>;

export type SaveLandsRequestBodyType = { [key: number]: string };
export type SaveLandsRequest = BridgeMessage<SaveLandsRequestBodyType>;

export interface SetNftRequestBodyType
{
    landId: number;
    nft: boolean;
}

export interface ReportPlayerStateRequestBodyType
{
    walletId: string;
    position: Position;
    forward: Position;
    sprint: boolean;
    floating: boolean;
    jump: boolean;
}

export interface Session
{
    walletId: string;
    isGuest: boolean;
    contract: string;
    network: number;
}

interface SessionRequestBody
{
    WalletId: string;
    IsGuest: boolean;
    Contract: string;
    Network: number;
}

export type SetNftRequest = BridgeMessage<SetNftRequestBodyType>;

export type TransferLandRequest = BridgeMessage<number>;

export type ReportGameStateRequest = BridgeMessage<string>;

export type ReportSessionRequest = BridgeMessage<SessionRequestBody>;

export type ReportPlayerStateRequest = BridgeMessage<ReportPlayerStateRequestBodyType>;

export type OpenPluginDialogRequest = BridgeMessage<'menu' | 'running'>;

export enum State
{
    LOADING = "LOADING",
    PLAYING = "PLAYING",
    MENU = "MENU",
    LOGIN = "LOGIN",
    FREEZE = "FREEZE"
}

