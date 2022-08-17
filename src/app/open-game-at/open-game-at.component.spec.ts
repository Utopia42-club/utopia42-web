import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenGameAtComponent } from './open-game-at.component';

describe('OpenGameAtComponent', () => {
  let component: OpenGameAtComponent;
  let fixture: ComponentFixture<OpenGameAtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenGameAtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenGameAtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
