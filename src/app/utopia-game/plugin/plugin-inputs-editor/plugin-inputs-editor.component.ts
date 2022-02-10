import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PluginExecutionService, PluginParameter } from '../plugin-execution.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PluginService } from '../plugin.service';
import { LoadingService } from '../../../loading.service';
import { Plugin } from '../Plugin';

@Component({
    selector: 'app-plugin-inputs-editor',
    templateUrl: './plugin-inputs-editor.component.html',
    styleUrls: ['./plugin-inputs-editor.component.scss'],
    providers: []
})
export class PluginInputsEditor implements OnInit {

    script?: string;
    inputs?: PluginParameter[];
    inputsForm?: FormGroup;

    plugin: Plugin;

    constructor(readonly pluginExecutionService: PluginExecutionService,
                readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginInputsEditor>,
                @Inject(MAT_DIALOG_DATA) readonly pluginId: number,
                readonly pluginService: PluginService) {

        this.loadingService.prepare(
            this.pluginService.get(pluginId)
        ).subscribe(value => {
            this.plugin = value;
            this.pluginExecutionService.getFile(value.descriptorUrl.trim())
                .subscribe(inputs => {
                    this.inputs = JSON.parse(inputs);
                    this.inputsForm = this.toFormGroup(this.inputs);
                });
        });
    }

    ngOnInit(): void {

    }

    runPlugin() {
        this.pluginExecutionService.getFile(this.plugin.scriptUrl)
            .subscribe(code => {
                this.dialogRef.close({
                    code: code,
                    inputs: this.inputsForm?.value
                });
            });
    }

    cancel() {
        this.dialogRef.close();
    }

    toFormGroup(params: PluginParameter[]) {
        const group: any = {};
        params.forEach(param => {
            group[param.name] = param.required ? new FormControl(param.defaultValue || null, Validators.required)
                : new FormControl(param.defaultValue || null);
        });
        return new FormGroup(group);
    }

}
