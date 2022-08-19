import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { CardComponent } from './card/card.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  { path: '', component: SettingsComponent },
  { path: 'card', component: CardComponent },
  { path: 'review', component: ReviewComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
