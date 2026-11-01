import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductosService } from '../../producto.service';
import { Producto } from '../../../../shared/models/producto.model';
import { FormularioBase } from '../../../../shared/ui/formulario-base';
import { Validadores } from '../../../../shared/utils/validadores';
import { urlImagen } from '../../../../shared/utils/imagen';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  standalone: false,
})
export class ProductoFormComponent extends FormularioBase<Producto> {
  private readonly fb = inject(FormBuilder);
  private readonly productos = inject(ProductosService);

  protected readonly recurso = 'producto';
  readonly rutaListado = '/productos';
  protected override readonly mensajes = {
    importe_venta: { min: 'El precio de venta tiene que ser mayor a $ 0.' },
    stock: { pattern: 'El stock tiene que ser un número entero.' },
  };

  imagen: File | null = null;
  imagenActual: string | null = null;

  protected crearFormulario() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      importe_compra: [null as number | null, [Validators.required, Validators.min(0)]],
      importe_venta: [null as number | null, [Validators.required, Validators.min(0.01)]],
      stock: [0 as number | null, [Validators.required, Validators.min(0), Validadores.entero]],
    });
  }

  protected override cargarEnFormulario(producto: Producto): void {
    super.cargarEnFormulario(producto);
    this.imagenActual = urlImagen(producto.imagenUrl);
  }

  /** Se envía como multipart para poder adjuntar la imagen. */
  protected override valorParaEnviar() {
    const datos = new FormData();
    for (const [clave, valor] of Object.entries(this.form.getRawValue())) {
      datos.append(clave, String(valor ?? ''));
    }
    if (this.imagen) datos.append('imagen', this.imagen);
    return datos as unknown as Record<string, unknown>;
  }

  protected obtener$(id: string) {
    return this.productos.getProducto(id);
  }

  protected crear$(datos: FormData) {
    return this.productos.crearProducto(datos);
  }

  protected actualizar$(id: string, datos: FormData) {
    return this.productos.updateProducto(id, datos);
  }
}
