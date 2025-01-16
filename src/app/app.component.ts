import { Component } from '@angular/core';
import { MicrowaveComponent } from './microwave/microwave.component';

@Component({
  selector: 'app-root',
  template: '<app-microwave></app-microwave>',
  standalone: true,
  imports: [MicrowaveComponent],
})
export class AppComponent {}
