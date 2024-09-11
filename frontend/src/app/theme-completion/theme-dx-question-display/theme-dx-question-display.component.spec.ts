import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeDXQuestionDisplayComponent } from './theme-dx-question-display.component';

describe('ThemeDXQuestionDisplayComponent', () => {
  let component: ThemeDXQuestionDisplayComponent;
  let fixture: ComponentFixture<ThemeDXQuestionDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeDXQuestionDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeDXQuestionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
