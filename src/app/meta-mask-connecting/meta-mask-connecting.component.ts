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
    connectionFailed: boolean = false;
    wrongNetwork: boolean = false;

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

        this.subscription?.unsubscribe();
        this.subscription =
            this.service.connect(netId)
                .pipe(catchError(e => {
                    this.connectionFailed = true;
                    return throwError(e);
                }))
                .subscribe(v => {
                    if (v) {
                        const rturl = this.route.snapshot.queryParams.returnUrl;
                        const params = { ...this.route.snapshot.queryParams };
                        params.returnUrl = undefined;
                        this.router.navigate([rturl == null ? "/home" : rturl], { queryParams: params });
                    } else {
                        this.wrongNetwork = this.service.networkId() != netId;
                        this.connectionFailed = !this.wrongNetwork;
                    }
                });
    }
}
