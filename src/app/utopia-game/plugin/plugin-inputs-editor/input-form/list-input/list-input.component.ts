import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {PluginInput} from "../../../plugin-input";
import {AbstractControl, FormArray, FormGroup} from "@angular/forms";
import {PluginInputFormGroup} from "../PluginInputFormGroup";

@Component({
    selector: 'app-list-input',
    templateUrl: './list-input.component.html',
    styleUrls: ['./list-input.component.scss']
})
export class ListInputComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() inputsForm: FormGroup;
    @Input() control: FormArray;

    constructor(readonly cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    removeListItem(input: PluginInput, formControl: AbstractControl) {
        let control = this.inputsForm.get(input.name) as FormArray;
        control.removeAt(control.controls.indexOf(formControl));
        this.cdr.detectChanges();
    }

    addListItem(input: PluginInput) {
        let control = this.inputsForm.get(input.name) as FormArray;
        control.push(PluginInputFormGroup.createControlForType(input.type, null));
        this.cdr.detectChanges();
    }
}
