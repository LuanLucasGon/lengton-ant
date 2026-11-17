import { Injectable, signal } from '@angular/core';
import { LangtonAnt } from './core/langton-ant';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  readonly ant = new LangtonAnt();
  readonly running = signal(true);
  readonly speed = signal(2);
  readonly showInfo = signal(false);
  readonly resetTick = signal(0);

  togglePlay(): void {
    this.running.set(!this.running());
  }

  toggleInfo(): void {
    this.showInfo.set(!this.showInfo());
  }

  reset(): void {
    this.ant.reset();
    this.resetTick.set(this.resetTick() + 1);
  }
}
