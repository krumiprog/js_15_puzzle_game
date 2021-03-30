import Settings from './Settings';
import Board from './Board';
import Score from './Score';
import SaveScore from './SaveScore';

class GameManager {
  constructor() {
    this.createScorePanel();
    this.initGame();
    this.setGameListeners();
    this.showSystemPanel();
  }

  createScorePanel() {
    let panel = document.createElement('div');
    panel.className = 'score-panel';
    panel.innerHTML = `
      <div>Time: <span class="timer"></span></div>
      <div>Moves: <span class="moves"></span></div>
    `;
    document.body.appendChild(panel);
  }

  initGame() {
    this.generateStartSequence();

    if (this.board) {
      this.board.remove();
    }

    this.screenBoard = new Board(this.sequence);

    if (!Settings.showNumber) {
      this.hideTileNumbers();
    }

    this.score = new Score();
    this.score.startTimer();

    this.board = document.querySelector('.game-board');
    this.tiles = document.querySelectorAll('.tile');
    this.emptyTile = document.querySelector('.tile[data-value="0"]');

    this.targetTile = null;
    this.cloneTile = null;
    this.canMove = true;
    this.endGame = false;
  }

  generateStartSequence() {
    this.sequence = [...Settings.solve];

    do {
      for (let i = this.sequence.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [this.sequence[i], this.sequence[j]] = [
          this.sequence[j],
          this.sequence[i],
        ];
      }
    } while (!this.canSolve());
  }

  canSolve() {
    let inversion = 0;

    for (let i = 0; i < this.sequence.length; i++) {
      if (this.sequence[i] != 0) {
        for (let j = 0; j < i; j++) {
          if (this.sequence[j] > this.sequence[i]) inversion++;
        }
      } else {
        inversion += 1 + i / Settings.boardSize;
      }
    }

    if (Settings.boardSize % 2 === 0) {
      return inversion % 2 === 0 ? true : false; // for even boardSize
    } else {
      return inversion % 2 === 0 ? false : true; // for odd boardSize
    }
  }

  checkSolve() {
    if (JSON.stringify(this.sequence) === JSON.stringify(Settings.solve)) {
      this.endGame = true;
      this.score.pauseTimer();

      setTimeout(() => {
        this.emptyTile.classList.toggle('tile_hidden');
        this.hideTileNumbers();

        setTimeout(() => {
          this.tiles.forEach(tile => tile.classList.toggle('tile_shadow'));
          this.board.classList.toggle('game-board_gap');

          setTimeout(() => {
            this.board.style.backgroundImage = Settings.bgImageUrl;

            this.board.style.backgroundSize = '100%';
            this.tiles.forEach(tile => tile.classList.toggle('tile_hidden'));
          }, Settings.durationMove);
        }, Settings.durationMove);
      }, Settings.durationMove);

      setTimeout(() => {
        this.showWinScreen();
      }, Settings.durationMove * 6);
    }
  }

  setGameListeners() {
    this.currentDroppable = null;

    window.addEventListener('click', e => {
      if (this.endGame) {
        return;
      }

      if (!this.canMove) {
        return;
      }
      this.targetTile = e.target.closest('.tile');

      if (!this.targetTile) {
        return;
      }
      let direction = this.determineDirectionMove();

      if (direction) {
        this.canMove = false;
        this.moveTile(direction);
        this.score.setMoves();
      }
    });
  }

  determineDirectionMove() {
    let emptyTileRow = Math.trunc(
      this.emptyTile.dataset.index / Settings.boardSize
    );
    let emptyTileColumn = this.emptyTile.dataset.index % Settings.boardSize;
    let targetTileRow = Math.trunc(
      this.targetTile.dataset.index / Settings.boardSize
    );
    let targetTileColumn = this.targetTile.dataset.index % Settings.boardSize;

    if (
      targetTileRow - 1 === emptyTileRow &&
      targetTileColumn === emptyTileColumn
    ) {
      return 'up';
    } else if (
      targetTileColumn + 1 == emptyTileColumn &&
      targetTileRow == emptyTileRow
    ) {
      return 'right';
    } else if (
      targetTileRow + 1 == emptyTileRow &&
      targetTileColumn == emptyTileColumn
    ) {
      return 'down';
    } else if (
      targetTileColumn - 1 == emptyTileColumn &&
      targetTileRow == emptyTileRow
    ) {
      return 'left';
    } else {
      return null;
    }
  }

