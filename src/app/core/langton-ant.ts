export class LangtonAnt {
  row = 0;
  col = 0;
  dir = 0;
  minRow = 0;
  maxRow = 0;
  minCol = 0;
  maxCol = 0;
  private cells = new Map<string, number>();
  private litCount = 0;

  isOn(row: number, col: number): boolean {
    return this.cells.has(`${row},${col}`);
  }

  *onCells(): IterableIterator<{ row: number; col: number; order: number }> {
    for (const [key, order] of this.cells) {
      const [row, col] = key.split(',').map(Number);
      yield { row, col, order };
    }
  }

  reset(): void {
    this.cells = new Map();
    this.litCount = 0;
    this.row = 0;
    this.col = 0;
    this.dir = 0;
    this.minRow = 0;
    this.maxRow = 0;
    this.minCol = 0;
    this.maxCol = 0;
  }

  step(): void {
    const key = `${this.row},${this.col}`;
    const wasOn = this.cells.has(key);
    if (wasOn) {
      this.cells.delete(key);
    } else {
      this.cells.set(key, this.litCount);
      this.litCount += 1;
    }
    this.dir = (this.dir + (wasOn ? 3 : 1)) % 4;

    switch (this.dir) {
      case 0:
        this.row -= 1;
        break;
      case 1:
        this.col += 1;
        break;
      case 2:
        this.row += 1;
        break;
      case 3:
        this.col -= 1;
        break;
    }

    this.minRow = Math.min(this.minRow, this.row);
    this.maxRow = Math.max(this.maxRow, this.row);
    this.minCol = Math.min(this.minCol, this.col);
    this.maxCol = Math.max(this.maxCol, this.col);
  }
}
