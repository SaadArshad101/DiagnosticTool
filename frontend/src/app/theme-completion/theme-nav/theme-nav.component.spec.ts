import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeNavComponent } from './theme-nav.component';

describe('ThemeNavComponent', () => {
  let component: ThemeNavComponent;
  let fixture: ComponentFixture<ThemeNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
