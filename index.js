/*
 * @param {Object} cpt a point to be measured from the baseline
 * @param {Array} bl the baseline, as represented by a two-element
 *   array of xy objects.
 * @returns {Number} an approximate distance measure
 */
function getDistant(cpt, bl) {
    var vY = bl[1].x - bl[0].x,
        vX = bl[0].x - bl[1].x;
    return (vX * (cpt.y - bl[0].y) + vY * (cpt.x - bl[0].x));
}

/*
 * @param {Array} baseLine a two-element array of xy objects
 *   representing the baseline to project from
 * @param {Array} latLngs an array of xy objects
 * @returns {Object} the maximum point and all new points to stay
 *   in consideration for the hull.
 */
function findMostDistantPointFromBaseLine(baseLine, latLngs) {
    var maxD = 0,
        maxPt = null,
        newPoints = [],
        i, pt, d;

    for (i = latLngs.length - 1; i >= 0; i--) {
        pt = latLngs[i];
        d = getDistant(pt, baseLine);

        if (d > 0) {
            newPoints.push(pt);
        } else {
            continue;
        }

        if (d > maxD) {
            maxD = d;
            maxPt = pt;
        }
    }

    return {
        maxPoint: maxPt,
        newPoints: newPoints
    };
}


/*
 * Given a baseline, compute the convex hull of latLngs as an array
 * of latLngs.
 *
 * @param {Array} xy
 * @returns {Array}
 */
function buildConvexHull(baseLine, latLngs) {
    var convexHullBaseLines = [],
        t = findMostDistantPointFromBaseLine(baseLine, latLngs);

    if (t.maxPoint) { // if there is still a point "outside" the base line
        convexHullBaseLines =
            convexHullBaseLines.concat(
                buildConvexHull([baseLine[0], t.maxPoint], t.newPoints)
        );
        convexHullBaseLines =
            convexHullBaseLines.concat(
                buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints)
        );
        return convexHullBaseLines;
    } else {  // if there is no more point "outside" the base line, the current base line is part of the convex hull
        return [baseLine];
    }
}

/*
 * Given an array of xys, compute a convex hull as an array
 * of xys
 *
 * @param {Array} latLngs
 * @returns {Array}
 */
module.exports = function getConvexHull(points) {
    // find first baseline
    var maxLat = false, minLat = false,
    maxPt = null, minPt = null,
    i;

    for (i = points.length - 1; i >= 0; i--) {
        var pt = points[i];
        if (maxLat === false || pt.y > maxLat) {
            maxPt = pt;
            maxLat = pt.y;
        }
        if (minLat === false || pt.y < minLat) {
            minPt = pt;
            minLat = pt.y;
        }
    }
    return [].concat(buildConvexHull([minPt, maxPt], points),
        buildConvexHull([maxPt, minPt], points));
};
