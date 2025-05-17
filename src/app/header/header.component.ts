import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common'; // It will help to redirect the page 

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
  }

  logout() {
    localStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/home']);
    this.closeMobileMenu();
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
      }, 100); // Wait for HomeComponent to render
    });
  }
   goTocontact() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        this.scroller.scrollToAnchor('contact');
      }, 100); // Wait for HomeComponent to render
    });
  }


}
