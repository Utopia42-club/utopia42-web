import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subscription } from 'rxjs';
import {
    catchError,
    concatMap,
    tap
} from 'rxjs/operators';
import { Land, PricedLand } from '../ehtereum/models';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';
import { BuyLandValidation } from './buy-land-validation';
import { BuyLandsData } from './buy-lands-data';
import { BuyLandsService } from './buy-lands.service';




@Component({
    selector: 'app-buy-lands',
    templateUrl: './buy-lands.component.html',
    styleUrls: ['./buy-lands.component.scss'],
})
export class BuyLandsComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    readonly lands: PricedLand[];
    columns = ['x1', 'y1', 'x2', 'y2', 'Price'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: BuyLandsData,
        private dialogRef: MatDialogRef<any>,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private snackBar: MatSnackBar,
        private readonly buyLandsService: BuyLandsService) {
        this.lands = data.request.body;
    }

    ngOnInit(): void {
        this.subscription.add(
            this.loadingService.prepare(
                of(this.lands).pipe(
                    concatMap((lands: Land[]) => {
                        if(lands.length == 1) return of(lands[0]);
                        throw new Error('Exactly one land should be selected for buying');
                    }),
                    concatMap((land: Land) => {
                        return this.buyLandsService.validate(land);
                    }),
                    concatMap((validation: BuyLandValidation) => {
                        return of(validation.valid && validation.conflictingLand == undefined);
                    }),
                    concatMap((valid: boolean) => {
                        if(!valid) throw new Error('Conflict detected. Buying cancelled');
                        return this.data.contract.getLandPrice(this.lands[0]);
                    }),
                    concatMap((price: string) => {
                        this.lands[0].price = Number(price);
                        return of(true);
                    }),
                    catchError((e: Error) => {
                        this.dialog.open(ExceptionDialogContentComponent, {
                            data: {
                                title: "Error",
                                content: e.message
                            },
                        });
                        this.dialogRef.close();
                        return of(false);
                    })
                )
            ).subscribe()
        )
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    buy(): void {
        this.subscription.add(
            this.loadingService.prepare(
                of(this.lands[0]).pipe(
                    concatMap((land: Land) => {
                        return this.data.contract.assignPricedLand(
                            this.data.request.connection.wallet, land
                        )
                    }),
                    catchError((_) => {
                        this.dialog.open(ExceptionDialogContentComponent, {
                            data: {
                                title: "Failed to buy the land",
                            },
                        });
                        this.dialogRef.close();
                        return of(false);
                    }),
                    tap((v) => {
                        if (v) {
                            this.snackBar.open(
                                `Land bought successfully`
                            );
                        }
                        this.dialogRef.close();
                    })
                )
            ).subscribe()
        );
    }

    cancel(): void {
        this.dialogRef.close();
    }

    totalPrice(): number {
        let price = 0;
        for (let land of this.lands)
            price = price + land.price;
        return price;
    }
}
