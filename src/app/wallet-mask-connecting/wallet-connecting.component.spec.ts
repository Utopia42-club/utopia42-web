import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletConnectingComponent } from './wallet-connecting.component';

describe('MetaMaskConnectingComponent', () => {
  let component: WalletConnectingComponent;
  let fixture: ComponentFixture<WalletConnectingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletConnectingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletConnectingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
