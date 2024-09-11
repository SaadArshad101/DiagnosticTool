import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeDXNavComponent } from './theme-dx-nav.component';

describe('ThemeNavComponent', () => {
  let component: ThemeDXNavComponent;
  let fixture: ComponentFixture<ThemeDXNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeDXNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeDXNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
