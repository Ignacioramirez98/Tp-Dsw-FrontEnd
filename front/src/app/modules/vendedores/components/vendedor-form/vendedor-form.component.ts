import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VendedoresService } from '../../vendedor.service';
import { Vendedor } from '../../../../shared/models/vendedor.model';

@Component({
  selector: 'app-vendedor-form',
  templateUrl: './vendedor-form.component.html',
  standalone: false
})
export class VendedorFormComponent implements OnInit {
  vendedorForm!: FormGroup;
  isEditMode: boolean = false;
  vendedorId: string | null = null;

  constructor(
    private vendedorService: VendedoresService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.vendedorForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      rol: ['vendedor', Validators.required],
    });

    this.vendedorId = this.route.snapshot.paramMap.get('id');
    if (this.vendedorId) {
      this.isEditMode = true;
      this.loadVendedor();
    }
  }

  loadVendedor(): void {
    this.vendedorService.getVendedor(this.vendedorId!).subscribe(
      (response: { data: Vendedor }) => {
        const vendedor = response.data;
        this.vendedorForm.patchValue({
          nombre: vendedor.nombre,
          apellido: vendedor.apellido,
          dni: vendedor.dni,
          mail: vendedor.mail,
          telefono: vendedor.telefono,
          rol: vendedor.rol,
        });
      },
      () => {
        this.router.navigate(['/vendedores']);
      }
    );
  }

  guardar(): void {
    if (this.vendedorForm.invalid) {
      this.vendedorForm.markAllAsTouched();
      return;
    }

    const vendedor = { ...this.vendedorForm.value, _id: this.vendedorId } as Vendedor;

    if (this.isEditMode) {
      this.vendedorService.updateVendedor(vendedor).subscribe(
        () => this.router.navigate(['/vendedores']),
        () => alert('Hubo un error al actualizar el vendedor.')
      );
    } else {
      this.vendedorService.addVendedor(vendedor).subscribe(
        () => this.router.navigate(['/vendedores']),
        () => alert('Hubo un error al crear el vendedor.')
      );
    }
  }

  onSubmit(): void {
    this.guardar();
  }

  onCancel(): void {
    this.router.navigate(['/vendedores']);
  }
}
