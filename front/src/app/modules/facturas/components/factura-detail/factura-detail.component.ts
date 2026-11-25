import { Component, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FacturasService } from '../../factura.service';
import { Factura } from '../../../../shared/models/factura.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';

/** Comprobante de una factura, listo para imprimir o guardar como PDF desde el navegador. */
@Component({
  selector: 'app-factura-detail',
  templateUrl: './factura-detail.component.html',
  standalone: false,
})
export class FacturaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facturas = inject(FacturasService);
  private readonly documento = inject(DOCUMENT);

  readonly esCliente = inject(AuthService).getRol() === 'cliente';

  factura: Factura | null = null;
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargando = true;
    this.error = '';
    this.facturas.getFactura(id).subscribe({
      next: ({ data }) => {
        this.factura = data;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.status === 404
          ? 'La factura no existe o no tenés acceso a ella.'
          : mensajeDeErrorHttp(err, 'No se pudo cargar la factura.');
        this.cargando = false;
      },
    });
  }

  /** Abre el diálogo de impresión del navegador (ahí también se puede guardar como PDF). */
  imprimir(): void {
    this.documento.defaultView?.print();
  }
}
