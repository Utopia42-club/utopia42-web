import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {PluginInput} from "../../../../plugin-input";
import {FormControl} from "@angular/forms";
import {PluginInputsService} from "../../../plugin-inputs.service";

@Component({
    selector: 'app-land-input-field',
    templateUrl: './land-input-field.component.html',
    styleUrls: ['./land-input-field.component.scss']
})
export class LandInputFieldComponent implements OnInit, OnDestroy {
    @Input() input: PluginInput;
    @Input() control: FormControl;

    private readonly subscription = new Subscription();

    constructor(readonly service: PluginInputsService) {
    }

    ngOnInit(): void {
        this.subscription.add(
            this.service.currentLand$.subscribe(land => {
                if (land != null)
                    this.control.setValue(land);
            })
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
