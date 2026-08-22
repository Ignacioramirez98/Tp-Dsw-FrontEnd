import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientesService } from '../../cliente.service';
import { Cliente } from '../../../../shared/models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  standalone: false
})
export class ClienteFormComponent implements OnInit {
  clienteForm!: FormGroup;
  isEditMode: boolean = false;
  clienteId: string | null = null;

  constructor(
    private clienteService: ClientesService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(7)]],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.minLength(8)]],
      direccion: ['', Validators.required],
      razon_social: [''],
    });

    this.clienteId = this.route.snapshot.paramMap.get('id');
    if (this.clienteId) {
      this.isEditMode = true;
      this.loadCliente();
    }
  }

  loadCliente(): void {
    this.clienteService.getCliente(this.clienteId!).subscribe(
      (response: { data: Cliente }) => {
        const cliente = response.data;
        this.clienteForm.patchValue({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          dni: cliente.dni,
          mail: cliente.mail,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          razon_social: cliente.razon_social,
        });
      },
      () => {
        this.router.navigate(['/clientes']);
      }
    );
  }

  guardar(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const cliente = { ...this.clienteForm.value, _id: this.clienteId } as Cliente;

    if (this.isEditMode) {
      this.clienteService.updateCliente(cliente).subscribe(
        () => this.router.navigate(['/clientes']),
        () => alert('Hubo un error al actualizar el cliente.')
      );
    } else {
      this.clienteService.addCliente(cliente).subscribe(
        () => this.router.navigate(['/clientes']),
        () => alert('Hubo un error al crear el cliente.')
      );
    }
  }

  onSubmit(): void {
    this.guardar();
  }

  onCancel(): void {
    this.router.navigate(['/clientes']);
  }
}
