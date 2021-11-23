import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subscription } from 'rxjs';
import { concatMap, map, catchError, takeLast, tap } from 'rxjs/operators';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';
import { SetNftRequestBodyType } from '../utopia-game/utopia-bridge.service';
import { SetNftData } from './set-nft-data';

@Component({
  selector: 'app-set-nft',
  templateUrl: './set-nft.component.html',
  styleUrls: ['./set-nft.component.scss']
})
export class SetNftComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    readonly setNftRequestData: SetNftRequestBodyType;
    destinationAddress: string;
    heading: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: SetNftData,
        private dialogRef: MatDialogRef<any>,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private snackBar: MatSnackBar)
    {
        this.setNftRequestData = data.request.body;
        if(this.setNftRequestData.isNft)
          this.heading = 'Converting land to nft';
        else
          this.heading = 'Converting nft to land';
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

    toggleNft(): void
    {
        const status = [false];

        this.subscription.add(
            this.loadingService.prepare(
                of(this.setNftRequestData)
                    .pipe(
                        concatMap((requestData) =>
                        {
                            return this.data.contract
                                .toggleNft(requestData.landId, this.data.request.connection.wallet, requestData.isNft)
                                .pipe(map(v =>
                                {
                                    status[0] = true;
                                    return true;
                                }));
                        }), catchError(e =>
                        {
                            console.log(e);
                            this.dialog.open(ExceptionDialogContentComponent, { data: { title: "Land/NFT conversion failed!" } });
                            return of(false);
                        }), takeLast(1), tap(v =>
                        {
                            if (v) {
                                this.snackBar.open(`Conversion successfully done.`);
                                this.dialogRef.close();
                            }
                        })
                    )
            ).subscribe()
        );
    }

}
