import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FacturasListComponent } from './components/facturas-list/facturas-list.component';
import { FacturaDetailComponent } from './components/factura-detail/factura-detail.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { PaginadorComponent } from '../../shared/ui/paginador.component';

// Este módulo se usa en los dos layouts: personal ("Facturas") y cliente ("Mis facturas").
// Las facturas solo se consultan: se emiten desde el detalle de una venta concretada.
const routes: Routes = [
  { path: '', component: FacturasListComponent },
  { path: ':id', component: FacturaDetailComponent },
];

@NgModule({
  declarations: [FacturasListComponent, FacturaDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes), PageHeaderComponent, PaginadorComponent],
})
export class FacturasModule {}
