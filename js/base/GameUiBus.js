import EventManager from "./EventManager.js";
import GameUiEvent from "../config/event/GameUiEvent.js";

const gameUiBus = new EventManager(GameUiEvent, "GameUiBus");

export default gameUiBus;