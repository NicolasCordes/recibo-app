import { Component, signal } from '@angular/core';
import { Recibo } from "./recibo/recibo";

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [Recibo],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('recibo-app');
}
