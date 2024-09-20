import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output  } from '@angular/core';
import { Producto } from '../../shared/models/producto.model';
import { ProductoService } from '../../shared/services/producto.service.js';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent {
  @Input({required: true}) producto!: Producto;

  @Output() addToCart = new EventEmitter();

  private productoService = inject(ProductoService);

  addToCartHandler() {
    this.addToCart.emit(this.producto);
  }
}