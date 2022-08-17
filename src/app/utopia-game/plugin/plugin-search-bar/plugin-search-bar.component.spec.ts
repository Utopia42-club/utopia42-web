import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginSearchBarComponent } from './plugin-search-bar.component';

describe('PluginSearchBarComponent', () => {
  let component: PluginSearchBarComponent;
  let fixture: ComponentFixture<PluginSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginSearchBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
