// src/app/modules/ventas/components/ventas-list/ventas-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../../ventas.service.js';
import { Venta } from '../../../../shared/models/venta.model.js';
import { HttpErrorResponse } from '@angular/common/http';  // Asegúrate de importar HttpErrorResponse
import { retry } from 'rxjs';


@Component({
  selector: 'app-ventas-list',
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.css'],
  standalone: false
})
export class VentasListComponent implements OnInit {
  ventas: Venta[] = [];
  paginatedVentas: Venta[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10; 
  totalPages: number = 0;

  constructor(
    private ventaservice: VentasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getventas();
  }

getventas(): void {
  this.ventaservice.getVentas().subscribe(
    (response: { data: Venta[] }) => {
      console.log('ventas desde API:', response);
      this.ventas = response.data;
      this.totalPages = Math.ceil(this.ventas.length / this.itemsPerPage);
      this.updatePaginatedVentas();
    },
    (error: HttpErrorResponse) => {  // Especificamos el tipo de error
      console.error('Error al obtener ventas:', error);
      if (error.error instanceof ErrorEvent) {
        // Error ocurrido en el lado del cliente
        console.error('Error en el cliente:', error.error.message);
      } else {
        // Error en la respuesta del servidor
        console.error(`Código de error ${error.status}, mensaje: ${error.message}`);
      }
    }
  );
}



  // Método para actualizar la lista paginada
  updatePaginatedVentas(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVentas = this.ventas.slice(startIndex, endIndex);
  }

  // Método para cambiar de página
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedVentas();
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

  // Método para redirigir al formulario de edición del Venta
editVenta(id: string | undefined): void {
  if(!id){
    console.error("ID de Venta no encontrado");
    return;
  }
  console.log('Editar Venta con ID:', id); // Asegúrate de que se esté imprimiendo correctamente el id
  this.router.navigate(['/ventas/edit', id]);
}


  // Método para eliminar un Venta
  deleteVenta(id: string | undefined): void {
    if(!id){
    console.error("ID de Venta no encontrado");
    return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este Venta?')) {
      this.ventaservice.deleteVenta(id).subscribe(
        () => {
          alert('Venta eliminado exitosamente.');
          this.getventas(); // Recarga la lista después de eliminar
        },
        (error) => {
          console.error('Error al eliminar el Venta:', error);
          alert('Hubo un error al eliminar el Venta.');
        }
      );
    }
  }

  nuevaVenta(): void {
  this.router.navigate(['/ventas/nuevo']);
}
}
