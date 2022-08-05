import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { APP_INITIALIZER, InjectionToken, Optional, Provider } from "@angular/core";
import { of, throwError } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ExceptionDialogContentComponent } from "./exception-dialog-content/exception-dialog-content.component";

export const ENV_FILE_LOCATION = new InjectionToken("ENV_FILE_LOCATION");

export class Configurations
{
    private static _instance: Configurations;

    public static get Instance(): Configurations
    {
        return Configurations._instance;
    }

    private static set Instance(instance: Configurations)
    {
        Configurations._instance = instance;
    }

    public readonly pluginsRepoPrefix: string;
    public readonly avatarDesignerURL: string;
    public readonly apiURL: string;
    public readonly wsServerURL: string;
    public readonly webAppBaseURL: string;
    public readonly ipfsServerURL: string;

    private constructor(params: {
        pluginsRepoPrefix: string, avatarDesignerURL: string, apiURL: string,
        wsServerURL: string, webAppBaseURL: string, ipfsServerURL: string
    })
    {
        this.pluginsRepoPrefix = params.pluginsRepoPrefix;
        this.avatarDesignerURL = params.avatarDesignerURL;
        this.apiURL = params.apiURL;
        this.wsServerURL = params.wsServerURL;
        this.webAppBaseURL = params.webAppBaseURL;
        this.ipfsServerURL = params.ipfsServerURL;
    }

    static initEnv(http: HttpClient, dialog: MatDialog, envFileLocation: string)
    {
        return () => http.get<any>(envFileLocation ?? "/assets/env/env.json")
            .pipe(
                tap(env => {
                    Configurations.Instance = new Configurations(env);
                }),
                catchError(e => {
                    dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to load env.json!" } })
                    console.error(e);
                    return throwError(e);
                })
            ).toPromise();
    }

    static providers(): Provider[]
    {
        return [
            {
                provide: APP_INITIALIZER,
                useFactory: Configurations.initEnv,
                deps: [HttpClient, MatDialog, [new Optional(), ENV_FILE_LOCATION]],
                multi: true
            }
        ];
    }
}
