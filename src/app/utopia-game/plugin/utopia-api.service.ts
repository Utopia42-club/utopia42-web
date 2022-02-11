import { Injectable } from '@angular/core';
import { UtopiaBridgeService } from '../utopia-bridge.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Position } from '../position';
import { Land } from '../../ehtereum/models';

@Injectable()
export class UtopiaApiService {

    constructor(readonly bridge: UtopiaBridgeService) {
    }

    public placeBlock(type: string, x: number, y: number, z: number) {
        this.bridge.call('UtopiaApi', 'PlaceBlock', JSON.stringify({
            type: type,
            x: x,
            y: y,
            z: z
        }));
    }

    public getPlayerPosition(): Observable<Position> {
        return this.bridge.call('UtopiaApi', 'GetPlayerPosition', null)
            .pipe(map(res => JSON.parse(res)));
    }

    public getPlayerLands(walletId: string): Observable<Land[]> {
        return this.bridge.call('UtopiaApi', 'GetPlayerLands', walletId)
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

}

export interface Marker {
    name: string,
    position: Position
}
