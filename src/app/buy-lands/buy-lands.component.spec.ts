import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyLandsComponent } from './buy-lands.component';

describe('BuyLandsComponent', () => {
  let component: BuyLandsComponent;
  let fixture: ComponentFixture<BuyLandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyLandsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyLandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
