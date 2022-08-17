import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockTypeInputFieldComponent } from './block-type-input-field.component';

describe('BlockTypeInputFieldComponent', () => {
  let component: BlockTypeInputFieldComponent;
  let fixture: ComponentFixture<BlockTypeInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockTypeInputFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockTypeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
