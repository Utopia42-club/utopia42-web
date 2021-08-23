import { Observable, of, Subscriber } from "rxjs";
import { map, mergeMap, reduce, switchMap } from "rxjs/operators";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { LoadingService } from "../loading.service";
import { Land, PricedLand } from "./models";

export class UtopiaContract
{
    constructor(readonly ethContract: Contract,
        private loadingService: LoadingService,
        readonly defaultWallet: string) { }

    public getLandPrice(land: Land): Observable<string>
    {
        return this.loadingService.prepare(
            new Observable((s) =>
                this.ethContract.methods.landPrice(land.x1, land.x2, land.y1, land.y2,).call(this.listener(s))
            ).pipe(map((price: any) => Web3.utils.fromWei(price).toString()))
        );
    }

    public updateKey(ipfsId): Observable<string>
    {
        return this.loadingService.prepare(
            new Observable(s => this.ethContract.methods().updateKey(ipfsId, this.listener(s)))
        );
    }

    public assignPricedLand(wallet: string, land: PricedLand): Observable<any>
    {
        return this.assignLand(wallet, land);
    }

    public assignLand(wallet: string, land: Land): Observable<any>
    {
        return this.loadingService.prepare(
            new Observable(s =>
                this.ethContract.methods.landPrice(land.x1, land.x2, land.y1, land.y2).call(this.listener(s))
            ).pipe(switchMap(amount =>
            {
                return new Observable(s =>
                    this.ethContract.methods.assignLand(land.x1, land.x2, land.y1, land.y2, land.ipfsKey || "")
                        .send({ from: wallet, value: amount }, this.listener(s))
                );
            }))
        );
    }

    // public getOwnerLands(wallet?: string): Observable<Land[]>
    // {
    //     if (wallet == null) wallet = this.defaultWallet;
    //     return this.getLands(wallet, []);
    // }

    private getLands(wallet: string, current: Land[]): Observable<Land[]>
    {
        return this.loadingService.prepare(
            this.getOwnerLand(wallet, current.length)
                .pipe(switchMap((land: Land) =>
                {
                    if (land && land.time > 0) {
                        current.push(land);
                        return this.getLands(wallet, current);
                    }
                    return of(current);
                }))
        );
    }

    public updateLand(ipfsKey, index, wallet): Observable<any>
    {
        if (wallet == null) wallet = this.defaultWallet;
        return this.loadingService.prepare(
            new Observable(s =>
            {
                this.ethContract.methods.updateLand(ipfsKey, index).send({ from: wallet }, this.listener(s));
            })
        );
    }

    public transferLand(index, to, wallet): Observable<any>
    {
        if (wallet == null) wallet = this.defaultWallet;
        return this.loadingService.prepare(
            new Observable(s =>
            {
                this.ethContract.methods.transferLand(index, to).send({ from: wallet }, this.listener(s));
            })
        );
    }

    public getOwnerLands(wallet?: string): Observable<Land[]>
    {
        if (wallet == null) wallet = this.defaultWallet;

        return this.loadingService.prepare(
            new Observable(s =>
                this.ethContract.methods.getLands(wallet).call(this.listener(s))
            ).pipe(map((rs: any[]) =>
                rs.map(r =>
                {
                    return {
                        x1: parseInt(r.x1),
                        y1: parseInt(r.y1),
                        x2: parseInt(r.x2),
                        y2: parseInt(r.y2),
                        time: parseInt(r.time),
                        ipfsKey: r.hash,
                    };
                }
                ))
            )
        );
    }

    public getOwnerLand(wallet: string, landIndex: number): Observable<Land>
    {
        return this.loadingService.prepare(
            new Observable(s =>
                this.ethContract.methods.getLand(wallet, landIndex).call(this.listener(s))
            ).pipe(map((r: any) =>
            {
                return {
                    x1: parseInt(r.x1),
                    y1: parseInt(r.y1),
                    x2: parseInt(r.x2),
                    y2: parseInt(r.y2),
                    time: parseInt(r.time),
                    ipfsKey: r.hash,
                };
            }))
        );
    }

    public getOwnerList(): Observable<string[]>
    {
        return this.loadingService.prepare(
            new Observable(s => this.ethContract.methods.getOwners().call(this.listener(s)))
        );
    }


    public getUsersAssignee(): Observable<any>
    {
        return this.loadingService.prepare(
            this.getOwnerList().pipe(
                switchMap(owners => of(...owners)),
                mergeMap(owner => this.getOwnerLands(owner)
                    .pipe(map(lands =>
                    {
                        const res: any = {};
                        res[owner] = lands;
                        return res;
                    }))
                ), reduce<any>((acc, v) =>
                {
                    return { ...acc, ...v };
                }, {})
            )
        );
    }

    private listener(subscriber: Subscriber<any>)
    {
        return (error: any, value: any) =>
        {
            if (error)
                return subscriber.error(error);
            // it returns tx hash because sending tx
            subscriber.next(value);
            subscriber.complete();
        };
    }
}
