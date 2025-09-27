import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExamsService } from '../../../exams/services/exams';
import { CoursesService } from '../../../courses/services/courses';
import { Exam, Question } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-exam-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exam-management.html',
  styleUrl: './exam-management.scss'
})
export class ExamManagementComponent {
  private examsService = inject(ExamsService);
  private coursesService = inject(CoursesService);
  private fb = inject(FormBuilder);

  // Signals
  private _showAddForm = signal(false);
  private _editingExam = signal<Exam | null>(null);
  private _isSubmitting = signal(false);

  // Computed signals
  exams = computed(() => this.examsService.exams());
  courses = computed(() => this.coursesService.courses());
  showAddForm = this._showAddForm.asReadonly();
  editingExam = this._editingExam.asReadonly();
  isSubmitting = this._isSubmitting.asReadonly();

  // Form
  examForm: FormGroup;

  constructor() {
    this.examForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      level: ['beginner', [Validators.required]],
      courseId: ['', [Validators.required]],
      duration: [30, [Validators.required, Validators.min(1)]],
      passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      questions: this.fb.array([])
    });

    this.examsService.loadExams();
    this.coursesService.loadCourses();
    this.addQuestion(); // Add one question by default
  }

  get questionsArray(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['multiple-choice', [Validators.required]],
      options: this.fb.array(['', '', '', '']),
      correctAnswer: [0, [Validators.required, Validators.min(0)]],
      points: [10, [Validators.required, Validators.min(1)]]
    }, { validators: this.questionValidator });
  }

  // Custom validator for questions
  questionValidator(control: FormGroup): Record<string, unknown> | null {
    const type = control.get('type')?.value;
    const options = control.get('options') as FormArray;
    
    if (type === 'multiple-choice') {
      const validOptions = options.controls.filter(opt => opt.value?.trim() !== '');
      if (validOptions.length < 2) {
        return { insufficientOptions: true };
      }
    }
    
    return null;
  }

  addQuestion(): void {
    this.questionsArray.push(this.createQuestionForm());
  }

  removeQuestion(index: number): void {
    if (this.questionsArray.length > 1) {
      this.questionsArray.removeAt(index);
    }
  }


  toggleAddForm(): void {
    this._showAddForm.set(!this._showAddForm());
    if (!this._showAddForm()) {
      this.resetForm();
    }
  }

  editExam(exam: Exam): void {
    this._editingExam.set(exam);
    this._showAddForm.set(true);
    
    // Clear existing questions
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }
    
    // Add exam questions
    exam.questions.forEach(question => {
      const questionForm = this.createQuestionForm();
      questionForm.patchValue({
        text: question.text,
        type: question.type,
        correctAnswer: question.correctAnswer
      });
      
      // Set options
      const optionsArray = questionForm.get('options') as FormArray;
      if (question.options) {
        question.options.forEach((option, index) => {
          if (optionsArray.at(index)) {
            optionsArray.at(index).setValue(option);
          }
        });
      }
      
      this.questionsArray.push(questionForm);
    });
    
    this.examForm.patchValue({
      title: exam.title,
      description: exam.description,
      level: exam.level,
      courseId: exam.courseId || '',
      duration: exam.duration,
      passingScore: exam.passingScore
    });
  }

  async saveExam(): Promise<void> {
    
    // Mark form as touched to show validation errors
    this.examForm.markAllAsTouched();
    
    if (this.examForm.valid && this.questionsArray.length > 0) {
      this._isSubmitting.set(true);
      
      try {
        const formValue = this.examForm.value;
        const questions: Question[] = formValue.questions.map((q: { text: string; type: string; points: number; correctAnswer: string; options?: string[] }, index: number) => {
          const processedQuestion: Question = {
            id: `q${index + 1}`,
            text: q.text,
            type: q.type,
            points: q.points || 10,
            correctAnswer: '' // Initialize with empty string
          };

          if (q.type === 'multiple-choice') {
            processedQuestion.options = q.options.filter((opt: string) => opt.trim() !== '');
            processedQuestion.correctAnswer = parseInt(q.correctAnswer);
          } else if (q.type === 'true-false') {
            processedQuestion.correctAnswer = q.correctAnswer === 'true' ? 'true' : 'false';
          } else if (q.type === 'fill-in-blank') {
            processedQuestion.correctAnswer = q.correctAnswer || '';
          }

          return processedQuestion;
        });

        const examData = {
          title: formValue.title,
          description: formValue.description,
          level: formValue.level,
          courseId: formValue.courseId,
          duration: formValue.duration,
          passingScore: formValue.passingScore,
          questions: questions
        };
        
        
        if (this._editingExam()) {
          // Update existing exam
          const updatedExam: Exam = {
            ...this._editingExam() as Exam,
            ...examData,
            updatedAt: new Date()
          };
          await this.examsService.updateExam(updatedExam);
          alert('✅ Exam updated successfully!');
        } else {
          // Add new exam
          await this.examsService.addExam(examData);
          alert('✅ Exam created successfully!');
        }
        
        this.resetForm();
      } catch {
        alert('Error saving exam. Please try again.');
      } finally {
        this._isSubmitting.set(false);
      }
    } else {
      
      // Get detailed error messages
      const formErrors = this.getFormErrors();
      const questionErrors = this.getQuestionErrors();
      
      let errorMessage = 'Please fix the following errors:\n\n';
      
      if (formErrors.length > 0) {
        errorMessage += 'Form Errors:\n' + formErrors.join('\n') + '\n\n';
      }
      
      if (this.questionsArray.length === 0) {
        errorMessage += 'Questions:\n• At least one question is required\n\n';
      } else if (questionErrors.length > 0) {
        errorMessage += 'Question Errors:\n' + questionErrors.join('\n');
      }
      
      alert(errorMessage);
    }
  }

  async deleteExam(examId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        await this.examsService.deleteExam(examId);
      } catch {
        // Error deleting exam - ignore
      }
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.examForm.reset();
    this.examForm.patchValue({
      level: 'beginner',
      courseId: '',
      duration: 30,
      passingScore: 70
    });
    
    // Clear questions and add one default
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }
    this.addQuestion();
    
    this._showAddForm.set(false);
    this._editingExam.set(null);
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Public getter for courses
  getCourses(): Course[] {
    return this.courses();
  }

  // Question type change handler
  onQuestionTypeChange(questionIndex: number, event: Event): void {
    const questionForm = this.questionsArray.at(questionIndex);
    const questionType = (event.target as HTMLSelectElement).value;
    
    // Clear options array
    const optionsArray = questionForm.get('options') as FormArray;
    while (optionsArray.length !== 0) {
      optionsArray.removeAt(0);
    }
    
    // Reset correct answer
    questionForm.patchValue({ correctAnswer: '' });
    
    if (questionType === 'multiple-choice') {
      // Add 4 default options
      for (let i = 0; i < 4; i++) {
        optionsArray.push(this.fb.control(''));
      }
      questionForm.patchValue({ correctAnswer: 0 });
    } else if (questionType === 'true-false') {
      questionForm.patchValue({ correctAnswer: 'true' });
    } else if (questionType === 'fill-in-blank') {
      questionForm.patchValue({ correctAnswer: '' });
    }
  }

  // Add option to multiple choice question
  addOption(questionIndex: number): void {
    const questionForm = this.questionsArray.at(questionIndex);
    const optionsArray = questionForm.get('options') as FormArray;
    optionsArray.push(this.fb.control(''));
  }

  // Remove option from multiple choice question
  removeOption(questionIndex: number, optionIndex: number): void {
    const questionForm = this.questionsArray.at(questionIndex);
    const optionsArray = questionForm.get('options') as FormArray;
    if (optionsArray.length > 2) {
      optionsArray.removeAt(optionIndex);
    }
  }

  // Helper methods for template
  getQuestionOptions(question: AbstractControl): AbstractControl[] {
    const optionsArray = question.get('options') as FormArray;
    return optionsArray ? optionsArray.controls : [];
  }

  getQuestionOptionsLength(question: AbstractControl): number {
    const optionsArray = question.get('options') as FormArray;
    return optionsArray ? optionsArray.length : 0;
  }

  // Get detailed form errors
  getFormErrors(): string[] {
    const errors: string[] = [];
    
    if (this.examForm.get('title')?.errors?.['required']) {
      errors.push('• Title is required');
    }
    if (this.examForm.get('title')?.errors?.['minlength']) {
      errors.push('• Title must be at least 3 characters');
    }
    if (this.examForm.get('description')?.errors?.['required']) {
      errors.push('• Description is required');
    }
    if (this.examForm.get('description')?.errors?.['minlength']) {
      errors.push('• Description must be at least 10 characters');
    }
    if (this.examForm.get('level')?.errors?.['required']) {
      errors.push('• Level is required');
    }
    if (this.examForm.get('courseId')?.errors?.['required']) {
      errors.push('• Course is required');
    }
    if (this.examForm.get('duration')?.errors?.['required']) {
      errors.push('• Duration is required');
    }
    if (this.examForm.get('duration')?.errors?.['min']) {
      errors.push('• Duration must be at least 1 minute');
    }
    if (this.examForm.get('passingScore')?.errors?.['required']) {
      errors.push('• Passing score is required');
    }
    if (this.examForm.get('passingScore')?.errors?.['min']) {
      errors.push('• Passing score must be at least 0%');
    }
    if (this.examForm.get('passingScore')?.errors?.['max']) {
      errors.push('• Passing score must be at most 100%');
    }
    
    return errors;
  }

  // Get detailed question errors
  getQuestionErrors(): string[] {
    const errors: string[] = [];
    
    this.questionsArray.controls.forEach((question, index) => {
      const questionNum = index + 1;
      
      if (question.get('text')?.errors?.['required']) {
        errors.push(`• Question ${questionNum}: Text is required`);
      }
      if (question.get('text')?.errors?.['minlength']) {
        errors.push(`• Question ${questionNum}: Text must be at least 5 characters`);
      }
      if (question.get('type')?.errors?.['required']) {
        errors.push(`• Question ${questionNum}: Type is required`);
      }
      if (question.get('points')?.errors?.['required']) {
        errors.push(`• Question ${questionNum}: Points is required`);
      }
      if (question.get('points')?.errors?.['min']) {
        errors.push(`• Question ${questionNum}: Points must be at least 1`);
      }
      
      // Check specific question type validations
      const questionType = question.get('type')?.value;
      if (questionType === 'multiple-choice') {
        const options = question.get('options') as FormArray;
        const validOptions = options.controls.filter(opt => opt.value?.trim() !== '');
        if (validOptions.length < 2) {
          errors.push(`• Question ${questionNum}: At least 2 options are required for multiple choice`);
        }
        if (!question.get('correctAnswer')?.value && question.get('correctAnswer')?.value !== 0) {
          errors.push(`• Question ${questionNum}: Correct answer is required`);
        }
      } else if (questionType === 'fill-in-blank') {
        if (question.get('correctAnswer')?.errors?.['required']) {
          errors.push(`• Question ${questionNum}: Correct answer is required`);
        }
      }
    });
    
    return errors;
  }

  // Validation helper
  isFormValid(): boolean {
    return this.examForm.valid && this.questionsArray.length > 0 && this.questionsArray.valid;
  }
}
