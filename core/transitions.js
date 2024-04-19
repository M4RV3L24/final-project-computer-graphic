class TweeningFunction {
	// A tweening function is a function
	// that receives number in range [0,1]
	// and returns number in the same range.

	static linear(t) {
		return t;
	}

	static jump(t) {
		return t < 0.5 ? 0 : 1;
	}

	static quadratic(t) {
		return t * t;
	}

	static cubic(t) {
		return t * t * t;
	}

	static sine(t) {
		return Math.sin(t * Math.PI/2);
	}
}


class TransitionProgress {
	value;
	prevValue;
	time;
	normalizedTime;

	constructor(value, prevValue, time, normalizedTime) {
		this.value = value;
		this.prevValue = prevValue;
		this.time = time;
		this.normalizedTime = normalizedTime;
	}
}


class Transition {
	_callback = null;
	_interpolator = null;
	_duration = null
	_tweeningFunction = null;

	_passedTime = 0;
	_interpolateFunc = null;
	_prevValue = null;
	_currValue = null;

	constructor(callback, interpolator, duration, tweeningFunction = tweeningFunction.linear) {
		this._callback = callback;
		this._interpolator = interpolator;
		console.assert(
			interpolator.dim() == 1,
			"doesn't support multidimensional transition"
		);
		this._duration = duration;
		this._tweeningFunction = tweeningFunction;

		this._passedTime = 0;
		this._prevValue = interpolator.getStart();
		this._currValue = this._prevValue;
	}

	// Run the transition for a given duration
	step(duration) {
		let naiveTime = this._passedTime + duration;
		this._passedTime = Math.min(naiveTime, this._duration);

		this._prevValue = this._currValue;
		this._currValue = this.calcValue();
		this._callback(this.progress());

		return naiveTime - this._passedTime;
	}

	calcValue() {
		return this._interpolator.interpolate(this.tweenedNormalizedTime());
	}

	progress() {
		return new TransitionProgress(
			this._currValue,
			this._prevValue,
			this._passedTime,
			this.normalizedTime(),
			this.tweenedNormalizedTime()
		);
	}

	normalizedTime() {
		return this._passedTime / this._duration;
	}

	tweenedNormalizedTime() {
		return this._tweeningFunction(this.normalizedTime());
	}

	isFinished() {
		return this._passedTime == this._duration;
	}
}


class TransitionManager {
	_transitions = []
	_currIndex = 0

	constructor() { }

	step(duration) {
		if (this.isFinished())
			return;

		let remainder = this.currTransition().step(duration);
		if (remainder > 0) {
			this.next();
			this.step(remainder)
		}
	}

	currTransition() {
		return this._transitions[this._currIndex];
	}

	add(...args) {
		this._transitions.push(new Transition(...args));
		return this;
	}

	next() {
		this._timePassed = 0;
		this._currIndex++;
	}

	isFinished() {
		return (this._currIndex >= this._transitions.length);
	}
}