import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalidadesService } from '../../localidad.service';
import { Localidad } from '../../../../shared/models/localidad.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-localidades-list',
  templateUrl: './localidades-list.component.html',
  standalone: false
})
export class LocalidadesListComponent implements OnInit {
  localidades: Localidad[] = [];
  paginatedLocalidades: Localidad[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  errorCarga: string = '';

  constructor(
    private localidadService: LocalidadesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getLocalidades();
  }

  getLocalidades(): void {
    this.errorCarga = '';
    this.localidadService.getLocalidades().subscribe(
      (response: { data: Localidad[] }) => {
        this.localidades = response.data;
        this.totalPages = Math.ceil(this.localidades.length / this.itemsPerPage);
        this.updatePaginatedLocalidades();
      },
      (error: HttpErrorResponse) => {
        const status = error?.status ? ` (HTTP ${error.status})` : '';
        this.errorCarga = `No se pudo cargar el listado de localidades${status}.`;
      }
    );
  }

  updatePaginatedLocalidades(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLocalidades = this.localidades.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedLocalidades();
  }

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

  verLocalidad(id: string): void {
    this.router.navigate(['/localidades', id]);
  }

  editLocalidad(id: string): void {
    this.router.navigate(['/localidades/edit', id]);
  }

  deleteLocalidad(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta localidad?')) {
      this.localidadService.deleteLocalidad(id).subscribe(
        () => {
          alert('Localidad eliminada exitosamente.');
          this.getLocalidades();
        },
        () => {
          alert('Hubo un error al eliminar la localidad.');
        }
      );
    }
  }

  nuevaLocalidad(): void {
    this.router.navigate(['/localidades/nuevo']);
  }
}
