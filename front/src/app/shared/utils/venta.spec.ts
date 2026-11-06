import { Venta } from '../models/venta.model';
import { resumirVentas, totalVenta } from './venta';

describe('resumirVentas', () => {
  // Fecha fija para que los tests no dependan del día en que se corren
  const hoy = new Date(2026, 10, 15); // 15/11/2026

  function venta(datos: Partial<Venta> & { monto?: number; vendedorId?: string }): Venta {
    const { monto = 1000, vendedorId, ...resto } = datos;
    return Object.assign(new Venta(), {
      _id: Math.random().toString(36).slice(2),
      items: [{ producto: null, cantidad: 1, precioUnitario: monto }],
      vendedor: vendedorId ? { _id: vendedorId } : null,
      ...resto,
    });
  }

  it('ordena los pendientes del más viejo al más nuevo', () => {
    const nuevo = venta({ _id: 'nuevo', estado: 'pendiente', fechaContacto: new Date(2026, 10, 10) });
    const viejo = venta({ _id: 'viejo', estado: 'pendiente', fechaContacto: new Date(2026, 9, 1) });
    const medio = venta({ _id: 'medio', estado: 'pendiente', fechaContacto: new Date(2026, 9, 20) });

    const { pendientes } = resumirVentas([nuevo, viejo, medio], hoy);

    expect(pendientes.map((v) => v._id)).toEqual(['viejo', 'medio', 'nuevo']);
  });

  it('no cuenta como pendientes a las ventas que ya tienen otro estado', () => {
    const ventas = [
      venta({ estado: 'pendiente' }),
      venta({ estado: 'concretada', fechaDeVenta: new Date(2026, 10, 2) }),
      venta({ estado: 'cancelada' }),
    ];

    expect(resumirVentas(ventas, hoy).pendientes.length).toBe(1);
  });

  it('cuenta las concretadas y facturadas de este mes, por la fecha en que se concretaron', () => {
    const ventas = [
      venta({ estado: 'concretada', fechaDeVenta: new Date(2026, 10, 2), monto: 500 }),
      venta({ estado: 'facturada', fechaDeVenta: new Date(2026, 10, 14), monto: 300 }),
    ];

    const resumen = resumirVentas(ventas, hoy);

    expect(resumen.delMes).toBe(2);
    expect(resumen.vendidoDelMes).toBe(800);
  });

  it('no cuenta una venta concretada el mes pasado, aunque el pedido sea de este mes', () => {
    const vieja = venta({
      estado: 'concretada',
      fechaContacto: new Date(2026, 10, 1),
      fechaDeVenta: new Date(2026, 9, 31),
    });

    const resumen = resumirVentas([vieja], hoy);

    expect(resumen.delMes).toBe(0);
    expect(resumen.vendidoDelMes).toBe(0);
  });

  it('no suma las ventas canceladas', () => {
    const cancelada = venta({ estado: 'cancelada', fechaDeVenta: new Date(2026, 10, 3), monto: 900 });

    const resumen = resumirVentas([cancelada], hoy);

    expect(resumen.delMes).toBe(0);
    expect(resumen.vendidoDelMes).toBe(0);
  });

  it('con vendedorId cuenta solo las ventas de ese vendedor', () => {
    const ventas = [
      venta({ estado: 'concretada', fechaDeVenta: new Date(2026, 10, 2), monto: 100, vendedorId: 'ana' }),
      venta({ estado: 'concretada', fechaDeVenta: new Date(2026, 10, 3), monto: 200, vendedorId: 'beto' }),
      venta({ estado: 'facturada', fechaDeVenta: new Date(2026, 10, 4), monto: 400, vendedorId: 'ana' }),
    ];

    const deAna = resumirVentas(ventas, hoy, 'ana');
    const todas = resumirVentas(ventas, hoy);

    expect(deAna.delMes).toBe(2);
    expect(deAna.vendidoDelMes).toBe(500);
    expect(todas.delMes).toBe(3);
  });

  it('los pendientes no dependen del vendedor: los ve cualquiera que pueda concretarlos', () => {
    const ventas = [venta({ estado: 'pendiente', vendedorId: 'beto' }), venta({ estado: 'pendiente' })];

    expect(resumirVentas(ventas, hoy, 'ana').pendientes.length).toBe(2);
  });

  it('usa cantidad × precio de cada renglón para el total', () => {
    const v = venta({ items: [
      { producto: null, cantidad: 2, precioUnitario: 100 },
      { producto: null, cantidad: 3, precioUnitario: 50 },
    ] });

    expect(totalVenta(v)).toBe(350);
  });
});
