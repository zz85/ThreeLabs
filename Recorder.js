/*
 * @author zz85
 * Recorder class for recording events. Used in "It came upon" http://jabtunes.com/itcameupon/
 * 
 * Usage:
 *	// start recording		
 *	recorder = new Recorder();
 *	recorder.start();
 *
 *	// record events
 *	recorder.record(event);
 *
 *	// stop recording
 *	recorder.stop();
 *	
 *	// save
 *	save = recorder.toJSON();
 *
 *	// playback (using director)
 *	recorder._recordings = (myrecording);
 *	playbackDirector = recorder.getDirector(playbackHandler);
 */


var Recorder = function() {
	
	this.reset = function() {
		this._started = false;
		this._recordings = [];
	}
	
	this.start = function() {
		this._started = true;
		this._startTime = Date.now();
	};
	
	// records event
	this.record = function(event) {
		
		if (!this._started) return;
		
		var time = Date.now();
		var runningTime = time - this._startTime;
		
		this._recordings.push({
			time: runningTime,
			event: event
			// todo: copies argument too?
		});
		
	};
	
	this.getDirector = function(callback) {
		
		var recordings = this._recordings;
		var director = new THREE.Director();
		
		function callBackEvent(event) {
			return function() {
				callback(event)
			};
		}
		
		for (var i=0,il=recordings.length;i<il;i++) {
			
			var event = recordings[i].event;
			
			var closure = callBackEvent(event);
			
			director.addAction(recordings[i].time / 1000, closure);
		}
		
		return director;
		
	}
	
	this.stop = function() {
		this._started = false;
	};
	
	this.hasStarted = function() {
		return this._started;
	};
	
	this.toJSON = function() {
		return JSON.stringify(this._recordings);
	}
	
	this.fromJSON = function(json) {
		this._recordings = JSON.parse(json);
	}
	
	this.reset();
	
};