import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { VentaDetailComponent } from './venta-detail.component';
import { VentasService } from '../../ventas.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { FacturasService } from '../../../facturas/factura.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfirmacionService } from '../../../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { Venta } from '../../../../shared/models/venta.model';
import { Factura } from '../../../../shared/models/factura.model';

describe('VentaDetailComponent - facturación', () => {
  const venta = (estado: string) => ({ _id: 'v1', estado, fechaContacto: '2026-11-18', items: [] }) as unknown as Venta;
  const factura = { _id: 'f1', numero: '0001-00000007' } as Factura;

  let ventas: jasmine.SpyObj<VentasService>;
  let facturas: jasmine.SpyObj<FacturasService>;
  let notificaciones: jasmine.SpyObj<NotificacionService>;
  let confirmar: jasmine.Spy;

  function crear(rol: string, actual: Venta) {
    ventas = jasmine.createSpyObj<VentasService>('VentasService', ['getVenta', 'facturar', 'concretar', 'cancelar']);
    ventas.getVenta.and.returnValue(of({ data: actual }));
    ventas.facturar.and.returnValue(of({ data: factura }));
    facturas = jasmine.createSpyObj<FacturasService>('FacturasService', ['getFacturaDeVenta']);
    facturas.getFacturaDeVenta.and.returnValue(of({ data: factura }));
    notificaciones = jasmine.createSpyObj<NotificacionService>('NotificacionService', ['exito', 'error', 'info']);
    confirmar = jasmine.createSpy('confirmar').and.returnValue(of(true));

    TestBed.configureTestingModule({
      declarations: [VentaDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'v1' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: VentasService, useValue: ventas },
        { provide: FacturasService, useValue: facturas },
        { provide: VendedoresService, useValue: { getVendedores: () => of({ data: [] }) } },
        { provide: AuthService, useValue: { getRol: () => rol } },
        { provide: ConfirmacionService, useValue: { confirmar } },
        { provide: NotificacionService, useValue: notificaciones },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
      ],
    }).overrideComponent(VentaDetailComponent, { set: { template: '' } });

    const fixture = TestBed.createComponent(VentaDetailComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  describe('quién puede facturar', () => {
    it('el personal factura una venta concretada y nada más', () => {
      for (const rol of ['admin', 'vendedor']) {
        TestBed.resetTestingModule();
        expect(crear(rol, venta('concretada')).puedeFacturar).withContext(rol).toBeTrue();
        for (const estado of ['pendiente', 'facturada', 'cancelada']) {
          TestBed.resetTestingModule();
          expect(crear(rol, venta(estado)).puedeFacturar).withContext(`${rol} ${estado}`).toBeFalse();
        }
      }
    });

    it('el cliente y el operario no facturan', () => {
      for (const rol of ['cliente', 'operario']) {
        TestBed.resetTestingModule();
        expect(crear(rol, venta('concretada')).puedeFacturar).withContext(rol).toBeFalse();
      }
    });

    it('una venta facturada ya no se cancela', () => {
      expect(crear('admin', venta('facturada')).puedeCancelar).toBeFalse();
    });
  });

  describe('la factura de una venta facturada', () => {
    it('la trae para poder abrirla y muestra su número en el paso "Facturada"', () => {
      const c = crear('cliente', venta('facturada'));

      expect(facturas.getFacturaDeVenta).toHaveBeenCalledWith('v1');
      expect(c.factura).toBe(factura);
      expect(c.pasos[2]).toEqual(jasmine.objectContaining({ titulo: 'Facturada', detalle: '0001-00000007', estado: 'hecho' }));
    });

    it('en otro estado no la pide', () => {
      crear('admin', venta('concretada'));
      expect(facturas.getFacturaDeVenta).not.toHaveBeenCalled();
    });

    it('si no se puede traer, la venta se ve igual sin enlace', () => {
      TestBed.resetTestingModule();
      const c = crear('admin', venta('facturada'));
      facturas.getFacturaDeVenta.and.returnValue(throwError(() => ({ status: 404 })));
      c.cargar();
      expect(c.factura).toBeNull();
      expect(c.venta?.estado).toBe('facturada');
    });
  });

  describe('facturar', () => {
    it('confirma, emite la factura y deja la venta facturada', () => {
      const c = crear('vendedor', venta('concretada'));
      c.facturar();

      expect(confirmar).toHaveBeenCalled();
      expect(ventas.facturar).toHaveBeenCalledWith('v1');
      expect(c.venta?.estado).toBe('facturada');
      expect(c.factura).toBe(factura);
      expect(c.puedeFacturar).toBeFalse();
      expect(c.procesando).toBeFalse();
      expect(notificaciones.exito).toHaveBeenCalledWith('Se emitió la factura 0001-00000007.');
    });

    it('si se cancela la confirmación no factura', () => {
      const c = crear('vendedor', venta('concretada'));
      confirmar.and.returnValue(of(false));
      c.facturar();

      expect(ventas.facturar).not.toHaveBeenCalled();
      expect(c.venta?.estado).toBe('concretada');
    });

    it('si el backend rechaza (409) muestra el motivo y recarga la venta', () => {
      const c = crear('vendedor', venta('concretada'));
      ventas.facturar.and.returnValue(throwError(() => ({ status: 409, error: { message: 'La venta ya está facturada' } })));
      ventas.getVenta.calls.reset();
      c.facturar();

      expect(notificaciones.error).toHaveBeenCalledWith('La venta ya está facturada');
      expect(ventas.getVenta).toHaveBeenCalledTimes(1);
      expect(c.procesando).toBeFalse();
    });

    it('ante un error de servidor muestra un mensaje y no recarga', () => {
      const c = crear('vendedor', venta('concretada'));
      ventas.facturar.and.returnValue(throwError(() => ({ status: 500 })));
      ventas.getVenta.calls.reset();
      c.facturar();

      expect(notificaciones.error).toHaveBeenCalled();
      expect(ventas.getVenta).not.toHaveBeenCalled();
      expect(c.venta?.estado).toBe('concretada');
    });
  });
});
