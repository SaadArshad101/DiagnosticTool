import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MimicInputComponent } from './mimic-input.component';

describe('MimicInputComponent', () => {
  let component: MimicInputComponent;
  let fixture: ComponentFixture<MimicInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MimicInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MimicInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
