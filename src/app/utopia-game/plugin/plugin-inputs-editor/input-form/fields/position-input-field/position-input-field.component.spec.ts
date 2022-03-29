import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionInputFieldComponent } from './position-input-field.component';

describe('PositionInputFieldComponent', () => {
  let component: PositionInputFieldComponent;
  let fixture: ComponentFixture<PositionInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionInputFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
