import { TestBed } from '@angular/core/testing';

import { PluginInputsService } from './plugin-inputs.service';

describe('PluginInputsService', () => {
  let service: PluginInputsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PluginInputsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
