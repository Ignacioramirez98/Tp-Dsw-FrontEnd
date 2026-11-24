import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { SolicitudDetailComponent } from './solicitud-detail.component';
import { SolicitudesService } from '../../solicitud.service';
import { OperariosService } from '../../../operarios/operario.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfirmacionService } from '../../../../shared/ui/confirmacion.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { SolicitudServicio } from '../../../../shared/models/solicitud-servicio.model';

describe('SolicitudDetailComponent', () => {
  const base = {
    _id: 's1', horasEstimadas: 3, importePorHora: 1000, importeEstimado: 3000, fechaSolicitud: '2026-11-24',
    servicio: { _id: 'sv', descripcion: 'Service general', importe_por_hora: 1000 },
  };
  const solicitud = (estado: string, extra: Partial<SolicitudServicio> = {}) => ({ ...base, estado, ...extra }) as SolicitudServicio;

  let servicio: jasmine.SpyObj<SolicitudesService>;
  let dialogo: { resultado: unknown; abrir: jasmine.Spy };
  let confirmar: jasmine.Spy;

  function crear(rol: string, actual: SolicitudServicio) {
    servicio = jasmine.createSpyObj('SolicitudesService', ['getSolicitud', 'aceptar', 'finalizar', 'cancelar']);
    servicio.getSolicitud.and.returnValue(of({ data: actual }));
    servicio.aceptar.and.returnValue(of({ data: solicitud('aceptada') }));
    servicio.finalizar.and.returnValue(of({ data: solicitud('finalizada', { importeFinal: 4000 }) }));
    servicio.cancelar.and.returnValue(of({ data: solicitud('cancelada') }));
    confirmar = jasmine.createSpy('confirmar').and.returnValue(of(true));
    dialogo = { resultado: undefined, abrir: jasmine.createSpy('open') };
    dialogo.abrir.and.callFake(() => ({ afterClosed: () => of(dialogo.resultado) }));

    TestBed.configureTestingModule({
      declarations: [SolicitudDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 's1' } } } },
        { provide: SolicitudesService, useValue: servicio },
        { provide: OperariosService, useValue: { getOperarios: () => of({ data: [{ _id: 'op1', nombre: 'Carlos', apellido: 'B' }] }) } },
        { provide: AuthService, useValue: { getRol: () => rol } },
        { provide: ConfirmacionService, useValue: { confirmar } },
        { provide: MatDialog, useValue: { open: dialogo.abrir } },
      ],
    }).overrideComponent(SolicitudDetailComponent, { set: { template: '' } });

    const fixture = TestBed.createComponent(SolicitudDetailComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  describe('qué acciones ve cada rol', () => {
    it('el cliente solo puede cancelar lo pendiente', () => {
      const pendiente = crear('cliente', solicitud('pendiente'));
      expect([pendiente.puedeAceptar, pendiente.puedeFinalizar, pendiente.puedeCancelar]).toEqual([false, false, true]);

      TestBed.resetTestingModule();
      const aceptada = crear('cliente', solicitud('aceptada'));
      expect(aceptada.puedeCancelar).toBeFalse();
    });

    it('el operario acepta lo pendiente, finaliza lo aceptado y cancela ambos', () => {
      const pendiente = crear('operario', solicitud('pendiente'));
      expect([pendiente.puedeAceptar, pendiente.puedeFinalizar, pendiente.puedeCancelar]).toEqual([true, false, true]);

      TestBed.resetTestingModule();
      const aceptada = crear('operario', solicitud('aceptada'));
      expect([aceptada.puedeAceptar, aceptada.puedeFinalizar, aceptada.puedeCancelar]).toEqual([false, true, true]);
    });

    it('nadie actúa sobre una solicitud finalizada o cancelada', () => {
      for (const estado of ['finalizada', 'cancelada']) {
        TestBed.resetTestingModule();
        const c = crear('admin', solicitud(estado));
        expect([c.puedeAceptar, c.puedeFinalizar, c.puedeCancelar]).toEqual([false, false, false]);
      }
    });
  });

  describe('acciones', () => {
    it('el operario acepta con una confirmación, a su nombre', () => {
      const c = crear('operario', solicitud('pendiente'));
      c.aceptar();
      expect(confirmar).toHaveBeenCalled();
      expect(servicio.aceptar).toHaveBeenCalledWith('s1');
      expect(c.solicitud?.estado).toBe('aceptada');
    });

    it('si cancela la confirmación no acepta', () => {
      const c = crear('operario', solicitud('pendiente'));
      confirmar.and.returnValue(of(false));
      c.aceptar();
      expect(servicio.aceptar).not.toHaveBeenCalled();
    });

    it('el admin elige el operario si la solicitud no tiene responsable', () => {
      const c = crear('admin', solicitud('pendiente', { operario: null }));
      dialogo.resultado = { operarioId: 'op1' };
      c.aceptar();
      expect(servicio.aceptar).toHaveBeenCalledWith('s1', 'op1');
      expect(confirmar).not.toHaveBeenCalled();
    });

    it('finaliza con las horas reales del diálogo', () => {
      const c = crear('operario', solicitud('aceptada'));
      dialogo.resultado = { horasReales: 4 };
      c.finalizar();
      expect(servicio.finalizar).toHaveBeenCalledWith('s1', 4);
      expect(c.solicitud?.estado).toBe('finalizada');
    });

    it('si se cierra el diálogo sin confirmar, no finaliza', () => {
      const c = crear('operario', solicitud('aceptada'));
      dialogo.resultado = undefined;
      c.finalizar();
      expect(servicio.finalizar).not.toHaveBeenCalled();
    });

    it('el operario cancela con motivo y el cliente con una confirmación simple', () => {
      const operario = crear('operario', solicitud('aceptada'));
      dialogo.resultado = { motivo: 'Sin repuestos' };
      operario.cancelar();
      expect(servicio.cancelar).toHaveBeenCalledWith('s1', 'Sin repuestos');

      TestBed.resetTestingModule();
      const cliente = crear('cliente', solicitud('pendiente'));
      cliente.cancelar();
      expect(confirmar).toHaveBeenCalled();
      expect(servicio.cancelar).toHaveBeenCalledWith('s1');
    });

    it('si el backend rechaza por estado (409) avisa el motivo y recarga', () => {
      const c = crear('operario', solicitud('pendiente'));
      servicio.aceptar.and.returnValue(throwError(() => ({ status: 409, error: { message: 'No se puede aceptar una solicitud cancelada' } })));
      c.aceptar();
      const avisos = TestBed.inject(NotificacionService).notificaciones();
      expect(avisos[0].mensaje).toBe('No se puede aceptar una solicitud cancelada');
      expect(servicio.getSolicitud).toHaveBeenCalledTimes(2);
      expect(c.procesando).toBeFalse();
    });
  });
});
