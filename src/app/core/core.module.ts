import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { NewCardComponent } from './new-card/new-card.component';
import { ReviewComponent } from './review/review.component';


@NgModule({
  declarations: [
    CoreComponent,
    NewCardComponent,
    ReviewComponent
  ],
  imports: [
    CommonModule,
    CoreRoutingModule
  ]
})
export class CoreModule { }
