import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Configurations } from './configurations';
import { concatMap, map, switchMap, tap } from 'rxjs/operators';
import { Web3Service } from './ehtereum/web3.service';
import { UtopiaError } from './UtopiaError';

export const AUTH_STORAGE_KEY = 'AUTH_STORAGE_KEY';
export const TOKEN_HEADER_KEY = 'X-Auth-Token';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    readonly endpoint = Configurations.SERVER_URL;

    constructor(private httpClient: HttpClient, readonly web3Service: Web3Service) {
    }

    public requestNonce(chainId: string, walletId: string): Observable<any> {
        return this.httpClient.post<any>(
            this.endpoint + `/auth/nonce/${chainId}`,
            walletId,
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public login(walletId: string, signature: string): Observable<any> {
        const formData = new FormData();
        formData.set('walletId', walletId);
        formData.set('signature', signature);
        return this.httpClient.post<any>(
            this.endpoint + '/login',
            formData,
            {
                observe: 'response'
            }
        );
    }

    public getAuthToken(): Observable<string> {
        const authToken = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authToken != null) {
            return of(authToken);
        }
        let provider;
        return this.web3Service.connect()
            .pipe(switchMap(value => {
                if (!value) {
                    return throwError(new UtopiaError('Connection to MetaMask failed'));
                } else {
                    return this.web3Service.getProvider()
                        .pipe(
                            concatMap((p) => {
                                provider = p;
                                if (p.selectedAddress == null) {
                                    return throwError('No provider found');
                                }
                                return this.requestNonce(
                                    provider.networkVersion,
                                    provider.selectedAddress.toLowerCase()
                                );
                            }),

                            concatMap((data) => {
                                return provider.request({
                                    method: 'eth_signTypedData_v4',
                                    params: [
                                        provider.selectedAddress.toLowerCase(),
                                        JSON.stringify(data),
                                    ],
                                    from: provider.selectedAddress.toLowerCase(),
                                });
                            }),

                            concatMap((signature) => {
                                return this.login(
                                    provider.selectedAddress,
                                    <string> signature
                                );
                            }),

                            map((res) => {
                                return res.headers.get('X-Auth-Token');
                            }),

                            tap((token) => {
                                localStorage.setItem(AUTH_STORAGE_KEY, token);
                            })
                        );
                }
            }));
    }
}


