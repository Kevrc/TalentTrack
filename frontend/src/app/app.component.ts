import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, CommonModule],
})
export class AppComponent implements OnInit {
  title = 'TalentTrack';

  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // El ThemeService se inicializa automáticamente y establece el tema
    console.log('AppComponent initialized with theme:', this.themeService.getTheme());
  }
}
