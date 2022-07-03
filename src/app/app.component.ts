import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BuyLandsData } from './buy-lands/buy-lands-data';
import { BuyLandsComponent } from './buy-lands/buy-lands.component';
import { ConnectionDetail } from './ehtereum/connection-detail';
import { UtopiaContract } from './ehtereum/utopia-contract';
import { Web3Service } from './ehtereum/web3.service';
import { SaveLandsData } from './save-lands/save-lands-data';
import { SaveLandsComponent } from './save-lands/save-lands.component';
import { TransferLandData } from './transfer-land/transfer-land-data';
import { TransferLandComponent } from './transfer-land/transfer-land.component';
import { SetNftComponent } from './set-nft/set-nft.component';
import { SetNftData } from './set-nft/set-nft-data';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import {
    BuyLandsRequest,
    SaveLandsRequest,
    SaveLandsRequestBodyType,
    SetNftRequest,
    TransferLandRequest
} from './utopia-game/utopia-bridge.service';
import { HttpClient } from '@angular/common/http';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MetaMaskConnectingComponent } from "./meta-mask-connecting/meta-mask-connecting.component";
import { BridgeMessage } from "./utopia-game/bridge-message";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit
{

    constructor(private service: Web3Service, private dialog: MatDialog, private route: ActivatedRoute,
                readonly router: Router, readonly http: HttpClient)
    {
    }

    ngOnInit(): void
    {
        this.route.queryParams.subscribe(params => {
            if (params.method != null && params.wallet != null && params.network != null) {
                let connection: ConnectionDetail = {
                    wallet: `${params.wallet}`.toLowerCase(),
                    network: parseInt(`${params.network}`)
                };
                if (params.param != null) {
                    if (params.method == 'buy') {
                        this.buyLands({
                            connection,
                            body: `${params.param}`.split(',')
                                .map(l => {
                                    let coords = l.split('_').map(v => Number(v));
                                    return {
                                        startCoordinate: { x: coords[0], y: 0, z: coords[1] },
                                        endCoordinate: { x: coords[2], y: 0, z: coords[3] }
                                    };
                                })
                        });
                    } else if (params.method == 'save') {
                        const body: SaveLandsRequestBodyType = {};
                        `${params.param}`.split(',').map(l => {
                            const values = l.split('_');
                            body[Number(values[0])] = values[1];
                        });

                        this.saveLands({
                            connection, body: body
                        });
                    } else if (params.method == 'transfer') {
                        this.transferLand({
                            connection, body: Number(`${params.param}`)
                        });
                    } else if (params.method == 'setNft') {
                        const values = `${params.param}`.split('_');

                        this.setNft({
                            connection, body: {
                                landId: Number(values[0]),
                                nft: values[1].toLowerCase() === 'true'
                            }
                        });
                    }
                } else if (params.method == 'editProfile') {
                    this.editProfile({
                        connection, body: undefined
                    });
                }
            }
        });
    }

    ngAfterViewInit()
    {

    }

    async moveToHome()
    {
        if (this.isGameOpen()) {
            await window.bridge.game.requestClose();
        }
        this.router.navigateByUrl('/rpc', { skipLocationChange: true }).then(() => {
            this.router.navigate(['game']);
        });
    }

    public buyLands(request: BuyLandsRequest): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract => {
                if (contract != null) {
                    this.dialog.open(BuyLandsComponent, {
                        data: { request, contract } as BuyLandsData,
                        disableClose: true
                    });
                }
            });
    }

    public saveLands(request: SaveLandsRequest): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract => {
                if (contract != null) {
                    this.dialog.open(SaveLandsComponent, {
                        data: { request, contract } as SaveLandsData,
                        disableClose: true
                    });
                }
            });
    }

    public transferLand(request: TransferLandRequest): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract => {
                if (contract != null) {
                    this.dialog.open(TransferLandComponent, {
                        data: { request, contract } as TransferLandData,
                        disableClose: true
                    });
                }
            });
    }

    public setNft(request: SetNftRequest): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract => {
                if (contract != null) {
                    this.dialog.open(SetNftComponent, {
                        data: { request, contract } as SetNftData,
                        disableClose: true
                    });
                }
            });
    }

    public editProfile(request: BridgeMessage<undefined>): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract => {
                if (contract != null) {
                    window.bridge?.freezeGame();
                    this.dialog.open(EditProfileComponent, {
                        data: {
                            walletId: request.connection.wallet
                            , contract
                        },
                        disableClose: true,
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%"
                    }).afterClosed().subscribe(value => {
                        window.bridge?.unFreezeGame();
                    });
                }
            });
    }

    public getContractSafe(network: number, wallet: string): Observable<UtopiaContract>
    {
        return this.service.connect({ networkId: network, wallet: wallet, openDialogIfFailed: true })
            .pipe(
                map((connected) => {
                    if (connected) {
                        return this.service.getSmartContract();
                    }
                    return null;
                })
            );
    }

    isGameOpen()
    {
        return window.bridge != null && window.bridge.game != null;
    }
}

export interface Action
{
    label: string;

    icon: string;

    perform: (event: ActionEvent) => void;

    menu?: MatMenu;
}

export interface ActionEvent
{
    menuTrigger?: MatMenuTrigger;
}
