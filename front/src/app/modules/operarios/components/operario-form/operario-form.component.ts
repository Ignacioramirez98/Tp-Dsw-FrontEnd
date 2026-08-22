import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperariosService } from '../../operario.service';
import { Operario } from '../../../../shared/models/operario.model';

@Component({
  selector: 'app-operario-form',
  templateUrl: './operario-form.component.html',
  standalone: false
})
export class OperarioFormComponent implements OnInit {
  operarioForm!: FormGroup;
  isEditMode: boolean = false;
  operarioId: string | null = null;

  constructor(
    private operarioService: OperariosService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.operarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
    });

    this.operarioId = this.route.snapshot.paramMap.get('id');
    if (this.operarioId) {
      this.isEditMode = true;
      this.loadOperario();
    }
  }

  loadOperario(): void {
    this.operarioService.getOperario(this.operarioId!).subscribe(
      (response: { data: Operario }) => {
        const operario = response.data;
        this.operarioForm.patchValue({
          nombre: operario.nombre,
          apellido: operario.apellido,
          dni: operario.dni,
          mail: operario.mail,
          telefono: operario.telefono,
        });
      },
      () => {
        this.router.navigate(['/operarios']);
      }
    );
  }

  guardar(): void {
    if (this.operarioForm.invalid) {
      this.operarioForm.markAllAsTouched();
      return;
    }

    const operario = { ...this.operarioForm.value, _id: this.operarioId } as Operario;

    if (this.isEditMode) {
      this.operarioService.updateOperario(operario).subscribe(
        () => this.router.navigate(['/operarios']),
        () => alert('Hubo un error al actualizar el operario.')
      );
    } else {
      this.operarioService.addOperario(operario).subscribe(
        () => this.router.navigate(['/operarios']),
        () => alert('Hubo un error al crear el operario.')
      );
    }
  }

  onSubmit(): void {
    this.guardar();
  }

  onCancel(): void {
    this.router.navigate(['/operarios']);
  }
}
