import { Injectable } from '@angular/core';
import { Configurations } from "../configurations";
import { Observable } from "rxjs";
import { MetaverseContract } from "./metaverse-contract";
import { HttpClient } from "@angular/common/http";
import { shareReplay } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class MultiverseService
{
    private lastRequest: {
        networkId: number,
        contract: string,
        result: Observable<MetaverseContract>
    };

    constructor(private httpClient: HttpClient)
    {
    }

    public getContract(networkId: number, contract: string): Observable<MetaverseContract>
    {
        if (this.lastRequest != null && this.lastRequest.networkId == networkId
            && this.lastRequest.contract == contract) {
            console.log("returning last request!");
            return this.lastRequest.result;
        }
        console.log("Creating for new contract");
        this.lastRequest = {
            networkId, contract,
            result: this.httpClient.get<MetaverseContract>(`${Configurations.Instance.apiURL}/world/contracts/${networkId}/${contract}`)
                .pipe(shareReplay(1))
        };
        return this.lastRequest.result;
    }
}
