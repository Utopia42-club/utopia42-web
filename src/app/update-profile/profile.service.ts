import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    map,
    switchMap,
} from 'rxjs/operators';
import Web3 from 'web3';
import { LoadingService } from '../loading.service';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    endpoint = 'http://horizon.madreza.ir:8082';

    httpHeader = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    constructor(private httpClient: HttpClient) {}

    public requestNonce(data?: any): Observable<any> {
        return this.httpClient.post<any>(
            this.endpoint + '/auth/nonce',
            JSON.stringify(data),
            this.httpHeader
        );
    }

    public login(walletId: string, signature: string): Observable<any> {
        return this.httpClient.post<any>(
            this.endpoint + '/login',
            JSON.stringify({
                wallet: walletId,
                signature: signature,
            }),
            this.httpHeader
        );
    }
}
