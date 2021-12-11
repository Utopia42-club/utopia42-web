import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UtopiaGameComponent } from './utopia-game/utopia-game.component';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'game', component: UtopiaGameComponent },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule
{
}
