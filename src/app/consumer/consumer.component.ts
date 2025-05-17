import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-consumer',
  templateUrl: './consumer.component.html',
  styleUrls: []
})
export class ConsumerComponent implements OnInit {
  medicineId: string = '';
  medicines: { id: number; medicine_name: string; batch_number: string }[] = [];
  history: any = null;
  error: string | null = null;
  isScanning: boolean = false;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;  // ✅ updated from `null`
  formatsEnabled: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
  hasCamera: boolean = false;

  private apiUrl = 'https://suply-chain-backend-6.onrender.com';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Detect camera devices
    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        this.availableDevices = devices.filter(d => d.kind === 'videoinput');
        this.hasCamera = this.availableDevices.length > 0;
        this.currentDevice = this.availableDevices[0]; // ✅ updated from `|| null`
      });
    }

    // Load medicine list
    this.http.get<{ id: number; medicine_name: string; batch_number: string }[]>(`${this.apiUrl}/medicines`).subscribe({
      next: (data) => {
        this.medicines = data;
        if (data.length === 0) {
          this.error = 'No medicines available. Please check back later.';
        }
      },
      error: (err) => {
        this.error = 'Failed to load medicines. Please check the server.';
        console.error('Medicines fetch error:', err);
      }
    });

    // Load from route param if available
    const medicineId = this.route.snapshot.paramMap.get('id');
    if (medicineId && medicineId !== '0') {
      this.medicineId = medicineId;
      this.fetchProductHistory(medicineId);
    }
  }

  toggleScanner() {
    this.isScanning = !this.isScanning;
    this.error = null;
    if (!this.isScanning) {
      this.history = null;
    } else if (!this.hasCamera) {
      this.error = 'Camera not available in this browser or device.';
      this.isScanning = false;
    }
  }

  onScanSuccess(result: string) {
    const match = result.match(/\/consumer\/(\d+)/);
    if (match && match[1]) {
      this.medicineId = match[1];
      this.isScanning = false;
      this.fetchProductHistory(this.medicineId);
    } else {
      this.error = 'Invalid QR code. Please scan a valid medicine QR code.';
    }
  }

  onScanError(error: any) {
    this.error = 'Scanner error: Unable to read QR code. Please try again.';
    console.error('Scan error:', error);
  }

  onSubmit() {
    this.error = null;
    this.history = null;
    if (!this.medicineId) {
      this.error = 'Please enter a valid medicine ID.';
      return;
    }
    this.fetchProductHistory(this.medicineId);
  }

  selectMedicine(id: string) {
    this.medicineId = id;
    this.error = null;
    this.history = null;
    this.fetchProductHistory(this.medicineId);
  }

  private fetchProductHistory(id: string) {
    this.http.get(`${this.apiUrl}/product_history/${id}`).subscribe({
      next: (data: any) => {
        this.history = data;
        this.router.navigate([`/consumer/${id}`]);
      },
      error: (err) => {
        this.error = 'Failed to load product history. Please try again.';
        this.history = null;
        console.error('Product history fetch error:', err);
      }
    });
  }
}
