import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalidadesService } from '../../localidad.service';
import { ClientesService } from '../../../clientes/cliente.service';
import { Localidad } from '../../../../shared/models/localidad.model';
import { Cliente } from '../../../../shared/models/cliente.model';

/** Localidad con los clientes que viven en ella. */
@Component({
  selector: 'app-localidad-detail',
  templateUrl: './localidad-detail.component.html',
  standalone: false,
})
export class LocalidadDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly localidades = inject(LocalidadesService);
  private readonly clientesService = inject(ClientesService);

  localidad: Localidad | null = null;
  clientes: Cliente[] = [];
  cargando = true;
  cargandoClientes = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.localidades.getLocalidad(id).subscribe({
      next: ({ data }) => {
        this.localidad = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.status === 404 ? 'La localidad no existe o fue eliminada.' : 'No se pudo cargar la localidad.';
        this.cargando = false;
      },
    });
    this.clientesService.getClientes({ localidadId: id }).subscribe({
      next: ({ data }) => {
        this.clientes = [...data].sort((a, b) => a.apellido.localeCompare(b.apellido));
        this.cargandoClientes = false;
      },
      error: () => (this.cargandoClientes = false),
    });
  }
}
