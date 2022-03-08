import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configurations } from '../../configurations';
import { Plugin } from './Plugin';
import { SearchCriteria } from './SearchCriteria';

@Injectable({
    providedIn: 'root',
})
export class PluginService {
    readonly endpoint = Configurations.SERVER_URL + '/plugins';

    constructor(private httpClient: HttpClient) {

    }

    public getFile(url: string): Observable<string> {
        return this.httpClient.get(url, { responseType: 'text' });
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

    public getPluginsOfUser(searchCriteria: SearchCriteria): Observable<Plugin[]> {
        return this.httpClient.post<Plugin[]>(this.endpoint + `/of-user`, searchCriteria);
    }

    public getPluginsForUser(searchCriteria: SearchCriteria): Observable<Plugin[]> {
        return this.httpClient.post<Plugin[]>(this.endpoint + `/for-user`, searchCriteria);
    }

    public getInstalledPlugins(searchCriteria: SearchCriteria, complement: boolean = false): Observable<Plugin[]> {
        return this.httpClient.post<Plugin[]>(this.endpoint + `/installed`, searchCriteria, {
            params: { complement: complement.toString() }
        });
    }

    public installPlugin(pluginId: number): Observable<void> {
        return this.httpClient.get<void>(this.endpoint + `/installed/${pluginId}/add`);
    }

    public uninstallPlugin(pluginId: number): Observable<void> {
        return this.httpClient.get<void>(this.endpoint + `/installed/${pluginId}/remove`);
    }

    public getAll(searchCriteria: SearchCriteria): Observable<Plugin[]> {
        return this.httpClient.post<Plugin[]>(this.endpoint + `/`, searchCriteria);
    }

    public delete(id: number): Observable<void> {
        return this.httpClient.delete<void>(this.endpoint + `/${id}`);
    }

}
