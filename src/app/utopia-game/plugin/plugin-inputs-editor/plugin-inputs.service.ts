import {Injectable} from '@angular/core';
import {Marker, UtopiaApiService} from "../utopia-api.service";
import {Land} from "../../../ehtereum/models";
import {combineLatest, Observable, of} from "rxjs";
import {filter, map, shareReplay, switchMap} from "rxjs/operators";
import {Web3Service} from "../../../ehtereum/web3.service";

@Injectable()
export class PluginInputsService {
    readonly positionOptions$: Observable<Marker[]>;
    readonly landOptions$: Observable<Land[]>;
    readonly currentLand$: Observable<Land>;
    readonly blockTypes$: Observable<string[]>;

    constructor(readonly utopiaApiService: UtopiaApiService, readonly web3Service: Web3Service) {
        this.positionOptions$ = combineLatest([this.utopiaApiService.getPlayerPosition(), this.utopiaApiService.getMarkers()])
            .pipe(map(results =>
                [{
                    name: 'Player position',
                    position: results[0]
                }, ...results[1]]
            ), shareReplay(1));

        this.landOptions$ = this.utopiaApiService.getPlayerLands(this.web3Service.wallet())
            .pipe(shareReplay(1));

        this.currentLand$ = this.utopiaApiService.getCurrentLand().pipe(
            switchMap(land =>
                land == null ? of(null) : this.landOptions$.pipe(map(options => options.find(l => l.id == land.id)))
            ), filter(l => l != null), shareReplay(1));

        this.blockTypes$ = this.utopiaApiService.getBlockTypes().pipe(shareReplay(1));
    }
}
