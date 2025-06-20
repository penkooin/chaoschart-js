/**
 * <i>Chaos Chart API </i><br>
 */
const ChartConstants = {
    /**
     * CHART
     * 
     * This is representing type of CHART
     *
     * @author Kooin-Shin
     * 2020. 9. 23.
     */
    CHART: {
        AREA: 'AREA',
        BAR: 'BAR',
        BAR_RATIO: 'BAR_RATIO',
        CIRCLE: 'CIRCLE',
        LINE: 'LINE'
    },

    /**
     * GRID
     * This is representing type of grid of CHART
     *
     * @author Kooin-Shin
     * 2020. 9. 23.
     */
    GRID: {
        LINE: 'LINE',
        DOT: 'DOT'
    },

    /**
     * GRID_VISIBLE
     * This is representing visibility of grid of CHART
     *
     * @author Kooin-Shin
     * 2020. 9. 23.
     */
    GRID_VISIBLE: {
        X: 'X',
        Y: 'Y',
        XY: 'XY'
    },

    /**
     * POPUP_STYLE
     * This is representing element popup border style
     *
     * @author Kooin-Shin
     * 2020. 9. 23.
     */
    POPUP_STYLE: {
        RECTANGLE: 'RECTANGLE',
        ROUND: 'ROUND'
    },

    /**
     * PEEK_STYLE
     * This is representing element value peek point style
     *
     * @author Kooin-Shin
     * 2020. 9. 23.
     */
    PEEK_STYLE: {
        CIRCLE: 'CIRCLE',
        RECTANGLE: 'RECTANGLE'
    },

    /**
     * SELECTION_BORDER
     * This is representing selected element border style
     *
     * @author Kooin-Shin
     * 2020. 9. 23.
     */
    SELECTION_BORDER: {
        LINE: 'LINE',
        DOT: 'DOT'
    },

    /**
     * The place of round point
     */
    ROUND_PLACE: 2,

    /**
     * Line CHART
     * @since JDK1.4.1
     */
    LINE_CHART: 1,

    /**
     * Bar CHART
     * @since JDK1.4.1
     */
    BAR_CHART: 2,

    /**
     * Bar ratio CHART
     */
    BAR_RATIO_CHART: 3,

    /**
     * Circle CHART
     * @since JDK1.4.1
     */
    CIRCLE_CHART: 4,

    /**
     * Area CHART
     * @since JDK1.4.1
     */
    AREA_CHART: 5

};

export default ChartConstants;