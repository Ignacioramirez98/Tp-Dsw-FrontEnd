import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { MENU_PERSONAL } from '../../auth/roles';

const NOMBRE_ROL: Record<string, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  operario: 'Operario',
};

/**
 * Estructura de las pantallas del personal (admin, vendedor, operario):
 * menú lateral según el rol + contenido. En celular el menú se abre con un botón.
 */
@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './staff-layout.component.html',
  styleUrl: './staff-layout.component.scss',
})
export class StaffLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuAbierto = signal(false);
  readonly rol = this.auth.getRol() ?? '';
  readonly usuario = (this.auth.getDecodedTokenPayload()?.['usuario'] as string | undefined) ?? 'Usuario';
  readonly nombreRol = NOMBRE_ROL[this.rol] ?? this.rol;
  readonly iniciales = this.usuario.slice(0, 2).toUpperCase();
  readonly items = computed(() => MENU_PERSONAL.filter((item) => item.roles.includes(this.rol as never)));

  constructor() {
    // En celular, cerrar el menú al navegar
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuAbierto.set(false));
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
