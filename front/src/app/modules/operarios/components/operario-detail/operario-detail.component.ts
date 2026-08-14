import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperariosService } from '../../operario.service';
import { Operario } from '../../../../shared/models/operario.model';

@Component({
  selector: 'app-operario-detail',
  templateUrl: './operario-detail.component.html',
  standalone: false
})
export class OperarioDetailComponent implements OnInit {
  operario: Operario | null = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private operarioService: OperariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/operarios']);
      return;
    }
    this.operarioService.getOperario(id).subscribe(
      (response: { data: Operario }) => {
        this.operario = response.data;
        this.cargando = false;
      },
      () => {
        this.error = 'No se pudo cargar el operario.';
        this.cargando = false;
      }
    );
  }

  editar(): void {
    if (this.operario) {
      this.router.navigate(['/operarios/edit', this.operario._id]);
    }
  }

  volver(): void {
    this.router.navigate(['/operarios']);
  }
}
