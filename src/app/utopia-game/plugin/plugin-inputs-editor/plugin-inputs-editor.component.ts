import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from '../../../loading/loading.service';
import { Plugin } from '../Plugin';
import { Marker, UtopiaApiService } from '../utopia-api.service';
import { BehaviorSubject } from 'rxjs';
import { Land } from '../../../ehtereum/models';
import { Web3Service } from '../../../ehtereum/web3.service';
import { PluginParameter } from '../plugin.parameter';

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

    constructor(readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginInputsEditor>, @Inject(MAT_DIALOG_DATA) readonly data: any,
                readonly utopiaApiService: UtopiaApiService, readonly web3Service: Web3Service,
                readonly cdr: ChangeDetectorRef) {

        if (data.plugin == null || data.inputs == null) {
            throw new Error('Plugin/Inputs is required');
        }
        this.plugin = data.plugin;
        this.prepareInputs(data.inputs);
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
        let formControl;
        params.forEach(param => {
            if (param.isList) {
                if (param.defaultValue != null) {
                    formControl = new FormArray(param.defaultValue.map(value => new FormControl(value)));
                } else {
                    formControl = new FormArray([new FormControl(null)]);
                }
            } else {
                formControl = new FormControl(param.defaultValue || null);
            }
            if (param.required) {
                formControl.setValidators([Validators.required]);
            }
            group[param.name] = formControl;
        });
        return new FormGroup(group);
    }

    asFormArray(form: any): FormArray {
        return form as FormArray;
    }

    removeListItem(input: PluginParameter, formControl: AbstractControl) {
        let control = this.inputsForm.get(input.name) as FormArray;
        control.removeAt(control.controls.indexOf(formControl));
        this.cdr.detectChanges();
    }

    addListItem(input: PluginParameter) {
        let control = this.inputsForm.get(input.name) as FormArray;
        control.push(new FormControl(null));
        this.cdr.detectChanges();
    }
}
