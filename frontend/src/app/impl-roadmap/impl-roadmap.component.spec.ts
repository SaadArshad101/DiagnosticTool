import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplRoadmapComponent } from './impl-roadmap.component';

describe('ImplRoadmapComponent', () => {
  let component: ImplRoadmapComponent;
  let fixture: ComponentFixture<ImplRoadmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImplRoadmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplRoadmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
