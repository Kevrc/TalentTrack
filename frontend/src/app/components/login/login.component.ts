import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Login failed';
      },
    });
  }
}
