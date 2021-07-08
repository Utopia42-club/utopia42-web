import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription, throwError } from 'rxjs';
import {
    catchError,
    concatMap,
    map, switchMap, takeLast,
    tap
} from 'rxjs/operators';
import { Web3Service } from '../ehtereum/web3.service';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';

interface LandCoordinates {
    name: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    price: number;
}

const createLandCoordinates = (coordinates: string[]): LandCoordinates => {
    let l = coordinates.map((item) => Number(item));
    return l[2] > l[0] && l[3] > l[1]
        ? {
            x1: l[0],
            y1: l[1],
            x2: l[2],
            y2: l[3],
            name: null,
            price: null,
        }
        : null;
};

@Component({
    selector: 'app-buy-lands',
    templateUrl: './buy-lands.component.html',
    styleUrls: ['./buy-lands.component.scss'],
})
export class BuyLandsComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    private network: string;
    private wallet: string;
    landsCoordinates: LandCoordinates[] = [];
    tempLandsCoordinates: LandCoordinates[] = [];
    displayedColumns = ['Name', 'x1', 'y1', 'x2', 'y2', 'Price'];

    constructor(
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private readonly service: Web3Service,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.network = this.service.networkId().toString();
        this.wallet = this.route.snapshot.params.wallet ? `${this.route.snapshot.params.wallet}` : undefined;

        this.subscription.add(
            this.route.params
                .pipe(
                    switchMap((params) => {
                        this.wallet = params.wallet ? `${params.wallet}` : undefined;
                        let coordinates = `${params.coordinates}`.split(',');
                        let landsCoordinates: LandCoordinates[] = coordinates
                            .map((item, index) =>
                                index % 4 === 0
                                    ? createLandCoordinates(
                                        coordinates.slice(index, index + 4)
                                    )
                                    : null
                            )
                            .filter((item) => item != null);
                        if (coordinates.length / 4 != landsCoordinates.length) {
                            throw Error('Invalid Coordinates!');
                        }
                        this.tempLandsCoordinates = [];
                        return this.loadingService.prepare(
                            of(...landsCoordinates).pipe(
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
                                                this.tempLandsCoordinates.push({
                                                    name: `Land ${index + 1}`,
                                                    price: Number(price),
                                                    x1: land.x1,
                                                    y1: land.y1,
                                                    x2: land.x2,
                                                    y2: land.y2,
                                                });
                                                return true;
                                            })
                                        );
                                }),
                                takeLast(1),
                                tap((v) => {
                                    if (v) {
                                        this.landsCoordinates =
                                            this.tempLandsCoordinates;
                                        this.snackBar.open(
                                            'All land prices calculated.'
                                        );
                                    }
                                })
                            )
                        );
                    }),
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
                )
                .subscribe()
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    buy(): void {
        this.subscription.add(
            this.loadingService
                .prepare(
                    of(...this.landsCoordinates).pipe(
                        concatMap((land, index) => {
                            return this.service
                                .getSmartContract()
                                .assignLand(
                                    this.wallet,
                                    land.x1,
                                    land.y1,
                                    land.x2,
                                    land.y2
                                )
                                .pipe(
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
                            this.landsCoordinates = [];
                            if (v) {
                                this.snackBar.open(`All lands were bought.`);
                                window.close();
                            }
                        })
                    )
                )
                .subscribe()
        );
    }

    totalPrice(): number {
        let price = 0;
        for (let i in this.landsCoordinates)
            price = price + this.landsCoordinates[i].price;
        return price;
    }
}
