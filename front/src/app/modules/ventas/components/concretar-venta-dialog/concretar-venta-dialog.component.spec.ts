import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConcretarVentaDialogComponent, DatosConcretar } from './concretar-venta-dialog.component';
import { Venta } from '../../../../shared/models/venta.model';

registerLocaleData(localeEsAr, 'es-AR');

describe('ConcretarVentaDialogComponent', () => {
  const tractor = { _id: 'p1', nombre: 'Tractor', stock: 2 } as any;

  function crear(datos: DatosConcretar) {
    const cerrar = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [ConcretarVentaDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: datos },
        { provide: MatDialogRef, useValue: { close: cerrar } },
      ],
    });
    const fixture = TestBed.createComponent(ConcretarVentaDialogComponent);
    fixture.detectChanges();
    return { componente: fixture.componentInstance, cerrar };
  }

  function venta(cantidades: number[]): Venta {
    return Object.assign(new Venta(), {
      _id: 'v1',
      items: cantidades.map((cantidad) => ({ producto: tractor, cantidad, precioUnitario: 100 })),
    });
  }

  it('suma los renglones del mismo producto y detecta falta de stock', () => {
    const { componente, cerrar } = crear({ venta: venta([1, 2]) });
    expect(componente.renglones).toEqual([{ nombre: 'Tractor', cantidad: 3, stock: 2 }]);
    expect(componente.faltaStock).toBeTrue();
    componente.confirmar();
    expect(cerrar).not.toHaveBeenCalled();
  });

  it('el admin tiene que elegir vendedor antes de confirmar', () => {
    const { componente, cerrar } = crear({ venta: venta([1]), vendedores: [{ _id: 'v9', nombre: 'Laura' } as any] });
    componente.confirmar();
    expect(cerrar).not.toHaveBeenCalled();

    componente.vendedorId = 'v9';
    componente.fechaEntrega = '2999-01-01';
    componente.confirmar();
    expect(cerrar).toHaveBeenCalledWith({ vendedorId: 'v9', fechaEntrega: '2999-01-01' });
  });

  it('rechaza una fecha de entrega pasada', () => {
    const { componente } = crear({ venta: venta([1]) });
    componente.fechaEntrega = '2020-01-01';
    expect(componente.entregaInvalida).toBeTrue();
  });
});
