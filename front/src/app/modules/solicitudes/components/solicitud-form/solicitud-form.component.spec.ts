import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SolicitudFormComponent } from './solicitud-form.component';
import { ServiciosService } from '../../../servicios/servicio.service';
import { SolicitudesService } from '../../solicitud.service';
import { NotificacionService } from '../../../../shared/ui/notificacion.service';
import { CampoComponent } from '../../../../shared/ui/campo.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header.component';
import { ActivatedRoute } from '@angular/router';

describe('SolicitudFormComponent', () => {
  let fixture: ComponentFixture<SolicitudFormComponent>;
  let componente: SolicitudFormComponent;
  let crear: jasmine.Spy;
  let navegar: jasmine.Spy;

  const servicio = { _id: 'sv1', descripcion: 'Service general', importe_por_hora: 1000 };

  function montar(): void {
    crear = jasmine.createSpy('crear').and.returnValue(of({ data: { _id: 's9' } }));
    TestBed.configureTestingModule({
      declarations: [SolicitudFormComponent],
      imports: [ReactiveFormsModule, CampoComponent, PageHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: ServiciosService, useValue: { getServicio: () => of(servicio) } },
        { provide: SolicitudesService, useValue: { crear } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'sv1' } } } },
      ],
    });
    fixture = TestBed.createComponent(SolicitudFormComponent);
    componente = fixture.componentInstance;
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  }

  beforeEach(montar);

  it('calcula el importe estimado con las horas escritas', () => {
    expect(componente.importeEstimado).toBe(0);
    componente.form.controls.horasEstimadas.setValue(2.5);
    expect(componente.importeEstimado).toBe(2500);
  });

  it('no envía si faltan las horas y muestra el error', () => {
    componente.enviar();
    fixture.detectChanges();
    expect(crear).not.toHaveBeenCalled();
    expect(componente.errorDe('horasEstimadas')).toContain('Indicá cuántas horas');
  });

  it('no deja fijar una fecha preferida anterior a hoy', () => {
    componente.form.patchValue({ horasEstimadas: 2, fechaPreferida: '2000-01-01' });
    componente.enviar();
    expect(crear).not.toHaveBeenCalled();
    expect(componente.form.controls.fechaPreferida.errors?.['pasada']).toBeTrue();
  });

  it('envía la solicitud y va al detalle', () => {
    componente.form.patchValue({ horasEstimadas: 3, fechaPreferida: '', observaciones: '  Lote norte  ' });
    componente.enviar();
    expect(crear).toHaveBeenCalledWith({ servicioId: 'sv1', horasEstimadas: 3, fechaPreferida: null, observaciones: 'Lote norte' });
    expect(navegar).toHaveBeenCalledWith(['/solicitudes-servicio', 's9']);
  });

  it('muestra el motivo que explica el backend si falla', () => {
    crear.and.returnValue(throwError(() => ({ status: 400, error: { message: 'La fecha preferida no puede ser anterior a hoy' } })));
    componente.form.patchValue({ horasEstimadas: 3 });
    componente.enviar();
    expect(componente.errorServidor).toBe('La fecha preferida no puede ser anterior a hoy');
    expect(componente.enviando).toBeFalse();
    expect(TestBed.inject(NotificacionService).notificaciones().length).toBe(0);
  });
});
