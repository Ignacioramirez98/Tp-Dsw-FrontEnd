// src/app/modules/productos/components/productos-list/productos-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService } from '../../producto.service.js';
import { Producto } from '../../../../shared/models/producto.model.js';
import { HttpErrorResponse } from '@angular/common/http'; 


@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.css'],
  standalone: false
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  paginatedProductos: Producto[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10; 
  totalPages: number = 0;
  errorMessage: string = '';
  deletingProductId: string | null = null;

  constructor(
    private productoService: ProductosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProductos();
  }

getProductos(): void {
  this.errorMessage = '';
  this.productoService.getProductos().subscribe(
    (response: { data: Producto[] }) => {
      this.productos = response.data;
      this.totalPages = Math.ceil(this.productos.length / this.itemsPerPage);
      this.updatePaginatedProductos();
    },
    (error: HttpErrorResponse) => {
      const status = error.status ? ` (HTTP ${error.status})` : '';
      this.errorMessage = `No se pudo cargar el listado de productos${status}.`;
    }
  );
}



  // Método para actualizar la lista paginada
  updatePaginatedProductos(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProductos = this.productos.slice(startIndex, endIndex);
  }

  // Método para cambiar de página
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProductos();
  }

  // Métodos para navegar a la página anterior y siguiente
  prevPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  getProductoId(producto: Producto): string {
    return producto._id?.trim() || '';
  }

  // Método para redirigir al formulario de edición del producto
  editProducto(producto: Producto): void {
    const id = this.getProductoId(producto);
    if (!id) {
      this.errorMessage = 'No se puede editar el producto porque no tiene un identificador valido.';
      return;
    }

    this.router.navigate(['/productos/edit', id]);
  }


  // Método para eliminar un producto
  deleteProducto(producto: Producto): void {
    const id = this.getProductoId(producto);
    if (!id) {
      this.errorMessage = 'No se puede eliminar el producto porque no tiene un identificador valido.';
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.errorMessage = '';
      this.deletingProductId = id;
      this.productoService.deleteProducto(id).subscribe(
        () => {
          this.productos = this.productos.filter((item) => this.getProductoId(item) !== id);
          this.totalPages = Math.ceil(this.productos.length / this.itemsPerPage);
          this.currentPage = Math.min(this.currentPage, Math.max(this.totalPages, 1));
          this.updatePaginatedProductos();
          this.deletingProductId = null;
          alert('Producto eliminado exitosamente.');
        },
        (error: HttpErrorResponse) => {
          this.deletingProductId = null;
          this.errorMessage = error.error?.message || 'Hubo un error al eliminar el producto.';
        }
      );
    }
  }

  nuevoProducto(): void {
  this.router.navigate(['/productos/nuevo']);
}
}
