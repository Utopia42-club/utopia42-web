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
    }

    ngOnInit(): void {
    }

}
