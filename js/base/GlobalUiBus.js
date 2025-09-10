// base/GlobalUiBus.js
import EventManager from "./EventManager.js";
import GlobalUiEvent from "../config/event/GlobalUiEvent.js";

// Create a single global instance
const globalUiBus = new EventManager(GlobalUiEvent, "GlobalMainUiBus");

export default globalUiBus;