import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from './edit-profile.component';
import { Configurations } from '../configurations';

@Injectable({
    providedIn: 'root',
})
export class ProfileService
{
    readonly endpoint = Configurations.Instance.apiURL + "/profile";

    constructor(private httpClient: HttpClient)
    {
    }

    public setProfile(profile: Profile): Observable<any>
    {
        return this.httpClient.post<any>(
            this.endpoint + `/set`,
            JSON.stringify(profile),
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public setProfileImage(imageFile: File, walletId: string): Observable<any>
    {
        const formData = new FormData();
        formData.set('wallet', walletId);
        formData.set('image', imageFile);
        return this.httpClient.post<any>(
            this.endpoint + `/set/image`,
            formData
        );
    }

    public unsetProfileImage(walletId: string): Observable<void>
    {
        const formData = new FormData();
        formData.set('wallet', walletId);
        return this.httpClient.post<any>(
            this.endpoint + `/set/image/remove`,
            formData
        );
    }

    public getProfileImage(imageUrl: string): Observable<any>
    {
        return this.httpClient.get<any>(
            this.endpoint + `/image/${imageUrl}`,
            { responseType: 'blob' as 'json' }
        );
    }

    public getProfile(walletId: string): Observable<Profile>
    {
        return this.httpClient.post<any>(
            this.endpoint,
            walletId,
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public getCurrentProfile(): Observable<Profile>
    {
        return this.httpClient.get<any>(this.endpoint + `/current`);
    }
}


