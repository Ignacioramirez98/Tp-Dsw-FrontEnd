import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendedoresService } from '../../vendedor.service';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-vendedores-list',
  templateUrl: './vendedores-list.component.html',
  standalone: false
})
export class VendedoresListComponent implements OnInit {
  vendedores: Vendedor[] = [];
  paginatedVendedores: Vendedor[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  errorCarga: string = '';

  constructor(
    private vendedorService: VendedoresService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getVendedores();
  }

  getVendedores(): void {
    this.errorCarga = '';
    this.vendedorService.getVendedores().subscribe(
      (response: { data: Vendedor[] }) => {
        this.vendedores = response.data;
        this.totalPages = Math.ceil(this.vendedores.length / this.itemsPerPage);
        this.updatePaginatedVendedores();
      },
      (error: HttpErrorResponse) => {
        const status = error?.status ? ` (HTTP ${error.status})` : '';
        this.errorCarga = `No se pudo cargar el listado de vendedores${status}.`;
      }
    );
  }

  updatePaginatedVendedores(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVendedores = this.vendedores.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedVendedores();
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

  verVendedor(id: string): void {
    this.router.navigate(['/vendedores', id]);
  }

  editVendedor(id: string): void {
    this.router.navigate(['/vendedores/edit', id]);
  }

  deleteVendedor(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este vendedor?')) {
      this.vendedorService.deleteVendedor(id).subscribe(
        () => {
          alert('Vendedor eliminado exitosamente.');
          this.getVendedores();
        },
        () => {
          alert('Hubo un error al eliminar el vendedor.');
        }
      );
    }
  }

  nuevoVendedor(): void {
    this.router.navigate(['/vendedores/nuevo']);
  }
}
