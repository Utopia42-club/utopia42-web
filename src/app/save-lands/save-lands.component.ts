import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, concatMap, map, takeLast, tap } from 'rxjs/operators';
import { Web3Service } from '../ehtereum/web3.service';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';

@Component({
    selector: 'app-save-lands',
    templateUrl: './save-lands.component.html',
    styleUrls: ['./save-lands.component.scss']
})
export class SaveLandsComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    private network: string;
    private wallet: string;
    ipfsKeys: string[];

    constructor(private route: ActivatedRoute, private dialog: MatDialog, private readonly loadingService: LoadingService,
        private readonly service: Web3Service, private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.subscription.add(this.route.params.subscribe(params => {
            this.ipfsKeys = `${params.ipfsKeys}`.split(',');
            console.log(this.ipfsKeys);
        }));
        this.subscription.add(this.route.queryParams.subscribe(params => {
            this.network = params.networkId ? `${params.networkId}` : undefined;
            this.wallet = params.wallet ? `${params.wallet}` : undefined;
        }));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    save(): void {
        const status = this.ipfsKeys.map(k => false);
        this.subscription.add(
            this.loadingService.prepare(
                of(...this.ipfsKeys)
                    .pipe(
                        concatMap((key, index) => {
                            return this.service.getSmartContract()
                                .updateLand(key, index, this.wallet)
                                .pipe(map(v => {
                                    status[index] = true;
                                    this.snackBar.open(`Land ${index + 1} number saved.`)
                                    return true;
                                }))
                        }), catchError(e => {
                            console.log(e);
                            this.dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to save lands!" } });
                            return of(false)
                        }), takeLast(1), tap(v => {
                            if (v)
                                this.snackBar.open(`All Lands saved.`)
                        })
                    )
            ).subscribe()
        );
    }
}
