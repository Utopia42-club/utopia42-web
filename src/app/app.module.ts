import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BuyLandsComponent } from './buy-lands/buy-lands.component';
import { ConnectionStatusIndicatorComponent } from './connection-status-indicator/connection-status-indicator.component';
import { ExceptionDialogContentComponent } from './exception-dialog-content/exception-dialog-content.component';
import { HomeComponent } from './home/home.component';
import { MetaMaskConnectingComponent } from './meta-mask-connecting/meta-mask-connecting.component';
import { PortLandsComponent } from './port-lands/port-lands.component';
import { SaveLandsComponent } from './save-lands/save-lands.component';
import { UtopiaGameComponent } from './utopia-game/utopia-game.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        MetaMaskConnectingComponent,
        SaveLandsComponent,
        ExceptionDialogContentComponent,
        PortLandsComponent,
        BuyLandsComponent,
        UtopiaGameComponent,
        ConnectionStatusIndicatorComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        FlexLayoutModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTableModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule,
        MatRippleModule,
    ],
    providers: [
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }
    ],
    bootstrap: [AppComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
})
export class AppModule {

    constructor() {
    }
}
