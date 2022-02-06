import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configurations } from '../../configurations';
import { Plugin } from './Plugin';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    readonly endpoint = Configurations.SERVER_URL;

    constructor(private httpClient: HttpClient) {
    }

    public create(plugin: Plugin, authToken: string): Observable<Plugin> {
        return this.httpClient.post<Plugin>(this.endpoint + `/create`, JSON.stringify(plugin),
            { headers: new HttpHeaders().set('Content-Type', 'application/json').set('X-Auth-Token', authToken) }
        );
    }

    public update(plugin: Plugin, authToken: string): Observable<void> {
        return this.httpClient.post<void>(this.endpoint + `/update`, JSON.stringify(plugin),
            { headers: new HttpHeaders().set('Content-Type', 'application/json').set('X-Auth-Token', authToken) }
        );
    }

    public get(id: number, authToken: string): Observable<Plugin> {
        return this.httpClient.get<Plugin>(this.endpoint + `/${id}`,
            { headers: new HttpHeaders().set('X-Auth-Token', authToken) }
        );
    }

    public getPluginsForUser(authToken: string): Observable<Plugin[]> {
        return this.httpClient.get<Plugin[]>(this.endpoint + `/`,
            { headers: new HttpHeaders().set('X-Auth-Token', authToken) }
        );
    }

    public delete(id: number, authToken: string): Observable<void> {
        return this.httpClient.delete<void>(this.endpoint + `/${id}`,
            { headers: new HttpHeaders().set('X-Auth-Token', authToken) }
        );
    }


}


