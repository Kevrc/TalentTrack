import { Component } from '@angular/core';
import { Sidebar } from '../../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {}
