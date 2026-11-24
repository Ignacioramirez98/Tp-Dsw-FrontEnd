import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, forkJoin, map } from 'rxjs';
import { UsuariosService } from '../../usuario.service';
import { ClientesService } from '../../../clientes/cliente.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { OperariosService } from '../../../operarios/operario.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { CAMPO_PERFIL, DatosUsuario, ETIQUETA_ROL, ROLES_ASIGNABLES, RolUsuario, Usuario } from '../../../../shared/models/usuario.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { mensajeDeErrorHttp } from '../../../../shared/utils/errores';

/** Persona a la que se puede vincular la cuenta. */
export interface OpcionPerfil {
  id: string;
  etiqueta: string;
}

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  standalone: false,
})
export class UsuarioFormComponent extends FormularioBase<Usuario> {
  private readonly fb = inject(FormBuilder);
  private readonly usuarios = inject(UsuariosService);
  private readonly clientes = inject(ClientesService);
  private readonly vendedores = inject(VendedoresService);
  private readonly operarios = inject(OperariosService);
  private readonly auth = inject(AuthService);

  protected readonly recurso = 'usuario';
  readonly rutaListado = '/usuarios';
  protected override readonly mensajes = {
    usuario: { minlength: 'El usuario tiene que tener al menos 3 caracteres.' },
    contraseña: { minlength: 'La contraseña tiene que tener al menos 6 caracteres.' },
  };

  readonly roles = ROLES_ASIGNABLES;
  readonly etiquetaRol = ETIQUETA_ROL;
  perfiles: OpcionPerfil[] = [];
  cargandoPerfiles = false;
  errorPerfiles = '';
  /** Cuenta de un administrador: no cambia de rol ni se vincula a una persona. */
  esAdmin = false;
  /** Es la cuenta con la que se inició sesión: no se puede desactivar. */
  esPropia = false;
  /** Rol del que se están pidiendo las personas: descarta respuestas de un rol que ya se cambió. */
  private rolPedido: RolUsuario | null = null;

  protected crearFormulario() {
    const editando = !!this.route.snapshot.paramMap.get('id');
    const form = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      // Al editar, dejarla vacía significa "no cambiarla"
      contraseña: ['', editando ? [Validators.minLength(6), Validators.maxLength(100)] : [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      rol: ['cliente' as RolUsuario, Validators.required],
      perfilId: ['', Validators.required],
      activo: [true],
    });
    // Cada rol tiene sus propias personas: al cambiar de rol hay que elegir de nuevo
    form.controls.rol.valueChanges.subscribe((rol) => {
      form.controls.perfilId.setValue('');
      if (rol) this.cargarPerfiles(rol);
    });
    this.cargarPerfiles('cliente');
    return form;
  }

  /** Rol que está elegido en el formulario. */
  private get rolElegido(): RolUsuario {
    return this.form.controls['rol'].value as RolUsuario;
  }

  get etiquetaRolElegido(): string {
    return this.etiquetaRol[this.rolElegido] ?? '';
  }

  get campoPerfil(): string {
    return { cliente: 'el cliente', vendedor: 'el vendedor', operario: 'el operario', admin: '' }[this.rolElegido] ?? '';
  }

  protected obtener$(id: string): Observable<Usuario> {
    return this.usuarios.getUsuario(id).pipe(map((r) => r.data));
  }

  protected override cargarEnFormulario(usuario: Usuario): void {
    this.esAdmin = usuario.rol === 'admin';
    this.esPropia = usuario._id === this.auth.getUsuarioId();
    if (this.esPropia) this.form.controls['activo'].disable();
    if (this.esAdmin) {
      this.form.controls['perfilId'].clearValidators();
      this.form.controls['perfilId'].updateValueAndValidity();
      this.form.controls['rol'].disable();
    }
    this.form.patchValue({ usuario: usuario.usuario, rol: usuario.rol, activo: usuario.activo });
    const campo = CAMPO_PERFIL[usuario.rol];
    // Va después del rol, porque al cambiar el rol se vacía la persona elegida
    this.form.patchValue({ perfilId: (campo && usuario[campo]) || '' });
  }

  /** Arma lo que espera el backend: al editar solo se envía lo que hace falta. */
  protected override valorParaEnviar(): Record<string, unknown> {
    const { usuario, contraseña, rol, perfilId, activo } = this.form.getRawValue();
    const datos: DatosUsuario = { usuario: String(usuario).trim() };
    if (contraseña) datos.contraseña = contraseña;
    if (!this.esAdmin) {
      datos.rol = rol;
      const campo = CAMPO_PERFIL[rol as RolUsuario];
      if (campo && perfilId) datos[campo] = perfilId;
    }
    if (this.esEdicion) datos.activo = !!activo;
    return datos as Record<string, unknown>;
  }

  protected crear$(datos: DatosUsuario) {
    return this.usuarios.crear(datos);
  }

  protected actualizar$(id: string, datos: DatosUsuario) {
    return this.usuarios.actualizar(id, datos);
  }

  /**
   * Personas del rol elegido que todavía no tienen cuenta (más la de esta cuenta, al editar):
   * cada persona puede tener una sola.
   */
  private cargarPerfiles(rol: RolUsuario): void {
    this.perfiles = [];
    this.errorPerfiles = '';
    this.rolPedido = rol;
    const campo = CAMPO_PERFIL[rol];
    if (!campo) return;

    this.cargandoPerfiles = true;
    forkJoin({ cuentas: this.usuarios.getUsuarios(), personas: this.personas$(rol) }).subscribe({
      next: ({ cuentas, personas }) => {
        // Si mientras tanto cambió el rol, esta respuesta ya no corresponde
        if (this.rolPedido !== rol) return;
        const ocupadas = new Set(cuentas.data.filter((c) => c._id !== this.id).map((c) => c[campo]).filter(Boolean));
        this.perfiles = personas.filter((p) => !ocupadas.has(p.id));
        this.cargandoPerfiles = false;
      },
      error: (err) => {
        this.cargandoPerfiles = false;
        this.errorPerfiles = mensajeDeErrorHttp(err, 'No se pudo cargar la lista de personas.');
      },
    });
  }

  private personas$(rol: RolUsuario): Observable<OpcionPerfil[]> {
    const etiqueta = (p: { apellido: string; nombre: string; dni: string }) => `${p.apellido}, ${p.nombre} (DNI ${p.dni})`;
    switch (rol) {
      case 'cliente': return this.clientes.getClientes().pipe(map((r) => r.data.map((p) => ({ id: p._id, etiqueta: etiqueta(p) }))));
      case 'vendedor': return this.vendedores.getVendedores().pipe(map((r) => r.data.map((p) => ({ id: p._id, etiqueta: etiqueta(p) }))));
      default: return this.operarios.getOperarios().pipe(map((r) => r.data.map((p) => ({ id: p._id, etiqueta: etiqueta(p) }))));
    }
  }
}