  moveTile(direction) {
    this.cloneTile = this.targetTile.cloneNode(true);
    this.cloneTile.style.position = 'absolute';
    this.cloneTile.style.width = this.targetTile.offsetWidth + 'px';
    this.cloneTile.style.height = this.targetTile.offsetHeight + 'px';
    this.targetTile.style.display = 'none';
    this.board.appendChild(this.cloneTile);

    let boardGap = parseInt(window.getComputedStyle(this.board).gap);

    switch (direction) {
      case 'up':
        this.cloneTile.style.transform = `translateY(${-(
          this.cloneTile.offsetHeight + boardGap
        )}px)`;
        break;
      case 'right':
        this.cloneTile.style.transform = `translateX(${
          this.cloneTile.offsetHeight + boardGap
        }px)`;
        break;
      case 'down':
        this.cloneTile.style.transform = `translateY(${
          this.cloneTile.offsetHeight + boardGap
        }px)`;
        break;
      case 'left':
        this.cloneTile.style.transform = `translateX(${-(
          this.cloneTile.offsetHeight + boardGap
        )}px)`;
        break;
    }

    setTimeout(() => this.swapTiles(), Settings.durationMove);
    this.updateSequence();
    this.checkSolve();
  }

  swapTiles() {
    [
      this.targetTile.style.gridRow,
      this.targetTile.style.gridColumn,
      this.emptyTile.style.gridRow,
      this.emptyTile.style.gridColumn,
    ] = [
      this.emptyTile.style.gridRow,
      this.emptyTile.style.gridColumn,
      this.targetTile.style.gridRow,
      this.targetTile.style.gridColumn,
    ];
    [this.targetTile.dataset.index, this.emptyTile.dataset.index] = [
      this.emptyTile.dataset.index,
      this.targetTile.dataset.index,
    ];
    this.targetTile.style.display = '';
    this.cloneTile.remove();
    this.canMove = true;
  }

  updateSequence() {
    let emptyIndex = this.emptyTile.dataset.index;
    let targetIndex = this.targetTile.dataset.index;
    [this.sequence[emptyIndex], this.sequence[targetIndex]] = [
      this.sequence[targetIndex],
      this.sequence[emptyIndex],
    ];
  }

  showSystemPanel() {
    let systemPanel = document.createElement('div');
    systemPanel.className = 'system-panel';

    let shuffleBtn = document.createElement('button');
    shuffleBtn.innerText = 'shuffle';
    shuffleBtn.addEventListener('click', () => {
      this.score.resetTimer();
      this.initGame();
    });
    systemPanel.appendChild(shuffleBtn);

    let menuBtn = document.createElement('button');
    menuBtn.innerText = 'menu';
    menuBtn.addEventListener('click', () => {
      this.score.pauseTimer();
      this.showMenu();
    });
    systemPanel.appendChild(menuBtn);
    document.body.appendChild(systemPanel);
  }

  hideTileNumbers() {
    document
      .querySelectorAll('.tile__number')
      .forEach(number => (number.style.display = 'none'));
  }

  showTileNumbers() {
    document
      .querySelectorAll('.tile__number')
      .forEach(number => (number.style.display = ''));
  }

  showMenu() {
    this.menu = document.createElement('div');
    this.menu.className = 'menu';
    let menuContent = `
      <div class="menu__wrapper">
        <div class="menu__title">Menu</div>
        <button class="menu__btn btn_new-game">New game</button>
        <div class="menu__options">
          <button class="menu__btn btn_options">Options</button>
          <div class="options">
            <div class="options__item">
              <div class="menu__subtitle">Board size (new game)</div>
              <select class="options__board-size">
                <option value="3">3 x 3</option>
                <option value="4">4 x 4</option>
                <option value="5">5 x 5</option>
                <option value="6">6 x 6</option>
                <option value="7">7 x 7</option>
                <option value="8">8 x 8</option>
              </select>
            </div>
            <div class="options__item">
              <div class="menu__subtitle">Show numbers</div>
              <button class="btn_show-numbers btn_item">OFF</button>
            </div>
          </div>
        </div>
        <button class="menu__btn btn_scores">Best scores</button>
        <button class="menu__btn btn_back">Go back</button>
      </div>
    `;
    this.menu.innerHTML = menuContent;
    document.body.appendChild(this.menu);

    let boardSize = document.querySelector('.options__board-size');
    boardSize.value = Settings.boardSize;

    let newGameBtn = document.querySelector('.btn_new-game');
    newGameBtn.addEventListener('click', () => {
      Settings.boardSize = parseInt(boardSize.value);
      Settings.generateSolveSequence();
      Settings.getRandomImage();
      this.initGame();
      this.menu.remove();
    });

    let options = document.querySelector('.menu__options');
    let optionsBtn = document.querySelector('.btn_options');
    optionsBtn.addEventListener('click', () => {
      options.classList.toggle('menu__options_show');
    });

    let showNumbersBtn = document.querySelector('.btn_show-numbers');
    showNumbersBtn.innerText = Settings.showNumber ? 'ON' : 'OFF';
    showNumbersBtn.addEventListener('click', () => {
      if (showNumbersBtn.innerText === 'OFF') {
        showNumbersBtn.innerText = 'ON';
        Settings.showNumber = true;
        this.showTileNumbers();
      } else {
        showNumbersBtn.innerText = 'OFF';
        Settings.showNumber = false;
        this.hideTileNumbers();
      }
    });

    let scoresBtn = document.querySelector('.btn_scores');
    scoresBtn.addEventListener('click', () => {
      this.menu.style.display = 'none';
      this.showScoreTable();
    });

    let goBackBtn = document.querySelector('.btn_back');
    goBackBtn.addEventListener('click', () => {
      this.menu.remove();
      this.score.startTimer();
    });
  }

