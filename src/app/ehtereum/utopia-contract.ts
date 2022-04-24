import {ToastrService} from 'ngx-toastr';
import {from, Observable, Subscriber} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import Web3 from 'web3';
import {Contract} from 'web3-eth-contract';
import {LoadingService} from '../loading/loading.service';
import {Land, PricedLand} from './models';
import {fromPromise} from "rxjs/internal-compatibility";

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

                return this.sendWithIncreasedGas(
                    this.ethContract.methods.assignLandConflictFree(land.startCoordinate.x, land.endCoordinate.x, land.startCoordinate.z, land.endCoordinate.z, land.ipfsKey || '', lastLandCheckedId, signature),
                    {from: wallet, value: amount});
            }),
        );
    }

    public updateLand(ipfsKey, landId, wallet): Observable<any> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }
        return this.loadingService.prepare(
            this.sendWithIncreasedGas(this.ethContract.methods.updateLand(ipfsKey, landId), {
                from: wallet
            }, confirmationNumber => {
                if (confirmationNumber == 1) {
                    this.toaster.info(`Land ${landId} saved.`);
                }
            })
        );
    }

    public transferLand(landId: number, to: string, wallet: string): Observable<any> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }
        return this.loadingService.prepare(
            this.sendWithIncreasedGas(this.ethContract.methods.transferLand(landId, to), {
                from: wallet
            })
        );
    }

    public setNft(landId: number, wallet: string, nft: boolean): Observable<any> {
        if (wallet == null) {
            wallet = this.defaultWallet;
        }
        return this.loadingService.prepare(
            this.sendWithIncreasedGas(nft ?
                this.ethContract.methods.landToNFT(landId) :
                this.ethContract.methods.NFTToLand(landId), {
                from: wallet
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


    private sendWithIncreasedGas(request: any, options: any, onConfirmation?: (confirmationNumber: number) => void): Observable<any> {
        return fromPromise(this.web3.eth.getGasPrice())
            .pipe(switchMap(gasPrice => {
                return new Observable(s => {
                    request.send({
                        ...options,
                        gasPrice: Math.ceil(Number(gasPrice) * 1.5).toString()
                    }).on('confirmation', (confirmationNumber: number, receipt: any) => {
                        if (onConfirmation != null)
                            onConfirmation(confirmationNumber);
                    }).on('error', (e: Error) => s.error(e))
                        .on('transactionHash', (hash: string) => {
                            s.next(hash);
                            s.complete();
                        })
                });
            }));
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
