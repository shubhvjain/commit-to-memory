import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { CardComponent } from './card/card.component';
import { ReviewComponent } from './review/review.component';


@NgModule({
  declarations: [
    SettingsComponent,
    CardComponent,
    ReviewComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
