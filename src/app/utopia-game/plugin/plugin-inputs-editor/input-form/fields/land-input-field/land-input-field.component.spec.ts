import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandInputFieldComponent } from './land-input-field.component';

describe('LandInputFieldComponent', () => {
  let component: LandInputFieldComponent;
  let fixture: ComponentFixture<LandInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandInputFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
