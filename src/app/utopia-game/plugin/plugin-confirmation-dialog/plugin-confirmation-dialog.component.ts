import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Plugin } from '../Plugin';

@Component({
    selector: 'app-plugin-confirmation-dialog',
    templateUrl: './plugin-confirmation-dialog.component.html',
    styleUrls: ['./plugin-confirmation-dialog.component.scss'],
    providers: []
})
export class PluginConfirmationDialog implements OnInit {
    plugin: Plugin;
    acceptedTerms = false;

    constructor(readonly dialogRef: MatDialogRef<PluginConfirmationDialog>, @Inject(MAT_DIALOG_DATA) readonly data: any,) {
        this.plugin = data.plugin;
    }


    ngOnInit(): void {

    }

    run() {
        this.dialogRef.close({
            acceptedTerms: true
        });
    }

    cancel() {
        this.dialogRef.close({
            acceptedTerms: false
        });
    }

}
