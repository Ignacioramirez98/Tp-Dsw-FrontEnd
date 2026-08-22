import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../../servicio.service.js';
import { Servicio } from '../../../../shared/models/servicio.model.js';
import { AuthService } from '../../../../shared/services/auth.service.js';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  standalone:false
})
export class ServicioFormComponent implements OnInit {
  ServicioForm!: FormGroup;
  isEditMode: boolean = false;
  servicioId: string | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  imageError: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxImageSizeBytes = 5 * 1024 * 1024;

  constructor(
    private servicioservice: ServiciosService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.ServicioForm = this.fb.group({
      descripcion: ['', Validators.required],
      importe_por_hora: [0, Validators.required],
    });

    // Cargar servicio si está en modo edición
    this.servicioId = this.route.snapshot.paramMap.get('id');
    if (this.servicioId) {
      this.isEditMode = true;
      this.loadProduct();
    }
  }

loadProduct(): void {
  this.servicioservice.getServicio(this.servicioId!).subscribe(
    (servicio: Servicio) => {
      this.ServicioForm.patchValue({
        descripcion: servicio.descripcion,
        importe_por_hora: servicio.importe_por_hora,
      });
      this.imagePreview = servicio.imagenUrl ? `http://localhost:3000${servicio.imagenUrl}` : null;
    },
    (error) => {
      this.errorMessage = error.error?.message || 'No se pudo cargar el servicio.';
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
  if (this.ServicioForm.invalid || this.isSubmitting) {
    return;
  }

  this.errorMessage = '';

  if (this.isEditMode) {
    const formData = this.buildFormData();
    this.isSubmitting = true;
    this.servicioservice.updateServicio(this.servicioId!, formData).subscribe(
      (servicioActualizado) => {
        if (servicioActualizado.imagenUrl) {
          this.imagePreview = `http://localhost:3000${servicioActualizado.imagenUrl}`;
        }
        this.router.navigate(['/servicios']);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'No se pudo actualizar el servicio.';
      }
    );
  } else {
    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'No hay una sesion valida.';
      return;
    }

    const formData = this.buildFormData();

    this.isSubmitting = true;
    this.servicioservice.crearServicioConImagen(formData, token).subscribe(
      () => {
        this.router.navigate(['/servicios']);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'No se pudo crear el servicio.';
      }
    );
  }
}

private buildFormData(): FormData {
  const formData = new FormData();
  this.appendServicioFields(formData);

  if (this.selectedImage) {
    formData.append('imagen', this.selectedImage);
  }

  return formData;
}

private appendServicioFields(formData: FormData): void {
  formData.append('descripcion', this.ServicioForm.value.descripcion);
  formData.append('importe_por_hora', String(this.ServicioForm.value.importe_por_hora));
}

onSubmit(): void {
  this.crear();
}



  onCancel(): void {
    this.router.navigate(['/servicios']);
  }
}
