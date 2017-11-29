"use strict"

var ease = require('./easing.js').ease
var resolution = 25
var universe = new Buffer(512);
universe.fill(0);

function Anim() {
	this.fx_stack = []
}

Anim.prototype.add = function(to, duration, options) {
	var options  = options  || {}
	var duration = duration || resolution
	options['easing'] = options['easing'] || 'linear'
	this.fx_stack.push({'to': to, 'duration': duration, 'options': options})
	return this
}

Anim.prototype.delay = function(duration) {
	return this.add({}, duration)
}

Anim.prototype.run = function(onFinish) {
	var config = {}
	var t = 0
	var d = 0
	var a

	var fx_stack = this.fx_stack;
	var ani_setup = function() {
		a = fx_stack.shift()
		t = 0
		d = a.duration
		config = {}
		for(var k in a.to) {          
			config[k] = {
				'start': universe[k],
				'end':   a.to[k]
			}
		}
	}
    
    console.log(config)
    
	var ani_step = function() {
		var new_vals = {}
		for(var k in config) {
          let diff = (config[k].end - config[k].start);          
          new_vals[k] = Math.round(config[k].start + ease['linear'](t, 0, 1, d) * diff)
		}
		t = t + resolution
        
        
        
        // update values
        for(let i in new_vals){
          universe[i] = new_vals[i];
        }

        
        
		if(t > d) {
			if(fx_stack.length > 0) {
				ani_setup()
			} else {
				clearInterval(iid)
				if(onFinish) onFinish()
			}
		}
	}

	ani_setup()
	var iid = setInterval(ani_step, resolution)
}


var an = new Anim();

an.add({1: 255, 0: 0});
an.add({0: 255, 1: 0}, 1000);


an.run(function () {
  console.log("Faded, done");
});






/*
Animation.prototype.add = function (to, options) {
  
  if(Number.isInteger(options)){
    options["duration"] = options;
  }
  
  // default options
  options = Object.assign({
    duration: 5000,
    easing: "linear"
  }, options);

  // push animation to stack
  this.stack.push({'to': to, 'duration': options.duration, 'options': options})
  
  return this;
  
};
*/