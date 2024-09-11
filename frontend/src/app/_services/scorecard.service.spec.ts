import { TestBed } from '@angular/core/testing';

import { ScorecardService } from './scorecard.service';

describe('ScorecardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScorecardService = TestBed.get(ScorecardService);
    expect(service).toBeTruthy();
  });
});
