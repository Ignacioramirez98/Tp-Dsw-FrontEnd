// src/app/modules/productos/components/productos-list/productos-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../producto.service.js';
import { Producto } from '../../../../shared/models/producto.model.js';
import { HeaderComponent } from '../../../../shared/components/header/header.component.js';
import { FooterComponent } from '../../../../shared/components/footer/footer.component.js';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.css'],
})
export class ProductosListComponent implements OnInit {
    productos: Producto[] = [];
    paginatedProductos: Producto[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 5; 
    totalPages: number = 0;

 constructor(private productoService: ProductosService) {}

  ngOnInit(): void {
    this.getProductos();
  }

getProductos(): void {
  this.productoService.getProductos().subscribe(
    (response) => {
      console.log('Productos desde API:', response); // Verifica la estructura de la respuesta
      this.productos = response.data; // Accede a la propiedad 'data' que contiene el array de productos
      this.totalPages = Math.ceil(this.productos.length / this.itemsPerPage);
      this.updatePaginatedProductos();
    },
    (error) => {
      console.error('Error al obtener productos:', error);
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


}
