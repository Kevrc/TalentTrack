import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    themeSystem: 'pulse',  
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [],
    eventDisplay: 'block',    // Hace que los eventos se vean como barras sólidas
    displayEventTime: true,  // Muestra la hora (ej: 08:00) antes del título
    displayEventEnd: false,
    eventTimeFormat: {       // Formato de hora amigable
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
  },
    nextDayThreshold: '00:00:00',
  };

  taskForm: FormGroup;
  subordinates: any[] = [];
  showModal = false;

  constructor(
    private http: HttpClient, 
    private fb: FormBuilder, 
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      id: [null],
      titulo: ['', Validators.required],
      descripcion: [''],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      asignado_a: ['', Validators.required],
      color: ['#ff0015'] // Rojo por defecto
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadSubordinates();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe((res: any) => {
      const data = Array.isArray(res) ? res : (res && res.results ? res.results : []);
      const events = data.map((t: any) => ({
        id: t.id,
        title: t.titulo,
        start: t.fecha_inicio,
        end: t.fecha_fin,
        backgroundColor: t.color || '#ff0015',
        extendedProps: { descripcion: t.descripcion, asignado_a: t.asignado_a }
      }));
      this.calendarOptions = { ...this.calendarOptions, events };
    });
  }

  loadSubordinates() {
    this.taskService.getSubordinates().subscribe(data => this.subordinates = data);
  }

  handleDateClick(arg: any) {
    this.taskForm.reset({
      color: '#ff0015',
      fecha_inicio: `${arg.dateStr}T08:00`,
      fecha_fin: `${arg.dateStr}T09:00`
    });
    this.showModal = true;
  }

  handleEventClick(info: any) {
    const event = info.event;
    this.taskForm.patchValue({
      id: event.id,
      titulo: event.title,
      descripcion: event.extendedProps['descripcion'],
      fecha_inicio: event.startStr.substring(0, 16),
      fecha_fin: event.endStr ? event.endStr.substring(0, 16) : event.startStr.substring(0, 16),
      asignado_a: event.extendedProps['asignado_a']
    });
    this.showModal = true;
  }

  submitTask() {
    if (this.taskForm.valid) {
      const data = this.taskForm.value;
      const request = data.id 
        ? this.http.put(`http://localhost:8000/api/tasks/tasks/${data.id}/`, data)
        : this.taskService.createTask(data);

      request.subscribe(() => {
        this.loadTasks();
        this.showModal = false;
        this.taskForm.reset();
      });
    }
  }
}