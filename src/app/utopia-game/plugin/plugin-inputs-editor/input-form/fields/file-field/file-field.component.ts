import {ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-file-field',
    templateUrl: './file-field.component.html',
    styleUrls: ['./file-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileFieldComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: FileFieldComponent,
            multi: true
        }
    ]
})
export class FileFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
    propagateChange = (_: any) => {
    };
    private subscription: Subscription;

    @Input() required: boolean = false;
    @Input() label: string = 'File';
    @Input() hint?: string;

    formControl = new FormControl(null);

    constructor(readonly cdr: ChangeDetectorRef) {
        this.subscription = this.formControl.valueChanges.subscribe(() => this.updateValue());
    }

    ngOnInit(): void {
        if (this.required) {
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
