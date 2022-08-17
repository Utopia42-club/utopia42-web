import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionInputFieldComponent } from './selection-input-field.component';

describe('SelectionInputFieldComponent', () => {
  let component: SelectionInputFieldComponent;
  let fixture: ComponentFixture<SelectionInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionInputFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
