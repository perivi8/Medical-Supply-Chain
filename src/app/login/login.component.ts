import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  first_name: string;
  role: string;
}

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
      try {
        const parsedUser: User = JSON.parse(user);
        if (parsedUser.role) {
          if (!environment.production) {
            console.log('User found in localStorage:', parsedUser);
          }
          this.redirectToRole(parsedUser.role);
        }
      } catch (e) {
        if (!environment.production) {
          console.error('Error parsing user from localStorage:', e);
        }
        localStorage.removeItem('user');
      }
    }
  }

  onSubmit() {
    this.error = '';
    if (!this.identifier || !this.password) {
      this.error = 'Please enter both identifier and password';
      return;
    }

    this.http.post<User>(`${environment.apiUrl}/login`, {
      identifier: this.identifier,
      password: this.password
    }).subscribe({
      next: (response) => {
        if (response && response.id && response.first_name && response.role) {
          const user: User = {
            id: response.id,
            first_name: response.first_name,
            role: response.role
          };
          localStorage.setItem('user', JSON.stringify(user));
          window.dispatchEvent(new Event('storage'));
          if (!environment.production) {
            console.log('Login successful:', user);
          }
          this.redirectToRole(user.role);
        } else {
          this.error = 'Invalid login response. Please try again.';
          if (!environment.production) {
            console.error('Invalid response structure:', response);
          }
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        if (!environment.production) {
          console.error('Login error:', err);
        }
      }
    });
  }

  private redirectToRole(role: string) {
    const routes: { [key: string]: string } = {
      Farmer: '/farmer',
      Manufacturer: '/manufacturer',
      Distributor: '/distributor',
      Retailer: '/retailer'
    };
    const route = routes[role] || '/home';
    if (!routes[role] && !environment.production) {
      console.warn('Unknown role:', role);
    }
    this.router.navigate([route]);
  }
}