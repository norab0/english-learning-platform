import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private _isMenuOpen = signal(false);

  // Computed signals
  public readonly isMenuOpen = this._isMenuOpen.asReadonly();
  public readonly currentUser = computed(() => this.authService.currentUser());
  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  public readonly isAdmin = computed(() => this.authService.isAdmin());

  toggleMenu(): void {
    this._isMenuOpen.set(!this._isMenuOpen());
  }

  closeMenu(): void {
    this._isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}
