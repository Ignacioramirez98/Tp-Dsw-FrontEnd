import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ProductosService } from './producto.service';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/productos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ProductosService);
    httpController = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpController.verify();
  });

  it('normaliza id como _id al obtener el listado', () => {
    service.getProductos().subscribe((response) => {
      expect(response.data[0]._id).toBe('producto-1');
    });

    const request = httpController.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush({ data: [{ id: 'producto-1', nombre: 'Taladro' }] });
  });

  it('desempaqueta y normaliza el producto solicitado', () => {
    service.getProducto('producto-1').subscribe((producto) => {
      expect(producto._id).toBe('producto-1');
      expect(producto.nombre).toBe('Taladro');
    });

    const request = httpController.expectOne(`${apiUrl}/producto-1`);
    expect(request.request.method).toBe('GET');
    request.flush({ data: { id: 'producto-1', nombre: 'Taladro' } });
  });

  it('elimina el producto usando su identificador en la URL', () => {
    service.deleteProducto('producto-1').subscribe();

    const request = httpController.expectOne(`${apiUrl}/producto-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('actualiza el producto enviando los datos y la imagen como multipart', () => {
    const image = new File(['imagen'], 'taladro.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('nombre', 'Taladro actualizado');
    formData.append('imagen', image);

    service.updateProducto('producto-1', formData).subscribe((producto) => {
      expect(producto._id).toBe('producto-1');
      expect(producto.imagenUrl).toBe('/uploads/productos/taladro.png');
    });

    const request = httpController.expectOne(`${apiUrl}/producto-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBe(formData);
    expect(request.request.headers.has('Content-Type')).toBeFalse();
    expect((request.request.body as FormData).get('imagen')).toBe(image);
    request.flush({
      data: {
        id: 'producto-1',
        nombre: 'Taladro actualizado',
        imagenUrl: '/uploads/productos/taladro.png'
      }
    });
  });
});