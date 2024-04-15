class AbstractInterpolator {
    // A normalized weight in an interpolation
    // is an interpolation weight in the range of [0, 1]
    // with 0 represents the start
    // and 1 represents the end
    interpolate(...normalizedWeights) {
        throw new Error("interpolate method is not overridden");
    }

    dim() {
        throw new Error("dim method is not overridden");
    }
}


/**
 * Multidimensionial linear number interpolator
 */
class NumberInterpolator extends AbstractInterpolator {
    _start;
    _ends;
    constructor(start, ...ends) {
        this._start = start;
        this._ends = ends;
    }

    interpolate(...normalizedWeights) {
        console.assert(
            normalizedWeights.length == this.dim(),
            "the number of weights is not equal to the number of ends"
        );

        let result = start;
        for (let i = 0; i < this.dim(); i++) {
            result += normalizedWeights[i] * (this._ends[i] - this._start);
        }

        return result;
    }

    dim() {
        return this._ends.length();
    }
}


/**
 * Multidimensionial linear vector interpolator
 */
class VectorInterpolator extends AbstractInterpolator {
    _start;
    _ends;
    constructor(start, ...ends) {
        if (Array.isArray(start))  // auto convert array to vector
            start = new Vector(start);
        console.assert(
            start instanceof Vector,
            "expected Vector, given ",
            start
        );
        this._start = start;

        this._ends = new Array(ends.length);
        for (let i = 0; i < ends.length; i++) {
            if (Array.isArray(ends[i]))    // auto convert array to vector
                ends[i] = new Vector(ends[i]);
            console.assert(
                ends[i] instanceof Vector,
                "expected Vector, given ",
                ends[i]
            );
            this._ends[i] = ends[i].copy();
        }
    }

    interpolate(...normalizedWeights) {
        console.assert(
            normalizedWeights.length == this.dim(),
            "the number of weights is not equal to the number of ends"
        );

        let result = start.copy();
        for (let i = 0; i < this.dim(); i++) {
            result.add(Vector.sub(this._ends[i], this._start).mul(normalizedWeights[i]));
        }

        return result;
    }

    dim() {
        return this._ends.length();
    }
}