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
    type: string = 'generalSearch';

    stringFilter = new FormControl();

    numberFilter = new FormControl();

    propagateChange = (_: any) => {
    };
    private subscription = new Subscription();

    constructor() {
        this.subscription.add(merge(this.stringFilter.valueChanges, this.numberFilter.valueChanges)
            .subscribe(() => this.updateValue()));
    }

    ngOnInit(): void {
    }

    private updateValue() {
        if (this.type === 'generalSearch') {
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
                    [this.type]: value
                });
            }
        }
    }

    getStringSearchTerm(): string {
        let searchTerm = this.stringFilter.value;
        return (searchTerm && searchTerm.trim().length > 0) ? searchTerm.trim() : null;
    }

    isNumberType(): boolean {
        return this.type === 'id';
    }

    writeValue(value: any): void {
        if (value) {
            if (value.generalSearch) {
                this.setValue(null, value.generalSearch);
            } else {
                let keys = Object.keys(value);
                if (keys.length > 0) {
                    this.type = keys[0];
                    if (this.isNumberType()) {
                        this.setValue(value[this.type], null);
                    } else {
                        this.setValue(null, value[this.type]);
                    }
                } else {
                    this.type = 'generalSearch';
                    this.setValue(null, null);
                }
            }
        } else {
            this.type = 'generalSearch';
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
