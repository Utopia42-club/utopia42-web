import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionDialogContentComponent } from './exception-dialog-content.component';

describe('ExceptionDialogContentComponent', () => {
  let component: ExceptionDialogContentComponent;
  let fixture: ComponentFixture<ExceptionDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExceptionDialogContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
