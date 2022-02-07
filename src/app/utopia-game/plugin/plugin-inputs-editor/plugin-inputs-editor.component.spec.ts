import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginInputsEditor } from './plugin-inputs-editor.component';

describe('PluginDialogComponent', () => {
  let component: PluginInputsEditor;
  let fixture: ComponentFixture<PluginInputsEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginInputsEditor ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginInputsEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
