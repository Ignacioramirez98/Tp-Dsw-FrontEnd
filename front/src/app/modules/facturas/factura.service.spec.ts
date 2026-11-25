import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { FacturasService } from './factura.service';

describe('FacturasService', () => {
  let service: FacturasService;
  let http: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/facturas`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(FacturasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las facturas sin filtros', () => {
    service.getFacturas().subscribe(({ data }) => expect(data.length).toBe(1));
    const req = http.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush({ data: [{ _id: 'f1', numero: '0001-00000001' }] });
  });

  it('manda solo los filtros con valor', () => {
    service.getFacturas({ clienteId: 'c1', desde: '2026-11-01', hasta: '' }).subscribe();
    const req = http.expectOne((r) => r.url === apiUrl);
    expect(req.request.params.get('clienteId')).toBe('c1');
    expect(req.request.params.get('desde')).toBe('2026-11-01');
    expect(req.request.params.has('hasta')).toBeFalse();
    req.flush({ data: [] });
  });

  it('trae una factura y la factura de una venta', () => {
    service.getFactura('f1').subscribe(({ data }) => expect(data.numero).toBe('0001-00000001'));
    http.expectOne(`${apiUrl}/f1`).flush({ data: { _id: 'f1', numero: '0001-00000001' } });

    service.getFacturaDeVenta('v1').subscribe(({ data }) => expect(data._id).toBe('f1'));
    const deVenta = http.expectOne(`${environment.apiUrl}/ventas/v1/factura`);
    expect(deVenta.request.method).toBe('GET');
    deVenta.flush({ data: { _id: 'f1' } });
  });
});
