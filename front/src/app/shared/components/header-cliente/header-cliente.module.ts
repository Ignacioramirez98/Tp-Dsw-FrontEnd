// src/app/shared/components/header/header.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderClienteComponent } from './header-cliente.component.js';

@NgModule({
  declarations: [
    HeaderClienteComponent // Declara el HeaderComponent aquí
  ],
  imports: [
    CommonModule // Importa CommonModule si el componente usa directivas comunes de Angular
  ],
  exports: [
    HeaderClienteComponent // Exporta el HeaderComponent para que esté disponible en otros módulos
  ]
})
export class HeaderClienteModule { }
