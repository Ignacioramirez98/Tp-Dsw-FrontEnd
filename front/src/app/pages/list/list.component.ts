/*import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoComponent } from '../producto/producto.component.js';
import { HeaderComponent } from '../../shared/components/header/header.component.js';
import { Producto } from '../../shared/models/producto.model.js';
import { CartService } from '../../shared/services/cart.service.js';
import { ProductoService } from '../../shared/services/producto.service.js';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ProductoComponent, HeaderComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {

  productos = signal<Producto[]>([]);
  private cartService = inject(CartService);
  private productoService = inject(ProductoService);

  ngOnInit() {
    this.productoService.getProductos()
    .subscribe({
      next: (productos) => {
        this.productos.set(productos);
      },
      error: () => {
        
      }
    })
  }

  addToCart(product: Producto) {
    this.cartService.addToCart(product)
  }
}
*/

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoComponent } from '../producto/producto.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Producto } from '../../shared/models/producto.model';
import { CartService } from '../../shared/services/cart.service';
import { ProductoService } from '../../shared/services/producto.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ProductoComponent, HeaderComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  productos: Producto[] = [];
  private cartService = inject(CartService);
  private productoService = inject(ProductoService);

  ngOnInit() {
    this.productoService.getProductos()
      .subscribe({
        next: (productos) => {
          if (Array.isArray(productos)) {
            this.productos = productos;
          } else {
            console.error('Expected an array of products');
          }
        },
        error: (err) => {
          console.error('Error fetching products:', err);
        }
      });
  }

  addToCart(product: Producto) {
    this.cartService.addToCart(product);
  }
}