import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';

registerLocaleData(localeId, 'id-ID');

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding()), provideAnimations()],
}).catch((error) => console.error(error));
