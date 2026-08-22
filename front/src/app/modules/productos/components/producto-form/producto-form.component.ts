import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from '../../producto.service.js';
import { Producto } from '../../../../shared/models/producto.model.js';
import { AuthService } from '../../../../shared/services/auth.service.js';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css'],
  standalone:false
})
export class ProductoFormComponent implements OnInit {
  productoForm!: FormGroup;
  isEditMode: boolean = false;
  productoId: string | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  imageError: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;

  constructor(
    private productoService: ProductosService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      importe_compra: [0, Validators.required],
      importe_venta: [0, Validators.required],
      stock: [0, Validators.required],
    });

    // Cargar producto si está en modo edición
    this.productoId = this.route.snapshot.paramMap.get('id');
    if (this.productoId) {
      this.isEditMode = true;
      this.loadProduct();
    }
  }

loadProduct(): void {
  this.productoService.getProducto(this.productoId!).subscribe(
    (producto: Producto) => {
      this.productoForm.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        importe_compra: producto.importe_compra,
        importe_venta: producto.importe_venta,
        stock: producto.stock,
      });
      this.imagePreview = producto.imagenUrl ? `http://localhost:3000${producto.imagenUrl}` : null;
    },
    (error) => {
      this.errorMessage = error.error?.message || 'No se pudo cargar el producto.';
    }
  );
}

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files.length > 0 ? input.files[0] : null;

  this.imageError = '';
  this.selectedImage = null;
  this.imagePreview = null;

  if (!file) {
    return;
  }

  if (!this.allowedImageTypes.includes(file.type)) {
    this.imageError = 'Formato invalido. Solo se permite JPEG, PNG, WEBP o GIF.';
    return;
  }

  if (file.size > this.maxImageSizeBytes) {
    this.imageError = 'La imagen supera el maximo permitido de 5MB.';
    return;
  }

  this.selectedImage = file;
  this.imagePreview = URL.createObjectURL(file);
}

crear(): void {
  if (this.productoForm.invalid || this.isSubmitting) {
    return;
  }

  this.errorMessage = '';

  if (!this.isEditMode && !this.selectedImage) {
    this.imageError = 'Debes seleccionar una imagen para crear el producto.';
    return;
  }

  if (this.isEditMode) {
    const formData = this.buildFormData();
    this.isSubmitting = true;
    this.productoService.updateProducto(this.productoId!, formData).subscribe(
      (productoActualizado) => {
        if (productoActualizado.imagenUrl) {
          this.imagePreview = `http://localhost:3000${productoActualizado.imagenUrl}`;
        }
        this.router.navigate(['/productos']);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'No se pudo actualizar el producto.';
      }
    );
  } else {
    const token = this.authService.getToken();
    if (!token || !this.selectedImage) {
      this.imageError = 'No hay sesion valida o imagen seleccionada.';
      return;
    }

    const formData = new FormData();
    this.appendProductFields(formData);
    formData.append('imagen', this.selectedImage);

    this.isSubmitting = true;
    this.productoService.crearProductoConImagen(formData, token).subscribe(
      () => {
        this.router.navigate(['/productos']);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'No se pudo crear el producto.';
      }
    );
  }
}

private buildFormData(): FormData {
  const formData = new FormData();
  this.appendProductFields(formData);

  if (this.selectedImage) {
    formData.append('imagen', this.selectedImage);
  }

  return formData;
}

private appendProductFields(formData: FormData): void {
  formData.append('nombre', this.productoForm.value.nombre);
  formData.append('descripcion', this.productoForm.value.descripcion);
  formData.append('importe_compra', String(this.productoForm.value.importe_compra));
  formData.append('importe_venta', String(this.productoForm.value.importe_venta));
  formData.append('stock', String(this.productoForm.value.stock));
}

onSubmit(): void {
  this.crear();
}



  onCancel(): void {
    this.router.navigate(['/productos']);
  }
}
