import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { PortLandsComponent } from '../port-lands/port-lands.component';
import { Configurations } from "../configurations";
import { OpenGameAtComponent } from '../open-game-at/open-game-at.component';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit
{
    readonly windowsUrl = Configurations.WINDOWS_URL;


    constructor(private router: Router,
                private dialog: MatDialog,
                private app: AppComponent)
    {
    }

    ngOnInit(): void
    {
    }

    portLands()
    {
        this.dialog.open(PortLandsComponent, { data: this.app });
    }

    startGame()
    {
        this.router.navigate(['game']);
    }

    
    startGameAt() {
        this.dialog.open(OpenGameAtComponent, { data: this.app });
    }
}

