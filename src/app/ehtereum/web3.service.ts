import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Web3 from 'web3';
import { LoadingService } from '../loading.service';
import { UTOPIA_ABI } from './abi';
import { UtopiaContract } from './utopia-contract';


@Injectable({
    providedIn: 'root'
})
export class Web3Service {
    private web3ProviderCashe = new Map<string, Web3>();
    private contractCache = new Map<string, UtopiaContract>();
    readonly win = window as any;
    private metaMaskProvider = undefined;

    constructor(private loadingService: LoadingService) { }

    private getWeb3(networkId: string): Web3 | null {
        // if ((networkId == null && this.win.web3 != null)) {
        //     return new Web3(this.win.web3.currentProvider);
        // }
        if (INFURA_NETWORK_SUBDOMAINS[networkId] == undefined)
            return null;
        if (this.web3ProviderCashe.has(networkId))
            return this.web3ProviderCashe.get(networkId)!;

        var httpProviderLink = `https://${INFURA_NETWORK_SUBDOMAINS[networkId]}.infura.io/v3/b12c1b1e6b2e4f58af559a67fe46104e`;
        if (INFURA_NETWORK_SUBDOMAINS[networkId] == 'bsctest') {
            // testnet
            httpProviderLink = 'https://data-seed-prebsc-1-s1.binance.org:8545';
        }
        if (INFURA_NETWORK_SUBDOMAINS[networkId] == 'bsc') {
            // mainnet 
            httpProviderLink = 'https://bsc-dataseed1.binance.org:443';
        }
        this.web3ProviderCashe.set(networkId, new Web3(new Web3.providers.HttpProvider(httpProviderLink)));
        return this.web3ProviderCashe.get(networkId)!;
    }


    public getDomainName(): string {
        const networkId = this.win.ethereum != undefined ? this.win.ethereum.networkVersion : '1';
        return INFURA_NETWORK_SUBDOMAINS[networkId];
    }

    public getSmartContract(networkId?: string): UtopiaContract {
        // networkId = '1';
        if (networkId == null) {
            networkId = this.metaMaskProvider != undefined ? this.metaMaskProvider.networkVersion : '1';
            if (!this.web3ProviderCashe.has(networkId!))
                this.web3ProviderCashe.set(networkId!, new Web3(this.metaMaskProvider));
        }
        if (!this.contractCache.has(networkId!)) {
            const web3 = this.getWeb3(networkId!)!;
            this.contractCache.set(networkId!, new UtopiaContract(new web3.eth.Contract(UTOPIA_ABI, CONTRACT_ADDRESS[networkId!]), this.loadingService));
        }
        return this.contractCache.get(networkId!)!;
    }

    public providerIfPresent(): any {
        return this.metaMaskProvider;
    }

    public provider(): Observable<any> {
        if (this.metaMaskProvider !== undefined) return of(this.metaMaskProvider);
        return this.loadingService.prepare(
            from(detectEthereumProvider())
                .pipe(map(p => {
                    if (p) {
                        this.metaMaskProvider = p;
                        this.metaMaskProvider.on('chainChanged', (_chainId) => window.location.reload());
                        return p;
                    }
                    this.metaMaskProvider = null;
                    return null;
                }))
        );
    }

    public isConnected(networkId?: number): Observable<boolean> {
        return this.loadingService.prepare(this.provider().pipe(map(p => {
            return p != null && p.isConnected() && (networkId == null || p.networkVersion == networkId);
        })));
    }

    public networkId(): number {
        return this.metaMaskProvider?.networkVersion;
    }

    public connect(networkId?: number): Observable<boolean> {
        if (this.metaMaskProvider === null) return of(false);
        // if (this.metaMaskProvider !== undefined && this.metaMaskProvider.isConnected())
        //     return of(true);
        return this.loadingService.prepare(
            this.provider()
                .pipe(
                    switchMap(provider => {
                        if (provider == null) return of(false);
                        // if (provider.isConnected()) return of(true);
                        return from(provider.request({ method: 'eth_requestAccounts' }))
                            .pipe(
                                map((d) => {
                                    return networkId == null || provider.networkVersion == networkId;
                                }),
                                catchError(e => of(false))
                            );
                    })
                )
        );
    }
}


const CONTRACT_ADDRESS: { [idx: string]: string } = {
    '1': '0x56040d44f407fa6f33056d4f352d2e919a0d99fb', // Main Net
    '3': '0x9344CdEc9cf176E3162758D23d1FC806a0AE08cf', // Ropsten
    '4': '0x801fC75707BEB6d2aE8863D7A3B66047A705ffc0', //'0xe72853152988fffb374763ad67ae577686cefa1a', // Rinkeby
    '5': '', // Goerli
    '42': '', // Kovan
    '56': '',
    '97': '0x044630826A56C768D3FAC17f907EA38aE90BE2B3'
};

export const METAMASK_PROVIDER_LIST: { [idx: string]: string } = {
    '1': "Ethereum Main Network",
    '3': "Ropsten Test Network",
    '4': "Rinkeby Test Network",
    '5': "Goerli Test Network",
    '42': "Kovan Test Network",
    '56': "Binance Smart Chain",
    '97': "Binance Smart Chain Test"
};

const INFURA_NETWORK_SUBDOMAINS: { [idx: string]: string } = {
    '1': "mainnet",
    '3': "ropsten",
    '4': "rinkeby",
    '5': "goerli",
    '42': "kovan",
    '56': "bsc",
    '97': "bsctest"
}