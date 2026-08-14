import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../cliente.service';
import { Cliente } from '../../../../shared/models/cliente.model';

@Component({
  selector: 'app-clientes-detail',
  templateUrl: './cliente-detail.component.html',
  standalone: false
})
export class ClienteDetailComponent implements OnInit {
  cliente: Cliente | null = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private clienteService: ClientesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/clientes']);
      return;
    }
    this.clienteService.getCliente(id).subscribe(
      (response: { data: Cliente }) => {
        this.cliente = response.data;
        this.cargando = false;
      },
      () => {
        this.error = 'No se pudo cargar el cliente.';
        this.cargando = false;
      }
    );
  }

  editar(): void {
    if (this.cliente) {
      this.router.navigate(['/clientes/edit', this.cliente._id]);
    }
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}
