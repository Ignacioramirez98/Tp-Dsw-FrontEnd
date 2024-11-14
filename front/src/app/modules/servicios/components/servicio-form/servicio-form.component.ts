import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosService } from '../../servicio.service.js';
import { Servicio } from '../../../../shared/models/servicio.model.js';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  styleUrls: ['./servicio-form.component.css'],
  standalone:false
})
export class ServicioFormComponent implements OnInit {
  ServicioForm!: FormGroup;
  isEditMode: boolean = false;
  servicioId: string | null = null;

  constructor(
    private servicioservice: ServiciosService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.ServicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      importe_compra: [0, Validators.required],
      importe_venta: [0, Validators.required],
      stock: [0, Validators.required],
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
      console.log('servicio cargado:', servicio);
      this.ServicioForm.patchValue({
        nombre: servicio.descripcion,
        importe_por_hora: servicio.importe_por_hora,
      });
    },
    (error) => {
      console.error('Error al cargar servicio:', error);
      this.router.navigate(['/servicios']);
    }
  );
}



onSubmit(): void {
  if (this.ServicioForm.invalid) {
    return;
  }

  const servicio = { ...this.ServicioForm.value, _id: this.servicioId }; // Aseguramos que tenga el ID

  if (this.isEditMode) {
    this.servicioservice.updateServicio(servicio).subscribe(
      () => {
        console.log('servicio actualizado');
        this.router.navigate(['/servicios']);
      },
      (error) => {
        console.error('Error al actualizar servicio:', error);
      }
    );
  } else {
    this.servicioservice.addServicio(servicio).subscribe(
      () => {
        console.log('servicio creado');
        this.router.navigate(['/servicios']);
      },
      (error) => {
        console.error('Error al crear servicio:', error);
      }
    );
  }
}



  onCancel(): void {
    this.router.navigate(['/servicios']);
  }
}
