import {ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators
} from '@angular/forms';
import {Position} from '../../../../../position';
import {Subscription} from 'rxjs';
import {Marker} from '../../../../utopia-api.service';

@Component({
    selector: 'app-position-field',
    templateUrl: './position-field.component.html',
    styleUrls: ['./position-field.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PositionFieldComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: PositionFieldComponent,
            multi: true
        }
    ]
})
export class PositionFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
    readonly form: FormGroup;
    propagateChange = (_: any) => {
    };
    private subscription: Subscription;

    @Input() required: boolean = false;
    @Input() label: string = 'Position';
    @Input() hint?: string;
    @Input() isList: boolean = false;
    @Input() positionOptions: Marker[] = [];

    constructor(readonly cdr: ChangeDetectorRef) {
        this.form = new FormGroup({
            x: new FormControl(null),
            y: new FormControl(null),
            z: new FormControl(null),
        });

        this.subscription = this.form.valueChanges.subscribe(value => {
            this.propagateChange(value);
        });
    }

    ngOnInit(): void {
        if (this.required) {
            this.form.get('x').setValidators(Validators.required);
            this.form.get('y').setValidators(Validators.required);
            this.form.get('z').setValidators(Validators.required);
        }
    }

    writeValue(obj: Position): void {
        this.form.patchValue(obj);
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
        return !this.form.valid && {
            invalid: true
        };
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    applyPositionOption(option: Marker) {
        this.form.patchValue(option.position);
    }
}
