import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';

import { TagInputModule } from 'ngx-chips';
import { MarkdownModule } from 'ngx-markdown';

import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [CardComponent],
  imports: [
    CommonModule,
    FormsModule,
    TagInputModule,
    MarkdownModule.forRoot(), 
  ],
  exports:[FormsModule,CardComponent,TagInputModule,MarkdownModule]
})
export class SharedModule { }
