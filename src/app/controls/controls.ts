import { Component, inject } from '@angular/core';
import { SimulationService } from '../simulation.service';

@Component({
  selector: 'app-controls',
  styleUrl: './controls.css',
  templateUrl: './controls.html',
})
export class Controls {
  protected readonly simulation = inject(SimulationService);
}
