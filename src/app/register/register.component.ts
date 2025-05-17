import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: []
})
export class RegisterComponent {
  form = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: ''
  };
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.error = '';
    if (this.form.password !== this.form.confirm_password) {
      this.error = 'Passwords do not match';
      console.warn('Password mismatch:', this.form.password, this.form.confirm_password);
      return;
    }

    console.log('Registering user with role:', this.form.role);

    this.http.post(`${environment.apiUrl}/register`, this.form).subscribe({
      next: () => {
        console.log('Registration successful for:', this.form.email);
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }

  isFormIncomplete(): boolean {
    const { first_name, last_name, email, phone, password, confirm_password, role } = this.form;
    return !first_name || !last_name || !email || !phone || !password || !confirm_password || !role;
  }
}