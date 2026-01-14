import { Component } from '@angular/core';
import { Sidebar } from '../../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../header/header';
@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, RouterOutlet, HeaderComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  standalone: true,
})
export class AdminLayout {}
