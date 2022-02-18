import { Injectable, NgZone } from '@angular/core';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { ConnectionDetail } from '../ehtereum/connection-detail';
import { Land } from '../ehtereum/models';
import { Web3Service } from '../ehtereum/web3.service';
import { BridgeMessage, Response, WebToUnityRequest } from './bridge-message';
import { Clipboard } from '@angular/cdk/clipboard';
import * as uuid from 'uuid';
import { Position } from './position';

@Injectable()
export class UtopiaBridgeService {
    public unityInstance;
    private position?: Position;
    private gameState = new Subject<State>();

    private responseObservable = new Map<string, Subject<any>>(); // key: CallId, value: Observable

    constructor(private web3service: Web3Service, private app: AppComponent, private clipboard: Clipboard,
                readonly zone: NgZone) {
    }

    public reportGameState(payload: ReportGameStateRequest): void {
        this.gameState.next(State[payload.body]);
    }

    public buy(payload: BuyLandsRequest): void {
        this.app.buyLands(payload);
    }

    public save(payload: SaveLandsRequest): void {
        this.app.saveLands(payload);
    }

    public transfer(payload: TransferLandRequest): void {
        this.app.transferLand(payload);
    }

    public editProfile(payload: EditProfileRequest): void {
        this.app.editProfile(payload);
    }

    public setNft(request: SetNftRequest): void {
        this.app.setNft(request);
    }

    public connectMetamask(payload: BridgeMessage<string>): Observable<ConnectionDetail> {
        // return this.web3service.connect()
        return this.web3service.isConnected().pipe(
            map((v) => {
                if (!v) {
                    return null;
                }
                return {
                    network: this.web3service.networkId(),
                    wallet: this.web3service.wallet(),
                };
            })
        );
    }

    public copyToClipboard(payload: BridgeMessage<string>): void {
        this.clipboard.copy(payload.body);
    }

    public getStartingPosition(payload: BridgeMessage<string>): Observable<Position> {
        return of(this.position);
    }

    public setStartingPosition(position: string) {
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

    public gameState$(): Observable<State> {
        return this.gameState.asObservable();
    }

    public call(objectName: string, methodName: string, parameter: string): Observable<any> {
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
        return subject.asObservable();
    }

    public respond(res: BridgeMessage<string>): void {
        let response: Response = JSON.parse(res.body);
        let subject = this.responseObservable.get(response.id);
        if (subject) {
            if (response.body != null) {
                subject.next(response.body);
            } else if (response.error != null) {
                subject.error(response.error);
            }
            subject.complete();
            this.responseObservable.delete(response.id);
        }
    }
}


export type BuyLandsRequest = BridgeMessage<Land[]>;

export type SaveLandsRequestBodyType = { [key: number]: string };
export type SaveLandsRequest = BridgeMessage<SaveLandsRequestBodyType>;

export interface SetNftRequestBodyType {
    landId: number;
    nft: boolean;
}

export type SetNftRequest = BridgeMessage<SetNftRequestBodyType>;

export type TransferLandRequest = BridgeMessage<number>;

export type EditProfileRequest = BridgeMessage<string>; // FIXME: string --change to--> undefined (wallet id can be retrieved from connection)

export type ReportGameStateRequest = BridgeMessage<string>;

export enum State {
    LOADING = 'LOADING',
    SETTINGS = 'SETTINGS',
    PLAYING = 'PLAYING',
    MAP = 'MAP',
    BROWSER_CONNECTION = 'BROWSER_CONNECTION',
    INVENTORY = 'INVENTORY',
    HELP = 'HELP',
    DIALOG = 'DIALOG',
    PROFILE_DIALOG = 'PROFILE_DIALOG',
    MOVING_OBJECT = 'MOVING_OBJECT',
    FREEZE = 'FREEZE'
}

