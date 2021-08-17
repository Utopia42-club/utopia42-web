import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferLandComponent } from './transfer-land.component';

describe('TransferLandComponent', () => {
  let component: TransferLandComponent;
  let fixture: ComponentFixture<TransferLandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferLandComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferLandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
