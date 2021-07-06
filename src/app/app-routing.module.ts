import { BuyLandsComponent } from './buy-lands/buy-lands.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectedGuard } from './ehtereum/connected.guard';
import { NotSupportGuard } from './ehtereum/not-support.guard';
import { SupportGuard } from './ehtereum/support.guard';
import { HomeComponent } from './home/home.component';
import { MetaMaskConnectingComponent } from './meta-mask-connecting/meta-mask-connecting.component';
import { MetaMaskNotFoundComponent } from './meta-mask-not-found/meta-mask-not-found.component';
import { PortLandsComponent } from './port-lands/port-lands.component';
import { SaveLandsComponent } from './save-lands/save-lands.component';

const routes: Routes = [
    {
        path: '', component: HomeComponent, canActivate: [SupportGuard, ConnectedGuard],
        children: [
            { path: 'save/:ipfsKeys', component: SaveLandsComponent},
            { path: 'port', component: PortLandsComponent},
            { path: 'buy/:coordinates', component: BuyLandsComponent},
        ]
    },
    { path: 'not-supported', component: MetaMaskNotFoundComponent, canActivate: [NotSupportGuard] },
    { path: 'connect', component: MetaMaskConnectingComponent, canActivate: [SupportGuard] },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
