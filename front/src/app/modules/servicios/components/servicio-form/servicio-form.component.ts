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
    (response: any) => {
      const servicio = response.data as Servicio; // Asegúrate de que 'data' es el servicio
      this.ServicioForm.patchValue({
        descripcion: servicio.descripcion,
        importe_por_hora: servicio.importe_por_hora,
      });
      this.imagePreview = servicio.imagenUrl ? `http://localhost:3000${servicio.imagenUrl}` : null;
    },
    () => {
      this.router.navigate(['/servicios']);
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
  if (this.ServicioForm.invalid) {
    return;
  }

  const servicio = { ...this.ServicioForm.value, _id: this.servicioId }; // Aseguramos que tenga el ID

  if (this.isEditMode) {
    this.servicioservice.updateServicio(servicio).subscribe(
      () => {
        this.router.navigate(['/servicios']);
      },
      () => {}
    );
  } else {
    const token = this.authService.getToken();
    if (!token || !this.selectedImage) {
      this.imageError = 'No hay sesion valida o imagen seleccionada.';
      return;
    }

    const formData = new FormData();
    formData.append('descripcion', this.ServicioForm.value.descripcion);
    formData.append('importe_por_hora', String(this.ServicioForm.value.importe_por_hora));
    formData.append('imagen', this.selectedImage);

    this.servicioservice.crearServicioConImagen(formData, token).subscribe(
      () => {
        this.router.navigate(['/servicios']);
      },
      () => {}
    );
  }
}

onSubmit(): void {
  this.crear();
}



  onCancel(): void {
    this.router.navigate(['/servicios']);
  }
}
