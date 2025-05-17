import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-retailer',
  templateUrl: './retailer.component.html',
  styleUrls: []
})
export class RetailerComponent implements OnInit {
  user_id: number | null = null;
  first_name: string = '';
  distribution_id: number | null = null;
  received_date: string = '';
  price: number | null = null;
  retail_location: string = '';
  distributions: { id: number; medicine_id: number; destination: string; shipment_date: string }[] = [];
  success: string | null = null;
  error: string | null = null;
  qrCodeBase64: string | null = null;
  private apiUrl = 'https://suply-chain-backend-6.onrender.com';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.user_id = user.id || null;
    this.first_name = user.first_name || '';

    this.loadDistributions();
  }

  loadDistributions() {
    this.http.get<{ id: number; medicine_id: number; destination: string; shipment_date: string }[]>(`${this.apiUrl}/distributions`).subscribe({
      next: (data) => {
        this.distributions = data;
        if (data.length === 0) {
          this.error = 'No distributions available. Please check back later.';
        } else {
          this.error = null;
        }
      },
      error: (err) => {
        this.error = 'Failed to load distributions. Please check the server.';
        console.error('Distributions fetch error:', err);
      }
    });
  }

  onSubmit() {
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;

    if (!this.user_id || !this.distribution_id || !this.received_date || !this.price || !this.retail_location) {
      this.error = 'Please fill in all fields.';
      return;
    }

    const retailSale = {
      user_id: this.user_id,
      distribution_id: this.distribution_id,
      received_date: this.received_date,
      price: this.price,
      retail_location: this.retail_location
    };

    this.http.post(`${this.apiUrl}/retail`, retailSale).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Retail sale added successfully. QR code generated.';
        this.qrCodeBase64 = response.qr_code;
        this.resetForm();
        this.loadDistributions(); // Refresh dropdown after submission
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add retail sale. Please try again.';
        console.error('Retail sale error:', err);
      }
    });
  }

  selectDistribution(id: string) {
    this.distribution_id = parseInt(id, 10);
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;
  }

  private resetForm() {
    this.distribution_id = null;
    this.received_date = '';
    this.price = null;
    this.retail_location = '';
  }
}

