import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateBankComponent } from './template-bank.component';

describe('TemplateBankComponent', () => {
  let component: TemplateBankComponent;
  let fixture: ComponentFixture<TemplateBankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateBankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
