import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-exception-dialog-content',
    templateUrl: './exception-dialog-content.component.html',
    styleUrls: ['./exception-dialog-content.component.scss']
})
export class ExceptionDialogContentComponent implements OnInit {

    constructor(private readonly dialogRef: MatDialogRef<ExceptionDialogContentComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit(): void {
    }

    close() {
        this.dialogRef.close();
    }

}
