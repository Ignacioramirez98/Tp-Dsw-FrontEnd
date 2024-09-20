import { Injectable, computed, signal } from '@angular/core';
import { Producto } from '../models/producto.model.js';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cart = signal<Producto[]>([]);
  total = computed(() => {
    const cart = this.cart();
    return cart.reduce((total, producto) => total + producto.importe_venta, 0);
  })

  constructor() { }

  addToCart(producto: Producto) {
    this.cart.update(state => [...state, producto]);
  }
}