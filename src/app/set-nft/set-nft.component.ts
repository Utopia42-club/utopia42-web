import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of, Subscription} from 'rxjs';
import {catchError, concatMap, map, takeLast, tap} from 'rxjs/operators';
import {ExceptionDialogContentComponent} from '../exception-dialog-content/exception-dialog-content.component';
import {LoadingService} from '../loading/loading.service';
import {SetNftRequestBodyType} from '../utopia-game/utopia-bridge.service';
import {SetNftData} from './set-nft-data';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-set-nft',
    templateUrl: './set-nft.component.html',
    styleUrls: ['./set-nft.component.scss']
})
export class SetNftComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    readonly setNftRequestData: SetNftRequestBodyType;
    destinationAddress: string;
    heading: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: SetNftData,
                private dialogRef: MatDialogRef<any>,
                private dialog: MatDialog,
                private readonly loadingService: LoadingService,
                private readonly toaster: ToastrService) {
        this.setNftRequestData = data.request.body;
        if (this.setNftRequestData.nft)
            this.heading = 'Converting land to nft';
        else
            this.heading = 'Converting nft to land';
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    cancel(): void {
        this.dialogRef.close();
    }

    toggleNft(): void {
        this.subscription.add(
            this.loadingService.prepare(
                of(this.setNftRequestData)
                    .pipe(
                        concatMap((requestData) => {
                            return this.data.contract
                                .setNft(requestData.landId, this.data.request.connection.wallet, requestData.nft)
                                .pipe(map(v => {
                                    return true;
                                }));
                        }), catchError(e => {
                            this.dialog.open(ExceptionDialogContentComponent, {data: {title: "Land/NFT conversion failed!"}});
                            return of(false);
                        }), takeLast(1), tap(v => {
                            if (v) {
                                this.toaster.info(`Conversion successfully requested.`);
                                this.dialogRef.close();
                            }
                        })
                    )
            ).subscribe()
        );
    }

}
