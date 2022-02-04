import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PluginParameter, PluginService } from '../plugin.service';
import { MatDialogRef } from '@angular/material/dialog';
import { UtopiaApiService } from '../utopia-api.service';
import { MatStepper } from '@angular/material/stepper';

@Component({
    selector: 'app-plugin-dialog',
    templateUrl: './plugin-dialog.component.html',
    styleUrls: ['./plugin-dialog.component.scss'],
    providers: [PluginService, UtopiaApiService, MatStepper]
})
export class PluginDialogComponent implements OnInit {
    form: FormGroup;
    @ViewChild('stepper', { static: true }) stepper!: MatStepper;

    script?: string;

    inputs?: PluginParameter[];
    inputsForm?: FormGroup;

    constructor(readonly pluginService: PluginService, readonly dialogRef: MatDialogRef<PluginDialogComponent>) {
        this.form = new FormGroup({
            scriptUrl: new FormControl('https://raw.githubusercontent.com/Navid-Fkh/utopia42-sample-scripts/main/BigBlockBuilder.js', [Validators.required]),
            inputsUrl: new FormControl('https://raw.githubusercontent.com/Navid-Fkh/utopia42-sample-scripts/main/BigBlockBuilderInputs.json')
        });
    }

    ngOnInit(): void {
        console.log(this.stepper);
    }

    runPlugin() {
        this.pluginService.getFile(this.form.value.scriptUrl)
            .subscribe(code => {
                this.dialogRef.close(code);
            });
    }

    cancel() {
        this.dialogRef.close();
    }

    isNextDisabled(): boolean {
        let b = false;
        if (!this.stepper) {
            return false;
        } else if (this.stepper.selectedIndex == 0) {
            b = !this.form.valid;
        } else if (this.stepper.selectedIndex == 1) {
            b = this.inputsForm == null || !this.inputsForm.valid;
        }
        return b || this.stepper.selectedIndex == this.stepper.steps.length - 1;
    }

    isPrevDisabled(): boolean {
        if (!this.stepper) {
            return false;
        }
        return this.stepper.selectedIndex == 0;
    }

    prevClicked() {
        if (this.stepper.selectedIndex == 1) {
            this.inputs = undefined;
            this.script = undefined;
        }
        this.stepper.selected!.completed = false;
        this.stepper.steps.get(this.stepper.selectedIndex - 1)!.completed = false;
        this.stepper.previous();
    }

    nextClicked() {
        if (this.stepper.selectedIndex == 0) {
            let value = this.form.value;
            this.pluginService.getFile(value.scriptUrl.trim())
                .subscribe(script => {
                    this.script = script;
                    if (value.inputsUrl != null && value.inputsUrl.trim().length != 0) {
                        this.pluginService.getFile(value.inputsUrl.trim())
                            .subscribe(inputs => {
                                this.inputs = JSON.parse(inputs);
                                this.inputs.forEach((input, index) => {
                                    input.key = `input_${index}`;
                                });
                                this.inputsForm = this.toFormGroup(this.inputs);
                                this.nextStep();
                            });
                    } else {
                        this.nextStep();
                    }
                });
        }
        if (this.stepper.selectedIndex == 1) {

        } else {
            this.nextStep();
        }
    }

    private nextStep() {
        this.stepper.selected!.completed = true;
        this.stepper.next();
    }

    toFormGroup(params: PluginParameter[]) {
        const group: any = {};
        params.forEach(param => {
            group[param.key] = param.required ? new FormControl(param.value || null, Validators.required)
                : new FormControl(param.value || null);
        });
        return new FormGroup(group);
    }
}
