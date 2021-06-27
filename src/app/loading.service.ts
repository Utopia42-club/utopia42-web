import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Observable, of } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private taskCounter: number = 0;
    private dialogRef: MatDialogRef<any, any>;

    constructor(private dialog: MatDialog) { }

    openDialog(): void {
        if (this.dialogRef != null) return;

        this.dialogRef = this.dialog.open(MatSpinner);
    }

    private taskStarted(): void {
        this.taskCounter++;
        this.openDialog();
    }

    private taskFinished(): void {
        this.taskCounter--;
        if (this.taskCounter == 0 && this.dialogRef != null) {
            this.dialogRef.close();
            this.dialogRef = null;
        }
    }

    public prepare(observable: Observable<any>): Observable<any> {
        return of(1).pipe(
            tap(v => this.taskStarted()),
            switchMap(o => observable),
            finalize(() => this.taskFinished())
        );
    }

}
