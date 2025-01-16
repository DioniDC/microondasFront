import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';

export default async function () {
  await bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(withFetch()), // Configura o HttpClient para SSR
    ],
  });
}
