import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { Land, PricedLand } from '../ehtereum/models';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading/loading.service';
import { BuyLandValidation } from './buy-land-validation';
import { BuyLandsData } from './buy-lands-data';
import { BuyLandsService } from './buy-lands.service';
import { ToastrService } from 'ngx-toastr';
import { ConnectionDetail } from "../ehtereum/connection-detail";


@Component({
    selector: 'app-buy-lands',
    templateUrl: './buy-lands.component.html',
    styleUrls: ['./buy-lands.component.scss'],
})
export class BuyLandsComponent implements OnInit, OnDestroy
{
    private readonly connection: ConnectionDetail;
    private readonly subscription = new Subscription();
    readonly lands: PricedLand[];
    private signature: string;
    private lastLandCheckedId: number;
    columns = ['x1', 'y1', 'x2', 'y2', 'Price'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: BuyLandsData,
                private dialogRef: MatDialogRef<any>,
                private dialog: MatDialog,
                private readonly loadingService: LoadingService,
                private readonly toaster: ToastrService,
                private readonly buyLandsService: BuyLandsService)
    {
        this.lands = data.request.body;
        this.connection = data.request.connection;
    }

    ngOnInit(): void
    {
        this.subscription.add(
            this.loadingService.prepare(
                of(this.lands).pipe(
                    concatMap((lands: Land[]) => {
                        if (lands.length == 1) {
                            return of(lands[0]);
                        }
                        throw new Error('Exactly one land should be selected for buying');
                    }),
                    concatMap((land: Land) => {
                        return this.buyLandsService.validate(land, this.connection.network, this.connection.contractAddress);
                    }),
                    concatMap((validation: BuyLandValidation) => {
                        if (!validation.valid) {
                            throw new Error('Invalid land coordinates. Buying cancelled');
                        }
                        if (validation.conflictingLand == undefined) {
                            if (validation.signature) {
                                this.signature = validation.signature;
                                this.lastLandCheckedId = validation.lastCheckedLandId;
                                return this.data.contract.getLandPrice(this.lands[0]);
                            }
                            throw new Error('No signature retrieved');
                        }
                        throw new Error('The requested land has conflict with other lands.');
                    }),
                    concatMap((price: string) => {
                        this.lands[0].price = Number(price);
                        return of(true);
                    }),
                    catchError((e: Error) => {
                        this.dialog.open(ExceptionDialogContentComponent, {
                            data: {
                                title: 'Error',
                                content: e.message
                            },
                        });
                        this.dialogRef.close();
                        return of(false);
                    })
                )
            ).subscribe()
        );
    }

    ngOnDestroy(): void
    {
        this.subscription.unsubscribe();
    }

    buy(): void
    {
        this.subscription.add(
            this.loadingService.prepare(
                of(this.lands[0]).pipe(
                    concatMap((land: Land) => {
                        return this.data.contract.assignPricedLand(
                            this.data.request.connection.wallet, land, this.lastLandCheckedId, this.signature
                        );
                    }),
                    catchError((e) => {
                        this.dialog.open(ExceptionDialogContentComponent, {
                            data: {
                                title: 'Error',
                                content: e.message ? e.message : 'Failed to buy the land'
                            },
                        });
                        this.dialogRef.close();
                        return of(false);
                    }),
                    tap((v) => {
                        if (v) {
                            this.toaster.info('Buying land requested successfully');
                        }
                        this.dialogRef.close();
                    })
                )
            ).subscribe()
        );
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    totalPrice(): number
    {
        let price = 0;
        for (let land of this.lands) {
            price = price + land.price;
        }
        return price;
    }

    getLandProperty(land: PricedLand, property: string): Number
    {
        if (property == 'x1') {
            return land.startCoordinate.x;
        }
        if (property == 'x2') {
            return land.endCoordinate.x;
        }
        if (property == 'y1') {
            return land.startCoordinate.z;
        }
        if (property == 'y2') {
            return land.endCoordinate.z;
        }
        if (property == 'price') {
            return land.price;
        }
        return null;
    }

}
