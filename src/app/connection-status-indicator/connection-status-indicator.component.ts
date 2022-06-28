import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Networks } from '../ehtereum/network';
import { Web3Service } from '../ehtereum/web3.service';

@Component({
    selector: 'app-connection-status-indicator',
    templateUrl: './connection-status-indicator.component.html',
    styleUrls: ['./connection-status-indicator.component.scss']
})
export class ConnectionStatusIndicatorComponent implements OnInit {
    supported = new BehaviorSubject(false);

    constructor(readonly service: Web3Service) {
    }

    ngOnInit(): void {
        // this.checkSupport();
    }

    networkName(): string {
        if (!Networks.supported.has(this.service.networkId()))
            return "Unsupported Network";
        return Networks.all.get(this.service.networkId()).name;
    }

    checkSupport() {
        this.service.provider().subscribe(v => {
            this.supported.next(v != null);
        });
    }

}
