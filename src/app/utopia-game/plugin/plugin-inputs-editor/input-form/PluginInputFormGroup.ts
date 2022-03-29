import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {PluginInput, PluginInputFormDescriptor, PluginInputType} from "../../plugin-input";

export class PluginInputFormGroup extends FormGroup {
    constructor(descriptor: PluginInputFormDescriptor, initialValues: any = {}) {
        const group: any = {};
        const getCachedValue = (name: string) => initialValues != null ? initialValues[name] : null;
        descriptor.inputs.forEach(input => {
            group[input.name] = PluginInputFormGroup.createControlForInput(input, getCachedValue(input.name));
        });
        super(group);
    }

    public static createControlForInput(input: PluginInput, defaultValue: any): AbstractControl {
        let formControl: AbstractControl;
        if (input.isList) {
            if (defaultValue != null || input.defaultValue != null) {
                formControl = new FormArray((defaultValue ?? input.defaultValue).map(value =>
                    PluginInputFormGroup.createControlForType(input.type, value)));
            } else {
                formControl = new FormArray([PluginInputFormGroup.createControlForType(input.type, null)]);
            }
        } else {
            formControl = PluginInputFormGroup.createControlForType(input.type, defaultValue ?? input.defaultValue ?? null);
        }
        if (input.required) {
            formControl.setValidators([Validators.required]);
        }
        return formControl;
    }

    public static createControlForType(type: PluginInputType, defaultValue: any): AbstractControl {
        if (typeof type == "string")
            return new FormControl(defaultValue);
        return new PluginInputFormGroup(type, defaultValue);
    }
}
