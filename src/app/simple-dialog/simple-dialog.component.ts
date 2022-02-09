import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-simple-dialog',
    templateUrl: './simple-dialog.component.html',
    styleUrls: ['./simple-dialog.component.scss']
})
export class SimpleDialogComponent implements OnInit {

    constructor(private readonly dialogRef: MatDialogRef<SimpleDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: SimpleDialogData) {
    }

    ngOnInit(): void {
    }

    close() {
        this.dialogRef.close();
    }
}

export class SimpleDialogAction {
    constructor(public readonly label: string,
                public readonly action: () => void,
                public readonly color: 'primary' | 'accent' | 'warn' = 'primary') {
    }
}

export class SimpleDialogData {
    constructor(public readonly title: string,
                public readonly message: string,
                public readonly actions?: SimpleDialogAction[],
                public readonly closable: boolean = true) {
    }
}
