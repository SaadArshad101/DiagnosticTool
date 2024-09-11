import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeQuestionDisplayComponent } from './theme-question-display.component';

describe('ThemeQuestionDisplayComponent', () => {
  let component: ThemeQuestionDisplayComponent;
  let fixture: ComponentFixture<ThemeQuestionDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeQuestionDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeQuestionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
