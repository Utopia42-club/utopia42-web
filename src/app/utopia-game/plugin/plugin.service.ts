import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configurations } from '../../configurations';
import { Plugin } from './Plugin';

@Injectable({
    providedIn: 'root',
})
export class PluginService {
    readonly endpoint = Configurations.SERVER_URL + '/plugins';

    constructor(private httpClient: HttpClient) {

    }

    public create(plugin: Plugin): Observable<Plugin> {
        return this.httpClient.post<Plugin>(this.endpoint + `/create`, JSON.stringify(plugin),
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public update(plugin: Plugin): Observable<void> {
        return this.httpClient.post<void>(this.endpoint + `/update`, JSON.stringify(plugin),
            { headers: new HttpHeaders().set('Content-Type', 'application/json') }
        );
    }

    public get(id: number): Observable<Plugin> {
        return this.httpClient.get<Plugin>(this.endpoint + `/${id}`);
    }

    public getPluginsForUser(): Observable<Plugin[]> {
        return this.httpClient.get<Plugin[]>(this.endpoint + `/`);
    }

    public delete(id: number): Observable<void> {
        return this.httpClient.delete<void>(this.endpoint + `/${id}`);
    }

}


