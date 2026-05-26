import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Caminhao } from './caminhao';

describe('Caminhao', () => {
  let component: Caminhao;
  let fixture: ComponentFixture<Caminhao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Caminhao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Caminhao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
