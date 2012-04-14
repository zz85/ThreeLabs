/*
 * This is a prototypal Time based scheduler for animations
 * Supporting Tweens and Actions
 * @author https://github.com/zz85/ 
 *
 * Features:
 *	addAction(time, function)
 *	addTween(time, duration, target_object, start_values, end_values, tween, callback)
 *
 * ChangeLog:
 * ^ .merge() for chaining directors
 * ^ Pause
 * ^ Goto Time
 * ^ Change from start based counter to a running counter.
 *
 * TODO:
 * ^ Added relative timings?
 * ^ ordering of tween/ actions
 * ^ Auto stop once all actions are completed.
 */

THREE.Director = function() {
	this._actions = [];
	this._tweens = [];
};

/*
 * Schedules a tween to run at a particular time 
 */
THREE.Director.prototype.addTween = function(startTime, duration, 
	object, startValues, endValues, easing, callback) {
		
		if (startTime===null) startTime = this.__lastTime;
		if (object===null) object = this.__lastObject;
		if (easing==null) easing = this.__lastEasing;
		if (easing==null) easing = 'Linear.EaseNone';
		var easingFunction = this.getEasingFunction(easing);
		
		
		object = (object instanceof Array) ? object : [object];
		//Object.prototype.toString.call(o) === '[object Array]'
		this.__lastObject = object;
		this.__lastTime = (startTime + duration)  * 1000;
		this.__lastEasing = easing;
		
		var tween = {
			startTime: startTime * 1000,
			duration: duration * 1000,
			endTime: this.__lastTime,
			object: object, 
			startValues: startValues, 
			endValues: endValues,
			easing: easingFunction,
			callback: callback
		};
		
		this._tweens.push(tween);
		
		return this;
};

/*
 * Returns easing function based on its string named
 */
THREE.Director.prototype.getEasingFunction = function(name) {
	
	if (name=="Always.One") {
		return function() {
			return 1;
		}
	} else if (name=="Always.Zero") {
		return function() {
			return 0;
		}
	}
	
	
	var pointer = TWEEN.Easing;
	var paths = name.split('.');
	
	for (var i=0; i<paths.length;i++) {
		pointer = pointer[paths[i]];
	}
	
	if (pointer===undefined) {
		console.log("warning, tween " + name + " not found." )
	}
	
	return pointer;
};


THREE.Director.prototype.applyTweens = function(currentTime, lastTime) {
	
	var i, tweens = this._tweens, tween, il;
    
	// for (i=tweens.length; i--; ) { 
	for (i=0, il=tweens.length; i<il; i++) { // Quick patch for ordering
		tween = tweens[i];
   		if (tween.startTime <= currentTime && currentTime <= tween.endTime) {
			
			this.runTween(tween, currentTime);
			
		} else if ((currentTime > tween.endTime) && (lastTime < tween.endTime)) {
			
			this.runTween(tween, tween.endTime);
			
		}
    }


};

THREE.Director.prototype.runTween = function(tween, currentTime) {
	var startTime = tween.startTime,
		duration = tween.duration,
		endTime = tween.endTime,
		objects = tween.object, 
		startValues = tween.startValues, 
		endValues = tween.endValues,
		easing = tween.easing,
		callback = tween.callback;
	
	
	var passedTime = currentTime - startTime;
	
	var k = easing( passedTime / duration );

	var object;
	for (var i=objects.length;i--;) {
		object = objects[i];
		
		if (!startValues) {
			// If no start values are specified, use exisiting values
			startValues = {};

			for (var v in endValues) {
				startValues[v] = object[v];
			}

			tween.startValues = startValues;
		}

		var startValue, endValue;
		for (var v in startValues) {
			startValue = startValues[v];
			endValue = endValues[v];
			var value = startValue + k * (endValue - startValue);

			object[v] = value;
		}
		
		// TODO nested properties
		
	}
	
	// Trigger callback
	if (callback) {
		callback();
	}

	
};


/*
 * Schedules an action to run at a particular time 
 */
THREE.Director.prototype.addAction = function(time, action) {
	this._actions.push({time: time * 1000, action: action});
	
	// to allow chaining
	return this;
};

// For calculations for video rendering
THREE.Director.prototype.setFps = function(fps) {
	this._fps = fps;
};

THREE.Director.Utils = {
	// Frame to Seconds
	frameToTime: function(frame, fps) {
		return frame / fps;
	},
	
	timeToFrame: function(time, fps) {
		return Math.floor(time * fps);
	}
};

THREE.Director.prototype.applyActions = function(currentTime, lastTime) {
	
	// check for past keyframes
	// get all start time and end times in seconds
	var i, il, stage = this._actions, action;
    
	// for (i=stage.length; i--; ) { 
	for (i=0, il=stage.length; i<il;i++) {
		action = stage[i];
		
   		if (action.time > lastTime && action.time<= currentTime) {
			action.action();
		}
    }

};

/*
 *	Playback controls.
 */

THREE.Director.prototype.start = function() {
	var time = Date.now();
	
	this._lastTime = time; // - 1 Timestamp when last ran
	this._playingTime = 0;
	
	// run actions at time 0
	this.applyActions(0, -1);
	
	this._started = true;
};

THREE.Director.prototype.stop = function() {
	
	this._started = false;
	// reset playing time?
	this._playingTime = 0;
	// Clear last time.
	this._lastTime = null;
};

THREE.Director.prototype.pause = function() {

	this._started = !this._started;
	this._lastTime = Date.now();
	
};

THREE.Director.prototype.goto = function(t) {
	
	if (!this._started) return;
	
	t *= 1000;
	
	var lastPlayingTime = this._playingTime;
	
	if (t > lastPlayingTime) {
		this._playingTime = t;
		
		this.applyActions(t, lastPlayingTime);
		this.applyTweens(t, lastPlayingTime);
		
	} else {
		
		this._playingTime = t;
		
		this.applyActions(t, -1);
		this.applyTweens(t, -1);

	}
	
};

THREE.Director.prototype.update = function() {
	
	if (!this._started) return;
	
	var time = Date.now();
	var elapsed = time - this._lastTime;

	this._lastTime = time;

	var lastPlayingTime = this._playingTime;	
	this._playingTime += elapsed;
	
	this.applyActions(this._playingTime, lastPlayingTime);
	this.applyTweens(this._playingTime, lastPlayingTime);
	
		
};

/*
 * Merge another director actions and tweens into the first,
 * while offseting the time
 */
THREE.Director.prototype.merge = function(director2, time) {
	
	var actions = director2._actions;
	var tweens = director2._tweens;
	time *= 1000;
	
	var i,il;
	
	
	for (i=0,il=actions.length; i<il; i++) {
		actions[i].time += time;
	}

	for (i=0,il=tweens.length; i<il; i++) {
		tweens[i].startTime += time;
		tweens[i].endTime += time;
	}	
		
	this._actions = this._actions.concat(actions);
	this._tweens = this._tweens.concat(tweens);
	
	return this;
	
};