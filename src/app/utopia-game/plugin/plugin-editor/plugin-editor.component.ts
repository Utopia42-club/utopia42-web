import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from '../../../loading.service';
import { AuthService } from '../../../auth.service';
import { PluginService } from '../plugin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-plugin-editor',
    templateUrl: './plugin-editor.component.html',
    styleUrls: ['./plugin-editor.component.scss']
})
export class PluginEditorComponent implements OnInit {
    form: FormGroup;

    constructor(readonly loadingService: LoadingService,
                readonly dialogRef: MatDialogRef<PluginEditorComponent>,
                @Inject(MAT_DIALOG_DATA) readonly pluginId: number,
                readonly pluginService: PluginService,
                readonly toaster: ToastrService) {
        this.form = new FormGroup({
            id: new FormControl(),
            name: new FormControl(null, [Validators.required]),
            walletId: new FormControl(null),
            scriptUrl: new FormControl('https://raw.githubusercontent.com/Navid-Fkh/utopia42-sample-scripts/main/BigBlockBuilder.js', [Validators.required]),
            descriptorUrl: new FormControl('https://raw.githubusercontent.com/Navid-Fkh/utopia42-sample-scripts/main/BigBlockBuilderInputs.json')
        });
        if (pluginId != null) {
            this.loadingService.prepare(
                this.pluginService.get(pluginId)
            ).subscribe(value => {
                this.form.patchValue(value);
            });
        }
    }

    ngOnInit(): void {
    }

    save() {
        if (this.form.value.id != null) {
            this.pluginService.update(this.form.value)
                .subscribe(value => {
                    this.toaster.success('Plugin updated successfully');
                    this.dialogRef.close(this.form.value);
                });
        } else {
            this.pluginService.create(this.form.value).subscribe(value => {
                this.toaster.success('Plugin created successfully');
                this.form.patchValue(value);
                this.dialogRef.close(this.form.value);
            });
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
