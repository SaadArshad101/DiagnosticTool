import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeDXComponent } from './theme-dx.component';

describe('ThemeDXComponent', () => {
  let component: ThemeDXComponent;
  let fixture: ComponentFixture<ThemeDXComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeDXComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeDXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
