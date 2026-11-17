import { Component } from '@angular/core';
import { Controls } from './controls/controls';
import { Header } from './header/header';
import { SimulationCanvas } from './simulation-canvas/simulation-canvas';

@Component({
  selector: 'app-root',
  imports: [Header, SimulationCanvas, Controls],
  templateUrl: './app.html',
})
export class App {}
