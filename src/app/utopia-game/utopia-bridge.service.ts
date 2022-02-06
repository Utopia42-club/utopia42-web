import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { ConnectionDetail } from '../ehtereum/connection-detail';
import { Land } from '../ehtereum/models';
import { Web3Service } from '../ehtereum/web3.service';
import { GameRequest } from './game-request';
import { Clipboard } from '@angular/cdk/clipboard';

@Injectable()
export class UtopiaBridgeService {
    public unityInstance;
    private position?: Position;
    private gameState = new Subject<State>();

    constructor(private web3service: Web3Service, private app: AppComponent, private clipboard: Clipboard) {
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

    public connectMetamask(payload: GameRequest<string>): Observable<ConnectionDetail> {
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

    public copyToClipboard(payload: GameRequest<string>): void {
        this.clipboard.copy(payload.body);
    }

    public getStartingPosition(payload: GameRequest<string>): Observable<Position> {
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
}

export type BuyLandsRequest = GameRequest<Land[]>;

export type SaveLandsRequestBodyType = { [key: number]: string };
export type SaveLandsRequest = GameRequest<SaveLandsRequestBodyType>;

export interface SetNftRequestBodyType {
    landId: number;
    nft: boolean;
}

export type SetNftRequest = GameRequest<SetNftRequestBodyType>;

export type TransferLandRequest = GameRequest<number>;

export type EditProfileRequest = GameRequest<string>; // FIXME: string --change to--> undefined (wallet id can be retrieved from connection)

export type ReportGameStateRequest = GameRequest<string>;

export interface Position {
    x: number;
    y: number;
    z: number;
}

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

