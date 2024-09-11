import { TestBed } from '@angular/core/testing';

import { SwotService } from './swot.service';

describe('SwotService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SwotService = TestBed.get(SwotService);
    expect(service).toBeTruthy();
  });
});
