// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes.js';  // Verifica que las rutas sean correctas
import { authInterceptor } from './shared/services/auth.interceptor.js';
import { idInterceptor } from './shared/services/id.interceptor';

// Formato argentino para importes y fechas ($ 45.000.000, 31/10/2026)
registerLocaleData(localeEsAr, 'es-AR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, idInterceptor]))
  ]
};
