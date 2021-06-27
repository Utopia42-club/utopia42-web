import { Component } from '@angular/core';
import { Web3Service } from './ehtereum/web3.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(readonly service: Web3Service) {
    }

    ngOnInit(): void {
    }
}
