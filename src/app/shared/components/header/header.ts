import { Component, signal, computed } from '@angular/core';
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
  private _isMenuOpen = signal(false);

  // Computed signals
  public readonly isMenuOpen = this._isMenuOpen.asReadonly();

  constructor(public authService: AuthService) {}

  toggleMenu(): void {
    this._isMenuOpen.set(!this._isMenuOpen());
  }

  closeMenu(): void {
    this._isMenuOpen.set(false);
  }
}
