import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subscription, throwError } from 'rxjs';
import {
    catchError,
    concatMap,
    map, takeLast,
    tap
} from 'rxjs/operators';
import { PricedLand } from '../ehtereum/models';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';
import { BuyLandsData } from './buy-lands-data';




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
        private snackBar: MatSnackBar) {
        this.lands = data.request.body;
    }

    ngOnInit(): void {
        this.subscription.add(
            this.getPrices()
                .pipe(
                    catchError((e: Error) => {
                        this.dialog.open(ExceptionDialogContentComponent, {
                            data: {
                                title:
                                    e.message != ''
                                        ? e.message
                                        : 'Failed to calculate price!',
                            },
                        });
                        return throwError(e);
                    })
                ).subscribe()
        );
    }

    getPrices(): Observable<any> {
        return this.loadingService.prepare(
            this.loadingService
                .prepare(
                    of(...this.lands).pipe(
                        concatMap((land, index) => {
                            if (land.price != null) return of(true);
                            return this.data.contract
                                .getLandPrice(land)
                                .pipe(
                                    map((price) => {
                                        land.price = Number(price);
                                        return true;
                                    })
                                );
                        }),
                        takeLast(1),
                        tap((v) => {
                            if (v)
                                this.snackBar.open('All land prices calculated.');
                        })
                    )
                )
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    buy(): void {
        this.subscription.add(
            this.loadingService
                .prepare(
                    of(...this.lands).pipe(
                        concatMap((land, index) => {
                            return this.data.contract.
                                assignPricedLand(
                                    this.data.request.connection.wallet,
                                    land
                                ).pipe(
                                    map((v) => {
                                        this.snackBar.open(
                                            `Land number ${index + 1} bought.`
                                        );
                                        return true;
                                    })
                                );
                        }),
                        catchError((e) => {
                            this.dialog.open(ExceptionDialogContentComponent, {
                                data: {
                                    title: 'Failed to buy all the lands!',
                                },
                            });
                            return throwError(e);
                        }),
                        takeLast(1),
                        tap((v) => {
                            if (v) {
                                this.snackBar.open('All lands were bought.');
                                this.dialogRef.close();
                            }
                        })
                    )
                )
                .subscribe()
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
