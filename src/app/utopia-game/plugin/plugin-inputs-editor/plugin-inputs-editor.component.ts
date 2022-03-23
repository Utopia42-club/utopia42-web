import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from '../../../loading/loading.service';
import { Plugin } from '../Plugin';
import { Marker, UtopiaApiService } from '../utopia-api.service';
import { BehaviorSubject } from 'rxjs';
import { Land } from '../../../ehtereum/models';
import { Web3Service } from '../../../ehtereum/web3.service';
import { PluginInput, PluginInputFormDescriptor } from '../pluginInput';

@Component({
    selector: 'app-plugin-inputs-editor',
    templateUrl: './plugin-inputs-editor.component.html',
    styleUrls: ['./plugin-inputs-editor.component.scss'],
    providers: []
})
export class PluginInputsEditor implements OnInit {
    inputsForm?: FormGroup;
    descriptor?: PluginInputFormDescriptor;
    inputs?: PluginInput[];

    plugin: Plugin;

    positionOptions = new BehaviorSubject<Marker[]>([]);
    landOptions = new BehaviorSubject<Land[]>([]);
    blockTypes = new BehaviorSubject<string[]>([]);

    gridAreas: string;
    templateColumns: string;
    templateRows: string;
    private cachedInputs: any = {};

    constructor(readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginInputsEditor>, @Inject(MAT_DIALOG_DATA) readonly data: any,
                readonly utopiaApiService: UtopiaApiService, readonly web3Service: Web3Service,
                readonly cdr: ChangeDetectorRef) {

        if (data.plugin == null || data.descriptor == null) {
            throw new Error('Plugin/Descriptor is required');
        }
        this.plugin = data.plugin;
        this.cachedInputs = data.cachedInputs;
        this.prepareInputs(data.descriptor);
    }

    private prepareInputs(descriptor: PluginInputFormDescriptor) {
        this.descriptor = descriptor;
        this.inputs = this.descriptor.inputs;

        if (descriptor.gridDescriptor != null) {
            let colCount = 0;
            descriptor.gridDescriptor.rows.forEach(row => colCount = Math.max(colCount, row.length));
            this.gridAreas = descriptor.gridDescriptor.rows
                .map(row => {
                    while (row.length < colCount) {
                        row.push('.');
                    }
                    return row;
                })
                .map(row => row.join(' ')).join(' | ');
            this.templateColumns = descriptor.gridDescriptor.templateColumns ?? `repeat(${colCount}, 1fr)`;
            this.templateRows = descriptor.gridDescriptor.templateRows ?? 'auto';
        } else {
            let names = this.inputs.map(param => param.name);
            let groups = [];
            while (names.length > 0) {
                groups.push(names.splice(0, 3));
            }
            if (groups.length > 0 && groups[groups.length - 1].length < 3) {
                let lastGroup = groups[groups.length - 1];
                while (lastGroup.length < 3) {
                    lastGroup.push('.');
                }
            }
            this.gridAreas = groups.map(group => group.join(' ')).join(' | ');
            this.templateColumns = '1fr 1fr 1fr';
            this.templateRows = 'auto';
        }

        this.inputsForm = this.toFormGroup(this.inputs);
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
            this.utopiaApiService.getPlayerLands(this.web3Service.wallet())
                .subscribe(lands => {
                    this.landOptions.next(lands);
                });
            this.utopiaApiService.getCurrentLand()
                .subscribe(land => {
                    if (land != null) {
                        let l = this.landOptions.value.find(l => l.id == land.id);
                        if (l != null) {
                            this.inputs.filter(input => input.type == 'land')
                                .forEach(input => {
                                    this.inputsForm.get(input.name).setValue(l);
                                });
                        }
                    }
                });
        }
        if (this.inputs.find(input => input.type == 'blockType') != null) {
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

    toFormGroup(params: PluginInput[]) {
        const group: any = {};
        let formControl;
        params.forEach(param => {
            if (param.isList) {
                if (this.getCacheValue(param.name) != null || param.defaultValue != null) {
                    formControl = new FormArray((this.getCacheValue(param.name) ?? param.defaultValue).map(value => new FormControl(value)));
                } else {
                    formControl = new FormArray([new FormControl(null)]);
                }
            } else {
                formControl = new FormControl(this.getCacheValue(param.name) ?? param.defaultValue ?? null);
            }
            if (param.required) {
                formControl.setValidators([Validators.required]);
            }
            group[param.name] = formControl;
        });
        return new FormGroup(group);
    }

    getCacheValue(name: string) {
        return this.cachedInputs != null ? this.cachedInputs[name] : null;
    }

    asFormArray(form: any): FormArray {
        return form as FormArray;
    }

    removeListItem(input: PluginInput, formControl: AbstractControl) {
        let control = this.inputsForm.get(input.name) as FormArray;
        control.removeAt(control.controls.indexOf(formControl));
        this.cdr.detectChanges();
    }

    addListItem(input: PluginInput) {
        let control = this.inputsForm.get(input.name) as FormArray;
        control.push(new FormControl(null));
        this.cdr.detectChanges();
    }
}
