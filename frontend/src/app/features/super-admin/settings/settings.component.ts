import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PlanModalComponent } from './plan-modal/plan-modal.component';
import { PlansService, Plan } from './services/plans.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PlanModalComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  activeTab: 'catalogs' | 'plans' = 'catalogs';
  isModalOpen = false;
  selectedPlan: Plan | null = null;
  plans: Plan[] = [];
  loading = false;

  catalogs = [
    {
      id: 1,
      title: 'Países',
      icon: '🌍',
      description: 'Gestiona la lista de países disponibles en la plataforma',
      count: 195
    },
    {
      id: 2,
      title: 'Monedas',
      icon: '💱',
      description: 'Configura las monedas y tipos de cambio soportados',
      count: 42
    },
    {
      id: 3,
      title: 'Bancos',
      icon: '🏦',
      description: 'Administra los bancos y entidades financieras integradas',
      count: 28
    }
  ];

  constructor(private plansService: PlansService) {}

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.loading = true;
    this.plansService.getPlans().subscribe(
      plans => {
        this.plans = plans;
        this.loading = false;
      },
      error => {
        console.error('Error loading plans:', error);
        this.loading = false;
      }
    );
  }

  switchTab(tab: 'catalogs' | 'plans') {
    this.activeTab = tab;
  }

  openModal(plan?: Plan) {
    this.selectedPlan = plan || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedPlan = null;
  }

  savePlan(plan: Plan) {
    this.loading = true;
    if (this.selectedPlan && this.selectedPlan.id) {
      // Editar
      this.plansService.updatePlan(this.selectedPlan.id, plan).subscribe(
        () => {
          this.loadPlans();
          this.closeModal();
        },
        error => {
          console.error('Error updating plan:', error);
          this.loading = false;
        }
      );
    } else {
      // Crear
      this.plansService.createPlan(plan).subscribe(
        () => {
          this.loadPlans();
          this.closeModal();
        },
        error => {
          console.error('Error creating plan:', error);
          this.loading = false;
        }
      );
    }
  }

  editPlan(plan: Plan) {
    this.openModal(plan);
  }

  deletePlan(id: number | undefined) {
    if (!id) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este plan?')) {
      this.loading = true;
      this.plansService.deletePlan(id).subscribe(
        () => {
          this.loadPlans();
        },
        error => {
          console.error('Error deleting plan:', error);
          this.loading = false;
        }
      );
    }
  }
}
