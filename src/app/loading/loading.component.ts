import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingService } from "./loading.service";

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements OnInit
{
    loading: boolean = false;

    constructor(readonly service: LoadingService, private readonly cdr: ChangeDetectorRef)
    {
        this.service.loading$.subscribe(loading => {
            if (loading == this.loading) return;
            this.loading = loading;
            this.cdr.detectChanges();
        });
    }

    ngOnInit(): void
    {
    }

}
