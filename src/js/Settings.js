class Settings {
  constructor() {
    this.showNumber = true;
    this.boardSize = 4;
    this.durationMove = 500;

    this.generateSolveSequence();
    this.getRandomImage();
  }

  generateSolveSequence() {
    let totalTiles = this.boardSize * this.boardSize;
    this.solve = [];

    for (let i = 1; i < totalTiles; i++) {
      this.solve.push(i);
    }
    this.solve.push(0);
  }

  getRandomImage() {
    this.bgImageUrl = `url(/assets/${Math.floor(Math.random() * 10 + 1)}.jpg)`;
  }
}

export default new Settings();
