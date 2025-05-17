import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-consumer',
  templateUrl: './consumer.component.html',
  styleUrls: ['./consumer.component.scss']
})
export class ConsumerComponent implements OnInit {
  medicineId: string = '';
  medicines: { id: number; medicine_name: string; batch_number: string }[] = [];
  history: any = null;
  error: string | null = null;
  isScanning: boolean = false;
  isLoading: boolean = false;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;
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
        this.currentDevice = this.availableDevices[0];
        console.log('Available cameras:', this.availableDevices);
      }).catch(err => {
        console.error('Error enumerating devices:', err);
        this.error = 'Failed to access camera devices.';
        this.hasCamera = false;
      });
    } else {
      this.error = 'Camera not supported in this browser.';
      this.hasCamera = false;
    }

    // Load medicine list
    this.http.get<{ id: number; medicine_name: string; batch_number: string }[]>(`${this.apiUrl}/medicines`).subscribe({
      next: (data) => {
        this.medicines = data;
        if (data.length === 0) {
          console.log('No medicines available, scanner still functional.');
        }
      },
      error: (err) => {
        this.error = 'Failed to load medicines. Scanner is still available.';
        console.error('Medicines fetch error:', err);
      }
    });

    // Load from route param if available
    const medicineId = this.route.snapshot.paramMap.get('id');
    if (medicineId && medicineId !== '0') {
      console.log('Loading history from route param:', medicineId);
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
    console.log('Scanner toggled:', this.isScanning);
  }

  onScanSuccess(result: string) {
    console.log('Scanned QR code:', result);
    const match = result.match(/\/consumer\/(\d+)/);
    if (match && match[1]) {
      this.medicineId = match[1];
      this.isScanning = false;
      console.log('Extracted ID:', this.medicineId);
      this.fetchProductHistory(this.medicineId);
    } else {
      this.error = 'Invalid QR code format. Expected /consumer/<id>.';
      console.log('Regex match failed for:', result);
    }
  }

  onScanError(error: any) {
    this.error = 'Scanner error: Unable to read QR code. Ensure the QR code is clear and well-lit.';
    this.isScanning = false;
    console.error('Scan error:', error);
  }

  onSubmit() {
    this.error = null;
    this.history = null;
    if (!this.medicineId) {
      this.error = 'Please enter a valid medicine ID.';
      return;
    }
    console.log('Submitting manual ID:', this.medicineId);
    this.fetchProductHistory(this.medicineId);
  }

  selectMedicine(id: string) {
    this.medicineId = id;
    this.error = null;
    this.history = null;
    console.log('Selected medicine ID:', id);
    this.fetchProductHistory(this.medicineId);
  }

  private fetchProductHistory(id: string) {
    this.isLoading = true;
    console.log('Fetching history for ID:', id);
    this.http.get(`${this.apiUrl}/consumer/${id}`).subscribe({
      next: (data: any) => {
        console.log('History data:', data);
        this.history = data;
        this.router.navigate([`/consumer/${id}`]);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product history. Please try again.';
        this.history = null;
        this.isLoading = false;
        console.error('History fetch error:', err);
      }
    });
  }
}