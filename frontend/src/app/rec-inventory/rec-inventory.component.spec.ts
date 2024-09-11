import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecInventoryComponent } from './rec-inventory.component';

describe('RecInventoryComponent', () => {
  let component: RecInventoryComponent;
  let fixture: ComponentFixture<RecInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
