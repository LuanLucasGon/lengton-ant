import { Component, inject } from '@angular/core';
import { SimulationService } from '../simulation.service';

@Component({
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly simulation = inject(SimulationService);
}
