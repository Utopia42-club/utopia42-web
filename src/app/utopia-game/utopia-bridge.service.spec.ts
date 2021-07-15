import { TestBed } from '@angular/core/testing';

import { UtopiaBridgeService } from './utopia-bridge.service';

describe('UtopiaBridgeService', () => {
  let service: UtopiaBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtopiaBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
