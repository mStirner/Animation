const emitter = require("events").EventEmitter;
const util = require("util");
const easing = require("./easing.js").ease;


function Animation(options) {

  // default options
  options = this.options = Object.assign({
    resolution: 30,
    easing: "linear",
    buffer: 512
  }, options);

  // check buffer option
  if (Number.isInteger(options.buffer)) {
    this.buffer = new Buffer(options.buffer);
    this.buffer.fill(0);
  } else if (options.buffer instanceof Buffer) {
    this.buffer = options.buffer;
  } else {
    throw new Error("options.buffer must be an 'Number' or 'Buffer' instance");
  }

  //console.log(this.buffer)

  // fx stack
  this.stack = [];
  this.interval = null;

  // call event emitter constructor
  emitter.call(this);

}

// inherit event emitter
util.inherits(Animation, emitter);


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


Animation.prototype.add = function (to, duration, options) {


  var options = options || {}

  var duration = duration || this.options.resolution

  options['easing'] = options['easing'] || 'linear'

  this.stack.push({'to': to, 'duration': duration, 'options': options})

  return this;

};






/**
 * Reaturn the value of buffer <index>
 * @param {type} index
 * @returns {.Object@call;assign.buffer|options.buffer|Buffer}
 */
Animation.prototype.is = function (index) {
  if (this.buffer.length < index) {
    throw new Error("index is greater than buffer length (%s, %s)", index, this.buffer.length);
  }
  return this.buffer[index];
};


Animation.prototype.stop = function () {

  // clear interval
  if (this.interval) {
    clearInterval(this.interval);
  }

  // clear stack
  this.stack = [];

  // notify listeners
  this.emit("stoped");

};


Animation.prototype.start = function (cb) {

  // needed stuff
  let that = this;
  let options = this.options;


  var config = {};
  var t = 0, d = 0, a;


  var fx_stack = this.stack;
  var ani_setup = function () {

    a = fx_stack.shift();
    t = 0
    d = a.duration;
    config = {};

    for (var k in a.to) {
      config[k] = {
        'start': that.buffer[k],
        'end': a.to[k],
        options: "Hello"
      };
    }

  };

  var i = 0;



  //ani_setup() --> WHY NEEDED ?
  this.interval = setInterval(function () {

    var new_vals = {};
    for (let k in config) {

      // easing options function
      let easing_val = easing["linear"](t, 0, 1, d);

      // calcualte stuff
      let diff = (config[k].end - config[k].start);
      let value = new_vals[k] = Math.round(config[k].start + easing_val * diff);

      // update value
      that.buffer[k] = value; // same as universe.updat(new_vals)

    }

    // update time for easing
    t = t + options.resolution;

    //universe.update(new_vals)
    //console.log(Date.now(), new_vals);
    that.emit("chanels", new_vals);

    if (t > d) {
      if (fx_stack.length > 0) {

        // set up stack
        ani_setup();

      } else {

        // clear interval when done
        clearInterval(this);

        // callback ?
        if (cb) {
          cb();
        }

        // done
        that.emit("done");

      }
    }

  }, options.resolution);

};




var an = new Animation();

an.add({1: 255, 0: 0});
an.add({0: 255, 1: 0}, 2000);
an.add({1: 255}, 3000);
//an.add({1: 0}, 1000);

var t_start = Date.now();

an.start(function () {
  console.log("Faded, done");
});

an.on("chanels", function (data) {
  console.log(Date.now(), data);
});

an.on("done", function () {
  var t_end = Date.now();
  console.log("Done in %s sec. ", t_end - t_start);
});