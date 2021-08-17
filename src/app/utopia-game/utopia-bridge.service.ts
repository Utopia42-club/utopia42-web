import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { ConnectionDetail } from '../ehtereum/connection-detail';
import { Land } from '../ehtereum/models';
import { Web3Service } from '../ehtereum/web3.service';
import { GameRequest } from './game-request';

@Injectable()
export class UtopiaBridgeService
{
    public unityInstance;
    constructor(private web3service: Web3Service, private app: AppComponent) { }

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

    public connectMetamask(payload: GameRequest<string>): Observable<ConnectionDetail>
    {
        // return this.web3service.connect()
        return this.web3service.isConnected()
            .pipe(map(v =>
            {
                if (!v) return null;
                return {
                    network: this.web3service.networkId(),
                    wallet: this.web3service.wallet()
                };
            }));
    }
}

export type BuyLandsRequest = GameRequest<Land[]>;

export type SaveLandsRequestBodyType = {[key:number]:string};
export type SaveLandsRequest = GameRequest<SaveLandsRequestBodyType>;

export type TransferLandRequest = GameRequest<number>;