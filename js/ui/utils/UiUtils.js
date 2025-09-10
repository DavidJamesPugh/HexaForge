export default class UiUtils {
    /**
     * Center an element in the viewport.
     * @param {JQuery} $el jQuery element
     * @param {Object} options { vertical: boolean, horizontal: boolean }
     */
    static centerElement($el, options = { vertical: true, horizontal: true }) {
        const winW = $(window).width();
        const winH = $(window).height();

        if (options.horizontal) {
            $el.css("left", Math.round((winW - $el.outerWidth()) / 2));
        }
        if (options.vertical) {
            $el.css("top", Math.round((winH - $el.outerHeight()) / 2));
        }
    }
}
