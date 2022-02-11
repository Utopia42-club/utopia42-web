import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Observable, of } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { UtopiaDialogService } from './utopia-dialog.service';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private taskCounter: number = 0;
    private dialogRef: MatDialogRef<any, any>;

    constructor(private dialog: UtopiaDialogService, private zone: NgZone) {
    }

    openDialog(): void {
        if (this.dialogRef != null) {
            let dialogs = this.dialog.matDialog.openDialogs;
            let idx = dialogs.indexOf(this.dialogRef);
            if (idx == dialogs.length - 1) {
                return;
            }
            this.dialogRef.close();
        }
        // this.dialog.open(MatSpinner,
        //     {
        //         disableClose: true,
        //         panelClass: 'loading-panel',
        //         backdropClass: 'loading-back-drop'
        //     }
        // ).subscribe((ref) => {
        //     this.dialogRef = ref;
        // });
    }

    private taskStarted(): void {
        this.taskCounter++;
        this.openDialog();
    }

    private taskFinished(): void {
        setTimeout(() => {
            //workaround for value changed after init!
            //FIXME
            this.taskCounter--;
            if (this.taskCounter == 0 && this.dialogRef != null) {
                this.dialogRef.close();
                this.dialogRef = null;
            }
        }, 0.1);
    }

    public prepare(observable: Observable<any>): Observable<any> {
        return of(1).pipe(
            tap(v => this.taskStarted()),
            switchMap(o => observable),
            finalize(() => this.taskFinished())
        );
    }

}
