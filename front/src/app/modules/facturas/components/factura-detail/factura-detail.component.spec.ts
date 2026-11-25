import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { ActivatedRoute, RouterModule, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FacturaDetailComponent } from './factura-detail.component';
import { FacturasService } from '../../factura.service';
import { Factura } from '../../../../shared/models/factura.model';
import { AuthService } from '../../../../shared/services/auth.service';

registerLocaleData(localeEsAr, 'es-AR');

describe('FacturaDetailComponent', () => {
  let fixture: ComponentFixture<FacturaDetailComponent>;
  let componente: FacturaDetailComponent;
  let facturas: jasmine.SpyObj<FacturasService>;

  const factura = {
    _id: 'f1', numero: '0001-00000007', fechaEmision: '2026-11-20T15:00:00.000Z', venta: 'v9', cliente: 'c1', emitidaPor: 'marta',
    receptor: { nombre: 'Juan Pérez', dni: '25111222', razonSocial: 'La Esperanza', direccion: 'Ruta 33 km 12', localidad: 'Rosario', mail: 'juan@campo.com' },
    lineas: [
      { descripcion: 'Tractor 120 HP', cantidad: 1, precioUnitario: 45000000, importe: 45000000 },
      { descripcion: 'Rastra de discos 28', cantidad: 4, precioUnitario: 7900000, importe: 31600000 },
    ],
    subtotal: 76600000, alicuotaIva: 21, iva: 16086000, total: 92686000,
  } as Factura;

  function montar(rol: string, respuesta = of({ data: factura })) {
    facturas = jasmine.createSpyObj<FacturasService>('FacturasService', ['getFactura']);
    facturas.getFactura.and.returnValue(respuesta);
    TestBed.configureTestingModule({
      declarations: [FacturaDetailComponent],
      imports: [RouterModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'f1' } } } },
        { provide: FacturasService, useValue: facturas },
        { provide: AuthService, useValue: { getRol: () => rol } },
      ],
    });
    fixture = TestBed.createComponent(FacturaDetailComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  const texto = () => (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');

  it('muestra el comprobante con el cliente, los renglones y los totales con IVA discriminado', () => {
    montar('vendedor');

    expect(facturas.getFactura).toHaveBeenCalledWith('f1');
    expect(texto()).toContain('0001-00000007');
    expect(texto()).toContain('Juan Pérez');
    expect(texto()).toContain('La Esperanza');
    expect(texto()).toContain('Ruta 33 km 12, Rosario');
    expect(texto()).toContain('Rastra de discos 28');
    expect(texto()).toContain('Subtotal');
    expect(texto()).toContain('76.600.000,00');
    expect(texto()).toContain('IVA 21%');
    expect(texto()).toContain('16.086.000,00');
    expect(texto()).toContain('92.686.000,00');
    expect(texto()).toContain('Emitida por marta');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('enlaza con la venta y adapta el texto al rol', () => {
    montar('admin');
    const enlace = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('a')).find((a) => a.textContent?.includes('Ver venta'))!;
    expect(enlace.getAttribute('href')).toBe('/ventas/v9');
    expect(texto()).toContain('Facturas');

    TestBed.resetTestingModule();
    montar('cliente');
    expect(texto()).toContain('Ver compra');
    expect(texto()).toContain('Mis facturas');
  });

  it('imprime con el diálogo del navegador', () => {
    montar('vendedor');
    const imprimir = jasmine.createSpy('print');
    (componente as unknown as { documento: unknown }).documento = { defaultView: { print: imprimir } };

    (Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find((b) => b.textContent?.includes('Imprimir'))!).click();

    expect(imprimir).toHaveBeenCalled();
  });

  it('una factura ajena o inexistente se informa sin detalles', () => {
    montar('cliente', throwError(() => ({ status: 404 })));
    expect(texto()).toContain('La factura no existe o no tenés acceso a ella.');
    expect(componente.factura).toBeNull();
  });

  it('ante otro error muestra un mensaje y permite reintentar', () => {
    montar('vendedor', throwError(() => ({ status: 500 })));
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();

    facturas.getFactura.and.returnValue(of({ data: factura }));
    componente.cargar();
    fixture.detectChanges();
    expect(componente.factura?.numero).toBe('0001-00000007');
  });
});
