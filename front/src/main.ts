import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Asegúrate de que appConfig esté bien definido

// Usa bootstrapApplication para inicializar la aplicación.
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Error durante el arranque de la aplicación', err));
