import { Component, OnInit, inject } from '@angular/core';
import { Producto } from '../../shared/models/producto.model';
import { CarritoService } from '../../shared/services/carrito.service';
import { NotificacionService } from '../../shared/ui/notificacion.service';
import { urlImagen } from '../../shared/utils/imagen';
import { ProductosService } from '../productos/producto.service';

/** Catálogo del cliente: busca productos y arma el pedido (el carrito vive en CarritoService). */
@Component({
  selector: 'app-seleccion-productos',
  templateUrl: './seleccion-productos.component.html',
  standalone: false,
})
export class SeleccionProductosComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly notificaciones = inject(NotificacionService);
  /** Público: la plantilla lee las cantidades y el total directamente. */
  readonly carrito = inject(CarritoService);

  readonly urlImagen = urlImagen;
  readonly porPagina = 12;

  productos: Producto[] = [];
  cargando = true;
  error = '';
  busqueda = '';
  pagina = 1;

  ngOnInit(): void {
    this.cargar();
  }

  /** Trae los productos y ajusta el pedido guardado a los precios y el stock de hoy. También lo usa Reintentar. */
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.productosService.getProductos().subscribe({
      next: ({ data }) => {
        this.productos = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        this.cargando = false;
        if (this.carrito.actualizarProductos(this.productos)) {
          this.notificaciones.info('Actualizamos tu pedido: cambió el precio o el stock de algún producto.');
        }
      },
      error: () => {
        this.error = 'No se pudo cargar el catálogo de productos.';
        this.cargando = false;
      },
    });
  }

  /** Productos que coinciden con la búsqueda (en nombre y descripción, sin distinguir mayúsculas ni tildes). */
  get filtrados(): Producto[] {
    const termino = this.normalizar(this.busqueda);
    if (!termino) return this.productos;
    return this.productos.filter((p) => this.normalizar(`${p.nombre} ${p.descripcion ?? ''}`).includes(termino));
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina));
  }

  /** Productos de la página actual. */
  get visibles(): Producto[] {
    const desde = (this.pagina - 1) * this.porPagina;
    return this.filtrados.slice(desde, desde + this.porPagina);
  }

  buscar(texto: string): void {
    this.busqueda = texto;
    this.pagina = 1;
  }

  irA(pagina: number): void {
    this.pagina = pagina;
  }

  etiquetaStock(producto: Producto): string {
    if (producto.stock <= 0) return 'Sin stock';
    if (producto.stock === 1) return 'Última unidad';
    return `${producto.stock} disponibles`;
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
}
