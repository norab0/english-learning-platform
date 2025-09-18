import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss'
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: string = 'text-primary-600';

  get sizeClass(): string {
    switch (this.size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  }
}
