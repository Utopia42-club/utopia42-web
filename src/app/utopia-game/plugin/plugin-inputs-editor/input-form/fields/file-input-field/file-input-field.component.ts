import {Component, forwardRef, Input} from '@angular/core';
import {FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR} from "@angular/forms";
import {PluginInput} from "../../../../plugin-input";

@Component({
    selector: 'app-file-input-field',
    templateUrl: './file-input-field.component.html',
    styleUrls: ['./file-input-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileInputFieldComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: FileInputFieldComponent,
            multi: true
        }
    ]
})
export class FileInputFieldComponent {
    @Input() input: PluginInput;
    @Input() control: FormControl;
}
