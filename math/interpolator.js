class AbstractInterpolator {
    // A normalized weight in an interpolation
    // is an interpolation weight in the range of [0, 1]
    // with 0 represents the start
    // and 1 represents the end
    interpolate(...normalizedWeights) {
        throw new Error("interpolate method is not overridden");
    }

    getStart() {
        throw new Error("getStart method is not overridden");
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
        super();
        this._start = start;
        this._ends = ends;
    }

    interpolate(...normalizedWeights) {
        console.assert(
            normalizedWeights.length == this.dim(),
            "the number of weights is not equal to the number of ends"
        );

        let result = this._start;
        for (let i = 0; i < this.dim(); i++) {
            result += normalizedWeights[i] * (this._ends[i] - this._start);
        }

        return result;
    }

    getStart() {
        return this._start;
    }

    dim() {
        return this._ends.length;
    }
}


/**
 * Multidimensionial linear vector interpolator
 */
class VectorInterpolator extends AbstractInterpolator {
    _start;
    _ends;
    constructor(start, ...ends) {
        super();
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

        let result = this._start.copy();
        for (let i = 0; i < this.dim(); i++) {
            result.add(Vector.sub(this._ends[i], this._start).mul(normalizedWeights[i]));
        }

        return result;
    }

    getStart() {
        return this._start.copy();
    }

    dim() {
        return this._ends.length;
    }
}

/**
 * Multidimensionial spherical linear Quaternion interpolator (SLERP)
 */
class RotQuatInterpolator extends AbstractInterpolator {
    _start;
    _ends;
    constructor(start, ...ends) {
        super();
        if (!start instanceof Quaternion) {
            throw new Error("expected Quaternion");
        }
        this._start = start;

        this._ends = new Array(ends.length);
        for (let i = 0; i < ends.length; i++) {
            if (!ends[i] instanceof Quaternion) {
                throw new Error("expected Quaternion");
            }
            this._ends[i] = ends[i].copy();
        }
    }

    interpolate(...normalizedWeights) {
        if (normalizedWeights.length != this.dim()) {
            throw new Error("the number of weights is not equal to the number of ends");
        }

        let result = this._start.copy();
        for (let i = 0; i < this.dim(); i++) {
            result = RotQuatInterpolator.interpolate2(result, this._ends[i], normalizedWeights[i]);
        }

        return result;
    }

    getStart() {
        return this._start.copy();
    }

    dim() {
        return this._ends.length;
    }

    static interpolate2(q1, q2, t) {
        // SLERP of two quaternions
        // Based on: https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/index.htm

        let result = q1.copy();

        // Calculate angle between them.
        let cosHalfTheta = q1.dot(q2);
        // if q1=q2 or q1=-q2 then theta = 0 and we can return q1
        if (Math.abs(cosHalfTheta) >= 1.0) {
            return result;
        }

        // Calculate temporary values.
        let halfTheta = Math.acos(cosHalfTheta);
        let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        // if theta = 180 degrees then result is not fully defined
        // we could rotate around any axis normal to q1 or q2
        if (Math.abs(sinHalfTheta) < 0.001) {
            result.add(q2).mul(0.5);
            return result;
        }

        // Calculate result
        let t_times_halfTheta = t * halfTheta;
        let A = Math.sin(halfTheta - t_times_halfTheta);
        let B = Math.sin(t_times_halfTheta);

        result.mul(A)
            .add(q2.copy().mul(B))
            .div(sinHalfTheta);

        return result;
    }
}