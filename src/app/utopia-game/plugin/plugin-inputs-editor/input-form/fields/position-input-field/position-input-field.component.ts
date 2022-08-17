import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {PluginInput} from "../../../../plugin-input";
import {PluginInputsService} from "../../../plugin-inputs.service";

@Component({
    selector: 'app-position-input-field',
    templateUrl: './position-input-field.component.html',
    styleUrls: ['./position-input-field.component.scss']
})
export class PositionInputFieldComponent implements OnInit {
    @Input() inputsForm: FormGroup;
    @Input() input: PluginInput;
    @Input() control: FormControl;

    constructor(readonly service: PluginInputsService) {
    }

    ngOnInit(): void {
    }

}
