import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PluginsComponent } from './plugins.component';

import { StatsComponent } from './stats/stats.component';
import { SearchComponent } from './search/search.component';
import { QuizComponent } from './quiz/quiz.component';


const routes: Routes = [
  { path: 'stats', component: StatsComponent },
  { path: 'search', component: SearchComponent },
  { path: 'explore', component: QuizComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PluginsRoutingModule { }
