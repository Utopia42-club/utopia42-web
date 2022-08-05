import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Land } from '../ehtereum/models';
import { BuyLandValidation } from './buy-land-validation';
import { Configurations } from "../configurations";

@Injectable({
    providedIn: 'root',
})
export class BuyLandsService
{
    readonly endpoint = Configurations.Instance.apiURL;

    constructor(private httpClient: HttpClient)
    {
    }

    public validate(land: Land, network: number, contract: string): Observable<BuyLandValidation>
    {
        return this.httpClient.post<any>(
            `${this.endpoint}/land/validateForBuy`,
            JSON.stringify(land),
            {
                headers: new HttpHeaders().set('Content-Type', 'application/json'),
                params: { network, contract }
            }
        );
    }
}
