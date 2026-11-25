import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { RouterModule, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FacturasListComponent } from './facturas-list.component';
import { FacturasService } from '../../factura.service';
import { Factura } from '../../../../shared/models/factura.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../../../shared/ui/paginador.component';

registerLocaleData(localeEsAr, 'es-AR');

describe('FacturasListComponent', () => {
  let fixture: ComponentFixture<FacturasListComponent>;
  let componente: FacturasListComponent;
  let facturas: jasmine.SpyObj<FacturasService>;

  const factura = (numero: string, nombre: string, extra: Partial<Factura> = {}) => ({
    _id: `f-${numero}`, numero, fechaEmision: '2026-11-20T15:00:00.000Z', venta: 'v1', cliente: 'c1', emitidaPor: 'marta',
    receptor: { nombre, dni: '25111222', razonSocial: 'La Esperanza', direccion: 'Ruta 33', localidad: 'Rosario', mail: 'a@b.com' },
    lineas: [], subtotal: 1000, alicuotaIva: 21, iva: 210, total: 1210, ...extra,
  }) as Factura;

  function montar(rol: string, respuesta = of({ data: [factura('0001-00000002', 'Juan Pérez'), factura('0001-00000001', 'Ana Gómez')] })) {
    facturas = jasmine.createSpyObj<FacturasService>('FacturasService', ['getFacturas']);
    facturas.getFacturas.and.returnValue(respuesta);
    TestBed.configureTestingModule({
      declarations: [FacturasListComponent],
      imports: [RouterModule, PageHeaderComponent, PaginadorComponent],
      providers: [
        provideRouter([]),
        { provide: FacturasService, useValue: facturas },
        { provide: AuthService, useValue: { getRol: () => rol } },
      ],
    });
    fixture = TestBed.createComponent(FacturasListComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  const texto = () => fixture.nativeElement.textContent as string;
  const filas = () => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'));

  it('el personal ve número, cliente, quién la emitió y el total con IVA', () => {
    montar('vendedor');

    expect(filas().length).toBe(2);
    expect(filas()[0].textContent).toContain('0001-00000002');
    expect(filas()[0].textContent).toContain('Juan Pérez');
    expect(filas()[0].textContent).toContain('marta');
    expect(filas()[0].textContent).toContain('1.210,00');
    expect(texto()).toContain('Facturas');
  });

  it('el cliente ve "Mis facturas" sin los datos de gestión', () => {
    montar('cliente');

    expect(texto()).toContain('Mis facturas');
    expect(texto()).not.toContain('Emitida por');
    expect(filas()[0].textContent).not.toContain('Juan Pérez');
    expect(filas()[0].textContent).toContain('0001-00000002');
  });

  it('cada factura tiene un enlace a su comprobante', () => {
    montar('admin');
    const enlace = filas()[0].querySelector('a')!;
    expect(enlace.getAttribute('href')).toBe('/facturas/f-0001-00000002');
    expect(enlace.getAttribute('aria-label')).toBe('Ver la factura 0001-00000002');
  });

  it('busca por número, cliente, razón social o DNI', () => {
    montar('admin');

    componente.buscar('gómez');
    expect(componente.visibles.map((f) => f.numero)).toEqual(['0001-00000001']);
    componente.buscar('esperanza');
    expect(componente.visibles.length).toBe(2);
    componente.buscar('00000002');
    expect(componente.visibles.map((f) => f.numero)).toEqual(['0001-00000002']);
  });

  it('filtra por fecha de emisión en el backend y no pide un rango invertido', () => {
    montar('admin');
    facturas.getFacturas.calls.reset();

    componente.filtrarPorFecha('desde', '2026-11-01');
    expect(facturas.getFacturas).toHaveBeenCalledWith({ desde: '2026-11-01', hasta: '' });

    facturas.getFacturas.calls.reset();
    componente.filtrarPorFecha('hasta', '2026-10-01');
    expect(componente.errorFechas).toContain('no puede ser posterior');
    expect(facturas.getFacturas).not.toHaveBeenCalled();
  });

  it('avisa cuando todavía no hay facturas', () => {
    montar('admin', of({ data: [] }));
    expect(texto()).toContain('Todavía no hay facturas emitidas');

    TestBed.resetTestingModule();
    montar('cliente', of({ data: [] }));
    expect(texto()).toContain('Todavía no tenés facturas');
  });

  it('si falla la carga muestra el error y permite reintentar', () => {
    montar('admin', throwError(() => ({ status: 500 })));
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();

    facturas.getFacturas.and.returnValue(of({ data: [factura('0001-00000001', 'Ana Gómez')] }));
    componente.recargar();
    fixture.detectChanges();
    expect(filas().length).toBe(1);
  });
});
