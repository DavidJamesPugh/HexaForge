import GameUiEvent from "../../config/event/GameUiEvent.js";

export function openDrawerAnimation(bg, panel) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel?.classList.add("drawer-open");
            bg?.classList.add("drawer-open");
        });
    });
}

/**
 * Animate drawer closed and notify GameUi to destroy the overlay (see CLOSE_GAME_DRAWER).
 */
export default function bindDrawerOverlayClose(bg, panel, gameUiEm) {
    const close = () => {
        panel?.classList.remove("drawer-open");
        bg?.classList.remove("drawer-open");
        setTimeout(() => {
            gameUiEm.invokeEvent(GameUiEvent.CLOSE_GAME_DRAWER);
        }, 300);
    };
    const closeBtn = panel?.querySelector(".closeButton");
    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            close();
        });
    }
    bg?.addEventListener("click", close);
    return close;
}
