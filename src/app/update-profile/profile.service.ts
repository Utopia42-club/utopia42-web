import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from './update-profile.component';
import { Configurations } from '../configurations';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    readonly endpoint = Configurations.SERVER_URL;

    constructor(private httpClient: HttpClient) {
    }

    public setProfile(profile: Profile): Observable<any> {
        return this.httpClient.post<any>(
            this.endpoint + `/profile/set`,
            JSON.stringify(profile),
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public setAvatar(imageFile: File, walletId: string): Observable<any> {
        const formData = new FormData();
        formData.set('wallet', walletId);
        formData.set('avatar', imageFile);
        return this.httpClient.post<any>(
            this.endpoint + `/profile/set/avatar`,
            formData
        );
    }

    public getAvatar(imageUrl: string): Observable<any> {
        return this.httpClient.get<any>(
            this.endpoint + `/profile/avatar/${imageUrl}`,
            { responseType: 'blob' as 'json' }
        );
    }

    public getProfile(walletId: string): Observable<Profile> {
        return this.httpClient.post<any>(
            this.endpoint + `/profile`,
            walletId,
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }
}


