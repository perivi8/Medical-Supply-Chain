import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { environment } from '../../environments/environment';
import jsPDF from 'jspdf';

declare const QRCode: any; // Declare QRCode for CDN usage

@Component({
  selector: 'app-consumer',
  templateUrl: './consumer.component.html',
  styleUrls: ['./consumer.component.scss']
})
export class ConsumerComponent implements OnInit, AfterViewInit {
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
  currentDate: Date = new Date();

  private apiUrl = environment.apiUrl;

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

    // Load medicine list (optional, retained for potential future use)
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

  ngAfterViewInit() {
    // Generate QR code after view is initialized
    this.generateQRCode();
  }

  toggleScanner() {
    if (!this.hasCamera) {
      this.error = 'Camera not available in this browser or device.';
      return;
    }
    this.isScanning = !this.isScanning;
    this.error = null;
    if (!this.isScanning) {
      this.history = null;
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
      this.generateQRCode();
    } else {
      this.error = 'Invalid QR code format. Expected /consumer/<id>.';
      this.isScanning = false;
      console.log('Regex match failed for:', result);
    }
  }

  onScanError(error: any) {
    this.error = 'Scanner error: Unable to read QR code. Ensure the QR code is clear and well-lit.';
    this.isScanning = false;
    console.error('Scan error:', error);
  }

  private fetchProductHistory(id: string) {
    this.isLoading = true;
    console.log('Fetching history for ID:', id);
    this.http.get(`${this.apiUrl}/product_history/${id}`).subscribe({
      next: (data: any) => {
        console.log('History data:', data);
        this.history = data;
        this.router.navigate([`/consumer/${id}`]);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.status === 404 ? 'Product history not found for this ID.' : 'Failed to load product history. Please try again.';
        this.history = null;
        this.isLoading = false;
        console.error('History fetch error:', err);
      }
    });
  }

