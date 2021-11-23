import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { ManageNftsComponent } from '../manage-nfts/manage-nfts.component';
import { PortLandsComponent } from '../port-lands/port-lands.component';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(private router: Router,
        private dialog: MatDialog,
        private app: AppComponent) {
    }
    ngOnInit(): void {
    }

    portLands() {
        this.dialog.open(PortLandsComponent, { data: this.app });
    }
    
    startGame() {
        this.router.navigate(['game']);
    }
    
    manageNFTs() {
        this.dialog.open(ManageNftsComponent, { data: this.app });
    }
}

