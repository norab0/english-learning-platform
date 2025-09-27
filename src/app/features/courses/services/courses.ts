import { Injectable, signal, computed } from '@angular/core';
import { Course } from '../../../core/models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  // Signals
  private _courses = signal<Course[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals
  public readonly courses = this._courses.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly totalCourses = computed(() => this._courses().length);

  // Computed courses by level
  public readonly beginnerCourses = computed(() => 
    this._courses().filter(course => course.level === 'beginner')
  );
  public readonly intermediateCourses = computed(() => 
    this._courses().filter(course => course.level === 'intermediate')
  );
  public readonly advancedCourses = computed(() => 
    this._courses().filter(course => course.level === 'advanced')
  );

  constructor() {
    this.loadMockData();
    this.loadFromStorage();
  }

  async loadCourses(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(500);
      // Data is already loaded in constructor
    } catch {
      this._error.set('Failed to load courses');
    } finally {
      this._isLoading.set(false);
    }
  }

  getCourseById(id: string): Course | undefined {
    return this._courses().find(course => course.id === id);
  }

  private loadFromStorage(): void {
    try {
      const storedCourses = localStorage.getItem('english-learning-courses');
      if (storedCourses) {
        const parsedCourses = JSON.parse(storedCourses);
        // Merge with existing mock data, avoiding duplicates
        const existingIds = this._courses().map(course => course.id);
        const newCourses = parsedCourses.filter((course: Course) => !existingIds.includes(course.id));
        if (newCourses.length > 0) {
          this._courses.update(courses => [...courses, ...newCourses]);
        }
      }
    } catch {
      // Error loading from storage - ignore
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('english-learning-courses', JSON.stringify(this._courses()));
    } catch {
      // Error loading from storage - ignore
    }
  }

  private loadMockData(): void {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'English Basics',
        description: 'Learn the fundamentals of English grammar and vocabulary',
        level: 'beginner',
        duration: 120,
        lessons: [
          {
            id: '1-1',
            title: 'Introduction to English',
            content: 'Welcome to English learning!',
            order: 1,
            duration: 30
          },
          {
            id: '1-2',
            title: 'Basic Grammar',
            content: 'Learn basic sentence structure',
            order: 2,
            duration: 45
          },
          {
            id: '1-3',
            title: 'Common Vocabulary',
            content: 'Essential words for daily conversation',
            order: 3,
            duration: 45
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        title: 'Intermediate Conversation',
        description: 'Improve your speaking and listening skills',
        level: 'intermediate',
        duration: 180,
        lessons: [
          {
            id: '2-1',
            title: 'Daily Conversations',
            content: 'Practice common daily dialogues',
            order: 1,
            duration: 60
          },
          {
            id: '2-2',
            title: 'Business English',
            content: 'Professional communication skills',
            order: 2,
            duration: 60
          },
          {
            id: '2-3',
            title: 'Cultural Context',
            content: 'Understanding cultural nuances',
            order: 3,
            duration: 60
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        title: 'Advanced Writing',
        description: 'Master advanced writing techniques and styles',
        level: 'advanced',
        duration: 240,
        lessons: [
          {
            id: '3-1',
            title: 'Academic Writing',
            content: 'Formal writing for academic purposes',
            order: 1,
            duration: 80
          },
          {
            id: '3-2',
            title: 'Creative Writing',
            content: 'Express yourself through creative writing',
            order: 2,
            duration: 80
          },
          {
            id: '3-3',
            title: 'Professional Reports',
            content: 'Writing comprehensive business reports',
            order: 3,
            duration: 80
          }
        ],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ];

    this._courses.set(mockCourses);
  }

    // Admin CRUD operations
    async addCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
      this._isLoading.set(true);
      this._error.set(null);
      try {
        await this.delay(500);
        const newCourse: Course = {
          ...course,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this._courses.update(courses => [...courses, newCourse]);
        this.saveToStorage();
      } catch {
        this._error.set('Failed to add course');
      } finally {
        this._isLoading.set(false);
      }
    }

    async updateCourse(updatedCourse: Course): Promise<void> {
      this._isLoading.set(true);
      this._error.set(null);
      try {
        await this.delay(500);
        this._courses.update(courses =>
          courses.map(course => (course.id === updatedCourse.id ? { ...updatedCourse, updatedAt: new Date() } : course))
        );
        this.saveToStorage();
      } catch {
        this._error.set('Failed to update course');
      } finally {
        this._isLoading.set(false);
      }
    }

    async deleteCourse(courseId: string): Promise<void> {
      this._isLoading.set(true);
      this._error.set(null);
      try {
        await this.delay(500);
        this._courses.update(courses => courses.filter(course => course.id !== courseId));
      } catch {
        this._error.set('Failed to delete course');
      } finally {
        this._isLoading.set(false);
      }
    }

    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
