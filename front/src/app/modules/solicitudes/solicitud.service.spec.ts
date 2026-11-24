import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SolicitudesService } from './solicitud.service';

describe('SolicitudesService', () => {
  let service: SolicitudesService;
  let http: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/solicitudes-servicio`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SolicitudesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las solicitudes con los filtros no vacíos y normaliza id como _id', () => {
    service.getSolicitudes({ estado: 'pendiente', desde: '', hasta: '2026-11-30' }).subscribe(({ data }) => {
      expect(data[0]._id).toBe('s1');
    });

    const req = http.expectOne((r) => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBe('pendiente');
    expect(req.request.params.has('desde')).toBeFalse();
    expect(req.request.params.get('hasta')).toBe('2026-11-30');
    req.flush({ data: [{ id: 's1', estado: 'pendiente' }] });
  });

  it('trae el detalle de una solicitud', () => {
    service.getSolicitud('s1').subscribe(({ data }) => expect(data.estado).toBe('aceptada'));
    const req = http.expectOne(`${apiUrl}/s1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { _id: 's1', estado: 'aceptada' } });
  });

  it('crea la solicitud con los datos del formulario', () => {
    const payload = { servicioId: 'sv1', horasEstimadas: 3, fechaPreferida: '2026-12-01', observaciones: 'Lote norte' };
    service.crear(payload).subscribe(({ data }) => expect(data._id).toBe('s2'));
    const req = http.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ data: { id: 's2', estado: 'pendiente' } });
  });

  it('acepta a nombre del operario logueado o con el operario que indica el admin', () => {
    service.aceptar('s1').subscribe(({ data }) => expect(data.estado).toBe('aceptada'));
    const propia = http.expectOne(`${apiUrl}/s1/aceptar`);
    expect(propia.request.method).toBe('POST');
    expect(propia.request.body).toEqual({});
    propia.flush({ data: { _id: 's1', estado: 'aceptada' } });

    service.aceptar('s1', 'op1').subscribe();
    const delAdmin = http.expectOne(`${apiUrl}/s1/aceptar`);
    expect(delAdmin.request.body).toEqual({ operarioId: 'op1' });
    delAdmin.flush({ data: { _id: 's1', estado: 'aceptada' } });
  });

  it('finaliza con o sin horas reales', () => {
    service.finalizar('s1', 4).subscribe(({ data }) => expect(data.importeFinal).toBe(4000));
    const con = http.expectOne(`${apiUrl}/s1/finalizar`);
    expect(con.request.method).toBe('POST');
    expect(con.request.body).toEqual({ horasReales: 4 });
    con.flush({ data: { id: 's1', estado: 'finalizada', importeFinal: 4000 } });

    service.finalizar('s1').subscribe();
    const sin = http.expectOne(`${apiUrl}/s1/finalizar`);
    expect(sin.request.body).toEqual({});
    sin.flush({ data: { _id: 's1', estado: 'finalizada' } });
  });

  it('cancela con o sin motivo', () => {
    service.cancelar('s1').subscribe();
    const sin = http.expectOne(`${apiUrl}/s1/cancelar`);
    expect(sin.request.method).toBe('POST');
    expect(sin.request.body).toEqual({});
    sin.flush({ data: { _id: 's1', estado: 'cancelada' } });

    service.cancelar('s1', 'Ya no hace falta').subscribe();
    const con = http.expectOne(`${apiUrl}/s1/cancelar`);
    expect(con.request.body).toEqual({ motivo: 'Ya no hace falta' });
    con.flush({ data: { _id: 's1', estado: 'cancelada' } });
  });
});
