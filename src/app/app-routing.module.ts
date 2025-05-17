import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { FarmerComponent } from './farmer/farmer.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { DistributorComponent } from './distributor/distributor.component';
import { RetailerComponent } from './retailer/retailer.component';
import { ConsumerComponent } from './consumer/consumer.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'farmer', component: FarmerComponent },
  { path: 'manufacturer', component: ManufacturerComponent },
  { path: 'distributor', component: DistributorComponent },
  { path: 'retailer', component: RetailerComponent },
  { path: 'consumer', component: ConsumerComponent },
  { path: 'consumer/:id', component: ConsumerComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }