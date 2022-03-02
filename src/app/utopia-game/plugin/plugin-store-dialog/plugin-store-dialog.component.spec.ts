import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginStoreDialogComponent } from './plugin-store-dialog.component';

describe('PluginStoreDialogComponent', () => {
  let component: PluginStoreDialogComponent;
  let fixture: ComponentFixture<PluginStoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginStoreDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginStoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
