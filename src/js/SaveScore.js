class SaveScore {
  constructor() {}

  save(boardSize, userData) {
    let storage = localStorage.getItem(boardSize);

    if (storage === null) {
      localStorage.setItem(boardSize, JSON.stringify([userData]));
    } else {
      let data = JSON.parse(storage);
      data = [...data, userData];

      data.sort((a, b) => {
        let res = a.moves - b.moves;

        if (res === 0) {
          let aTime =
            parseInt(a.time.slice(0, 2)) * 10000 + parseInt(a.time.slice(5));
          let bTime =
            parseInt(b.time.slice(0, 2)) * 10000 + parseInt(b.time.slice(5));
          return aTime - bTime;
        } else {
          return res;
        }
      });

      data = data.slice(0, 10);
      localStorage.setItem(boardSize, JSON.stringify(data));
    }
  }

  load(boardSize) {
    let storage = localStorage.getItem(boardSize);

    if (storage === null) {
      return [];
    } else {
      return JSON.parse(storage);
    }
  }
}

export default new SaveScore();
