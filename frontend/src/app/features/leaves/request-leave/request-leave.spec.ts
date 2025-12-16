import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestLeave } from './request-leave';

describe('RequestLeave', () => {
  let component: RequestLeave;
  let fixture: ComponentFixture<RequestLeave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestLeave]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestLeave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
