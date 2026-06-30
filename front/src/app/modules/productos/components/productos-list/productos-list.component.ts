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

  constructor(
    private productoService: ProductosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProductos();
  }

getProductos(): void {
  this.productoService.getProductos().subscribe(
    (response: { data: Producto[] }) => {
      this.productos = response.data;
      this.totalPages = Math.ceil(this.productos.length / this.itemsPerPage);
      this.updatePaginatedProductos();
    },
    (_error: HttpErrorResponse) => {}
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

  // Método para redirigir al formulario de edición del producto
editProducto(id: string): void {
  this.router.navigate(['/productos/edit', id]);
}


  // Método para eliminar un producto
  deleteProducto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productoService.deleteProducto(id).subscribe(
        () => {
          alert('Producto eliminado exitosamente.');
          this.getProductos(); // Recarga la lista después de eliminar
        },
        () => {
          alert('Hubo un error al eliminar el producto.');
        }
      );
    }
  }

  nuevoProducto(): void {
  this.router.navigate(['/productos/nuevo']);
}
}
