import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService } from '../../services/courses';
import { AuthService } from '../../../auth/services/auth';
import { DurationPipe } from '../../../../shared/pipes/duration-pipe';
import { LevelBadgePipe } from '../../../../shared/pipes/level-badge-pipe';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DurationPipe, 
    LevelBadgePipe, 
    LoadingSpinnerComponent
  ],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss'
})
export class CourseListComponent implements OnInit {
  // Services
  public coursesService = inject(CoursesService);
  public authService = inject(AuthService);

  // Signals
  private _searchTerm = signal('');
  private _selectedLevel = signal<string>('all');

  // Computed signals
  public readonly searchTerm = this._searchTerm.asReadonly();
  public readonly selectedLevel = this._selectedLevel.asReadonly();
  
  public readonly filteredCourses = computed(() => {
    let courses = this.coursesService.courses();
    
    // Filter by search term
    if (this._searchTerm()) {
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(this._searchTerm().toLowerCase()) ||
        course.description.toLowerCase().includes(this._searchTerm().toLowerCase())
      );
    }
    
    // Filter by level
    if (this._selectedLevel() !== 'all') {
      courses = courses.filter(course => course.level === this._selectedLevel());
    }
    
    return courses;
  });

  constructor() {
    // Services are injected using inject() function
  }

  async ngOnInit(): Promise<void> {
    await this.coursesService.loadCourses();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchTerm.set(target.value);
  }

  onLevelChange(level: string): void {
    this._selectedLevel.set(level);
  }

  getLevels(): string[] {
    return ['all', 'beginner', 'intermediate', 'advanced'];
  }
}
