import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginSelectionComponent } from './plugin-selection.component';

describe('PluginSelectionComponent', () => {
  let component: PluginSelectionComponent;
  let fixture: ComponentFixture<PluginSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
