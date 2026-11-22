import { TestBed } from '@angular/core/testing';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SeleccionProductosComponent } from './seleccion-productos.component';
import { ProductosService } from '../productos/producto.service';
import { NotificacionService } from '../../shared/ui/notificacion.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';
import { Producto } from '../../shared/models/producto.model';
import { MENSAJE_SIN_CONEXION } from '../../shared/utils/errores';

registerLocaleData(localeEsAr, 'es-AR');

describe('SeleccionProductosComponent (catálogo reactivo)', () => {
  const producto = (id: string, nombre: string, descripcion = '') => new Producto(id, nombre, descripcion, 0, 1000, 5);
  const equipos = (cantidad: number) =>
    Array.from({ length: cantidad }, (_, i) => producto(`e${i + 1}`, `Equipo ${String(i + 1).padStart(2, '0')}`));

  let getProductos: jasmine.Spy;

  function montar(catalogo: Producto[]) {
    localStorage.clear();
    getProductos = jasmine.createSpy('getProductos').and.returnValue(of({ data: catalogo }));
    TestBed.configureTestingModule({
      declarations: [SeleccionProductosComponent],
      imports: [CommonModule, PageHeaderComponent, PaginadorComponent, RouterLink],
      providers: [
        provideRouter([]),
        { provide: ProductosService, useValue: { getProductos } },
        { provide: NotificacionService, useValue: { info: jasmine.createSpy('info') } },
      ],
    });
    const fixture = TestBed.createComponent(SeleccionProductosComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  }

  const escribir = (fixture: ReturnType<typeof montar>['fixture'], html: HTMLElement, texto: string) => {
    const buscador = html.querySelector('#buscar-producto') as HTMLInputElement;
    buscador.value = texto;
    buscador.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const nombres = (html: HTMLElement) => Array.from(html.querySelectorAll('.tarjeta-producto h2')).map((h) => h.textContent?.trim());

  afterAll(() => localStorage.clear());

  it('muestra los productos ordenados por nombre', () => {
    const { html } = montar([producto('2', 'Sembradora'), producto('1', 'Cosechadora')]);

    expect(nombres(html)).toEqual(['Cosechadora', 'Sembradora']);
  });

  it('al escribir en el buscador filtra al instante, sin distinguir mayúsculas ni tildes', () => {
    const { fixture, html } = montar([
      producto('1', 'Tractor', 'John Deere'),
      producto('2', 'Sembradora', 'Siembra neumática de precisión'),
    ]);

    escribir(fixture, html, 'NEUMATICA');

    expect(nombres(html)).toEqual(['Sembradora']);
  });

  it('si nada coincide, lo dice; al borrar la búsqueda vuelven todos', () => {
    const { fixture, html } = montar([producto('1', 'Tractor')]);

    escribir(fixture, html, 'zzz');
    expect(html.textContent).toContain('Ningún producto coincide con la búsqueda.');

    escribir(fixture, html, '');
    expect(nombres(html)).toEqual(['Tractor']);
  });

  it('pagina de a 12 y el paginador sigue la página actual', () => {
    const { fixture, componente, html } = montar(equipos(14));

    expect(nombres(html).length).toBe(12);
    expect(html.querySelector('app-paginador')?.textContent).toContain('Página 1 de 2');

    componente.irA(2);
    fixture.detectChanges();

    expect(nombres(html)).toEqual(['Equipo 13', 'Equipo 14']);
    expect(html.querySelector('app-paginador')?.textContent).toContain('Página 2 de 2');
  });

  it('al buscar vuelve a la página 1 y el paginador coincide con los resultados', () => {
    const { fixture, componente, html } = montar(equipos(14));
    componente.irA(2);
    fixture.detectChanges();

    escribir(fixture, html, 'equipo 1'); // coincide con Equipo 10 a 14

    expect(componente.pagina()).toBe(1);
    expect(nombres(html).length).toBe(5);
    expect(html.querySelector('app-paginador button')).toBeNull(); // una sola página: no hay paginador
  });

  it('si falla la carga muestra el motivo y Reintentar vuelve a pedir', () => {
    const { fixture, html } = montar([]);
    getProductos.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    fixture.componentInstance.cargar();
    fixture.detectChanges();

    expect(html.textContent).toContain(MENSAJE_SIN_CONEXION);

    getProductos.and.returnValue(of({ data: [producto('1', 'Tractor')] }));
    (Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes('Reintentar')) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(nombres(html)).toEqual(['Tractor']);
  });
});
