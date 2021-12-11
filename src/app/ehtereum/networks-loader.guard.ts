import { HttpClient } from "@angular/common/http";
import { Network } from "./network";
import { MatDialog } from "@angular/material/dialog";
import { catchError, tap } from "rxjs/operators";
import { ExceptionDialogContentComponent } from "../exception-dialog-content/exception-dialog-content.component";
import { of } from "rxjs";

export function NetsInitializer(http: HttpClient, dialog: MatDialog)
{
    return () => http.get<NetworkConfig[]>("http://app.utopia42.club/networks.json")
        .pipe(tap(nets => {
            if (nets != null) {
                for (let net of nets) {
                    Network.register(net.id, net.contractAddress, net.name, true, { provider: net.provider });
                }
            }
        }), catchError(e => {
            dialog.open(ExceptionDialogContentComponent, { data: { title: "Failed to load networks!" } })
            console.error(e);
            return of(true);
        })).toPromise();
}

class NetworkConfig
{
    id: number;
    contractAddress: string;
    name: string;
    subdomain: string;
    provider: string
}
