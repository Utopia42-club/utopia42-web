import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInputFieldComponent } from './file-input-field.component';

describe('FileInputFieldComponent', () => {
  let component: FileInputFieldComponent;
  let fixture: ComponentFixture<FileInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileInputFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
