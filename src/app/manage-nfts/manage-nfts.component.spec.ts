import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNftsComponent } from './manage-nfts.component';

describe('ManageNftsComponent', () => {
  let component: ManageNftsComponent;
  let fixture: ComponentFixture<ManageNftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNftsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageNftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
