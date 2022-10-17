import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { UtopiaBridgeService } from "./utopia-bridge.service";

@Injectable()
export class LivekitService implements OnDestroy
{
    private contractSubscription: Subscription;

    constructor(private readonly http: HttpClient,
                private readonly bridge:UtopiaBridgeService)
    {
    }

    start(contract$: Observable<{ network: number, address: string, wallet: string }>)
    {
        this.contractSubscription = contract$.subscribe(session => {
            //TODO
            // this.http.post()
        });
    }

    ngOnDestroy()
    {
        this.contractSubscription?.unsubscribe();
    }
}
