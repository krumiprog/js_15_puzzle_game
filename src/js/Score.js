class Score {
  constructor() {
    this.time = 0;
    this.moves = 0;
    this.showTime = document.querySelector('.timer');
    this.showMoves = document.querySelector('.moves');

    this.updateTime();
    this.updateMoves();
  }

  startTimer() {
    this.timeId = setInterval(() => {
      this.time++;
      this.updateTime();
    }, 1000);
  }

  setMoves() {
    this.moves++;
    this.updateMoves();
  }

  pauseTimer() {
    clearInterval(this.timeId);
  }

  resetTimer() {
    clearInterval(this.timeId);
    this.time = 0;
    this.updateTime();
  }

  resetMoves() {
    this.moves = 0;
    this.updateMoves();
  }

  updateTime() {
    let minutes = Math.trunc(this.time / 60);
    let seconds = this.time % 60;
    this.resTime = `${minutes < 10 ? '0' + minutes : minutes} : ${
      seconds < 10 ? '0' + seconds : seconds
    }`;
    this.showTime.innerHTML = this.resTime;
  }

  updateMoves() {
    this.showMoves.innerHTML = this.moves;
  }
}

export default Score;
