import { Injectable, NgZone } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import Web3 from 'web3';
import { LoadingService } from '../loading.service';
import { UTOPIA_ABI } from './abi';
import { Networks } from './network';
import { UtopiaContract } from './utopia-contract';


@Injectable({
    providedIn: 'root'
})
export class Web3Service {
    private connectedAccounts: string[] = [];
    private web3ProviderCashe = new Map<number, Web3>();
    private contractCache = new Map<number, UtopiaContract>();
    private readonly connectedSubject = new BehaviorSubject(false);
    readonly connected$ = this.connectedSubject.asObservable().pipe(distinctUntilChanged());
    private readonly walletSubject = new BehaviorSubject<string>(null);
    readonly wallet$ = this.walletSubject.asObservable().pipe(distinctUntilChanged());
    private readonly networkSubject = new BehaviorSubject<number>(null);
    readonly network$ = this.networkSubject.asObservable().pipe(distinctUntilChanged());
    readonly win = window as any;
    private metaMaskProvider = undefined;

    constructor(private loadingService: LoadingService, private zone: NgZone, private readonly toaster: ToastrService) { }

    private getWeb3(networkId: number): Web3 | null {
        // if ((networkId == null && this.win.web3 != null)) {
        //     return new Web3(this.win.web3.currentProvider);
        // }
        if (!Networks.supported.has(networkId))
            return null;
        if (this.web3ProviderCashe.has(networkId))
            return this.web3ProviderCashe.get(networkId)!;

        let network = Networks.all.get(networkId);
        this.web3ProviderCashe.set(networkId, new Web3(new Web3.providers.HttpProvider(network.provider)));
        return this.web3ProviderCashe.get(networkId)!;
    }

    public getSmartContract(networkId?: number): UtopiaContract {
        if (networkId == null || this.networkId() == networkId) {
            networkId = this.metaMaskProvider != undefined ? this.networkId() : Networks.MainNet().id;
            if (!this.web3ProviderCashe.has(networkId))
                this.web3ProviderCashe.set(networkId, new Web3(this.metaMaskProvider));
        }

        if (!Networks.supported.has(networkId)) return null;

        if (!this.contractCache.has(networkId)) {
            const web3 = this.getWeb3(networkId)!;
            var network = Networks.all.get(networkId);
            this.contractCache.set(networkId,
                new UtopiaContract(new web3.eth.Contract(UTOPIA_ABI, network.contractAddress),
                    this.loadingService, this.wallet(), web3, this.toaster));
        }
        return this.contractCache.get(networkId!)!;
    }

    public providerIfPresent(): any {
        return this.metaMaskProvider;
    }

    public provider(): Observable<any> {
        if (this.metaMaskProvider !== undefined) return of(this.metaMaskProvider);
        return this.loadingService.prepare(
            this.from(detectEthereumProvider())
                .pipe(map(p => {
                    if (p) {
                        if (this.metaMaskProvider == null) {
                            this.metaMaskProvider = p;
                            this.resetObservables();
                            this.metaMaskProvider.on('chainChanged', (_chainId) => this.resetObservables());
                            this.metaMaskProvider.on('accountsChanged', (account) => this.resetObservables());
                            this.metaMaskProvider.on('disconnect', (arg) => this.resetObservables());
                            this.metaMaskProvider.on('connect', (arg) => this.resetObservables());
                        }
                        return p;
                    }
                    this.metaMaskProvider = null;
                    return null;
                }))
        );
    }

    private resetObservables() {
        setTimeout(() => {
            //FIXME
            //workaround for metamask wallet and networkId not available without interaction
            this.zone.run(() => {
                this.walletSubject.next(this.metaMaskProvider.selectedAddress);
                this.networkSubject.next(parseInt(this.metaMaskProvider.networkVersion));
                this.connectedSubject.next(this.isConnectedInstant());
            });
        }, 0.1);
    }

    private isConnectedInstant(networkId?: number, wallet?: string): boolean {
        return this.metaMaskProvider != null && this.checkProvider(networkId, wallet);
    }


    public isConnected(networkId?: number, wallet?: string): Observable<boolean> {
        return this.loadingService.prepare(
            this.provider()
                .pipe(map(p => this.isConnectedInstant(networkId, wallet)))
        );
    }

    public wallets(): string[] {
        return this.connectedAccounts;
    }

    public reconnect(): Observable<any> {
        return this.loadingService.prepare(
            this.provider()
                .pipe(switchMap(provider =>
                    this.from(provider.request({
                        method: "wallet_requestPermissions",
                        params: [{
                            eth_accounts: {}
                        }]
                    }))
                ))
        );
    }

    public connect(networkId?: number, wallet?: string): Observable<boolean> {
        if (this.metaMaskProvider === null) return of(false);
        if (this.isConnectedInstant(networkId, wallet)) return of(true);
        //     return of(true);
        return this.loadingService.prepare(
            this.provider()
                .pipe(
                    switchMap(provider => {
                        if (provider == null) return of(false);
                        return this.from(provider.request({ method: 'eth_requestAccounts' }))
                            .pipe(
                                map((d) => {
                                    this.connectedAccounts = d as any;
                                    this.connectedSubject.next(this.isConnectedInstant());
                                    return this.connectedAccounts.indexOf(provider.selectedAddress) == 0
                                        && this.checkProvider(networkId, wallet);
                                }),
                                catchError(e => of(false))
                            );
                    })
                )
        );
    }

    private checkProvider(networkId?: number, wallet?: string): boolean {
        return !isNaN(this.networkId()) && this.wallet() != null &&
            (networkId == null || this.networkId() == networkId)
            && (wallet == null || this.connectedAccounts.indexOf(wallet.toLowerCase()) >= 0);
    }

    private from(f) {
        return new Observable(s => {
            return from(f).subscribe(
                v => this.zone.run(() => s.next(v)),
                err => this.zone.run(() => s.error(err)),
                () => this.zone.run(() => s.complete())
            );
        });
    }

    wallet(): string {
        return this.walletSubject.getValue();
    }

    networkId(): number {
        return this.networkSubject.getValue();
    }
}
