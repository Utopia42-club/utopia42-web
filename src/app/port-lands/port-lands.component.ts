import { CONTRACT_ADDRESS } from './../ehtereum/web3.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, concatMap, map, takeLast, tap } from 'rxjs/operators';
import { METAMASK_PROVIDER_LIST, Web3Service } from '../ehtereum/web3.service';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';

@Component({
    selector: 'app-port-lands',
    templateUrl: './port-lands.component.html',
    styleUrls: ['./port-lands.component.scss'],
})
export class PortLandsComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    private network: string;
    private wallet: string;
    networkName: string;
    selectedNetworkId: string = '';
    sourceNetworks: {}[];
    landPrices: {}[] = [];
    tempLandPrices: {}[] = [];
    displayedColumns = ["Name", "x1", "y1", "x2", "y2", "Price"];

    constructor(
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private readonly service: Web3Service,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.network = this.service.networkId().toString();
        this.networkName = METAMASK_PROVIDER_LIST[this.network];
        this.wallet = this.service.wallet();
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
        //TODO:
        // this.subscription.add(this.route.params.subscribe(params => {
        //     this.ipfsKeys = `${params.ipfsKeys}`.split(',');
        //     console.log(this.ipfsKeys);
        // }));
        // this.subscription.add(this.route.queryParams.subscribe(params => {
        //     this.network = params.networkId ? `${params.networkId}` : undefined;
        //     this.wallet = params.wallet ? `${params.wallet}` : undefined;
        // }));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    totalPrice(): Number {
        var price = 0;
        for(var i in this.landPrices)
            price += Number(this.landPrices[i]['price']);
        return price;
    }
    
    getPrices(): void {
        this.subscription.add(
            this.loadingService.prepare(
                    this.service.getSmartContract(this.selectedNetworkId)
                        .getOwnerLands(this.wallet)
                        .pipe(
                            map((lands) => {
                                this.landPrices = [];
                                this.tempLandPrices = [];
                                if (lands.length == 0) {
                                    this.snackBar.open(`No lands found on the source network.`);
                                    return;
                                }
                                this.subscription.add(
                                    this.loadingService.prepare(
                                            of(...lands).pipe(
                                                concatMap((land, index) => {
                                                    return this.service.getSmartContract()
                                                        .getLandPrice(land.x1, land.y1, land.x2, land.y2)
                                                        .pipe(map((price) => {
                                                                this.tempLandPrices.push({
                                                                    name: `Land ${index + 1}`,
                                                                    price: price,
                                                                    land: land
                                                                })
                                                                return true;
                                                            })
                                                        );
                                                }), takeLast(1), tap((v) => {
                                                    if (v) {
                                                        this.landPrices = this.tempLandPrices;
                                                        this.snackBar.open(`All land prices calculated.`);
                                                    }
                                                })
                                            )
                                        ).subscribe()
                                    );
                            }), catchError((e) => {
                                console.log(e);
                                this.dialog.open(ExceptionDialogContentComponent, { data: { title: 'Failed to calculate price!'} });
                                this.landPrices = [];
                                return of(false);
                            })
                        )).subscribe()
        );
    }
}
