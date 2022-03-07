import { Injectable, ViewContainerRef } from '@angular/core';
import { UtopiaBridgeService } from '../utopia-bridge.service';
import { concatMap, map, switchMap, toArray } from 'rxjs/operators';
import { Observable, of, timer } from 'rxjs';
import { Position } from '../position';
import { Land } from '../../ehtereum/models';
import { Web3Service } from '../../ehtereum/web3.service';
import { PluginParameter } from './plugin-execution.service';
import { UtopiaDialogService } from '../../utopia-dialog.service';
import { PluginInputsEditor } from './plugin-inputs-editor/plugin-inputs-editor.component';
import { Plugin } from './Plugin';
import { MetaBlock } from './models';

@Injectable()
export class UtopiaApiService {

    private runningPlugin?: Plugin;

    constructor(readonly bridge: UtopiaBridgeService, readonly web3Service: Web3Service,
                readonly dialogService: UtopiaDialogService, readonly vcr: ViewContainerRef) {
    }

    public setRunningPlugin(plugin: Plugin) {
        this.runningPlugin = plugin;
    }

    public placeBlock(type: string, x: number, y: number, z: number): Observable<boolean> {
        return this.bridge.call('UtopiaApi', 'PlaceBlock', JSON.stringify({
            type: type,
            position: {
                x: x,
                y: y,
                z: z
            }
        }));
    }

    public placeMetaBlocks(blocks: MetaBlock[]) {
        const slices = [];
        while (blocks.length > 0) {
            slices.push(blocks.splice(0, 500));
        }
        return of(...slices).pipe(
            concatMap(slice => {
                    const modifiedSlice: any[] = slice.map((block: any) => {
                        const modifiedBlock: any = {...block};
                        if(block.type.metaBlock?.properties){
                            modifiedBlock.type.metaBlock.properties = JSON.stringify(block.type.metaBlock.properties);
                        } else if (block.type.metaBlock) {
                            modifiedBlock.type.metaBlock.properties = "";
                        }
                        return modifiedBlock;
                    })
                    return this.bridge.call('UtopiaApi', 'PlaceMetaBlocks', JSON.stringify(modifiedSlice))
                        .pipe(
                            switchMap(res => timer(1).pipe(map(() => res)))
                        );
                }
            ),
            toArray(),
            map(array => array.reduce((a, b) => {
                return { ...a, ...b };
            }, {})));
    }

    public currentLand(): Observable<Land> {
        return this.bridge.call('UtopiaApi', 'CurrentLand', null);
    }

    public getPlayerPosition(): Observable<Position> {
        return this.bridge.call('UtopiaApi', 'GetPlayerPosition', null);
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

    public getInputsFromUser(inputs: PluginParameter[]): Observable<any> {
        return new Observable<any>(subscriber => {
            this.bridge.freezeGame();
            this.dialogService.open(PluginInputsEditor, {
                data: {
                    inputs: inputs,
                    plugin: this.runningPlugin
                },
                viewContainerRef: this.vcr,
                disableClose: true,
                backdropClass: 'transparent-backdrop'
            }).subscribe((ref) => {
                ref.afterClosed().subscribe(result => {
                    this.bridge.unFreezeGame();
                    if (result != null) {
                        subscriber.next(result.inputs);
                        subscriber.complete();
                    } else {
                        subscriber.error(new Error('User cancelled'));
                    }
                }, error => {
                    this.bridge.unFreezeGame();
                    subscriber.error(error);
                });
            });
        });
    }
}

export interface Marker {
    name: string;
    position: Position;
}