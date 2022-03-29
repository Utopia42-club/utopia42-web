import {Component, Input, OnInit} from '@angular/core';
import {PluginInput} from "../../../../plugin-input";
import {AbstractControl, FormControl} from "@angular/forms";

@Component({
    selector: 'app-selection-input-field',
    templateUrl: './selection-input-field.component.html',
    styleUrls: ['./selection-input-field.component.scss']
})
export class SelectionInputFieldComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() control: FormControl;

    constructor() {
    }

    ngOnInit(): void {
    }

}
