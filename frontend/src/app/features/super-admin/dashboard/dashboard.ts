import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { AuditService } from '../../../core/services/audit.service';
import { DashboardService, DashboardStatsResponse, EmpresasPorMes, TopEmpresaActiva, EventoPorTipo, ActividadDiaria } from '../../../core/services/dashboard.service';
import { CompanyService, Empresa } from '../../../core/services/company.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgChartsModule, NgxEchartsDirective],
  providers: [provideEcharts()],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private auditService = inject(AuditService);
  private companyService = inject(CompanyService);

  // State
  cargando = true;
  stats: DashboardStatsResponse | null = null;
  empresasPorMes: EmpresasPorMes[] = [];
  topEmpresas: TopEmpresaActiva[] = [];
  eventosPorTipo: EventoPorTipo[] = [];
  actividadDiaria: ActividadDiaria[] = [];
  empresasTabla: Empresa[] = [];
  empresasFiltradas: Empresa[] = [];
  paisFiltro = 'TODOS';
  estadoFiltro = 'TODOS';
  busqueda = '';
  paisLabels: string[] = [];
  paisValues: number[] = [];
  
  // Filtro de meses para gráfica de creación/eliminación
  mesesDisponibles: { periodo: string; datos: any[] }[] = [];
  mesFiltroSeleccionado = '';
  mesesLabels: string[] = [];

  // Chart 1: Crecimiento de empresas (BAR)
  lineEmpresasData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  lineEmpresasOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true, position: 'top' },
      filler: { propagate: true }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { color: '#f3f4f6' }, beginAtZero: false, border: { display: false } },
    },
  };

  // Chart 2: Estados de empresas (DONUT)
  donutEstadosData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  donutEstadosOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '60%'
  };

  // Chart 3: Distribución por país (BAR)
  // Chart 3: Mapa interactivo de presencia
  mapaOptions: EChartsOption = {};
  mapaReady = false;
  mapaError = false;

  ngOnInit() {
    this.cargarEstadisticas();
    this.cargarEmpresas();
  }

  cargarEstadisticas() {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.mesesDisponibles = stats.empresas_por_mes;
        this.topEmpresas = stats.top_empresas_activas;
        this.eventosPorTipo = stats.eventos_por_tipo;
        this.actividadDiaria = stats.actividad_diaria;

        // Establecer el mes actual como seleccionado por defecto
        if (this.mesesDisponibles.length > 0) {
          this.mesFiltroSeleccionado = this.mesesDisponibles[this.mesesDisponibles.length - 1].periodo;
        }

        this.actualizarGrafica();

        // Chart 2: Donut - Estados (Activas, Inactivas)
        this.donutEstadosData = {
          labels: ['Activas', 'Inactivas'],
          datasets: [
            {
              data: [stats.empresas_estado.activas, stats.empresas_estado.inactivas],
              backgroundColor: ['#154B52', '#ef4444'] as string[],
              hoverBackgroundColor: ['#0E3A3F', '#dc2626'] as string[],
            },
          ],
        };

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.cargando = false;
      },
    });
  }

  actualizarGrafica() {
    const mesSeleccionado = this.mesesDisponibles.find(m => m.periodo === this.mesFiltroSeleccionado);
    if (!mesSeleccionado) return;

    const diasDelMes = mesSeleccionado.datos;

    this.lineEmpresasData = {
      labels: diasDelMes.map(m => m.mes),
      datasets: [
        {
          label: 'Creadas',
          data: diasDelMes.map(m => m.creadas),
          backgroundColor: '#154B52',
          borderColor: '#154B52',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: '#0E3A3F',
        },
        {
          label: 'Eliminadas',
          data: diasDelMes.map(m => m.eliminadas),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: '#dc2626',
        },
      ],
    };
  }

  cargarEmpresas() {
    this.companyService.getCompanies().subscribe({
      next: (empresas) => {
        this.empresasTabla = empresas;
        this.empresasFiltradas = [...empresas];
        this.buildPaisChart(empresas);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al cargar empresas:', err);
      },
    });
  }

  // Helpers
  formatMesEtiqueta(mes: EmpresasPorMes): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesIndex = (Number(mes.mes) || 1) - 1;
    return `${meses[mesIndex]}`;
  }

  buildPaisChart(empresas: Empresa[]) {
    const porPais = empresas.reduce<Record<string, number>>((acc, emp) => {
      const key = emp.pais_nombre || emp.pais || 'Sin país';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    this.paisLabels = Object.keys(porPais);
    this.paisValues = Object.values(porPais);

    this.buildMapa(porPais);
  }

  get donutEstadoColors(): string[] {
    const ds = this.donutEstadosData.datasets?.[0] as any;
    const bg = ds?.backgroundColor;
    return Array.isArray(bg) ? bg as string[] : [];
  }

  async buildMapa(paises: Record<string, number>) {
    try {
      this.mapaReady = false;
      this.mapaError = false;

      const echarts = await import('echarts');
      
      // Cargar el geojson del mapa mundial desde assets
      const response = await fetch('/assets/world.json');
      if (!response.ok) throw new Error('Failed to fetch map');
      const worldJson = await response.json();
      echarts.registerMap('world', worldJson);

      const consolidado = Object.entries(paises).reduce<Record<string, number>>((acc, [pais, value]) => {
        const key = this.normalizePais(pais);
        acc[key] = (acc[key] || 0) + (value || 0);
        return acc;
      }, {});

      const data = Object.entries(consolidado).map(([name, value]) => ({ name, value }));
      const max = Math.max(...Object.values(consolidado), 1);

      this.mapaOptions = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => `${params.name || 'País'}: ${params.value || 0} empresas`,
        },
        visualMap: {
          min: 0,
          max,
          left: 'left',
          bottom: 0,
          text: ['Más', 'Menos'],
          inRange: { color: ['#fee2e2', '#dc2626'] },
        },
        series: [
          {
            name: 'Presencia',
            type: 'map',
            map: 'world',
            roam: false,
            zoom: 1.05,
            emphasis: {
              itemStyle: { areaColor: '#b91c1c' },
              label: { show: true, color: '#0f172a', fontWeight: 'bold' },
            },
            itemStyle: {
              borderColor: '#e2e8f0',
              borderWidth: 0.6,
              areaColor: '#f8fafc',
            },
            data,
          },
        ],
      } satisfies EChartsOption;

      this.mapaReady = true;
    } catch (err) {
      console.error('Error al construir mapa', err);
      this.mapaError = true;
    }
  }

  normalizePais(nombre: string): string {
    if (!nombre) return 'Other';
    const key = nombre.trim().toLowerCase();
    const mapa: Record<string, string> = {
      'peru': 'Peru', 'perú': 'Peru',
      'ecuador': 'Ecuador',
      'colombia': 'Colombia',
      'chile': 'Chile',
      'argentina': 'Argentina',
      'bolivia': 'Bolivia',
      'paraguay': 'Paraguay',
      'uruguay': 'Uruguay',
      'brasil': 'Brazil', 'brazil': 'Brazil',
      'venezuela': 'Venezuela',
      'mexico': 'Mexico', 'méxico': 'Mexico',
      'estados unidos': 'United States', 'usa': 'United States', 'eeuu': 'United States',
      'canada': 'Canada', 'canadá': 'Canada',
      'españa': 'Spain', 'spain': 'Spain',
      'panama': 'Panama', 'panamá': 'Panama',
      'costa rica': 'Costa Rica',
      'dominican republic': 'Dominican Rep.', 'república dominicana': 'Dominican Rep.',
    };
    return mapa[key] || nombre;
  }

  lightenColor(hex: string): string {
    // Incrementa luminosidad del color para efecto hover
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    const newR = Math.min(255, r + 40);
    const newG = Math.min(255, g + 40);
    const newB = Math.min(255, b + 40);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  applyFilters() {
    const term = this.busqueda.trim().toLowerCase();
    this.empresasFiltradas = this.empresasTabla.filter(emp => {
      const matchesEstado = this.estadoFiltro === 'TODOS' ? true : emp.estado === this.estadoFiltro;
      const matchesPais = this.paisFiltro === 'TODOS' ? true : (emp.pais_nombre || emp.pais) === this.paisFiltro;
      const matchesSearch = term ? (emp.nombre_comercial?.toLowerCase().includes(term) || emp.razon_social?.toLowerCase().includes(term) || emp.ruc_nit?.toLowerCase().includes(term)) : true;
      return matchesEstado && matchesPais && matchesSearch;
    });
  }
}
