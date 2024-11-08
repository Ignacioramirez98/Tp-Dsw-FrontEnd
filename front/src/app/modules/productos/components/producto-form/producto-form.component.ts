import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from '../../producto.service.js';
import { Producto } from '../../../../shared/models/producto.model.js';

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

  constructor(
    private productoService: ProductosService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
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
    (response: any) => {
      const producto = response.data as Producto; // Asegúrate de que 'data' es el producto
      console.log('Producto cargado:', producto);
      this.productoForm.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        importe_compra: producto.importe_compra,
        importe_venta: producto.importe_venta,
        stock: producto.stock,
      });
    },
    (error) => {
      console.error('Error al cargar producto:', error);
      this.router.navigate(['/productos']);
    }
  );
}



onSubmit(): void {
  if (this.productoForm.invalid) {
    return;
  }

  const producto = { ...this.productoForm.value, _id: this.productoId }; // Aseguramos que tenga el ID

  if (this.isEditMode) {
    this.productoService.updateProducto(producto).subscribe(
      () => {
        console.log('Producto actualizado');
        this.router.navigate(['/productos']);
      },
      (error) => {
        console.error('Error al actualizar producto:', error);
      }
    );
  } else {
    this.productoService.addProducto(producto).subscribe(
      () => {
        console.log('Producto creado');
        this.router.navigate(['/productos']);
      },
      (error) => {
        console.error('Error al crear producto:', error);
      }
    );
  }
}



  onCancel(): void {
    this.router.navigate(['/productos']);
  }
}
