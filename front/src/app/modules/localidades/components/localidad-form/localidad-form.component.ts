import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalidadesService } from '../../localidad.service';
import { Localidad } from '../../../../shared/models/localidad.model';

@Component({
  selector: 'app-localidad-form',
  templateUrl: './localidad-form.component.html',
  standalone: false
})
export class LocalidadFormComponent implements OnInit {
  localidadForm!: FormGroup;
  isEditMode: boolean = false;
  localidadId: string | null = null;

  constructor(
    private localidadService: LocalidadesService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.localidadForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo_postal: ['', Validators.required],
    });

    this.localidadId = this.route.snapshot.paramMap.get('id');
    if (this.localidadId) {
      this.isEditMode = true;
      this.loadLocalidad();
    }
  }

  loadLocalidad(): void {
    this.localidadService.getLocalidad(this.localidadId!).subscribe(
      (response: { data: Localidad }) => {
        const localidad = response.data;
        this.localidadForm.patchValue({
          nombre: localidad.nombre,
          codigo_postal: localidad.codigo_postal,
        });
      },
      () => {
        this.router.navigate(['/localidades']);
      }
    );
  }

  guardar(): void {
    if (this.localidadForm.invalid) {
      this.localidadForm.markAllAsTouched();
      return;
    }

    const localidad = { ...this.localidadForm.value, _id: this.localidadId } as Localidad;

    if (this.isEditMode) {
      this.localidadService.updateLocalidad(localidad).subscribe(
        () => this.router.navigate(['/localidades']),
        () => alert('Hubo un error al actualizar la localidad.')
      );
    } else {
      this.localidadService.addLocalidad(localidad).subscribe(
        () => this.router.navigate(['/localidades']),
        () => alert('Hubo un error al crear la localidad.')
      );
    }
  }

  onSubmit(): void {
    this.guardar();
  }

  onCancel(): void {
    this.router.navigate(['/localidades']);
  }
}
