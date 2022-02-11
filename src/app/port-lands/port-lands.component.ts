import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { concatMap, map, tap, toArray } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { Land, PricedLand } from '../ehtereum/models';
import { Network, Networks } from '../ehtereum/network';
import { UtopiaContract } from '../ehtereum/utopia-contract';
import { Web3Service } from '../ehtereum/web3.service';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';
import { ToastrService } from "ngx-toastr";
import { UtopiaDialogService } from '../utopia-dialog.service';

@Component({
    selector: 'app-port-lands',
    templateUrl: './port-lands.component.html',
    styleUrls: ['./port-lands.component.scss'],
})
export class PortLandsComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    networkName: string;
    sourceNetwork: Network = null;
    targetNetwork: Network = null;
    networks: Network[];
    lands: PricedLand[] = [];
    displayedColumns = ['x1', 'y1', 'x2', 'y2', 'Price'];

    constructor(
        private dialogRef: MatDialogRef<any>,
        private dialog: UtopiaDialogService,
        private readonly loadingService: LoadingService,
        private readonly service: Web3Service,
        private readonly toaster: ToastrService,
        @Inject(MAT_DIALOG_DATA) private readonly appComponent: AppComponent,
    )
    {
    }

    ngOnInit(): void
    {
        this.networks = Array.from(Networks.supported.values());

        // if (this.networks.length != 0)
        //     this.sourceNetwork = this.networks[0];
    }

    ngOnDestroy(): void
    {
        this.subscription.unsubscribe();
    }

    totalPrice(): number
    {
        let price = 0;
        for (let i in this.lands) price = price + this.lands[i].price;
        return price;
    }

    port(): void
    {
        // this.subscription.add(
        //     this.loadingService
        //         .prepare(
        //             of(...this.lands).pipe(
        //                 concatMap((land) => {
        //                     let contract = this.service.getSmartContract();
        //                     return contract
        //                         .assignPricedLand(contract.defaultWallet, land)
        //                         .pipe(
        //                             map((v) => {
        //                                 return true;
        //                             })
        //                         );
        //                 }),
        //                 catchError((e) => {
        //                     this.openErrorDialog('Failed to port lands!');
        //                     return of(false);
        //                 }),
        //                 takeLast(1),
        //                 tap((v) => {
        //                     if (v)
        //                         this.snackBar.open('All lands ported to target.');
        //                 })
        //             )
        //         )
        //         .subscribe()
        // );
    }

    private openErrorDialog(title: string)
    {
        this.dialog.open(ExceptionDialogContentComponent, {
            data: { title },
        });
    }

    getPrices(): void
    {
        if (this.sourceNetwork == this.targetNetwork) {
            this.toaster.info("Source and target cannot be the same");
            return;
        }
        // this.appComponent.getContractSafe(this.targetNetwork.id, null)
        // .subscribe(contract => {
        // console.log(contract);
        // if (contract == null) return;
        // this.doLoadLands(contract);
        // });
        this.subscription.add(
            this.loadingService
                .prepare(
                    this.service
                        .getSmartContract(this.sourceNetwork.id)
                        .getOwnerLands()
                    // .pipe(
                    //     switchMap((lands) => {
                    //         if (lands.length == 0){
                    //             this.openErrorDialog('No lands found on the source network!')
                    //             return of()
                    //         }
                    //         return this.toPricedLands(lands, targetContract);
                    //     }),
                    //     catchError((e: Error) => {
                    //         this.openErrorDialog(e.message != '' ? e.message : 'Failed to calculate price!');
                    //         return throwError(e);
                    //     })
                    // )
                ).subscribe(lands => {
                this.dialogRef.close();
                this.appComponent.buyLands({
                    connection: {
                        wallet: this.service.wallet(),
                        network: this.targetNetwork.id
                    },
                    body: lands
                });
            })
        );
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    private toPricedLands(lands: Land[], contract: UtopiaContract): Observable<PricedLand[]>
    {
        return of(...lands).pipe(
            concatMap((land) => {
                return contract.getLandPrice(land)
                    .pipe(
                        map((price) => {
                            return { ...land, price: Number(price) };
                        })
                    );
            }),
            toArray(),
            tap((lands) => {
                this.lands = lands;
                this.toaster.info('All land prices calculated.');
            })
        )
    }

}
