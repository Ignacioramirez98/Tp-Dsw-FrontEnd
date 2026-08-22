import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientesService } from '../../cliente.service';
import { Cliente } from '../../../../shared/models/cliente.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.component.html',
  standalone: false
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  paginatedClientes: Cliente[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  errorCarga: string = '';

  constructor(
    private clienteService: ClientesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getClientes();
  }

  getClientes(): void {
    this.errorCarga = '';
    this.clienteService.getClientes().subscribe(
      (response: { data: Cliente[] }) => {
        this.clientes = response.data;
        this.totalPages = Math.ceil(this.clientes.length / this.itemsPerPage);
        this.updatePaginatedClientes();
      },
      (error: HttpErrorResponse) => {
        const status = error?.status ? ` (HTTP ${error.status})` : '';
        this.errorCarga = `No se pudo cargar el listado de clientes${status}.`;
      }
    );
  }

  updatePaginatedClientes(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClientes = this.clientes.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedClientes();
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

  verCliente(id: string): void {
    this.router.navigate(['/clientes', id]);
  }

  editCliente(id: string): void {
    this.router.navigate(['/clientes/edit', id]);
  }

  deleteCliente(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clienteService.deleteCliente(id).subscribe(
        () => {
          alert('Cliente eliminado exitosamente.');
          this.getClientes();
        },
        () => {
          alert('Hubo un error al eliminar el cliente.');
        }
      );
    }
  }

  nuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }
}
