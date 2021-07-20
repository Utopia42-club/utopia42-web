import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subscription } from 'rxjs';
import { catchError, concatMap, map, takeLast, tap } from 'rxjs/operators';
import { ExceptionDialogContentComponent } from '../exception-dialog-content/exception-dialog-content.component';
import { LoadingService } from '../loading.service';
import { SaveLandsData } from './save-lands-data';

@Component({
    selector: 'app-save-lands',
    templateUrl: './save-lands.component.html',
    styleUrls: ['./save-lands.component.scss']
})
export class SaveLandsComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();
    readonly ipfsKeys: string[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: SaveLandsData,
        private dialogRef: MatDialogRef<any>,
        private dialog: MatDialog,
        private readonly loadingService: LoadingService,
        private snackBar: MatSnackBar) {
        this.ipfsKeys = data.request.body;
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {
        const status = this.ipfsKeys.map(k => false);
        this.subscription.add(
            this.loadingService.prepare(
                of(...this.ipfsKeys)
                    .pipe(
                        concatMap((key, index) => {
                            return this.data.contract
                                .updateLand(key, index, this.data.request.connection.wallet)
                                .pipe(map(v => {
                                    status[index] = true;
                                    this.snackBar.open(`Land ${index + 1} saved.`)
                                    return true;
                                }))
                        }), catchError(e => {
                            console.log(e);
                            this.dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to save lands!" } });
                            return of(false)
                        }), takeLast(1), tap(v => {
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
