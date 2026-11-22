import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClienteDetailComponent } from './cliente-detail.component';
import { ClientesService } from '../../cliente.service';
import { VentasService } from '../../../ventas/ventas.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Cliente } from '../../../../shared/models/cliente.model';
import { Venta } from '../../../../shared/models/venta.model';
import { PageHeaderComponent } from '../../../../shared/ui/page-header.component';
import { TablaVentasComponent } from '../../../../shared/ui/tabla-ventas.component';
import { MENSAJE_SIN_CONEXION } from '../../../../shared/utils/errores';

registerLocaleData(localeEsAr, 'es-AR');

describe('ClienteDetailComponent: ventas del cliente', () => {
  const cliente = new Cliente('c1', 'Ana', 'Pérez', '30111222', 'ana@mail.com', '3415550000', 'Calle 1');
  const venta = Object.assign(new Venta(), {
    _id: 'v1',
    estado: 'pendiente',
    fechaContacto: '2026-11-01T12:00:00Z',
    items: [{ producto: { _id: 'p1', nombre: 'Tractor' }, cantidad: 2, precioUnitario: 1000 }],
  });

  let getVentas: jasmine.Spy;

  function montar(rol = 'admin') {
    getVentas = jasmine.createSpy('getVentas').and.returnValue(of({ data: [] }));
    TestBed.configureTestingModule({
      declarations: [ClienteDetailComponent],
      imports: [PageHeaderComponent, TablaVentasComponent, RouterLink],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'c1' }) } } },
        { provide: ClientesService, useValue: { getCliente: () => of({ data: cliente }) } },
        { provide: VentasService, useValue: { getVentas } },
        { provide: AuthService, useValue: { getRol: () => rol } },
      ],
    });
    const fixture = TestBed.createComponent(ClienteDetailComponent);
    return { fixture, html: fixture.nativeElement as HTMLElement };
  }

  const botonReintentar = (html: HTMLElement) =>
    Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes('Reintentar'));

  it('si falla la lista de ventas, lo dice y no afirma que el cliente no tiene ventas', () => {
    const { fixture, html } = montar();
    getVentas.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    fixture.detectChanges();

    expect(html.textContent).toContain(MENSAJE_SIN_CONEXION);
    expect(html.textContent).not.toContain('todavía no tiene ventas');
    expect(html.querySelector('#t-ventas')?.textContent).not.toContain('(0)');
    expect(botonReintentar(html)).toBeTruthy();
  });

  it('Reintentar vuelve a pedir las ventas y las muestra', () => {
    const { fixture, html } = montar();
    getVentas.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    fixture.detectChanges();

    getVentas.and.returnValue(of({ data: [venta] }));
    botonReintentar(html)?.click();
    fixture.detectChanges();

    expect(getVentas).toHaveBeenCalledTimes(2);
    expect(botonReintentar(html)).toBeUndefined();
    expect(html.querySelector('#t-ventas')?.textContent).toContain('(1)');
    expect(html.querySelector('app-tabla-ventas table')).toBeTruthy();
  });

  it('sin ventas muestra el mensaje de vacío, que es distinto de un error', () => {
    const { fixture, html } = montar();

    fixture.detectChanges();

    expect(html.textContent).toContain('Este cliente todavía no tiene ventas.');
    expect(botonReintentar(html)).toBeUndefined();
  });

  it('un rol sin acceso a ventas ni las pide', () => {
    const { fixture } = montar('operario');

    fixture.detectChanges();

    expect(getVentas).not.toHaveBeenCalled();
  });
});
