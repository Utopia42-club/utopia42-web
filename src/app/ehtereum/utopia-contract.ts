import { Observable, Subscriber } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { LoadingService } from "../loading.service";
import { Land, PricedLand } from "./models";

export class UtopiaContract
{
    constructor(readonly ethContract: Contract,
                private loadingService: LoadingService,
                readonly defaultWallet: string)
    {
    }

    public getLandPrice(land: Land): Observable<string>
    {
        return this.loadingService.prepare(
            new Observable((s) =>
                this.ethContract.methods.landPrice(land.x1, land.x2, land.y1, land.y2,).call(this.listener(s))
            ).pipe(map((price: any) => Web3.utils.fromWei(price).toString()))
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
            ).pipe(switchMap(amount => {
                return new Observable(s =>
                    this.ethContract.methods.assignLand(land.x1, land.x2, land.y1, land.y2, land.ipfsKey || "")
                        .send({ from: wallet, value: amount }, this.listener(s))
                );
            }))
        );
    }

    public updateLand(ipfsKey, landId, wallet): Observable<any>
    {
        if (wallet == null) wallet = this.defaultWallet;
        return this.loadingService.prepare(
            new Observable(s => {
                this.ethContract.methods.updateLand(ipfsKey, landId).send({ from: wallet }, this.listener(s));
            })
        );
    }

    public transferLand(landId: number, to: string, wallet: string): Observable<any>
    {
        if (wallet == null) wallet = this.defaultWallet;
        return this.loadingService.prepare(
            new Observable(s => {
                this.ethContract.methods.transferLand(landId, to).send({ from: wallet }, this.listener(s));
            })
        );
    }

    public setNft(landId: number, wallet: string, nft: boolean): Observable<any>
    {
        if (wallet == null) wallet = this.defaultWallet;
        return this.loadingService.prepare(
            new Observable(s => {
                if (nft)
                    this.ethContract.methods.landToNFT(landId).send({ from: wallet }, this.listener(s));
                else
                    this.ethContract.methods.NFTToLand(landId).send({ from: wallet }, this.listener(s));
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
                rs.map(r => {
                        return {
                            x1: parseInt(r.x1),
                            y1: parseInt(r.y1),
                            x2: parseInt(r.x2),
                            y2: parseInt(r.y2),
                            time: parseInt(r.time),
                            ipfsKey: r.hash,
                            isNFT: r.isNFT == "true",
                            owner: r.owner,
                            ownerIndex: parseInt(r.ownerIndex)
                        };
                    }
                ))
            )
        );
    }

    private listener(subscriber: Subscriber<any>)
    {
        return (error: any, value: any) => {
            if (error)
                return subscriber.error(error);
            // it returns tx hash because sending tx
            subscriber.next(value);
            subscriber.complete();
        };
    }
}
