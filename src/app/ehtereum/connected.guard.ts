import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Web3Service } from "./web3.service";

@Injectable({ providedIn: 'root' })
export class ConnectedGuard implements CanActivate {

    constructor(private router: Router, private service: Web3Service) {
        // ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
        // ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);
        // ethereum.on('accountsChanged', handler: (accounts: Array<string>) => void);
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.service.isConnected(next.queryParams.networkId, next.queryParams.wallet).pipe(map(v => {
            return v ? true :
                this.router.createUrlTree(["/connect"], { queryParams: { ...next.queryParams, returnUrl: this.getUrlWithoutParams(state.url) } });
        }));
    }

    getUrlWithoutParams(url: string) {
        let urlTree = this.router.parseUrl(url);
        urlTree.queryParams = {};
        return urlTree.toString();
    }
}