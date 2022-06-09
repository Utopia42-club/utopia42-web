import { HttpClient } from "@angular/common/http";
import { Network } from "./network";
import { MatDialog } from "@angular/material/dialog";
import { catchError, tap } from "rxjs/operators";
import { ExceptionDialogContentComponent } from "../exception-dialog-content/exception-dialog-content.component";
import { of } from "rxjs";
import { Configurations } from "../configurations";

export function NetsInitializer(http: HttpClient, dialog: MatDialog)
{
    return () => http.get<NetworkConfig[]>(Configurations.NETS_URL)
        .pipe(tap(nets => {
            // Network.register(80001, "0xDfDDbd9d7Cfc48Ab8b4BbA8ec7E00A7B098544f4", "Polygon Testnet", true, { provider: "https://matic-mumbai.chainstacklabs.com" });
            // return; // test only
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
