import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import {PluginInput} from "../../../../plugin-input";

@Component({
    selector: 'app-number-input-field',
    templateUrl: './number-input-field.component.html',
    styleUrls: ['./number-input-field.component.scss']
})
export class NumberInputFieldComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() control: FormControl;

    constructor() {
    }

    ngOnInit(): void {
    }

}
