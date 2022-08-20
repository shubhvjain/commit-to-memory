import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
const routes: Routes = [
  { path: '', component:HomeComponent },
  { path: 'core', loadChildren: () => import('./core/core.module').then(m => m.CoreModule) }, 
  { path: 'plugin', loadChildren: () => import('./plugins/plugins.module').then(m => m.PluginsModule) }, 
  { path: 'setting', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
