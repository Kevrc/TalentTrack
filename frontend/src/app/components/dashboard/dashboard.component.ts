import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  profile: any = null;

  ngOnInit(): void {
    this.auth.profile().subscribe({
      next: (res) => (this.profile = res),
      error: () => this.router.navigate(['/login']),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
