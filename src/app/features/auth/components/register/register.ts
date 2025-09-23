import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  private _isSubmitting = signal(false);

  // Computed signals
  public readonly isSubmitting = this._isSubmitting.asReadonly();
  public readonly isFormValid = computed(() => this.registerForm.valid);

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['user', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form value:', this.registerForm.value);
    
    if (this.registerForm.valid) {
      this._isSubmitting.set(true);
      
      const formValue = this.registerForm.value;
      const userData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role
      };
      
      console.log('Submitting user data:', userData);
      
      const success = await this.authService.register(userData);
      
      if (success) {
        this.router.navigate(['/courses']);
      }
      
      this._isSubmitting.set(false);
    } else {
      console.log('Form is invalid, cannot submit');
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && (field.touched || field.dirty)) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email';
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  async testRegister(): Promise<void> {
    console.log('Testing register with admin account...');
    
    const userData = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test@admin.com',
      password: 'test123',
      role: 'admin' as 'user' | 'admin'
    };
    
    console.log('Submitting test user data:', userData);
    
    const success = await this.authService.register(userData);
    
    if (success) {
      console.log('Test registration successful!');
      this.router.navigate(['/courses']);
    } else {
      console.log('Test registration failed');
    }
  }
}
