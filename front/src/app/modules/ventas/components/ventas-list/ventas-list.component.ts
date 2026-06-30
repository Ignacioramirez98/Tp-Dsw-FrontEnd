// src/app/modules/ventas/components/ventas-list/ventas-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VentasService } from '../../ventas.service.js';
import { Venta } from '../../../../shared/models/venta.model.js';
import { HttpErrorResponse } from '@angular/common/http';  // Asegúrate de importar HttpErrorResponse


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
      this.ventas = response.data;
      this.totalPages = Math.ceil(this.ventas.length / this.itemsPerPage);
      this.updatePaginatedVentas();
    },
    (_error: HttpErrorResponse) => {}
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
    return;
  }
  this.router.navigate(['/ventas/edit', id]);
}


  // Método para eliminar un Venta
  deleteVenta(id: string | undefined): void {
    if(!id){
    return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este Venta?')) {
      this.ventaservice.deleteVenta(id).subscribe(
        () => {
          alert('Venta eliminado exitosamente.');
          this.getventas(); // Recarga la lista después de eliminar
        },
        () => {
          alert('Hubo un error al eliminar el Venta.');
        }
      );
    }
  }

  nuevaVenta(): void {
  this.router.navigate(['/ventas/nuevo']);
}
}
