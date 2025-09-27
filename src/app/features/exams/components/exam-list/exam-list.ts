import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamsService } from '../../../exams/services/exams';
import { AuthService } from '../../../auth/services/auth';
import { ScoresService } from '../../../../core/services/scores.service';

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
  private scoresService = inject(ScoresService);

  // Computed signals
  exams = computed(() => this.examsService.exams());
  isLoading = computed(() => this.examsService.isLoading());
  error = computed(() => this.examsService.error());
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());

  async ngOnInit(): Promise<void> {
    await this.examsService.loadExams();
    // Force reload scores from storage
    this.scoresService.loadFromStorage();
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

  // Get user's best score for an exam
  getUserBestScore(examId: string): number | null {
    const user = this.currentUser();
    if (!user) return null;
    
    const bestScore = this.scoresService.getUserBestScore(user.id, examId);
    return bestScore ? bestScore.percentage : null;
  }

  // Get score color based on percentage
  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Get score badge class
  getScoreBadgeClass(percentage: number): string {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  // View exam details
  viewExamDetails(examId: string): void {
    // For now, we'll just show an alert with exam details
    // In a real app, this could open a modal or navigate to a details page
    const exam = this.examsService.getExamById(examId);
    if (exam) {
      const details = `
        Title: ${exam.title}
        Description: ${exam.description}
        Duration: ${this.getDurationText(exam.duration)}
        Questions: ${exam.questions.length}
        Passing Score: ${exam.passingScore}%
        Level: ${exam.courseId === '1' ? 'Beginner' : exam.courseId === '2' ? 'Intermediate' : 'Advanced'}
      `;
      alert(details);
    }
  }
}