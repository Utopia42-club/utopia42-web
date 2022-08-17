import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UtopiaGameComponent } from './utopia-game/utopia-game.component';
import { NetworkParamsGuardGuard } from "./network-params-guard.guard";

const routes: Routes = [
    { path: 'rpc', component: HomeComponent },
    { path: '', canActivate: [NetworkParamsGuardGuard], component: UtopiaGameComponent },
    { path: ':network/:contract', canActivate: [NetworkParamsGuardGuard], component: UtopiaGameComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule
{
}
