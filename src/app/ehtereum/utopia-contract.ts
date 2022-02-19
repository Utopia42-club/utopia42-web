import { ToastrService } from 'ngx-toastr';
import { from, Observable, Subscriber } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { LoadingService } from '../loading/loading.service';
import { Land, PricedLand } from './models';

export class UtopiaContract {
    constructor(readonly ethContract: Contract,
                private loadingService: LoadingService,
                readonly defaultWallet: string,
                readonly web3: Web3 | null,
                private readonly toaster: ToastrService) {
    }

    public getLandPrice(land: Land): Observable<string> {
        return this.loadingService.prepare(
            new Observable((s) =>
                this.ethContract.methods.landPrice(land.startCoordinate.x, land.endCoordinate.x, land.startCoordinate.z, land.endCoordinate.z)
                    .call(this.listener(s))
            ).pipe(map((price: any) => Web3.utils.fromWei(price).toString()))
        );
    }

    public assignPricedLand(wallet: string, land: PricedLand, lastLandCheckedId: number, signature: string): Observable<any> {
        let amount: string;
        let balance: string;
        return this.loadingService.prepare(
            from(this.web3.eth.getBalance(wallet))
        ).pipe(
            switchMap(b => {
                balance = b as string;
                return new Observable(s =>
                    this.ethContract.methods.landPrice(land.startCoordinate.x, land.endCoordinate.x, land.startCoordinate.z, land.endCoordinate.z).call(this.listener(s)));
            }),
            switchMap(a => {
                amount = a as string;
                if (Number(Web3.utils.fromWei(amount)) > Number(Web3.utils.fromWei(balance))) {
                    throw new Error('Insufficient balance (account balance < land price)');
                }
                return this.assignLandEstimateGas(wallet, land, lastLandCheckedId, signature, amount as string);
            }),
            switchMap(gasAmount => {
                return new Observable(s =>
                    this.ethContract.methods.assignLandConflictFree(land.startCoordinate.x, land.endCoordinate.x, land.startCoordinate.z, land.endCoordinate.z, land.ipfsKey || '', lastLandCheckedId, signature)
                        .send({ from: wallet, value: amount, gasLimit: (3 * Number(gasAmount)).toString() }, this.listener(s))
                );
            })
        );
    }

    public assignLandEstimateGas(wallet: string, land: PricedLand, lastLandCheckedId: number, signature: string, amount: string): Observable<string> {
        return new Observable(s =>
            this.ethContract.methods
                .assignLandConflictFree(land.startCoordinate.x, land.endCoordinate.x, land.startCoordinate.z, land.endCoordinate.z, land.ipfsKey || '', lastLandCheckedId, signature)
                .estimateGas({ from: wallet, value: amount }, this.listener(s))
        );
    }

    public updateLand(ipfsKey, landId, wallet): Observable<any> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }
        return this.loadingService.prepare(
            new Observable(s => {
                this.ethContract.methods.updateLand(ipfsKey, landId).send({ from: wallet })
                    .on('confirmation', (confirmationNumber: number, receipt: any) => {
                        if (confirmationNumber == 1) {
                            this.toaster.info(`Land ${landId} saved.`);
                        }
                    })
                    .on('error', s.error)
                    .on('transactionHash', (hash: string) => {
                        s.next(hash);
                        s.complete();
                    });
            })
        );
    }

    public transferLand(landId: number, to: string, wallet: string): Observable<any> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }
        return this.loadingService.prepare(
            new Observable(s => {
                this.ethContract.methods.transferLand(landId, to).send({ from: wallet }, this.listener(s));
            })
        );
    }

    public setNft(landId: number, wallet: string, nft: boolean): Observable<any> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }
        return this.loadingService.prepare(
            new Observable(s => {
                if (nft) {
                    this.ethContract.methods.landToNFT(landId).send({ from: wallet }, this.listener(s));
                } else {
                    this.ethContract.methods.NFTToLand(landId).send({ from: wallet }, this.listener(s));
                }
            })
        );
    }

    public getOwnerLands(wallet?: string): Observable<Land[]> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }

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
                            isNft: r.isNFT == 'true',
                            owner: r.owner,
                            ownerIndex: parseInt(r.ownerIndex)
                        };
                    }
                ))
            )
        );
    }

    private listener(subscriber: Subscriber<any>) {
        return (error: any, value: any) => {
            if (error) {
                return subscriber.error(error);
            }
            // it returns tx hash because sending tx
            subscriber.next(value);
            subscriber.complete();
        };
    }
}
