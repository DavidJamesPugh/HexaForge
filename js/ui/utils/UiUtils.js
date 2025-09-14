export default class UiUtils {
    /**
     * Center an element in the viewport.
     * @param {JQuery} $el jQuery element
     * @param {Object} options { vertical: boolean, horizontal: boolean }
     */
    static centerElement($el, options = { vertical: true, horizontal: true }) {
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        if (options.horizontal) {
            $el.style.left = `${Math.round((winW - $el.offsetWidth) / 2)}px`;
        }
        if (options.vertical) {
            $el.style.top = `${Math.round((winH - $el.offsetHeight) / 2)}px`;
        }
    }
}
