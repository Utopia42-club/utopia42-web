import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaMaskConnectingComponent } from './meta-mask-connecting.component';

describe('MetaMaskConnectingComponent', () => {
  let component: MetaMaskConnectingComponent;
  let fixture: ComponentFixture<MetaMaskConnectingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaMaskConnectingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaMaskConnectingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
