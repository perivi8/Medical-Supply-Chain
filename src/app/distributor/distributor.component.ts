import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-distributor',
  templateUrl: './distributor.component.html',
  styleUrls: []
})
export class DistributorComponent implements OnInit {
  user_id: number | null = null;
  first_name: string = '';
  medicine_id: number | null = null;
  shipment_date: string = '';
  transport_method: string = '';
  destination: string = '';
  storage_condition: string = '';
  medicines: { id: number; medicine_name: string; batch_number: string }[] = [];
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

    this.loadMedicines();
  }

  loadMedicines() {
    this.http.get<{ id: number; medicine_name: string; batch_number: string }[]>(`${this.apiUrl}/medicines`).subscribe({
      next: (data) => {
        this.medicines = data;
        if (data.length === 0) {
          this.error = 'No medicines available. Please check back later.';
        } else {
          this.error = null;
        }
      },
      error: (err) => {
        this.error = 'Failed to load medicines. Please check the server.';
        console.error('Medicines fetch error:', err);
      }
    });
  }

  onSubmit() {
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;

    if (!this.user_id || !this.medicine_id || !this.shipment_date || !this.transport_method || !this.destination || !this.storage_condition) {
      this.error = 'Please fill in all fields.';
      return;
    }

    const distribution = {
      user_id: this.user_id,
      medicine_id: this.medicine_id,
      shipment_date: this.shipment_date,
      transport_method: this.transport_method,
      destination: this.destination,
      storage_condition: this.storage_condition
    };

    this.http.post(`${this.apiUrl}/distribution`, distribution).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Distribution added successfully. QR code generated.';
        this.qrCodeBase64 = response.qr_code;
        this.resetForm();
        this.loadMedicines(); // Refresh dropdown after submission
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add distribution. Please try again.';
        console.error('Distribution error:', err);
      }
    });
  }

  selectMedicine(id: string) {
    this.medicine_id = parseInt(id, 10);
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;
  }

  private resetForm() {
    this.medicine_id = null;
    this.shipment_date = '';
    this.transport_method = '';
    this.destination = '';
    this.storage_condition = '';
  }
}