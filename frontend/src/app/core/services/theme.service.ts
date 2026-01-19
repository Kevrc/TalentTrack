import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const preferredTheme = savedTheme || this.getSystemTheme();
    this.applyTheme(preferredTheme);
    console.log('ThemeService initialized with theme:', preferredTheme);
  }

  private applyTheme(theme: Theme): void {
    // Establecer en el subject
    this.themeSubject.next(theme);
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
    
    // Establecer en el atributo del elemento raíz
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', theme);
    
    // Verificar que se estableció
    console.log('Applied theme:', theme, 'HTML attribute:', htmlElement.getAttribute('data-theme'));
  }

  getTheme(): Theme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', currentTheme, 'to', newTheme);
    this.applyTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
  }

  private getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
