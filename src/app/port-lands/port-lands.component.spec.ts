import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortLandsComponent } from './port-lands.component';

describe('PortLandsComponent', () => {
  let component: PortLandsComponent;
  let fixture: ComponentFixture<PortLandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortLandsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortLandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
