import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  private _isSubmitting = signal(false);

  // Computed signals
  public readonly isSubmitting = this._isSubmitting.asReadonly();
  public readonly isFormValid = computed(() => {
    const isValid = this.loginForm.valid && !this._isSubmitting();
    console.log('Form validation check:', {
      formValid: this.loginForm.valid,
      isSubmitting: this._isSubmitting(),
      finalResult: isValid,
      formValue: this.loginForm.value,
      formErrors: this.loginForm.errors
    });
    return isValid;
  });

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this._isSubmitting.set(true);
      
      console.log('Attempting login with:', this.loginForm.value);
      const success = await this.authService.login(this.loginForm.value);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, navigating to courses');
        this.router.navigate(['/courses']);
      } else {
        console.log('Login failed');
      }
      
      this._isSubmitting.set(false);
    } else {
      console.log('Form is invalid:', this.loginForm.errors);
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email';
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least 6 characters`;
      }
    }
    return '';
  }

  async testLogin(): Promise<void> {
    console.log('Test login clicked');
    this._isSubmitting.set(true);
    
    const testCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };
    
    console.log('Attempting test login with:', testCredentials);
    const success = await this.authService.login(testCredentials);
    console.log('Test login result:', success);
    
    if (success) {
      console.log('Test login successful, navigating to courses');
      this.router.navigate(['/courses']);
    } else {
      console.log('Test login failed');
    }
    
    this._isSubmitting.set(false);
  }
}
