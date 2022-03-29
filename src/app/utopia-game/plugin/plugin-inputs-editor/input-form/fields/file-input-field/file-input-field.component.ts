import {ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
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
export class FileInputFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() input: PluginInput;
    @Input() control: FormControl;
    propagateChange = (_: any) => {
    };
    private subscription: Subscription;

    formControl = new FormControl(null);

    constructor(readonly cdr: ChangeDetectorRef) {
        this.subscription = this.formControl.valueChanges.subscribe(() => this.updateValue());
    }

    ngOnInit(): void {
        if (this.input.required) {
            this.formControl.setValidators(Validators.required);
        }
    }

    updateValue() {
        if (this.formControl.value == null || this.formControl.value.files == null || this.formControl.value.files.length == 0) {
            this.propagateChange(null);
        } else {
            this.propagateChange(this.formControl.value.files[0]);
        }
    }

    writeValue(file: File): void {
        this.formControl.setValue(file);
        this.cdr.detectChanges();
    }

    registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
    }

    validate({value}: FormControl) {
        return !this.formControl.valid && {
            invalid: true
        };
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
