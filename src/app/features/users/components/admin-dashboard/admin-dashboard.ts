import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { ScoresService } from '../../../../core/services/scores.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private usersService = inject(UsersService);
  private scoresService = inject(ScoresService);

  // Signals
  users = computed(() => this.usersService.users());
  totalUsers = computed(() => this.usersService.totalUsers());
  adminUsers = computed(() => this.usersService.adminUsers());
  regularUsers = computed(() => this.usersService.regularUsers());

  scores = computed(() => this.scoresService.scores());
  totalScores = computed(() => this.scoresService.totalScores());
  averageScore = computed(() => this.scoresService.averageScore());

  // Local state
  showAddUser = signal(false);

  // New user form
  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  };

  // Computed signals
  recentScores = computed(() => {
    return [...this.scores()]
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 5);
  });

  topPerformers = computed(() => {
    return [...this.scores()]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  });

  ngOnInit(): void {
    this.usersService.loadUsers();
  }

  async addUser(): Promise<void> {
    try {
      await this.usersService.createUser({
        firstName: this.newUser.firstName,
        lastName: this.newUser.lastName,
        email: this.newUser.email,
        role: this.newUser.role
      });
      this.resetNewUserForm();
      this.showAddUser.set(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async toggleUserRole(user: User): Promise<void> {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await this.usersService.updateUserRole(user.id, newRole);
  }

  async deleteUser(user: User): Promise<void> {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      await this.usersService.deleteUser(user.id);
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  private resetNewUserForm(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user'
    };
  }
}