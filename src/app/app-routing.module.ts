import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectedGuard } from './ehtereum/connected.guard';
import { NotSupportGuard } from './ehtereum/not-support.guard';
import { SupportGuard } from './ehtereum/support.guard';
import { HomeComponent } from './home/home.component';
import { MetaMaskConnectingComponent } from './meta-mask-connecting/meta-mask-connecting.component';
import { MetaMaskNotFoundComponent } from './meta-mask-not-found/meta-mask-not-found.component';

const routes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [SupportGuard, ConnectedGuard] },
    { path: 'not-supported', component: MetaMaskNotFoundComponent, canActivate: [NotSupportGuard] },
    { path: 'connect', component: MetaMaskConnectingComponent, canActivate: [SupportGuard] },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
