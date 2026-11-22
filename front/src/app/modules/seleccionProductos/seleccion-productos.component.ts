import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Producto } from '../../shared/models/producto.model';
import { CarritoService } from '../../shared/services/carrito.service';
import { NotificacionService } from '../../shared/ui/notificacion.service';
import { urlImagen } from '../../shared/utils/imagen';
import { mensajeDeErrorHttp } from '../../shared/utils/errores';
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

  // El estado que cambia la pantalla vive en signals: lo derivado se recalcula solo cuando cambia algo
  readonly productos = signal<Producto[]>([]);
  readonly busqueda = signal('');
  readonly pagina = signal(1);
  cargando = true;
  error = '';

  /** Productos que coinciden con la búsqueda (en nombre y descripción, sin distinguir mayúsculas ni tildes). */
  readonly filtrados = computed(() => {
    const termino = this.normalizar(this.busqueda());
    const todos = this.productos();
    if (!termino) return todos;
    return todos.filter((p) => this.normalizar(`${p.nombre} ${p.descripcion ?? ''}`).includes(termino));
  });

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.porPagina)));

  /** Productos de la página actual. */
  readonly visibles = computed(() => {
    const desde = (this.pagina() - 1) * this.porPagina;
    return this.filtrados().slice(desde, desde + this.porPagina);
  });

  ngOnInit(): void {
    this.cargar();
  }

  /** Trae los productos y ajusta el pedido guardado a los precios y el stock de hoy. También lo usa Reintentar. */
  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.productosService.getProductos().subscribe({
      next: ({ data }) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        this.productos.set(ordenados);
        this.cargando = false;
        if (this.carrito.actualizarProductos(ordenados)) {
          this.notificaciones.info('Actualizamos tu pedido: cambió el precio o el stock de algún producto.');
        }
      },
      error: (err) => {
        this.error = mensajeDeErrorHttp(err, 'No se pudo cargar el catálogo de productos.');
        this.cargando = false;
      },
    });
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  irA(pagina: number): void {
    this.pagina.set(pagina);
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
