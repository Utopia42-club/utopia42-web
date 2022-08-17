import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Plugin } from '../Plugin';
import * as Prism from 'prismjs';
import { PluginService } from '../plugin.service';

@Component({
    selector: 'app-plugin-confirmation-dialog',
    templateUrl: './plugin-confirmation-dialog.component.html',
    styleUrls: ['./plugin-confirmation-dialog.component.scss'],
    providers: []
})
export class PluginConfirmationDialog implements OnInit {
    plugin: Plugin;
    acceptedTerms = false;
    code: any;

    constructor(readonly dialogRef: MatDialogRef<PluginConfirmationDialog>, @Inject(MAT_DIALOG_DATA) readonly data: any,
                readonly pluginService: PluginService) {
        this.plugin = data.plugin;
        pluginService.getFile(this.plugin.scriptUrl)
            .subscribe(code => {
                this.code = Prism.highlight(code, Prism.languages.js, 'js');
            });
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
