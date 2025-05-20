import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('phone') phone!: ElementRef;
  @ViewChild('scanBar') scanBar!: ElementRef;
  @ViewChild('medicineScreenName') medicineScreenName!: ElementRef;
  @ViewChild('medicineNameBelow') medicineNameBelow!: ElementRef;

  texts = ["Medicine name", "Distribute", "Retail Sale", "Delivered"];
  index = 0;
  animationInterval: any;

  ngAfterViewInit() {
    this.runScanAnimation();
    this.animationInterval = setInterval(() => this.runScanAnimation(), 10000);
  }

  runScanAnimation() {
    const phoneEl = this.phone.nativeElement as HTMLElement;
    const scanBarEl = this.scanBar.nativeElement as HTMLElement;
    const medicineScreenEl = this.medicineScreenName.nativeElement as HTMLElement;
    const medicineBelowEl = this.medicineNameBelow.nativeElement as HTMLElement;

    // Reset states
    phoneEl.style.transition = 'none';
    phoneEl.style.opacity = '0';
    phoneEl.style.top = '270px';
    phoneEl.style.right = '-140px';

    medicineBelowEl.style.opacity = '0';
    medicineScreenEl.style.opacity = '0';

    scanBarEl.style.opacity = '0';
    scanBarEl.style.top = '-40px';
    scanBarEl.style.animation = '';

    // Update text content for this cycle
    medicineScreenEl.textContent = this.texts[this.index];
    medicineBelowEl.textContent = this.texts[this.index];

    setTimeout(() => {
      phoneEl.style.transition = 'all 2s ease';
      phoneEl.style.opacity = '1';
      phoneEl.style.top = '30px';
      phoneEl.style.right = '0px';
    }, 50);

    setTimeout(() => {
      scanBarEl.style.opacity = '1';
      scanBarEl.style.animation = 'scanAnim 2.5s ease forwards';
    }, 2300);

    setTimeout(() => {
      medicineScreenEl.style.opacity = '1';
    }, 4300);

    setTimeout(() => {
      phoneEl.style.opacity = '0';
      medicineScreenEl.style.opacity = '0';
      scanBarEl.style.opacity = '0';
      scanBarEl.style.animation = '';
    }, 6000);

    setTimeout(() => {
      medicineBelowEl.style.opacity = '1';
    }, 6300);

    this.index = (this.index + 1) % this.texts.length;
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }
}