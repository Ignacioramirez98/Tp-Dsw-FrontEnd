import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VendedoresService } from '../../vendedor.service';
import { Vendedor } from '../../../../shared/models/vendedor.model';

@Component({
  selector: 'app-vendedor-detail',
  templateUrl: './vendedor-detail.component.html',
  standalone: false
})
export class VendedorDetailComponent implements OnInit {
  vendedor: Vendedor | null = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private vendedorService: VendedoresService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/vendedores']);
      return;
    }
    this.vendedorService.getVendedor(id).subscribe(
      (response: { data: Vendedor }) => {
        this.vendedor = response.data;
        this.cargando = false;
      },
      () => {
        this.error = 'No se pudo cargar el vendedor.';
        this.cargando = false;
      }
    );
  }

  editar(): void {
    if (this.vendedor) {
      this.router.navigate(['/vendedores/edit', this.vendedor._id]);
    }
  }

  volver(): void {
    this.router.navigate(['/vendedores']);
  }
}
