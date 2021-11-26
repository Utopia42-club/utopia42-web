import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BuyLandsData } from './buy-lands/buy-lands-data';
import { BuyLandsComponent } from './buy-lands/buy-lands.component';
import { ConnectionDetail } from './ehtereum/connection-detail';
import { UtopiaContract } from './ehtereum/utopia-contract';
import { Web3Service } from './ehtereum/web3.service';
import { MetaMaskConnectingComponent } from './meta-mask-connecting/meta-mask-connecting.component';
import { SaveLandsData } from './save-lands/save-lands-data';
import { SaveLandsComponent } from './save-lands/save-lands.component';
import { TransferLandData } from './transfer-land/transfer-land-data';
import { TransferLandComponent } from './transfer-land/transfer-land.component';
import { SetNftComponent } from './set-nft/set-nft.component';
import { EditProfileData } from './update-profile/update-profile-data';
import { SetNftData } from './set-nft/set-nft-data';
import { EditProfileComponent } from './update-profile/update-profile.component';
import { BuyLandsRequest, EditProfileRequest, SaveLandsRequest, SaveLandsRequestBodyType, SetNftRequest, TransferLandRequest } from './utopia-game/utopia-bridge.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent
{
    actions: Action[] = [];
    subscription = new Subscription();

    constructor(private service: Web3Service,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        router: Router)
    {
        this.actions.push({
            icon: 'home',
            perform()
            {
                router.navigate(['home']);
            }
        });
    }

    ngOnInit(): void
    {
        this.route.queryParams.subscribe(params =>
        {
            if (params.method != null && params.wallet != null && params.network != null) {
                let connection: ConnectionDetail = {
                    wallet: `${params.wallet}`.toLowerCase(),
                    network: parseInt(`${params.network}`)
                };
                if (params.param != null) {
                    if (params.method == "buy") {
                        this.buyLands({
                            connection,
                            body: `${params.param}`.split(",")
                                .map(l =>
                                {
                                    let coords = l.split("_").map(v => Number(v));
                                    return {
                                        x1: coords[0], y1: coords[1], x2: coords[2], y2: coords[3]
                                    };
                                })
                        });
                    }
                    else if (params.method == "save") {
                        const body: SaveLandsRequestBodyType = {};
                        `${params.param}`.split(',').map(l =>
                        {
                            const values = l.split('_');
                            body[Number(values[0])] = values[1];
                        });

                        this.saveLands({
                            connection, body: body
                        });
                    } else if (params.method == "transfer") {
                        const values = `${params.param}`.split('_');
                        this.transferLand({
                            connection, body: {
                                landId: Number(values[0]),
                                isNft: values[1].toLowerCase() === "true"
                            }
                        });
                    } else if (params.method == "setNft") {
                        const values = `${params.param}`.split('_');

                        this.setNft({
                            connection, body: {
                                landId: Number(values[0]),
                                nft: values[1].toLowerCase() === "true"
                            }
                        });
                    }
                }
                else if (params.method == "editProfile") {
                    this.editProfile({
                        connection, body: undefined
                    });
                }
            }
        });
    }

    public buyLands(request: BuyLandsRequest): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract =>
            {
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
            .subscribe(contract =>
            {
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
            .subscribe(contract =>
            {
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
            .subscribe(contract =>
            {
                if (contract != null) {
                    this.dialog.open(SetNftComponent, {
                        data: { request, contract } as SetNftData,
                        disableClose: true
                    });
                }
            });
    }

    public editProfile(request: EditProfileRequest): void
    {
        this.getContractSafe(request.connection.network, request.connection.wallet)
            .subscribe(contract =>
            {
                if (contract != null) {
                    this.dialog.open(EditProfileComponent, {
                        data: { request, contract } as EditProfileData,
                        disableClose: true
                    });
                }
            });
    }

    public getContractSafe(network: number, wallet: string): Observable<UtopiaContract>
    {
        return this.service.connect(network, wallet)
            .pipe(
                switchMap(v =>
                {
                    if (!v) return this.connect(network, wallet);
                    return of(true);
                }),
                map((connected) =>
                {
                    if (connected)
                        return this.service.getSmartContract();
                    return null;
                })
            );
    }

    private connect(network: number, wallet: string): Observable<boolean>
    {
        let dialogRef = this.dialog.open(MetaMaskConnectingComponent, {
            disableClose: true,
            data: { wallet, network } as ConnectionDetail
        });
        return dialogRef.componentInstance.result$;
    }
}

export interface Action
{
    icon: string;
    perform();
}
