import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material';
import {ChartComponent} from './chart/chart.component';
import {PlayerSelectionComponent} from './player-selection/player-selection.component';
import {RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
  {path: 'player-selection', component: PlayerSelectionComponent},
  {path: 'chart', component: ChartComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    PlayerSelectionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
