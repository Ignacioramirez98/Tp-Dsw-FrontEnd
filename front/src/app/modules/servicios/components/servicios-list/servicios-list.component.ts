// src/app/modules/Servicios/components/Servicios-list/Servicios-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService } from '../../servicio.service.js';
import { Servicio } from '../../../../shared/models/servicio.model.js';
import { HttpErrorResponse } from '@angular/common/http';  // Asegúrate de importar HttpErrorResponse


@Component({
  selector: 'app-Servicios-list',
  templateUrl: './servicios-list.component.html',
  styleUrls: ['./servicios-list.component.css'],
  standalone: false
})
export class ServiciosListComponent implements OnInit {
  Servicios: Servicio[] = [];
  paginatedServicios: Servicio[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10; 
  totalPages: number = 0;

  constructor(
    private servicioservice: ServiciosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getServicios();
  }

getServicios(): void {
  this.servicioservice.getServicios().subscribe(
    (response: { data: Servicio[] }) => {
      this.Servicios = response.data;
      this.totalPages = Math.ceil(this.Servicios.length / this.itemsPerPage);
      this.updatePaginatedServicios();
    },
    (_error: HttpErrorResponse) => {}
  );
}



  // Método para actualizar la lista paginada
  updatePaginatedServicios(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedServicios = this.Servicios.slice(startIndex, endIndex);
  }

  // Método para cambiar de página
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedServicios();
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

  // Método para redirigir al formulario de edición del Servicio
editServicio(id: string): void {
  this.router.navigate(['/servicios/edit', id]);
}


  // Método para eliminar un Servicio
  deleteServicio(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este Servicio?')) {
      this.servicioservice.deleteServicio(id).subscribe(
        () => {
          alert('Servicio eliminado exitosamente.');
          this.getServicios(); // Recarga la lista después de eliminar
        },
        () => {
          alert('Hubo un error al eliminar el Servicio.');
        }
      );
    }
  }

  nuevoServicio(): void {
  this.router.navigate(['/servicios/nuevo']);
}
}
