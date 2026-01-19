import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plan } from '../services/plans.service';

@Component({
  selector: 'app-plan-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-modal.component.html',
  styleUrls: ['./plan-modal.component.css']
})
export class PlanModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() plan: Plan | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Plan>();

  formData: Plan = {
    name: '',
    price: 0,
    currency: 'USD',
    max_users: 1,
    features: [],
    status: 'active'
  };

  newFeature = '';

  ngOnInit() {
    if (this.plan) {
      this.formData = { ...this.plan };
    }
  }

  ngOnChanges() {
    if (this.plan) {
      this.formData = { ...this.plan };
    } else {
      this.formData = {
        name: '',
        price: 0,
        currency: 'USD',
        max_users: 1,
        features: [],
        status: 'active'
      };
    }
  }

  addFeature() {
    if (this.newFeature.trim()) {
      this.formData.features.push(this.newFeature.trim());
      this.newFeature = '';
    }
  }

  removeFeature(index: number) {
    this.formData.features.splice(index, 1);
  }

  onSave() {
    if (this.isFormValid()) {
      this.save.emit(this.formData);
    }
  }

  onClose() {
    this.close.emit();
  }

  isFormValid(): boolean {
    return this.formData.name.trim() !== '' &&
           this.formData.price > 0 &&
           this.formData.max_users > 0 &&
           this.formData.features.length > 0;
  }
}
