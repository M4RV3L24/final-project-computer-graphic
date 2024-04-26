class TweeningFunction {
	// A tweening function is a function
	// that receives number in range [0,1]
	// and returns number in the same range.

	static linear(t) {
		return t;
	}

	static zero(t) {
		return 0;
	}

	static quadratic(t) {
		return t * t;
	}

	static cubic(t) {
		return t * t * t;
	}

	static sine(t) {
		return 1 - Math.cos(t * Math.PI/2);
	}

	static inverse(tween) {
		return (t) => (1 - tween(t));
	}

	static reverse(tween) {
		return (t) => tween(1 - t);
	}

	static conjugate(tween) {
		// reverse and inverse
		return (t) => (1 - tween(1 - t));
	}
}

class Easing {
	constructor(tweenIn=null, tweenOut=null) {
		if (tweenIn == null && tweenOut == null) {
			throw new Error("tweenIn and tweenOut can't be both be null");
		}

		this._tweenIn = tweenIn;
		this._tweenOut = tweenOut;
	}

	ease(t) {
		if (this._tweenOut == null) {
			return this._tweenIn(t);
		}
		if (this._tweenIn == null) {
			return this._tweenOut(t);
		}

		// Combine tween in and out
		// using scaled version of them

		if (t < 0.5) {
			return this._tweenIn(2 * t) / 2;
		} else {
			t -= 0.5;
			return this._tweenOut(2 * t) / 2 + 0.5;
		}
	}

	static createIn(tween) {
		return new Easing(tween, null);
	}

	static createOut(tween) {
		return new Easing(null, TweeningFunction.conjugate(tween));
	}

	static createInOut(tween) {
		return new Easing(tween, TweeningFunction.conjugate(tween));
	}

	static linear = new Easing(TweeningFunction.linear);

	static jumpIn = Easing.createIn(TweeningFunction.zero);
	static jumpOut = Easing.createOut(TweeningFunction.zero);
	static jumpInOut = Easing.createInOut(TweeningFunction.zero);

	static quadraticIn = Easing.createIn(TweeningFunction.quadratic);
	static quadraticOut = Easing.createOut(TweeningFunction.quadratic);
	static quadraticInOut = Easing.createInOut(TweeningFunction.quadratic);

	static cubicIn = Easing.createIn(TweeningFunction.cubic);
	static cubicOut = Easing.createOut(TweeningFunction.cubic);
	static cubicInOut = Easing.createInOut(TweeningFunction.cubic);

	static sineIn = Easing.createIn(TweeningFunction.sine);
	static sineOut = Easing.createOut(TweeningFunction.sine);
	static sineInOut = Easing.createInOut(TweeningFunction.sine);
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
	_easing = null;

	_passedTime = 0;
	_prevValue = null;
	_currValue = null;

	constructor(callback, interpolator, duration, easing = Easing.linear) {
		this._callback = callback;
		this._interpolator = interpolator;
		console.assert(
			interpolator.dim() == 1,
			"doesn't support multidimensional transition"
		);
		this._duration = duration;
		this._easing = easing;

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
		return this._interpolator.interpolate(this.easedNormalizedTime());
	}

	progress() {
		return new TransitionProgress(
			this._currValue,
			this._prevValue,
			this._passedTime,
			this.normalizedTime(),
			this.easedNormalizedTime()
		);
	}

	normalizedTime() {
		return this._passedTime / this._duration;
	}

	easedNormalizedTime() {
		return this._easing.ease(this.normalizedTime());
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