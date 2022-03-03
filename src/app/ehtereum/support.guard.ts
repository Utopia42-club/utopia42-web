import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Web3Service } from "./web3.service";

@Injectable({ providedIn: 'root' })
export class SupportGuard implements CanActivate {

    constructor(private router: Router, private service: Web3Service) {
        // ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
        // ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);
        // ethereum.on('accountsChanged', handler: (accounts: Array<string>) => void);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.service.getProvider().pipe(map(p => {
            if (p == null) return this.router.createUrlTree(["/not-supported"]);
            return true;
        }));
    }
}
