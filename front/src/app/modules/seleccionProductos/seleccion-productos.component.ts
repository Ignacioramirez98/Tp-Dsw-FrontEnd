import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../productos/producto.service.js';
import { Producto } from '../../shared/models/producto.model.js';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../../shared/components/warning/warning.component.js';  // Importar el componente de modal



@Component({
  selector: 'app-seleccion-productos',
  templateUrl: './seleccion-productos.component.html',
  styleUrls: ['./seleccion-productos.component.css']
})
export class SeleccionProductosComponent implements OnInit {
  productos: Producto[] = [];             // Lista completa de productos
  paginatedProductos: Producto[] = [];    // Productos en la página actual
  cantidades: { [key: string]: number } = {};  // Cantidades seleccionadas por producto
  errorCarga: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 12;               // Cantidad de productos por página
  totalPages: number = 1;

  constructor(private productoService: ProductosService, private router: Router, private dialog: MatDialog ) {}

  obtenerProductoId(producto: any): string {
    return String(producto?._id ?? producto?.id ?? '').trim();
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarProductosSeleccionados();  // Cargar los productos seleccionados desde el servicio
  }

  cargarProductos(): void {
    this.errorCarga = '';
    this.productoService.getProductosParaCompra().subscribe({
      next: (response) => {
        this.productos = (response.data || []).map((producto: any) => ({
          ...producto,
          _id: this.obtenerProductoId(producto)
        }));
        this.totalPages = Math.ceil(this.productos.length / this.itemsPerPage);
        this.updatePaginatedProductos();
      },
      error: (error) => {
        const status = error?.status ? ` (HTTP ${error.status})` : '';
        this.errorCarga = `No se pudo cargar el catalogo de productos${status}.`;
      }
    });
  }

  cargarProductosSeleccionados(): void {
    // Cargar las cantidades de los productos seleccionados desde el servicio
    const productosSeleccionados = this.productoService.getProductosSeleccionados();
    productosSeleccionados.forEach(producto => {
      const productId = this.obtenerProductoId(producto);
      if (!productId) {
        return;
      }
      this.cantidades[productId] = this.productoService.getCantidades()[productId] || 0;
    });
  }

  updatePaginatedProductos(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProductos = this.productos.slice(startIndex, startIndex + this.itemsPerPage);
  }

incrementarCantidad(productId: string): void {
  if (!productId) {
    return;
  }
  if (!this.cantidades[productId]) {
    this.cantidades[productId] = 0;
  }
  this.cantidades[productId]++;
  // Guardar la cantidad actualizada en el servicio
  const producto = this.productos.find(p => this.obtenerProductoId(p) === productId);
  if (producto) {
    this.productoService.setProductoSeleccionado(producto, this.cantidades[productId]);
  }
}

decrementarCantidad(productId: string): void {
  if (!productId) {
    return;
  }
  if (this.cantidades[productId] > 0) {
    this.cantidades[productId]--;
    // Si la cantidad llega a 0, eliminamos el producto
    if (this.cantidades[productId] === 0) {
      delete this.cantidades[productId];
      const producto = this.productos.find(p => this.obtenerProductoId(p) === productId);
      if (producto) {
        this.productoService.setProductoSeleccionado(producto, 0); // Eliminar producto cuando cantidad es 0
      }
    } else {
      // Si no es 0, simplemente actualizamos la cantidad
      const producto = this.productos.find(p => this.obtenerProductoId(p) === productId);
      if (producto) {
        this.productoService.setProductoSeleccionado(producto, this.cantidades[productId]);
      }
    }
  }
}


  // Paginación: Ir a la página anterior
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProductos();
    }
  }

  // Paginación: Ir a la siguiente página
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProductos();
    }
  }

  nuevaCompra(): void {
    const productosSeleccionados = Object.keys(this.cantidades).length;
    if (productosSeleccionados === 0) {
      this.openWarningMessage('No tienes productos seleccionados.');
    } else {
      // Guardar los productos seleccionados y sus cantidades en el servicio
      this.productos.forEach(producto => {
        const productId = this.obtenerProductoId(producto);
        if (productId && this.cantidades[productId] > 0) {
          this.productoService.setProductoSeleccionado(producto, this.cantidades[productId]);
        }
      });

      // Navegar a la página de confirmación de compra
      this.router.navigate(['/confirmar-compra']);
    }
  }

  openWarningMessage(message: string): void {
    const dialogRef = this.dialog.open(WarningComponent, {
      data: { message: message },
      panelClass: 'warning-message'  // Aplicamos la clase CSS para el estilo
    });

    // Cerrar el mensaje después de 1 segundo
    setTimeout(() => {
      dialogRef.close();
    }, 1000);  // 1000ms = 1 segundo
  }
}

