import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {

  transform(value: number): string {
    if (!value || value <= 0) {
      return '0 min';
    }

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    } else {
      return `${minutes} min`;
    }
  }
}
