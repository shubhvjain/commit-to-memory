import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TagInputModule } from 'ngx-chips';
import { MarkdownModule } from 'ngx-markdown';

import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { NewCardComponent } from './new-card/new-card.component';
import { ReviewComponent } from './review/review.component';
import { CardComponent } from './card/card.component';
import { EditCardComponent } from './edit-card/edit-card.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    CoreComponent,
    NewCardComponent,
    ReviewComponent,
    CardComponent,
    EditCardComponent,
    LoginComponent
  ],
  imports: [
    TagInputModule,
    MarkdownModule.forRoot(), 
    FormsModule,
    CommonModule,
    CoreRoutingModule
  ]
})
export class CoreModule { }
