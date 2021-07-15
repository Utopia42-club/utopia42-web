import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtopiaGameComponent } from './utopia-game.component';

describe('UtopiaGameComponent', () => {
  let component: UtopiaGameComponent;
  let fixture: ComponentFixture<UtopiaGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UtopiaGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UtopiaGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
