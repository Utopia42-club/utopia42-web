import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {PluginInput} from "../../../../plugin-input";

@Component({
    selector: 'app-text-input-field',
    templateUrl: './text-input-field.component.html',
    styleUrls: ['./text-input-field.component.scss']
})
export class TextInputFieldComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() control: FormControl;

    constructor() {
    }

    ngOnInit(): void {
        console.log(this.control);
    }

}
