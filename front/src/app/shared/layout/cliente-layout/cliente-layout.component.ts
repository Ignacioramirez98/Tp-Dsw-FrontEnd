import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
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
  private readonly carrito = inject(CarritoService);

  readonly items = MENU_CLIENTE;
  readonly menuAbierto = signal(false);
  readonly usuario = (this.auth.getDecodedTokenPayload()?.['usuario'] as string | undefined) ?? 'Cliente';
  readonly iniciales = this.usuario.slice(0, 2).toUpperCase();

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuAbierto.set(false));
  }

  /** Cantidad total de unidades en el carrito (se actualiza sola al agregar o quitar productos). */
  get unidadesEnCarrito(): number {
    return this.carrito.unidades();
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarSesion(): void {
    // Se vacía antes de salir: si no, el pedido queda en memoria para el próximo usuario de esta pestaña
    this.carrito.vaciar();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
