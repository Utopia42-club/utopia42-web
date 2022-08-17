import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterSlaveInputComponent } from './master-slave-input.component';

describe('MasterSlaveInputComponent', () => {
  let component: MasterSlaveInputComponent;
  let fixture: ComponentFixture<MasterSlaveInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterSlaveInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterSlaveInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
