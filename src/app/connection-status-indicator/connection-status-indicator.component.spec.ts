import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatusIndicatorComponent } from './connection-status-indicator.component';

describe('ConnectionStatusIndicatorComponent', () => {
  let component: ConnectionStatusIndicatorComponent;
  let fixture: ComponentFixture<ConnectionStatusIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionStatusIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionStatusIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
