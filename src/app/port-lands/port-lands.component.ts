import { Land } from './../ehtereum/utopia-contract';
import { CONTRACT_ADDRESS } from './../ehtereum/web3.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription, throwError } from 'rxjs';
import {
    catchError,
    concatMap,
    map,
    switchMap,
    takeLast,
    tap,
} from 'rxjs/operators';
import { METAMASK_PROVIDER_LIST, Web3Service } from '../ehtereum/web3.service';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';

interface LandPrice {
    name: string;
    land: Land;
    price: number;
}

interface SourceNetwork {
    networkId: string;
    networkName: string;
}

@Component({
    selector: 'app-port-lands',
    templateUrl: './port-lands.component.html',
    styleUrls: ['./port-lands.component.scss'],
})
export class PortLandsComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    private wallet: string;
    private network: string;
    networkName: string;
    selectedNetworkId: string = '';
    sourceNetworks: SourceNetwork[];
    landPrices: LandPrice[] = [];
    tempLandPrices: LandPrice[] = [];
    displayedColumns = ['Name', 'x1', 'y1', 'x2', 'y2', 'Price'];

    constructor(
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private readonly service: Web3Service,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.network = this.service.networkId().toString();
        this.wallet = this.service.wallet();
        this.networkName = METAMASK_PROVIDER_LIST[this.network];
        this.sourceNetworks = Object.keys(METAMASK_PROVIDER_LIST).reduce(
            (r, e) => {
                if (CONTRACT_ADDRESS[e] != '' && e != this.network)
                    r.push({
                        networkId: e,
                        networkName: METAMASK_PROVIDER_LIST[e],
                    });
                return r;
            },
            []
        );
        if (this.sourceNetworks.length != 0)
            this.selectedNetworkId = this.sourceNetworks[0].networkId;
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    totalPrice(): Number {
        let price = 0;
        for (let i in this.landPrices) price = price + this.landPrices[i].price;
        return price;
    }

    port(): void {
        this.subscription.add(
            this.loadingService
                .prepare(
                    of(...this.landPrices).pipe(
                        concatMap((landPrice) => {
                            return this.service
                                .getSmartContract()
                                .assignLand(
                                    this.wallet,
                                    landPrice.land.x1,
                                    landPrice.land.y1,
                                    landPrice.land.x2,
                                    landPrice.land.y2
                                )
                                .pipe(
                                    map((v) => {
                                        return true;
                                    })
                                );
                        }),
                        catchError((e) => {
                            console.log(e);
                            this.dialog.open(ExceptionDialogContentComponent, {
                                data: { title: 'Failed to port lands!' },
                            });
                            return of(false);
                        }),
                        takeLast(1),
                        tap((v) => {
                            if (v) {
                                this.landPrices = this.tempLandPrices;
                                this.snackBar.open(
                                    `All lands ported to target.`
                                );
                            }
                        })
                    )
                )
                .subscribe()
        );
    }

    getPrices(): void {
        this.subscription.add(
            this.loadingService
                .prepare(
                    this.service
                        .getSmartContract(this.selectedNetworkId)
                        .getOwnerLands(this.wallet)
                        .pipe(
                            switchMap((lands) => {
                                this.landPrices = [];
                                this.tempLandPrices = [];
                                if (lands.length == 0) {
                                    this.snackBar.open(
                                        `No lands found on the source network.`
                                    );
                                    return of();
                                }
                                return of(...lands).pipe(
                                    concatMap((land, index) => {
                                        return this.service
                                            .getSmartContract()
                                            .getLandPrice(
                                                land.x1,
                                                land.y1,
                                                land.x2,
                                                land.y2
                                            )
                                            .pipe(
                                                map((price) => {
                                                    this.tempLandPrices.push({
                                                        name: `Land ${
                                                            index + 1
                                                        }`,
                                                        price: Number(price),
                                                        land: land,
                                                    });
                                                    return true;
                                                })
                                            );
                                    })
                                );
                            }),
                            catchError((e) => {
                                console.log(e);
                                this.dialog.open(
                                    ExceptionDialogContentComponent,
                                    {
                                        data: {
                                            title: 'Failed to calculate price!',
                                        },
                                    }
                                );
                                this.landPrices = [];
                                return throwError(e);
                            }),
                            takeLast(1),
                            tap((v) => {
                                if (v) {
                                    this.landPrices = this.tempLandPrices;
                                    this.snackBar.open(
                                        `All land prices calculated.`
                                    );
                                }
                            })
                        )
                )
                .subscribe()
        );
    }
}
