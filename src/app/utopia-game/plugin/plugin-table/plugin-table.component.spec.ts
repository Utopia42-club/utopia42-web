import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginTableComponent } from './plugin-table.component';

describe('PluginTableComponent', () => {
  let component: PluginTableComponent;
  let fixture: ComponentFixture<PluginTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
