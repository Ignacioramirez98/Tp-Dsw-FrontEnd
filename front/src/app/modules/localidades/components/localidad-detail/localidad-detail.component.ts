import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalidadesService } from '../../localidad.service';
import { Localidad } from '../../../../shared/models/localidad.model';

@Component({
  selector: 'app-localidad-detail',
  templateUrl: './localidad-detail.component.html',
  standalone: false
})
export class LocalidadDetailComponent implements OnInit {
  localidad: Localidad | null = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private localidadService: LocalidadesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/localidades']);
      return;
    }
    this.localidadService.getLocalidad(id).subscribe(
      (response: { data: Localidad }) => {
        this.localidad = response.data;
        this.cargando = false;
      },
      () => {
        this.error = 'No se pudo cargar la localidad.';
        this.cargando = false;
      }
    );
  }

  editar(): void {
    if (this.localidad) {
      this.router.navigate(['/localidades/edit', this.localidad._id]);
    }
  }

  volver(): void {
    this.router.navigate(['/localidades']);
  }
}
