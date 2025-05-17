import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  // Backend API URL - Change this if deploying to Render
  private apiUrl = 'https://suply-chain-backend-6.onrender.com';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.form.password !== this.form.confirm_password) {
      this.error = 'Passwords do not match';
      return;
    }

    console.log('Registering user with role:', this.form.role); // Debug log

    this.http.post(`${this.apiUrl}/register`, this.form).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error.error || 'Registration failed';
        console.error('Registration error:', err);
      }
    });
  }

  isFormIncomplete(): boolean {
    const f = this.form;
    return !f.first_name || !f.last_name || !f.email || !f.phone ||
           !f.password || !f.confirm_password || !f.role ||
           f.password !== f.confirm_password;
  }
}
