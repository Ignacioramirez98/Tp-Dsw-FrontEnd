import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { UsuariosService } from '../../usuario.service';
import { ClientesService } from '../../../clientes/cliente.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { OperariosService } from '../../../operarios/operario.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ETIQUETA_ROL, Usuario } from '../../../../shared/models/usuario.model';
import { ListadoBase } from '../../../../shared/ui/listado-base';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';

type Persona = { _id: string; nombre: string; apellido: string };

/** Fila del listado: la cuenta más el nombre de la persona a la que pertenece. */
export interface UsuarioFila extends Usuario {
  perfil: string;
}

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  standalone: false,
})
export class UsuariosListComponent extends ListadoBase<UsuarioFila> {
  private readonly usuarios = inject(UsuariosService);
  private readonly clientes = inject(ClientesService);
  private readonly vendedores = inject(VendedoresService);
  private readonly operarios = inject(OperariosService);
  private readonly auth = inject(AuthService);

  protected readonly recurso = 'usuarios';
  readonly etiquetaRol = ETIQUETA_ROL;
  /** Cuenta con la que se inició sesión: no se puede desactivar ni eliminar a sí misma. */
  readonly propioId = this.auth.getUsuarioId();
  cambiandoId: string | null = null;

  protected cargar$(): Observable<{ data: UsuarioFila[] }> {
    // Si fallan las listas de personas el listado igual se muestra, solo que sin el nombre del perfil
    const vacio = of({ data: [] as Persona[] });
    return forkJoin({
      cuentas: this.usuarios.getUsuarios(),
      clientes: this.clientes.getClientes().pipe(catchError(() => vacio)),
      vendedores: this.vendedores.getVendedores().pipe(catchError(() => vacio)),
      operarios: this.operarios.getOperarios().pipe(catchError(() => vacio)),
    }).pipe(
      map(({ cuentas, clientes, vendedores, operarios }) => {
        const nombres = new Map<string, string>();
        for (const p of [...clientes.data, ...vendedores.data, ...operarios.data]) {
          nombres.set(p._id, `${p.apellido}, ${p.nombre}`);
        }
        const data = cuentas.data.map((u) => {
          const perfilId = u.clienteId ?? u.vendedorId ?? u.operarioId;
          return { ...u, perfil: perfilId ? (nombres.get(perfilId) ?? 'Perfil no encontrado') : '' };
        });
        return { data };
      }),
    );
  }

  protected eliminar$(id: string) { return this.usuarios.eliminar(id); }
  protected textoBuscable(u: UsuarioFila) { return `${u.usuario} ${this.etiquetaRol[u.rol] ?? u.rol} ${u.perfil}`; }
  protected descripcion(u: UsuarioFila) { return `el usuario ${u.usuario}`; }

  esPropio(u: UsuarioFila): boolean {
    return !!this.propioId && u._id === this.propioId;
  }

  tienePerfil(u: UsuarioFila): boolean {
    return !!(u.clienteId || u.vendedorId || u.operarioId);
  }

  /** Por qué no se puede eliminar (null si se puede). */
  motivoNoEliminar(u: UsuarioFila): string | null {
    if (this.esPropio(u)) return 'No podés eliminar tu propio usuario';
    if (this.tienePerfil(u)) return 'Está vinculado a una persona: desactivalo en su lugar';
    return null;
  }

  /** Activa o desactiva la cuenta; al desactivar pide confirmación porque deja de poder entrar. */
  cambiarEstado(u: UsuarioFila): void {
    if (this.cambiandoId) return;
    if (u.activo) {
      this.confirmacion
        .confirmar({
          titulo: 'Desactivar usuario',
          mensaje: `¿Desactivar ${this.descripcion(u)}? Ya no va a poder iniciar sesión. Podés volver a activarlo cuando quieras.`,
          textoConfirmar: 'Desactivar',
          peligro: true,
        })
        .subscribe((confirmado) => confirmado && this.aplicarEstado(u, false));
    } else {
      this.aplicarEstado(u, true);
    }
  }

  private aplicarEstado(u: UsuarioFila, activo: boolean): void {
    this.cambiandoId = u._id;
    const pedido$ = activo ? this.usuarios.activar(u._id) : this.usuarios.desactivar(u._id);
    pedido$.subscribe({
      next: () => {
        this.cambiandoId = null;
        // Se actualiza la fila en el lugar para no perder la búsqueda ni la página
        this.items = this.items.map((i) => (i._id === u._id ? { ...i, activo } : i));
        this.aplicarFiltro();
        this.notificaciones.exito(`Se ${activo ? 'activó' : 'desactivó'} ${this.descripcion(u)}.`);
      },
      error: (err: HttpErrorResponse) => {
        this.cambiandoId = null;
        if (err.status !== 403) {
          this.notificaciones.error(mensajeDeErrorHttp(err, `No se pudo ${activo ? 'activar' : 'desactivar'} ${this.descripcion(u)}.`));
        }
      },
    });
  }
}
