import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FinalizarSolicitudDialogComponent } from './finalizar-solicitud-dialog.component';
import { SolicitudServicio } from '../../../../shared/models/solicitud-servicio.model';

describe('FinalizarSolicitudDialogComponent', () => {
  const solicitud = { _id: 's1', estado: 'aceptada', horasEstimadas: 3, importePorHora: 1000, importeEstimado: 3000 } as SolicitudServicio;
  let cerrar: jasmine.Spy;

  function crear() {
    cerrar = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [FinalizarSolicitudDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { solicitud } },
        { provide: MatDialogRef, useValue: { close: cerrar } },
      ],
    });
    return TestBed.createComponent(FinalizarSolicitudDialogComponent).componentInstance;
  }

  it('propone las horas estimadas y calcula el importe final', () => {
    const dialogo = crear();
    expect(dialogo.horasReales).toBe(3);
    expect(dialogo.importeFinal).toBe(3000);
    dialogo.horasReales = 4.5;
    expect(dialogo.importeFinal).toBe(4500);
  });

  it('confirma con las horas reales', () => {
    const dialogo = crear();
    dialogo.horasReales = 4;
    dialogo.confirmar();
    expect(cerrar).toHaveBeenCalledWith({ horasReales: 4 });
  });

  it('no confirma con horas inválidas', () => {
    const dialogo = crear();
    for (const invalida of [null, 0, -1, 0.2, 5000]) {
      dialogo.horasReales = invalida;
      dialogo.confirmar();
    }
    expect(cerrar).not.toHaveBeenCalled();
    expect(dialogo.intentado).toBeTrue();
    expect(dialogo.importeFinal).toBe(0);
  });
});
