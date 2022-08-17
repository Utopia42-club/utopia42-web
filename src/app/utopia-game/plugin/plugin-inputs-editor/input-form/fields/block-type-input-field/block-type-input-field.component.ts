import {Component, Input, OnInit} from '@angular/core';
import {PluginInput} from "../../../../plugin-input";
import {FormControl} from "@angular/forms";
import {PluginInputsService} from "../../../plugin-inputs.service";

@Component({
    selector: 'app-block-type-input-field',
    templateUrl: './block-type-input-field.component.html',
    styleUrls: ['./block-type-input-field.component.scss']
})
export class BlockTypeInputFieldComponent implements OnInit {
    @Input() input: PluginInput;
    @Input() control: FormControl;

    constructor(readonly service: PluginInputsService) {
    }

    ngOnInit(): void {
    }

}
