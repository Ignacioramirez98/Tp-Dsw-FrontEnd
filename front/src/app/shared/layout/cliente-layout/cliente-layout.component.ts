import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ProductosService } from '../../../modules/productos/producto.service';
import { MENU_CLIENTE } from '../../auth/roles';
import { FooterComponent } from '../../components/footer/footer.component';

/**
 * Estructura del portal del cliente: barra superior tipo tienda (con carrito) + contenido + pie.
 * En celular, los enlaces se despliegan con un botón.
 */
@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.scss',
})
export class ClienteLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly productos = inject(ProductosService);

  readonly items = MENU_CLIENTE;
  readonly menuAbierto = signal(false);
  readonly usuario = (this.auth.getDecodedTokenPayload()?.['usuario'] as string | undefined) ?? 'Cliente';
  readonly iniciales = this.usuario.slice(0, 2).toUpperCase();

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuAbierto.set(false));
  }

  /** Cantidad total de unidades en el carrito. */
  get unidadesEnCarrito(): number {
    return Object.values(this.productos.getCantidades()).reduce((total, cantidad) => total + cantidad, 0);
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
