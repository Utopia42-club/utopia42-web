import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, Subject, throwError} from 'rxjs';
import {Configurations} from './configurations';
import {catchError, concatMap, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {Web3Service} from './ehtereum/web3.service';
import {UtopiaError} from './UtopiaError';
import {ProfileService} from "./update-profile/profile.service";
import {emitKeypressEvents} from "readline";

export const AUTH_STORAGE_KEY = 'AUTH_STORAGE_KEY';
export const TOKEN_HEADER_KEY = 'X-Auth-Token';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    readonly endpoint = Configurations.SERVER_URL;
    private tokenObservable: Observable<string>;
    private gettingToken = false;

    constructor(private httpClient: HttpClient, readonly web3Service: Web3Service,
                readonly profileService: ProfileService) {
    }

    public requestNonce(chainId: string, walletId: string): Observable<any> {
        return this.httpClient.post<any>(
            this.endpoint + `/auth/nonce/${chainId}`,
            walletId,
            {headers: new HttpHeaders().set('Content-Type', 'application/json')}
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

    public RemoveCachedAuthToken() {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    public getCachedToken() {
        return localStorage.getItem(AUTH_STORAGE_KEY);
    }

    public getAuthToken(forceValid: boolean = false): Observable<string> {
        if (this.gettingToken)
            return this.tokenObservable;
        const authToken = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authToken != null) {
            if (forceValid) {
                this.gettingToken = true;
                this.tokenObservable = this.profileService.getCurrentProfile()
                    .pipe(
                        map((profile) => {
                            this.gettingToken = false;
                            return authToken;
                        }),
                        catchError((err) => {
                            this.gettingToken = false;
                            if (err instanceof HttpErrorResponse) {
                                if (err.status === 401) {
                                    this.gettingToken = true;
                                    return this.doGetAuthToken();
                                } else if (err.status == 404)
                                    return of(authToken);
                                return throwError(err);
                            } else
                                return throwError(err);
                        }),
                        shareReplay(1)
                    );
                return this.tokenObservable;
            } else {
                this.tokenObservable = of(authToken);
                return this.tokenObservable;
            }
        }
        this.gettingToken = true;
        this.tokenObservable = this.doGetAuthToken();
        return this.tokenObservable;
    }

    private doGetAuthToken(): Observable<string> {
        let provider;
        return this.web3Service.connect()
            .pipe(switchMap(value => {
                if (!value) {
                    return of(null);
                } else {
                    return this.web3Service.provider()
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
                                    <string>signature
                                );
                            }),

                            map((res) => {
                                return res.headers.get('X-Auth-Token');
                            }),

                            tap((token) => {
                                localStorage.setItem(AUTH_STORAGE_KEY, token);
                                this.gettingToken = false;
                            })
                        );
                }
            }));
    }

}


