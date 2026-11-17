import { LangtonAnt } from './langton-ant';

describe('LangtonAnt', () => {
  it('starts at (0,0) facing up with nothing lit', () => {
    const ant = new LangtonAnt();

    expect(ant.row).toBe(0);
    expect(ant.col).toBe(0);
    expect(ant.dir).toBe(0);
    expect(ant.isOn(0, 0)).toBe(false);
  });

  it('turns clockwise and lights the cell when stepping on an off cell', () => {
    const ant = new LangtonAnt();
    const startRow = ant.row;
    const startCol = ant.col;
    const startDir = ant.dir;

    ant.step();

    expect(ant.isOn(startRow, startCol)).toBe(true);
    expect(ant.dir).toBe((startDir + 1) % 4);
  });

  it('turns counter-clockwise and erases the cell when stepping on an on cell', () => {
    const ant = new LangtonAnt();
    const startRow = ant.row;
    const startCol = ant.col;
    ant.step();
    const dirAfterFirstStep = ant.dir;

    ant.row = startRow;
    ant.col = startCol;
    ant.step();

    expect(ant.isOn(startRow, startCol)).toBe(false);
    expect(ant.dir).toBe((dirAfterFirstStep + 3) % 4);
  });

  it('moves one cell forward in the new direction after stepping', () => {
    const ant = new LangtonAnt();

    ant.step();

    expect(ant.row).toBe(0);
    expect(ant.col).toBe(1);
  });

  it('expands its bounds as it moves past them, without wrapping', () => {
    const ant = new LangtonAnt();
    ant.dir = 3;

    ant.step();

    expect(ant.row).toBe(-1);
    expect(ant.minRow).toBe(-1);
    expect(ant.maxRow).toBe(0);
    expect(ant.minCol).toBe(0);
    expect(ant.maxCol).toBe(0);
  });

  it('clears the grid and puts the ant back at (0,0) facing up on reset', () => {
    const ant = new LangtonAnt();
    ant.step();
    ant.step();

    ant.reset();

    expect(ant.row).toBe(0);
    expect(ant.col).toBe(0);
    expect(ant.dir).toBe(0);
    expect(ant.minRow).toBe(0);
    expect(ant.maxRow).toBe(0);
    expect(ant.minCol).toBe(0);
    expect(ant.maxCol).toBe(0);
    expect(ant.isOn(0, 0)).toBe(false);
  });

  it('lists every lit cell with the order it was lit in, for redrawing', () => {
    const ant = new LangtonAnt();
    ant.step();

    const lit = [...ant.onCells()];

    expect(lit).toEqual([{ row: 0, col: 0, order: 0 }]);
  });

  it('assigns each newly lit cell the next order, increasing over time', () => {
    const ant = new LangtonAnt();
    ant.step();
    ant.row = 5;
    ant.col = 5;
    ant.step();

    const lit = [...ant.onCells()];

    expect(lit).toEqual(
      expect.arrayContaining([
        { row: 0, col: 0, order: 0 },
        { row: 5, col: 5, order: 1 },
      ]),
    );
  });

  it('assigns a fresh order when a cell is erased and lit again later', () => {
    const ant = new LangtonAnt();
    const startRow = ant.row;
    const startCol = ant.col;
    ant.step();
    ant.row = startRow;
    ant.col = startCol;
    ant.step();
    ant.row = startRow;
    ant.col = startCol;

    ant.step();

    expect(ant.isOn(startRow, startCol)).toBe(true);
    const relit = [...ant.onCells()].find((c) => c.row === startRow && c.col === startCol);
    expect(relit?.order).toBe(1);
  });
});
