import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subscription } from 'rxjs';

@Component({
    selector: 'app-plugin-search-bar',
    templateUrl: './plugin-search-bar.component.html',
    styleUrls: ['./plugin-search-bar.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PluginSearchBarComponent),
            multi: true
        },
    ]
})
export class PluginSearchBarComponent implements OnInit, OnDestroy, ControlValueAccessor {

    stringFilter = new FormControl();
    typeControl = new FormControl('generalSearch');

    numberFilter = new FormControl();

    propagateChange = (_: any) => {
    };
    private subscription = new Subscription();

    constructor() {
        this.subscription.add(merge(this.stringFilter.valueChanges, this.numberFilter.valueChanges, this.typeControl.valueChanges)
            .subscribe(() => this.updateValue()));
    }

    ngOnInit(): void {
    }

    private updateValue() {
        if (this.typeControl.value === 'generalSearch') {
            let value = this.getStringSearchTerm();
            if (value == null) {
                this.propagateChange(null);
            } else {
                this.propagateChange({
                    generalSearch: value
                });
            }
        } else {
            let value = this.isNumberType() ? this.numberFilter.value : this.getStringSearchTerm();
            if (value == null) {
                this.propagateChange(null);
            } else {
                this.propagateChange({
                    [this.typeControl.value]: value
                });
            }
        }
    }

    getStringSearchTerm(): string {
        let searchTerm = this.stringFilter.value;
        return (searchTerm && searchTerm.trim().length > 0) ? searchTerm.trim() : null;
    }

    isNumberType(): boolean {
        return this.typeControl.value === 'id';
    }

    writeValue(value: any): void {
        if (value) {
            if (value.generalSearch) {
                this.setValue(null, value.generalSearch);
            } else {
                let keys = Object.keys(value);
                if (keys.length > 0) {
                    this.typeControl.setValue(keys[0]);
                    if (this.isNumberType()) {
                        this.setValue(value[this.typeControl.value], null);
                    } else {
                        this.setValue(null, value[this.typeControl.value]);
                    }
                } else {
                    this.typeControl.setValue('generalSearch');
                    this.setValue(null, null);
                }
            }
        } else {
            this.typeControl.setValue('generalSearch');
            this.setValue(null, null);
        }
    }

    private setValue(numberValue: number, stringValue: string) {
        this.numberFilter.setValue(numberValue);
        this.stringFilter.setValue(stringValue);
    }

    registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}
