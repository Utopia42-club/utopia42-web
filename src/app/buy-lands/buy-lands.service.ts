import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Land } from '../ehtereum/models';
import { BuyLandValidation } from './buy-land-validation';

@Injectable({
    providedIn: 'root',
})
export class BuyLandsService {
    readonly endpoint = 'http://app.utopia42.club:5025';

    constructor(private httpClient: HttpClient) {}

    public validate(land: Land): Observable<BuyLandValidation> {
        return this.httpClient.post<any>(
            this.endpoint + `/land/validateForBuy`,
            JSON.stringify(land),
            {headers: new HttpHeaders().set('Content-Type','application/json')}
        );
    }
}


