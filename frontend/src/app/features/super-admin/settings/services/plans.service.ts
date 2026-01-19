import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Plan {
  id?: number;
  name: string;
  price: number;
  currency: string;
  max_users: number;
  features: string[];
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private apiUrl = 'http://localhost:8000/api/plans';
  private plansSubject = new BehaviorSubject<Plan[]>([]);
  public plans$ = this.plansSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPlans();
  }

  loadPlans() {
    this.http.get<Plan[]>(this.apiUrl).subscribe(
      plans => this.plansSubject.next(plans),
      error => {
        console.error('Error loading plans:', error);
        // Usar datos por defecto si hay error
        this.plansSubject.next(this.getDefaultPlans());
      }
    );
  }

  getPlans(): Observable<Plan[]> {
    return this.plans$;
  }

  getPlanById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}/`);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(`${this.apiUrl}/`, plan).pipe(
      tap(newPlan => {
        const currentPlans = this.plansSubject.value;
        this.plansSubject.next([...currentPlans, newPlan]);
      })
    );
  }

  updatePlan(id: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}/`, plan).pipe(
      tap(updatedPlan => {
        const currentPlans = this.plansSubject.value;
        const index = currentPlans.findIndex(p => p.id === id);
        if (index > -1) {
          currentPlans[index] = updatedPlan;
          this.plansSubject.next([...currentPlans]);
        }
      })
    );
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => {
        const currentPlans = this.plansSubject.value;
        this.plansSubject.next(currentPlans.filter(p => p.id !== id));
      })
    );
  }

  private getDefaultPlans(): Plan[] {
    return [
      {
        id: 1,
        name: 'Básico',
        price: 49,
        currency: 'USD',
        max_users: 5,
        features: [
          'Gestión de asistencia básica',
          'Reportes simples',
          'Soporte por email'
        ],
        status: 'active'
      },
      {
        id: 2,
        name: 'Profesional',
        price: 149,
        currency: 'USD',
        max_users: 50,
        features: [
          'Gestión avanzada',
          'Análisis de desempeño',
          'Soporte prioritario',
          'Integraciones básicas'
        ],
        status: 'active'
      },
      {
        id: 3,
        name: 'Empresarial',
        price: 499,
        currency: 'USD',
        max_users: 500,
        features: [
          'Características ilimitadas',
          'Analytics completo',
          'Soporte 24/7',
          'Integraciones personalizadas',
          'SSO'
        ],
        status: 'active'
      }
    ];
  }
}
