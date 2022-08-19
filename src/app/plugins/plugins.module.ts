import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PluginsRoutingModule } from './plugins-routing.module';
import { PluginsComponent } from './plugins.component';
import { StatsComponent } from './stats/stats.component';
import { SearchComponent } from './search/search.component';
import { QuizComponent } from './quiz/quiz.component';


@NgModule({
  declarations: [
    PluginsComponent,
    StatsComponent,
    SearchComponent,
    QuizComponent
  ],
  imports: [
    CommonModule,
    PluginsRoutingModule
  ]
})
export class PluginsModule { }
