import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { catchError, concatMap, map, takeLast, tap } from 'rxjs/operators';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading/loading.service';
import { TransferLandData } from './transfer-land-data';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-transfer-land',
    templateUrl: './transfer-land.component.html',
    styleUrls: ['./transfer-land.component.scss']
})
export class TransferLandComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    destinationAddress: string;
    landId: number;

    constructor(@Inject(MAT_DIALOG_DATA) public data: TransferLandData,
                private dialogRef: MatDialogRef<any>,
                private dialog: MatDialog,
                private readonly loadingService: LoadingService,
                private readonly toaster: ToastrService)
    {
        this.landId = data.request.body;
    }

    ngOnInit(): void
    {
    }

    ngOnDestroy(): void
    {
        this.subscription.unsubscribe();
    }

    cancel(): void
    {
        this.dialogRef.close();
    }

    transfer(): void
    {
        const status = [false];

        this.subscription.add(
            this.loadingService.prepare(
                of(this.destinationAddress.trim())
                    .pipe(
                        concatMap((target) => {
                            return this.data.contract
                                .transferLand(this.landId, target, this.data.request.connection.wallet)
                                .pipe(map(v => {
                                    status[0] = true;
                                    return true;
                                }));
                        }), catchError(e => {
                            console.log(e);
                            this.dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to transfer land!" } });
                            return of(false);
                        }), takeLast(1), tap(v => {
                            if (v) {
                                this.toaster.info('Request successfully sent.');
                                this.dialogRef.close();
                            }
                        })
                    )
            ).subscribe()
        );
    }
}
