import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { VentasService } from '../../ventas.service';
import { ClientesService } from '../../../clientes/cliente.service';
import { ProductosService } from '../../../productos/producto.service';
import { ServiciosService } from '../../../servicios/servicio.service';
import { VendedoresService } from '../../../vendedores/vendedor.service';
import { Venta, VentaPayload } from '../../../../shared/models/venta.model';
import { Cliente } from '../../../../shared/models/cliente.model';
import { Producto } from '../../../../shared/models/producto.model';
import { Servicio } from '../../../../shared/models/servicio.model';
import { Vendedor } from '../../../../shared/models/vendedor.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { Validadores } from '../../../../shared/utils/validadores';

/**
 * Alta y edición de una venta por parte del personal. La venta queda pendiente;
 * se concreta después desde el detalle (CUU Concretar Venta).
 */
@Component({
  selector: 'app-venta-form',
  templateUrl: './venta-form.component.html',
  standalone: false,
})
export class VentaFormComponent extends FormularioBase<Venta> {
  private readonly fb = inject(FormBuilder);
  private readonly ventas = inject(VentasService);
  private readonly rol = inject(AuthService).getRol();

  protected readonly recurso = 'venta';
  protected override readonly genero = 'a';
  readonly rutaListado = '/ventas';

  clientes: Cliente[] = [];
  productos: Producto[] = [];
  servicios: Servicio[] = [];
  vendedores: Vendedor[] = [];
  readonly esAdmin = this.rol === 'admin';
  errorDetalle = '';

  constructor() {
    super();
    forkJoin({
      clientes: inject(ClientesService).getClientes().pipe(map((r) => r.data)),
      productos: inject(ProductosService).getProductos().pipe(map((r) => r.data)),
      servicios: inject(ServiciosService).getServicios().pipe(map((r) => r.data)),
      vendedores: inject(VendedoresService).getVendedores().pipe(map((r) => r.data)),
    }).subscribe({
      next: (listas) => {
        const porNombre = <T>(campo: (x: T) => string) => (a: T, b: T) => campo(a).localeCompare(campo(b));
        this.clientes = listas.clientes.sort(porNombre((c: Cliente) => `${c.apellido} ${c.nombre}`));
        this.productos = listas.productos.sort(porNombre((p: Producto) => p.nombre));
        this.servicios = listas.servicios.sort(porNombre((s: Servicio) => s.descripcion));
        this.vendedores = listas.vendedores.sort(porNombre((v: Vendedor) => `${v.apellido} ${v.nombre}`));
      },
      error: () => this.notificaciones.error('No se pudieron cargar los clientes y productos.'),
    });
  }

  get items(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  protected crearFormulario() {
    return this.fb.group({
      clienteId: ['', Validators.required],
      vendedorId: [''],
      fechaEntrega: [''],
      items: this.fb.array([this.nuevoItem()]),
      servicioIds: [[] as string[]],
    });
  }

  private nuevoItem(productoId = '', cantidad = 1): FormGroup {
    return this.fb.group({
      productoId: [productoId, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(1), Validadores.entero]],
    });
  }

  agregarItem(): void {
    this.items.push(this.nuevoItem());
    // Foco en el producto del renglón nuevo
    setTimeout(() => document.getElementById(`producto-${this.items.length - 1}`)?.focus());
  }

  quitarItem(i: number): void {
    this.items.removeAt(i);
  }

  producto(id: string): Producto | undefined {
    return this.productos.find((p) => p._id === id);
  }

  subtotal(i: number): number {
    const { productoId, cantidad } = this.items.at(i).value;
    return (this.producto(productoId)?.importe_venta ?? 0) * (Number(cantidad) || 0);
  }

  get total(): number {
    return this.items.controls.reduce((suma, _, i) => suma + this.subtotal(i), 0);
  }

  /** Aviso (no bloquea): el stock se controla al concretar. */
  sinStock(i: number): boolean {
    const { productoId, cantidad } = this.items.at(i).value;
    const p = this.producto(productoId);
    return !!p && Number(cantidad) > p.stock;
  }

  errorItem(i: number, campo: 'productoId' | 'cantidad'): string | null {
    const control = this.items.at(i).get(campo);
    if (!control?.errors || !(control.touched || control.dirty)) return null;
    return campo === 'productoId' ? 'Elegí un producto.' : 'La cantidad tiene que ser un entero mayor a 0.';
  }

  servicioElegido(id: string): boolean {
    return (this.form.value.servicioIds as string[]).includes(id);
  }

  alternarServicio(id: string, elegido: boolean): void {
    const actuales = this.form.value.servicioIds as string[];
    this.form.patchValue({ servicioIds: elegido ? [...actuales, id] : actuales.filter((s) => s !== id) });
    this.errorDetalle = '';
  }

  protected override cargarEnFormulario(venta: Venta): void {
    if (venta.estado !== 'pendiente') {
      this.notificaciones.error(`La venta está ${venta.estado}: ya no se puede editar.`);
      this.router.navigate(['/ventas', venta._id]);
      return;
    }
    this.items.clear();
    for (const item of venta.items ?? []) this.items.push(this.nuevoItem(item.producto?._id ?? '', item.cantidad));
    this.form.patchValue({
      clienteId: venta.cliente?._id ?? '',
      vendedorId: venta.vendedor?._id ?? '',
      fechaEntrega: venta.fechaEntrega ? String(venta.fechaEntrega).slice(0, 10) : '',
      servicioIds: (venta.servicios ?? []).map((s) => s._id),
    });
  }

  override guardar(): void {
    // Igual que el backend: al menos un producto o un servicio
    this.errorDetalle = this.items.length === 0 && !(this.form.value.servicioIds as string[]).length
      ? 'Agregá al menos un producto o un servicio.'
      : '';
    if (this.errorDetalle) return;
    super.guardar();
  }

  protected override valorParaEnviar(): Record<string, unknown> {
    const v = this.form.getRawValue();
    const datos: VentaPayload = {
      clienteId: v.clienteId,
      vendedorId: v.vendedorId || null,
      fechaEntrega: v.fechaEntrega || null,
      items: v.items.map((i: { productoId: string; cantidad: number }) => ({ productoId: i.productoId, cantidad: Number(i.cantidad) })),
      servicioIds: v.servicioIds,
    };
    return datos as Record<string, unknown>;
  }

  protected obtener$(id: string) {
    return this.ventas.getVenta(id).pipe(map((r) => r.data));
  }

  protected crear$(datos: VentaPayload) {
    return this.ventas.crearVenta(datos);
  }

  protected actualizar$(id: string, datos: VentaPayload) {
    return this.ventas.actualizarVenta(id, datos);
  }
}
