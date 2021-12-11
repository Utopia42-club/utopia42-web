import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from './update-profile.component';
import { Configurations } from "../configurations";

@Injectable({
    providedIn: 'root',
})
export class ProfileService
{
    readonly endpoint = Configurations.SERVER_URL;

    constructor(private httpClient: HttpClient)
    {
    }

    public setProfile(profile: Profile, authToken: string): Observable<any>
    {
        return this.httpClient.post<any>(
            this.endpoint + `/profile/set`,
            JSON.stringify(profile),
            { headers: new HttpHeaders().set('Content-Type', 'application/json').set("X-Auth-Token", authToken) }
        );
    }

    public setAvatar(imageFile: File, walletId: string, authToken: string): Observable<any>
    {
        const formData = new FormData();
        formData.set('wallet', walletId);
        formData.set('avatar', imageFile);
        return this.httpClient.post<any>(
            this.endpoint + `/profile/set/avatar`,
            formData,
            { headers: new HttpHeaders().set("X-Auth-Token", authToken) }
        );
    }

    public getAvatar(imageUrl: string): Observable<any>
    {
        return this.httpClient.get<any>(
            this.endpoint + `/profile/avatar/${imageUrl}`,
            { responseType: 'blob' as 'json' }
        );
    }

    public getProfile(walletId: string): Observable<Profile>
    {
        return this.httpClient.post<any>(
            this.endpoint + `/profile`,
            walletId,
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
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
}


