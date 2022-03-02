import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConnectionDetail } from '../ehtereum/connection-detail';
import { Networks } from '../ehtereum/network';
import { Web3Service } from '../ehtereum/web3.service';

@Component({
    selector: 'app-meta-mask-connecting',
    templateUrl: './meta-mask-connecting.component.html',
    styleUrls: ['./meta-mask-connecting.component.scss']
})
export class MetaMaskConnectingComponent implements OnInit, OnDestroy {
    private connectionSubscription: Subscription;
    private stateSubscription = new Subscription();
    private resultSubject = new Subject<boolean>();
    public readonly result$ = this.resultSubject.asObservable();
    private readonly targetWallet: string;
    private readonly targetNetwork: number;
    retry = null;
    title: string = "Connecting to Meta Mask";
    message: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: ConnectionDetail,
        private service: Web3Service,
        private dialog: MatDialogRef<any>) {
        this.targetNetwork = data.network;
        this.targetWallet = data.wallet;
        this.stateSubscription.add(service.connected$.subscribe(() => this.tryConnect()));
        this.stateSubscription.add(service.wallet$.subscribe(() => this.tryConnect()));
        this.stateSubscription.add(service.network$.subscribe(() => this.tryConnect()));
    }

    ngOnInit(): void {
        this.tryConnect();
    }

    ngOnDestroy(): void {
        this.stateSubscription.unsubscribe();
        this.connectionSubscription?.unsubscribe();
    }

    networkName(): string {
        return Networks.all.get(this.data.network)?.name ?? 'unknown';
    }

    cancel(): void {
        this.finish(false);
    }

    private finish(result: boolean) {
        this.resultSubject.next(result);
        this.dialog.close();
    }

    tryConnect() {
        this.connectionSubscription?.unsubscribe();
        this.connectionSubscription =
            this.service.connect(this.targetNetwork, this.targetWallet)
                .pipe(catchError(e => {
                    this.connectionError();
                    return throwError(e);
                }))
                .subscribe(v => {
                    if (v)
                        this.finish(true);
                    else {
                        this.retry = null;
                        if (this.targetNetwork != null && this.service.networkId() != this.targetNetwork)
                            this.wrongNetwork();
                        else if (this.targetWallet != null && this.service.wallet() != this.targetWallet)
                            this.wrongWallet();
                        else this.connectionError();
                    }
                });
    }

    private connectionError(): void {
        this.title = "Failed to connect Meta Mask";
        this.message = "";
        this.retry = () => this.tryConnect();
    }

    private wrongWallet(): void {
        this.title = "You are connected to the wrong wallet";
        this.message = `Please select ${this.targetWallet}`;
        this.retry = () => this.service.reconnect().subscribe(() => this.tryConnect());
    }

    private wrongNetwork(): void {
        this.retry = () => this.tryConnect();
        if (this.networkName() == null) {
            this.title = "Unknown network id in url";
            this.message = "";
        } else {
            this.title = "You are connected to the wrong network";
            this.message = `Please connect to the ${this.networkName()}`;
        }
    }
}
