import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveLandsComponent } from './save-lands.component';

describe('SaveLandsComponent', () => {
  let component: SaveLandsComponent;
  let fixture: ComponentFixture<SaveLandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveLandsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveLandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
