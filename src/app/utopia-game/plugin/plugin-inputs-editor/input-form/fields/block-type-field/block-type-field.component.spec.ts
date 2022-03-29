import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockTypeFieldComponent } from './block-type-field.component';

describe('BlockTypeFieldComponent', () => {
  let component: BlockTypeFieldComponent;
  let fixture: ComponentFixture<BlockTypeFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockTypeFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockTypeFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