  showScoreTable() {
    let scoreTable = document.createElement('div');
    scoreTable.className = 'menu';
    let scores = `
      <div class="menu__wrapper">
        <div class="menu__title">Best scores</div>
        <div class="select-board-size">
          <div class="menu__subtitle">Board size</div>
          <select class="options__board-size score_board-size">
            <option value="3">3 x 3</option>
            <option value="4">4 x 4</option>
            <option value="5">5 x 5</option>
            <option value="6">6 x 6</option>
            <option value="7">7 x 7</option>
            <option value="8">8 x 8</option>
          </select>
        </div>
        <table class="score-table">
          <thead>
            <tr>
              <th>N</th>
              <th>Name</th>
              <th>Moves</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        <button class="menu__btn scores_btn_back">Go back</button>
      </div>
    `;
    scoreTable.innerHTML = scores;
    document.body.appendChild(scoreTable);

    let tableBody = document.querySelector('.score-table tbody');
    let boardSize = document.querySelector('.score_board-size');
    boardSize.value = Settings.boardSize;
    boardSize.addEventListener('change', () => {
      tableBody.innerHTML = '';
      let storeUsers = SaveScore.load(parseInt(boardSize.value));
      storeUsers.forEach((user, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${user.name}</td><td>${
          user.moves
        }</td><td>${user.time}</td>`;
        tableBody.appendChild(row);
      });
    });

    let goBackBtn = document.querySelector('.scores_btn_back');
    goBackBtn.addEventListener('click', () => {
      scoreTable.remove();
      this.menu.style.display = '';
    });

    boardSize.dispatchEvent(new Event('change'));
  }

  showWinScreen() {
    let winScreen = document.createElement('div');
    winScreen.className = 'menu';
    let screen = `
      <div class="menu__wrapper">
        <div class="menu__title">You win!</div>
        <div class="menu__subtitle">Your score</div>
        <div class="options__item">
          <div class="menu__subtitle">Time: <span class="score-time"></span></div>
          <div class="menu__subtitle">Moves: <span class="score-moves"></span></div>
        </div>
        <input type="text" class="username-input" maxlength="10" placeholder="Username">
        <button class="menu__btn btn_save">Save</button>
        <button class="menu__btn win_btn_back">Go back</button>
      </div>
    `;
    winScreen.innerHTML = screen;
    document.body.appendChild(winScreen);

    let scoreTime = document.querySelector('.score-time');
    scoreTime.innerText = this.score.resTime;
    let scoreMoves = document.querySelector('.score-moves');
    scoreMoves.innerText = this.score.moves;
    let userName = document.querySelector('.username-input');

    let saveBtn = document.querySelector('.btn_save');
    saveBtn.addEventListener('click', () => {
      let userData = {};
      if (!userName.value) {
        return;
      }
      userData.name = userName.value;
      userData.moves = this.score.moves;
      userData.time = this.score.resTime;
      SaveScore.save(Settings.boardSize, userData);
      winScreen.remove();
    });

    let goBackBtn = document.querySelector('.win_btn_back');
    goBackBtn.addEventListener('click', () => {
      winScreen.remove();
    });
  }
}

export default GameManager;
