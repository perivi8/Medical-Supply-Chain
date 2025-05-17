import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConsumerComponent } from './consumer/consumer.component';
import { RetailerComponent } from './retailer/retailer.component';
import { DistributorComponent } from './distributor/distributor.component';
import { FarmerComponent } from './farmer/farmer.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'farmer', component: FarmerComponent },
  { path: 'manufacturer', component: ManufacturerComponent },
  { path: 'distributor', component: DistributorComponent },
  { path: 'retailer', component: RetailerComponent },
  { path: 'consumer', component: ConsumerComponent },
  { path: 'consumer/:id', component: ConsumerComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ConsumerComponent,
    RetailerComponent,
    DistributorComponent,
    FarmerComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    ManufacturerComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    ZXingScannerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }