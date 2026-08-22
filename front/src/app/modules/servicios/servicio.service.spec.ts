import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ServiciosService } from './servicio.service';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let httpController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/servicios`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ServiciosService);
    httpController = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpController.verify());

  it('normaliza id como _id al obtener el listado', () => {
    service.getServicios().subscribe((response) => {
      expect(response.data[0]._id).toBe('servicio-1');
    });

    const request = httpController.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush({ data: [{ id: 'servicio-1', descripcion: 'Mantenimiento' }] });
  });

  it('desempaqueta el servicio solicitado', () => {
    service.getServicio('servicio-1').subscribe((servicio) => {
      expect(servicio._id).toBe('servicio-1');
      expect(servicio.descripcion).toBe('Mantenimiento');
    });

    const request = httpController.expectOne(`${apiUrl}/servicio-1`);
    expect(request.request.method).toBe('GET');
    request.flush({ data: { id: 'servicio-1', descripcion: 'Mantenimiento' } });
  });

  it('actualiza el servicio mediante multipart', () => {
    const image = new File(['imagen'], 'servicio.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('descripcion', 'Mantenimiento actualizado');
    formData.append('imagen', image);

    service.updateServicio('servicio-1', formData).subscribe((servicio) => {
      expect(servicio.imagenUrl).toBe('/uploads/servicio.png');
    });

    const request = httpController.expectOne(`${apiUrl}/servicio-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBe(formData);
    expect(request.request.headers.has('Content-Type')).toBeFalse();
    request.flush({ data: { id: 'servicio-1', imagenUrl: '/uploads/servicio.png' } });
  });

  it('elimina el servicio usando su identificador', () => {
    service.deleteServicio('servicio-1').subscribe();

    const request = httpController.expectOne(`${apiUrl}/servicio-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});