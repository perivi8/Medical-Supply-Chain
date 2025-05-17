import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  identifier = '';
  password = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('User found in localStorage:', parsedUser);
      this.redirectToRole(parsedUser.role);
    }
  }

  onSubmit() {
    this.error = '';
    console.log('Attempting login with identifier:', this.identifier);

    this.http.post(`${environment.apiUrl}/login`, {
      identifier: this.identifier,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        if (response && response.role) {
          localStorage.setItem('user', JSON.stringify(response));
          // Dispatch custom event to notify header
          window.dispatchEvent(new Event('storage'));
          this.redirectToRole(response.role);
        } else {
          this.error = 'Invalid login response from server. Please try again.';
          console.warn('Unexpected response format:', response);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        console.error('Login error:', err);
      }
    });
  }

  private redirectToRole(role: string) {
    console.log('Redirecting to role:', role);
    const routes: { [key: string]: string } = {
      Farmer: '/farmer',
      Manufacturer: '/manufacturer',
      Distributor: '/distributor',
      Retailer: '/retailer'
    };
    const route = routes[role] || '/home';
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }
}