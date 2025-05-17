import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: []
})
export class ManufacturerComponent implements OnInit {
  user_id: number | null = null;
  first_name: string = '';
  raw_material_id: number | null = null;
  medicine_name: string = '';
  batch_number: string = '';
  production_date: string = '';
  expiry_date: string = '';
  raw_materials: { id: number; material_type: string; quantity: number }[] = [];
  success: string | null = null;
  error: string | null = null;
  qrCodeBase64: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.user_id = user.id || null;
    this.first_name = user.first_name || '';

    this.loadRawMaterials();
  }

  loadRawMaterials() {
    this.http.get<{ id: number; material_type: string; quantity: number }[]>(`${this.apiUrl}/raw_materials`).subscribe({
      next: (data) => {
        this.raw_materials = data;
        if (data.length === 0) {
          this.error = 'No raw materials available. Please check back later.';
        } else {
          this.error = null;
        }
      },
      error: (err) => {
        this.error = 'Failed to load raw materials. Please check the server.';
        console.error('Raw materials fetch error:', err);
      }
    });
  }

  onSubmit() {
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;

    if (!this.user_id || !this.raw_material_id || !this.medicine_name || !this.batch_number || !this.production_date || !this.expiry_date) {
      this.error = 'Please fill in all fields.';
      return;
    }

    const medicine = {
      user_id: this.user_id,
      raw_material_id: this.raw_material_id,
      medicine_name: this.medicine_name,
      batch_number: this.batch_number,
      production_date: this.production_date,
      expiry_date: this.expiry_date
    };

    this.http.post(`${this.apiUrl}/medicine`, medicine).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Medicine added successfully. QR code generated.';
        this.qrCodeBase64 = response.qr_code;
        this.resetForm();
        this.loadRawMaterials(); // Refresh dropdown after submission
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add medicine. Please try again.';
        console.error('Medicine error:', err);
      }
    });
  }

  selectRawMaterial(id: string) {
    this.raw_material_id = parseInt(id, 10);
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;
  }

  private resetForm() {
    this.raw_material_id = null;
    this.medicine_name = '';
    this.batch_number = '';
    this.production_date = '';
    this.expiry_date = '';
  }
}