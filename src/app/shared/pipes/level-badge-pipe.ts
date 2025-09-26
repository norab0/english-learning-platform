import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'levelBadge',
  standalone: true
})
export class LevelBadgePipe implements PipeTransform {

  transform(value: string): { text: string; class: string } {
    switch (value) {
      case 'beginner':
        return { text: 'Beginner', class: 'bg-green-100 text-green-800' };
      case 'intermediate':
        return { text: 'Intermediate', class: 'bg-yellow-100 text-yellow-800' };
      case 'advanced':
        return { text: 'Advanced', class: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
    }
  }
}
