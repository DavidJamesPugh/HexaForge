import gameUiBus from "../base/GameUiBus.js";

const GameContext = {
    play: null,
    game: null,
    gameUiBus: gameUiBus,
    reset() {
      this.play = null;
      this.game = null;
      this.gameUiBus = null;
    }
  };
  
  export default GameContext;