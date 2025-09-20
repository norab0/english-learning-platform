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

  // Computed signals
  public readonly currentUser = computed(() => this.authService.currentUser());
  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  public readonly isAdmin = computed(() => this.authService.isAdmin());

  logout(): void {
    this.authService.logout();
  }
}
