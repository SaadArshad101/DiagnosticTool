import { TestBed } from '@angular/core/testing';

import { BentoService } from './bento.service';

describe('BentoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BentoService = TestBed.get(BentoService);
    expect(service).toBeTruthy();
  });
});
