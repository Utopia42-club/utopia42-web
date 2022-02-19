import { Injectable } from '@angular/core';
import { UtopiaBridgeService } from '../utopia-bridge.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Position } from '../position';
import { Land } from '../../ehtereum/models';
import { Web3Service } from '../../ehtereum/web3.service';

@Injectable()
export class UtopiaApiService {

    constructor(readonly bridge: UtopiaBridgeService, readonly web3Service: Web3Service) {
    }

    public placeBlock(type: string, x: number, y: number, z: number): Observable<boolean> {
        return this.bridge.call('UtopiaApi', 'PlaceBlock', JSON.stringify({
            type: type,
            position: {
                x: x,
                y: y,
                z: z
            }
        })).pipe(map(res => JSON.parse(res)));
    }

    public getPlayerPosition(): Observable<Position> {
        return this.bridge.call('UtopiaApi', 'GetPlayerPosition', null)
            .pipe(map(res => JSON.parse(res)));
    }

    public getPlayerLands(walletId: string): Observable<Land[]> {
        return this.bridge.call('UtopiaApi', 'GetPlayerLands', walletId)
            .pipe(map(res => JSON.parse(res)));
    }

    public getCurrentLand(): Observable<Land> {
        return this.bridge.call('UtopiaApi', 'GetCurrentLand', null)
            .pipe(map(res => JSON.parse(res)));
    }

    public getMarkers(): Observable<Marker[]> {
        return this.bridge.call('UtopiaApi', 'GetMarkers', null)
            .pipe(map(res => JSON.parse(res)));
    }

    public getBlockTypes(): Observable<string[]> {
        return this.bridge.call('UtopiaApi', 'GetBlockTypes', null)
            .pipe(map(res => JSON.parse(res)));
    }

    public getCurrentWallet(): Observable<string> {
        return of(this.web3Service.wallet());
    }

}

export interface Marker {
    name: string,
    position: Position
}
