import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetNftComponent } from './set-nft.component';

describe('SetNftComponent', () => {
  let component: SetNftComponent;
  let fixture: ComponentFixture<SetNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetNftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
