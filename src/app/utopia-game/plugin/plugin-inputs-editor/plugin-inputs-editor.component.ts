import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PluginExecutionService, PluginParameter } from '../plugin-execution.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from '../../../loading/loading.service';
import { Plugin } from '../Plugin';
import { Marker, UtopiaApiService } from '../utopia-api.service';
import { BehaviorSubject } from 'rxjs';
import { Land } from '../../../ehtereum/models';
import { Web3Service } from '../../../ehtereum/web3.service';

@Component({
    selector: 'app-plugin-inputs-editor',
    templateUrl: './plugin-inputs-editor.component.html',
    styleUrls: ['./plugin-inputs-editor.component.scss'],
    providers: []
})
export class PluginInputsEditor implements OnInit {
    inputsForm?: FormGroup;
    inputs?: PluginParameter[];

    plugin: Plugin;

    positionOptions = new BehaviorSubject<Marker[]>([]);
    landOptions = new BehaviorSubject<Land[]>([]);
    blockTypes = new BehaviorSubject<string[]>([]);

    isRunDialog = false;
    acceptedTerms = false;

    constructor(readonly pluginExecutionService: PluginExecutionService, readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginInputsEditor>, @Inject(MAT_DIALOG_DATA) readonly data: any,
                readonly utopiaApiService: UtopiaApiService, readonly web3Service: Web3Service) {

        if (data.plugin == null) {
            throw new Error('Plugin is required');
        }
        this.plugin = data.plugin;
        if (data.inputs == null) {
            this.isRunDialog = true;
            if (data.plugin.descriptorUrl != null) {
                this.pluginExecutionService.getFile(this.plugin.descriptorUrl.trim())
                    .subscribe(inputs => {
                        this.prepareInputs(JSON.parse(inputs));
                    });
            } else {
                this.prepareInputs([]);
            }
        } else {
            this.prepareInputs(data.inputs);
        }
    }

    private prepareInputs(inputs: PluginParameter[]) {
        this.inputs = inputs;
        this.inputsForm = this.toFormGroup(inputs);
        if (inputs.find(input => input.type == 'position') != null) {
            this.utopiaApiService.getPlayerPosition()
                .subscribe(position => {
                    this.positionOptions.next([{
                        name: 'Player position',
                        position: position
                    }, ...this.positionOptions.getValue()]);
                });
            this.utopiaApiService.getMarkers()
                .subscribe(markers => {
                    this.positionOptions.next([...this.positionOptions.getValue(), ...markers]);
                });
        }
        if (inputs.find(input => input.type == 'land') != null) {
            this.utopiaApiService.getPlayerLands(this.web3Service.wallet())
                .subscribe(lands => {
                    this.landOptions.next(lands);
                });
            this.utopiaApiService.getCurrentLand()
                .subscribe(land => {
                    if (land != null) {
                        let l = this.landOptions.value.find(l => l.id == land.id);
                        if (l != null) {
                            inputs.filter(input => input.type == 'land')
                                .forEach(input => {
                                    this.inputsForm.get(input.name).setValue(l);
                                });
                        }
                    }
                });
        }
        if (inputs.find(input => input.type == 'blockType') != null) {
            this.utopiaApiService.getBlockTypes()
                .subscribe(blockTypes => {
                    this.blockTypes.next([...this.blockTypes.getValue(), ...blockTypes]);
                });
        }
    }

    ngOnInit(): void {

    }

    submit() {
        this.dialogRef.close({
            inputs: this.inputsForm?.value
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

    openInNewTab(scriptUrl: string) {
        window.open(scriptUrl, '_blank');
    }
}
