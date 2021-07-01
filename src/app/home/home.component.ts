import { Component, OnInit } from '@angular/core';
import { UtopiaContract } from '../ehtereum/utopia-contract';
import { Web3Service } from '../ehtereum/web3.service';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    private contract: UtopiaContract;
    constructor(readonly service: Web3Service) {
        // console.log(`${next.queryParams.ids}`.split(","))
    }

    ngOnInit(): void {
        // console.log("sending")
        // const ipfs = ipfsClient.create({ host: 'utopia42.club', port: 443, protocol: 'https' })
        // from(ipfs.add("asdf{}ASDFASDF}X"))
        // .subscribe((v)=>{
        //     console.log(v);
        // })
    }

    buy() {
        this.contract.assignLand(this.contract.currentWallet(), -700, -700, -699, -699,
            "INVALID_HASH").subscribe(v => {
                console.log(v)
            });
    }

    wallet() {
        return this.contract.currentWallet();
    }

    provider() {
        return this.service.getDomainName();
    }

}