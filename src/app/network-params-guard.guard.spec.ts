import { TestBed } from '@angular/core/testing';

import { NetworkParamsGuardGuard } from './network-params-guard.guard';

describe('NetworkParamsGuardGuard', () => {
  let guard: NetworkParamsGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NetworkParamsGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
