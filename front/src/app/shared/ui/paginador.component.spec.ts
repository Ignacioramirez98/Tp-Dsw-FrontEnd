import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginadorComponent } from './paginador.component';

describe('PaginadorComponent', () => {
  let fixture: ComponentFixture<PaginadorComponent>;
  let component: PaginadorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginadorComponent] }).compileComponents();
    fixture = TestBed.createComponent(PaginadorComponent);
    component = fixture.componentInstance;
  });

  function botones(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button'));
  }

  it('no se muestra si hay una sola página', () => {
    fixture.componentRef.setInput('totalPaginas', 1);
    fixture.detectChanges();
    expect(botones().length).toBe(0);
  });

  it('emite la página siguiente al hacer click en "siguiente"', () => {
    const emitidas: number[] = [];
    component.cambioPagina.subscribe((p) => emitidas.push(p));
    fixture.componentRef.setInput('pagina', 2);
    fixture.componentRef.setInput('totalPaginas', 5);
    fixture.detectChanges();

    botones()[1].click();

    expect(emitidas).toEqual([3]);
    expect(fixture.nativeElement.textContent).toContain('Página 2 de 5');
  });

  it('deshabilita "anterior" en la primera página y no emite', () => {
    const emitidas: number[] = [];
    component.cambioPagina.subscribe((p) => emitidas.push(p));
    fixture.componentRef.setInput('pagina', 1);
    fixture.componentRef.setInput('totalPaginas', 3);
    fixture.detectChanges();

    expect(botones()[0].disabled).toBeTrue();
    component.ir(0);
    expect(emitidas).toEqual([]);
  });
});
