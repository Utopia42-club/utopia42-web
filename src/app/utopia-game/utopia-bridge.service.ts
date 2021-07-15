import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Land } from '../ehtereum/utopia-contract';
import { Web3Service } from '../ehtereum/web3.service';

@Injectable()
export class UtopiaBridgeService {
    public unityInstance;
    constructor(private web3service: Web3Service) { }

    public buy(lands: Land[]) {
        console.log("Buy", lands);
    }

    public save(ids: string[]) {
        console.log("Save", ids);
    }

    public connectMetamask(p): Observable<any> {
        return this.web3service.connect()
            .pipe(map(v => {
                console.log(v)
                if (!v) return null;
                return {
                    "network": this.web3service.networkId(),
                    "wallet": this.web3service.wallet()
                };
            }));
    }
}
