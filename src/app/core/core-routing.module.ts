import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';
import { NewCardComponent } from './new-card/new-card.component';
import { ReviewComponent } from './review/review.component';
import { EditCardComponent } from './edit-card/edit-card.component';

const routes: Routes = [
  { path: '', component: CoreComponent },
  { path: 'new', component: NewCardComponent },
  { path: 'review', component: ReviewComponent },
  { path: 'edit/:id', component: EditCardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
