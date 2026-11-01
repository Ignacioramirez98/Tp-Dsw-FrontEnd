import { Component, inject } from '@angular/core';
import { ProductosService } from '../../producto.service';
import { Producto } from '../../../../shared/models/producto.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { urlImagen } from '../../../../shared/utils/imagen';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.component.html',
  standalone: false,
})
export class ProductosListComponent extends ListadoBase<Producto> {
  private readonly servicio = inject(ProductosService);
  protected readonly recurso = 'productos';
  readonly urlImagen = urlImagen;

  protected cargar$() { return this.servicio.getProductos(); }
  protected eliminar$(id: string) { return this.servicio.deleteProducto(id); }
  protected textoBuscable(p: Producto) { return `${p.nombre} ${p.descripcion}`; }
  protected descripcion(p: Producto) { return `el producto ${p.nombre}`; }
}
