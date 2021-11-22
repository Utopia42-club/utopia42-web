import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subscription } from 'rxjs';
import { catchError, concatMap, map, takeLast, tap } from 'rxjs/operators';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';
import { SaveLandsRequestBodyType } from '../utopia-game/utopia-bridge.service';
import { SaveLandsData } from './save-lands-data';

@Component({
    selector: 'app-save-lands',
    templateUrl: './save-lands.component.html',
    styleUrls: ['./save-lands.component.scss']
})
export class SaveLandsComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    readonly ipfsKeys: SaveLandsRequestBodyType;
    readonly ipfsKeysLength: number;

    constructor(@Inject(MAT_DIALOG_DATA) public data: SaveLandsData,
        private dialogRef: MatDialogRef<any>,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private snackBar: MatSnackBar)
    {
        this.ipfsKeys = data.request.body;
        this.ipfsKeysLength = Object.keys(this.ipfsKeys).length;
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

    save(): void
    {
        const status = Array.from(Object.keys(this.ipfsKeys)).map(k => false);

        this.subscription.add(
            this.loadingService.prepare(
                of(...Object.keys(this.ipfsKeys))
                    .pipe(
                        concatMap((landId, i) =>
                        {
                            return this.data.contract
                                .updateLand(this.ipfsKeys[landId], landId, this.data.request.connection.wallet)
                                .pipe(map(v =>
                                {
                                    status[i] = true;
                                    this.snackBar.open(`Land ${landId} saved.`);
                                    return true;
                                }));
                        }), catchError(e =>
                        {
                            console.log(e);
                            this.dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to save lands!" } });
                            return of(false);
                        }), takeLast(1), tap(v =>
                        {
                            if (v) {
                                this.snackBar.open(`All Lands saved.`);
                                this.dialogRef.close();
                            }
                        })
                    )
            ).subscribe()
        );
    }
}
