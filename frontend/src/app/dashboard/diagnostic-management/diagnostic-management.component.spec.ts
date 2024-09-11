import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticManagementComponent } from './diagnostic-management.component';

describe('DiagnosticManagementComponent', () => {
  let component: DiagnosticManagementComponent;
  let fixture: ComponentFixture<DiagnosticManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosticManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
