import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { METAMASK_PROVIDER_LIST, Web3Service } from '../ehtereum/web3.service';

@Component({
    selector: 'app-meta-mask-connecting',
    templateUrl: './meta-mask-connecting.component.html',
    styleUrls: ['./meta-mask-connecting.component.scss']
})
export class MetaMaskConnectingComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    retry = null;
    title: string = "Connecting to Meta Mask";
    message: string;

    constructor(private router: Router, private service: Web3Service, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.tryConnect();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    networkName(): string {
        const netId = this.route.snapshot.queryParams.networkId;
        return METAMASK_PROVIDER_LIST[netId];
    }

    tryConnect() {
        const netId = this.route.snapshot.queryParams.networkId;
        const wallet = this.route.snapshot.queryParams.wallet;
        this.service.isConnected
        this.subscription?.unsubscribe();
        this.subscription =
            this.service.connect(netId, wallet)
                .pipe(catchError(e => {
                    this.connectionError();
                    return throwError(e);
                }))
                .subscribe(v => {
                    if (v) {
                        const rturl = this.route.snapshot.queryParams.returnUrl;
                        const params = { ...this.route.snapshot.queryParams };
                        params.returnUrl = undefined;
                        this.router.navigate([rturl == null ? "/home" : rturl], { queryParams: params });
                    } else {
                        this.retry = null;
                        if (netId != null && this.service.networkId() != netId) this.wrongNetwork();
                        else if (wallet != null && this.service.wallet() != wallet) this.wrongWallet(wallet);
                        else this.connectionError();
                    }
                });
    }

    private connectionError(): void {
        this.title = "Failed to connect Meta Mask";
        this.message = "";
        this.retry = () => this.tryConnect();
    }

    private wrongWallet(requestedWallet: string): void {
        this.title = "You are connected to a wrong wallet";
        this.message = `Please select ${requestedWallet}`;
        this.retry = () => this.service.reconnect().subscribe(() => window.location.reload());
    }

    private wrongNetwork(): void {
        if (this.networkName() == null) {
            this.title = "Unknown network id in url";
            this.message = "";
        } else {
            this.title = "You are connected to a wrong network";
            this.message = `Please connect to the ${this.networkName()}`;
        }
    }
}
