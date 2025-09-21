import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamsService } from '../../../exams/services/exams';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-list.html',
  styleUrl: './exam-list.scss'
})
export class ExamListComponent implements OnInit {
  private examsService = inject(ExamsService);
  private authService = inject(AuthService);

  // Computed signals
  exams = computed(() => this.examsService.exams());
  isLoading = computed(() => this.examsService.isLoading());
  error = computed(() => this.examsService.error());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  async ngOnInit(): Promise<void> {
    await this.examsService.loadExams();
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDurationText(duration: number): string {
    if (duration < 60) {
      return `${duration} min`;
    }
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
}