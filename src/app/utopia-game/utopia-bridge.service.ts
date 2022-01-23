import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { ConnectionDetail } from '../ehtereum/connection-detail';
import { Land } from '../ehtereum/models';
import { Web3Service } from '../ehtereum/web3.service';
import { GameRequest } from './game-request';

export enum GameState
{
    PLAYING = "PLAYING"
    //TODO add all values
}

@Injectable()
export class UtopiaBridgeService
{
    private readonly stateSubject = new ReplaySubject<GameState>(1);
    public state$ = this.stateSubject.asObservable();
    public unityInstance;


    constructor(private web3service: Web3Service, private app: AppComponent)
    {
    }

    public stateChanged(payload: StateChangeRequest): void
    {
        this.stateSubject.next(payload.body);
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

    public editProfile(payload: EditProfileRequest): void
    {
        this.app.editProfile(payload);
    }

    public setNft(request: SetNftRequest): void
    {
        this.app.setNft(request);
    }

    public connectMetamask(payload: GameRequest<string>): Observable<ConnectionDetail>
    {
        // return this.web3service.connect()
        return this.web3service.isConnected()
            .pipe(map(v => {
                if (!v) return null;
                return {
                    network: this.web3service.networkId(),
                    wallet: this.web3service.wallet()
                };
            }));
    }

    public movePlayerTo(position: string):void
    {
        this.state$.pipe(
            filter(s => s == GameState.PLAYING)
            , take(1)).subscribe(() => {
            this.unityInstance.SendMessage('GameManager', 'MovePlayerTo', position);
        });
    }
}

export type BuyLandsRequest = GameRequest<Land[]>;
export type StateChangeRequest = GameRequest<GameState>;

export type SaveLandsRequestBodyType = { [key: number]: string };
export type SaveLandsRequest = GameRequest<SaveLandsRequestBodyType>;

export interface SetNftRequestBodyType
{
    landId: number,
    nft: boolean
}

export type SetNftRequest = GameRequest<SetNftRequestBodyType>;

export type TransferLandRequest = GameRequest<number>;

export type EditProfileRequest = GameRequest<string>; // FIXME: string --change to--> undefined (wallet id can be retrieved from connection)
