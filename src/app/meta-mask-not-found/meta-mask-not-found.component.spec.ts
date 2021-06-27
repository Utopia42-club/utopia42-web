import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaMaskNotFoundComponent } from './meta-mask-not-found.component';

describe('MetaMaskNotFoundComponent', () => {
  let component: MetaMaskNotFoundComponent;
  let fixture: ComponentFixture<MetaMaskNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaMaskNotFoundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaMaskNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
