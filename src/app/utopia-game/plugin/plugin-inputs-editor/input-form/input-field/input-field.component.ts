import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {PluginInput, PluginInputFormDescriptor} from "../../../plugin-input";

@Component({
    selector: 'app-input-field',
    templateUrl: './input-field.component.html',
    styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() control: FormControl | FormGroup;
    @Input() inputsForm: FormGroup;

    type: string;
    descriptor: PluginInputFormDescriptor;
    formGroup?: FormGroup;
    formControl?: FormControl;

    constructor() {
    }

    ngOnInit(): void {
        if (typeof this.input.type == "string") {
            this.type = this.input.type;
            this.formControl = this.control as FormControl;
        } else {
            this.type = "nested";
            this.descriptor = this.input.type;
            this.formGroup = this.control as FormGroup;
        }
    }

}
