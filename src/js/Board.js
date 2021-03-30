import Settings from './Settings';

class Board {
  constructor(sequence) {
    this.createBoard(sequence);
  }

  createBoard(sequence) {
    let board = document.createElement('div');
    board.classList.add('game-board');
    board.classList.add('game-board_gap');
    board.style.gridTemplateColumns = `repeat(${Settings.boardSize}, 1fr)`;

    for (let i = 0; i < sequence.length; i++) {
      let tile = document.createElement('div');
      tile.dataset.value = sequence[i];
      tile.dataset.index = i;
      tile.classList.add('tile');
      tile.classList.add('tile_shadow');
      tile.style.gridColumn = (i % Settings.boardSize) + 1;
      tile.style.gridRow = Math.trunc(i / Settings.boardSize + 1);
      tile.style.backgroundImage = Settings.bgImageUrl;

      tile.style.backgroundSize = 100 * Settings.boardSize + '%';
      tile.style.backgroundPositionX =
        ((sequence[i] - 1) % Settings.boardSize) *
          (100 / (Settings.boardSize - 1)) +
        '%';
      tile.style.backgroundPositionY =
        Math.floor((sequence[i] - 1) / Settings.boardSize) *
          (100 / (Settings.boardSize - 1)) +
        '%';

      if (sequence[i] !== 0) {
        let number = document.createElement('div');
        number.classList.add('tile__number');
        number.textContent = sequence[i];
        tile.appendChild(number);
      } else {
        tile.classList.add('tile_hidden');
      }

      board.appendChild(tile);
    }
    document.querySelector('.score-panel').after(board);
  }
}

export default Board;
