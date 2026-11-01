import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperariosService } from '../../operario.service';
import { ServiciosService } from '../../../servicios/servicio.service';
import { Operario } from '../../../../shared/models/operario.model';
import { Servicio } from '../../../../shared/models/servicio.model';

/** Operario con los servicios que tiene a cargo. */
@Component({
  selector: 'app-operario-detail',
  templateUrl: './operario-detail.component.html',
  standalone: false,
})
export class OperarioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly operarios = inject(OperariosService);
  private readonly serviciosService = inject(ServiciosService);

  operario: Operario | null = null;
  servicios: Servicio[] = [];
  cargando = true;
  cargandoServicios = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.operarios.getOperario(id).subscribe({
      next: ({ data }) => {
        this.operario = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.status === 404 ? 'El operario no existe o fue eliminado.' : 'No se pudo cargar el operario.';
        this.cargando = false;
      },
    });
    this.serviciosService.getServicios({ operarioId: id }).subscribe({
      next: ({ data }) => {
        this.servicios = data;
        this.cargandoServicios = false;
      },
      error: () => (this.cargandoServicios = false),
    });
  }
}
