class PoseInterpolator {
    _start = null;
    _dim = -1;
    _transformInterpolators = null;
    constructor(start, ...ends) {
        if (!start instanceof Pose) {
            throw new Error("expected Pose");
        }
        ends.forEach((end) => {
            if (!end instanceof Pose) {
                throw new Error("expected Pose");
            }
            if (end.length != start.length) {
                throw new Error("different length between start and end");
            }
        });

        this._start = start;

        // Get the number of dimension
        this._dim = ends.length;

        // Create Transform3Interpolator for each object
        this._transformInterpolators = new Array(start.length);
        for (let i = 0; i < start.length; i++) {
            // Get each transform of an object
            let transforms = new Array(this._dim + 1);
            transforms[0] = start._transforms[i];
            for (let j = 0; j < this._dim; j++) {
                transforms[j + 1] = ends[j]._transforms[i];
            }

            this._transformInterpolators[i] = new Transform3Interpolator(...transforms);
        }
    }

    interpolate(...normalizedWeights) {
        // Interpolate transform for each object
        if (normalizedWeights.length != this.dim()) {
            throw new Error("number of weight doesn't match the number of dimension");
        }

        let objectTransforms = new Array(this.numObject());
        for (let i = 0; i < this.numObject(); i++) {
            objectTransforms[i] = this._transformInterpolators[i].interpolate(...normalizedWeights);
        }

        return new Pose(this._start._objects, objectTransforms);
    }

    getStart() {
        return this._start;
    }

    dim() {
        return this._dim;
    }

    numObject() {
        return this._start.length;
    }
}
class Pose {
    _objects = null;
    _transforms = null;
    constructor(objects, transforms = null) {
        if (objects instanceof GLObject) {
            // Only single object passed
            this._objects = [objects];
        } else if (Array.isArray(objects)) {
            objects.forEach((elem) => {
                if (!elem instanceof GLObject) {
                    throw new Error("expected Array of GLObject");
                }
            });
            // Copy the array
            this._objects = [...objects];
        } else {
            throw new Error("constructor overload failed");
        }

        let length = this._objects.length;
        if (transforms == null) {
            // Copy all the transforms of the given objects
            this._transforms = new Array(length);
            for (let i = 0; i < length; i++) {
                this._transforms[i] = this._objects[i].transform.copy();
            }
        } else {
            // Override transform with the given parameter transforms

            if (Array.isArray(transforms)) {
                transforms.forEach((elem) => {
                    if (!elem instanceof Transform3) {
                        throw new Error("expected Array of Transform3");
                    }
                });

                if (transforms.length < length) {
                    throw new Error("The number of transform is less than the number of objects");
                } else if (transforms.length > length) {
                    console.warn("The number of transform is greater than the number of objects.\
                    Ignoring some transforms.");
                }

                this._transforms = new Array(length);
                for (let i = 0; i < length; i++) {
                    this._transforms[i] = transforms[i].copy();
                }
            } else if (transforms instanceof Transform3) {
                if (length > 1) {
                    throw new Error("The number of transform is less than the number of objects");
                } else if (length < 1) {
                    console.warn("The number of transform is greater than the number of objects.\
                    Ignoring some transforms.");
                }
                this._transforms = [transforms.copy()];
            } else {
                throw new Error("constructor overload failed");
            }
        }
    }

    get length() {
        return this._objects.length;
    }

    apply() {
        for (let i = 0; i < this.length; i++) {
            this._objects[i].transform.load(this._transforms[i]);
        }
    }
}