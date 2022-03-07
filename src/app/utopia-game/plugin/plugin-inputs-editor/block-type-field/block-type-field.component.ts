import { ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Position } from '../../../position';

@Component({
    selector: 'app-block-type-field',
    templateUrl: './block-type-field.component.html',
    styleUrls: ['./block-type-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BlockTypeFieldComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: BlockTypeFieldComponent,
            multi: true
        }
    ]
})
export class BlockTypeFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
    propagateChange = (_: any) => {
    };
    private subscription: Subscription;

    @Input() required: boolean = false;
    @Input() label: string = 'Position';
    @Input() hint?: string;
    @Input() blockTypes: string[] = [];
    @Input() isList: boolean = false;

    formControl = new FormControl(null);
    selectedColor = '#000000';

    readonly COLOR_BLOCK = 'Color Block';

    constructor(readonly cdr: ChangeDetectorRef) {
        this.subscription = this.formControl.valueChanges.subscribe(() => this.updateValue());
    }

    ngOnInit(): void {
        if (this.required) {
            this.formControl.setValidators(Validators.required);
        }
    }

    updateValue() {
        if (this.formControl.value === this.COLOR_BLOCK) {
            this.propagateChange(this.selectedColor);
        } else {
            this.propagateChange(this.formControl.value);
        }
    }

    writeValue(type: string): void {
        if (type != null && type.startsWith('#')) {
            this.selectedColor = type;
            this.formControl.setValue(this.COLOR_BLOCK);
        } else {
            this.formControl.setValue(type);
        }
        this.cdr.detectChanges();
    }

    registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
    }

    validate({ value }: FormControl) {
        return !this.formControl.valid && {
            invalid: true
        };
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
