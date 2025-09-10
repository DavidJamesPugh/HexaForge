import globalUiBus from "../base/GlobalUiBus.js";
import gameUiBus from "../base/GameUiBus.js";
import GameContext from "../base/GameContext.js";

class GameUi {
    constructor(){
        this.globalUiEm = GameContext.globalUiBus; // singleton
        this.gameUiEm = GameContext.gameUiBus;     // per game
    }

}

export default GameUi;