import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PluginExecutionService, PluginParameter } from '../plugin-execution.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PluginService } from '../plugin.service';
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

    script?: string;
    inputs?: PluginParameter[];
    inputsForm?: FormGroup;

    plugin: Plugin;

    positionOptions = new BehaviorSubject<Marker[]>([]);
    landOptions = new BehaviorSubject<Land[]>([]);
    blockTypes = new BehaviorSubject<string[]>([]);

    constructor(readonly pluginExecutionService: PluginExecutionService, readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginInputsEditor>, @Inject(MAT_DIALOG_DATA) readonly pluginId: number,
                readonly pluginService: PluginService, readonly utopiaApiService: UtopiaApiService,
                readonly web3Service: Web3Service) {

        this.loadingService.prepare(
            this.pluginService.get(pluginId)
        ).subscribe(value => {
            this.plugin = value;
            this.pluginExecutionService.getFile(value.descriptorUrl.trim())
                .subscribe(inputs => {
                    this.inputs = JSON.parse(inputs);
                    if (this.inputs.find(input => input.type == 'position') != null) {
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
                    if (this.inputs.find(input => input.type == 'land') != null) {
                        this.utopiaApiService.getPlayerLands(web3Service.wallet())
                            .subscribe(lands => {
                                this.landOptions.next(lands);
                            });
                    }
                    if (this.inputs.find(input => input.type == 'blockType') != null) {
                        this.utopiaApiService.getBlockTypes()
                            .subscribe(blockTypes => {
                                this.blockTypes.next([...this.blockTypes.getValue(), ...blockTypes]);
                            });
                    }
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
