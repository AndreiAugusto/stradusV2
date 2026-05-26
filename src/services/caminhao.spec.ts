import { TestBed } from '@angular/core/testing';

import { Caminhao } from './caminhao';

describe('Caminhao', () => {
  let service: Caminhao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Caminhao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
