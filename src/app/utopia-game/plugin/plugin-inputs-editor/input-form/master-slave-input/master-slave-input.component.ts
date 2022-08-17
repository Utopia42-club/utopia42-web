import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {PluginInput, PluginInputType} from "../../../plugin-input";
import {AbstractControl, FormArray, FormGroup} from "@angular/forms";
import {PluginInputFormGroup} from "../PluginInputFormGroup";
import {Land} from "../../../../../ehtereum/models";

interface ColumnDescriptor {
    name: string;
    label: string;
    textProvider: (v: any) => string;
}

@Component({
    selector: 'app-master-slave-input',
    templateUrl: './master-slave-input.component.html',
    styleUrls: ['./master-slave-input.component.scss']
})
export class MasterSlaveInputComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() inputsForm: FormGroup;
    @Input() control: FormArray;
    columns: ColumnDescriptor[];
    displayedColumns: string[];
    slaveControl: AbstractControl;
    editingIndex?: number = undefined;

    constructor(readonly cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        if (typeof this.input.type == "string") {
            this.columns = [{
                name: this.input.name,
                label: this.input.label,
                textProvider: v => MasterSlaveInputComponent.formatValue(v, this.input.type)
            }];
        } else {
            this.columns = this.input.type.inputs.map(field => {
                return {
                    name: field.name,
                    label: field.label,
                    textProvider: v => MasterSlaveInputComponent.formatValue(v == null ? v : v[field.name], field.type)
                };
            });
        }
        this.displayedColumns = ["index", ...this.columns.map(c => c.name)];
    }

    removeListItem(formControl: AbstractControl) {
        this.control.removeAt(this.control.controls.indexOf(formControl));
        this.cdr.detectChanges();
    }

    get items(): any[] {
        return this.control.value;
    }

    private static formatValue(value: any, type: PluginInputType): string {
        if (value == null) return "";

        if (typeof type != "string")
            return JSON.stringify(value);

        switch (type) {
            case "text":
            case "number":
                return value;
            case "selection":
                return value?.value;
            case "position":
                return `${value.x}, ${value.y}, ${value.z}`;
            case "land":
                return `Land ${(value as Land).id}`;
            case "blockType":
                return value;
            case "file":
                return (value as File).name;
        }
    }

    submitSlave() {
        if (this.createMode)
            this.control.push(this.slaveControl);
        else
            this.control.at(this.editingIndex).setValue(this.slaveControl.value);
        this.editingIndex = null;
        this.slaveControl = null;
        this.cdr.detectChanges();
    }

    deleteSlave() {
        this.control.removeAt(this.editingIndex);
        this.slaveControl = null;
        this.editingIndex = null;
        this.cdr.detectChanges();
    }

    get createMode(): boolean {
        return this.editingIndex == null;
    }

    editRow(index: number): void {
        this.slaveControl = PluginInputFormGroup.createControlForType(this.input.type, null);
        this.slaveControl.setValue(this.control.at(index).value);
        this.editingIndex = index;
    }

    overlayClick(): void {
        this.slaveControl = null;
    }

    add() {
        this.slaveControl = PluginInputFormGroup.createControlForType(this.input.type, null);
        this.editingIndex = null;
    }

    deleteAt(i: number) {
        this.control.removeAt(i);
    }

    move(from: number, to: number) {
        if (to < 0) return;
        const row = this.control.at(from);
        this.control.removeAt(from);
        this.control.insert(to, row);
    }
}
