import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NetworkParamsGuardGuard implements CanActivate
{
    constructor(private readonly router: Router)
    {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        const fromQp = this.readContractAndNet(route.queryParams);
        const qp = { ...route.queryParams };
        qp.contract = undefined;
        qp.network = undefined;
        if (fromQp != null) {
            return this.router.createUrlTree([fromQp.net, fromQp.contract], {
                queryParams: qp
            });
        }


        const hasContractQp = route.queryParams.contract != null || route.queryParams.network != null;

        const fromParams = this.readContractAndNet(route.params);
        if (fromParams != null) {
            if (hasContractQp)
                return this.router.createUrlTree([fromParams.net, fromParams.contract], {
                    queryParams: qp
                });
            return true;
        }

        const hasContractParams = route.params.contract != null || route.params.network != null;
        if (hasContractParams || hasContractQp)
            return this.router.createUrlTree([], {
                queryParams: qp
            });
        return true;
    }

    private readContractAndNet(params: any): {
        contract: string, net: number
    } | null
    {
        const contract = params.contract?.toString();
        const net = parseInt(`${params.network}`);
        if (contract != null && !isNaN(net))
            return { contract, net };
        return null;
    }
}
