import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: any = null;
  showMobileMenu = false;

  constructor(private router: Router, private scroller: ViewportScroller) {}

  ngOnInit() {
    this.updateUser();
    window.addEventListener('storage', this.updateUser.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.updateUser.bind(this));
  }

  private updateUser() {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }

  logout() {
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      this.user = null;
      this.router.navigate(['/home']);
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar') && !target.closest('.mobile-nav-panel')) {
      this.closeMobileMenu();
    }
  }

  goToAbout() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        this.scroller.scrollToAnchor('about');
      }, 100);
    });
  }

  goTocontact() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        this.scroller.scrollToAnchor('contact');
      }, 100);
    });
  }
  goTohome() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        this.scroller.scrollToAnchor('home');
      }, 100);
    });
  }
  goToconsumer() {
    this.router.navigate(['/consumer']).then(() => {
      setTimeout(() => {
        this.scroller.scrollToAnchor('consumer');
      }, 100);
    });
  }
}