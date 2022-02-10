import { Injectable } from '@angular/core';
import { UtopiaBridgeService } from '../utopia-bridge.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Position } from '../position';

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

}
