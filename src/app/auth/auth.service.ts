import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Configurations } from '../configurations';
import { catchError, concatMap, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Web3Service } from '../ehtereum/web3.service';
import { ProfileService } from "../edit-profile/profile.service";
import { AuthDetails } from "./auth-details";

export const TOKEN_HEADER_KEY = 'X-Auth-Token';

@Injectable({
    providedIn: 'root',
})
export class AuthService
{
    readonly endpoint = Configurations.SERVER_URL;
    private currentGameSession: { walletId: string, isGuest: boolean };
    private tokenObservable: Observable<string>;
    private loadingToken = false;

    constructor(private httpClient: HttpClient, readonly web3Service: Web3Service,
                readonly profileService: ProfileService)
    {
    }

    public updateSession(session: { walletId: string, isGuest: boolean }): void
    {
        this.currentGameSession = session;
        if (session.isGuest)
            this.removeCachedAuthToken();
        else {
            const cached = this.getCachedAuth();
            if (cached != null && cached.walletId?.toLowerCase() != session.walletId?.toLowerCase())
                this.removeCachedAuthToken();
        }
    }

    public isGuestSession(): boolean
    {
        return this.currentGameSession?.isGuest ?? true;
    }

    public requestNonce(chainId: string, walletId: string): Observable<any>
    {
        return this.httpClient.post<any>(
            this.endpoint + `/auth/nonce/${chainId}`,
            walletId,
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public login(walletId: string, signature: string): Observable<any>
    {
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

    public removeCachedAuthToken(): void
    {
        AuthDetails.removeFromStorage();
    }

    public getCachedAuth(): AuthDetails
    {
        const auth = AuthDetails.loadFromStorage();
        if (auth == null || this.currentGameSession == null) return auth;

        if (this.currentGameSession.isGuest || auth.walletId != this.currentGameSession.walletId) {
            AuthDetails.removeFromStorage();
            return null;
        }
        return auth;
    }

    public getAuthToken(forceValid: boolean = false): Observable<string>
    {
        if (this.loadingToken)
            return this.tokenObservable;
        const authToken = this.getCachedAuth()?.token;
        if (authToken != null) {
            if (forceValid) {
                this.loadingToken = true;
                this.tokenObservable = this.validateToken()
                    .pipe(switchMap(v =>
                            v ? of(this.getCachedAuth()!.token) : this.doGetAuthToken()
                        ), tap(v => this.loadingToken = false),
                        shareReplay(1));
                return this.tokenObservable;
            } else {
                this.tokenObservable = of(authToken);
                return this.tokenObservable;
            }
        }
        this.loadingToken = true;
        this.tokenObservable = this.doGetAuthToken();
        return this.tokenObservable;
    }

    private validateToken(): Observable<boolean>
    {
        return this.profileService.getCurrentProfile()
            .pipe(
                map((profile) => true),
                catchError((err) => {
                    if (err instanceof HttpErrorResponse) {
                        if (err.status === 401)
                            return of(false);
                        if (err.status == 404)
                            return of(true);
                        return throwError(err);
                    } else
                        return throwError(err);
                }));
    }

    private doGetAuthToken(): Observable<string>
    {
        if (this.currentGameSession.isGuest === true)
            return throwError('Cannot perform authentication in guest mode');
        let provider;
        let walletId = this.currentGameSession?.walletId;
        this.loadingToken = true;
        return this.web3Service.connect({ wallet: walletId, openDialogIfFailed: true })
            .pipe(switchMap(connected => {
                if (!connected) {
                    return of(null);
                } else {
                    return this.web3Service.provider()
                        .pipe(
                            concatMap((p) => {
                                provider = p;
                                if (p.selectedAddress == null)
                                    return throwError('No provider found');
                                if (walletId != null && walletId.toLowerCase() != p.selectedAddress.toLowerCase())
                                    return throwError('Wrong wallet selected! select: ' + walletId);

                                walletId = (walletId ?? p.selectedAddress).toLowerCase();
                                return this.requestNonce(provider.networkVersion, walletId);
                            }),
                            concatMap((data) => provider.request({
                                method: 'eth_signTypedData_v4',
                                params: [walletId, JSON.stringify(data)],
                                from: walletId,
                            })),
                            concatMap((signature) => this.login(walletId, <string>signature)),
                            map((res) => res.headers.get('X-Auth-Token')),
                            tap((token) => {
                                new AuthDetails(walletId, token).saveToStorage();
                                this.loadingToken = false;
                            })
                        );
                }
            }));
    }

}


