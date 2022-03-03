import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import Web3 from 'web3';
import { LoadingService } from '../loading/loading.service';
import { UTOPIA_ABI } from './abi';
import { Networks } from './network';
import { UtopiaContract } from './utopia-contract';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import Core from 'web3modal';

@Injectable({
    providedIn: 'root'
})
export class Web3Service {

    private connectedAccounts: string[] = [];

    private web3ProviderCache = new Map<number, Web3>();

    private contractCache = new Map<number, UtopiaContract>();

    private readonly connectedSubject = new BehaviorSubject(false);
    readonly connected$ = this.connectedSubject.asObservable().pipe(distinctUntilChanged());

    private readonly walletSubject = new BehaviorSubject<string>(null);
    readonly wallet$ = this.walletSubject.asObservable().pipe(distinctUntilChanged());

    private readonly networkSubject = new BehaviorSubject<number>(null);
    readonly network$ = this.networkSubject.asObservable().pipe(distinctUntilChanged());

    private readonly providerSubject = new BehaviorSubject<any>(null);
    readonly provider$ = this.providerSubject.asObservable().pipe(distinctUntilChanged());

    readonly win = window as any;

    private web3Modal: Core;

    constructor(private loadingService: LoadingService, private zone: NgZone, private readonly toaster: ToastrService) {
    }

    private getWeb3(networkId: number): Observable<Web3> {

        // if ((networkId == null && this.win.web3 != null)) {
        //     return of(new Web3(this.win.web3.currentProvider));
        // }

        if (!Networks.supported.has(networkId)) {
            return of(null);
        }
        if (this.web3ProviderCache.has(networkId)) {
            return of(this.web3ProviderCache.get(networkId)!);
        }

        return this.getProvider()
            .pipe(
                switchMap(provider => {
                    if (provider == null) {
                        return of(null);
                    }
                    const web3 = new Web3(provider);
                    this.web3ProviderCache.set(networkId, web3);
                    return of(web3);
                }),
            );
    }

    public getSmartContract(networkId?: number): Observable<UtopiaContract> {
        if (networkId == null || this.networkId() == networkId) {
            networkId = this.providerSubject.getValue() != undefined ? this.networkId() : Networks.MainNet().id;
            if (!this.web3ProviderCache.has(networkId)) {
                this.web3ProviderCache.set(networkId, new Web3(this.providerSubject.getValue()));
            }
        }

        if (!Networks.supported.has(networkId)) {
            return null;
        }

        if (!this.contractCache.has(networkId)) {
            return this.getWeb3(networkId)
                .pipe(
                    switchMap(web3 => {
                        const network = Networks.all.get(networkId);
                        let utopiaContract = new UtopiaContract(new web3.eth.Contract(UTOPIA_ABI, network.contractAddress),
                            this.loadingService, this.wallet(), web3, this.toaster);
                        this.contractCache.set(networkId, utopiaContract);
                        return of(utopiaContract);
                    })
                );
        }
        return of(this.contractCache.get(networkId!));
    }

    public getProvider(openDialog: boolean = true, useCachedProvider: boolean = true): Observable<any> {
        if (this.providerSubject.getValue() != null) {
            return of(this.providerSubject.getValue());
        }

        let rpcOptions = {};
        Networks.all.forEach(network => {
            rpcOptions[network.id] = network.provider;
        });

        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    rpc: rpcOptions
                }
            },
        };
        this.web3Modal = new Web3Modal({
            network: 'polygon',
            cacheProvider: true, // optional
            providerOptions, // required
        });

        if (!useCachedProvider) {
            this.web3Modal.clearCachedProvider();
        }

        if (!openDialog && (this.web3Modal.cachedProvider == null || this.web3Modal.cachedProvider.trim().length == 0)) {
            return of(null);
        }

        return this.from(this.connectAccount())
            .pipe(
                map((p: any) => {
                    if (p) {
                        if (this.providerSubject.getValue() == null) {
                            this.providerSubject.next(p);
                            this.resetObservables();
                            p.on('chainChanged', (_chainId) => this.resetObservables());
                            p.on('accountsChanged', (account) => this.resetObservables());
                            p.on('disconnect', (arg) => this.resetObservables());
                            p.on('connect', (arg) => this.resetObservables());
                        }
                        return p;
                    }
                    this.providerSubject.next(null);
                    return null;
                }),
                catchError(err => {
                    this.providerSubject.next(null);
                    this.toaster.error('Connection to wallet failed');
                    return of(null);
                }),
            );
    }

    async connectAccount() {
        return await this.web3Modal.connect();
    }

    private resetObservables() {
        setTimeout(() => {
            //FIXME
            //workaround for metamask wallet and networkId not available without interaction
            this.zone.run(() => {
                this.walletSubject.next(this.providerSubject.getValue().selectedAddress);
                this.networkSubject.next(parseInt(this.providerSubject.getValue().networkVersion));
                this.connectedSubject.next(this.isConnectedInstant());
            });
        }, 0.1);
    }

    private isConnectedInstant(networkId?: number, wallet?: string): boolean {
        return this.providerSubject.getValue() != null && this.checkProvider(networkId, wallet);
    }

    public isConnected(networkId?: number, wallet?: string): Observable<boolean> {
        return this.loadingService.prepare(
            this.getProvider()
                .pipe(map(p => this.isConnectedInstant(networkId, wallet)))
        );
    }

    public wallets(): string[] {
        return this.connectedAccounts;
    }

    public reconnect(): Observable<any> {
        return this.loadingService.prepare(
            this.getProvider()
                .pipe(switchMap(provider =>
                    this.from(provider.request({
                        method: 'wallet_requestPermissions',
                        params: [{
                            eth_accounts: {}
                        }]
                    }))
                ))
        );
    }

    public connect(networkId?: number, wallet?: string): Observable<boolean> {
        if (this.isConnectedInstant(networkId, wallet)) {
            return of(true);
        }
        return this.getProvider().pipe(
            switchMap(provider => {
                if (provider == null) {
                    return of(false);
                }
                return this.loadingService.prepare(
                    this.from(provider.request({ method: 'eth_requestAccounts' }))
                        .pipe(map((d) => {
                                this.connectedAccounts = d as any;
                                this.connectedSubject.next(this.isConnectedInstant());
                                return this.connectedAccounts.indexOf(provider.selectedAddress) == 0
                                    && this.checkProvider(networkId, wallet);
                            }),
                            catchError(e => of(false))
                        )
                );
            })
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
