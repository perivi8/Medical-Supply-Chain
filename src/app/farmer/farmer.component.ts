import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  styleUrls: []
})
export class FarmerComponent implements OnInit {
  user_id: number | null = null;
  material_type: string = '';
  quantity: number | null = null;
  source_location: string = '';
  supply_date: string = '';
  success: string | null = null;
  error: string | null = null;
  qrCodeBase64: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.user_id = user.id || null;
  }

  onSubmit() {
    this.error = null;
    this.success = null;
    this.qrCodeBase64 = null;

    if (!this.user_id || !this.material_type || !this.quantity || !this.source_location || !this.supply_date) {
      this.error = 'Please fill in all fields.';
      return;
    }

    const rawMaterial = {
      user_id: this.user_id,
      material_type: this.material_type,
      quantity: this.quantity,
      source_location: this.source_location,
      supply_date: this.supply_date
    };

    this.http.post(`${this.apiUrl}/raw_material`, rawMaterial).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Raw material added successfully. QR code generated.';
        this.qrCodeBase64 = response.qr_code;
        this.resetForm();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to add raw material. Please try again.';
        console.error('Raw material error:', err);
      }
    });
  }

  private resetForm() {
    this.material_type = '';
    this.quantity = null;
    this.source_location = '';
    this.supply_date = '';
  }
}