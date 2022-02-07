import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtopiaApiService {
    public unityInstance;

    constructor() {
    }

    public placeBlock(type: string, x: number, y: number, z: number) {
        this.unityInstance.SendMessage('UtopiaApi', 'PlaceBlock', JSON.stringify({
            type: type,
            x: x,
            y: y,
            z: z
        }));
    }
}
