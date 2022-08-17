import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {PluginInput, PluginInputFormDescriptor} from "../../plugin-input";

@Component({
    selector: 'app-input-form',
    templateUrl: './input-form.component.html',
    styleUrls: ['./input-form.component.scss']
})
export class InputFormComponent implements OnInit {
    @Input()
    descriptor?: PluginInputFormDescriptor;
    @Input()
    inputsForm?: FormGroup;
    inputs?: PluginInput[];

    gridAreas: string;
    templateColumns: string;
    templateRows: string;

    constructor() {
    }

    ngOnInit(): void {
        this.prepareInputs(this.descriptor);
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
    }

    formArray(name: string): FormArray {
        return this.inputsForm.get(name) as FormArray;
    }

    control(name: string): FormControl {
        return this.inputsForm.get(name) as FormControl;
    }
}
