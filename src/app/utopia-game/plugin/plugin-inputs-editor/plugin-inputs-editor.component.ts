import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LoadingService} from '../../../loading/loading.service';
import {Plugin} from '../Plugin';
import {Web3Service} from '../../../ehtereum/web3.service';
import {PluginInputsService} from "./plugin-inputs.service";
import {FormGroup} from "@angular/forms";
import {PluginInputFormDescriptor} from "../plugin-input";
import {PluginInputFormGroup} from "./input-form/PluginInputFormGroup";

@Component({
    selector: 'app-plugin-inputs-editor',
    templateUrl: './plugin-inputs-editor.component.html',
    styleUrls: ['./plugin-inputs-editor.component.scss'],
    providers: [PluginInputsService]
})
export class PluginInputsEditor implements OnInit, AfterViewInit {
    readonly plugin: Plugin;
    readonly formDescriptor: PluginInputFormDescriptor;
    readonly inputsForm: FormGroup;
    inputsValid: boolean = false;

    constructor(readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginInputsEditor>, @Inject(MAT_DIALOG_DATA) readonly data: any,
                readonly web3Service: Web3Service, readonly cdr: ChangeDetectorRef) {

        if (data.plugin == null || data.descriptor == null) {
            throw new Error('Plugin/Descriptor is required');
        }
        this.plugin = data.plugin;
        this.formDescriptor = data.descriptor
        this.inputsForm = new PluginInputFormGroup(data.descriptor, data.cachedInputs);
    }

    ngAfterViewInit(): void {
        this.inputsValid = this.inputsForm.valid;
        this.inputsForm.statusChanges.subscribe(s => {
            this.inputsValid = s == "VALID";
            this.cdr.detectChanges();
        });
        this.cdr.detectChanges();
    }


    ngOnInit(): void {
    }


    submit() {
        this.dialogRef.close({
            inputs: this.inputsForm?.value
        });
    }

    cancel() {
        this.dialogRef.close();
    }
}