  private generateQRCode(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.medicineId) {
        console.error('No medicineId provided for QR code generation');
        resolve();
        return;
      }
      if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        resolve();
        return;
      }
      const qrCanvas = document.getElementById('qrCodeCanvas') as HTMLCanvasElement;
      if (!qrCanvas) {
        console.error('QR code canvas not found');
        resolve();
        return;
      }
      // Clear previous QR code
      const context = qrCanvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
      }
      // Generate QR code
      const qrText = `${window.location.origin}/consumer/${this.medicineId}`;
      new QRCode(qrCanvas, {
        text: qrText,
        width: 100,
        height: 100,
        colorDark: '#2c3e50',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      // Wait for QR code to render
      setTimeout(() => {
        console.log('QR code generated for:', qrText);
        resolve();
      }, 100); // Short delay to ensure canvas rendering
    });
  }

  async downloadInvoice() {
    // Generate QR code and wait for it to complete
    await this.generateQRCode();

    const doc = new jsPDF();
    
    // Set document properties
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80); // Matches #2c3e50 from CSS
    doc.text('Medicine Journey Invoice', 20, 20);
    doc.setFontSize(12);
    doc.text(`Medicine ID: ${this.medicineId || 'N/A'}`, 20, 30);
    doc.text(`Generated on: ${this.currentDate.toLocaleString()}`, 20, 40);
    doc.setTextColor(0, 0, 0);

    // Define table properties
    const tableColumnWidths = [50, 120]; // Widths for "Stage" and "Details" columns
    let y = 50; // Starting Y position for the table
    const rowHeight = 10;
    const headerHeight = 12;
    const padding = 2;
    const tableStartX = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxTableWidth = pageWidth - 40; // Margin on both sides

    // Draw table header
    doc.setFillColor(44, 62, 80); // Matches #2c3e50 from CSS
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.rect(tableStartX, y, tableColumnWidths[0], headerHeight, 'F');
    doc.rect(tableStartX + tableColumnWidths[0], y, tableColumnWidths[1], headerHeight, 'F');
    doc.text('Stage', tableStartX + padding, y + 8);
    doc.text('Details', tableStartX + tableColumnWidths[0] + padding, y + 8);
    y += headerHeight;

    // Table content
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 73, 94); // Matches #34495e from CSS
    doc.setFontSize(9);

    const drawRow = (stage: string, details: string[], bgColor: string) => {
      doc.setFillColor(bgColor);
      doc.rect(tableStartX, y, tableColumnWidths[0], rowHeight * details.length, 'F');
      doc.rect(tableStartX + tableColumnWidths[0], y, tableColumnWidths[1], rowHeight * details.length, 'F');
      doc.text(stage, tableStartX + padding, y + 7);
      details.forEach((detail, index) => {
        doc.text(detail, tableStartX + tableColumnWidths[0] + padding, y + 7 + (index * rowHeight));
      });
      y += rowHeight * details.length;
    };

    let rowIndex = 0;

    // Farmer (Raw Material)
    if (this.history?.raw_material) {
      const details = [
        `Type: ${this.history.raw_material.material_type || 'N/A'}`,
        `Quantity: ${this.history.raw_material.quantity || 'N/A'} kg`,
        `Location: ${this.history.raw_material.source_location || 'N/A'}`,
        `Date: ${this.history.raw_material.supply_date || 'N/A'}`
      ];
      drawRow('Farmer', details, rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff');
      rowIndex++;
      y += 5; // Space between sections
    }

    // Manufacturer
    if (this.history?.medicine) {
      const details = [
        `Name: ${this.history.medicine.medicine_name || 'N/A'}`,
        `Batch: ${this.history.medicine.batch_number || 'N/A'}`,
        `Production: ${this.history.medicine.production_date || 'N/A'}`,
        `Expiry: ${this.history.medicine.expiry_date || 'N/A'}`
      ];
      drawRow('Manufacturer', details, rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff');
      rowIndex++;
      y += 5;
    }

    // Distributor
    if (this.history?.distributions) {
      this.history.distributions.forEach((dist: any, index: number) => {
        const details = [
          `Shipment: ${dist.shipment_date || 'N/A'}`,
          `Transport: ${dist.transport_method || 'N/A'}`,
          `Destination: ${dist.destination || 'N/A'}`,
          `Storage: ${dist.storage_condition || 'N/A'}`
        ];
        drawRow(`Distributor`, details, rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff');
        rowIndex++;
        y += 5;
      });
    }

    // Retailer
    if (this.history?.retail_sales) {
      this.history.retail_sales.forEach((sale: any, index: number) => {
        const details = [
          `Received: ${sale.received_date || 'N/A'}`,
          `Price: $${sale.price || 'N/A'}`,
          `Location: ${sale.retail_location || 'N/A'}`
        ];
        drawRow(`Retailer`, details, rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff');
        rowIndex++;
        y += 5;
      });
    }

    // Status Section
    doc.setFillColor(232, 245, 233); // Matches #e8f5e9 from CSS
    doc.rect(tableStartX, y, maxTableWidth, 20, 'F');
    doc.setDrawColor(40, 167, 69); // Matches #28a745 from CSS
    doc.rect(tableStartX, y, maxTableWidth, 20);
    doc.setTextColor(40, 167, 69);
    doc.setFontSize(10);
    doc.text('Status: Verified Authentic', tableStartX + padding, y + 12);
    y += 30;

    // Add QR code at the bottom
    const qrCanvas = document.getElementById('qrCodeCanvas') as HTMLCanvasElement;
    if (qrCanvas && qrCanvas.toDataURL('image/png').length > 100) { // Check if canvas has content
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      const qrWidth = 50; // Size for the QR code
      const qrX = (pageWidth - qrWidth) / 2; // Center the QR code
      try {
        doc.addImage(qrDataUrl, 'PNG', qrX, y, qrWidth, qrWidth);
        console.log('QR code added to PDF at bottom for:', `${window.location.origin}/consumer/${this.medicineId}`);
        y += qrWidth + 10;
      } catch (error) {
        console.error('Failed to add QR code to PDF:', error);
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text('Error: Failed to add QR code', tableStartX, y + 10);
        y += 20;
      }
    } else {
      console.error('QR code canvas is empty or not found');
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text(`Error: QR code not available for Medicine ID: ${this.medicineId || 'N/A'}`, tableStartX, y + 10);
      y += 20;
    }

    // Save the PDF
    doc.save(`Medicine_Invoice_${this.medicineId || 'unknown'}.pdf`);
  }
}