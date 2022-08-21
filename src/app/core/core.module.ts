import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagInputModule } from 'ngx-chips';
import { FormsModule } from '@angular/forms';

import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { NewCardComponent } from './new-card/new-card.component';
import { ReviewComponent } from './review/review.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [
    CoreComponent,
    NewCardComponent,
    ReviewComponent,
    CardComponent
  ],
  imports: [
    TagInputModule,
    FormsModule,
    CommonModule,
    CoreRoutingModule
  ]
})
export class CoreModule { }
