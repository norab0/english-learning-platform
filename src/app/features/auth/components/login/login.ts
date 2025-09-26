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
  public readonly isFormValid = computed(() => this.loginForm.valid && !this._isSubmitting());

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
      
      const success = await this.authService.login(this.loginForm.value);
      
      if (success) {
        // Redirect based on user role
        const user = this.authService.currentUser();
        if (user?.role === 'admin') {
          this.router.navigate(['/users/admin']);
        } else {
          this.router.navigate(['/courses']);
        }
      }
      
      this._isSubmitting.set(false);
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

}
