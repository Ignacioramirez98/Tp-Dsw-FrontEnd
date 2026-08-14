import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OperariosService } from '../../operario.service';
import { Operario } from '../../../../shared/models/operario.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-operarios-list',
  templateUrl: './operarios-list.component.html',
  standalone: false
})
export class OperariosListComponent implements OnInit {
  operarios: Operario[] = [];
  paginatedOperarios: Operario[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  errorCarga: string = '';

  constructor(
    private operarioService: OperariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getOperarios();
  }

  getOperarios(): void {
    this.errorCarga = '';
    this.operarioService.getOperarios().subscribe(
      (response: { data: Operario[] }) => {
        this.operarios = response.data;
        this.totalPages = Math.ceil(this.operarios.length / this.itemsPerPage);
        this.updatePaginatedOperarios();
      },
      (error: HttpErrorResponse) => {
        const status = error?.status ? ` (HTTP ${error.status})` : '';
        this.errorCarga = `No se pudo cargar el listado de operarios${status}.`;
      }
    );
  }

  updatePaginatedOperarios(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOperarios = this.operarios.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOperarios();
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

  verOperario(id: string): void {
    this.router.navigate(['/operarios', id]);
  }

  editOperario(id: string): void {
    this.router.navigate(['/operarios/edit', id]);
  }

  deleteOperario(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este operario?')) {
      this.operarioService.deleteOperario(id).subscribe(
        () => {
          alert('Operario eliminado exitosamente.');
          this.getOperarios();
        },
        () => {
          alert('Hubo un error al eliminar el operario.');
        }
      );
    }
  }

  nuevoOperario(): void {
    this.router.navigate(['/operarios/nuevo']);
  }
}
