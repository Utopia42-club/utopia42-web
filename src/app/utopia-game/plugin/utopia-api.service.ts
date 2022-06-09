import {Injectable, ViewContainerRef} from '@angular/core';
import {UtopiaBridgeService} from '../utopia-bridge.service';
import {concatMap, map, switchMap, toArray} from 'rxjs/operators';
import {Observable, of, timer} from 'rxjs';
import {Position} from '../position';
import {Land} from '../../ehtereum/models';
import {Web3Service} from '../../ehtereum/web3.service';
import {PluginInputsEditor} from './plugin-inputs-editor/plugin-inputs-editor.component';
import {Block, MetaBlock} from './models';
import {PluginInputFormDescriptor} from './plugin-input';
import {Plugin} from './Plugin';
import {MatDialog} from '@angular/material/dialog';
import {PluginService} from './plugin.service';

@Injectable()
export class UtopiaApiService {

    constructor(readonly bridge: UtopiaBridgeService, readonly web3Service: Web3Service,
                readonly dialogService: MatDialog, readonly vcr: ViewContainerRef,
                readonly pluginService: PluginService) {
    }

    public placeBlock(type: string, x: number, y: number, z: number): Observable<boolean> {
        return this.placeBlocks([{
            name: type,
            position: {x, y, z,},
        }]).pipe(map((dict) => Object.values(dict)[0]));
    }

    public placeBlocks(blocks: Block[]): Observable<Map<Position, boolean>> {
        const slices = [];
        while (blocks.length > 0) {
            slices.push(blocks.splice(0, 500));
        }
        return of(...slices).pipe(
            concatMap(slice => this.bridge.call('UtopiaApi', 'PlaceBlocks', JSON.stringify(slice))
                        .pipe(
                            switchMap(res => timer(1).pipe(map(() => res)))
                        )),
            toArray(),
            map(array => array.reduce((a, b) => {
                return {...a, ...b};
            }, {})));
    }

    public placeMetaBlocks(blocks: MetaBlock[]): Observable<Map<Position, boolean>> {
        const slices = [];
        while (blocks.length > 0) {
            slices.push(blocks.splice(0, 500));
        }
        return of(...slices).pipe(
            concatMap(slice => {
                    const modifiedSlice: any[] = slice.map((block: any) => {
                        const modifiedBlock: any = {...block};
                        if (block.properties) {
                            modifiedBlock.properties = JSON.stringify(block.properties);
                        } else {
                            modifiedBlock.properties = '';
                        }
                        return modifiedBlock;
                    });
                    return this.bridge.call('UtopiaApi', 'PlaceMetaBlocks', JSON.stringify(modifiedSlice))
                        .pipe(
                            switchMap(res => timer(1).pipe(map(() => res)))
                        );
                }
            ),
            toArray(),
            map(array => array.reduce((a, b) => {
                return {...a, ...b};
            }, {})));
    }

    public previewBlocks(blocks: Block[]): Observable<null> {
        const slices = [];
        while (blocks.length > 0) {
            slices.push(blocks.splice(0, 500));
        }
        return of(...slices).pipe(
            concatMap(slice => this.bridge.call('UtopiaApi', 'PreviewBlocks', JSON.stringify(slice))
                        .pipe(
                            switchMap(() => timer(1).pipe(map(() => {})))
                        )),
            toArray(),
            map(() => null)
        );
    }

    public selectBlocks(positions: Position[]): Observable<null> { // FIXME: ?
        const slices = [];
        while (positions.length > 0) {
            slices.push(positions.splice(0, 500));
        }
        return of(...slices).pipe(
            concatMap((slice) => {
                return this.bridge
                    .call('UtopiaApi', 'SelectBlocks', JSON.stringify(slice))
                    .pipe(switchMap(() => timer(1).pipe(map(() => {}))));
            }),
            toArray(),
            map(() => null)
        );
    }

    public currentLand(): Observable<Land> {
        return this.bridge.call('UtopiaApi', 'CurrentLand', null);
    }

    public blockPlaced(): Observable<BlockPlaced> {
        return this.bridge.call('UtopiaApi', 'BlockPlaced', null);
    }

    public getPlayerPosition(): Observable<Position> {
        return this.bridge.call('UtopiaApi', 'GetPlayerPosition', null);
    }

    public getBlockTypeAt(position: Position): Observable<string> {
        return this.bridge.call('UtopiaApi', 'GetBlockTypeAt', JSON.stringify(position));
    }

    public getPlayerLands(walletId: string): Observable<Land[]> {
        return this.bridge.call('UtopiaApi', 'GetPlayerLands', walletId);
    }

    public getCurrentLand(): Observable<Land> {
        return this.bridge.call('UtopiaApi', 'GetCurrentLand', null);
    }

    public getMarkers(): Observable<Marker[]> {
        return this.bridge.call('UtopiaApi', 'GetMarkers', null);
    }

    public getBlockTypes(): Observable<string[]> {
        return this.bridge.call('UtopiaApi', 'GetBlockTypes', null);
    }

    public getCurrentWallet(): Observable<string> {
        return of(this.web3Service.wallet());
    }

    public getInputsFromUser(descriptor: PluginInputFormDescriptor, useCache: boolean, runningPlugin: Plugin): Observable<any> {
        if (useCache) {
            let inputCache = this.pluginService.getInputCacheForPlugin(runningPlugin.id);
            let inputs = {};
            if (inputCache != null) {
                descriptor.inputs.forEach(input => {
                    if (input.type != 'file' && inputCache[input.name] != null) {
                        inputs[input.name] = inputCache[input.name];
                    }
                });
            }
            if (descriptor.inputs.length != Object.keys(inputs).length) {
                return this.doGetInputsFromUser(descriptor, useCache, runningPlugin, inputs);
            } else {
                return of(inputs);
            }
        }
        return this.doGetInputsFromUser(descriptor, useCache, runningPlugin);
    }

    private doGetInputsFromUser(descriptor: PluginInputFormDescriptor, useCache: boolean, runningPlugin: Plugin, cachedInputs: any = null) {
        return new Observable<any>(subscriber => {
            this.bridge.freezeGame();
            this.dialogService.open(PluginInputsEditor, {
                data: {
                    descriptor: descriptor,
                    plugin: runningPlugin,
                    cachedInputs: cachedInputs
                },
                viewContainerRef: this.vcr,
                disableClose: true,
                backdropClass: 'transparent-backdrop',
                maxWidth: '80vw',
                maxHeight: '80vh',
            }).afterClosed().subscribe(result => {
                this.bridge.unFreezeGame();
                if (result != null) {
                    subscriber.next(result.inputs);
                    subscriber.complete();
                    if (useCache) {
                        this.pluginService.setInputCacheForPlugin(runningPlugin.id, result.inputs);
                    }
                } else {
                    subscriber.error('User cancelled');
                }
            }, error => {
                this.bridge.unFreezeGame();
                subscriber.error(error);
            });
        });
    }
}

export interface Marker {
    name: string;
    position: Position;
}

interface BlockPlaced {
    position: Position;
    type: string;
}

