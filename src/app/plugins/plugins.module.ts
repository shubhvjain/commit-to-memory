import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PluginsRoutingModule } from './plugins-routing.module';
import { PluginsComponent } from './plugins.component';
import { StatsComponent } from './stats/stats.component';
import { SearchComponent } from './search/search.component';
import { QuizComponent } from './quiz/quiz.component';
import { SafeThingPipe } from '../safe-thing.pipe';

@NgModule({
  declarations: [
    PluginsComponent,
    StatsComponent,
    SearchComponent,
    QuizComponent,
    SafeThingPipe
  ],
  imports: [
    CommonModule,
    PluginsRoutingModule,
    FormsModule,
    NgxSmartModalModule.forRoot()
  ]
})
export class PluginsModule { }
