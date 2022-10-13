import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TagInputModule } from 'ngx-chips';
import { MarkdownModule } from 'ngx-markdown';

import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { NewCardComponent } from './new-card/new-card.component';
import { ReviewComponent } from './review/review.component';
// import { CardComponent } from './card/card.component';
import { EditCardComponent } from './edit-card/edit-card.component';
import { LoginComponent } from './login/login.component';

import { SharedModule } from '../shared/shared.module';
import { PracticeComponent } from './practice/practice.component';

@NgModule({
  declarations: [
    CoreComponent,
    NewCardComponent,
    ReviewComponent,
    // CardComponent,
    EditCardComponent,
    LoginComponent,
    PracticeComponent
  ],
  imports: [
    TagInputModule,
    MarkdownModule.forRoot(), 
    FormsModule,
    CommonModule,
    CoreRoutingModule,
    SharedModule,
  ]
})
export class CoreModule { }
