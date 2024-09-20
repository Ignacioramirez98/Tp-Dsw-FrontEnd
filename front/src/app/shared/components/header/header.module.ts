// src/app/shared/components/header/header.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [
    HeaderComponent // Declara el HeaderComponent aquí
  ],
  imports: [
    CommonModule // Importa CommonModule si el componente usa directivas comunes de Angular
  ],
  exports: [
    HeaderComponent // Exporta el HeaderComponent para que esté disponible en otros módulos
  ]
})
export class HeaderModule { }
