(function (global, factory) {

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = global.document ?
      factory(global, true) :
      function (w) {
        if (!w.document) {
          throw new Error('vjs requires a window with a document');
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) { /*jshint unused:false*/
  /*! videojs-afrostream - v0.17.5 - 2015-09-25
* Copyright (c) 2015 Brightcove; Licensed  */
/*! videojs-hlsjs - v0.0.0 - 2015-09-25
* Copyright (c) 2015 benjipott; Licensed Apache-2.0 */
/*! videojs-hls - v0.0.0 - 2015-9-24
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license. */
(function (window, videojs, document, undefined) {
  'use strict';

  var defaults = {
      option: true
    },
    HlsJs;

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  videojs.HlsJs = videojs.Html5.extend({
    init: function (player, options, ready) {
      this.hls = new Hls();
      player.hlsJs = this;
      videojs.Html5.call(this, player, options, ready);
      this.hls.on(Hls.Events.MSE_ATTACHED, videojs.bind(this, this.onMseAttached));
      this.hls.on(Hls.Events.MANIFEST_PARSED, videojs.bind(this, this.onManifestParsed));
      this.hls.on(Hls.Events.ERROR, videojs.bind(this, this.onError));
      this.hls.on(Hls.Events.LEVEL_LOADED, videojs.bind(this, this.onLevelLoaded));
    }
  });

  videojs.HlsJs.prototype.options_ = {
    debug: false,
    autoStartLoad: false,
    maxBufferLength: 30,
    maxBufferSize: 60 * 1000 * 1000,
    enableWorker: true,
    fragLoadingTimeOut: 20000,
    fragLoadingMaxRetry: 6,
    fragLoadingRetryDelay: 500,
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 6,
    manifestLoadingRetryDelay: 500,
    fpsDroppedMonitoringPeriod: 5000,
    fpsDroppedMonitoringThreshold: 0.2,
    appendErrorMaxRetry: 200,
    //loader: customLoader
  };

  videojs.HlsJs.prototype.hls = {};

  videojs.HlsJs.prototype.dispose = function () {
    //this.hls.detachVideo();
    //this.hls.destroy();
    videojs.Html5.prototype.dispose.call(this);
  };

  videojs.HlsJs.prototype.load = function () {
    this.hls.startLoad();
  };

  videojs.HlsJs.prototype.onLevelLoaded = function (event, data) {
    var level_duration = data.details.totalduration;
  };

  videojs.HlsJs.prototype.onError = function (event, data) {

    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // try to recover network error
          videojs.log('fatal network error encountered, try to recover');
          this.hls.recoverNetworkError();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          videojs.log('fatal media error encountered, try to recover');
          this.hls.recoverMediaError();
          break;
        default:
          // cannot recover
          this.hls.destroy();
          this.player().error(data);
          break;
      }
    }
    switch (data.details) {
      case this.hls.ErrorDetails.MANIFEST_LOAD_ERROR:
      case this.hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
      case this.hls.ErrorDetails.MANIFEST_PARSING_ERROR:
      case this.hls.ErrorDetails.LEVEL_LOAD_ERROR:
      case this.hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
      case this.hls.ErrorDetails.LEVEL_SWITCH_ERROR:
      case this.hls.ErrorDetails.FRAG_LOAD_ERROR:
      case this.hls.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
      case this.hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
      case this.hls.ErrorDetails.FRAG_PARSING_ERROR:
      case this.hls.ErrorDetails.FRAG_APPENDING_ERROR:
        videojs.log(data.type);
        videojs.log(data.details);
        break;
      default:
        break;
    }

  };

  videojs.HlsJs.prototype.onMseAttached = function () {
    this.triggerReady();
  };

  videojs.HlsJs.prototype.onManifestParsed = function () {
    if (this.player().options().autoplay) {
      this.player().play();
    }
  };

// Add HLS to the standard tech order
  videojs.options.techOrder.unshift('hlsJs');

  (function () {
    var
      origSetSource = videojs.HlsJs.prototype.setSource,
      origDisposeSourceHandler = videojs.HlsJs.prototype.disposeSourceHandler;

    videojs.HlsJs.prototype.setSource = function (source) {
      var retVal = origSetSource.call(this, source);
      this.source_ = source.src;
      this.hls.loadSource(this.source_);
      this.hls.attachVideo(this.el_);
      return retVal;
    };

    videojs.HlsJs.prototype.disposeSourceHandler = function () {
      this.source_ = undefined;
      return origDisposeSourceHandler.call(this);
    };
  })();

  videojs.HlsJs.canPlaySource = function (srcObj) {
    var mpegurlRE = /^application\/(?:x-|vnd\.apple\.)mpegurl/i;
    return mpegurlRE.test(srcObj.type);
  };

  videojs.HlsJs.supportsNativeHls = (function () {
    var
      video = document.createElement('video'),
      xMpegUrl,
      vndMpeg;

    // native HLS is definitely not supported if HTML5 video isn't
    if (!videojs.Html5.isSupported()) {
      return false;
    }

    xMpegUrl = video.canPlayType('application/x-mpegURL');
    vndMpeg = video.canPlayType('application/vnd.apple.mpegURL');
    return (/probably|maybe/).test(xMpegUrl) ||
      (/probably|maybe/).test(vndMpeg);
  })();

  videojs.HlsJs.isSupported = function () {

    // Only use the HLS tech if native HLS isn't available
    return Hls.isSupported();
  };

// register the media
})
(window, window.videojs, document);

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Hls = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);
    
    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        if (cache[key].exports === fn) {
            wkey = key;
            break;
        }
    }
    
    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
    
    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'],'require(' + stringify(wkey) + ')(self)'),
        scache
    ];
    
    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;
    
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    
    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}],3:[function(require,module,exports){
/*
 * buffer controller
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var _utilsLogger = require('../utils/logger');

var _demuxDemuxer = require('../demux/demuxer');

var _demuxDemuxer2 = _interopRequireDefault(_demuxDemuxer);

var _errors = require('../errors');

var BufferController = (function () {
  function BufferController(hls) {
    _classCallCheck(this, BufferController);

    this.ERROR = -2;
    this.STARTING = -1;
    this.IDLE = 0;
    this.LOADING = 1;
    this.WAITING_LEVEL = 2;
    this.PARSING = 3;
    this.PARSED = 4;
    this.APPENDING = 5;
    this.BUFFER_FLUSHING = 6;
    this.config = hls.config;
    this.startPosition = 0;
    this.hls = hls;
    // Source Buffer listeners
    this.onsbue = this.onSourceBufferUpdateEnd.bind(this);
    this.onsbe = this.onSourceBufferError.bind(this);
    // internal listeners
    this.onmse = this.onMSEAttached.bind(this);
    this.onmsed = this.onMSEDetached.bind(this);
    this.onmp = this.onManifestParsed.bind(this);
    this.onll = this.onLevelLoaded.bind(this);
    this.onfl = this.onFragmentLoaded.bind(this);
    this.onis = this.onInitSegment.bind(this);
    this.onfpg = this.onFragmentParsing.bind(this);
    this.onfp = this.onFragmentParsed.bind(this);
    this.onerr = this.onError.bind(this);
    this.ontick = this.tick.bind(this);
    _observer2['default'].on(_events2['default'].MSE_ATTACHED, this.onmse);
    _observer2['default'].on(_events2['default'].MSE_DETACHED, this.onmsed);
    _observer2['default'].on(_events2['default'].MANIFEST_PARSED, this.onmp);
  }

  _createClass(BufferController, [{
    key: 'destroy',
    value: function destroy() {
      this.stop();
      _observer2['default'].off(_events2['default'].MANIFEST_PARSED, this.onmp);
      // remove video listener
      if (this.video) {
        this.video.removeEventListener('seeking', this.onvseeking);
        this.video.removeEventListener('seeked', this.onvseeked);
        this.video.removeEventListener('loadedmetadata', this.onvmetadata);
        this.onvseeking = this.onvseeked = this.onvmetadata = null;
      }
      this.state = this.IDLE;
    }
  }, {
    key: 'startLoad',
    value: function startLoad() {
      if (this.levels && this.video) {
        this.startInternal();
        if (this.lastCurrentTime) {
          _utilsLogger.logger.log('seeking @ ' + this.lastCurrentTime);
          this.nextLoadPosition = this.startPosition = this.lastCurrentTime;
          if (!this.lastPaused) {
            _utilsLogger.logger.log('resuming video');
            this.video.play();
          }
          this.state = this.IDLE;
        } else {
          this.nextLoadPosition = this.startPosition;
          this.state = this.STARTING;
        }
        this.tick();
      } else {
        _utilsLogger.logger.warn('cannot start loading as either manifest not parsed or video not attached');
      }
    }
  }, {
    key: 'startInternal',
    value: function startInternal() {
      this.stop();
      this.demuxer = new _demuxDemuxer2['default'](this.config);
      this.timer = setInterval(this.ontick, 100);
      this.level = -1;
      _observer2['default'].on(_events2['default'].FRAG_LOADED, this.onfl);
      _observer2['default'].on(_events2['default'].FRAG_PARSING_INIT_SEGMENT, this.onis);
      _observer2['default'].on(_events2['default'].FRAG_PARSING_DATA, this.onfpg);
      _observer2['default'].on(_events2['default'].FRAG_PARSED, this.onfp);
      _observer2['default'].on(_events2['default'].ERROR, this.onerr);
      _observer2['default'].on(_events2['default'].LEVEL_LOADED, this.onll);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.mp4segments = [];
      this.flushRange = [];
      this.bufferRange = [];
      if (this.frag) {
        if (this.frag.loader) {
          this.frag.loader.abort();
        }
        this.frag = null;
      }
      if (this.sourceBuffer) {
        for (var type in this.sourceBuffer) {
          var sb = this.sourceBuffer[type];
          try {
            this.mediaSource.removeSourceBuffer(sb);
            sb.removeEventListener('updateend', this.onsbue);
            sb.removeEventListener('error', this.onsbe);
          } catch (err) {}
        }
        this.sourceBuffer = null;
      }
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.demuxer) {
        this.demuxer.destroy();
        this.demuxer = null;
      }
      _observer2['default'].off(_events2['default'].FRAG_LOADED, this.onfl);
      _observer2['default'].off(_events2['default'].FRAG_PARSED, this.onfp);
      _observer2['default'].off(_events2['default'].FRAG_PARSING_DATA, this.onfpg);
      _observer2['default'].off(_events2['default'].LEVEL_LOADED, this.onll);
      _observer2['default'].off(_events2['default'].FRAG_PARSING_INIT_SEGMENT, this.onis);
      _observer2['default'].off(_events2['default'].ERROR, this.onerr);
    }
  }, {
    key: 'tick',
    value: function tick() {
      var pos, level, levelDetails, fragIdx;
      switch (this.state) {
        case this.ERROR:
          //don't do anything in error state to avoid breaking further ...
          break;
        case this.STARTING:
          // determine load level
          this.startLevel = this.hls.startLevel;
          if (this.startLevel === -1) {
            // -1 : guess start Level by doing a bitrate test by loading first fragment of lowest quality level
            this.startLevel = 0;
            this.fragmentBitrateTest = true;
          }
          // set new level to playlist loader : this will trigger start level load
          this.level = this.hls.nextLoadLevel = this.startLevel;
          this.state = this.WAITING_LEVEL;
          this.loadedmetadata = false;
          break;
        case this.IDLE:
          // handle end of immediate switching if needed
          if (this.immediateSwitch) {
            this.immediateLevelSwitchEnd();
            break;
          }

          // if video detached or unbound exit loop
          if (!this.video) {
            break;
          }

          // seek back to a expected position after video stalling
          if (this.seekAfterStalling) {
            this.video.currentTime = this.seekAfterStalling;
            this.seekAfterStalling = undefined;
          }

          // determine next candidate fragment to be loaded, based on current position and
          //  end of buffer position
          //  ensure 60s of buffer upfront
          // if we have not yet loaded any fragment, start loading from start position
          if (this.loadedmetadata) {
            pos = this.video.currentTime;
          } else {
            pos = this.nextLoadPosition;
          }
          // determine next load level
          if (this.startFragmentRequested === false) {
            level = this.startLevel;
          } else {
            // we are not at playback start, get next load level from level Controller
            level = this.hls.nextLoadLevel;
          }
          var bufferInfo = this.bufferInfo(pos),
              bufferLen = bufferInfo.len,
              bufferEnd = bufferInfo.end,
              maxBufLen;
          // compute max Buffer Length that we could get from this load level, based on level bitrate. don't buffer more than 60 MB and more than 30s
          if (this.levels[level].hasOwnProperty('bitrate')) {
            maxBufLen = Math.max(8 * this.config.maxBufferSize / this.levels[level].bitrate, this.config.maxBufferLength);
            maxBufLen = Math.min(maxBufLen, this.config.maxMaxBufferLength);
          } else {
            maxBufLen = this.config.maxBufferLength;
          }
          // if buffer length is less than maxBufLen try to load a new fragment
          if (bufferLen < maxBufLen) {
            // set next load level : this will trigger a playlist load if needed
            this.hls.nextLoadLevel = level;
            this.level = level;
            levelDetails = this.levels[level].details;
            // if level info not retrieved yet, switch state and wait for level retrieval
            if (typeof levelDetails === 'undefined') {
              this.state = this.WAITING_LEVEL;
              break;
            }
            // find fragment index, contiguous with end of buffer position
            var fragments = levelDetails.fragments,
                _frag = undefined,
                sliding = levelDetails.sliding,
                start = fragments[0].start + sliding,
                drift = 0;
            // check if requested position is within seekable boundaries :
            // in case of live playlist we need to ensure that requested position is not located before playlist start
            //logger.log(`start/pos/bufEnd/seeking:${start.toFixed(3)}/${pos.toFixed(3)}/${bufferEnd.toFixed(3)}/${this.video.seeking}`);
            if (bufferEnd < start) {
              this.seekAfterStalling = this.startPosition + sliding;
              _utilsLogger.logger.log('buffer end: ' + bufferEnd + ' is located before start of live sliding playlist, media position will be reseted to: ' + this.seekAfterStalling.toFixed(3));
              bufferEnd = this.seekAfterStalling;
            }

            if (levelDetails.live && levelDetails.sliding === undefined) {
              /* we are switching level on live playlist, but we don't have any sliding info ...
                 try to load frag matching with next SN.
                 even if SN are not synchronized between playlists, loading this frag will help us
                 compute playlist sliding and find the right one after in case it was not the right consecutive one */
              if (this.frag) {
                var targetSN = this.frag.sn + 1;
                if (targetSN >= levelDetails.startSN && targetSN <= levelDetails.endSN) {
                  _frag = fragments[targetSN - levelDetails.startSN];
                  _utilsLogger.logger.log('live playlist, switching playlist, load frag with next SN: ' + _frag.sn);
                }
              }
              if (!_frag) {
                /* we have no idea about which fragment should be loaded.
                   so let's load mid fragment. it will help computing playlist sliding and find the right one
                */
                _frag = fragments[Math.round(fragments.length / 2)];
                _utilsLogger.logger.log('live playlist, switching playlist, unknown, load middle frag : ' + _frag.sn);
              }
            } else {
              //look for fragments matching with current play position
              for (fragIdx = 0; fragIdx < fragments.length; fragIdx++) {
                _frag = fragments[fragIdx];
                start = _frag.start + sliding;
                if (_frag.drift) {
                  drift = _frag.drift;
                }
                start += drift;
                //logger.log(`level/sn/sliding/drift/start/end/bufEnd:${level}/${frag.sn}/${sliding.toFixed(3)}/${drift.toFixed(3)}/${start.toFixed(3)}/${(start+frag.duration).toFixed(3)}/${bufferEnd.toFixed(3)}`);
                // offset should be within fragment boundary
                if (start <= bufferEnd && start + _frag.duration > bufferEnd) {
                  break;
                }
              }
              if (fragIdx === fragments.length) {
                // reach end of playlist
                break;
              }
              //logger.log('find SN matching with pos:' +  bufferEnd + ':' + frag.sn);
              if (this.frag && _frag.sn === this.frag.sn) {
                if (fragIdx === fragments.length - 1) {
                  // we are at the end of the playlist and we already loaded last fragment, don't do anything
                  break;
                } else {
                  _frag = fragments[fragIdx + 1];
                  _utilsLogger.logger.log('SN just loaded, load next one: ' + _frag.sn);
                }
              }
            }
            _utilsLogger.logger.log('Loading       ' + _frag.sn + ' of [' + levelDetails.startSN + ' ,' + levelDetails.endSN + '],level ' + level + ', currentTime:' + pos + ',bufferEnd:' + bufferEnd.toFixed(3));
            //logger.log('      loading frag ' + i +',pos/bufEnd:' + pos.toFixed(3) + '/' + bufferEnd.toFixed(3));
            _frag.drift = drift;
            _frag.autoLevel = this.hls.autoLevelEnabled;
            if (this.levels.length > 1) {
              _frag.expectedLen = Math.round(_frag.duration * this.levels[level].bitrate / 8);
              _frag.trequest = new Date();
            }

            // ensure that we are not reloading the same fragments in loop ...
            if (this.fragLoadIdx !== undefined) {
              this.fragLoadIdx++;
            } else {
              this.fragLoadIdx = 0;
            }
            if (_frag.loadCounter) {
              _frag.loadCounter++;
              var maxThreshold = this.config.fragLoadingLoopThreshold;
              // if this frag has already been loaded 3 times, and if it has been reloaded recently
              if (_frag.loadCounter > maxThreshold && Math.abs(this.fragLoadIdx - _frag.loadIdx) < maxThreshold) {
                _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_LOOP_LOADING_ERROR, fatal: false, frag: _frag });
                return;
              }
            } else {
              _frag.loadCounter = 1;
            }
            _frag.loadIdx = this.fragLoadIdx;
            this.frag = _frag;
            this.startFragmentRequested = true;
            _observer2['default'].trigger(_events2['default'].FRAG_LOADING, { frag: _frag });
            this.state = this.LOADING;
          }
          break;
        case this.WAITING_LEVEL:
          level = this.levels[this.level];
          // check if playlist is already loaded
          if (level && level.details) {
            this.state = this.IDLE;
          }
          break;
        case this.LOADING:
          /*
            monitor fragment retrieval time...
            we compute expected time of arrival of the complete fragment.
            we compare it to expected time of buffer starvation
          */
          var v = this.video,
              frag = this.frag;
          /* only monitor frag retrieval time if
          (video not paused OR first fragment being loaded) AND autoswitching enabled AND not lowest level AND multiple levels */
          if (v && (!v.paused || this.loadedmetadata === false) && frag.autoLevel && this.level && this.levels.length > 1) {
            var requestDelay = new Date() - frag.trequest;
            // monitor fragment load progress after half of expected fragment duration,to stabilize bitrate
            if (requestDelay > 500 * frag.duration) {
              var loadRate = frag.loaded * 1000 / requestDelay; // byte/s
              if (frag.expectedLen < frag.loaded) {
                frag.expectedLen = frag.loaded;
              }
              pos = v.currentTime;
              var fragLoadedDelay = (frag.expectedLen - frag.loaded) / loadRate;
              var bufferStarvationDelay = this.bufferInfo(pos).end - pos;
              var fragLevelNextLoadedDelay = frag.duration * this.levels[this.hls.nextLoadLevel].bitrate / (8 * loadRate); //bps/Bps
              /* if we have less than 2 frag duration in buffer and if frag loaded delay is greater than buffer starvation delay
                ... and also bigger than duration needed to load fragment at next level ...*/
              if (bufferStarvationDelay < 2 * frag.duration && fragLoadedDelay > bufferStarvationDelay && fragLoadedDelay > fragLevelNextLoadedDelay) {
                // abort fragment loading ...
                _utilsLogger.logger.warn('loading too slow, abort fragment loading');
                _utilsLogger.logger.log('fragLoadedDelay/bufferStarvationDelay/fragLevelNextLoadedDelay :' + fragLoadedDelay.toFixed(1) + '/' + bufferStarvationDelay.toFixed(1) + '/' + fragLevelNextLoadedDelay.toFixed(1));
                //abort fragment loading
                frag.loader.abort();
                this.frag = null;
                _observer2['default'].trigger(_events2['default'].FRAG_LOAD_EMERGENCY_ABORTED, { frag: frag });
                // switch back to IDLE state to request new fragment at lowest level
                this.state = this.IDLE;
              }
            }
          }
          break;
        case this.PARSING:
          // nothing to do, wait for fragment being parsed
          break;
        case this.PARSED:
        case this.APPENDING:
          if (this.sourceBuffer) {
            // if MP4 segment appending in progress nothing to do
            if (this.sourceBuffer.audio && this.sourceBuffer.audio.updating || this.sourceBuffer.video && this.sourceBuffer.video.updating) {
              //logger.log('sb append in progress');
              // check if any MP4 segments left to append
            } else if (this.mp4segments.length) {
                var segment = this.mp4segments.shift();
                try {
                  //logger.log(`appending ${segment.type} SB, size:${segment.data.length}`);
                  this.sourceBuffer[segment.type].appendBuffer(segment.data);
                  this.appendError = 0;
                } catch (err) {
                  // in case any error occured while appending, put back segment in mp4segments table
                  _utilsLogger.logger.error('error while trying to append buffer:' + err.message + ',try appending later');
                  this.mp4segments.unshift(segment);
                  if (this.appendError) {
                    this.appendError++;
                  } else {
                    this.appendError = 1;
                  }
                  var event = { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_APPENDING_ERROR, frag: this.frag };
                  /* with UHD content, we could get loop of quota exceeded error until
                    browser is able to evict some data from sourcebuffer. retrying help recovering this
                  */
                  if (this.appendError > this.config.appendErrorMaxRetry) {
                    _utilsLogger.logger.log('fail ' + this.config.appendErrorMaxRetry + ' times to append segment in sourceBuffer');
                    event.fatal = true;
                    _observer2['default'].trigger(_events2['default'].ERROR, event);
                    this.state = this.ERROR;
                    return;
                  } else {
                    event.fatal = false;
                    _observer2['default'].trigger(_events2['default'].ERROR, event);
                  }
                }
                this.state = this.APPENDING;
              }
          } else {
            // sourceBuffer undefined, switch back to IDLE state
            this.state = this.IDLE;
          }
          break;
        case this.BUFFER_FLUSHING:
          // loop through all buffer ranges to flush
          while (this.flushRange.length) {
            var range = this.flushRange[0];
            // flushBuffer will abort any buffer append in progress and flush Audio/Video Buffer
            if (this.flushBuffer(range.start, range.end)) {
              // range flushed, remove from flush array
              this.flushRange.shift();
            } else {
              // flush in progress, come back later
              break;
            }
          }

          if (this.flushRange.length === 0) {
            // move to IDLE once flush complete. this should trigger new fragment loading
            this.state = this.IDLE;
            // reset reference to frag
            this.frag = null;
          }
          /* if not everything flushed, stay in BUFFER_FLUSHING state. we will come back here
             each time sourceBuffer updateend() callback will be triggered
             */
          break;
        default:
          break;
      }
      // check/update current fragment
      this._checkFragmentChanged();
    }
  }, {
    key: 'bufferInfo',
    value: function bufferInfo(pos) {
      var v = this.video,
          buffered = v.buffered,
          bufferLen,

      // bufferStart and bufferEnd are buffer boundaries around current video position
      bufferStart,
          bufferEnd,
          i;
      var buffered2 = [];
      // there might be some small holes between buffer time range
      // consider that holes smaller than 300 ms are irrelevant and build another
      // buffer time range representations that discards those holes
      for (i = 0; i < buffered.length; i++) {
        //logger.log('buf start/end:' + buffered.start(i) + '/' + buffered.end(i));
        if (buffered2.length && buffered.start(i) - buffered2[buffered2.length - 1].end < 0.3) {
          buffered2[buffered2.length - 1].end = buffered.end(i);
        } else {
          buffered2.push({ start: buffered.start(i), end: buffered.end(i) });
        }
      }

      for (i = 0, bufferLen = 0, bufferStart = bufferEnd = pos; i < buffered2.length; i++) {
        //logger.log('buf start/end:' + buffered.start(i) + '/' + buffered.end(i));
        if (pos + 0.3 >= buffered2[i].start && pos < buffered2[i].end) {
          // play position is inside this buffer TimeRange, retrieve end of buffer position and buffer length
          bufferStart = buffered2[i].start;
          bufferEnd = buffered2[i].end + 0.3;
          bufferLen = bufferEnd - pos;
        }
      }
      return { len: bufferLen, start: bufferStart, end: bufferEnd };
    }
  }, {
    key: 'getBufferRange',
    value: function getBufferRange(position) {
      var i, range;
      for (i = this.bufferRange.length - 1; i >= 0; i--) {
        range = this.bufferRange[i];
        if (position >= range.start && position <= range.end) {
          return range;
        }
      }
      return null;
    }
  }, {
    key: 'followingBufferRange',
    value: function followingBufferRange(range) {
      if (range) {
        // try to get range of next fragment (500ms after this range)
        return this.getBufferRange(range.end + 0.5);
      }
      return null;
    }
  }, {
    key: 'isBuffered',
    value: function isBuffered(position) {
      var v = this.video,
          buffered = v.buffered;
      for (var i = 0; i < buffered.length; i++) {
        if (position >= buffered.start(i) && position <= buffered.end(i)) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: '_checkFragmentChanged',
    value: function _checkFragmentChanged() {
      var rangeCurrent, currentTime;
      if (this.video && this.video.seeking === false) {
        this.lastCurrentTime = currentTime = this.video.currentTime;
        if (this.isBuffered(currentTime)) {
          rangeCurrent = this.getBufferRange(currentTime);
        } else if (this.isBuffered(currentTime + 0.1)) {
          /* ensure that FRAG_CHANGED event is triggered at startup,
            when first video frame is displayed and playback is paused.
            add a tolerance of 100ms, in case current position is not buffered,
            check if current pos+100ms is buffered and use that buffer range
            for FRAG_CHANGED event reporting */
          rangeCurrent = this.getBufferRange(currentTime + 0.1);
        }
        if (rangeCurrent) {
          if (rangeCurrent.frag !== this.fragCurrent) {
            this.fragCurrent = rangeCurrent.frag;
            _observer2['default'].trigger(_events2['default'].FRAG_CHANGED, { frag: this.fragCurrent });
          }
          // if stream is VOD (not live) and we reach End of Stream
          var level = this.levels[this.level];
          if (level && level.details && !level.details.live && this.video.duration - currentTime < 0.2) {
            if (this.mediaSource && this.mediaSource.readyState === 'open') {
              _utilsLogger.logger.log('end of VoD stream reached, signal endOfStream() to MediaSource');
              this.startPosition = this.lastCurrentTime = 0;
              this.video = null;
              this.mediaSource.endOfStream();
            }
          }
        }
      }
    }

    /*
      abort any buffer append in progress, and flush all buffered data
      return true once everything has been flushed.
      sourceBuffer.abort() and sourceBuffer.remove() are asynchronous operations
      the idea is to call this function from tick() timer and call it again until all resources have been cleaned
      the timer is rearmed upon sourceBuffer updateend() event, so this should be optimal
    */
  }, {
    key: 'flushBuffer',
    value: function flushBuffer(startOffset, endOffset) {
      var sb, i, bufStart, bufEnd, flushStart, flushEnd;
      //logger.log('flushBuffer,pos/start/end: ' + this.video.currentTime + '/' + startOffset + '/' + endOffset);
      // safeguard to avoid infinite looping
      if (this.flushBufferCounter++ < 2 * this.bufferRange.length && this.sourceBuffer) {
        for (var type in this.sourceBuffer) {
          sb = this.sourceBuffer[type];
          if (!sb.updating) {
            for (i = 0; i < sb.buffered.length; i++) {
              bufStart = sb.buffered.start(i);
              bufEnd = sb.buffered.end(i);
              // workaround firefox not able to properly flush multiple buffered range.
              if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1 && endOffset === Number.POSITIVE_INFINITY) {
                flushStart = startOffset;
                flushEnd = endOffset;
              } else {
                flushStart = Math.max(bufStart, startOffset);
                flushEnd = Math.min(bufEnd, endOffset);
              }
              /* sometimes sourcebuffer.remove() does not flush
                 the exact expected time range.
                 to avoid rounding issues/infinite loop,
                 only flush buffer range of length greater than 500ms.
              */
              if (flushEnd - flushStart > 0.5) {
                _utilsLogger.logger.log('flush ' + type + ' [' + flushStart + ',' + flushEnd + '], of [' + bufStart + ',' + bufEnd + '], pos:' + this.video.currentTime);
                sb.remove(flushStart, flushEnd);
                return false;
              }
            }
          } else {
            //logger.log('abort ' + type + ' append in progress');
            // this will abort any appending in progress
            //sb.abort();
            return false;
          }
        }
      }

      /* after successful buffer flushing, rebuild buffer Range array
        loop through existing buffer range and check if
        corresponding range is still buffered. only push to new array already buffered range
      */
      var newRange = [],
          range;
      for (i = 0; i < this.bufferRange.length; i++) {
        range = this.bufferRange[i];
        if (this.isBuffered((range.start + range.end) / 2)) {
          newRange.push(range);
        }
      }
      this.bufferRange = newRange;

      _utilsLogger.logger.log('buffer flushed');
      // everything flushed !
      return true;
    }

    /*
      on immediate level switch :
       - pause playback if playing
       - cancel any pending load request
       - and trigger a buffer flush
    */
  }, {
    key: 'immediateLevelSwitch',
    value: function immediateLevelSwitch() {
      _utilsLogger.logger.log('immediateLevelSwitch');
      if (!this.immediateSwitch) {
        this.immediateSwitch = true;
        this.previouslyPaused = this.video.paused;
        this.video.pause();
      }
      if (this.frag && this.frag.loader) {
        this.frag.loader.abort();
      }
      this.frag = null;
      // flush everything
      this.flushBufferCounter = 0;
      this.flushRange.push({ start: 0, end: Number.POSITIVE_INFINITY });
      // trigger a sourceBuffer flush
      this.state = this.BUFFER_FLUSHING;
      // increase fragment load Index to avoid frag loop loading error after buffer flush
      this.fragLoadIdx += 2 * this.config.fragLoadingLoopThreshold;
      // speed up switching, trigger timer function
      this.tick();
    }

    /*
       on immediate level switch end, after new fragment has been buffered :
        - nudge video decoder by slightly adjusting video currentTime
        - resume the playback if needed
    */
  }, {
    key: 'immediateLevelSwitchEnd',
    value: function immediateLevelSwitchEnd() {
      this.immediateSwitch = false;
      this.video.currentTime -= 0.0001;
      if (!this.previouslyPaused) {
        this.video.play();
      }
    }
  }, {
    key: 'nextLevelSwitch',
    value: function nextLevelSwitch() {
      /* try to switch ASAP without breaking video playback :
         in order to ensure smooth but quick level switching,
        we need to find the next flushable buffer range
        we should take into account new segment fetch time
      */
      var fetchdelay, currentRange, nextRange;

      currentRange = this.getBufferRange(this.video.currentTime);
      if (currentRange) {
        // flush buffer preceding current fragment (flush until current fragment start offset)
        // minus 1s to avoid video freezing, that could happen if we flush keyframe of current video ...
        this.flushRange.push({ start: 0, end: currentRange.start - 1 });
      }

      if (!this.video.paused) {
        // add a safety delay of 1s
        var nextLevelId = this.hls.nextLoadLevel,
            nextLevel = this.levels[nextLevelId];
        if (this.hls.stats.fragLastKbps && this.frag) {
          fetchdelay = this.frag.duration * nextLevel.bitrate / (1000 * this.hls.stats.fragLastKbps) + 1;
        } else {
          fetchdelay = 0;
        }
      } else {
        fetchdelay = 0;
      }
      //logger.log('fetchdelay:'+fetchdelay);
      // find buffer range that will be reached once new fragment will be fetched
      nextRange = this.getBufferRange(this.video.currentTime + fetchdelay);
      if (nextRange) {
        // we can flush buffer range following this one without stalling playback
        nextRange = this.followingBufferRange(nextRange);
        if (nextRange) {
          // flush position is the start position of this new buffer
          this.flushRange.push({ start: nextRange.start, end: Number.POSITIVE_INFINITY });
        }
      }
      if (this.flushRange.length) {
        this.flushBufferCounter = 0;
        // trigger a sourceBuffer flush
        this.state = this.BUFFER_FLUSHING;
        // increase fragment load Index to avoid frag loop loading error after buffer flush
        this.fragLoadIdx += 2 * this.config.fragLoadingLoopThreshold;
        // speed up switching, trigger timer function
        this.tick();
      }
    }
  }, {
    key: 'onMSEAttached',
    value: function onMSEAttached(event, data) {
      this.video = data.video;
      this.mediaSource = data.mediaSource;
      this.onvseeking = this.onVideoSeeking.bind(this);
      this.onvseeked = this.onVideoSeeked.bind(this);
      this.onvmetadata = this.onVideoMetadata.bind(this);
      this.video.addEventListener('seeking', this.onvseeking);
      this.video.addEventListener('seeked', this.onvseeked);
      this.video.addEventListener('loadedmetadata', this.onvmetadata);
      if (this.levels && this.config.autoStartLoad) {
        this.startLoad();
      }
    }
  }, {
    key: 'onMSEDetached',
    value: function onMSEDetached() {
      this.video = null;
      this.loadedmetadata = false;
      this.stop();
    }
  }, {
    key: 'onVideoSeeking',
    value: function onVideoSeeking() {
      if (this.state === this.LOADING) {
        // check if currently loaded fragment is inside buffer.
        //if outside, cancel fragment loading, otherwise do nothing
        if (this.bufferInfo(this.video.currentTime).len === 0) {
          _utilsLogger.logger.log('seeking outside of buffer while fragment load in progress, cancel fragment load');
          this.frag.loader.abort();
          this.frag = null;
          // switch to IDLE state to load new fragment
          this.state = this.IDLE;
        }
      }
      if (this.video) {
        this.lastCurrentTime = this.video.currentTime;
      }
      // avoid reporting fragment loop loading error in case user is seeking several times on same position
      if (this.fragLoadIdx !== undefined) {
        this.fragLoadIdx += 2 * this.config.fragLoadingLoopThreshold;
      }
      // tick to speed up processing
      this.tick();
    }
  }, {
    key: 'onVideoSeeked',
    value: function onVideoSeeked() {
      // tick to speed up FRAGMENT_PLAYING triggering
      this.tick();
    }
  }, {
    key: 'onVideoMetadata',
    value: function onVideoMetadata() {
      if (this.video.currentTime !== this.startPosition) {
        this.video.currentTime = this.startPosition;
      }
      this.loadedmetadata = true;
      this.tick();
    }
  }, {
    key: 'onManifestParsed',
    value: function onManifestParsed(event, data) {
      var aac = false,
          heaac = false,
          codecs;
      data.levels.forEach(function (level) {
        // detect if we have different kind of audio codecs used amongst playlists
        codecs = level.codecs;
        if (codecs) {
          if (codecs.indexOf('mp4a.40.2') !== -1) {
            aac = true;
          }
          if (codecs.indexOf('mp4a.40.5') !== -1) {
            heaac = true;
          }
        }
      });
      this.audiocodecswitch = aac && heaac;
      if (this.audiocodecswitch) {
        _utilsLogger.logger.log('both AAC/HE-AAC audio found in levels; declaring audio codec as HE-AAC');
      }
      this.levels = data.levels;
      this.startLevelLoaded = false;
      this.startFragmentRequested = false;
      if (this.video && this.config.autoStartLoad) {
        this.startLoad();
      }
    }
  }, {
    key: 'onLevelLoaded',
    value: function onLevelLoaded(event, data) {
      var newLevelDetails = data.details,
          duration = newLevelDetails.totalduration,
          newLevelId = data.level,
          newLevel = this.levels[newLevelId],
          curLevel = this.levels[this.level],
          sliding = 0;
      _utilsLogger.logger.log('level ' + newLevelId + ' loaded [' + newLevelDetails.startSN + ',' + newLevelDetails.endSN + '],duration:' + duration);
      // check if playlist is already loaded (if yes, it should be a live playlist)
      if (curLevel && curLevel.details && curLevel.details.live) {
        var curLevelDetails = curLevel.details;
        //  playlist sliding is the sum of : current playlist sliding + sliding of new playlist compared to current one
        // check sliding of updated playlist against current one :
        // and find its position in current playlist
        //logger.log("fragments[0].sn/this.level/curLevel.details.fragments[0].sn:" + fragments[0].sn + "/" + this.level + "/" + curLevel.details.fragments[0].sn);
        var SNdiff = newLevelDetails.startSN - curLevelDetails.startSN;
        if (SNdiff >= 0) {
          // positive sliding : new playlist sliding window is after previous one
          var oldfragments = curLevelDetails.fragments;
          if (SNdiff < oldfragments.length) {
            sliding = curLevelDetails.sliding + oldfragments[SNdiff].start;
          } else {
            _utilsLogger.logger.log('cannot compute sliding, no SN in common between old/new level:[' + curLevelDetails.startSN + ',' + curLevelDetails.endSN + ']/[' + newLevelDetails.startSN + ',' + newLevelDetails.endSN + ']');
            sliding = undefined;
          }
        } else {
          // negative sliding: new playlist sliding window is before previous one
          sliding = curLevelDetails.sliding - newLevelDetails.fragments[-SNdiff].start;
        }
        if (sliding) {
          _utilsLogger.logger.log('live playlist sliding:' + sliding.toFixed(3));
        }
      }
      // override level info
      newLevel.details = newLevelDetails;
      newLevel.details.sliding = sliding;
      if (this.startLevelLoaded === false) {
        // if live playlist, set start position to be fragment N-3
        if (newLevelDetails.live) {
          this.startPosition = Math.max(0, duration - 3 * newLevelDetails.targetduration);
        }
        this.nextLoadPosition = this.startPosition;
        this.startLevelLoaded = true;
      }
      // only switch batck to IDLE state if we were waiting for level to start downloading a new fragment
      if (this.state === this.WAITING_LEVEL) {
        this.state = this.IDLE;
      }
      //trigger handler right now
      this.tick();
    }
  }, {
    key: 'onFragmentLoaded',
    value: function onFragmentLoaded(event, data) {
      if (this.state === this.LOADING) {
        if (this.fragmentBitrateTest === true) {
          // switch back to IDLE state ... we just loaded a fragment to determine adequate start bitrate and initialize autoswitch algo
          this.state = this.IDLE;
          this.fragmentBitrateTest = false;
          data.stats.tparsed = data.stats.tbuffered = new Date();
          _observer2['default'].trigger(_events2['default'].FRAG_BUFFERED, { stats: data.stats, frag: this.frag });
          this.frag = null;
        } else {
          this.state = this.PARSING;
          // transmux the MPEG-TS data to ISO-BMFF segments
          this.stats = data.stats;
          var currentLevel = this.levels[this.level],
              details = currentLevel.details,
              duration = details.totalduration,
              start = this.frag.start;
          if (details.live) {
            duration += details.sliding;
            start += details.sliding;
          }
          if (this.frag.drift) {
            start += this.frag.drift;
          }
          _utilsLogger.logger.log('Demuxing      ' + this.frag.sn + ' of [' + details.startSN + ' ,' + details.endSN + '],level ' + this.level);
          this.demuxer.push(data.payload, currentLevel.audioCodec, currentLevel.videoCodec, start, this.frag.cc, this.level, duration);
        }
      }
    }
  }, {
    key: 'onInitSegment',
    value: function onInitSegment(event, data) {
      if (this.state === this.PARSING) {
        // check if codecs have been explicitely defined in the master playlist for this level;
        // if yes use these ones instead of the ones parsed from the demux
        var audioCodec = this.levels[this.level].audioCodec,
            videoCodec = this.levels[this.level].videoCodec,
            sb;
        //logger.log('playlist level A/V codecs:' + audioCodec + ',' + videoCodec);
        //logger.log('playlist codecs:' + codec);
        // if playlist does not specify codecs, use codecs found while parsing fragment
        if (audioCodec === undefined || data.audiocodec === undefined) {
          audioCodec = data.audioCodec;
        }
        if (videoCodec === undefined || data.videocodec === undefined) {
          videoCodec = data.videoCodec;
        }
        // in case several audio codecs might be used, force HE-AAC for audio (some browsers don't support audio codec switch)
        //don't do it for mono streams ...
        if (this.audiocodecswitch && data.audioChannelCount === 2 && navigator.userAgent.toLowerCase().indexOf('android') === -1 && navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
          audioCodec = 'mp4a.40.5';
        }
        if (!this.sourceBuffer) {
          this.sourceBuffer = {};
          _utilsLogger.logger.log('selected A/V codecs for sourceBuffers:' + audioCodec + ',' + videoCodec);
          // create source Buffer and link them to MediaSource
          if (audioCodec) {
            sb = this.sourceBuffer.audio = this.mediaSource.addSourceBuffer('video/mp4;codecs=' + audioCodec);
            sb.addEventListener('updateend', this.onsbue);
            sb.addEventListener('error', this.onsbe);
          }
          if (videoCodec) {
            sb = this.sourceBuffer.video = this.mediaSource.addSourceBuffer('video/mp4;codecs=' + videoCodec);
            sb.addEventListener('updateend', this.onsbue);
            sb.addEventListener('error', this.onsbe);
          }
        }
        if (audioCodec) {
          this.mp4segments.push({ type: 'audio', data: data.audioMoov });
        }
        if (videoCodec) {
          this.mp4segments.push({ type: 'video', data: data.videoMoov });
        }
        //trigger handler right now
        this.tick();
      }
    }
  }, {
    key: 'onFragmentParsing',
    value: function onFragmentParsing(event, data) {
      if (this.state === this.PARSING) {
        this.tparse2 = Date.now();
        var level = this.levels[this.level];
        if (level.details.live) {
          var fragments = this.levels[this.level].details.fragments;
          var sn0 = fragments[0].sn,
              sn1 = fragments[fragments.length - 1].sn,
              sn = this.frag.sn;
          //retrieve this.frag.sn in this.levels[this.level]
          if (sn >= sn0 && sn <= sn1) {
            level.details.sliding = data.startPTS - fragments[sn - sn0].start;
            //logger.log(`live playlist sliding:${level.details.sliding.toFixed(3)}`);
          }
        }
        _utilsLogger.logger.log('      parsed data, type/startPTS/endPTS/startDTS/endDTS/nb:' + data.type + '/' + data.startPTS.toFixed(3) + '/' + data.endPTS.toFixed(3) + '/' + data.startDTS.toFixed(3) + '/' + data.endDTS.toFixed(3) + '/' + data.nb);
        //this.frag.drift=data.startPTS-this.frag.start;
        this.frag.drift = 0;
        // if(level.details.sliding) {
        //   this.frag.drift-=level.details.sliding;
        // }
        //logger.log(`      drift:${this.frag.drift.toFixed(3)}`);
        this.mp4segments.push({ type: data.type, data: data.moof });
        this.mp4segments.push({ type: data.type, data: data.mdat });
        this.nextLoadPosition = data.endPTS;
        this.bufferRange.push({ type: data.type, start: data.startPTS, end: data.endPTS, frag: this.frag });
        // if(data.type === 'video') {
        //   this.frag.fpsExpected = (data.nb-1) / (data.endPTS - data.startPTS);
        // }
        //trigger handler right now
        this.tick();
      } else {
        _utilsLogger.logger.warn('not in PARSING state, discarding ' + event);
      }
    }
  }, {
    key: 'onFragmentParsed',
    value: function onFragmentParsed() {
      if (this.state === this.PARSING) {
        this.state = this.PARSED;
        this.stats.tparsed = new Date();
        //trigger handler right now
        this.tick();
      }
    }
  }, {
    key: 'onError',
    value: function onError(event, data) {
      switch (data.details) {
        // abort fragment loading on errors
        case _errors.ErrorDetails.FRAG_LOAD_ERROR:
        case _errors.ErrorDetails.FRAG_LOAD_TIMEOUT:
        case _errors.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
        case _errors.ErrorDetails.LEVEL_LOAD_ERROR:
        case _errors.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          // if fatal error, stop processing, otherwise move to IDLE to retry loading
          _utilsLogger.logger.warn('buffer controller: ' + data.details + ' while loading frag,switch to ' + (data.fatal ? 'ERROR' : 'IDLE') + ' state ...');
          this.state = data.fatal ? this.ERROR : this.IDLE;
          this.frag = null;
          break;
        default:
          break;
      }
    }
  }, {
    key: 'onSourceBufferUpdateEnd',
    value: function onSourceBufferUpdateEnd() {
      //trigger handler right now
      if (this.state === this.APPENDING && this.mp4segments.length === 0) {
        if (this.frag) {
          this.stats.tbuffered = new Date();
          _observer2['default'].trigger(_events2['default'].FRAG_BUFFERED, { stats: this.stats, frag: this.frag });
          this.state = this.IDLE;
        }
      }
      this.tick();
    }
  }, {
    key: 'onSourceBufferError',
    value: function onSourceBufferError(event) {
      _utilsLogger.logger.error('sourceBuffer error:' + event);
      this.state = this.ERROR;
      _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_APPENDING_ERROR, fatal: true, frag: this.frag });
    }
  }, {
    key: 'currentLevel',
    get: function get() {
      if (this.video) {
        var range = this.getBufferRange(this.video.currentTime);
        if (range) {
          return range.frag.level;
        }
      }
      return -1;
    }
  }, {
    key: 'nextBufferRange',
    get: function get() {
      if (this.video) {
        // first get end range of current fragment
        return this.followingBufferRange(this.getBufferRange(this.video.currentTime));
      } else {
        return null;
      }
    }
  }, {
    key: 'nextLevel',
    get: function get() {
      var range = this.nextBufferRange;
      if (range) {
        return range.frag.level;
      } else {
        return -1;
      }
    }
  }]);

  return BufferController;
})();

exports['default'] = BufferController;
module.exports = exports['default'];

},{"../demux/demuxer":5,"../errors":9,"../events":10,"../observer":14,"../utils/logger":17}],4:[function(require,module,exports){
/*
 * level controller
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var _utilsLogger = require('../utils/logger');

var _errors = require('../errors');

var LevelController = (function () {
  function LevelController(hls) {
    _classCallCheck(this, LevelController);

    this.hls = hls;
    this.onml = this.onManifestLoaded.bind(this);
    this.onll = this.onLevelLoaded.bind(this);
    this.onflp = this.onFragmentLoadProgress.bind(this);
    this.onerr = this.onError.bind(this);
    this.ontick = this.tick.bind(this);
    _observer2['default'].on(_events2['default'].MANIFEST_LOADED, this.onml);
    _observer2['default'].on(_events2['default'].FRAG_LOAD_PROGRESS, this.onflp);
    _observer2['default'].on(_events2['default'].LEVEL_LOADED, this.onll);
    _observer2['default'].on(_events2['default'].ERROR, this.onerr);
    this._manualLevel = this._autoLevelCapping = -1;
  }

  _createClass(LevelController, [{
    key: 'destroy',
    value: function destroy() {
      _observer2['default'].off(_events2['default'].MANIFEST_LOADED, this.onml);
      _observer2['default'].off(_events2['default'].FRAG_LOAD_PROGRESS, this.onflp);
      _observer2['default'].off(_events2['default'].LEVEL_LOADED, this.onll);
      _observer2['default'].off(_events2['default'].ERROR, this.onerr);
      if (this.timer) {
        clearInterval(this.timer);
      }
      this._manualLevel = -1;
    }
  }, {
    key: 'onManifestLoaded',
    value: function onManifestLoaded(event, data) {
      var levels = [],
          bitrateStart,
          i,
          bitrateSet = {};
      data.levels.forEach(function (level) {
        var redundantLevelId = bitrateSet[level.bitrate];
        if (redundantLevelId === undefined) {
          bitrateSet[level.bitrate] = levels.length;
          level.url = [level.url];
          level.urlId = 0;
          levels.push(level);
        } else {
          levels[redundantLevelId].url.push(level.url);
        }
      });
      // start bitrate is the first bitrate of the manifest
      bitrateStart = levels[0].bitrate;
      // sort level on bitrate
      levels.sort(function (a, b) {
        return a.bitrate - b.bitrate;
      });
      this._levels = levels;

      // find index of first level in sorted levels
      for (i = 0; i < levels.length; i++) {
        if (levels[i].bitrate === bitrateStart) {
          this._firstLevel = i;
          _utilsLogger.logger.log('manifest loaded,' + levels.length + ' level(s) found, first bitrate:' + bitrateStart);
          break;
        }
      }
      _observer2['default'].trigger(_events2['default'].MANIFEST_PARSED, { levels: this._levels,
        firstLevel: this._firstLevel,
        stats: data.stats
      });
      return;
    }
  }, {
    key: 'setLevelInternal',
    value: function setLevelInternal(newLevel) {
      // check if level idx is valid
      if (newLevel >= 0 && newLevel < this._levels.length) {
        // stopping live reloading timer if any
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
        this._level = newLevel;
        _utilsLogger.logger.log('switching to level ' + newLevel);
        _observer2['default'].trigger(_events2['default'].LEVEL_SWITCH, { level: newLevel });
        var level = this._levels[newLevel];
        // check if we need to load playlist for this level
        if (level.details === undefined || level.details.live === true) {
          // level not retrieved yet, or live playlist we need to (re)load it
          _utilsLogger.logger.log('(re)loading playlist for level ' + newLevel);
          var urlId = level.urlId;
          _observer2['default'].trigger(_events2['default'].LEVEL_LOADING, { url: level.url[urlId], level: newLevel, id: urlId });
        }
      } else {
        // invalid level id given, trigger error
        _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.OTHER_ERROR, details: _errors.ErrorDetails.LEVEL_SWITCH_ERROR, level: newLevel, fatal: false, reason: 'invalid level idx' });
      }
    }
  }, {
    key: 'onFragmentLoadProgress',
    value: function onFragmentLoadProgress(event, data) {
      var stats = data.stats;
      if (stats.aborted === undefined) {
        this.lastfetchduration = (new Date() - stats.trequest) / 1000;
        this.lastfetchlevel = data.frag.level;
        this.lastbw = stats.loaded * 8 / this.lastfetchduration;
        //console.log(`fetchDuration:${this.lastfetchduration},bw:${(this.lastbw/1000).toFixed(0)}/${stats.aborted}`);
      }
    }
  }, {
    key: 'onError',
    value: function onError(event, data) {
      var details = data.details,
          levelId,
          level;
      // try to recover not fatal errors
      switch (details) {
        case _errors.ErrorDetails.FRAG_LOAD_ERROR:
        case _errors.ErrorDetails.FRAG_LOAD_TIMEOUT:
        case _errors.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
          levelId = data.frag.level;
          break;
        case _errors.ErrorDetails.LEVEL_LOAD_ERROR:
        case _errors.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          levelId = data.level;
          break;
        default:
          break;
      }
      /* try to switch to a redundant stream if any available.
       * if no redundant stream available, emergency switch down (if in auto mode and current level not 0)
       * otherwise, we cannot recover this network error ....
       */
      if (levelId !== undefined) {
        level = this._levels[levelId];
        if (level.urlId < level.url.length - 1) {
          level.urlId++;
          level.details = undefined;
          _utilsLogger.logger.warn('level controller,' + details + ' for level ' + levelId + ': switching to redundant stream id ' + level.urlId);
        } else {
          // we could try to recover if in auto mode and current level not lowest level (0)
          var recoverable = this._manualLevel === -1 && levelId;
          if (recoverable) {
            _utilsLogger.logger.warn('level controller,' + details + ': emergency switch-down for next fragment');
            this.lastbw = 0;
            this.lastfetchduration = 0;
          } else {
            _utilsLogger.logger.error('cannot recover ' + details + ' error');
            this._level = undefined;
            // stopping live reloading timer if any
            if (this.timer) {
              clearInterval(this.timer);
              this.timer = null;
              // redispatch same error but with fatal set to true
              data.fatal = true;
              _observer2['default'].trigger(event, data);
            }
          }
        }
      }
    }
  }, {
    key: 'onLevelLoaded',
    value: function onLevelLoaded(event, data) {
      // check if current playlist is a live playlist
      if (data.details.live && !this.timer) {
        // if live playlist we will have to reload it periodically
        // set reload period to playlist target duration
        this.timer = setInterval(this.ontick, 1000 * data.details.targetduration);
      }
    }
  }, {
    key: 'tick',
    value: function tick() {
      var levelId = this._level;
      if (levelId !== undefined) {
        var level = this._levels[levelId],
            urlId = level.urlId;
        _observer2['default'].trigger(_events2['default'].LEVEL_LOADING, { url: level.url[urlId], level: levelId, id: urlId });
      }
    }
  }, {
    key: 'nextLoadLevel',
    value: function nextLoadLevel() {
      if (this._manualLevel !== -1) {
        return this._manualLevel;
      } else {
        return this.nextAutoLevel();
      }
    }
  }, {
    key: 'nextAutoLevel',
    value: function nextAutoLevel() {
      var lastbw = this.lastbw,
          adjustedbw,
          i,
          maxAutoLevel;
      if (this._autoLevelCapping === -1) {
        maxAutoLevel = this._levels.length - 1;
      } else {
        maxAutoLevel = this._autoLevelCapping;
      }
      // follow algorithm captured from stagefright :
      // https://android.googlesource.com/platform/frameworks/av/+/master/media/libstagefright/httplive/LiveSession.cpp
      // Pick the highest bandwidth stream below or equal to estimated bandwidth.
      for (i = 0; i <= maxAutoLevel; i++) {
        // consider only 80% of the available bandwidth, but if we are switching up,
        // be even more conservative (70%) to avoid overestimating and immediately
        // switching back.
        if (i <= this._level) {
          adjustedbw = 0.8 * lastbw;
        } else {
          adjustedbw = 0.7 * lastbw;
        }
        if (adjustedbw < this._levels[i].bitrate) {
          return Math.max(0, i - 1);
        }
      }
      return i - 1;
    }
  }, {
    key: 'levels',
    get: function get() {
      return this._levels;
    }
  }, {
    key: 'level',
    get: function get() {
      return this._level;
    },
    set: function set(newLevel) {
      if (this._level !== newLevel || this._levels[newLevel].details === undefined) {
        this.setLevelInternal(newLevel);
      }
    }
  }, {
    key: 'manualLevel',
    get: function get() {
      return this._manualLevel;
    },
    set: function set(newLevel) {
      this._manualLevel = newLevel;
      if (newLevel !== -1) {
        this.level = newLevel;
      }
    }

    /** Return the capping/max level value that could be used by automatic level selection algorithm **/
  }, {
    key: 'autoLevelCapping',
    get: function get() {
      return this._autoLevelCapping;
    },

    /** set the capping/max level value that could be used by automatic level selection algorithm **/
    set: function set(newLevel) {
      this._autoLevelCapping = newLevel;
    }
  }, {
    key: 'firstLevel',
    get: function get() {
      return this._firstLevel;
    },
    set: function set(newLevel) {
      this._firstLevel = newLevel;
    }
  }, {
    key: 'startLevel',
    get: function get() {
      if (this._startLevel === undefined) {
        return this._firstLevel;
      } else {
        return this._startLevel;
      }
    },
    set: function set(newLevel) {
      this._startLevel = newLevel;
    }
  }]);

  return LevelController;
})();

exports['default'] = LevelController;
module.exports = exports['default'];

},{"../errors":9,"../events":10,"../observer":14,"../utils/logger":17}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _tsdemuxer = require('./tsdemuxer');

var _tsdemuxer2 = _interopRequireDefault(_tsdemuxer);

var _tsdemuxerworker = require('./tsdemuxerworker');

var _tsdemuxerworker2 = _interopRequireDefault(_tsdemuxerworker);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var _utilsLogger = require('../utils/logger');

var Demuxer = (function () {
  function Demuxer(config) {
    _classCallCheck(this, Demuxer);

    if (config.enableWorker && typeof Worker !== 'undefined') {
      _utilsLogger.logger.log('TS demuxing in webworker');
      try {
        var work = require('webworkify');
        this.w = work(_tsdemuxerworker2['default']);
        this.onwmsg = this.onWorkerMessage.bind(this);
        this.w.addEventListener('message', this.onwmsg);
        this.w.postMessage({ cmd: 'init' });
      } catch (err) {
        _utilsLogger.logger.error('error while initializing TSDemuxerWorker, fallback on regular TSDemuxer');
        this.demuxer = new _tsdemuxer2['default']();
      }
    } else {
      this.demuxer = new _tsdemuxer2['default']();
    }
    this.demuxInitialized = true;
  }

  _createClass(Demuxer, [{
    key: 'destroy',
    value: function destroy() {
      if (this.w) {
        this.w.removeEventListener('message', this.onwmsg);
        this.w.terminate();
        this.w = null;
      } else {
        this.demuxer.destroy();
      }
    }
  }, {
    key: 'push',
    value: function push(data, audioCodec, videoCodec, timeOffset, cc, level, duration) {
      if (this.w) {
        // post fragment payload as transferable objects (no copy)
        this.w.postMessage({ cmd: 'demux', data: data, audioCodec: audioCodec, videoCodec: videoCodec, timeOffset: timeOffset, cc: cc, level: level, duration: duration }, [data]);
      } else {
        this.demuxer.push(new Uint8Array(data), audioCodec, videoCodec, timeOffset, cc, level, duration);
        this.demuxer.end();
      }
    }
  }, {
    key: 'onWorkerMessage',
    value: function onWorkerMessage(ev) {
      //console.log('onWorkerMessage:' + ev.data.event);
      switch (ev.data.event) {
        case _events2['default'].FRAG_PARSING_INIT_SEGMENT:
          var obj = {};
          if (ev.data.audioMoov) {
            obj.audioMoov = new Uint8Array(ev.data.audioMoov);
            obj.audioCodec = ev.data.audioCodec;
            obj.audioChannelCount = ev.data.audioChannelCount;
          }
          if (ev.data.videoMoov) {
            obj.videoMoov = new Uint8Array(ev.data.videoMoov);
            obj.videoCodec = ev.data.videoCodec;
            obj.videoWidth = ev.data.videoWidth;
            obj.videoHeight = ev.data.videoHeight;
          }
          _observer2['default'].trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, obj);
          break;
        case _events2['default'].FRAG_PARSING_DATA:
          _observer2['default'].trigger(_events2['default'].FRAG_PARSING_DATA, {
            moof: new Uint8Array(ev.data.moof),
            mdat: new Uint8Array(ev.data.mdat),
            startPTS: ev.data.startPTS,
            endPTS: ev.data.endPTS,
            startDTS: ev.data.startDTS,
            endDTS: ev.data.endDTS,
            type: ev.data.type,
            nb: ev.data.nb
          });
          break;
        default:
          _observer2['default'].trigger(ev.data.event, ev.data.data);
          break;
      }
    }
  }]);

  return Demuxer;
})();

exports['default'] = Demuxer;
module.exports = exports['default'];

},{"../events":10,"../observer":14,"../utils/logger":17,"./tsdemuxer":7,"./tsdemuxerworker":8,"webworkify":2}],6:[function(require,module,exports){
/**
 * Parser for exponential Golomb codes, a variable-bitwidth number encoding
 * scheme used by h264.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

var ExpGolomb = (function () {
  function ExpGolomb(data) {
    _classCallCheck(this, ExpGolomb);

    this.data = data;
    // the number of bytes left to examine in this.data
    this.bytesAvailable = this.data.byteLength;
    // the current word being examined
    this.word = 0; // :uint
    // the number of bits left to examine in the current word
    this.bitsAvailable = 0; // :uint
  }

  // ():void

  _createClass(ExpGolomb, [{
    key: 'loadWord',
    value: function loadWord() {
      var position = this.data.byteLength - this.bytesAvailable,
          workingBytes = new Uint8Array(4),
          availableBytes = Math.min(4, this.bytesAvailable);

      if (availableBytes === 0) {
        throw new Error('no bytes available');
      }

      workingBytes.set(this.data.subarray(position, position + availableBytes));
      this.word = new DataView(workingBytes.buffer).getUint32(0);

      // track the amount of this.data that has been processed
      this.bitsAvailable = availableBytes * 8;
      this.bytesAvailable -= availableBytes;
    }

    // (count:int):void
  }, {
    key: 'skipBits',
    value: function skipBits(count) {
      var skipBytes; // :int
      if (this.bitsAvailable > count) {
        this.word <<= count;
        this.bitsAvailable -= count;
      } else {
        count -= this.bitsAvailable;
        skipBytes = count >> 3;

        count -= skipBytes >> 3;
        this.bytesAvailable -= skipBytes;

        this.loadWord();

        this.word <<= count;
        this.bitsAvailable -= count;
      }
    }

    // (size:int):uint
  }, {
    key: 'readBits',
    value: function readBits(size) {
      var bits = Math.min(this.bitsAvailable, size),
          // :uint
      valu = this.word >>> 32 - bits; // :uint

      if (size > 32) {
        _utilsLogger.logger.error('Cannot read more than 32 bits at a time');
      }

      this.bitsAvailable -= bits;
      if (this.bitsAvailable > 0) {
        this.word <<= bits;
      } else if (this.bytesAvailable > 0) {
        this.loadWord();
      }

      bits = size - bits;
      if (bits > 0) {
        return valu << bits | this.readBits(bits);
      } else {
        return valu;
      }
    }

    // ():uint
  }, {
    key: 'skipLZ',
    value: function skipLZ() {
      var leadingZeroCount; // :uint
      for (leadingZeroCount = 0; leadingZeroCount < this.bitsAvailable; ++leadingZeroCount) {
        if (0 !== (this.word & 0x80000000 >>> leadingZeroCount)) {
          // the first bit of working word is 1
          this.word <<= leadingZeroCount;
          this.bitsAvailable -= leadingZeroCount;
          return leadingZeroCount;
        }
      }

      // we exhausted word and still have not found a 1
      this.loadWord();
      return leadingZeroCount + this.skipLZ();
    }

    // ():void
  }, {
    key: 'skipUEG',
    value: function skipUEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():void
  }, {
    key: 'skipEG',
    value: function skipEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():uint
  }, {
    key: 'readUEG',
    value: function readUEG() {
      var clz = this.skipLZ(); // :uint
      return this.readBits(clz + 1) - 1;
    }

    // ():int
  }, {
    key: 'readEG',
    value: function readEG() {
      var valu = this.readUEG(); // :int
      if (0x01 & valu) {
        // the number is odd if the low order bit is set
        return 1 + valu >>> 1; // add 1 to make it even, and divide by 2
      } else {
          return -1 * (valu >>> 1); // divide by two then make it negative
        }
    }

    // Some convenience functions
    // :Boolean
  }, {
    key: 'readBoolean',
    value: function readBoolean() {
      return 1 === this.readBits(1);
    }

    // ():int
  }, {
    key: 'readUByte',
    value: function readUByte() {
      return this.readBits(8);
    }

    /**
     * Advance the ExpGolomb decoder past a scaling list. The scaling
     * list is optionally transmitted as part of a sequence parameter
     * set and is not relevant to transmuxing.
     * @param count {number} the number of entries in this scaling list
     * @see Recommendation ITU-T H.264, Section 7.3.2.1.1.1
     */
  }, {
    key: 'skipScalingList',
    value: function skipScalingList(count) {
      var lastScale = 8,
          nextScale = 8,
          j,
          deltaScale;

      for (j = 0; j < count; j++) {
        if (nextScale !== 0) {
          deltaScale = this.readEG();
          nextScale = (lastScale + deltaScale + 256) % 256;
        }

        lastScale = nextScale === 0 ? lastScale : nextScale;
      }
    }

    /**
     * Read a sequence parameter set and return some interesting video
     * properties. A sequence parameter set is the H264 metadata that
     * describes the properties of upcoming video frames.
     * @param data {Uint8Array} the bytes of a sequence parameter set
     * @return {object} an object with configuration parsed from the
     * sequence parameter set, including the dimensions of the
     * associated video frames.
     */
  }, {
    key: 'readSPS',
    value: function readSPS() {
      var frameCropLeftOffset = 0,
          frameCropRightOffset = 0,
          frameCropTopOffset = 0,
          frameCropBottomOffset = 0,
          profileIdc,
          profileCompat,
          levelIdc,
          numRefFramesInPicOrderCntCycle,
          picWidthInMbsMinus1,
          picHeightInMapUnitsMinus1,
          frameMbsOnlyFlag,
          scalingListCount,
          i;

      this.readUByte();
      profileIdc = this.readUByte(); // profile_idc
      profileCompat = this.readBits(5); // constraint_set[0-4]_flag, u(5)
      this.skipBits(3); // reserved_zero_3bits u(3),
      levelIdc = this.readUByte(); //level_idc u(8)
      this.skipUEG(); // seq_parameter_set_id

      // some profiles have more optional data we don't need
      if (profileIdc === 100 || profileIdc === 110 || profileIdc === 122 || profileIdc === 144) {
        var chromaFormatIdc = this.readUEG();
        if (chromaFormatIdc === 3) {
          this.skipBits(1); // separate_colour_plane_flag
        }
        this.skipUEG(); // bit_depth_luma_minus8
        this.skipUEG(); // bit_depth_chroma_minus8
        this.skipBits(1); // qpprime_y_zero_transform_bypass_flag
        if (this.readBoolean()) {
          // seq_scaling_matrix_present_flag
          scalingListCount = chromaFormatIdc !== 3 ? 8 : 12;
          for (i = 0; i < scalingListCount; i++) {
            if (this.readBoolean()) {
              // seq_scaling_list_present_flag[ i ]
              if (i < 6) {
                this.skipScalingList(16);
              } else {
                this.skipScalingList(64);
              }
            }
          }
        }
      }

      this.skipUEG(); // log2_max_frame_num_minus4
      var picOrderCntType = this.readUEG();

      if (picOrderCntType === 0) {
        this.readUEG(); //log2_max_pic_order_cnt_lsb_minus4
      } else if (picOrderCntType === 1) {
          this.skipBits(1); // delta_pic_order_always_zero_flag
          this.skipEG(); // offset_for_non_ref_pic
          this.skipEG(); // offset_for_top_to_bottom_field
          numRefFramesInPicOrderCntCycle = this.readUEG();
          for (i = 0; i < numRefFramesInPicOrderCntCycle; i++) {
            this.skipEG(); // offset_for_ref_frame[ i ]
          }
        }

      this.skipUEG(); // max_num_ref_frames
      this.skipBits(1); // gaps_in_frame_num_value_allowed_flag

      picWidthInMbsMinus1 = this.readUEG();
      picHeightInMapUnitsMinus1 = this.readUEG();

      frameMbsOnlyFlag = this.readBits(1);
      if (frameMbsOnlyFlag === 0) {
        this.skipBits(1); // mb_adaptive_frame_field_flag
      }

      this.skipBits(1); // direct_8x8_inference_flag
      if (this.readBoolean()) {
        // frame_cropping_flag
        frameCropLeftOffset = this.readUEG();
        frameCropRightOffset = this.readUEG();
        frameCropTopOffset = this.readUEG();
        frameCropBottomOffset = this.readUEG();
      }

      return {
        profileIdc: profileIdc,
        profileCompat: profileCompat,
        levelIdc: levelIdc,
        width: (picWidthInMbsMinus1 + 1) * 16 - frameCropLeftOffset * 2 - frameCropRightOffset * 2,
        height: (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - frameCropTopOffset * 2 - frameCropBottomOffset * 2
      };
    }
  }]);

  return ExpGolomb;
})();

exports['default'] = ExpGolomb;
module.exports = exports['default'];

},{"../utils/logger":17}],7:[function(require,module,exports){
/**
 * A stream-based mp2ts to mp4 converter. This utility is used to
 * deliver mp4s to a SourceBuffer on platforms that support native
 * Media Source Extensions.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _expGolomb = require('./exp-golomb');

var _expGolomb2 = _interopRequireDefault(_expGolomb);

// import Hex             from '../utils/hex';

var _remuxMp4Generator = require('../remux/mp4-generator');

var _remuxMp4Generator2 = _interopRequireDefault(_remuxMp4Generator);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var _utilsLogger = require('../utils/logger');

var _errors = require('../errors');

var TSDemuxer = (function () {
  function TSDemuxer() {
    _classCallCheck(this, TSDemuxer);

    this.lastCC = 0;
    this.PES_TIMESCALE = 90000;
    this.PES2MP4SCALEFACTOR = 4;
    this.MP4_TIMESCALE = this.PES_TIMESCALE / this.PES2MP4SCALEFACTOR;
  }

  _createClass(TSDemuxer, [{
    key: 'switchLevel',
    value: function switchLevel() {
      this.pmtParsed = false;
      this._pmtId = this._avcId = this._aacId = -1;
      this._avcTrack = { type: 'video', sequenceNumber: 0 };
      this._aacTrack = { type: 'audio', sequenceNumber: 0 };
      this._avcSamples = [];
      this._avcSamplesLength = 0;
      this._avcSamplesNbNalu = 0;
      this._aacSamples = [];
      this._aacSamplesLength = 0;
      this._initSegGenerated = false;
    }
  }, {
    key: 'insertDiscontinuity',
    value: function insertDiscontinuity() {
      this.switchLevel();
      this._initPTS = this._initDTS = undefined;
    }

    // feed incoming data to the front of the parsing pipeline
  }, {
    key: 'push',
    value: function push(data, audioCodec, videoCodec, timeOffset, cc, level, duration) {
      var avcData,
          aacData,
          start,
          len = data.length,
          stt,
          pid,
          atf,
          offset;
      this.audioCodec = audioCodec;
      this.videoCodec = videoCodec;
      this.timeOffset = timeOffset;
      this._duration = duration;
      if (cc !== this.lastCC) {
        _utilsLogger.logger.log('discontinuity detected');
        this.insertDiscontinuity();
        this.lastCC = cc;
      } else if (level !== this.lastLevel) {
        _utilsLogger.logger.log('level switch detected');
        this.switchLevel();
        this.lastLevel = level;
      }
      var pmtParsed = this.pmtParsed,
          avcId = this._avcId,
          aacId = this._aacId;

      // loop through TS packets
      for (start = 0; start < len; start += 188) {
        if (data[start] === 0x47) {
          stt = !!(data[start + 1] & 0x40);
          // pid is a 13-bit field starting at the last bit of TS[1]
          pid = ((data[start + 1] & 0x1f) << 8) + data[start + 2];
          atf = (data[start + 3] & 0x30) >> 4;
          // if an adaption field is present, its length is specified by the fifth byte of the TS packet header.
          if (atf > 1) {
            offset = start + 5 + data[start + 4];
            // continue if there is only adaptation field
            if (offset === start + 188) {
              continue;
            }
          } else {
            offset = start + 4;
          }
          if (pmtParsed) {
            if (pid === avcId) {
              if (stt) {
                if (avcData) {
                  this._parseAVCPES(this._parsePES(avcData));
                }
                avcData = { data: [], size: 0 };
              }
              if (avcData) {
                avcData.data.push(data.subarray(offset, start + 188));
                avcData.size += start + 188 - offset;
              }
            } else if (pid === aacId) {
              if (stt) {
                if (aacData) {
                  this._parseAACPES(this._parsePES(aacData));
                }
                aacData = { data: [], size: 0 };
              }
              if (aacData) {
                aacData.data.push(data.subarray(offset, start + 188));
                aacData.size += start + 188 - offset;
              }
            }
          } else {
            if (stt) {
              offset += data[offset] + 1;
            }
            if (pid === 0) {
              this._parsePAT(data, offset);
            } else if (pid === this._pmtId) {
              this._parsePMT(data, offset);
              pmtParsed = this.pmtParsed = true;
              avcId = this._avcId;
              aacId = this._aacId;
            }
          }
        } else {
          _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: false, reason: 'TS packet did not start with 0x47' });
        }
      }
      // parse last PES packet
      if (avcData) {
        this._parseAVCPES(this._parsePES(avcData));
      }
      if (aacData) {
        this._parseAACPES(this._parsePES(aacData));
      }
    }
  }, {
    key: 'end',
    value: function end() {
      // generate Init Segment if needed
      if (!this._initSegGenerated) {
        this._generateInitSegment();
      }
      //logger.log('nb AVC samples:' + this._avcSamples.length);
      if (this._avcSamples.length) {
        this._flushAVCSamples();
      }
      //logger.log('nb AAC samples:' + this._aacSamples.length);
      if (this._aacSamples.length) {
        this._flushAACSamples();
      }
      //notify end of parsing
      _observer2['default'].trigger(_events2['default'].FRAG_PARSED);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.switchLevel();
      this._initPTS = this._initDTS = undefined;
      this._duration = 0;
    }
  }, {
    key: '_parsePAT',
    value: function _parsePAT(data, offset) {
      // skip the PSI header and parse the first PMT entry
      this._pmtId = (data[offset + 10] & 0x1F) << 8 | data[offset + 11];
      //logger.log('PMT PID:'  + this._pmtId);
    }
  }, {
    key: '_parsePMT',
    value: function _parsePMT(data, offset) {
      var sectionLength, tableEnd, programInfoLength, pid;
      sectionLength = (data[offset + 1] & 0x0f) << 8 | data[offset + 2];
      tableEnd = offset + 3 + sectionLength - 4;
      // to determine where the table is, we have to figure out how
      // long the program info descriptors are
      programInfoLength = (data[offset + 10] & 0x0f) << 8 | data[offset + 11];

      // advance the offset to the first entry in the mapping table
      offset += 12 + programInfoLength;
      while (offset < tableEnd) {
        pid = (data[offset + 1] & 0x1F) << 8 | data[offset + 2];
        switch (data[offset]) {
          // ISO/IEC 13818-7 ADTS AAC (MPEG-2 lower bit-rate audio)
          case 0x0f:
            //logger.log('AAC PID:'  + pid);
            this._aacId = pid;
            this._aacTrack.id = pid;
            break;
          // ITU-T Rec. H.264 and ISO/IEC 14496-10 (lower bit-rate video)
          case 0x1b:
            //logger.log('AVC PID:'  + pid);
            this._avcId = pid;
            this._avcTrack.id = pid;
            break;
          default:
            _utilsLogger.logger.log('unkown stream type:' + data[offset]);
            break;
        }
        // move to the next table entry
        // skip past the elementary stream descriptors, if present
        offset += ((data[offset + 3] & 0x0F) << 8 | data[offset + 4]) + 5;
      }
    }
  }, {
    key: '_parsePES',
    value: function _parsePES(stream) {
      var i = 0,
          frag,
          pesFlags,
          pesPrefix,
          pesLen,
          pesHdrLen,
          pesData,
          pesPts,
          pesDts,
          payloadStartOffset;
      //retrieve PTS/DTS from first fragment
      frag = stream.data[0];
      pesPrefix = (frag[0] << 16) + (frag[1] << 8) + frag[2];
      if (pesPrefix === 1) {
        pesLen = (frag[4] << 8) + frag[5];
        pesFlags = frag[7];
        if (pesFlags & 0xC0) {
          /* PES header described here : http://dvd.sourceforge.net/dvdinfo/pes-hdr.html
              as PTS / DTS is 33 bit we cannot use bitwise operator in JS,
              as Bitwise operators treat their operands as a sequence of 32 bits */
          pesPts = (frag[9] & 0x0E) * 536870912 + // 1 << 29
          (frag[10] & 0xFF) * 4194304 + // 1 << 22
          (frag[11] & 0xFE) * 16384 + // 1 << 14
          (frag[12] & 0xFF) * 128 + // 1 << 7
          (frag[13] & 0xFE) / 2;
          // check if greater than 2^32 -1
          if (pesPts > 4294967295) {
            // decrement 2^33
            pesPts -= 8589934592;
          }
          if (pesFlags & 0x40) {
            pesDts = (frag[14] & 0x0E) * 536870912 + // 1 << 29
            (frag[15] & 0xFF) * 4194304 + // 1 << 22
            (frag[16] & 0xFE) * 16384 + // 1 << 14
            (frag[17] & 0xFF) * 128 + // 1 << 7
            (frag[18] & 0xFE) / 2;
            // check if greater than 2^32 -1
            if (pesDts > 4294967295) {
              // decrement 2^33
              pesDts -= 8589934592;
            }
          } else {
            pesDts = pesPts;
          }
        }
        pesHdrLen = frag[8];
        payloadStartOffset = pesHdrLen + 9;
        // trim PES header
        stream.data[0] = stream.data[0].subarray(payloadStartOffset);
        stream.size -= payloadStartOffset;
        //reassemble PES packet
        pesData = new Uint8Array(stream.size);
        // reassemble the packet
        while (stream.data.length) {
          frag = stream.data.shift();
          pesData.set(frag, i);
          i += frag.byteLength;
        }
        return { data: pesData, pts: pesPts, dts: pesDts, len: pesLen };
      } else {
        return null;
      }
    }
  }, {
    key: '_parseAVCPES',
    value: function _parseAVCPES(pes) {
      var _this = this;

      var units,
          track = this._avcTrack,
          avcSample,
          key = false;
      units = this._parseAVCNALu(pes.data);
      // no NALu found
      if (units.length === 0 & this._avcSamples.length > 0) {
        // append pes.data to previous NAL unit
        var lastavcSample = this._avcSamples[this._avcSamples.length - 1];
        var lastUnit = lastavcSample.units.units[lastavcSample.units.units.length - 1];
        var tmp = new Uint8Array(lastUnit.data.byteLength + pes.data.byteLength);
        tmp.set(lastUnit.data, 0);
        tmp.set(pes.data, lastUnit.data.byteLength);
        lastUnit.data = tmp;
        lastavcSample.units.length += pes.data.byteLength;
        this._avcSamplesLength += pes.data.byteLength;
      }
      //free pes.data to save up some memory
      pes.data = null;
      units.units.forEach(function (unit) {
        switch (unit.type) {
          //IDR
          case 5:
            key = true;
            break;
          //SPS
          case 7:
            if (!track.sps) {
              var expGolombDecoder = new _expGolomb2['default'](unit.data);
              var config = expGolombDecoder.readSPS();
              track.width = config.width;
              track.height = config.height;
              track.profileIdc = config.profileIdc;
              track.profileCompat = config.profileCompat;
              track.levelIdc = config.levelIdc;
              track.sps = [unit.data];
              track.timescale = _this.MP4_TIMESCALE;
              track.duration = _this.MP4_TIMESCALE * _this._duration;
              var codecarray = unit.data.subarray(1, 4);
              var codecstring = 'avc1.';
              for (var i = 0; i < 3; i++) {
                var h = codecarray[i].toString(16);
                if (h.length < 2) {
                  h = '0' + h;
                }
                codecstring += h;
              }
              track.codec = codecstring;
            }
            break;
          //PPS
          case 8:
            if (!track.pps) {
              track.pps = [unit.data];
            }
            break;
          default:
            break;
        }
      });
      //build sample from PES
      // Annex B to MP4 conversion to be done
      if (units.length) {
        avcSample = { units: units, pts: pes.pts, dts: pes.dts, key: key };
        this._avcSamples.push(avcSample);
        this._avcSamplesLength += units.length;
        this._avcSamplesNbNalu += units.units.length;
      }
    }
  }, {
    key: '_flushAVCSamples',
    value: function _flushAVCSamples() {
      var view,
          i = 8,
          avcSample,
          mp4Sample,
          mp4SampleLength,
          unit,
          track = this._avcTrack,
          lastSampleDTS,
          mdat,
          moof,
          firstPTS,
          firstDTS,
          pts,
          dts,
          ptsnorm,
          dtsnorm,
          samples = [];

      /* concatenate the video data and construct the mdat in place
        (need 8 more bytes to fill length and mpdat type) */
      mdat = new Uint8Array(this._avcSamplesLength + 4 * this._avcSamplesNbNalu + 8);
      view = new DataView(mdat.buffer);
      view.setUint32(0, mdat.byteLength);
      mdat.set(_remuxMp4Generator2['default'].types.mdat, 4);
      while (this._avcSamples.length) {
        avcSample = this._avcSamples.shift();
        mp4SampleLength = 0;

        // convert NALU bitstream to MP4 format (prepend NALU with size field)
        while (avcSample.units.units.length) {
          unit = avcSample.units.units.shift();
          view.setUint32(i, unit.data.byteLength);
          i += 4;
          mdat.set(unit.data, i);
          i += unit.data.byteLength;
          mp4SampleLength += 4 + unit.data.byteLength;
        }
        pts = avcSample.pts - this._initDTS;
        dts = avcSample.dts - this._initDTS;
        //logger.log('Video/PTS/DTS:' + avcSample.pts + '/' + avcSample.dts);

        if (lastSampleDTS !== undefined) {
          ptsnorm = this._PTSNormalize(pts, lastSampleDTS);
          dtsnorm = this._PTSNormalize(dts, lastSampleDTS);

          mp4Sample.duration = (dtsnorm - lastSampleDTS) / this.PES2MP4SCALEFACTOR;
          if (mp4Sample.duration < 0) {
            //logger.log('invalid sample duration at PTS/DTS::' + avcSample.pts + '/' + avcSample.dts + ':' + mp4Sample.duration);
            mp4Sample.duration = 0;
          }
        } else {
          ptsnorm = this._PTSNormalize(pts, this.nextAvcPts);
          dtsnorm = this._PTSNormalize(dts, this.nextAvcPts);
          // check if fragments are contiguous (i.e. no missing frames between fragment)
          if (this.nextAvcPts) {
            var delta = Math.round((ptsnorm - this.nextAvcPts) / 90),
                absdelta = Math.abs(delta);
            //logger.log('absdelta/avcSample.pts:' + absdelta + '/' + avcSample.pts);
            // if delta is less than 300 ms, next loaded fragment is assumed to be contiguous with last one
            if (absdelta < 300) {
              //logger.log('Video next PTS:' + this.nextAvcPts);
              if (delta > 1) {
                _utilsLogger.logger.log('AVC:' + delta + ' ms hole between fragments detected,filling it');
              } else if (delta < -1) {
                _utilsLogger.logger.log('AVC:' + -delta + ' ms overlapping between fragments detected');
              }
              // set PTS to next PTS
              ptsnorm = this.nextAvcPts;
              // offset DTS as well, ensure that DTS is smaller or equal than new PTS
              dtsnorm = Math.max(dtsnorm - delta, this.lastAvcDts);
              // logger.log('Video/PTS/DTS adjusted:' + avcSample.pts + '/' + avcSample.dts);
            } else {
                // not contiguous timestamp, check if PTS is within acceptable range
                var expectedPTS = this.PES_TIMESCALE * this.timeOffset;
                // check if there is any unexpected drift between expected timestamp and real one
                if (Math.abs(expectedPTS - ptsnorm) > this.PES_TIMESCALE * 3600) {
                  //logger.log(`PTS looping ??? AVC PTS delta:${expectedPTS-ptsnorm}`);
                  var ptsOffset = expectedPTS - ptsnorm;
                  // set PTS to next expected PTS;
                  ptsnorm = expectedPTS;
                  dtsnorm = ptsnorm;
                  // offset initPTS/initDTS to fix computation for following samples
                  this._initPTS -= ptsOffset;
                  this._initDTS -= ptsOffset;
                }
              }
          }
          // remember first PTS of our avcSamples, ensure value is positive
          firstPTS = Math.max(0, ptsnorm);
          firstDTS = Math.max(0, dtsnorm);
        }
        //console.log(`PTS/DTS/initDTS/normPTS/normDTS/relative PTS : ${avcSample.pts}/${avcSample.dts}/${this._initDTS}/${ptsnorm}/${dtsnorm}/${(avcSample.pts/4294967296).toFixed(3)}`);

        mp4Sample = {
          size: mp4SampleLength,
          duration: 0,
          cts: (ptsnorm - dtsnorm) / this.PES2MP4SCALEFACTOR,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0
          }
        };

        if (avcSample.key === true) {
          // the current sample is a key frame
          mp4Sample.flags.dependsOn = 2;
          mp4Sample.flags.isNonSync = 0;
        } else {
          mp4Sample.flags.dependsOn = 1;
          mp4Sample.flags.isNonSync = 1;
        }
        samples.push(mp4Sample);
        lastSampleDTS = dtsnorm;
      }
      if (samples.length >= 2) {
        mp4Sample.duration = samples[samples.length - 2].duration;
      }
      this.lastAvcDts = dtsnorm;
      // next AVC sample PTS should be equal to last sample PTS + duration
      this.nextAvcPts = ptsnorm + mp4Sample.duration * this.PES2MP4SCALEFACTOR;
      //logger.log('Video/lastAvcDts/nextAvcPts:' + this.lastAvcDts + '/' + this.nextAvcPts);

      this._avcSamplesLength = 0;
      this._avcSamplesNbNalu = 0;

      track.samples = samples;
      moof = _remuxMp4Generator2['default'].moof(track.sequenceNumber++, firstDTS / this.PES2MP4SCALEFACTOR, track);
      track.samples = [];
      _observer2['default'].trigger(_events2['default'].FRAG_PARSING_DATA, {
        moof: moof,
        mdat: mdat,
        startPTS: firstPTS / this.PES_TIMESCALE,
        endPTS: this.nextAvcPts / this.PES_TIMESCALE,
        startDTS: firstDTS / this.PES_TIMESCALE,
        endDTS: (dtsnorm + this.PES2MP4SCALEFACTOR * mp4Sample.duration) / this.PES_TIMESCALE,
        type: 'video',
        nb: samples.length
      });
    }
  }, {
    key: '_parseAVCNALu',
    value: function _parseAVCNALu(array) {
      var i = 0,
          len = array.byteLength,
          value,
          overflow,
          state = 0;
      var units = [],
          unit,
          unitType,
          lastUnitStart,
          lastUnitType,
          length = 0;
      //logger.log('PES:' + Hex.hexDump(array));

      while (i < len) {
        value = array[i++];
        // finding 3 or 4-byte start codes (00 00 01 OR 00 00 00 01)
        switch (state) {
          case 0:
            if (value === 0) {
              state = 1;
            }
            break;
          case 1:
            if (value === 0) {
              state = 2;
            } else {
              state = 0;
            }
            break;
          case 2:
          case 3:
            if (value === 0) {
              state = 3;
            } else if (value === 1) {
              unitType = array[i] & 0x1f;
              //logger.log('find NALU @ offset:' + i + ',type:' + unitType);
              if (lastUnitStart) {
                unit = { data: array.subarray(lastUnitStart, i - state - 1), type: lastUnitType };
                length += i - state - 1 - lastUnitStart;
                //logger.log('pushing NALU, type/size:' + unit.type + '/' + unit.data.byteLength);
                units.push(unit);
              } else {
                // If NAL units are not starting right at the beginning of the PES packet, push preceding data into previous NAL unit.
                overflow = i - state - 1;
                if (overflow) {
                  //logger.log('first NALU found with overflow:' + overflow);
                  if (this._avcSamples.length) {
                    var lastavcSample = this._avcSamples[this._avcSamples.length - 1];
                    var lastUnit = lastavcSample.units.units[lastavcSample.units.units.length - 1];
                    var tmp = new Uint8Array(lastUnit.data.byteLength + overflow);
                    tmp.set(lastUnit.data, 0);
                    tmp.set(array.subarray(0, overflow), lastUnit.data.byteLength);
                    lastUnit.data = tmp;
                    lastavcSample.units.length += overflow;
                    this._avcSamplesLength += overflow;
                  }
                }
              }
              lastUnitStart = i;
              lastUnitType = unitType;
              if (unitType === 1 || unitType === 5) {
                // OPTI !!! if IDR/NDR unit, consider it is last NALu
                i = len;
              }
              state = 0;
            } else {
              state = 0;
            }
            break;
          default:
            break;
        }
      }
      if (lastUnitStart) {
        unit = { data: array.subarray(lastUnitStart, len), type: lastUnitType };
        length += len - lastUnitStart;
        units.push(unit);
        //logger.log('pushing NALU, type/size:' + unit.type + '/' + unit.data.byteLength);
      }
      return { units: units, length: length };
    }
  }, {
    key: '_PTSNormalize',
    value: function _PTSNormalize(value, reference) {
      var offset;
      if (reference === undefined) {
        return value;
      }
      if (reference < value) {
        // - 2^33
        offset = -8589934592;
      } else {
        // + 2^33
        offset = 8589934592;
      }
      /* PTS is 33bit (from 0 to 2^33 -1)
        if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
        PTS looping occured. fill the gap */
      while (Math.abs(value - reference) > 4294967296) {
        value += offset;
      }
      return value;
    }
  }, {
    key: '_parseAACPES',
    value: function _parseAACPES(pes) {
      var track = this._aacTrack,
          aacSample,
          data = pes.data,
          config,
          adtsFrameSize,
          adtsStartOffset,
          adtsHeaderLen,
          stamp,
          nbSamples,
          len;
      if (this.aacOverFlow) {
        var tmp = new Uint8Array(this.aacOverFlow.byteLength + data.byteLength);
        tmp.set(this.aacOverFlow, 0);
        tmp.set(data, this.aacOverFlow.byteLength);
        data = tmp;
      }
      // look for ADTS header (0xFFFx)
      for (adtsStartOffset = 0, len = data.length; adtsStartOffset < len - 1; adtsStartOffset++) {
        if (data[adtsStartOffset] === 0xff && (data[adtsStartOffset + 1] & 0xf0) === 0xf0) {
          break;
        }
      }
      // if ADTS header does not start straight from the beginning of the PES payload, raise an error
      if (adtsStartOffset) {
        var reason, fatal;
        if (adtsStartOffset < len - 1) {
          reason = 'AAC PES did not start with ADTS header,offset:' + adtsStartOffset;
          fatal = false;
        } else {
          reason = 'no ADTS header found in AAC PES';
          fatal = true;
        }
        _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: fatal, reason: reason });
        if (fatal) {
          return;
        }
      }

      if (!track.audiosamplerate) {
        config = this._ADTStoAudioConfig(data, adtsStartOffset, this.audioCodec);
        track.config = config.config;
        track.audiosamplerate = config.samplerate;
        track.channelCount = config.channelCount;
        track.codec = config.codec;
        track.timescale = this.MP4_TIMESCALE;
        track.duration = this.MP4_TIMESCALE * this._duration;
        _utilsLogger.logger.log('parsed   codec:' + track.codec + ',rate:' + config.samplerate + ',nb channel:' + config.channelCount);
      }
      nbSamples = 0;
      while (adtsStartOffset + 5 < len) {
        // retrieve frame size
        adtsFrameSize = (data[adtsStartOffset + 3] & 0x03) << 11;
        // byte 4
        adtsFrameSize |= data[adtsStartOffset + 4] << 3;
        // byte 5
        adtsFrameSize |= (data[adtsStartOffset + 5] & 0xE0) >>> 5;
        adtsHeaderLen = !!(data[adtsStartOffset + 1] & 0x01) ? 7 : 9;
        adtsFrameSize -= adtsHeaderLen;
        stamp = Math.round(pes.pts + nbSamples * 1024 * this.PES_TIMESCALE / track.audiosamplerate);
        //stamp = pes.pts;
        //console.log('AAC frame, offset/length/pts:' + (adtsStartOffset+7) + '/' + adtsFrameSize + '/' + stamp.toFixed(0));
        if (adtsStartOffset + adtsHeaderLen + adtsFrameSize <= len) {
          aacSample = { unit: data.subarray(adtsStartOffset + adtsHeaderLen, adtsStartOffset + adtsHeaderLen + adtsFrameSize), pts: stamp, dts: stamp };
          this._aacSamples.push(aacSample);
          this._aacSamplesLength += adtsFrameSize;
          adtsStartOffset += adtsFrameSize + adtsHeaderLen;
          nbSamples++;
        } else {
          break;
        }
      }
      if (adtsStartOffset < len) {
        this.aacOverFlow = data.subarray(adtsStartOffset, len);
      } else {
        this.aacOverFlow = null;
      }
    }
  }, {
    key: '_flushAACSamples',
    value: function _flushAACSamples() {
      var view,
          i = 8,
          aacSample,
          mp4Sample,
          unit,
          track = this._aacTrack,
          lastSampleDTS,
          mdat,
          moof,
          firstPTS,
          firstDTS,
          pts,
          dts,
          ptsnorm,
          dtsnorm,
          samples = [];

      /* concatenate the audio data and construct the mdat in place
        (need 8 more bytes to fill length and mpdat type) */
      mdat = new Uint8Array(this._aacSamplesLength + 8);
      view = new DataView(mdat.buffer);
      view.setUint32(0, mdat.byteLength);
      mdat.set(_remuxMp4Generator2['default'].types.mdat, 4);
      while (this._aacSamples.length) {
        aacSample = this._aacSamples.shift();
        unit = aacSample.unit;
        mdat.set(unit, i);
        i += unit.byteLength;

        pts = aacSample.pts - this._initDTS;
        dts = aacSample.dts - this._initDTS;

        //logger.log('Audio/PTS:' + aacSample.pts.toFixed(0));
        if (lastSampleDTS !== undefined) {
          ptsnorm = this._PTSNormalize(pts, lastSampleDTS);
          dtsnorm = this._PTSNormalize(dts, lastSampleDTS);
          // we use DTS to compute sample duration, but we use PTS to compute initPTS which is used to sync audio and video
          mp4Sample.duration = (dtsnorm - lastSampleDTS) / this.PES2MP4SCALEFACTOR;
          if (mp4Sample.duration < 0) {
            //logger.log('invalid sample duration at PTS/DTS::' + avcSample.pts + '/' + avcSample.dts + ':' + mp4Sample.duration);
            mp4Sample.duration = 0;
          }
        } else {
          ptsnorm = this._PTSNormalize(pts, this.nextAacPts);
          dtsnorm = this._PTSNormalize(dts, this.nextAacPts);
          // check if fragments are contiguous (i.e. no missing frames between fragment)
          if (this.nextAacPts && this.nextAacPts !== ptsnorm) {
            //logger.log('Audio next PTS:' + this.nextAacPts);
            var delta = Math.round(1000 * (ptsnorm - this.nextAacPts) / this.PES_TIMESCALE),
                absdelta = Math.abs(delta);
            // if delta is less than 300 ms, next loaded fragment is assumed to be contiguous with last one
            if (absdelta > 1 && absdelta < 300) {
              if (delta > 0) {
                _utilsLogger.logger.log('AAC:' + delta + ' ms hole between fragments detected,filling it');
                // set PTS to next PTS, and ensure PTS is greater or equal than last DTS
                ptsnorm = Math.max(this.nextAacPts, this.lastAacDts);
                dtsnorm = ptsnorm;
                //logger.log('Audio/PTS/DTS adjusted:' + aacSample.pts + '/' + aacSample.dts);
              } else {
                  _utilsLogger.logger.log('AAC:' + -delta + ' ms overlapping between fragments detected');
                }
            } else if (absdelta) {
              // not contiguous timestamp, check if PTS is within acceptable range
              var expectedPTS = this.PES_TIMESCALE * this.timeOffset;
              //logger.log(`expectedPTS/PTSnorm:${expectedPTS}/${ptsnorm}/${expectedPTS-ptsnorm}`);
              // check if there is any unexpected drift between expected timestamp and real one
              if (Math.abs(expectedPTS - ptsnorm) > this.PES_TIMESCALE * 3600) {
                //logger.log(`PTS looping ??? AAC PTS delta:${expectedPTS-ptsnorm}`);
                var ptsOffset = expectedPTS - ptsnorm;
                // set PTS to next expected PTS;
                ptsnorm = expectedPTS;
                dtsnorm = ptsnorm;
                // offset initPTS/initDTS to fix computation for following samples
                this._initPTS -= ptsOffset;
                this._initDTS -= ptsOffset;
              }
            }
          }
          // remember first PTS of our aacSamples, ensure value is positive
          firstPTS = Math.max(0, ptsnorm);
          firstDTS = Math.max(0, dtsnorm);
        }
        //console.log(`PTS/DTS/initDTS/normPTS/normDTS/relative PTS : ${aacSample.pts}/${aacSample.dts}/${this._initDTS}/${ptsnorm}/${dtsnorm}/${(aacSample.pts/4294967296).toFixed(3)}`);
        mp4Sample = {
          size: unit.byteLength,
          cts: 0,
          duration: 0,
          flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0,
            dependsOn: 1
          }
        };
        samples.push(mp4Sample);
        lastSampleDTS = dtsnorm;
      }
      //set last sample duration as being identical to previous sample
      if (samples.length >= 2) {
        mp4Sample.duration = samples[samples.length - 2].duration;
      }
      this.lastAacDts = dtsnorm;
      // next aac sample PTS should be equal to last sample PTS + duration
      this.nextAacPts = ptsnorm + this.PES2MP4SCALEFACTOR * mp4Sample.duration;
      //logger.log('Audio/PTS/PTSend:' + aacSample.pts.toFixed(0) + '/' + this.nextAacDts.toFixed(0));

      this._aacSamplesLength = 0;
      track.samples = samples;
      moof = _remuxMp4Generator2['default'].moof(track.sequenceNumber++, firstDTS / this.PES2MP4SCALEFACTOR, track);
      track.samples = [];
      _observer2['default'].trigger(_events2['default'].FRAG_PARSING_DATA, {
        moof: moof,
        mdat: mdat,
        startPTS: firstPTS / this.PES_TIMESCALE,
        endPTS: this.nextAacPts / this.PES_TIMESCALE,
        startDTS: firstDTS / this.PES_TIMESCALE,
        endDTS: (dtsnorm + this.PES2MP4SCALEFACTOR * mp4Sample.duration) / this.PES_TIMESCALE,
        type: 'audio',
        nb: samples.length
      });
    }
  }, {
    key: '_ADTStoAudioConfig',
    value: function _ADTStoAudioConfig(data, offset, audioCodec) {
      var adtsObjectType,
          // :int
      adtsSampleingIndex,
          // :int
      adtsExtensionSampleingIndex,
          // :int
      adtsChanelConfig,
          // :int
      config,
          userAgent = navigator.userAgent.toLowerCase(),
          adtsSampleingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000];

      // byte 2
      adtsObjectType = ((data[offset + 2] & 0xC0) >>> 6) + 1;
      adtsSampleingIndex = (data[offset + 2] & 0x3C) >>> 2;
      adtsChanelConfig = (data[offset + 2] & 0x01) << 2;
      // byte 3
      adtsChanelConfig |= (data[offset + 3] & 0xC0) >>> 6;

      _utilsLogger.logger.log('manifest codec:' + audioCodec + ',ADTS data:type:' + adtsObjectType + ',sampleingIndex:' + adtsSampleingIndex + '[' + adtsSampleingRates[adtsSampleingIndex] + 'kHz],channelConfig:' + adtsChanelConfig);

      // firefox: freq less than 24kHz = AAC SBR (HE-AAC)
      if (userAgent.indexOf('firefox') !== -1) {
        if (adtsSampleingIndex >= 6) {
          adtsObjectType = 5;
          config = new Array(4);
          // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
          // there is a factor 2 between frame sample rate and output sample rate
          // multiply frequency by 2 (see table below, equivalent to substract 3)
          adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
        } else {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        }
        // Android : always use AAC
      } else if (userAgent.indexOf('android') !== -1) {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        } else {
          /*  for other browsers (chrome ...)
              always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
          */
          adtsObjectType = 5;
          config = new Array(4);
          // if (manifest codec is HE-AAC) OR (manifest codec not specified AND frequency less than 24kHz)
          if (audioCodec && audioCodec.indexOf('mp4a.40.5') !== -1 || !audioCodec && adtsSampleingIndex >= 6) {
            // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
            // there is a factor 2 between frame sample rate and output sample rate
            // multiply frequency by 2 (see table below, equivalent to substract 3)
            adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
          } else {
            // if (manifest codec is AAC) AND (frequency less than 24kHz OR nb channel is 1)
            if (audioCodec && audioCodec.indexOf('mp4a.40.2') !== -1 && (adtsSampleingIndex >= 6 || adtsChanelConfig === 1)) {
              adtsObjectType = 2;
              config = new Array(2);
            }
            adtsExtensionSampleingIndex = adtsSampleingIndex;
          }
        }
      /* refer to http://wiki.multimedia.cx/index.php?title=MPEG-4_Audio#Audio_Specific_Config
          ISO 14496-3 (AAC).pdf - Table 1.13 — Syntax of AudioSpecificConfig()
        Audio Profile / Audio Object Type
        0: Null
        1: AAC Main
        2: AAC LC (Low Complexity)
        3: AAC SSR (Scalable Sample Rate)
        4: AAC LTP (Long Term Prediction)
        5: SBR (Spectral Band Replication)
        6: AAC Scalable
       sampling freq
        0: 96000 Hz
        1: 88200 Hz
        2: 64000 Hz
        3: 48000 Hz
        4: 44100 Hz
        5: 32000 Hz
        6: 24000 Hz
        7: 22050 Hz
        8: 16000 Hz
        9: 12000 Hz
        10: 11025 Hz
        11: 8000 Hz
        12: 7350 Hz
        13: Reserved
        14: Reserved
        15: frequency is written explictly
        Channel Configurations
        These are the channel configurations:
        0: Defined in AOT Specifc Config
        1: 1 channel: front-center
        2: 2 channels: front-left, front-right
      */
      // audioObjectType = profile => profile, the MPEG-4 Audio Object Type minus 1
      config[0] = adtsObjectType << 3;
      // samplingFrequencyIndex
      config[0] |= (adtsSampleingIndex & 0x0E) >> 1;
      config[1] |= (adtsSampleingIndex & 0x01) << 7;
      // channelConfiguration
      config[1] |= adtsChanelConfig << 3;
      if (adtsObjectType === 5) {
        // adtsExtensionSampleingIndex
        config[1] |= (adtsExtensionSampleingIndex & 0x0E) >> 1;
        config[2] = (adtsExtensionSampleingIndex & 0x01) << 7;
        // adtsObjectType (force to 2, chrome is checking that object type is less than 5 ???
        //    https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4/aac.cc
        config[2] |= 2 << 2;
        config[3] = 0;
      }
      return { config: config, samplerate: adtsSampleingRates[adtsSampleingIndex], channelCount: adtsChanelConfig, codec: 'mp4a.40.' + adtsObjectType };
    }
  }, {
    key: '_generateInitSegment',
    value: function _generateInitSegment() {
      if (this._avcId === -1) {
        //audio only
        if (this._aacTrack.config) {
          _observer2['default'].trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, {
            audioMoov: _remuxMp4Generator2['default'].initSegment([this._aacTrack]),
            audioCodec: this._aacTrack.codec,
            audioChannelCount: this._aacTrack.channelCount
          });
          this._initSegGenerated = true;
        }
        if (this._initPTS === undefined) {
          // remember first PTS of this demuxing context
          this._initPTS = this._aacSamples[0].pts - this.PES_TIMESCALE * this.timeOffset;
          this._initDTS = this._aacSamples[0].dts - this.PES_TIMESCALE * this.timeOffset;
        }
      } else if (this._aacId === -1) {
        //video only
        if (this._avcTrack.sps && this._avcTrack.pps) {
          _observer2['default'].trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, {
            videoMoov: _remuxMp4Generator2['default'].initSegment([this._avcTrack]),
            videoCodec: this._avcTrack.codec,
            videoWidth: this._avcTrack.width,
            videoHeight: this._avcTrack.height
          });
          this._initSegGenerated = true;
          if (this._initPTS === undefined) {
            // remember first PTS of this demuxing context
            this._initPTS = this._avcSamples[0].pts - this.PES_TIMESCALE * this.timeOffset;
            this._initDTS = this._avcSamples[0].dts - this.PES_TIMESCALE * this.timeOffset;
          }
        }
      } else {
        //audio and video
        if (this._aacTrack.config && this._avcTrack.sps && this._avcTrack.pps) {
          _observer2['default'].trigger(_events2['default'].FRAG_PARSING_INIT_SEGMENT, {
            audioMoov: _remuxMp4Generator2['default'].initSegment([this._aacTrack]),
            audioCodec: this._aacTrack.codec,
            audioChannelCount: this._aacTrack.channelCount,
            videoMoov: _remuxMp4Generator2['default'].initSegment([this._avcTrack]),
            videoCodec: this._avcTrack.codec,
            videoWidth: this._avcTrack.width,
            videoHeight: this._avcTrack.height
          });
          this._initSegGenerated = true;
          if (this._initPTS === undefined) {
            // remember first PTS of this demuxing context
            this._initPTS = Math.min(this._avcSamples[0].pts, this._aacSamples[0].pts) - this.PES_TIMESCALE * this.timeOffset;
            this._initDTS = Math.min(this._avcSamples[0].dts, this._aacSamples[0].dts) - this.PES_TIMESCALE * this.timeOffset;
          }
        }
      }
    }
  }]);

  return TSDemuxer;
})();

exports['default'] = TSDemuxer;
module.exports = exports['default'];

},{"../errors":9,"../events":10,"../observer":14,"../remux/mp4-generator":15,"../utils/logger":17,"./exp-golomb":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _demuxTsdemuxer = require('../demux/tsdemuxer');

var _demuxTsdemuxer2 = _interopRequireDefault(_demuxTsdemuxer);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var TSDemuxerWorker = function TSDemuxerWorker(self) {
  self.addEventListener('message', function (ev) {
    //console.log('demuxer cmd:' + ev.data.cmd);
    switch (ev.data.cmd) {
      case 'init':
        self.demuxer = new _demuxTsdemuxer2['default']();
        break;
      case 'demux':
        self.demuxer.push(new Uint8Array(ev.data.data), ev.data.audioCodec, ev.data.videoCodec, ev.data.timeOffset, ev.data.cc, ev.data.level, ev.data.duration);
        self.demuxer.end();
        break;
      default:
        break;
    }
  });

  // listen to events triggered by TS Demuxer
  _observer2['default'].on(_events2['default'].FRAG_PARSING_INIT_SEGMENT, function (ev, data) {
    var objData = { event: ev };
    var objTransferable = [];
    if (data.audioCodec) {
      objData.audioCodec = data.audioCodec;
      objData.audioMoov = data.audioMoov.buffer;
      objData.audioChannelCount = data.audioChannelCount;
      objTransferable.push(objData.audioMoov);
    }
    if (data.videoCodec) {
      objData.videoCodec = data.videoCodec;
      objData.videoMoov = data.videoMoov.buffer;
      objData.videoWidth = data.videoWidth;
      objData.videoHeight = data.videoHeight;
      objTransferable.push(objData.videoMoov);
    }
    // pass moov as transferable object (no copy)
    self.postMessage(objData, objTransferable);
  });
  _observer2['default'].on(_events2['default'].FRAG_PARSING_DATA, function (ev, data) {
    var objData = { event: ev, type: data.type, startPTS: data.startPTS, endPTS: data.endPTS, startDTS: data.startDTS, endDTS: data.endDTS, moof: data.moof.buffer, mdat: data.mdat.buffer, nb: data.nb };
    // pass moof/mdat data as transferable object (no copy)
    self.postMessage(objData, [objData.moof, objData.mdat]);
  });
  _observer2['default'].on(_events2['default'].FRAG_PARSED, function (event) {
    self.postMessage({ event: event });
  });
  _observer2['default'].on(_events2['default'].ERROR, function (event, data) {
    self.postMessage({ event: event, data: data });
  });
};

exports['default'] = TSDemuxerWorker;
module.exports = exports['default'];

},{"../demux/tsdemuxer":7,"../events":10,"../observer":14}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ErrorTypes = {
  // Identifier for a network error (loading error / timeout ...)
  NETWORK_ERROR: 'hlsNetworkError',
  // Identifier for a media Error (video/parsing/mediasource error)
  MEDIA_ERROR: 'hlsMediaError',
  // Identifier for all other errors
  OTHER_ERROR: 'hlsOtherError'
};

exports.ErrorTypes = ErrorTypes;
var ErrorDetails = {
  // Identifier for a manifest load error - data: { url : faulty URL, response : XHR response}
  MANIFEST_LOAD_ERROR: 'manifestLoadError',
  // Identifier for a manifest load timeout - data: { url : faulty URL, response : XHR response}
  MANIFEST_LOAD_TIMEOUT: 'manifestLoadTimeOut',
  // Identifier for a manifest parsing error - data: { url : faulty URL, reason : error reason}
  MANIFEST_PARSING_ERROR: 'manifestParsingError',
  // Identifier for playlist load error - data: { url : faulty URL, response : XHR response}
  LEVEL_LOAD_ERROR: 'levelLoadError',
  // Identifier for playlist load timeout - data: { url : faulty URL, response : XHR response}
  LEVEL_LOAD_TIMEOUT: 'levelLoadTimeOut',
  // Identifier for a level switch error - data: { level : faulty level Id, event : error description}
  LEVEL_SWITCH_ERROR: 'levelSwitchError',
  // Identifier for fragment load error - data: { frag : fragment object, response : XHR response}
  FRAG_LOAD_ERROR: 'fragLoadError',
  // Identifier for fragment loop loading error - data: { frag : fragment object}
  FRAG_LOOP_LOADING_ERROR: 'fragLoopLoadingError',
  // Identifier for fragment load timeout error - data: { frag : fragment object}
  FRAG_LOAD_TIMEOUT: 'fragLoadTimeOut',
  // Identifier for a fragment parsing error event - data: parsing error description
  FRAG_PARSING_ERROR: 'fragParsingError',
  // Identifier for a fragment appending error event - data: appending error description
  FRAG_APPENDING_ERROR: 'fragAppendingError'
};
exports.ErrorDetails = ErrorDetails;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  // fired when MediaSource has been succesfully attached to video element - data: { mediaSource }
  MSE_ATTACHED: 'hlsMediaSourceAttached',
  // fired when MediaSource has been detached from video element - data: { }
  MSE_DETACHED: 'hlsMediaSourceDetached',
  // fired to signal that a manifest loading starts - data: { url : manifestURL}
  MANIFEST_LOADING: 'hlsManifestLoading',
  // fired after manifest has been loaded - data: { levels : [available quality levels] , url : manifestURL, stats : { trequest, tfirst, tload, mtime}}
  MANIFEST_LOADED: 'hlsManifestLoaded',
  // fired after manifest has been parsed - data: { levels : [available quality levels] , firstLevel : index of first quality level appearing in Manifest}
  MANIFEST_PARSED: 'hlsManifestParsed',
  // fired when a level playlist loading starts - data: { url : level URL  level : id of level being loaded}
  LEVEL_LOADING: 'hlsLevelLoading',
  // fired when a level playlist loading finishes - data: { details : levelDetails object, level : id of loaded level, stats : { trequest, tfirst, tload, mtime} }
  LEVEL_LOADED: 'hlsLevelLoaded',
  // fired when a level switch is requested - data: { level : id of new level }
  LEVEL_SWITCH: 'hlsLevelSwitch',
  // fired when a fragment loading starts - data: { frag : fragment object}
  FRAG_LOADING: 'hlsFragLoading',
  // fired when a fragment loading is progressing - data: { frag : fragment object, { trequest, tfirst, loaded}}
  FRAG_LOAD_PROGRESS: 'hlsFragLoadProgress',
  // Identifier for fragment load aborting for emergency switch down - data: {frag : fragment object}
  FRAG_LOAD_EMERGENCY_ABORTED: 'hlsFragLoadEmergencyAborted',
  // fired when a fragment loading is completed - data: { frag : fragment object, payload : fragment payload, stats : { trequest, tfirst, tload, length}}
  FRAG_LOADED: 'hlsFragLoaded',
  // fired when Init Segment has been extracted from fragment - data: { moov : moov MP4 box, codecs : codecs found while parsing fragment}
  FRAG_PARSING_INIT_SEGMENT: 'hlsFragParsingInitSegment',
  // fired when moof/mdat have been extracted from fragment - data: { moof : moof MP4 box, mdat : mdat MP4 box}
  FRAG_PARSING_DATA: 'hlsFragParsingData',
  // fired when fragment parsing is completed - data: undefined
  FRAG_PARSED: 'hlsFragParsed',
  // fired when fragment remuxed MP4 boxes have all been appended into SourceBuffer - data: { frag : fragment object, stats : { trequest, tfirst, tload, tparsed, tbuffered, length} }
  FRAG_BUFFERED: 'hlsFragBuffered',
  // fired when fragment matching with current video position is changing - data : { frag : fragment object }
  FRAG_CHANGED: 'hlsFragChanged',
  // Identifier for a FPS drop event - data: {curentDropped, currentDecoded, totalDroppedFrames}
  FPS_DROP: 'hlsFPSDrop',
  // Identifier for an error event - data: { type : error type, details : error details, fatal : if true, hls.js cannot/will not try to recover, if false, hls.js will try to recover,other error specific data}
  ERROR: 'hlsError'
};
module.exports = exports['default'];

},{}],11:[function(require,module,exports){
/**
 * HLS interface
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _errors = require('./errors');

var _stats = require('./stats');

var _stats2 = _interopRequireDefault(_stats);

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

var _loaderPlaylistLoader = require('./loader/playlist-loader');

var _loaderPlaylistLoader2 = _interopRequireDefault(_loaderPlaylistLoader);

var _loaderFragmentLoader = require('./loader/fragment-loader');

var _loaderFragmentLoader2 = _interopRequireDefault(_loaderFragmentLoader);

var _controllerBufferController = require('./controller/buffer-controller');

var _controllerBufferController2 = _interopRequireDefault(_controllerBufferController);

var _controllerLevelController = require('./controller/level-controller');

var _controllerLevelController2 = _interopRequireDefault(_controllerLevelController);

//import FPSController              from './controller/fps-controller';

var _utilsLogger = require('./utils/logger');

var _utilsXhrLoader = require('./utils/xhr-loader');

var _utilsXhrLoader2 = _interopRequireDefault(_utilsXhrLoader);

var Hls = (function () {
  _createClass(Hls, null, [{
    key: 'isSupported',
    value: function isSupported() {
      return window.MediaSource && MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
    }
  }, {
    key: 'Events',
    get: function get() {
      return _events2['default'];
    }
  }, {
    key: 'ErrorTypes',
    get: function get() {
      return _errors.ErrorTypes;
    }
  }, {
    key: 'ErrorDetails',
    get: function get() {
      return _errors.ErrorDetails;
    }
  }]);

  function Hls() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Hls);

    var configDefault = {
      autoStartLoad: true,
      debug: false,
      maxBufferLength: 30,
      maxBufferSize: 60 * 1000 * 1000,
      maxMaxBufferLength: 600,
      enableWorker: true,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 1,
      fragLoadingRetryDelay: 1000,
      fragLoadingLoopThreshold: 3,
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 1000,
      fpsDroppedMonitoringPeriod: 5000,
      fpsDroppedMonitoringThreshold: 0.2,
      appendErrorMaxRetry: 200,
      loader: _utilsXhrLoader2['default']
    };
    for (var prop in configDefault) {
      if (prop in config) {
        continue;
      }
      config[prop] = configDefault[prop];
    }
    (0, _utilsLogger.enableLogs)(config.debug);
    this.config = config;
    this.playlistLoader = new _loaderPlaylistLoader2['default'](this);
    this.fragmentLoader = new _loaderFragmentLoader2['default'](this);
    this.levelController = new _controllerLevelController2['default'](this);
    this.bufferController = new _controllerBufferController2['default'](this);
    //this.fpsController = new FPSController(this);
    this.statsHandler = new _stats2['default'](this);
    // observer setup
    this.on = _observer2['default'].on.bind(_observer2['default']);
    this.off = _observer2['default'].off.bind(_observer2['default']);
  }

  _createClass(Hls, [{
    key: 'destroy',
    value: function destroy() {
      _utilsLogger.logger.log('destroy');
      this.playlistLoader.destroy();
      this.fragmentLoader.destroy();
      this.levelController.destroy();
      this.bufferController.destroy();
      //this.fpsController.destroy();
      this.statsHandler.destroy();
      this.url = null;
      this.detachVideo();
      _observer2['default'].removeAllListeners();
    }
  }, {
    key: 'attachVideo',
    value: function attachVideo(video) {
      _utilsLogger.logger.log('attachVideo');
      this.video = video;
      this.statsHandler.attachVideo(video);
      // setup the media source
      var ms = this.mediaSource = new MediaSource();
      //Media Source listeners
      this.onmso = this.onMediaSourceOpen.bind(this);
      this.onmse = this.onMediaSourceEnded.bind(this);
      this.onmsc = this.onMediaSourceClose.bind(this);
      ms.addEventListener('sourceopen', this.onmso);
      ms.addEventListener('sourceended', this.onmse);
      ms.addEventListener('sourceclose', this.onmsc);
      // link video and media Source
      video.src = URL.createObjectURL(ms);
      video.addEventListener('error', this.onverror);
    }
  }, {
    key: 'detachVideo',
    value: function detachVideo() {
      _utilsLogger.logger.log('detachVideo');
      var video = this.video;
      this.statsHandler.detachVideo(video);
      var ms = this.mediaSource;
      if (ms) {
        if (ms.readyState !== 'ended') {
          ms.endOfStream();
        }
        ms.removeEventListener('sourceopen', this.onmso);
        ms.removeEventListener('sourceended', this.onmse);
        ms.removeEventListener('sourceclose', this.onmsc);
        // unlink MediaSource from video tag
        video.src = '';
        this.mediaSource = null;
        _utilsLogger.logger.log('trigger MSE_DETACHED');
        _observer2['default'].trigger(_events2['default'].MSE_DETACHED);
      }
      this.onmso = this.onmse = this.onmsc = null;
      if (video) {
        this.video = null;
      }
    }
  }, {
    key: 'loadSource',
    value: function loadSource(url) {
      _utilsLogger.logger.log('loadSource:' + url);
      this.url = url;
      // when attaching to a source URL, trigger a playlist load
      _observer2['default'].trigger(_events2['default'].MANIFEST_LOADING, { url: url });
    }
  }, {
    key: 'startLoad',
    value: function startLoad() {
      _utilsLogger.logger.log('startLoad');
      this.bufferController.startLoad();
    }
  }, {
    key: 'recoverMediaError',
    value: function recoverMediaError() {
      _utilsLogger.logger.log('recoverMediaError');
      var video = this.video;
      this.detachVideo();
      this.attachVideo(video);
    }

    /** Return all quality levels **/
  }, {
    key: 'onMediaSourceOpen',
    value: function onMediaSourceOpen() {
      _utilsLogger.logger.log('media source opened');
      _observer2['default'].trigger(_events2['default'].MSE_ATTACHED, { video: this.video, mediaSource: this.mediaSource });
      // once received, don't listen anymore to sourceopen event
      this.mediaSource.removeEventListener('sourceopen', this.onmso);
    }
  }, {
    key: 'onMediaSourceClose',
    value: function onMediaSourceClose() {
      _utilsLogger.logger.log('media source closed');
    }
  }, {
    key: 'onMediaSourceEnded',
    value: function onMediaSourceEnded() {
      _utilsLogger.logger.log('media source ended');
    }
  }, {
    key: 'levels',
    get: function get() {
      return this.levelController.levels;
    }

    /** Return current playback quality level **/
  }, {
    key: 'currentLevel',
    get: function get() {
      return this.bufferController.currentLevel;
    },

    /* set quality level immediately (-1 for automatic level selection) */
    set: function set(newLevel) {
      _utilsLogger.logger.log('set currentLevel:' + newLevel);
      this.loadLevel = newLevel;
      this.bufferController.immediateLevelSwitch();
    }

    /** Return next playback quality level (quality level of next fragment) **/
  }, {
    key: 'nextLevel',
    get: function get() {
      return this.bufferController.nextLevel;
    },

    /* set quality level for next fragment (-1 for automatic level selection) */
    set: function set(newLevel) {
      _utilsLogger.logger.log('set nextLevel:' + newLevel);
      this.levelController.manualLevel = newLevel;
      this.bufferController.nextLevelSwitch();
    }

    /** Return the quality level of current/last loaded fragment **/
  }, {
    key: 'loadLevel',
    get: function get() {
      return this.levelController.level;
    },

    /* set quality level for current/next loaded fragment (-1 for automatic level selection) */
    set: function set(newLevel) {
      _utilsLogger.logger.log('set loadLevel:' + newLevel);
      this.levelController.manualLevel = newLevel;
    }

    /** Return the quality level of next loaded fragment **/
  }, {
    key: 'nextLoadLevel',
    get: function get() {
      return this.levelController.nextLoadLevel();
    },

    /** set quality level of next loaded fragment **/
    set: function set(level) {
      this.levelController.level = level;
    }

    /** Return first level (index of first level referenced in manifest)
    **/
  }, {
    key: 'firstLevel',
    get: function get() {
      return this.levelController.firstLevel;
    },

    /** set first level (index of first level referenced in manifest)
    **/
    set: function set(newLevel) {
      _utilsLogger.logger.log('set firstLevel:' + newLevel);
      this.levelController.firstLevel = newLevel;
    }

    /** Return start level (level of first fragment that will be played back)
        if not overrided by user, first level appearing in manifest will be used as start level
        if -1 : automatic start level selection, playback will start from level matching download bandwidth (determined from download of first segment)
    **/
  }, {
    key: 'startLevel',
    get: function get() {
      return this.levelController.startLevel;
    },

    /** set  start level (level of first fragment that will be played back)
        if not overrided by user, first level appearing in manifest will be used as start level
        if -1 : automatic start level selection, playback will start from level matching download bandwidth (determined from download of first segment)
    **/
    set: function set(newLevel) {
      _utilsLogger.logger.log('set startLevel:' + newLevel);
      this.levelController.startLevel = newLevel;
    }

    /** Return the capping/max level value that could be used by automatic level selection algorithm **/
  }, {
    key: 'autoLevelCapping',
    get: function get() {
      return this.levelController.autoLevelCapping;
    },

    /** set the capping/max level value that could be used by automatic level selection algorithm **/
    set: function set(newLevel) {
      _utilsLogger.logger.log('set autoLevelCapping:' + newLevel);
      this.levelController.autoLevelCapping = newLevel;
    }

    /* check if we are in automatic level selection mode */
  }, {
    key: 'autoLevelEnabled',
    get: function get() {
      return this.levelController.manualLevel === -1;
    }

    /* return manual level */
  }, {
    key: 'manualLevel',
    get: function get() {
      return this.levelController.manualLevel;
    }

    /* return playback session stats */
  }, {
    key: 'stats',
    get: function get() {
      return this.statsHandler.stats;
    }
  }]);

  return Hls;
})();

exports['default'] = Hls;
module.exports = exports['default'];

},{"./controller/buffer-controller":3,"./controller/level-controller":4,"./errors":9,"./events":10,"./loader/fragment-loader":12,"./loader/playlist-loader":13,"./observer":14,"./stats":16,"./utils/logger":17,"./utils/xhr-loader":18}],12:[function(require,module,exports){
/*
* fragment loader
*
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var _errors = require('../errors');

var FragmentLoader = (function () {
  function FragmentLoader(hls) {
    _classCallCheck(this, FragmentLoader);

    this.hls = hls;
    this.onfl = this.onFragLoading.bind(this);
    _observer2['default'].on(_events2['default'].FRAG_LOADING, this.onfl);
  }

  _createClass(FragmentLoader, [{
    key: 'destroy',
    value: function destroy() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
      _observer2['default'].off(_events2['default'].FRAG_LOADING, this.onfl);
    }
  }, {
    key: 'onFragLoading',
    value: function onFragLoading(event, data) {
      var frag = data.frag;
      this.frag = frag;
      this.frag.loaded = 0;
      var config = this.hls.config;
      frag.loader = this.loader = new config.loader();
      this.loader.load(frag.url, 'arraybuffer', this.loadsuccess.bind(this), this.loaderror.bind(this), this.loadtimeout.bind(this), config.fragLoadingTimeOut, config.fragLoadingMaxRetry, config.fragLoadingRetryDelay, this.loadprogress.bind(this));
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event, stats) {
      var payload = event.currentTarget.response;
      stats.length = payload.byteLength;
      // detach fragment loader on load success
      this.frag.loader = undefined;
      _observer2['default'].trigger(_events2['default'].FRAG_LOADED, { payload: payload,
        frag: this.frag,
        stats: stats });
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      this.loader.abort();
      _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.FRAG_LOAD_ERROR, fatal: false, frag: this.frag, response: event });
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout() {
      this.loader.abort();
      _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.FRAG_LOAD_TIMEOUT, fatal: false, frag: this.frag });
    }
  }, {
    key: 'loadprogress',
    value: function loadprogress(event, stats) {
      this.frag.loaded = stats.loaded;
      _observer2['default'].trigger(_events2['default'].FRAG_LOAD_PROGRESS, { frag: this.frag, stats: stats });
    }
  }]);

  return FragmentLoader;
})();

exports['default'] = FragmentLoader;
module.exports = exports['default'];

},{"../errors":9,"../events":10,"../observer":14}],13:[function(require,module,exports){
/*
 * playlist loader
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _observer = require('../observer');

var _observer2 = _interopRequireDefault(_observer);

var _errors = require('../errors');

//import {logger}             from '../utils/logger';

var PlaylistLoader = (function () {
  function PlaylistLoader(hls) {
    _classCallCheck(this, PlaylistLoader);

    this.hls = hls;
    this.onml = this.onManifestLoading.bind(this);
    this.onll = this.onLevelLoading.bind(this);
    _observer2['default'].on(_events2['default'].MANIFEST_LOADING, this.onml);
    _observer2['default'].on(_events2['default'].LEVEL_LOADING, this.onll);
  }

  _createClass(PlaylistLoader, [{
    key: 'destroy',
    value: function destroy() {
      if (this.loader) {
        this.loader.destroy();
        this.loader = null;
      }
      this.url = this.id = null;
      _observer2['default'].off(_events2['default'].MANIFEST_LOADING, this.onml);
      _observer2['default'].off(_events2['default'].LEVEL_LOADING, this.onll);
    }
  }, {
    key: 'onManifestLoading',
    value: function onManifestLoading(event, data) {
      this.load(data.url, null);
    }
  }, {
    key: 'onLevelLoading',
    value: function onLevelLoading(event, data) {
      this.load(data.url, data.level, data.id);
    }
  }, {
    key: 'load',
    value: function load(url, id1, id2) {
      var config = this.hls.config;
      this.url = url;
      this.id = id1;
      this.id2 = id2;
      this.loader = new config.loader();
      this.loader.load(url, '', this.loadsuccess.bind(this), this.loaderror.bind(this), this.loadtimeout.bind(this), config.manifestLoadingTimeOut, config.manifestLoadingMaxRetry, config.manifestLoadingRetryDelay);
    }
  }, {
    key: 'resolve',
    value: function resolve(url, baseUrl) {
      var doc = document,
          oldBase = doc.getElementsByTagName('base')[0],
          oldHref = oldBase && oldBase.href,
          docHead = doc.head || doc.getElementsByTagName('head')[0],
          ourBase = oldBase || docHead.appendChild(doc.createElement('base')),
          resolver = doc.createElement('a'),
          resolvedUrl;

      ourBase.href = baseUrl;
      resolver.href = url;
      resolvedUrl = resolver.href; // browser magic at work here

      if (oldBase) {
        oldBase.href = oldHref;
      } else {
        docHead.removeChild(ourBase);
      }
      return resolvedUrl;
    }
  }, {
    key: 'parseMasterPlaylist',
    value: function parseMasterPlaylist(string, baseurl) {
      var levels = [],
          level = {},
          result,
          codecs,
          codec;
      var re = /#EXT-X-STREAM-INF:([^\n\r]*(BAND)WIDTH=(\d+))?([^\n\r]*(CODECS)=\"(.*)\",)?([^\n\r]*(RES)OLUTION=(\d+)x(\d+))?([^\n\r]*(NAME)=\"(.*)\")?[^\n\r]*[\r\n]+([^\r\n]+)/g;
      while ((result = re.exec(string)) != null) {
        result.shift();
        result = result.filter(function (n) {
          return n !== undefined;
        });
        level.url = this.resolve(result.pop(), baseurl);
        while (result.length > 0) {
          switch (result.shift()) {
            case 'RES':
              level.width = parseInt(result.shift());
              level.height = parseInt(result.shift());
              break;
            case 'BAND':
              level.bitrate = parseInt(result.shift());
              break;
            case 'NAME':
              level.name = result.shift();
              break;
            case 'CODECS':
              codecs = result.shift().split(',');
              while (codecs.length > 0) {
                codec = codecs.shift();
                if (codec.indexOf('avc1') !== -1) {
                  level.videoCodec = this.avc1toavcoti(codec);
                } else {
                  level.audioCodec = codec;
                }
              }
              break;
            default:
              break;
          }
        }
        levels.push(level);
        level = {};
      }
      return levels;
    }
  }, {
    key: 'avc1toavcoti',
    value: function avc1toavcoti(codec) {
      var result,
          avcdata = codec.split('.');
      if (avcdata.length > 2) {
        result = avcdata.shift() + '.';
        result += parseInt(avcdata.shift()).toString(16);
        result += ('00' + parseInt(avcdata.shift()).toString(16)).substr(-4);
      } else {
        result = codec;
      }
      return result;
    }
  }, {
    key: 'parseLevelPlaylist',
    value: function parseLevelPlaylist(string, baseurl, id) {
      var currentSN = 0,
          totalduration = 0,
          level = { url: baseurl, fragments: [], live: true, startSN: 0 },
          result,
          regexp,
          cc = 0;
      regexp = /(?:#EXT-X-(MEDIA-SEQUENCE):(\d+))|(?:#EXT-X-(TARGETDURATION):(\d+))|(?:#EXT(INF):([\d\.]+)[^\r\n]*[\r\n]+([^\r\n]+)|(?:#EXT-X-(ENDLIST))|(?:#EXT-X-(DIS)CONTINUITY))/g;
      while ((result = regexp.exec(string)) !== null) {
        result.shift();
        result = result.filter(function (n) {
          return n !== undefined;
        });
        switch (result[0]) {
          case 'MEDIA-SEQUENCE':
            currentSN = level.startSN = parseInt(result[1]);
            break;
          case 'TARGETDURATION':
            level.targetduration = parseFloat(result[1]);
            break;
          case 'ENDLIST':
            level.live = false;
            break;
          case 'DIS':
            cc++;
            break;
          case 'INF':
            var duration = parseFloat(result[1]);
            level.fragments.push({ url: this.resolve(result[2], baseurl), duration: duration, start: totalduration, sn: currentSN++, level: id, cc: cc });
            totalduration += duration;
            break;
          default:
            break;
        }
      }
      //logger.log('found ' + level.fragments.length + ' fragments');
      level.totalduration = totalduration;
      level.endSN = currentSN - 1;
      return level;
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event, stats) {
      var string = event.currentTarget.responseText,
          url = event.currentTarget.responseURL,
          id = this.id,
          id2 = this.id2,
          levels;
      // responseURL not supported on some browsers (it is used to detect URL redirection)
      if (url === undefined) {
        // fallback to initial URL
        url = this.url;
      }
      stats.tload = new Date();
      stats.mtime = new Date(event.currentTarget.getResponseHeader('Last-Modified'));

      if (string.indexOf('#EXTM3U') === 0) {
        if (string.indexOf('#EXTINF:') > 0) {
          // 1 level playlist
          // if first request, fire manifest loaded event, level will be reloaded afterwards
          // (this is to have a uniform logic for 1 level/multilevel playlists)
          if (this.id === null) {
            _observer2['default'].trigger(_events2['default'].MANIFEST_LOADED, { levels: [{ url: url }],
              url: url,
              stats: stats });
          } else {
            _observer2['default'].trigger(_events2['default'].LEVEL_LOADED, { details: this.parseLevelPlaylist(string, url, id),
              level: id,
              id: id2,
              stats: stats });
          }
        } else {
          levels = this.parseMasterPlaylist(string, url);
          // multi level playlist, parse level info
          if (levels.length) {
            _observer2['default'].trigger(_events2['default'].MANIFEST_LOADED, { levels: levels,
              url: url,
              stats: stats });
          } else {
            _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.MANIFEST_PARSING_ERROR, fatal: true, url: url, reason: 'no level found in manifest' });
          }
        }
      } else {
        _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: _errors.ErrorDetails.MANIFEST_PARSING_ERROR, fatal: true, url: url, reason: 'no EXTM3U delimiter' });
      }
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      var details, fatal;
      if (this.id === null) {
        details = _errors.ErrorDetails.MANIFEST_LOAD_ERROR;
        fatal = true;
      } else {
        details = _errors.ErrorDetails.LEVEL_LOAD_ERROR;
        fatal = false;
      }
      this.loader.abort();
      _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: details, fatal: fatal, url: this.url, loader: this.loader, response: event.currentTarget, level: this.id, id: this.id2 });
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout() {
      var details, fatal;
      if (this.id === null) {
        details = _errors.ErrorDetails.MANIFEST_LOAD_TIMEOUT;
        fatal = true;
      } else {
        details = _errors.ErrorDetails.LEVEL_LOAD_TIMEOUT;
        fatal = false;
      }
      this.loader.abort();
      _observer2['default'].trigger(_events2['default'].ERROR, { type: _errors.ErrorTypes.NETWORK_ERROR, details: details, fatal: fatal, url: this.url, loader: this.loader, level: this.id, id: this.id2 });
    }
  }]);

  return PlaylistLoader;
})();

exports['default'] = PlaylistLoader;
module.exports = exports['default'];

},{"../errors":9,"../events":10,"../observer":14}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var observer = new _events2['default']();

observer.trigger = function trigger(event) {
  for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    data[_key - 1] = arguments[_key];
  }

  observer.emit.apply(observer, [event, event].concat(data));
};

observer.off = function off(event) {
  for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    data[_key2 - 1] = arguments[_key2];
  }

  observer.removeListener.apply(observer, [event].concat(data));
};

exports['default'] = observer;
module.exports = exports['default'];

},{"events":1}],15:[function(require,module,exports){
/**
 * generate MP4 Box
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MP4 = (function () {
  function MP4() {
    _classCallCheck(this, MP4);
  }

  _createClass(MP4, null, [{
    key: 'init',
    value: function init() {
      MP4.types = {
        avc1: [], // codingname
        avcC: [],
        btrt: [],
        dinf: [],
        dref: [],
        esds: [],
        ftyp: [],
        hdlr: [],
        mdat: [],
        mdhd: [],
        mdia: [],
        mfhd: [],
        minf: [],
        moof: [],
        moov: [],
        mp4a: [],
        mvex: [],
        mvhd: [],
        sdtp: [],
        stbl: [],
        stco: [],
        stsc: [],
        stsd: [],
        stsz: [],
        stts: [],
        tfdt: [],
        tfhd: [],
        traf: [],
        trak: [],
        trun: [],
        trex: [],
        tkhd: [],
        vmhd: [],
        smhd: []
      };

      var i;
      for (i in MP4.types) {
        if (MP4.types.hasOwnProperty(i)) {
          MP4.types[i] = [i.charCodeAt(0), i.charCodeAt(1), i.charCodeAt(2), i.charCodeAt(3)];
        }
      }

      MP4.MAJOR_BRAND = new Uint8Array(['i'.charCodeAt(0), 's'.charCodeAt(0), 'o'.charCodeAt(0), 'm'.charCodeAt(0)]);
      MP4.AVC1_BRAND = new Uint8Array(['a'.charCodeAt(0), 'v'.charCodeAt(0), 'c'.charCodeAt(0), '1'.charCodeAt(0)]);
      MP4.MINOR_VERSION = new Uint8Array([0, 0, 0, 1]);
      MP4.VIDEO_HDLR = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x56, 0x69, 0x64, 0x65, 0x6f, 0x48, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'VideoHandler'
      ]);
      MP4.AUDIO_HDLR = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x73, 0x6f, 0x75, 0x6e, // handler_type: 'soun'
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x53, 0x6f, 0x75, 0x6e, 0x64, 0x48, 0x61, 0x6e, 0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'SoundHandler'
      ]);
      MP4.HDLR_TYPES = {
        'video': MP4.VIDEO_HDLR,
        'audio': MP4.AUDIO_HDLR
      };
      MP4.DREF = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // entry_count
      0x00, 0x00, 0x00, 0x0c, // entry_size
      0x75, 0x72, 0x6c, 0x20, // 'url' type
      0x00, // version 0
      0x00, 0x00, 0x01 // entry_flags
      ]);
      MP4.STCO = new Uint8Array([0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00 // entry_count
      ]);
      MP4.STSC = MP4.STCO;
      MP4.STTS = MP4.STCO;
      MP4.STSZ = new Uint8Array([0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // sample_size
      0x00, 0x00, 0x00, 0x00]);
      // sample_count
      MP4.VMHD = new Uint8Array([0x00, // version
      0x00, 0x00, 0x01, // flags
      0x00, 0x00, // graphicsmode
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00 // opcolor
      ]);
      MP4.SMHD = new Uint8Array([0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, // balance
      0x00, 0x00 // reserved
      ]);

      MP4.STSD = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01]); // entry_count

      MP4.FTYP = MP4.box(MP4.types.ftyp, MP4.MAJOR_BRAND, MP4.MINOR_VERSION, MP4.MAJOR_BRAND, MP4.AVC1_BRAND);
      MP4.DINF = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, MP4.DREF));
    }
  }, {
    key: 'box',
    value: function box(type) {
      var payload = Array.prototype.slice.call(arguments, 1),
          size = 0,
          i = payload.length,
          result,
          view;

      // calculate the total size we need to allocate
      while (i--) {
        size += payload[i].byteLength;
      }
      result = new Uint8Array(size + 8);
      view = new DataView(result.buffer);
      view.setUint32(0, result.byteLength);
      result.set(type, 4);

      // copy the payload into the result
      for (i = 0, size = 8; i < payload.length; i++) {
        result.set(payload[i], size);
        size += payload[i].byteLength;
      }
      return result;
    }
  }, {
    key: 'hdlr',
    value: function hdlr(type) {
      return MP4.box(MP4.types.hdlr, MP4.HDLR_TYPES[type]);
    }
  }, {
    key: 'mdat',
    value: function mdat(data) {
      return MP4.box(MP4.types.mdat, data);
    }
  }, {
    key: 'mdhd',
    value: function mdhd(timescale, duration) {
      return MP4.box(MP4.types.mdhd, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x02, // creation_time
      0x00, 0x00, 0x00, 0x03, // modification_time
      timescale >> 24 & 0xFF, timescale >> 16 & 0xFF, timescale >> 8 & 0xFF, timescale & 0xFF, // timescale
      duration >> 24, duration >> 16 & 0xFF, duration >> 8 & 0xFF, duration & 0xFF, // duration
      0x55, 0xc4, // 'und' language (undetermined)
      0x00, 0x00]));
    }
  }, {
    key: 'mdia',
    value: function mdia(track) {
      return MP4.box(MP4.types.mdia, MP4.mdhd(track.timescale, track.duration), MP4.hdlr(track.type), MP4.minf(track));
    }
  }, {
    key: 'mfhd',
    value: function mfhd(sequenceNumber) {
      return MP4.box(MP4.types.mfhd, new Uint8Array([0x00, 0x00, 0x00, 0x00, // flags
      sequenceNumber >> 24, sequenceNumber >> 16 & 0xFF, sequenceNumber >> 8 & 0xFF, sequenceNumber & 0xFF]));
    }
  }, {
    key: 'minf',
    // sequence_number
    value: function minf(track) {
      if (track.type === 'audio') {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.smhd, MP4.SMHD), MP4.DINF, MP4.stbl(track));
      } else {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.vmhd, MP4.VMHD), MP4.DINF, MP4.stbl(track));
      }
    }
  }, {
    key: 'moof',
    value: function moof(sn, baseMediaDecodeTime, track) {
      return MP4.box(MP4.types.moof, MP4.mfhd(sn), MP4.traf(track, baseMediaDecodeTime));
    }

    /**
     * @param tracks... (optional) {array} the tracks associated with this movie
     */
  }, {
    key: 'moov',
    value: function moov(tracks) {
      var i = tracks.length,
          boxes = [];

      while (i--) {
        boxes[i] = MP4.trak(tracks[i]);
      }

      return MP4.box.apply(null, [MP4.types.moov, MP4.mvhd(tracks[0].timescale, tracks[0].duration)].concat(boxes).concat(MP4.mvex(tracks)));
    }
  }, {
    key: 'mvex',
    value: function mvex(tracks) {
      var i = tracks.length,
          boxes = [];

      while (i--) {
        boxes[i] = MP4.trex(tracks[i]);
      }
      return MP4.box.apply(null, [MP4.types.mvex].concat(boxes));
    }
  }, {
    key: 'mvhd',
    value: function mvhd(timescale, duration) {
      var bytes = new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // creation_time
      0x00, 0x00, 0x00, 0x02, // modification_time
      timescale >> 24 & 0xFF, timescale >> 16 & 0xFF, timescale >> 8 & 0xFF, timescale & 0xFF, // timescale
      duration >> 24 & 0xFF, duration >> 16 & 0xFF, duration >> 8 & 0xFF, duration & 0xFF, // duration
      0x00, 0x01, 0x00, 0x00, // 1.0 rate
      0x01, 0x00, // 1.0 volume
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // pre_defined
      0xff, 0xff, 0xff, 0xff // next_track_ID
      ]);
      return MP4.box(MP4.types.mvhd, bytes);
    }
  }, {
    key: 'sdtp',
    value: function sdtp(track) {
      var samples = track.samples || [],
          bytes = new Uint8Array(4 + samples.length),
          flags,
          i;

      // leave the full box header (4 bytes) all zero

      // write the sample table
      for (i = 0; i < samples.length; i++) {
        flags = samples[i].flags;
        bytes[i + 4] = flags.dependsOn << 4 | flags.isDependedOn << 2 | flags.hasRedundancy;
      }

      return MP4.box(MP4.types.sdtp, bytes);
    }
  }, {
    key: 'stbl',
    value: function stbl(track) {
      return MP4.box(MP4.types.stbl, MP4.stsd(track), MP4.box(MP4.types.stts, MP4.STTS), MP4.box(MP4.types.stsc, MP4.STSC), MP4.box(MP4.types.stsz, MP4.STSZ), MP4.box(MP4.types.stco, MP4.STCO));
    }
  }, {
    key: 'avc1',
    value: function avc1(track) {
      var sps = [],
          pps = [],
          i;
      // assemble the SPSs
      for (i = 0; i < track.sps.length; i++) {
        sps.push(track.sps[i].byteLength >>> 8 & 0xFF);
        sps.push(track.sps[i].byteLength & 0xFF); // sequenceParameterSetLength
        sps = sps.concat(Array.prototype.slice.call(track.sps[i])); // SPS
      }

      // assemble the PPSs
      for (i = 0; i < track.pps.length; i++) {
        pps.push(track.pps[i].byteLength >>> 8 & 0xFF);
        pps.push(track.pps[i].byteLength & 0xFF);
        pps = pps.concat(Array.prototype.slice.call(track.pps[i]));
      }

      return MP4.box(MP4.types.avc1, new Uint8Array([0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // data_reference_index
      0x00, 0x00, // pre_defined
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // pre_defined
      track.width >> 8 & 0xFF, track.width & 0xff, // width
      track.height >> 8 & 0xFF, track.height & 0xff, // height
      0x00, 0x48, 0x00, 0x00, // horizresolution
      0x00, 0x48, 0x00, 0x00, // vertresolution
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // frame_count
      0x13, 0x76, 0x69, 0x64, 0x65, 0x6f, 0x6a, 0x73, 0x2d, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x69, 0x62, 0x2d, 0x68, 0x6c, 0x73, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // compressorname
      0x00, 0x18, // depth = 24
      0x11, 0x11]), // pre_defined = -1
      MP4.box(MP4.types.avcC, new Uint8Array([0x01, // configurationVersion
      track.profileIdc, // AVCProfileIndication
      track.profileCompat, // profile_compatibility
      track.levelIdc, // AVCLevelIndication
      0xff // lengthSizeMinusOne, hard-coded to 4 bytes
      ].concat([track.sps.length // numOfSequenceParameterSets
      ]).concat(sps).concat([track.pps.length // numOfPictureParameterSets
      ]).concat(pps))), // "PPS"
      MP4.box(MP4.types.btrt, new Uint8Array([0x00, 0x1c, 0x9c, 0x80, // bufferSizeDB
      0x00, 0x2d, 0xc6, 0xc0, // maxBitrate
      0x00, 0x2d, 0xc6, 0xc0])) // avgBitrate
      );
    }
  }, {
    key: 'esds',
    value: function esds(track) {
      return new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags

      0x03, // descriptor_type
      0x17 + track.config.length, // length
      0x00, 0x01, //es_id
      0x00, // stream_priority

      0x04, // descriptor_type
      0x0f + track.config.length, // length
      0x40, //codec : mpeg4_audio
      0x15, // stream_type
      0x00, 0x00, 0x00, // buffer_size
      0x00, 0x00, 0x00, 0x00, // maxBitrate
      0x00, 0x00, 0x00, 0x00, // avgBitrate

      0x05 // descriptor_type
      ].concat([track.config.length]).concat(track.config).concat([0x06, 0x01, 0x02])); // GASpecificConfig)); // length + audio config descriptor
    }
  }, {
    key: 'mp4a',
    value: function mp4a(track) {
      return MP4.box(MP4.types.mp4a, new Uint8Array([0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // data_reference_index
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // reserved
      0x00, track.channelCount, // channelcount
      0x00, 0x10, // sampleSize:16bits
      0x00, 0x00, 0x00, 0x00, // reserved2
      track.audiosamplerate >> 8 & 0xFF, track.audiosamplerate & 0xff, //
      0x00, 0x00]), MP4.box(MP4.types.esds, MP4.esds(track)));
    }
  }, {
    key: 'stsd',
    value: function stsd(track) {
      if (track.type === 'audio') {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp4a(track));
      } else {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.avc1(track));
      }
    }
  }, {
    key: 'tkhd',
    value: function tkhd(track) {
      return MP4.box(MP4.types.tkhd, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x07, // flags
      0x00, 0x00, 0x00, 0x00, // creation_time
      0x00, 0x00, 0x00, 0x00, // modification_time
      track.id >> 24 & 0xFF, track.id >> 16 & 0xFF, track.id >> 8 & 0xFF, track.id & 0xFF, // track_ID
      0x00, 0x00, 0x00, 0x00, // reserved
      track.duration >> 24, track.duration >> 16 & 0xFF, track.duration >> 8 & 0xFF, track.duration & 0xFF, // duration
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, // layer
      0x00, 0x00, // alternate_group
      0x00, 0x00, // non-audio track volume
      0x00, 0x00, // reserved
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
      track.width >> 8 & 0xFF, track.width & 0xFF, 0x00, 0x00, // width
      track.height >> 8 & 0xFF, track.height & 0xFF, 0x00, 0x00 // height
      ]));
    }
  }, {
    key: 'traf',
    value: function traf(track, baseMediaDecodeTime) {
      var sampleDependencyTable = MP4.sdtp(track);
      return MP4.box(MP4.types.traf, MP4.box(MP4.types.tfhd, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      track.id >> 24, track.id >> 16 & 0XFF, track.id >> 8 & 0XFF, track.id & 0xFF])), // track_ID
      MP4.box(MP4.types.tfdt, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      baseMediaDecodeTime >> 24, baseMediaDecodeTime >> 16 & 0XFF, baseMediaDecodeTime >> 8 & 0XFF, baseMediaDecodeTime & 0xFF])), // baseMediaDecodeTime
      MP4.trun(track, sampleDependencyTable.length + 16 + // tfhd
      16 + // tfdt
      8 + // traf header
      16 + // mfhd
      8 + // moof header
      8), // mdat header
      sampleDependencyTable);
    }

    /**
     * Generate a track box.
     * @param track {object} a track definition
     * @return {Uint8Array} the track box
     */
  }, {
    key: 'trak',
    value: function trak(track) {
      track.duration = track.duration || 0xffffffff;
      return MP4.box(MP4.types.trak, MP4.tkhd(track), MP4.mdia(track));
    }
  }, {
    key: 'trex',
    value: function trex(track) {
      return MP4.box(MP4.types.trex, new Uint8Array([0x00, // version 0
      0x00, 0x00, 0x00, // flags
      track.id >> 24, track.id >> 16 & 0XFF, track.id >> 8 & 0XFF, track.id & 0xFF, // track_ID
      0x00, 0x00, 0x00, 0x01, // default_sample_description_index
      0x00, 0x00, 0x00, 0x00, // default_sample_duration
      0x00, 0x00, 0x00, 0x00, // default_sample_size
      0x00, 0x01, 0x00, 0x01 // default_sample_flags
      ]));
    }
  }, {
    key: 'trun',
    value: function trun(track, offset) {
      var samples, sample, i, array;

      samples = track.samples || [];
      array = new Uint8Array(12 + 16 * samples.length);
      offset += 8 + array.byteLength;

      array.set([0x00, // version 0
      0x00, 0x0f, 0x01, // flags
      samples.length >>> 24 & 0xFF, samples.length >>> 16 & 0xFF, samples.length >>> 8 & 0xFF, samples.length & 0xFF, // sample_count
      offset >>> 24 & 0xFF, offset >>> 16 & 0xFF, offset >>> 8 & 0xFF, offset & 0xFF // data_offset
      ], 0);

      for (i = 0; i < samples.length; i++) {
        sample = samples[i];
        array.set([sample.duration >>> 24 & 0xFF, sample.duration >>> 16 & 0xFF, sample.duration >>> 8 & 0xFF, sample.duration & 0xFF, // sample_duration
        sample.size >>> 24 & 0xFF, sample.size >>> 16 & 0xFF, sample.size >>> 8 & 0xFF, sample.size & 0xFF, // sample_size
        sample.flags.isLeading << 2 | sample.flags.dependsOn, sample.flags.isDependedOn << 6 | sample.flags.hasRedundancy << 4 | sample.flags.paddingValue << 1 | sample.flags.isNonSync, sample.flags.degradPrio & 0xF0 << 8, sample.flags.degradPrio & 0x0F, // sample_flags
        sample.cts >>> 24 & 0xFF, sample.cts >>> 16 & 0xFF, sample.cts >>> 8 & 0xFF, sample.cts & 0xFF // sample_composition_time_offset
        ], 12 + 16 * i);
      }
      return MP4.box(MP4.types.trun, array);
    }
  }, {
    key: 'initSegment',
    value: function initSegment(tracks) {

      if (!MP4.types) {
        MP4.init();
      }
      var movie = MP4.moov(tracks),
          result;

      result = new Uint8Array(MP4.FTYP.byteLength + movie.byteLength);
      result.set(MP4.FTYP);
      result.set(movie, MP4.FTYP.byteLength);
      return result;
    }
  }]);

  return MP4;
})();

exports['default'] = MP4;
module.exports = exports['default'];

},{}],16:[function(require,module,exports){
/*
* Stats Handler
*
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

var StatsHandler = (function () {
  function StatsHandler(hls) {
    _classCallCheck(this, StatsHandler);

    this.hls = hls;
    this.onmp = this.onManifestParsed.bind(this);
    this.onfc = this.onFragmentChanged.bind(this);
    this.onfb = this.onFragmentBuffered.bind(this);
    this.onflea = this.onFragmentLoadEmergencyAborted.bind(this);
    this.onerr = this.onError.bind(this);
    this.onfpsd = this.onFPSDrop.bind(this);
    _observer2['default'].on(_events2['default'].MANIFEST_PARSED, this.onmp);
    _observer2['default'].on(_events2['default'].FRAG_BUFFERED, this.onfb);
    _observer2['default'].on(_events2['default'].FRAG_CHANGED, this.onfc);
    _observer2['default'].on(_events2['default'].ERROR, this.onerr);
    _observer2['default'].on(_events2['default'].FRAG_LOAD_EMERGENCY_ABORTED, this.onflea);
    _observer2['default'].on(_events2['default'].FPS_DROP, this.onfpsd);
  }

  _createClass(StatsHandler, [{
    key: 'destroy',
    value: function destroy() {
      _observer2['default'].off(_events2['default'].MANIFEST_PARSED, this.onmp);
      _observer2['default'].off(_events2['default'].FRAG_BUFFERED, this.onfb);
      _observer2['default'].off(_events2['default'].FRAG_CHANGED, this.onfc);
      _observer2['default'].off(_events2['default'].ERROR, this.onerr);
      _observer2['default'].off(_events2['default'].FRAG_LOAD_EMERGENCY_ABORTED, this.onflea);
      _observer2['default'].off(_events2['default'].FPS_DROP, this.onfpsd);
    }
  }, {
    key: 'attachVideo',
    value: function attachVideo(video) {
      this.video = video;
    }
  }, {
    key: 'detachVideo',
    value: function detachVideo() {
      this.video = null;
    }

    // reset stats on manifest parsed
  }, {
    key: 'onManifestParsed',
    value: function onManifestParsed(event, data) {
      this._stats = { tech: 'hls.js', levelNb: data.levels.length };
    }

    // on fragment changed is triggered whenever playback of a new fragment is starting ...
  }, {
    key: 'onFragmentChanged',
    value: function onFragmentChanged(event, data) {
      var stats = this._stats,
          level = data.frag.level,
          autoLevel = data.frag.autoLevel;
      if (stats) {
        if (stats.levelStart === undefined) {
          stats.levelStart = level;
        }
        if (autoLevel) {
          if (stats.fragChangedAuto) {
            stats.autoLevelMin = Math.min(stats.autoLevelMin, level);
            stats.autoLevelMax = Math.max(stats.autoLevelMax, level);
            stats.fragChangedAuto++;
            if (this.levelLastAuto && level !== stats.autoLevelLast) {
              stats.autoLevelSwitch++;
            }
          } else {
            stats.autoLevelMin = stats.autoLevelMax = level;
            stats.autoLevelSwitch = 0;
            stats.fragChangedAuto = 1;
            this.sumAutoLevel = 0;
          }
          this.sumAutoLevel += level;
          stats.autoLevelAvg = Math.round(1000 * this.sumAutoLevel / stats.fragChangedAuto) / 1000;
          stats.autoLevelLast = level;
        } else {
          if (stats.fragChangedManual) {
            stats.manualLevelMin = Math.min(stats.manualLevelMin, level);
            stats.manualLevelMax = Math.max(stats.manualLevelMax, level);
            stats.fragChangedManual++;
            if (!this.levelLastAuto && level !== stats.manualLevelLast) {
              stats.manualLevelSwitch++;
            }
          } else {
            stats.manualLevelMin = stats.manualLevelMax = level;
            stats.manualLevelSwitch = 0;
            stats.fragChangedManual = 1;
          }
          stats.manualLevelLast = level;
        }
        this.levelLastAuto = autoLevel;
      }
    }

    // triggered each time a new fragment is buffered
  }, {
    key: 'onFragmentBuffered',
    value: function onFragmentBuffered(event, data) {
      var stats = this._stats,
          latency = data.stats.tfirst - data.stats.trequest,
          process = data.stats.tbuffered - data.stats.trequest,
          bitrate = Math.round(8 * data.stats.length / (data.stats.tbuffered - data.stats.tfirst));
      if (stats.fragBuffered) {
        stats.fragMinLatency = Math.min(stats.fragMinLatency, latency);
        stats.fragMaxLatency = Math.max(stats.fragMaxLatency, latency);
        stats.fragMinProcess = Math.min(stats.fragMinProcess, process);
        stats.fragMaxProcess = Math.max(stats.fragMaxProcess, process);
        stats.fragMinKbps = Math.min(stats.fragMinKbps, bitrate);
        stats.fragMaxKbps = Math.max(stats.fragMaxKbps, bitrate);
        stats.autoLevelCappingMin = Math.min(stats.autoLevelCappingMin, this.hls.autoLevelCapping);
        stats.autoLevelCappingMax = Math.max(stats.autoLevelCappingMax, this.hls.autoLevelCapping);
        stats.fragBuffered++;
      } else {
        stats.fragMinLatency = stats.fragMaxLatency = latency;
        stats.fragMinProcess = stats.fragMaxProcess = process;
        stats.fragMinKbps = stats.fragMaxKbps = bitrate;
        stats.fragBuffered = 1;
        stats.fragBufferedBytes = 0;
        stats.autoLevelCappingMin = stats.autoLevelCappingMax = this.hls.autoLevelCapping;
        this.sumLatency = 0;
        this.sumKbps = 0;
        this.sumProcess = 0;
      }
      stats.fraglastLatency = latency;
      this.sumLatency += latency;
      stats.fragAvgLatency = Math.round(this.sumLatency / stats.fragBuffered);
      stats.fragLastProcess = process;
      this.sumProcess += process;
      stats.fragAvgProcess = Math.round(this.sumProcess / stats.fragBuffered);
      stats.fragLastKbps = bitrate;
      this.sumKbps += bitrate;
      stats.fragAvgKbps = Math.round(this.sumKbps / stats.fragBuffered);
      stats.fragBufferedBytes += data.stats.length;
      stats.autoLevelCappingLast = this.hls.autoLevelCapping;
    }
  }, {
    key: 'onFragmentLoadEmergencyAborted',
    value: function onFragmentLoadEmergencyAborted() {
      var stats = this._stats;
      if (stats) {
        if (stats.fragLoadEmergencyAborted === undefined) {
          stats.fragLoadEmergencyAborted = 1;
        } else {
          stats.fragLoadEmergencyAborted++;
        }
      }
    }
  }, {
    key: 'onError',
    value: function onError(event, data) {
      var stats = this._stats;
      if (stats) {
        // track all errors independently
        if (stats[data.details] === undefined) {
          stats[data.details] = 1;
        } else {
          stats[data.details] += 1;
        }
        // track fatal error
        if (data.fatal) {
          if (stats.fatalError === undefined) {
            stats.fatalError = 1;
          } else {
            stats.fatalError += 1;
          }
        }
      }
    }
  }, {
    key: 'onFPSDrop',
    value: function onFPSDrop(event, data) {
      var stats = this._stats;
      if (stats) {
        if (stats.fpsDropEvent === undefined) {
          stats.fpsDropEvent = 1;
        } else {
          stats.fpsDropEvent++;
        }
        stats.fpsTotalDroppedFrames = data.totalDroppedFrames;
      }
    }
  }, {
    key: 'stats',
    get: function get() {
      if (this.video) {
        this._stats.lastPos = this.video.currentTime.toFixed(3);
      }
      return this._stats;
    }
  }]);

  return StatsHandler;
})();

exports['default'] = StatsHandler;
module.exports = exports['default'];

},{"./events":10,"./observer":14}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function noop() {}
var fakeLogger = {
  log: noop,
  warn: noop,
  info: noop,
  error: noop
};
var exportedLogger = fakeLogger;

var enableLogs = function enableLogs(debug) {
  if (debug === true || typeof debug === 'object') {
    exportedLogger.log = debug.log ? debug.log.bind(debug) : console.log.bind(console);
    exportedLogger.info = debug.info ? debug.info.bind(debug) : console.info.bind(console);
    exportedLogger.error = debug.error ? debug.error.bind(debug) : console.error.bind(console);
    exportedLogger.warn = debug.warn ? debug.warn.bind(debug) : console.warn.bind(console);

    // Some browsers don't allow to use bind on console object anyway
    // fallback to default if needed
    try {
      exportedLogger.log();
    } catch (e) {
      exportedLogger.log = noop;
      exportedLogger.info = noop;
      exportedLogger.error = noop;
      exportedLogger.warn = noop;
    }
  } else {
    exportedLogger = fakeLogger;
  }
};
exports.enableLogs = enableLogs;
var logger = exportedLogger;
exports.logger = logger;

},{}],18:[function(require,module,exports){
/*
 * Xhr based Loader
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLogger = require('../utils/logger');

var XhrLoader = (function () {
  function XhrLoader() {
    _classCallCheck(this, XhrLoader);
  }

  _createClass(XhrLoader, [{
    key: 'destroy',
    value: function destroy() {
      this.abort();
      this.loader = null;
    }
  }, {
    key: 'abort',
    value: function abort() {
      if (this.loader && this.loader.readyState !== 4) {
        this.stats.aborted = true;
        this.loader.abort();
      }
      if (this.timeoutHandle) {
        window.clearTimeout(this.timeoutHandle);
      }
    }
  }, {
    key: 'load',
    value: function load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay) {
      var onProgress = arguments.length <= 8 || arguments[8] === undefined ? null : arguments[8];

      this.url = url;
      this.responseType = responseType;
      this.onSuccess = onSuccess;
      this.onProgress = onProgress;
      this.onTimeout = onTimeout;
      this.onError = onError;
      this.stats = { trequest: new Date(), retry: 0 };
      this.timeout = timeout;
      this.maxRetry = maxRetry;
      this.retryDelay = retryDelay;
      this.timeoutHandle = window.setTimeout(this.loadtimeout.bind(this), timeout);
      this.loadInternal();
    }
  }, {
    key: 'loadInternal',
    value: function loadInternal() {
      var xhr = this.loader = new XMLHttpRequest();
      xhr.onload = this.loadsuccess.bind(this);
      xhr.onerror = this.loaderror.bind(this);
      xhr.onprogress = this.loadprogress.bind(this);
      xhr.open('GET', this.url, true);
      xhr.responseType = this.responseType;
      this.stats.tfirst = null;
      this.stats.loaded = 0;
      xhr.send();
    }
  }, {
    key: 'loadsuccess',
    value: function loadsuccess(event) {
      window.clearTimeout(this.timeoutHandle);
      this.stats.tload = new Date();
      this.onSuccess(event, this.stats);
    }
  }, {
    key: 'loaderror',
    value: function loaderror(event) {
      if (this.stats.retry < this.maxRetry) {
        _utilsLogger.logger.warn(event.type + ' while loading ' + this.url + ', retrying in ' + this.retryDelay + '...');
        this.destroy();
        window.setTimeout(this.loadInternal.bind(this), this.retryDelay);
        // exponential backoff
        this.retryDelay = Math.min(2 * this.retryDelay, 64000);
        this.stats.retry++;
      } else {
        window.clearTimeout(this.timeoutHandle);
        _utilsLogger.logger.error(event.type + ' while loading ' + this.url);
        this.onError(event);
      }
    }
  }, {
    key: 'loadtimeout',
    value: function loadtimeout(event) {
      _utilsLogger.logger.warn('timeout while loading ' + this.url);
      this.onTimeout(event, this.stats);
    }
  }, {
    key: 'loadprogress',
    value: function loadprogress(event) {
      var stats = this.stats;
      if (stats.tfirst === null) {
        stats.tfirst = new Date();
      }
      stats.loaded = event.loaded;
      if (this.onProgress) {
        this.onProgress(event, stats);
      }
    }
  }]);

  return XhrLoader;
})();

exports['default'] = XhrLoader;
module.exports = exports['default'];

},{"../utils/logger":17}]},{},[11])(11)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3dlYndvcmtpZnkvaW5kZXguanMiLCIvVXNlcnMvZy5kdXBvbnRhdmljZS93b3JrZGlyL2dpdGh1Yi9obHMuanMvc3JjL2NvbnRyb2xsZXIvYnVmZmVyLWNvbnRyb2xsZXIuanMiLCIvVXNlcnMvZy5kdXBvbnRhdmljZS93b3JrZGlyL2dpdGh1Yi9obHMuanMvc3JjL2NvbnRyb2xsZXIvbGV2ZWwtY29udHJvbGxlci5qcyIsIi9Vc2Vycy9nLmR1cG9udGF2aWNlL3dvcmtkaXIvZ2l0aHViL2hscy5qcy9zcmMvZGVtdXgvZGVtdXhlci5qcyIsIi9Vc2Vycy9nLmR1cG9udGF2aWNlL3dvcmtkaXIvZ2l0aHViL2hscy5qcy9zcmMvZGVtdXgvZXhwLWdvbG9tYi5qcyIsIi9Vc2Vycy9nLmR1cG9udGF2aWNlL3dvcmtkaXIvZ2l0aHViL2hscy5qcy9zcmMvZGVtdXgvdHNkZW11eGVyLmpzIiwiL1VzZXJzL2cuZHVwb250YXZpY2Uvd29ya2Rpci9naXRodWIvaGxzLmpzL3NyYy9kZW11eC90c2RlbXV4ZXJ3b3JrZXIuanMiLCIvVXNlcnMvZy5kdXBvbnRhdmljZS93b3JrZGlyL2dpdGh1Yi9obHMuanMvc3JjL2Vycm9ycy5qcyIsIi9Vc2Vycy9nLmR1cG9udGF2aWNlL3dvcmtkaXIvZ2l0aHViL2hscy5qcy9zcmMvZXZlbnRzLmpzIiwiL1VzZXJzL2cuZHVwb250YXZpY2Uvd29ya2Rpci9naXRodWIvaGxzLmpzL3NyYy9obHMuanMiLCIvVXNlcnMvZy5kdXBvbnRhdmljZS93b3JrZGlyL2dpdGh1Yi9obHMuanMvc3JjL2xvYWRlci9mcmFnbWVudC1sb2FkZXIuanMiLCIvVXNlcnMvZy5kdXBvbnRhdmljZS93b3JrZGlyL2dpdGh1Yi9obHMuanMvc3JjL2xvYWRlci9wbGF5bGlzdC1sb2FkZXIuanMiLCIvVXNlcnMvZy5kdXBvbnRhdmljZS93b3JrZGlyL2dpdGh1Yi9obHMuanMvc3JjL29ic2VydmVyLmpzIiwiL1VzZXJzL2cuZHVwb250YXZpY2Uvd29ya2Rpci9naXRodWIvaGxzLmpzL3NyYy9yZW11eC9tcDQtZ2VuZXJhdG9yLmpzIiwiL1VzZXJzL2cuZHVwb250YXZpY2Uvd29ya2Rpci9naXRodWIvaGxzLmpzL3NyYy9zdGF0cy5qcyIsIi9Vc2Vycy9nLmR1cG9udGF2aWNlL3dvcmtkaXIvZ2l0aHViL2hscy5qcy9zcmMvdXRpbHMvbG9nZ2VyLmpzIiwiL1VzZXJzL2cuZHVwb250YXZpY2Uvd29ya2Rpci9naXRodWIvaGxzLmpzL3NyYy91dGlscy94aHItbG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUksRUFBRSxJQUFJLEVBQUUsSUFBSTtBQUN0QixVQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0FBQ3RCLFVBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO09BQzdCLENBQUMsQ0FBQztBQUNILFNBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FDOUIsSUFBSTtBQUNKLFVBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtBQUNoQixVQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0FBQ3RCLFVBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtBQUN0QixVQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO0FBQ3RCLFVBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJO09BQzdCLENBQUMsQ0FBQztBQUNILFNBQUcsQ0FBQyxVQUFVLEdBQUc7QUFDZixlQUFPLEVBQUMsR0FBRyxDQUFDLFVBQVU7QUFDdEIsZUFBTyxFQUFDLEdBQUcsQ0FBQyxVQUFVO09BQ3ZCLENBQUM7QUFDRixTQUFHLENBQUMsSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLENBQ3hCLElBQUk7QUFDSixVQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDaEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVB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QUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFDdEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFDdEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFDdEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtPQUN2QixDQUFDLENBQUM7QUFDTCxhQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdkM7OztXQUVVLGNBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQ0UsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRTtVQUM3QixLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7VUFDMUMsS0FBSztVQUNMLENBQUMsQ0FBQzs7Ozs7QUFLSixXQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsYUFBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDekIsYUFBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxBQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQyxHQUNqQyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQUFBQyxHQUN4QixLQUFLLENBQUMsYUFBYSxBQUFDLENBQUM7T0FDekI7O0FBRUQsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUNsQixLQUFLLENBQUMsQ0FBQztLQUNuQjs7O1dBRVUsY0FBQyxLQUFLLEVBQUU7QUFDakIsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUNqQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDakMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ2pDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDL0M7OztXQUVVLGNBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQUksR0FBRyxHQUFHLEVBQUU7VUFBRSxHQUFHLEdBQUcsRUFBRTtVQUFFLENBQUMsQ0FBQzs7QUFFMUIsV0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQyxXQUFHLENBQUMsSUFBSSxDQUFDLEFBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssQ0FBQyxHQUFJLElBQUksQ0FBQyxDQUFDO0FBQ2pELFdBQUcsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFFLENBQUM7QUFDM0MsV0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzVEOzs7QUFHRCxXQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JDLFdBQUcsQ0FBQyxJQUFJLENBQUMsQUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxDQUFDLEdBQUksSUFBSSxDQUFDLENBQUM7QUFDakQsV0FBRyxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUUsQ0FBQztBQUMzQyxXQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDNUQ7O0FBRUQsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksVUFBVSxDQUFDLENBQzFDLElB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QUk7QUFDVixVQUFJLEVBQUUsSUFBSTtBQUNWLFVBQUksRUFBRSxJQUFJO0FBQ1YsVUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFDdEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFDdEIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN0QixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQ3RCLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDdEIsQUFBQyxXQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBSSxJQUFJLEVBQ3pCLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUNsQixJQUFJLEVBQUUsSUFBSTtBQUNWLEFBQUMsV0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUksSUFBSSxFQUMxQixLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksRUFDbkIsSUFBSSxFQUFFLElBQUk7T0FDWCxDQUFDLENBQUMsQ0FBQztLQUNMOzs7V0FFVSxjQUFDLEtBQUssRUFBQyxtQkFBbUIsRUFBRTtBQUNyQyxVQUFJLHFCQUFxQixHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUNsQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksVUFBVSxDQUFDLENBQ3JDLElBQUk7QUFDSixVQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFDZixXQUFL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O0FBQ3pELFlBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDckI7S0FDRjs7O1dBRVUscUJBQUMsS0FBSyxFQUFFO0FBQ2pCLDBCQUFPLElBQUksNEJBQTBCLElBQUksQ0FBQyxHQUFHLENBQUksQ0FBQztBQUNsRCxVQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEM7OztXQUVXLHNCQUFDLEtBQUssRUFBRTtBQUNsQixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLFVBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDeEIsYUFBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO09BQzNCO0FBQ0QsV0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzVCLFVBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNsQixZQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztPQUMvQjtLQUNGOzs7U0FsRkksU0FBUzs7O3FCQXFGRCxTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsInZhciBidW5kbGVGbiA9IGFyZ3VtZW50c1szXTtcbnZhciBzb3VyY2VzID0gYXJndW1lbnRzWzRdO1xudmFyIGNhY2hlID0gYXJndW1lbnRzWzVdO1xuXG52YXIgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgd2tleTtcbiAgICB2YXIgY2FjaGVLZXlzID0gT2JqZWN0LmtleXMoY2FjaGUpO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FjaGVLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICBpZiAoY2FjaGVba2V5XS5leHBvcnRzID09PSBmbikge1xuICAgICAgICAgICAgd2tleSA9IGtleTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmICghd2tleSkge1xuICAgICAgICB3a2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgICAgIHZhciB3Y2FjaGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICAgICAgd2NhY2hlW2tleV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlc1t3a2V5XSA9IFtcbiAgICAgICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZScsJ21vZHVsZScsJ2V4cG9ydHMnXSwgJygnICsgZm4gKyAnKShzZWxmKScpLFxuICAgICAgICAgICAgd2NhY2hlXG4gICAgICAgIF07XG4gICAgfVxuICAgIHZhciBza2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgXG4gICAgdmFyIHNjYWNoZSA9IHt9OyBzY2FjaGVbd2tleV0gPSB3a2V5O1xuICAgIHNvdXJjZXNbc2tleV0gPSBbXG4gICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZSddLCdyZXF1aXJlKCcgKyBzdHJpbmdpZnkod2tleSkgKyAnKShzZWxmKScpLFxuICAgICAgICBzY2FjaGVcbiAgICBdO1xuICAgIFxuICAgIHZhciBzcmMgPSAnKCcgKyBidW5kbGVGbiArICcpKHsnXG4gICAgICAgICsgT2JqZWN0LmtleXMoc291cmNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnkoa2V5KSArICc6WydcbiAgICAgICAgICAgICAgICArIHNvdXJjZXNba2V5XVswXVxuICAgICAgICAgICAgICAgICsgJywnICsgc3RyaW5naWZ5KHNvdXJjZXNba2V5XVsxXSkgKyAnXSdcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSkuam9pbignLCcpXG4gICAgICAgICsgJ30se30sWycgKyBzdHJpbmdpZnkoc2tleSkgKyAnXSknXG4gICAgO1xuICAgIFxuICAgIHZhciBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwgfHwgd2luZG93Lm1velVSTCB8fCB3aW5kb3cubXNVUkw7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChcbiAgICAgICAgbmV3IEJsb2IoW3NyY10sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSlcbiAgICApKTtcbn07XG4iLCIvKlxuICogYnVmZmVyIGNvbnRyb2xsZXJcbiAqXG4gKi9cblxuIGltcG9ydCBFdmVudCAgICAgICAgICAgICAgICBmcm9tICcuLi9ldmVudHMnO1xuIGltcG9ydCBvYnNlcnZlciAgICAgICAgICAgICBmcm9tICcuLi9vYnNlcnZlcic7XG4gaW1wb3J0IHtsb2dnZXJ9ICAgICAgICAgICAgIGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG4gaW1wb3J0IERlbXV4ZXIgICAgICAgICAgICAgIGZyb20gJy4uL2RlbXV4L2RlbXV4ZXInO1xuIGltcG9ydCB7RXJyb3JUeXBlcyxFcnJvckRldGFpbHN9IGZyb20gJy4uL2Vycm9ycyc7XG5cbiBjbGFzcyBCdWZmZXJDb250cm9sbGVyIHtcblxuICBjb25zdHJ1Y3RvcihobHMpIHtcbiAgICB0aGlzLkVSUk9SID0gLTI7XG4gICAgdGhpcy5TVEFSVElORyA9IC0xO1xuICAgIHRoaXMuSURMRSA9IDA7XG4gICAgdGhpcy5MT0FESU5HID0gIDE7XG4gICAgdGhpcy5XQUlUSU5HX0xFVkVMID0gMjtcbiAgICB0aGlzLlBBUlNJTkcgPSAzO1xuICAgIHRoaXMuUEFSU0VEID0gNDtcbiAgICB0aGlzLkFQUEVORElORyA9IDU7XG4gICAgdGhpcy5CVUZGRVJfRkxVU0hJTkcgPSA2O1xuICAgIHRoaXMuY29uZmlnID0gaGxzLmNvbmZpZztcbiAgICB0aGlzLnN0YXJ0UG9zaXRpb24gPSAwO1xuICAgIHRoaXMuaGxzID0gaGxzO1xuICAgIC8vIFNvdXJjZSBCdWZmZXIgbGlzdGVuZXJzXG4gICAgdGhpcy5vbnNidWUgPSB0aGlzLm9uU291cmNlQnVmZmVyVXBkYXRlRW5kLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbnNiZSAgPSB0aGlzLm9uU291cmNlQnVmZmVyRXJyb3IuYmluZCh0aGlzKTtcbiAgICAvLyBpbnRlcm5hbCBsaXN0ZW5lcnNcbiAgICB0aGlzLm9ubXNlID0gdGhpcy5vbk1TRUF0dGFjaGVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbm1zZWQgPSB0aGlzLm9uTVNFRGV0YWNoZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9ubXAgPSB0aGlzLm9uTWFuaWZlc3RQYXJzZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9ubGwgPSB0aGlzLm9uTGV2ZWxMb2FkZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uZmwgPSB0aGlzLm9uRnJhZ21lbnRMb2FkZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uaXMgPSB0aGlzLm9uSW5pdFNlZ21lbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uZnBnID0gdGhpcy5vbkZyYWdtZW50UGFyc2luZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25mcCA9IHRoaXMub25GcmFnbWVudFBhcnNlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25lcnIgPSB0aGlzLm9uRXJyb3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9udGljayA9IHRoaXMudGljay5iaW5kKHRoaXMpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50Lk1TRV9BVFRBQ0hFRCwgdGhpcy5vbm1zZSk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuTVNFX0RFVEFDSEVELCB0aGlzLm9ubXNlZCk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuTUFOSUZFU1RfUEFSU0VELCB0aGlzLm9ubXApO1xuICB9XG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gICAgb2JzZXJ2ZXIub2ZmKEV2ZW50Lk1BTklGRVNUX1BBUlNFRCwgdGhpcy5vbm1wKTtcbiAgICAvLyByZW1vdmUgdmlkZW8gbGlzdGVuZXJcbiAgICBpZih0aGlzLnZpZGVvKSB7XG4gICAgICB0aGlzLnZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlZWtpbmcnLHRoaXMub252c2Vla2luZyk7XG4gICAgICB0aGlzLnZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlZWtlZCcsdGhpcy5vbnZzZWVrZWQpO1xuICAgICAgdGhpcy52aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkZWRtZXRhZGF0YScsdGhpcy5vbnZtZXRhZGF0YSk7XG4gICAgICB0aGlzLm9udnNlZWtpbmcgPSB0aGlzLm9udnNlZWtlZCA9IHRoaXMub252bWV0YWRhdGEgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0gdGhpcy5JRExFO1xuICB9XG5cbiAgc3RhcnRMb2FkKCkge1xuICAgIGlmKHRoaXMubGV2ZWxzICYmIHRoaXMudmlkZW8pIHtcbiAgICAgIHRoaXMuc3RhcnRJbnRlcm5hbCgpO1xuICAgICAgaWYodGhpcy5sYXN0Q3VycmVudFRpbWUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhgc2Vla2luZyBAICR7dGhpcy5sYXN0Q3VycmVudFRpbWV9YCk7XG4gICAgICAgIHRoaXMubmV4dExvYWRQb3NpdGlvbiA9IHRoaXMuc3RhcnRQb3NpdGlvbiA9IHRoaXMubGFzdEN1cnJlbnRUaW1lO1xuICAgICAgICBpZighdGhpcy5sYXN0UGF1c2VkKSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZyhgcmVzdW1pbmcgdmlkZW9gKTtcbiAgICAgICAgICB0aGlzLnZpZGVvLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5JRExFO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5uZXh0TG9hZFBvc2l0aW9uID0gdGhpcy5zdGFydFBvc2l0aW9uO1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5TVEFSVElORztcbiAgICAgIH1cbiAgICAgIHRoaXMudGljaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIud2FybihgY2Fubm90IHN0YXJ0IGxvYWRpbmcgYXMgZWl0aGVyIG1hbmlmZXN0IG5vdCBwYXJzZWQgb3IgdmlkZW8gbm90IGF0dGFjaGVkYCk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRJbnRlcm5hbCgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLmRlbXV4ZXIgPSBuZXcgRGVtdXhlcih0aGlzLmNvbmZpZyk7XG4gICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKHRoaXMub250aWNrLCAxMDApO1xuICAgIHRoaXMubGV2ZWwgPSAtMTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5GUkFHX0xPQURFRCwgdGhpcy5vbmZsKTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5GUkFHX1BBUlNJTkdfSU5JVF9TRUdNRU5ULCB0aGlzLm9uaXMpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50LkZSQUdfUEFSU0lOR19EQVRBLCB0aGlzLm9uZnBnKTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5GUkFHX1BBUlNFRCwgdGhpcy5vbmZwKTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5FUlJPUiwgdGhpcy5vbmVycik7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuTEVWRUxfTE9BREVELCB0aGlzLm9ubGwpO1xuICB9XG5cblxuICBzdG9wKCkge1xuICAgIHRoaXMubXA0c2VnbWVudHMgPSBbXTtcbiAgICB0aGlzLmZsdXNoUmFuZ2UgPSBbXTtcbiAgICB0aGlzLmJ1ZmZlclJhbmdlID0gW107XG4gICAgaWYodGhpcy5mcmFnKSB7XG4gICAgICBpZih0aGlzLmZyYWcubG9hZGVyKSB7XG4gICAgICAgIHRoaXMuZnJhZy5sb2FkZXIuYWJvcnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZnJhZyA9IG51bGw7XG4gICAgfVxuICAgIGlmKHRoaXMuc291cmNlQnVmZmVyKSB7XG4gICAgICBmb3IodmFyIHR5cGUgaW4gdGhpcy5zb3VyY2VCdWZmZXIpIHtcbiAgICAgICAgdmFyIHNiID0gdGhpcy5zb3VyY2VCdWZmZXJbdHlwZV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5tZWRpYVNvdXJjZS5yZW1vdmVTb3VyY2VCdWZmZXIoc2IpO1xuICAgICAgICAgIHNiLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3VwZGF0ZWVuZCcsIHRoaXMub25zYnVlKTtcbiAgICAgICAgICBzYi5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMub25zYmUpO1xuICAgICAgICB9IGNhdGNoKGVycikge1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc291cmNlQnVmZmVyID0gbnVsbDtcbiAgICB9XG4gICAgaWYodGhpcy50aW1lcikge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIH1cbiAgICBpZih0aGlzLmRlbXV4ZXIpIHtcbiAgICAgIHRoaXMuZGVtdXhlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLmRlbXV4ZXIgPSBudWxsO1xuICAgIH1cbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRlJBR19MT0FERUQsIHRoaXMub25mbCk7XG4gICAgb2JzZXJ2ZXIub2ZmKEV2ZW50LkZSQUdfUEFSU0VELCB0aGlzLm9uZnApO1xuICAgIG9ic2VydmVyLm9mZihFdmVudC5GUkFHX1BBUlNJTkdfREFUQSwgdGhpcy5vbmZwZyk7XG4gICAgb2JzZXJ2ZXIub2ZmKEV2ZW50LkxFVkVMX0xPQURFRCwgdGhpcy5vbmxsKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRlJBR19QQVJTSU5HX0lOSVRfU0VHTUVOVCwgdGhpcy5vbmlzKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRVJST1IsIHRoaXMub25lcnIpO1xuICB9XG5cbiAgdGljaygpIHtcbiAgICB2YXIgcG9zLGxldmVsLGxldmVsRGV0YWlscyxmcmFnSWR4O1xuICAgIHN3aXRjaCh0aGlzLnN0YXRlKSB7XG4gICAgICBjYXNlIHRoaXMuRVJST1I6XG4gICAgICAgIC8vZG9uJ3QgZG8gYW55dGhpbmcgaW4gZXJyb3Igc3RhdGUgdG8gYXZvaWQgYnJlYWtpbmcgZnVydGhlciAuLi5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuU1RBUlRJTkc6XG4gICAgICAgIC8vIGRldGVybWluZSBsb2FkIGxldmVsXG4gICAgICAgIHRoaXMuc3RhcnRMZXZlbCA9IHRoaXMuaGxzLnN0YXJ0TGV2ZWw7XG4gICAgICAgIGlmICh0aGlzLnN0YXJ0TGV2ZWwgPT09IC0xKSB7XG4gICAgICAgICAgLy8gLTEgOiBndWVzcyBzdGFydCBMZXZlbCBieSBkb2luZyBhIGJpdHJhdGUgdGVzdCBieSBsb2FkaW5nIGZpcnN0IGZyYWdtZW50IG9mIGxvd2VzdCBxdWFsaXR5IGxldmVsXG4gICAgICAgICAgdGhpcy5zdGFydExldmVsID0gMDtcbiAgICAgICAgICB0aGlzLmZyYWdtZW50Qml0cmF0ZVRlc3QgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCBuZXcgbGV2ZWwgdG8gcGxheWxpc3QgbG9hZGVyIDogdGhpcyB3aWxsIHRyaWdnZXIgc3RhcnQgbGV2ZWwgbG9hZFxuICAgICAgICB0aGlzLmxldmVsID0gdGhpcy5obHMubmV4dExvYWRMZXZlbCA9IHRoaXMuc3RhcnRMZXZlbDtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuV0FJVElOR19MRVZFTDtcbiAgICAgICAgdGhpcy5sb2FkZWRtZXRhZGF0YSA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdGhpcy5JRExFOlxuICAgICAgICAvLyBoYW5kbGUgZW5kIG9mIGltbWVkaWF0ZSBzd2l0Y2hpbmcgaWYgbmVlZGVkXG4gICAgICAgIGlmKHRoaXMuaW1tZWRpYXRlU3dpdGNoKSB7XG4gICAgICAgICAgdGhpcy5pbW1lZGlhdGVMZXZlbFN3aXRjaEVuZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdmlkZW8gZGV0YWNoZWQgb3IgdW5ib3VuZCBleGl0IGxvb3BcbiAgICAgICAgaWYoIXRoaXMudmlkZW8pIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNlZWsgYmFjayB0byBhIGV4cGVjdGVkIHBvc2l0aW9uIGFmdGVyIHZpZGVvIHN0YWxsaW5nXG4gICAgICAgIGlmKHRoaXMuc2Vla0FmdGVyU3RhbGxpbmcpIHtcbiAgICAgICAgICB0aGlzLnZpZGVvLmN1cnJlbnRUaW1lPXRoaXMuc2Vla0FmdGVyU3RhbGxpbmc7XG4gICAgICAgICAgdGhpcy5zZWVrQWZ0ZXJTdGFsbGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRldGVybWluZSBuZXh0IGNhbmRpZGF0ZSBmcmFnbWVudCB0byBiZSBsb2FkZWQsIGJhc2VkIG9uIGN1cnJlbnQgcG9zaXRpb24gYW5kXG4gICAgICAgIC8vICBlbmQgb2YgYnVmZmVyIHBvc2l0aW9uXG4gICAgICAgIC8vICBlbnN1cmUgNjBzIG9mIGJ1ZmZlciB1cGZyb250XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgbm90IHlldCBsb2FkZWQgYW55IGZyYWdtZW50LCBzdGFydCBsb2FkaW5nIGZyb20gc3RhcnQgcG9zaXRpb25cbiAgICAgICAgaWYodGhpcy5sb2FkZWRtZXRhZGF0YSkge1xuICAgICAgICAgIHBvcyA9IHRoaXMudmlkZW8uY3VycmVudFRpbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9zID0gdGhpcy5uZXh0TG9hZFBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRldGVybWluZSBuZXh0IGxvYWQgbGV2ZWxcbiAgICAgICAgaWYodGhpcy5zdGFydEZyYWdtZW50UmVxdWVzdGVkID09PSBmYWxzZSkge1xuICAgICAgICAgIGxldmVsID0gdGhpcy5zdGFydExldmVsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHdlIGFyZSBub3QgYXQgcGxheWJhY2sgc3RhcnQsIGdldCBuZXh0IGxvYWQgbGV2ZWwgZnJvbSBsZXZlbCBDb250cm9sbGVyXG4gICAgICAgICAgbGV2ZWwgPSB0aGlzLmhscy5uZXh0TG9hZExldmVsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBidWZmZXJJbmZvID0gdGhpcy5idWZmZXJJbmZvKHBvcyksIGJ1ZmZlckxlbiA9IGJ1ZmZlckluZm8ubGVuLCBidWZmZXJFbmQgPSBidWZmZXJJbmZvLmVuZCwgbWF4QnVmTGVuO1xuICAgICAgICAvLyBjb21wdXRlIG1heCBCdWZmZXIgTGVuZ3RoIHRoYXQgd2UgY291bGQgZ2V0IGZyb20gdGhpcyBsb2FkIGxldmVsLCBiYXNlZCBvbiBsZXZlbCBiaXRyYXRlLiBkb24ndCBidWZmZXIgbW9yZSB0aGFuIDYwIE1CIGFuZCBtb3JlIHRoYW4gMzBzXG4gICAgICAgIGlmKCh0aGlzLmxldmVsc1tsZXZlbF0pLmhhc093blByb3BlcnR5KCdiaXRyYXRlJykpIHtcbiAgICAgICAgICBtYXhCdWZMZW4gPSBNYXRoLm1heCg4KnRoaXMuY29uZmlnLm1heEJ1ZmZlclNpemUvdGhpcy5sZXZlbHNbbGV2ZWxdLmJpdHJhdGUsdGhpcy5jb25maWcubWF4QnVmZmVyTGVuZ3RoKTtcbiAgICAgICAgICBtYXhCdWZMZW4gPSBNYXRoLm1pbihtYXhCdWZMZW4sdGhpcy5jb25maWcubWF4TWF4QnVmZmVyTGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXhCdWZMZW4gPSB0aGlzLmNvbmZpZy5tYXhCdWZmZXJMZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgYnVmZmVyIGxlbmd0aCBpcyBsZXNzIHRoYW4gbWF4QnVmTGVuIHRyeSB0byBsb2FkIGEgbmV3IGZyYWdtZW50XG4gICAgICAgIGlmKGJ1ZmZlckxlbiA8IG1heEJ1Zkxlbikge1xuICAgICAgICAgIC8vIHNldCBuZXh0IGxvYWQgbGV2ZWwgOiB0aGlzIHdpbGwgdHJpZ2dlciBhIHBsYXlsaXN0IGxvYWQgaWYgbmVlZGVkXG4gICAgICAgICAgdGhpcy5obHMubmV4dExvYWRMZXZlbCA9IGxldmVsO1xuICAgICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgICBsZXZlbERldGFpbHMgPSB0aGlzLmxldmVsc1tsZXZlbF0uZGV0YWlscztcbiAgICAgICAgICAvLyBpZiBsZXZlbCBpbmZvIG5vdCByZXRyaWV2ZWQgeWV0LCBzd2l0Y2ggc3RhdGUgYW5kIHdhaXQgZm9yIGxldmVsIHJldHJpZXZhbFxuICAgICAgICAgIGlmKHR5cGVvZiBsZXZlbERldGFpbHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5XQUlUSU5HX0xFVkVMO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGZpbmQgZnJhZ21lbnQgaW5kZXgsIGNvbnRpZ3VvdXMgd2l0aCBlbmQgb2YgYnVmZmVyIHBvc2l0aW9uXG4gICAgICAgICAgbGV0IGZyYWdtZW50cyA9IGxldmVsRGV0YWlscy5mcmFnbWVudHMsIGZyYWcsIHNsaWRpbmcgPSBsZXZlbERldGFpbHMuc2xpZGluZywgc3RhcnQgPSBmcmFnbWVudHNbMF0uc3RhcnQgKyBzbGlkaW5nLCBkcmlmdCA9MDtcbiAgICAgICAgICAvLyBjaGVjayBpZiByZXF1ZXN0ZWQgcG9zaXRpb24gaXMgd2l0aGluIHNlZWthYmxlIGJvdW5kYXJpZXMgOlxuICAgICAgICAgIC8vIGluIGNhc2Ugb2YgbGl2ZSBwbGF5bGlzdCB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0IHJlcXVlc3RlZCBwb3NpdGlvbiBpcyBub3QgbG9jYXRlZCBiZWZvcmUgcGxheWxpc3Qgc3RhcnRcbiAgICAgICAgICAvL2xvZ2dlci5sb2coYHN0YXJ0L3Bvcy9idWZFbmQvc2Vla2luZzoke3N0YXJ0LnRvRml4ZWQoMyl9LyR7cG9zLnRvRml4ZWQoMyl9LyR7YnVmZmVyRW5kLnRvRml4ZWQoMyl9LyR7dGhpcy52aWRlby5zZWVraW5nfWApO1xuICAgICAgICAgIGlmKGJ1ZmZlckVuZCA8IHN0YXJ0KSB7XG4gICAgICAgICAgICAgIHRoaXMuc2Vla0FmdGVyU3RhbGxpbmcgPSB0aGlzLnN0YXJ0UG9zaXRpb24gKyBzbGlkaW5nO1xuICAgICAgICAgICAgICBsb2dnZXIubG9nKGBidWZmZXIgZW5kOiAke2J1ZmZlckVuZH0gaXMgbG9jYXRlZCBiZWZvcmUgc3RhcnQgb2YgbGl2ZSBzbGlkaW5nIHBsYXlsaXN0LCBtZWRpYSBwb3NpdGlvbiB3aWxsIGJlIHJlc2V0ZWQgdG86ICR7dGhpcy5zZWVrQWZ0ZXJTdGFsbGluZy50b0ZpeGVkKDMpfWApO1xuICAgICAgICAgICAgICBidWZmZXJFbmQgPSB0aGlzLnNlZWtBZnRlclN0YWxsaW5nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGxldmVsRGV0YWlscy5saXZlICYmIGxldmVsRGV0YWlscy5zbGlkaW5nID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8qIHdlIGFyZSBzd2l0Y2hpbmcgbGV2ZWwgb24gbGl2ZSBwbGF5bGlzdCwgYnV0IHdlIGRvbid0IGhhdmUgYW55IHNsaWRpbmcgaW5mbyAuLi5cbiAgICAgICAgICAgICAgIHRyeSB0byBsb2FkIGZyYWcgbWF0Y2hpbmcgd2l0aCBuZXh0IFNOLlxuICAgICAgICAgICAgICAgZXZlbiBpZiBTTiBhcmUgbm90IHN5bmNocm9uaXplZCBiZXR3ZWVuIHBsYXlsaXN0cywgbG9hZGluZyB0aGlzIGZyYWcgd2lsbCBoZWxwIHVzXG4gICAgICAgICAgICAgICBjb21wdXRlIHBsYXlsaXN0IHNsaWRpbmcgYW5kIGZpbmQgdGhlIHJpZ2h0IG9uZSBhZnRlciBpbiBjYXNlIGl0IHdhcyBub3QgdGhlIHJpZ2h0IGNvbnNlY3V0aXZlIG9uZSAqL1xuICAgICAgICAgICAgaWYodGhpcy5mcmFnKSB7XG4gICAgICAgICAgICAgIHZhciB0YXJnZXRTTiA9IHRoaXMuZnJhZy5zbisxO1xuICAgICAgICAgICAgICBpZih0YXJnZXRTTiA+PSBsZXZlbERldGFpbHMuc3RhcnRTTiAmJiB0YXJnZXRTTiA8PSBsZXZlbERldGFpbHMuZW5kU04pIHtcbiAgICAgICAgICAgICAgICBmcmFnID0gZnJhZ21lbnRzW3RhcmdldFNOLWxldmVsRGV0YWlscy5zdGFydFNOXTtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKGBsaXZlIHBsYXlsaXN0LCBzd2l0Y2hpbmcgcGxheWxpc3QsIGxvYWQgZnJhZyB3aXRoIG5leHQgU046ICR7ZnJhZy5zbn1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoIWZyYWcpIHtcbiAgICAgICAgICAgICAgLyogd2UgaGF2ZSBubyBpZGVhIGFib3V0IHdoaWNoIGZyYWdtZW50IHNob3VsZCBiZSBsb2FkZWQuXG4gICAgICAgICAgICAgICAgIHNvIGxldCdzIGxvYWQgbWlkIGZyYWdtZW50LiBpdCB3aWxsIGhlbHAgY29tcHV0aW5nIHBsYXlsaXN0IHNsaWRpbmcgYW5kIGZpbmQgdGhlIHJpZ2h0IG9uZVxuICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICBmcmFnID0gZnJhZ21lbnRzW01hdGgucm91bmQoZnJhZ21lbnRzLmxlbmd0aC8yKV07XG4gICAgICAgICAgICAgIGxvZ2dlci5sb2coYGxpdmUgcGxheWxpc3QsIHN3aXRjaGluZyBwbGF5bGlzdCwgdW5rbm93biwgbG9hZCBtaWRkbGUgZnJhZyA6ICR7ZnJhZy5zbn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vbG9vayBmb3IgZnJhZ21lbnRzIG1hdGNoaW5nIHdpdGggY3VycmVudCBwbGF5IHBvc2l0aW9uXG4gICAgICAgICAgICBmb3IgKGZyYWdJZHggPSAwOyBmcmFnSWR4IDwgZnJhZ21lbnRzLmxlbmd0aCA7IGZyYWdJZHgrKykge1xuICAgICAgICAgICAgICBmcmFnID0gZnJhZ21lbnRzW2ZyYWdJZHhdO1xuICAgICAgICAgICAgICBzdGFydCA9IGZyYWcuc3RhcnQrc2xpZGluZztcbiAgICAgICAgICAgICAgaWYoZnJhZy5kcmlmdCkge1xuICAgICAgICAgICAgICAgIGRyaWZ0ID0gZnJhZy5kcmlmdDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzdGFydCs9ZHJpZnQ7XG4gICAgICAgICAgICAgIC8vbG9nZ2VyLmxvZyhgbGV2ZWwvc24vc2xpZGluZy9kcmlmdC9zdGFydC9lbmQvYnVmRW5kOiR7bGV2ZWx9LyR7ZnJhZy5zbn0vJHtzbGlkaW5nLnRvRml4ZWQoMyl9LyR7ZHJpZnQudG9GaXhlZCgzKX0vJHtzdGFydC50b0ZpeGVkKDMpfS8keyhzdGFydCtmcmFnLmR1cmF0aW9uKS50b0ZpeGVkKDMpfS8ke2J1ZmZlckVuZC50b0ZpeGVkKDMpfWApO1xuICAgICAgICAgICAgICAvLyBvZmZzZXQgc2hvdWxkIGJlIHdpdGhpbiBmcmFnbWVudCBib3VuZGFyeVxuICAgICAgICAgICAgICBpZihzdGFydCA8PSBidWZmZXJFbmQgJiYgKHN0YXJ0ICsgZnJhZy5kdXJhdGlvbikgPiBidWZmZXJFbmQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZnJhZ0lkeCA9PT0gZnJhZ21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAvLyByZWFjaCBlbmQgb2YgcGxheWxpc3RcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2xvZ2dlci5sb2coJ2ZpbmQgU04gbWF0Y2hpbmcgd2l0aCBwb3M6JyArICBidWZmZXJFbmQgKyAnOicgKyBmcmFnLnNuKTtcbiAgICAgICAgICAgIGlmKHRoaXMuZnJhZyAmJiBmcmFnLnNuID09PSB0aGlzLmZyYWcuc24pIHtcbiAgICAgICAgICAgICAgaWYoZnJhZ0lkeCA9PT0gKGZyYWdtZW50cy5sZW5ndGggLTEpKSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIHBsYXlsaXN0IGFuZCB3ZSBhbHJlYWR5IGxvYWRlZCBsYXN0IGZyYWdtZW50LCBkb24ndCBkbyBhbnl0aGluZ1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZyYWcgPSBmcmFnbWVudHNbZnJhZ0lkeCsxXTtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKGBTTiBqdXN0IGxvYWRlZCwgbG9hZCBuZXh0IG9uZTogJHtmcmFnLnNufWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGxvZ2dlci5sb2coYExvYWRpbmcgICAgICAgJHtmcmFnLnNufSBvZiBbJHtsZXZlbERldGFpbHMuc3RhcnRTTn0gLCR7bGV2ZWxEZXRhaWxzLmVuZFNOfV0sbGV2ZWwgJHtsZXZlbH0sIGN1cnJlbnRUaW1lOiR7cG9zfSxidWZmZXJFbmQ6JHtidWZmZXJFbmQudG9GaXhlZCgzKX1gKTtcbiAgICAgICAgICAvL2xvZ2dlci5sb2coJyAgICAgIGxvYWRpbmcgZnJhZyAnICsgaSArJyxwb3MvYnVmRW5kOicgKyBwb3MudG9GaXhlZCgzKSArICcvJyArIGJ1ZmZlckVuZC50b0ZpeGVkKDMpKTtcbiAgICAgICAgICBmcmFnLmRyaWZ0ID0gZHJpZnQ7XG4gICAgICAgICAgZnJhZy5hdXRvTGV2ZWwgPSB0aGlzLmhscy5hdXRvTGV2ZWxFbmFibGVkO1xuICAgICAgICAgIGlmKHRoaXMubGV2ZWxzLmxlbmd0aD4xKSB7XG4gICAgICAgICAgICBmcmFnLmV4cGVjdGVkTGVuID0gTWF0aC5yb3VuZChmcmFnLmR1cmF0aW9uKnRoaXMubGV2ZWxzW2xldmVsXS5iaXRyYXRlLzgpO1xuICAgICAgICAgICAgZnJhZy50cmVxdWVzdCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZW5zdXJlIHRoYXQgd2UgYXJlIG5vdCByZWxvYWRpbmcgdGhlIHNhbWUgZnJhZ21lbnRzIGluIGxvb3AgLi4uXG4gICAgICAgICAgaWYodGhpcy5mcmFnTG9hZElkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmZyYWdMb2FkSWR4Kys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZnJhZ0xvYWRJZHggPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihmcmFnLmxvYWRDb3VudGVyKSB7XG4gICAgICAgICAgICBmcmFnLmxvYWRDb3VudGVyKys7XG4gICAgICAgICAgICBsZXQgbWF4VGhyZXNob2xkID0gdGhpcy5jb25maWcuZnJhZ0xvYWRpbmdMb29wVGhyZXNob2xkO1xuICAgICAgICAgICAgLy8gaWYgdGhpcyBmcmFnIGhhcyBhbHJlYWR5IGJlZW4gbG9hZGVkIDMgdGltZXMsIGFuZCBpZiBpdCBoYXMgYmVlbiByZWxvYWRlZCByZWNlbnRseVxuICAgICAgICAgICAgaWYoZnJhZy5sb2FkQ291bnRlciA+IG1heFRocmVzaG9sZCAmJiAoTWF0aC5hYnModGhpcy5mcmFnTG9hZElkeCAtIGZyYWcubG9hZElkeCkgPCBtYXhUaHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRVJST1IsIHt0eXBlIDogRXJyb3JUeXBlcy5NRURJQV9FUlJPUiwgZGV0YWlscyA6IEVycm9yRGV0YWlscy5GUkFHX0xPT1BfTE9BRElOR19FUlJPUiwgZmF0YWw6ZmFsc2UsIGZyYWcgOiBmcmFnfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJhZy5sb2FkQ291bnRlcj0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmcmFnLmxvYWRJZHggPSB0aGlzLmZyYWdMb2FkSWR4O1xuICAgICAgICAgIHRoaXMuZnJhZyA9IGZyYWc7XG4gICAgICAgICAgdGhpcy5zdGFydEZyYWdtZW50UmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkZSQUdfTE9BRElORywgeyBmcmFnOiBmcmFnIH0pO1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLkxPQURJTkc7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuV0FJVElOR19MRVZFTDpcbiAgICAgICAgbGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVsXTtcbiAgICAgICAgLy8gY2hlY2sgaWYgcGxheWxpc3QgaXMgYWxyZWFkeSBsb2FkZWRcbiAgICAgICAgaWYobGV2ZWwgJiYgbGV2ZWwuZGV0YWlscykge1xuICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLklETEU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuTE9BRElORzpcbiAgICAgICAgLypcbiAgICAgICAgICBtb25pdG9yIGZyYWdtZW50IHJldHJpZXZhbCB0aW1lLi4uXG4gICAgICAgICAgd2UgY29tcHV0ZSBleHBlY3RlZCB0aW1lIG9mIGFycml2YWwgb2YgdGhlIGNvbXBsZXRlIGZyYWdtZW50LlxuICAgICAgICAgIHdlIGNvbXBhcmUgaXQgdG8gZXhwZWN0ZWQgdGltZSBvZiBidWZmZXIgc3RhcnZhdGlvblxuICAgICAgICAqL1xuICAgICAgICBsZXQgdiA9IHRoaXMudmlkZW8sZnJhZyA9IHRoaXMuZnJhZztcbiAgICAgICAgLyogb25seSBtb25pdG9yIGZyYWcgcmV0cmlldmFsIHRpbWUgaWZcbiAgICAgICAgKHZpZGVvIG5vdCBwYXVzZWQgT1IgZmlyc3QgZnJhZ21lbnQgYmVpbmcgbG9hZGVkKSBBTkQgYXV0b3N3aXRjaGluZyBlbmFibGVkIEFORCBub3QgbG93ZXN0IGxldmVsIEFORCBtdWx0aXBsZSBsZXZlbHMgKi9cbiAgICAgICAgaWYodiAmJiAoIXYucGF1c2VkIHx8IHRoaXMubG9hZGVkbWV0YWRhdGEgPT09IGZhbHNlKSAmJiBmcmFnLmF1dG9MZXZlbCAmJiB0aGlzLmxldmVsICYmIHRoaXMubGV2ZWxzLmxlbmd0aD4xICkge1xuICAgICAgICAgIHZhciByZXF1ZXN0RGVsYXk9bmV3IERhdGUoKS1mcmFnLnRyZXF1ZXN0O1xuICAgICAgICAgIC8vIG1vbml0b3IgZnJhZ21lbnQgbG9hZCBwcm9ncmVzcyBhZnRlciBoYWxmIG9mIGV4cGVjdGVkIGZyYWdtZW50IGR1cmF0aW9uLHRvIHN0YWJpbGl6ZSBiaXRyYXRlXG4gICAgICAgICAgaWYocmVxdWVzdERlbGF5ID4gNTAwKmZyYWcuZHVyYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBsb2FkUmF0ZSA9IGZyYWcubG9hZGVkKjEwMDAvcmVxdWVzdERlbGF5OyAvLyBieXRlL3NcbiAgICAgICAgICAgIGlmKGZyYWcuZXhwZWN0ZWRMZW4gPCBmcmFnLmxvYWRlZCkge1xuICAgICAgICAgICAgICBmcmFnLmV4cGVjdGVkTGVuID0gZnJhZy5sb2FkZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3MgPSB2LmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdmFyIGZyYWdMb2FkZWREZWxheSA9KGZyYWcuZXhwZWN0ZWRMZW4tZnJhZy5sb2FkZWQpL2xvYWRSYXRlO1xuICAgICAgICAgICAgdmFyIGJ1ZmZlclN0YXJ2YXRpb25EZWxheT10aGlzLmJ1ZmZlckluZm8ocG9zKS5lbmQtcG9zO1xuICAgICAgICAgICAgdmFyIGZyYWdMZXZlbE5leHRMb2FkZWREZWxheSA9IGZyYWcuZHVyYXRpb24qdGhpcy5sZXZlbHNbdGhpcy5obHMubmV4dExvYWRMZXZlbF0uYml0cmF0ZS8oOCpsb2FkUmF0ZSk7IC8vYnBzL0Jwc1xuICAgICAgICAgICAgLyogaWYgd2UgaGF2ZSBsZXNzIHRoYW4gMiBmcmFnIGR1cmF0aW9uIGluIGJ1ZmZlciBhbmQgaWYgZnJhZyBsb2FkZWQgZGVsYXkgaXMgZ3JlYXRlciB0aGFuIGJ1ZmZlciBzdGFydmF0aW9uIGRlbGF5XG4gICAgICAgICAgICAgIC4uLiBhbmQgYWxzbyBiaWdnZXIgdGhhbiBkdXJhdGlvbiBuZWVkZWQgdG8gbG9hZCBmcmFnbWVudCBhdCBuZXh0IGxldmVsIC4uLiovXG4gICAgICAgICAgICBpZihidWZmZXJTdGFydmF0aW9uRGVsYXkgPCAyKmZyYWcuZHVyYXRpb24gJiYgZnJhZ0xvYWRlZERlbGF5ID4gYnVmZmVyU3RhcnZhdGlvbkRlbGF5ICYmIGZyYWdMb2FkZWREZWxheSA+IGZyYWdMZXZlbE5leHRMb2FkZWREZWxheSkge1xuICAgICAgICAgICAgICAvLyBhYm9ydCBmcmFnbWVudCBsb2FkaW5nIC4uLlxuICAgICAgICAgICAgICBsb2dnZXIud2FybignbG9hZGluZyB0b28gc2xvdywgYWJvcnQgZnJhZ21lbnQgbG9hZGluZycpO1xuICAgICAgICAgICAgICBsb2dnZXIubG9nKGBmcmFnTG9hZGVkRGVsYXkvYnVmZmVyU3RhcnZhdGlvbkRlbGF5L2ZyYWdMZXZlbE5leHRMb2FkZWREZWxheSA6JHtmcmFnTG9hZGVkRGVsYXkudG9GaXhlZCgxKX0vJHtidWZmZXJTdGFydmF0aW9uRGVsYXkudG9GaXhlZCgxKX0vJHtmcmFnTGV2ZWxOZXh0TG9hZGVkRGVsYXkudG9GaXhlZCgxKX1gKTtcbiAgICAgICAgICAgICAgLy9hYm9ydCBmcmFnbWVudCBsb2FkaW5nXG4gICAgICAgICAgICAgIGZyYWcubG9hZGVyLmFib3J0KCk7XG4gICAgICAgICAgICAgIHRoaXMuZnJhZyA9IG51bGw7XG4gICAgICAgICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRlJBR19MT0FEX0VNRVJHRU5DWV9BQk9SVEVELCB7IGZyYWc6IGZyYWcgfSk7XG4gICAgICAgICAgICAgIC8vIHN3aXRjaCBiYWNrIHRvIElETEUgc3RhdGUgdG8gcmVxdWVzdCBuZXcgZnJhZ21lbnQgYXQgbG93ZXN0IGxldmVsXG4gICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLklETEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0aGlzLlBBUlNJTkc6XG4gICAgICAgIC8vIG5vdGhpbmcgdG8gZG8sIHdhaXQgZm9yIGZyYWdtZW50IGJlaW5nIHBhcnNlZFxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdGhpcy5QQVJTRUQ6XG4gICAgICBjYXNlIHRoaXMuQVBQRU5ESU5HOlxuICAgICAgICBpZiAodGhpcy5zb3VyY2VCdWZmZXIpIHtcbiAgICAgICAgICAvLyBpZiBNUDQgc2VnbWVudCBhcHBlbmRpbmcgaW4gcHJvZ3Jlc3Mgbm90aGluZyB0byBkb1xuICAgICAgICAgIGlmKCh0aGlzLnNvdXJjZUJ1ZmZlci5hdWRpbyAmJiB0aGlzLnNvdXJjZUJ1ZmZlci5hdWRpby51cGRhdGluZykgfHxcbiAgICAgICAgICAgICAodGhpcy5zb3VyY2VCdWZmZXIudmlkZW8gJiYgdGhpcy5zb3VyY2VCdWZmZXIudmlkZW8udXBkYXRpbmcpKSB7XG4gICAgICAgICAgICAvL2xvZ2dlci5sb2coJ3NiIGFwcGVuZCBpbiBwcm9ncmVzcycpO1xuICAgICAgICAvLyBjaGVjayBpZiBhbnkgTVA0IHNlZ21lbnRzIGxlZnQgdG8gYXBwZW5kXG4gICAgICAgICAgfSBlbHNlIGlmKHRoaXMubXA0c2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgc2VnbWVudCA9IHRoaXMubXA0c2VnbWVudHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vbG9nZ2VyLmxvZyhgYXBwZW5kaW5nICR7c2VnbWVudC50eXBlfSBTQiwgc2l6ZToke3NlZ21lbnQuZGF0YS5sZW5ndGh9YCk7XG4gICAgICAgICAgICAgIHRoaXMuc291cmNlQnVmZmVyW3NlZ21lbnQudHlwZV0uYXBwZW5kQnVmZmVyKHNlZ21lbnQuZGF0YSk7XG4gICAgICAgICAgICAgIHRoaXMuYXBwZW5kRXJyb3I9MDtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgIC8vIGluIGNhc2UgYW55IGVycm9yIG9jY3VyZWQgd2hpbGUgYXBwZW5kaW5nLCBwdXQgYmFjayBzZWdtZW50IGluIG1wNHNlZ21lbnRzIHRhYmxlXG4gICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgZXJyb3Igd2hpbGUgdHJ5aW5nIHRvIGFwcGVuZCBidWZmZXI6JHtlcnIubWVzc2FnZX0sdHJ5IGFwcGVuZGluZyBsYXRlcmApO1xuICAgICAgICAgICAgICB0aGlzLm1wNHNlZ21lbnRzLnVuc2hpZnQoc2VnbWVudCk7XG4gICAgICAgICAgICAgIGlmKHRoaXMuYXBwZW5kRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZEVycm9yKys7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRFcnJvcj0xO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IHt0eXBlIDogRXJyb3JUeXBlcy5NRURJQV9FUlJPUiwgZGV0YWlscyA6IEVycm9yRGV0YWlscy5GUkFHX0FQUEVORElOR19FUlJPUiwgZnJhZyA6IHRoaXMuZnJhZ307XG4gICAgICAgICAgICAgIC8qIHdpdGggVUhEIGNvbnRlbnQsIHdlIGNvdWxkIGdldCBsb29wIG9mIHF1b3RhIGV4Y2VlZGVkIGVycm9yIHVudGlsXG4gICAgICAgICAgICAgICAgYnJvd3NlciBpcyBhYmxlIHRvIGV2aWN0IHNvbWUgZGF0YSBmcm9tIHNvdXJjZWJ1ZmZlci4gcmV0cnlpbmcgaGVscCByZWNvdmVyaW5nIHRoaXNcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgaWYodGhpcy5hcHBlbmRFcnJvciA+IHRoaXMuY29uZmlnLmFwcGVuZEVycm9yTWF4UmV0cnkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKGBmYWlsICR7dGhpcy5jb25maWcuYXBwZW5kRXJyb3JNYXhSZXRyeX0gdGltZXMgdG8gYXBwZW5kIHNlZ21lbnQgaW4gc291cmNlQnVmZmVyYCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuZmF0YWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRVJST1IsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5FUlJPUjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXZlbnQuZmF0YWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkVSUk9SLCBldmVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLkFQUEVORElORztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc291cmNlQnVmZmVyIHVuZGVmaW5lZCwgc3dpdGNoIGJhY2sgdG8gSURMRSBzdGF0ZVxuICAgICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLklETEU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuQlVGRkVSX0ZMVVNISU5HOlxuICAgICAgICAvLyBsb29wIHRocm91Z2ggYWxsIGJ1ZmZlciByYW5nZXMgdG8gZmx1c2hcbiAgICAgICAgd2hpbGUodGhpcy5mbHVzaFJhbmdlLmxlbmd0aCkge1xuICAgICAgICAgIHZhciByYW5nZSA9IHRoaXMuZmx1c2hSYW5nZVswXTtcbiAgICAgICAgICAvLyBmbHVzaEJ1ZmZlciB3aWxsIGFib3J0IGFueSBidWZmZXIgYXBwZW5kIGluIHByb2dyZXNzIGFuZCBmbHVzaCBBdWRpby9WaWRlbyBCdWZmZXJcbiAgICAgICAgICBpZih0aGlzLmZsdXNoQnVmZmVyKHJhbmdlLnN0YXJ0LHJhbmdlLmVuZCkpIHtcbiAgICAgICAgICAgIC8vIHJhbmdlIGZsdXNoZWQsIHJlbW92ZSBmcm9tIGZsdXNoIGFycmF5XG4gICAgICAgICAgICB0aGlzLmZsdXNoUmFuZ2Uuc2hpZnQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZmx1c2ggaW4gcHJvZ3Jlc3MsIGNvbWUgYmFjayBsYXRlclxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5mbHVzaFJhbmdlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIG1vdmUgdG8gSURMRSBvbmNlIGZsdXNoIGNvbXBsZXRlLiB0aGlzIHNob3VsZCB0cmlnZ2VyIG5ldyBmcmFnbWVudCBsb2FkaW5nXG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuSURMRTtcbiAgICAgICAgICAvLyByZXNldCByZWZlcmVuY2UgdG8gZnJhZ1xuICAgICAgICAgIHRoaXMuZnJhZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgIC8qIGlmIG5vdCBldmVyeXRoaW5nIGZsdXNoZWQsIHN0YXkgaW4gQlVGRkVSX0ZMVVNISU5HIHN0YXRlLiB3ZSB3aWxsIGNvbWUgYmFjayBoZXJlXG4gICAgICAgICAgICBlYWNoIHRpbWUgc291cmNlQnVmZmVyIHVwZGF0ZWVuZCgpIGNhbGxiYWNrIHdpbGwgYmUgdHJpZ2dlcmVkXG4gICAgICAgICAgICAqL1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBjaGVjay91cGRhdGUgY3VycmVudCBmcmFnbWVudFxuICAgIHRoaXMuX2NoZWNrRnJhZ21lbnRDaGFuZ2VkKCk7XG4gIH1cblxuICAgYnVmZmVySW5mbyhwb3MpIHtcbiAgICB2YXIgdiA9IHRoaXMudmlkZW8sXG4gICAgICAgIGJ1ZmZlcmVkID0gdi5idWZmZXJlZCxcbiAgICAgICAgYnVmZmVyTGVuLFxuICAgICAgICAvLyBidWZmZXJTdGFydCBhbmQgYnVmZmVyRW5kIGFyZSBidWZmZXIgYm91bmRhcmllcyBhcm91bmQgY3VycmVudCB2aWRlbyBwb3NpdGlvblxuICAgICAgICBidWZmZXJTdGFydCxidWZmZXJFbmQsXG4gICAgICAgIGk7XG4gICAgdmFyIGJ1ZmZlcmVkMiA9IFtdO1xuICAgIC8vIHRoZXJlIG1pZ2h0IGJlIHNvbWUgc21hbGwgaG9sZXMgYmV0d2VlbiBidWZmZXIgdGltZSByYW5nZVxuICAgIC8vIGNvbnNpZGVyIHRoYXQgaG9sZXMgc21hbGxlciB0aGFuIDMwMCBtcyBhcmUgaXJyZWxldmFudCBhbmQgYnVpbGQgYW5vdGhlclxuICAgIC8vIGJ1ZmZlciB0aW1lIHJhbmdlIHJlcHJlc2VudGF0aW9ucyB0aGF0IGRpc2NhcmRzIHRob3NlIGhvbGVzXG4gICAgZm9yKGkgPSAwIDsgaSA8IGJ1ZmZlcmVkLmxlbmd0aCA7IGkrKykge1xuICAgICAgLy9sb2dnZXIubG9nKCdidWYgc3RhcnQvZW5kOicgKyBidWZmZXJlZC5zdGFydChpKSArICcvJyArIGJ1ZmZlcmVkLmVuZChpKSk7XG4gICAgICBpZigoYnVmZmVyZWQyLmxlbmd0aCkgJiYgKGJ1ZmZlcmVkLnN0YXJ0KGkpIC0gYnVmZmVyZWQyW2J1ZmZlcmVkMi5sZW5ndGgtMV0uZW5kICkgPCAwLjMpIHtcbiAgICAgICAgYnVmZmVyZWQyW2J1ZmZlcmVkMi5sZW5ndGgtMV0uZW5kID0gYnVmZmVyZWQuZW5kKGkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmZmVyZWQyLnB1c2goe3N0YXJ0IDogYnVmZmVyZWQuc3RhcnQoaSksZW5kIDogYnVmZmVyZWQuZW5kKGkpfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKGkgPSAwLCBidWZmZXJMZW4gPSAwLCBidWZmZXJTdGFydCA9IGJ1ZmZlckVuZCA9IHBvcyA7IGkgPCBidWZmZXJlZDIubGVuZ3RoIDsgaSsrKSB7XG4gICAgICAvL2xvZ2dlci5sb2coJ2J1ZiBzdGFydC9lbmQ6JyArIGJ1ZmZlcmVkLnN0YXJ0KGkpICsgJy8nICsgYnVmZmVyZWQuZW5kKGkpKTtcbiAgICAgIGlmKChwb3MrMC4zKSA+PSBidWZmZXJlZDJbaV0uc3RhcnQgJiYgcG9zIDwgYnVmZmVyZWQyW2ldLmVuZCkge1xuICAgICAgICAvLyBwbGF5IHBvc2l0aW9uIGlzIGluc2lkZSB0aGlzIGJ1ZmZlciBUaW1lUmFuZ2UsIHJldHJpZXZlIGVuZCBvZiBidWZmZXIgcG9zaXRpb24gYW5kIGJ1ZmZlciBsZW5ndGhcbiAgICAgICAgYnVmZmVyU3RhcnQgPSBidWZmZXJlZDJbaV0uc3RhcnQ7XG4gICAgICAgIGJ1ZmZlckVuZCA9IGJ1ZmZlcmVkMltpXS5lbmQgKyAwLjM7XG4gICAgICAgIGJ1ZmZlckxlbiA9IGJ1ZmZlckVuZCAtIHBvcztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtsZW4gOiBidWZmZXJMZW4sIHN0YXJ0IDogYnVmZmVyU3RhcnQsIGVuZCA6IGJ1ZmZlckVuZH07XG4gIH1cblxuXG4gIGdldEJ1ZmZlclJhbmdlKHBvc2l0aW9uKSB7XG4gICAgdmFyIGkscmFuZ2U7XG4gICAgZm9yIChpID0gdGhpcy5idWZmZXJSYW5nZS5sZW5ndGgtMTsgaSA+PTAgOyBpLS0pIHtcbiAgICAgIHJhbmdlID0gdGhpcy5idWZmZXJSYW5nZVtpXTtcbiAgICAgIGlmKHBvc2l0aW9uID49IHJhbmdlLnN0YXJ0ICYmIHBvc2l0aW9uIDw9IHJhbmdlLmVuZCkge1xuICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICBnZXQgY3VycmVudExldmVsKCkge1xuICAgIGlmKHRoaXMudmlkZW8pIHtcbiAgICAgIHZhciByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2UodGhpcy52aWRlby5jdXJyZW50VGltZSk7XG4gICAgICBpZihyYW5nZSkge1xuICAgICAgICByZXR1cm4gcmFuZ2UuZnJhZy5sZXZlbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgZ2V0IG5leHRCdWZmZXJSYW5nZSgpIHtcbiAgICBpZih0aGlzLnZpZGVvKSB7XG4gICAgICAvLyBmaXJzdCBnZXQgZW5kIHJhbmdlIG9mIGN1cnJlbnQgZnJhZ21lbnRcbiAgICAgIHJldHVybiB0aGlzLmZvbGxvd2luZ0J1ZmZlclJhbmdlKHRoaXMuZ2V0QnVmZmVyUmFuZ2UodGhpcy52aWRlby5jdXJyZW50VGltZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmb2xsb3dpbmdCdWZmZXJSYW5nZShyYW5nZSkge1xuICAgIGlmKHJhbmdlKSB7XG4gICAgICAvLyB0cnkgdG8gZ2V0IHJhbmdlIG9mIG5leHQgZnJhZ21lbnQgKDUwMG1zIGFmdGVyIHRoaXMgcmFuZ2UpXG4gICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZShyYW5nZS5lbmQrMC41KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuXG4gIGdldCBuZXh0TGV2ZWwoKSB7XG4gICAgdmFyIHJhbmdlID0gdGhpcy5uZXh0QnVmZmVyUmFuZ2U7XG4gICAgaWYocmFuZ2UpIHtcbiAgICAgIHJldHVybiByYW5nZS5mcmFnLmxldmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICB9XG5cbiAgaXNCdWZmZXJlZChwb3NpdGlvbikge1xuICAgIHZhciB2ID0gdGhpcy52aWRlbyxidWZmZXJlZCA9IHYuYnVmZmVyZWQ7XG4gICAgZm9yKHZhciBpID0gMCA7IGkgPCBidWZmZXJlZC5sZW5ndGggOyBpKyspIHtcbiAgICAgIGlmKHBvc2l0aW9uID49IGJ1ZmZlcmVkLnN0YXJ0KGkpICYmIHBvc2l0aW9uIDw9IGJ1ZmZlcmVkLmVuZChpKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2NoZWNrRnJhZ21lbnRDaGFuZ2VkKCkge1xuICAgIHZhciByYW5nZUN1cnJlbnQsIGN1cnJlbnRUaW1lO1xuICAgIGlmKHRoaXMudmlkZW8gJiYgdGhpcy52aWRlby5zZWVraW5nID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5sYXN0Q3VycmVudFRpbWUgPSBjdXJyZW50VGltZSA9IHRoaXMudmlkZW8uY3VycmVudFRpbWU7XG4gICAgICBpZih0aGlzLmlzQnVmZmVyZWQoY3VycmVudFRpbWUpKSB7XG4gICAgICAgIHJhbmdlQ3VycmVudCA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2UoY3VycmVudFRpbWUpO1xuICAgICAgfSBlbHNlIGlmKHRoaXMuaXNCdWZmZXJlZChjdXJyZW50VGltZSswLjEpKSB7XG4gICAgICAgIC8qIGVuc3VyZSB0aGF0IEZSQUdfQ0hBTkdFRCBldmVudCBpcyB0cmlnZ2VyZWQgYXQgc3RhcnR1cCxcbiAgICAgICAgICB3aGVuIGZpcnN0IHZpZGVvIGZyYW1lIGlzIGRpc3BsYXllZCBhbmQgcGxheWJhY2sgaXMgcGF1c2VkLlxuICAgICAgICAgIGFkZCBhIHRvbGVyYW5jZSBvZiAxMDBtcywgaW4gY2FzZSBjdXJyZW50IHBvc2l0aW9uIGlzIG5vdCBidWZmZXJlZCxcbiAgICAgICAgICBjaGVjayBpZiBjdXJyZW50IHBvcysxMDBtcyBpcyBidWZmZXJlZCBhbmQgdXNlIHRoYXQgYnVmZmVyIHJhbmdlXG4gICAgICAgICAgZm9yIEZSQUdfQ0hBTkdFRCBldmVudCByZXBvcnRpbmcgKi9cbiAgICAgICAgcmFuZ2VDdXJyZW50ID0gdGhpcy5nZXRCdWZmZXJSYW5nZShjdXJyZW50VGltZSswLjEpO1xuICAgICAgfVxuICAgICAgaWYocmFuZ2VDdXJyZW50KSB7XG4gICAgICAgIGlmKHJhbmdlQ3VycmVudC5mcmFnICE9PSB0aGlzLmZyYWdDdXJyZW50KSB7XG4gICAgICAgICAgdGhpcy5mcmFnQ3VycmVudCA9IHJhbmdlQ3VycmVudC5mcmFnO1xuICAgICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRlJBR19DSEFOR0VELCB7IGZyYWcgOiB0aGlzLmZyYWdDdXJyZW50IH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHN0cmVhbSBpcyBWT0QgKG5vdCBsaXZlKSBhbmQgd2UgcmVhY2ggRW5kIG9mIFN0cmVhbVxuICAgICAgICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVsXTtcbiAgICAgICAgaWYobGV2ZWwgJiYgbGV2ZWwuZGV0YWlscyAmJiAhbGV2ZWwuZGV0YWlscy5saXZlICYmICh0aGlzLnZpZGVvLmR1cmF0aW9uIC0gY3VycmVudFRpbWUpIDwgMC4yKSB7XG4gICAgICAgICAgaWYodGhpcy5tZWRpYVNvdXJjZSAmJiB0aGlzLm1lZGlhU291cmNlLnJlYWR5U3RhdGUgPT09ICdvcGVuJykge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhgZW5kIG9mIFZvRCBzdHJlYW0gcmVhY2hlZCwgc2lnbmFsIGVuZE9mU3RyZWFtKCkgdG8gTWVkaWFTb3VyY2VgKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRQb3NpdGlvbiA9IHRoaXMubGFzdEN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMudmlkZW8gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tZWRpYVNvdXJjZS5lbmRPZlN0cmVhbSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vKlxuICBhYm9ydCBhbnkgYnVmZmVyIGFwcGVuZCBpbiBwcm9ncmVzcywgYW5kIGZsdXNoIGFsbCBidWZmZXJlZCBkYXRhXG4gIHJldHVybiB0cnVlIG9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBmbHVzaGVkLlxuICBzb3VyY2VCdWZmZXIuYWJvcnQoKSBhbmQgc291cmNlQnVmZmVyLnJlbW92ZSgpIGFyZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uc1xuICB0aGUgaWRlYSBpcyB0byBjYWxsIHRoaXMgZnVuY3Rpb24gZnJvbSB0aWNrKCkgdGltZXIgYW5kIGNhbGwgaXQgYWdhaW4gdW50aWwgYWxsIHJlc291cmNlcyBoYXZlIGJlZW4gY2xlYW5lZFxuICB0aGUgdGltZXIgaXMgcmVhcm1lZCB1cG9uIHNvdXJjZUJ1ZmZlciB1cGRhdGVlbmQoKSBldmVudCwgc28gdGhpcyBzaG91bGQgYmUgb3B0aW1hbFxuKi9cbiAgZmx1c2hCdWZmZXIoc3RhcnRPZmZzZXQsIGVuZE9mZnNldCkge1xuICAgIHZhciBzYixpLGJ1ZlN0YXJ0LGJ1ZkVuZCwgZmx1c2hTdGFydCwgZmx1c2hFbmQ7XG4gICAgLy9sb2dnZXIubG9nKCdmbHVzaEJ1ZmZlcixwb3Mvc3RhcnQvZW5kOiAnICsgdGhpcy52aWRlby5jdXJyZW50VGltZSArICcvJyArIHN0YXJ0T2Zmc2V0ICsgJy8nICsgZW5kT2Zmc2V0KTtcbiAgICAvLyBzYWZlZ3VhcmQgdG8gYXZvaWQgaW5maW5pdGUgbG9vcGluZ1xuICAgIGlmKHRoaXMuZmx1c2hCdWZmZXJDb3VudGVyKysgPCAyKnRoaXMuYnVmZmVyUmFuZ2UubGVuZ3RoICYmIHRoaXMuc291cmNlQnVmZmVyKSB7XG4gICAgICBmb3IodmFyIHR5cGUgaW4gdGhpcy5zb3VyY2VCdWZmZXIpIHtcbiAgICAgICAgc2IgPSB0aGlzLnNvdXJjZUJ1ZmZlclt0eXBlXTtcbiAgICAgICAgaWYoIXNiLnVwZGF0aW5nKSB7XG4gICAgICAgICAgZm9yKGkgPSAwIDsgaSA8IHNiLmJ1ZmZlcmVkLmxlbmd0aCA7IGkrKykge1xuICAgICAgICAgICAgYnVmU3RhcnQgPSBzYi5idWZmZXJlZC5zdGFydChpKTtcbiAgICAgICAgICAgIGJ1ZkVuZCA9IHNiLmJ1ZmZlcmVkLmVuZChpKTtcbiAgICAgICAgICAgIC8vIHdvcmthcm91bmQgZmlyZWZveCBub3QgYWJsZSB0byBwcm9wZXJseSBmbHVzaCBtdWx0aXBsZSBidWZmZXJlZCByYW5nZS5cbiAgICAgICAgICAgIGlmKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgIT09IC0xICYmICBlbmRPZmZzZXQgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgICAgICAgICBmbHVzaFN0YXJ0ID0gc3RhcnRPZmZzZXQ7XG4gICAgICAgICAgICAgIGZsdXNoRW5kID0gZW5kT2Zmc2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZmx1c2hTdGFydCA9IE1hdGgubWF4KGJ1ZlN0YXJ0LHN0YXJ0T2Zmc2V0KTtcbiAgICAgICAgICAgICAgZmx1c2hFbmQgPSBNYXRoLm1pbihidWZFbmQsZW5kT2Zmc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIHNvbWV0aW1lcyBzb3VyY2VidWZmZXIucmVtb3ZlKCkgZG9lcyBub3QgZmx1c2hcbiAgICAgICAgICAgICAgIHRoZSBleGFjdCBleHBlY3RlZCB0aW1lIHJhbmdlLlxuICAgICAgICAgICAgICAgdG8gYXZvaWQgcm91bmRpbmcgaXNzdWVzL2luZmluaXRlIGxvb3AsXG4gICAgICAgICAgICAgICBvbmx5IGZsdXNoIGJ1ZmZlciByYW5nZSBvZiBsZW5ndGggZ3JlYXRlciB0aGFuIDUwMG1zLlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmKGZsdXNoRW5kIC0gZmx1c2hTdGFydCA+IDAuNSkge1xuICAgICAgICAgICAgICBsb2dnZXIubG9nKGBmbHVzaCAke3R5cGV9IFske2ZsdXNoU3RhcnR9LCR7Zmx1c2hFbmR9XSwgb2YgWyR7YnVmU3RhcnR9LCR7YnVmRW5kfV0sIHBvczoke3RoaXMudmlkZW8uY3VycmVudFRpbWV9YCk7XG4gICAgICAgICAgICAgIHNiLnJlbW92ZShmbHVzaFN0YXJ0LGZsdXNoRW5kKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL2xvZ2dlci5sb2coJ2Fib3J0ICcgKyB0eXBlICsgJyBhcHBlbmQgaW4gcHJvZ3Jlc3MnKTtcbiAgICAgICAgICAvLyB0aGlzIHdpbGwgYWJvcnQgYW55IGFwcGVuZGluZyBpbiBwcm9ncmVzc1xuICAgICAgICAgIC8vc2IuYWJvcnQoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBhZnRlciBzdWNjZXNzZnVsIGJ1ZmZlciBmbHVzaGluZywgcmVidWlsZCBidWZmZXIgUmFuZ2UgYXJyYXlcbiAgICAgIGxvb3AgdGhyb3VnaCBleGlzdGluZyBidWZmZXIgcmFuZ2UgYW5kIGNoZWNrIGlmXG4gICAgICBjb3JyZXNwb25kaW5nIHJhbmdlIGlzIHN0aWxsIGJ1ZmZlcmVkLiBvbmx5IHB1c2ggdG8gbmV3IGFycmF5IGFscmVhZHkgYnVmZmVyZWQgcmFuZ2VcbiAgICAqL1xuICAgIHZhciBuZXdSYW5nZSA9IFtdLHJhbmdlO1xuICAgIGZvciAoaSA9IDAgOyBpIDwgdGhpcy5idWZmZXJSYW5nZS5sZW5ndGggOyBpKyspIHtcbiAgICAgIHJhbmdlID0gdGhpcy5idWZmZXJSYW5nZVtpXTtcbiAgICAgIGlmKHRoaXMuaXNCdWZmZXJlZCgocmFuZ2Uuc3RhcnQgKyByYW5nZS5lbmQpLzIpKSB7XG4gICAgICAgIG5ld1JhbmdlLnB1c2gocmFuZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmJ1ZmZlclJhbmdlID0gbmV3UmFuZ2U7XG5cbiAgICBsb2dnZXIubG9nKCdidWZmZXIgZmx1c2hlZCcpO1xuICAgIC8vIGV2ZXJ5dGhpbmcgZmx1c2hlZCAhXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAgIC8qXG4gICAgICBvbiBpbW1lZGlhdGUgbGV2ZWwgc3dpdGNoIDpcbiAgICAgICAtIHBhdXNlIHBsYXliYWNrIGlmIHBsYXlpbmdcbiAgICAgICAtIGNhbmNlbCBhbnkgcGVuZGluZyBsb2FkIHJlcXVlc3RcbiAgICAgICAtIGFuZCB0cmlnZ2VyIGEgYnVmZmVyIGZsdXNoXG4gICAgKi9cbiAgaW1tZWRpYXRlTGV2ZWxTd2l0Y2goKSB7XG4gICAgbG9nZ2VyLmxvZygnaW1tZWRpYXRlTGV2ZWxTd2l0Y2gnKTtcbiAgICBpZighdGhpcy5pbW1lZGlhdGVTd2l0Y2gpIHtcbiAgICAgIHRoaXMuaW1tZWRpYXRlU3dpdGNoID0gdHJ1ZTtcbiAgICAgIHRoaXMucHJldmlvdXNseVBhdXNlZCA9IHRoaXMudmlkZW8ucGF1c2VkO1xuICAgICAgdGhpcy52aWRlby5wYXVzZSgpO1xuICAgIH1cbiAgICBpZih0aGlzLmZyYWcgJiYgdGhpcy5mcmFnLmxvYWRlcikge1xuICAgICAgdGhpcy5mcmFnLmxvYWRlci5hYm9ydCgpO1xuICAgIH1cbiAgICB0aGlzLmZyYWc9bnVsbDtcbiAgICAvLyBmbHVzaCBldmVyeXRoaW5nXG4gICAgdGhpcy5mbHVzaEJ1ZmZlckNvdW50ZXIgPSAwO1xuICAgIHRoaXMuZmx1c2hSYW5nZS5wdXNoKHsgc3RhcnQgOiAwLCBlbmQgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFl9KTtcbiAgICAvLyB0cmlnZ2VyIGEgc291cmNlQnVmZmVyIGZsdXNoXG4gICAgdGhpcy5zdGF0ZSA9IHRoaXMuQlVGRkVSX0ZMVVNISU5HO1xuICAgIC8vIGluY3JlYXNlIGZyYWdtZW50IGxvYWQgSW5kZXggdG8gYXZvaWQgZnJhZyBsb29wIGxvYWRpbmcgZXJyb3IgYWZ0ZXIgYnVmZmVyIGZsdXNoXG4gICAgdGhpcy5mcmFnTG9hZElkeCs9Mip0aGlzLmNvbmZpZy5mcmFnTG9hZGluZ0xvb3BUaHJlc2hvbGQ7XG4gICAgLy8gc3BlZWQgdXAgc3dpdGNoaW5nLCB0cmlnZ2VyIHRpbWVyIGZ1bmN0aW9uXG4gICAgdGhpcy50aWNrKCk7XG4gIH1cblxuLypcbiAgIG9uIGltbWVkaWF0ZSBsZXZlbCBzd2l0Y2ggZW5kLCBhZnRlciBuZXcgZnJhZ21lbnQgaGFzIGJlZW4gYnVmZmVyZWQgOlxuICAgIC0gbnVkZ2UgdmlkZW8gZGVjb2RlciBieSBzbGlnaHRseSBhZGp1c3RpbmcgdmlkZW8gY3VycmVudFRpbWVcbiAgICAtIHJlc3VtZSB0aGUgcGxheWJhY2sgaWYgbmVlZGVkXG4qL1xuICBpbW1lZGlhdGVMZXZlbFN3aXRjaEVuZCgpIHtcbiAgICB0aGlzLmltbWVkaWF0ZVN3aXRjaCA9IGZhbHNlO1xuICAgIHRoaXMudmlkZW8uY3VycmVudFRpbWUtPTAuMDAwMTtcbiAgICBpZighdGhpcy5wcmV2aW91c2x5UGF1c2VkKSB7XG4gICAgICB0aGlzLnZpZGVvLnBsYXkoKTtcbiAgICB9XG4gIH1cblxuICBuZXh0TGV2ZWxTd2l0Y2goKSB7XG4gICAgLyogdHJ5IHRvIHN3aXRjaCBBU0FQIHdpdGhvdXQgYnJlYWtpbmcgdmlkZW8gcGxheWJhY2sgOlxuICAgICAgIGluIG9yZGVyIHRvIGVuc3VyZSBzbW9vdGggYnV0IHF1aWNrIGxldmVsIHN3aXRjaGluZyxcbiAgICAgIHdlIG5lZWQgdG8gZmluZCB0aGUgbmV4dCBmbHVzaGFibGUgYnVmZmVyIHJhbmdlXG4gICAgICB3ZSBzaG91bGQgdGFrZSBpbnRvIGFjY291bnQgbmV3IHNlZ21lbnQgZmV0Y2ggdGltZVxuICAgICovXG4gICAgdmFyIGZldGNoZGVsYXksY3VycmVudFJhbmdlLG5leHRSYW5nZTtcblxuICAgIGN1cnJlbnRSYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2UodGhpcy52aWRlby5jdXJyZW50VGltZSk7XG4gICAgaWYoY3VycmVudFJhbmdlKSB7XG4gICAgLy8gZmx1c2ggYnVmZmVyIHByZWNlZGluZyBjdXJyZW50IGZyYWdtZW50IChmbHVzaCB1bnRpbCBjdXJyZW50IGZyYWdtZW50IHN0YXJ0IG9mZnNldClcbiAgICAvLyBtaW51cyAxcyB0byBhdm9pZCB2aWRlbyBmcmVlemluZywgdGhhdCBjb3VsZCBoYXBwZW4gaWYgd2UgZmx1c2gga2V5ZnJhbWUgb2YgY3VycmVudCB2aWRlbyAuLi5cbiAgICAgIHRoaXMuZmx1c2hSYW5nZS5wdXNoKHsgc3RhcnQgOiAwLCBlbmQgOiBjdXJyZW50UmFuZ2Uuc3RhcnQtMX0pO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLnZpZGVvLnBhdXNlZCkge1xuICAgICAgLy8gYWRkIGEgc2FmZXR5IGRlbGF5IG9mIDFzXG4gICAgICB2YXIgbmV4dExldmVsSWQgPSB0aGlzLmhscy5uZXh0TG9hZExldmVsLG5leHRMZXZlbCA9IHRoaXMubGV2ZWxzW25leHRMZXZlbElkXTtcbiAgICAgIGlmKHRoaXMuaGxzLnN0YXRzLmZyYWdMYXN0S2JwcyAmJiB0aGlzLmZyYWcpIHtcbiAgICAgICAgZmV0Y2hkZWxheSA9IHRoaXMuZnJhZy5kdXJhdGlvbipuZXh0TGV2ZWwuYml0cmF0ZS8oMTAwMCp0aGlzLmhscy5zdGF0cy5mcmFnTGFzdEticHMpKzE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmZXRjaGRlbGF5ID0gMDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZmV0Y2hkZWxheSA9IDA7XG4gICAgfVxuICAgIC8vbG9nZ2VyLmxvZygnZmV0Y2hkZWxheTonK2ZldGNoZGVsYXkpO1xuICAgIC8vIGZpbmQgYnVmZmVyIHJhbmdlIHRoYXQgd2lsbCBiZSByZWFjaGVkIG9uY2UgbmV3IGZyYWdtZW50IHdpbGwgYmUgZmV0Y2hlZFxuICAgIG5leHRSYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2UodGhpcy52aWRlby5jdXJyZW50VGltZSArIGZldGNoZGVsYXkpO1xuICAgIGlmKG5leHRSYW5nZSkge1xuICAgICAgLy8gd2UgY2FuIGZsdXNoIGJ1ZmZlciByYW5nZSBmb2xsb3dpbmcgdGhpcyBvbmUgd2l0aG91dCBzdGFsbGluZyBwbGF5YmFja1xuICAgICAgbmV4dFJhbmdlID0gdGhpcy5mb2xsb3dpbmdCdWZmZXJSYW5nZShuZXh0UmFuZ2UpO1xuICAgICAgaWYobmV4dFJhbmdlKSB7XG4gICAgICAgIC8vIGZsdXNoIHBvc2l0aW9uIGlzIHRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGlzIG5ldyBidWZmZXJcbiAgICAgICAgdGhpcy5mbHVzaFJhbmdlLnB1c2goeyBzdGFydCA6IG5leHRSYW5nZS5zdGFydCwgZW5kIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKHRoaXMuZmx1c2hSYW5nZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuZmx1c2hCdWZmZXJDb3VudGVyID0gMDtcbiAgICAgIC8vIHRyaWdnZXIgYSBzb3VyY2VCdWZmZXIgZmx1c2hcbiAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLkJVRkZFUl9GTFVTSElORztcbiAgICAgIC8vIGluY3JlYXNlIGZyYWdtZW50IGxvYWQgSW5kZXggdG8gYXZvaWQgZnJhZyBsb29wIGxvYWRpbmcgZXJyb3IgYWZ0ZXIgYnVmZmVyIGZsdXNoXG4gICAgICB0aGlzLmZyYWdMb2FkSWR4Kz0yKnRoaXMuY29uZmlnLmZyYWdMb2FkaW5nTG9vcFRocmVzaG9sZDtcbiAgICAgIC8vIHNwZWVkIHVwIHN3aXRjaGluZywgdHJpZ2dlciB0aW1lciBmdW5jdGlvblxuICAgICAgdGhpcy50aWNrKCk7XG4gICAgfVxuICB9XG5cbiAgb25NU0VBdHRhY2hlZChldmVudCxkYXRhKSB7XG4gICAgdGhpcy52aWRlbyA9IGRhdGEudmlkZW87XG4gICAgdGhpcy5tZWRpYVNvdXJjZSA9IGRhdGEubWVkaWFTb3VyY2U7XG4gICAgdGhpcy5vbnZzZWVraW5nID0gdGhpcy5vblZpZGVvU2Vla2luZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMub252c2Vla2VkID0gdGhpcy5vblZpZGVvU2Vla2VkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbnZtZXRhZGF0YSA9IHRoaXMub25WaWRlb01ldGFkYXRhLmJpbmQodGhpcyk7XG4gICAgdGhpcy52aWRlby5hZGRFdmVudExpc3RlbmVyKCdzZWVraW5nJyx0aGlzLm9udnNlZWtpbmcpO1xuICAgIHRoaXMudmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignc2Vla2VkJyx0aGlzLm9udnNlZWtlZCk7XG4gICAgdGhpcy52aWRlby5hZGRFdmVudExpc3RlbmVyKCdsb2FkZWRtZXRhZGF0YScsdGhpcy5vbnZtZXRhZGF0YSk7XG4gICAgaWYodGhpcy5sZXZlbHMgJiYgdGhpcy5jb25maWcuYXV0b1N0YXJ0TG9hZCkge1xuICAgICAgdGhpcy5zdGFydExvYWQoKTtcbiAgICB9XG4gIH1cblxuICBvbk1TRURldGFjaGVkKCkge1xuICAgIHRoaXMudmlkZW8gPSBudWxsO1xuICAgIHRoaXMubG9hZGVkbWV0YWRhdGEgPSBmYWxzZTtcbiAgICB0aGlzLnN0b3AoKTtcbiAgfVxuXG5cbiAgb25WaWRlb1NlZWtpbmcoKSB7XG4gICAgaWYodGhpcy5zdGF0ZSA9PT0gdGhpcy5MT0FESU5HKSB7XG4gICAgICAvLyBjaGVjayBpZiBjdXJyZW50bHkgbG9hZGVkIGZyYWdtZW50IGlzIGluc2lkZSBidWZmZXIuXG4gICAgICAvL2lmIG91dHNpZGUsIGNhbmNlbCBmcmFnbWVudCBsb2FkaW5nLCBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICAgaWYodGhpcy5idWZmZXJJbmZvKHRoaXMudmlkZW8uY3VycmVudFRpbWUpLmxlbiA9PT0gMCkge1xuICAgICAgICBsb2dnZXIubG9nKCdzZWVraW5nIG91dHNpZGUgb2YgYnVmZmVyIHdoaWxlIGZyYWdtZW50IGxvYWQgaW4gcHJvZ3Jlc3MsIGNhbmNlbCBmcmFnbWVudCBsb2FkJyk7XG4gICAgICAgIHRoaXMuZnJhZy5sb2FkZXIuYWJvcnQoKTtcbiAgICAgICAgdGhpcy5mcmFnID0gbnVsbDtcbiAgICAgICAgLy8gc3dpdGNoIHRvIElETEUgc3RhdGUgdG8gbG9hZCBuZXcgZnJhZ21lbnRcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuSURMRTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodGhpcy52aWRlbykge1xuICAgICAgdGhpcy5sYXN0Q3VycmVudFRpbWUgPSB0aGlzLnZpZGVvLmN1cnJlbnRUaW1lO1xuICAgIH1cbiAgICAvLyBhdm9pZCByZXBvcnRpbmcgZnJhZ21lbnQgbG9vcCBsb2FkaW5nIGVycm9yIGluIGNhc2UgdXNlciBpcyBzZWVraW5nIHNldmVyYWwgdGltZXMgb24gc2FtZSBwb3NpdGlvblxuICAgIGlmKHRoaXMuZnJhZ0xvYWRJZHggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5mcmFnTG9hZElkeCs9IDIqdGhpcy5jb25maWcuZnJhZ0xvYWRpbmdMb29wVGhyZXNob2xkO1xuICAgIH1cbiAgICAvLyB0aWNrIHRvIHNwZWVkIHVwIHByb2Nlc3NpbmdcbiAgICB0aGlzLnRpY2soKTtcbiAgfVxuXG4gIG9uVmlkZW9TZWVrZWQoKSB7XG4gICAgLy8gdGljayB0byBzcGVlZCB1cCBGUkFHTUVOVF9QTEFZSU5HIHRyaWdnZXJpbmdcbiAgICB0aGlzLnRpY2soKTtcbiAgfVxuXG4gIG9uVmlkZW9NZXRhZGF0YSgpIHtcbiAgICAgIGlmKHRoaXMudmlkZW8uY3VycmVudFRpbWUgIT09IHRoaXMuc3RhcnRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnZpZGVvLmN1cnJlbnRUaW1lID0gdGhpcy5zdGFydFBvc2l0aW9uO1xuICAgIH1cbiAgICB0aGlzLmxvYWRlZG1ldGFkYXRhID0gdHJ1ZTtcbiAgICB0aGlzLnRpY2soKTtcbiAgfVxuXG4gIG9uTWFuaWZlc3RQYXJzZWQoZXZlbnQsZGF0YSkge1xuICAgIHZhciBhYWM9ZmFsc2UsIGhlYWFjPWZhbHNlLGNvZGVjcztcbiAgICBkYXRhLmxldmVscy5mb3JFYWNoKGxldmVsID0+IHtcbiAgICAgIC8vIGRldGVjdCBpZiB3ZSBoYXZlIGRpZmZlcmVudCBraW5kIG9mIGF1ZGlvIGNvZGVjcyB1c2VkIGFtb25nc3QgcGxheWxpc3RzXG4gICAgICBjb2RlY3MgPSBsZXZlbC5jb2RlY3M7XG4gICAgICBpZihjb2RlY3MpIHtcbiAgICAgICAgaWYoY29kZWNzLmluZGV4T2YoJ21wNGEuNDAuMicpICE9PSAtMSkge1xuICAgICAgICAgIGFhYyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYoY29kZWNzLmluZGV4T2YoJ21wNGEuNDAuNScpICE9PSAtMSkge1xuICAgICAgICAgIGhlYWFjID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYXVkaW9jb2RlY3N3aXRjaCA9IChhYWMgJiYgaGVhYWMpO1xuICAgIGlmKHRoaXMuYXVkaW9jb2RlY3N3aXRjaCkge1xuICAgICAgbG9nZ2VyLmxvZygnYm90aCBBQUMvSEUtQUFDIGF1ZGlvIGZvdW5kIGluIGxldmVsczsgZGVjbGFyaW5nIGF1ZGlvIGNvZGVjIGFzIEhFLUFBQycpO1xuICAgIH1cbiAgICB0aGlzLmxldmVscyA9IGRhdGEubGV2ZWxzO1xuICAgIHRoaXMuc3RhcnRMZXZlbExvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhcnRGcmFnbWVudFJlcXVlc3RlZCA9IGZhbHNlO1xuICAgIGlmKHRoaXMudmlkZW8gJiYgdGhpcy5jb25maWcuYXV0b1N0YXJ0TG9hZCkge1xuICAgICAgdGhpcy5zdGFydExvYWQoKTtcbiAgICB9XG4gIH1cblxuICBvbkxldmVsTG9hZGVkKGV2ZW50LGRhdGEpIHtcbiAgICB2YXIgbmV3TGV2ZWxEZXRhaWxzID0gZGF0YS5kZXRhaWxzLFxuICAgICAgICBkdXJhdGlvbiA9IG5ld0xldmVsRGV0YWlscy50b3RhbGR1cmF0aW9uLFxuICAgICAgICBuZXdMZXZlbElkID0gZGF0YS5sZXZlbCxcbiAgICAgICAgbmV3TGV2ZWwgPSB0aGlzLmxldmVsc1tuZXdMZXZlbElkXSxcbiAgICAgICAgY3VyTGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVsXSxcbiAgICAgICAgc2xpZGluZyA9IDA7XG4gICAgbG9nZ2VyLmxvZyhgbGV2ZWwgJHtuZXdMZXZlbElkfSBsb2FkZWQgWyR7bmV3TGV2ZWxEZXRhaWxzLnN0YXJ0U059LCR7bmV3TGV2ZWxEZXRhaWxzLmVuZFNOfV0sZHVyYXRpb246JHtkdXJhdGlvbn1gKTtcbiAgICAvLyBjaGVjayBpZiBwbGF5bGlzdCBpcyBhbHJlYWR5IGxvYWRlZCAoaWYgeWVzLCBpdCBzaG91bGQgYmUgYSBsaXZlIHBsYXlsaXN0KVxuICAgIGlmKGN1ckxldmVsICYmIGN1ckxldmVsLmRldGFpbHMgJiYgY3VyTGV2ZWwuZGV0YWlscy5saXZlKSB7XG4gICAgICB2YXIgY3VyTGV2ZWxEZXRhaWxzID0gY3VyTGV2ZWwuZGV0YWlscztcbiAgICAgIC8vICBwbGF5bGlzdCBzbGlkaW5nIGlzIHRoZSBzdW0gb2YgOiBjdXJyZW50IHBsYXlsaXN0IHNsaWRpbmcgKyBzbGlkaW5nIG9mIG5ldyBwbGF5bGlzdCBjb21wYXJlZCB0byBjdXJyZW50IG9uZVxuICAgICAgLy8gY2hlY2sgc2xpZGluZyBvZiB1cGRhdGVkIHBsYXlsaXN0IGFnYWluc3QgY3VycmVudCBvbmUgOlxuICAgICAgLy8gYW5kIGZpbmQgaXRzIHBvc2l0aW9uIGluIGN1cnJlbnQgcGxheWxpc3RcbiAgICAgIC8vbG9nZ2VyLmxvZyhcImZyYWdtZW50c1swXS5zbi90aGlzLmxldmVsL2N1ckxldmVsLmRldGFpbHMuZnJhZ21lbnRzWzBdLnNuOlwiICsgZnJhZ21lbnRzWzBdLnNuICsgXCIvXCIgKyB0aGlzLmxldmVsICsgXCIvXCIgKyBjdXJMZXZlbC5kZXRhaWxzLmZyYWdtZW50c1swXS5zbik7XG4gICAgICB2YXIgU05kaWZmID0gbmV3TGV2ZWxEZXRhaWxzLnN0YXJ0U04gLSBjdXJMZXZlbERldGFpbHMuc3RhcnRTTjtcbiAgICAgIGlmKFNOZGlmZiA+PTApIHtcbiAgICAgICAgLy8gcG9zaXRpdmUgc2xpZGluZyA6IG5ldyBwbGF5bGlzdCBzbGlkaW5nIHdpbmRvdyBpcyBhZnRlciBwcmV2aW91cyBvbmVcbiAgICAgICAgdmFyIG9sZGZyYWdtZW50cyA9IGN1ckxldmVsRGV0YWlscy5mcmFnbWVudHM7XG4gICAgICAgIGlmKCBTTmRpZmYgPCBvbGRmcmFnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgc2xpZGluZyA9IGN1ckxldmVsRGV0YWlscy5zbGlkaW5nICsgb2xkZnJhZ21lbnRzW1NOZGlmZl0uc3RhcnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nZ2VyLmxvZyhgY2Fubm90IGNvbXB1dGUgc2xpZGluZywgbm8gU04gaW4gY29tbW9uIGJldHdlZW4gb2xkL25ldyBsZXZlbDpbJHtjdXJMZXZlbERldGFpbHMuc3RhcnRTTn0sJHtjdXJMZXZlbERldGFpbHMuZW5kU059XS9bJHtuZXdMZXZlbERldGFpbHMuc3RhcnRTTn0sJHtuZXdMZXZlbERldGFpbHMuZW5kU059XWApO1xuICAgICAgICAgIHNsaWRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5lZ2F0aXZlIHNsaWRpbmc6IG5ldyBwbGF5bGlzdCBzbGlkaW5nIHdpbmRvdyBpcyBiZWZvcmUgcHJldmlvdXMgb25lXG4gICAgICAgIHNsaWRpbmcgPSBjdXJMZXZlbERldGFpbHMuc2xpZGluZyAtIG5ld0xldmVsRGV0YWlscy5mcmFnbWVudHNbLVNOZGlmZl0uc3RhcnQ7XG4gICAgICB9XG4gICAgICBpZihzbGlkaW5nKSB7XG4gICAgICAgIGxvZ2dlci5sb2coYGxpdmUgcGxheWxpc3Qgc2xpZGluZzoke3NsaWRpbmcudG9GaXhlZCgzKX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gb3ZlcnJpZGUgbGV2ZWwgaW5mb1xuICAgIG5ld0xldmVsLmRldGFpbHMgPSBuZXdMZXZlbERldGFpbHM7XG4gICAgbmV3TGV2ZWwuZGV0YWlscy5zbGlkaW5nID0gc2xpZGluZztcbiAgICBpZih0aGlzLnN0YXJ0TGV2ZWxMb2FkZWQgPT09IGZhbHNlKSB7XG4gICAgICAvLyBpZiBsaXZlIHBsYXlsaXN0LCBzZXQgc3RhcnQgcG9zaXRpb24gdG8gYmUgZnJhZ21lbnQgTi0zXG4gICAgICBpZihuZXdMZXZlbERldGFpbHMubGl2ZSkge1xuICAgICAgICB0aGlzLnN0YXJ0UG9zaXRpb24gPSBNYXRoLm1heCgwLGR1cmF0aW9uIC0gMyAqIG5ld0xldmVsRGV0YWlscy50YXJnZXRkdXJhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLm5leHRMb2FkUG9zaXRpb24gPSB0aGlzLnN0YXJ0UG9zaXRpb247XG4gICAgICB0aGlzLnN0YXJ0TGV2ZWxMb2FkZWQgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBvbmx5IHN3aXRjaCBiYXRjayB0byBJRExFIHN0YXRlIGlmIHdlIHdlcmUgd2FpdGluZyBmb3IgbGV2ZWwgdG8gc3RhcnQgZG93bmxvYWRpbmcgYSBuZXcgZnJhZ21lbnRcbiAgICBpZih0aGlzLnN0YXRlID09PSB0aGlzLldBSVRJTkdfTEVWRUwpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLklETEU7XG4gICAgfVxuICAgIC8vdHJpZ2dlciBoYW5kbGVyIHJpZ2h0IG5vd1xuICAgIHRoaXMudGljaygpO1xuICB9XG5cbiAgb25GcmFnbWVudExvYWRlZChldmVudCxkYXRhKSB7XG4gICAgaWYodGhpcy5zdGF0ZSA9PT0gdGhpcy5MT0FESU5HKSB7XG4gICAgICBpZih0aGlzLmZyYWdtZW50Qml0cmF0ZVRlc3QgPT09IHRydWUpIHtcbiAgICAgICAgLy8gc3dpdGNoIGJhY2sgdG8gSURMRSBzdGF0ZSAuLi4gd2UganVzdCBsb2FkZWQgYSBmcmFnbWVudCB0byBkZXRlcm1pbmUgYWRlcXVhdGUgc3RhcnQgYml0cmF0ZSBhbmQgaW5pdGlhbGl6ZSBhdXRvc3dpdGNoIGFsZ29cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuSURMRTtcbiAgICAgICAgdGhpcy5mcmFnbWVudEJpdHJhdGVUZXN0ID0gZmFsc2U7XG4gICAgICAgIGRhdGEuc3RhdHMudHBhcnNlZCA9IGRhdGEuc3RhdHMudGJ1ZmZlcmVkID0gbmV3IERhdGUoKTtcbiAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX0JVRkZFUkVELCB7IHN0YXRzIDogZGF0YS5zdGF0cywgZnJhZyA6IHRoaXMuZnJhZ30pO1xuICAgICAgICB0aGlzLmZyYWcgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuUEFSU0lORztcbiAgICAgICAgLy8gdHJhbnNtdXggdGhlIE1QRUctVFMgZGF0YSB0byBJU08tQk1GRiBzZWdtZW50c1xuICAgICAgICB0aGlzLnN0YXRzID0gZGF0YS5zdGF0cztcbiAgICAgICAgdmFyIGN1cnJlbnRMZXZlbCA9IHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxdLCBkZXRhaWxzID0gY3VycmVudExldmVsLmRldGFpbHMsICBkdXJhdGlvbiA9ICBkZXRhaWxzLnRvdGFsZHVyYXRpb24sIHN0YXJ0ID0gdGhpcy5mcmFnLnN0YXJ0O1xuICAgICAgICBpZihkZXRhaWxzLmxpdmUpIHtcbiAgICAgICAgICBkdXJhdGlvbis9ZGV0YWlscy5zbGlkaW5nO1xuICAgICAgICAgIHN0YXJ0Kz1kZXRhaWxzLnNsaWRpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5mcmFnLmRyaWZ0KSB7XG4gICAgICAgICAgc3RhcnQrPSB0aGlzLmZyYWcuZHJpZnQ7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLmxvZyhgRGVtdXhpbmcgICAgICAke3RoaXMuZnJhZy5zbn0gb2YgWyR7ZGV0YWlscy5zdGFydFNOfSAsJHtkZXRhaWxzLmVuZFNOfV0sbGV2ZWwgJHt0aGlzLmxldmVsfWApO1xuICAgICAgICB0aGlzLmRlbXV4ZXIucHVzaChkYXRhLnBheWxvYWQsY3VycmVudExldmVsLmF1ZGlvQ29kZWMsY3VycmVudExldmVsLnZpZGVvQ29kZWMsc3RhcnQsdGhpcy5mcmFnLmNjLCB0aGlzLmxldmVsLCBkdXJhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25Jbml0U2VnbWVudChldmVudCxkYXRhKSB7XG4gICAgaWYodGhpcy5zdGF0ZSA9PT0gdGhpcy5QQVJTSU5HKSB7XG4gICAgICAvLyBjaGVjayBpZiBjb2RlY3MgaGF2ZSBiZWVuIGV4cGxpY2l0ZWx5IGRlZmluZWQgaW4gdGhlIG1hc3RlciBwbGF5bGlzdCBmb3IgdGhpcyBsZXZlbDtcbiAgICAgIC8vIGlmIHllcyB1c2UgdGhlc2Ugb25lcyBpbnN0ZWFkIG9mIHRoZSBvbmVzIHBhcnNlZCBmcm9tIHRoZSBkZW11eFxuICAgICAgdmFyIGF1ZGlvQ29kZWMgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVsXS5hdWRpb0NvZGVjLCB2aWRlb0NvZGVjID0gdGhpcy5sZXZlbHNbdGhpcy5sZXZlbF0udmlkZW9Db2RlYyxzYjtcbiAgICAgIC8vbG9nZ2VyLmxvZygncGxheWxpc3QgbGV2ZWwgQS9WIGNvZGVjczonICsgYXVkaW9Db2RlYyArICcsJyArIHZpZGVvQ29kZWMpO1xuICAgICAgLy9sb2dnZXIubG9nKCdwbGF5bGlzdCBjb2RlY3M6JyArIGNvZGVjKTtcbiAgICAgIC8vIGlmIHBsYXlsaXN0IGRvZXMgbm90IHNwZWNpZnkgY29kZWNzLCB1c2UgY29kZWNzIGZvdW5kIHdoaWxlIHBhcnNpbmcgZnJhZ21lbnRcbiAgICAgIGlmKGF1ZGlvQ29kZWMgPT09IHVuZGVmaW5lZCB8fCBkYXRhLmF1ZGlvY29kZWMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhdWRpb0NvZGVjID0gZGF0YS5hdWRpb0NvZGVjO1xuICAgICAgfVxuICAgICAgaWYodmlkZW9Db2RlYyA9PT0gdW5kZWZpbmVkICB8fCBkYXRhLnZpZGVvY29kZWMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2aWRlb0NvZGVjID0gZGF0YS52aWRlb0NvZGVjO1xuICAgICAgfVxuICAgICAgLy8gaW4gY2FzZSBzZXZlcmFsIGF1ZGlvIGNvZGVjcyBtaWdodCBiZSB1c2VkLCBmb3JjZSBIRS1BQUMgZm9yIGF1ZGlvIChzb21lIGJyb3dzZXJzIGRvbid0IHN1cHBvcnQgYXVkaW8gY29kZWMgc3dpdGNoKVxuICAgICAgLy9kb24ndCBkbyBpdCBmb3IgbW9ubyBzdHJlYW1zIC4uLlxuICAgICAgaWYodGhpcy5hdWRpb2NvZGVjc3dpdGNoICYmIGRhdGEuYXVkaW9DaGFubmVsQ291bnQgPT09IDIgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2FuZHJvaWQnKSA9PT0gLTEgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2ZpcmVmb3gnKSA9PT0gLTEpIHtcbiAgICAgICAgYXVkaW9Db2RlYyA9ICdtcDRhLjQwLjUnO1xuICAgICAgfVxuICAgICAgaWYoIXRoaXMuc291cmNlQnVmZmVyKSB7XG4gICAgICAgIHRoaXMuc291cmNlQnVmZmVyID0ge307XG4gICAgICAgIGxvZ2dlci5sb2coYHNlbGVjdGVkIEEvViBjb2RlY3MgZm9yIHNvdXJjZUJ1ZmZlcnM6JHthdWRpb0NvZGVjfSwke3ZpZGVvQ29kZWN9YCk7XG4gICAgICAgIC8vIGNyZWF0ZSBzb3VyY2UgQnVmZmVyIGFuZCBsaW5rIHRoZW0gdG8gTWVkaWFTb3VyY2VcbiAgICAgICAgaWYoYXVkaW9Db2RlYykge1xuICAgICAgICAgIHNiID0gdGhpcy5zb3VyY2VCdWZmZXIuYXVkaW8gPSB0aGlzLm1lZGlhU291cmNlLmFkZFNvdXJjZUJ1ZmZlcihgdmlkZW8vbXA0O2NvZGVjcz0ke2F1ZGlvQ29kZWN9YCk7XG4gICAgICAgICAgc2IuYWRkRXZlbnRMaXN0ZW5lcigndXBkYXRlZW5kJywgdGhpcy5vbnNidWUpO1xuICAgICAgICAgIHNiLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5vbnNiZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodmlkZW9Db2RlYykge1xuICAgICAgICAgIHNiID0gdGhpcy5zb3VyY2VCdWZmZXIudmlkZW8gPSB0aGlzLm1lZGlhU291cmNlLmFkZFNvdXJjZUJ1ZmZlcihgdmlkZW8vbXA0O2NvZGVjcz0ke3ZpZGVvQ29kZWN9YCk7XG4gICAgICAgICAgc2IuYWRkRXZlbnRMaXN0ZW5lcigndXBkYXRlZW5kJywgdGhpcy5vbnNidWUpO1xuICAgICAgICAgIHNiLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5vbnNiZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKGF1ZGlvQ29kZWMpIHtcbiAgICAgICAgdGhpcy5tcDRzZWdtZW50cy5wdXNoKHsgdHlwZSA6ICdhdWRpbycsIGRhdGEgOiBkYXRhLmF1ZGlvTW9vdn0pO1xuICAgICAgfVxuICAgICAgaWYodmlkZW9Db2RlYykge1xuICAgICAgICB0aGlzLm1wNHNlZ21lbnRzLnB1c2goeyB0eXBlIDogJ3ZpZGVvJywgZGF0YSA6IGRhdGEudmlkZW9Nb292fSk7XG4gICAgICB9XG4gICAgICAvL3RyaWdnZXIgaGFuZGxlciByaWdodCBub3dcbiAgICAgIHRoaXMudGljaygpO1xuICAgIH1cbiAgfVxuXG4gIG9uRnJhZ21lbnRQYXJzaW5nKGV2ZW50LGRhdGEpIHtcbiAgICBpZih0aGlzLnN0YXRlID09PSB0aGlzLlBBUlNJTkcpIHtcbiAgICAgIHRoaXMudHBhcnNlMiA9IERhdGUubm93KCk7XG4gICAgICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsc1t0aGlzLmxldmVsXTtcbiAgICAgIGlmKGxldmVsLmRldGFpbHMubGl2ZSkge1xuICAgICAgICB2YXIgZnJhZ21lbnRzID0gdGhpcy5sZXZlbHNbdGhpcy5sZXZlbF0uZGV0YWlscy5mcmFnbWVudHM7XG4gICAgICAgIHZhciBzbjAgPSBmcmFnbWVudHNbMF0uc24sc24xID0gZnJhZ21lbnRzW2ZyYWdtZW50cy5sZW5ndGgtMV0uc24sIHNuID0gdGhpcy5mcmFnLnNuO1xuICAgICAgICAvL3JldHJpZXZlIHRoaXMuZnJhZy5zbiBpbiB0aGlzLmxldmVsc1t0aGlzLmxldmVsXVxuICAgICAgICBpZihzbiA+PSBzbjAgJiYgc24gPD0gc24xKSB7XG4gICAgICAgICAgbGV2ZWwuZGV0YWlscy5zbGlkaW5nID0gZGF0YS5zdGFydFBUUyAtIGZyYWdtZW50c1tzbi1zbjBdLnN0YXJ0O1xuICAgICAgICAgIC8vbG9nZ2VyLmxvZyhgbGl2ZSBwbGF5bGlzdCBzbGlkaW5nOiR7bGV2ZWwuZGV0YWlscy5zbGlkaW5nLnRvRml4ZWQoMyl9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvZ2dlci5sb2coYCAgICAgIHBhcnNlZCBkYXRhLCB0eXBlL3N0YXJ0UFRTL2VuZFBUUy9zdGFydERUUy9lbmREVFMvbmI6JHtkYXRhLnR5cGV9LyR7ZGF0YS5zdGFydFBUUy50b0ZpeGVkKDMpfS8ke2RhdGEuZW5kUFRTLnRvRml4ZWQoMyl9LyR7ZGF0YS5zdGFydERUUy50b0ZpeGVkKDMpfS8ke2RhdGEuZW5kRFRTLnRvRml4ZWQoMyl9LyR7ZGF0YS5uYn1gKTtcbiAgICAgIC8vdGhpcy5mcmFnLmRyaWZ0PWRhdGEuc3RhcnRQVFMtdGhpcy5mcmFnLnN0YXJ0O1xuICAgICAgdGhpcy5mcmFnLmRyaWZ0PTA7XG4gICAgICAvLyBpZihsZXZlbC5kZXRhaWxzLnNsaWRpbmcpIHtcbiAgICAgIC8vICAgdGhpcy5mcmFnLmRyaWZ0LT1sZXZlbC5kZXRhaWxzLnNsaWRpbmc7XG4gICAgICAvLyB9XG4gICAgICAvL2xvZ2dlci5sb2coYCAgICAgIGRyaWZ0OiR7dGhpcy5mcmFnLmRyaWZ0LnRvRml4ZWQoMyl9YCk7XG4gICAgICB0aGlzLm1wNHNlZ21lbnRzLnB1c2goeyB0eXBlIDogZGF0YS50eXBlLCBkYXRhIDogZGF0YS5tb29mfSk7XG4gICAgICB0aGlzLm1wNHNlZ21lbnRzLnB1c2goeyB0eXBlIDogZGF0YS50eXBlLCBkYXRhIDogZGF0YS5tZGF0fSk7XG4gICAgICB0aGlzLm5leHRMb2FkUG9zaXRpb24gPSBkYXRhLmVuZFBUUztcbiAgICAgIHRoaXMuYnVmZmVyUmFuZ2UucHVzaCh7dHlwZSA6IGRhdGEudHlwZSwgc3RhcnQgOiBkYXRhLnN0YXJ0UFRTLCBlbmQgOiBkYXRhLmVuZFBUUywgZnJhZyA6IHRoaXMuZnJhZ30pO1xuICAgICAgLy8gaWYoZGF0YS50eXBlID09PSAndmlkZW8nKSB7XG4gICAgICAvLyAgIHRoaXMuZnJhZy5mcHNFeHBlY3RlZCA9IChkYXRhLm5iLTEpIC8gKGRhdGEuZW5kUFRTIC0gZGF0YS5zdGFydFBUUyk7XG4gICAgICAvLyB9XG4gICAgICAvL3RyaWdnZXIgaGFuZGxlciByaWdodCBub3dcbiAgICAgIHRoaXMudGljaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIud2Fybihgbm90IGluIFBBUlNJTkcgc3RhdGUsIGRpc2NhcmRpbmcgJHtldmVudH1gKTtcbiAgICB9XG4gIH1cblxuICBvbkZyYWdtZW50UGFyc2VkKCkge1xuICAgIGlmKHRoaXMuc3RhdGUgPT09IHRoaXMuUEFSU0lORykge1xuICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuUEFSU0VEO1xuICAgICAgdGhpcy5zdGF0cy50cGFyc2VkID0gbmV3IERhdGUoKTtcbiAgICAgIC8vdHJpZ2dlciBoYW5kbGVyIHJpZ2h0IG5vd1xuICAgICAgdGhpcy50aWNrKCk7XG4gICAgfVxuICB9XG5cbiAgb25FcnJvcihldmVudCxkYXRhKSB7XG4gICAgc3dpdGNoKGRhdGEuZGV0YWlscykge1xuICAgICAgLy8gYWJvcnQgZnJhZ21lbnQgbG9hZGluZyBvbiBlcnJvcnNcbiAgICAgIGNhc2UgRXJyb3JEZXRhaWxzLkZSQUdfTE9BRF9FUlJPUjpcbiAgICAgIGNhc2UgRXJyb3JEZXRhaWxzLkZSQUdfTE9BRF9USU1FT1VUOlxuICAgICAgY2FzZSBFcnJvckRldGFpbHMuRlJBR19MT09QX0xPQURJTkdfRVJST1I6XG4gICAgICBjYXNlIEVycm9yRGV0YWlscy5MRVZFTF9MT0FEX0VSUk9SOlxuICAgICAgY2FzZSBFcnJvckRldGFpbHMuTEVWRUxfTE9BRF9USU1FT1VUOlxuICAgICAgICAvLyBpZiBmYXRhbCBlcnJvciwgc3RvcCBwcm9jZXNzaW5nLCBvdGhlcndpc2UgbW92ZSB0byBJRExFIHRvIHJldHJ5IGxvYWRpbmdcbiAgICAgICAgbG9nZ2VyLndhcm4oYGJ1ZmZlciBjb250cm9sbGVyOiAke2RhdGEuZGV0YWlsc30gd2hpbGUgbG9hZGluZyBmcmFnLHN3aXRjaCB0byAke2RhdGEuZmF0YWwgPyAnRVJST1InIDogJ0lETEUnfSBzdGF0ZSAuLi5gKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IGRhdGEuZmF0YWwgPyB0aGlzLkVSUk9SIDogdGhpcy5JRExFO1xuICAgICAgICB0aGlzLmZyYWcgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIG9uU291cmNlQnVmZmVyVXBkYXRlRW5kKCkge1xuICAgIC8vdHJpZ2dlciBoYW5kbGVyIHJpZ2h0IG5vd1xuICAgIGlmKHRoaXMuc3RhdGUgPT09IHRoaXMuQVBQRU5ESU5HICYmIHRoaXMubXA0c2VnbWVudHMubGVuZ3RoID09PSAwKSAge1xuICAgICAgaWYodGhpcy5mcmFnKSB7XG4gICAgICAgIHRoaXMuc3RhdHMudGJ1ZmZlcmVkID0gbmV3IERhdGUoKTtcbiAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX0JVRkZFUkVELCB7IHN0YXRzIDogdGhpcy5zdGF0cywgZnJhZyA6IHRoaXMuZnJhZ30pO1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5JRExFO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRpY2soKTtcbiAgfVxuXG4gIG9uU291cmNlQnVmZmVyRXJyb3IoZXZlbnQpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgc291cmNlQnVmZmVyIGVycm9yOiR7ZXZlbnR9YCk7XG4gICAgICB0aGlzLnN0YXRlID0gdGhpcy5FUlJPUjtcbiAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRVJST1IsIHt0eXBlIDogRXJyb3JUeXBlcy5NRURJQV9FUlJPUiwgZGV0YWlscyA6IEVycm9yRGV0YWlscy5GUkFHX0FQUEVORElOR19FUlJPUiwgZmF0YWw6dHJ1ZSwgZnJhZyA6IHRoaXMuZnJhZ30pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJ1ZmZlckNvbnRyb2xsZXI7XG4iLCIvKlxuICogbGV2ZWwgY29udHJvbGxlclxuICpcbiAqL1xuXG4gaW1wb3J0IEV2ZW50ICAgICAgICAgICAgICAgIGZyb20gJy4uL2V2ZW50cyc7XG4gaW1wb3J0IG9ic2VydmVyICAgICAgICAgICAgIGZyb20gJy4uL29ic2VydmVyJztcbiBpbXBvcnQge2xvZ2dlcn0gICAgICAgICAgICAgZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbiBpbXBvcnQge0Vycm9yVHlwZXMsRXJyb3JEZXRhaWxzfSBmcm9tICcuLi9lcnJvcnMnO1xuXG4gY2xhc3MgTGV2ZWxDb250cm9sbGVyIHtcblxuICBjb25zdHJ1Y3RvcihobHMpIHtcbiAgICB0aGlzLmhscyA9IGhscztcbiAgICB0aGlzLm9ubWwgPSB0aGlzLm9uTWFuaWZlc3RMb2FkZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9ubGwgPSB0aGlzLm9uTGV2ZWxMb2FkZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uZmxwID0gdGhpcy5vbkZyYWdtZW50TG9hZFByb2dyZXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbmVyciA9IHRoaXMub25FcnJvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMub250aWNrID0gdGhpcy50aWNrLmJpbmQodGhpcyk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuTUFOSUZFU1RfTE9BREVELCB0aGlzLm9ubWwpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50LkZSQUdfTE9BRF9QUk9HUkVTUywgdGhpcy5vbmZscCk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuTEVWRUxfTE9BREVELCB0aGlzLm9ubGwpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50LkVSUk9SLCB0aGlzLm9uZXJyKTtcbiAgICB0aGlzLl9tYW51YWxMZXZlbCA9IHRoaXMuX2F1dG9MZXZlbENhcHBpbmcgPSAtMTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgb2JzZXJ2ZXIub2ZmKEV2ZW50Lk1BTklGRVNUX0xPQURFRCwgdGhpcy5vbm1sKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRlJBR19MT0FEX1BST0dSRVNTLCB0aGlzLm9uZmxwKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuTEVWRUxfTE9BREVELCB0aGlzLm9ubGwpO1xuICAgIG9ic2VydmVyLm9mZihFdmVudC5FUlJPUiwgdGhpcy5vbmVycik7XG4gICAgaWYodGhpcy50aW1lcikge1xuICAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgIH1cbiAgICB0aGlzLl9tYW51YWxMZXZlbCA9IC0xO1xuICB9XG5cbiAgb25NYW5pZmVzdExvYWRlZChldmVudCxkYXRhKSB7XG4gICAgdmFyIGxldmVscyA9IFtdLGJpdHJhdGVTdGFydCxpLGJpdHJhdGVTZXQ9e307XG4gICAgZGF0YS5sZXZlbHMuZm9yRWFjaChsZXZlbCA9PiB7XG4gICAgICB2YXIgcmVkdW5kYW50TGV2ZWxJZCA9IGJpdHJhdGVTZXRbbGV2ZWwuYml0cmF0ZV07XG4gICAgICBpZihyZWR1bmRhbnRMZXZlbElkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYml0cmF0ZVNldFtsZXZlbC5iaXRyYXRlXSA9IGxldmVscy5sZW5ndGg7XG4gICAgICAgIGxldmVsLnVybCA9IFtsZXZlbC51cmxdO1xuICAgICAgICBsZXZlbC51cmxJZCA9IDA7XG4gICAgICAgIGxldmVscy5wdXNoKGxldmVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldmVsc1tyZWR1bmRhbnRMZXZlbElkXS51cmwucHVzaChsZXZlbC51cmwpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIHN0YXJ0IGJpdHJhdGUgaXMgdGhlIGZpcnN0IGJpdHJhdGUgb2YgdGhlIG1hbmlmZXN0XG4gICAgYml0cmF0ZVN0YXJ0ID0gbGV2ZWxzWzBdLmJpdHJhdGU7XG4gICAgLy8gc29ydCBsZXZlbCBvbiBiaXRyYXRlXG4gICAgbGV2ZWxzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmJpdHJhdGUtYi5iaXRyYXRlO1xuICAgIH0pO1xuICAgIHRoaXMuX2xldmVscyA9IGxldmVscztcblxuICAgIC8vIGZpbmQgaW5kZXggb2YgZmlyc3QgbGV2ZWwgaW4gc29ydGVkIGxldmVsc1xuICAgIGZvcihpPTA7IGkgPCBsZXZlbHMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBpZihsZXZlbHNbaV0uYml0cmF0ZSA9PT0gYml0cmF0ZVN0YXJ0KSB7XG4gICAgICAgIHRoaXMuX2ZpcnN0TGV2ZWwgPSBpO1xuICAgICAgICBsb2dnZXIubG9nKGBtYW5pZmVzdCBsb2FkZWQsJHtsZXZlbHMubGVuZ3RofSBsZXZlbChzKSBmb3VuZCwgZmlyc3QgYml0cmF0ZToke2JpdHJhdGVTdGFydH1gKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuTUFOSUZFU1RfUEFSU0VELFxuICAgICAgICAgICAgICAgICAgICB7IGxldmVscyA6IHRoaXMuX2xldmVscyxcbiAgICAgICAgICAgICAgICAgICAgICBmaXJzdExldmVsIDogdGhpcy5fZmlyc3RMZXZlbCxcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0cyA6IGRhdGEuc3RhdHNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ2V0IGxldmVscygpIHtcbiAgICByZXR1cm4gdGhpcy5fbGV2ZWxzO1xuICB9XG5cbiAgZ2V0IGxldmVsKCkge1xuICAgIHJldHVybiB0aGlzLl9sZXZlbDtcbiAgfVxuXG4gIHNldCBsZXZlbChuZXdMZXZlbCkge1xuICAgIGlmKHRoaXMuX2xldmVsICE9PSBuZXdMZXZlbCB8fCB0aGlzLl9sZXZlbHNbbmV3TGV2ZWxdLmRldGFpbHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRMZXZlbEludGVybmFsKG5ld0xldmVsKTtcbiAgICB9XG4gIH1cblxuIHNldExldmVsSW50ZXJuYWwobmV3TGV2ZWwpIHtcbiAgICAvLyBjaGVjayBpZiBsZXZlbCBpZHggaXMgdmFsaWRcbiAgICBpZihuZXdMZXZlbCA+PSAwICYmIG5ld0xldmVsIDwgdGhpcy5fbGV2ZWxzLmxlbmd0aCkge1xuICAgICAgLy8gc3RvcHBpbmcgbGl2ZSByZWxvYWRpbmcgdGltZXIgaWYgYW55XG4gICAgICBpZih0aGlzLnRpbWVyKSB7XG4gICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2xldmVsID0gbmV3TGV2ZWw7XG4gICAgICBsb2dnZXIubG9nKGBzd2l0Y2hpbmcgdG8gbGV2ZWwgJHtuZXdMZXZlbH1gKTtcbiAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuTEVWRUxfU1dJVENILCB7IGxldmVsIDogbmV3TGV2ZWx9KTtcbiAgICAgIHZhciBsZXZlbCA9IHRoaXMuX2xldmVsc1tuZXdMZXZlbF07XG4gICAgICAgLy8gY2hlY2sgaWYgd2UgbmVlZCB0byBsb2FkIHBsYXlsaXN0IGZvciB0aGlzIGxldmVsXG4gICAgICBpZihsZXZlbC5kZXRhaWxzID09PSB1bmRlZmluZWQgfHwgbGV2ZWwuZGV0YWlscy5saXZlID09PSB0cnVlKSB7XG4gICAgICAgIC8vIGxldmVsIG5vdCByZXRyaWV2ZWQgeWV0LCBvciBsaXZlIHBsYXlsaXN0IHdlIG5lZWQgdG8gKHJlKWxvYWQgaXRcbiAgICAgICAgbG9nZ2VyLmxvZyhgKHJlKWxvYWRpbmcgcGxheWxpc3QgZm9yIGxldmVsICR7bmV3TGV2ZWx9YCk7XG4gICAgICAgIHZhciB1cmxJZCA9IGxldmVsLnVybElkO1xuICAgICAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkxFVkVMX0xPQURJTkcsIHsgdXJsIDogbGV2ZWwudXJsW3VybElkXSwgbGV2ZWwgOiBuZXdMZXZlbCwgaWQgOiB1cmxJZH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbnZhbGlkIGxldmVsIGlkIGdpdmVuLCB0cmlnZ2VyIGVycm9yXG4gICAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkVSUk9SLCB7IHR5cGUgOiBFcnJvclR5cGVzLk9USEVSX0VSUk9SLCBkZXRhaWxzOiBFcnJvckRldGFpbHMuTEVWRUxfU1dJVENIX0VSUk9SLCBsZXZlbCA6IG5ld0xldmVsLCBmYXRhbDpmYWxzZSwgcmVhc29uOiAnaW52YWxpZCBsZXZlbCBpZHgnfSk7XG4gICAgfVxuIH1cblxuXG4gIGdldCBtYW51YWxMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFudWFsTGV2ZWw7XG4gIH1cblxuICBzZXQgbWFudWFsTGV2ZWwobmV3TGV2ZWwpIHtcbiAgICB0aGlzLl9tYW51YWxMZXZlbCA9IG5ld0xldmVsO1xuICAgIGlmKG5ld0xldmVsICE9PS0xKSB7XG4gICAgICB0aGlzLmxldmVsID0gbmV3TGV2ZWw7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybiB0aGUgY2FwcGluZy9tYXggbGV2ZWwgdmFsdWUgdGhhdCBjb3VsZCBiZSB1c2VkIGJ5IGF1dG9tYXRpYyBsZXZlbCBzZWxlY3Rpb24gYWxnb3JpdGhtICoqL1xuICBnZXQgYXV0b0xldmVsQ2FwcGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5fYXV0b0xldmVsQ2FwcGluZztcbiAgfVxuXG4gIC8qKiBzZXQgdGhlIGNhcHBpbmcvbWF4IGxldmVsIHZhbHVlIHRoYXQgY291bGQgYmUgdXNlZCBieSBhdXRvbWF0aWMgbGV2ZWwgc2VsZWN0aW9uIGFsZ29yaXRobSAqKi9cbiAgc2V0IGF1dG9MZXZlbENhcHBpbmcobmV3TGV2ZWwpIHtcbiAgICB0aGlzLl9hdXRvTGV2ZWxDYXBwaW5nID0gbmV3TGV2ZWw7XG4gIH1cblxuICBnZXQgZmlyc3RMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmlyc3RMZXZlbDtcbiAgfVxuXG4gIHNldCBmaXJzdExldmVsKG5ld0xldmVsKSB7XG4gICAgdGhpcy5fZmlyc3RMZXZlbCA9IG5ld0xldmVsO1xuICB9XG5cbiAgZ2V0IHN0YXJ0TGV2ZWwoKSB7XG4gICAgaWYodGhpcy5fc3RhcnRMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlyc3RMZXZlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0TGV2ZWw7XG4gICAgfVxuICB9XG5cbiAgc2V0IHN0YXJ0TGV2ZWwobmV3TGV2ZWwpIHtcbiAgICB0aGlzLl9zdGFydExldmVsID0gbmV3TGV2ZWw7XG4gIH1cblxuICBvbkZyYWdtZW50TG9hZFByb2dyZXNzKGV2ZW50LGRhdGEpIHtcbiAgICB2YXIgc3RhdHMgPSBkYXRhLnN0YXRzO1xuICAgIGlmKHN0YXRzLmFib3J0ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5sYXN0ZmV0Y2hkdXJhdGlvbiA9IChuZXcgRGF0ZSgpIC0gc3RhdHMudHJlcXVlc3QpLzEwMDA7XG4gICAgICB0aGlzLmxhc3RmZXRjaGxldmVsID0gZGF0YS5mcmFnLmxldmVsO1xuICAgICAgdGhpcy5sYXN0YncgPSBzdGF0cy5sb2FkZWQqOC90aGlzLmxhc3RmZXRjaGR1cmF0aW9uO1xuICAgICAgLy9jb25zb2xlLmxvZyhgZmV0Y2hEdXJhdGlvbjoke3RoaXMubGFzdGZldGNoZHVyYXRpb259LGJ3OiR7KHRoaXMubGFzdGJ3LzEwMDApLnRvRml4ZWQoMCl9LyR7c3RhdHMuYWJvcnRlZH1gKTtcbiAgICB9XG4gIH1cblxuICBvbkVycm9yKGV2ZW50LGRhdGEpIHtcbiAgICB2YXIgZGV0YWlscyA9IGRhdGEuZGV0YWlscyxsZXZlbElkLGxldmVsO1xuICAgIC8vIHRyeSB0byByZWNvdmVyIG5vdCBmYXRhbCBlcnJvcnNcbiAgICBzd2l0Y2goZGV0YWlscykge1xuICAgICAgY2FzZSBFcnJvckRldGFpbHMuRlJBR19MT0FEX0VSUk9SOlxuICAgICAgY2FzZSBFcnJvckRldGFpbHMuRlJBR19MT0FEX1RJTUVPVVQ6XG4gICAgICBjYXNlIEVycm9yRGV0YWlscy5GUkFHX0xPT1BfTE9BRElOR19FUlJPUjpcbiAgICAgICAgIGxldmVsSWQgPSBkYXRhLmZyYWcubGV2ZWw7XG4gICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRXJyb3JEZXRhaWxzLkxFVkVMX0xPQURfRVJST1I6XG4gICAgICBjYXNlIEVycm9yRGV0YWlscy5MRVZFTF9MT0FEX1RJTUVPVVQ6XG4gICAgICAgIGxldmVsSWQgPSBkYXRhLmxldmVsO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvKiB0cnkgdG8gc3dpdGNoIHRvIGEgcmVkdW5kYW50IHN0cmVhbSBpZiBhbnkgYXZhaWxhYmxlLlxuICAgICAqIGlmIG5vIHJlZHVuZGFudCBzdHJlYW0gYXZhaWxhYmxlLCBlbWVyZ2VuY3kgc3dpdGNoIGRvd24gKGlmIGluIGF1dG8gbW9kZSBhbmQgY3VycmVudCBsZXZlbCBub3QgMClcbiAgICAgKiBvdGhlcndpc2UsIHdlIGNhbm5vdCByZWNvdmVyIHRoaXMgbmV0d29yayBlcnJvciAuLi4uXG4gICAgICovXG4gICAgaWYobGV2ZWxJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXZlbCA9IHRoaXMuX2xldmVsc1tsZXZlbElkXTtcbiAgICAgIGlmKGxldmVsLnVybElkIDwgbGV2ZWwudXJsLmxlbmd0aC0xKSB7XG4gICAgICAgIGxldmVsLnVybElkKys7XG4gICAgICAgIGxldmVsLmRldGFpbHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGxvZ2dlci53YXJuKGBsZXZlbCBjb250cm9sbGVyLCR7ZGV0YWlsc30gZm9yIGxldmVsICR7bGV2ZWxJZH06IHN3aXRjaGluZyB0byByZWR1bmRhbnQgc3RyZWFtIGlkICR7bGV2ZWwudXJsSWR9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3ZSBjb3VsZCB0cnkgdG8gcmVjb3ZlciBpZiBpbiBhdXRvIG1vZGUgYW5kIGN1cnJlbnQgbGV2ZWwgbm90IGxvd2VzdCBsZXZlbCAoMClcbiAgICAgICAgbGV0IHJlY292ZXJhYmxlID0gKCh0aGlzLl9tYW51YWxMZXZlbCA9PT0gLTEpICYmIGxldmVsSWQpO1xuICAgICAgICBpZihyZWNvdmVyYWJsZSkge1xuICAgICAgICAgIGxvZ2dlci53YXJuKGBsZXZlbCBjb250cm9sbGVyLCR7ZGV0YWlsc306IGVtZXJnZW5jeSBzd2l0Y2gtZG93biBmb3IgbmV4dCBmcmFnbWVudGApO1xuICAgICAgICAgIHRoaXMubGFzdGJ3ID0gMDtcbiAgICAgICAgICB0aGlzLmxhc3RmZXRjaGR1cmF0aW9uID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoYGNhbm5vdCByZWNvdmVyICR7ZGV0YWlsc30gZXJyb3JgKTtcbiAgICAgICAgICB0aGlzLl9sZXZlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAvLyBzdG9wcGluZyBsaXZlIHJlbG9hZGluZyB0aW1lciBpZiBhbnlcbiAgICAgICAgICBpZih0aGlzLnRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgICAgICAgICAvLyByZWRpc3BhdGNoIHNhbWUgZXJyb3IgYnV0IHdpdGggZmF0YWwgc2V0IHRvIHRydWVcbiAgICAgICAgICAgIGRhdGEuZmF0YWwgPSB0cnVlO1xuICAgICAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihldmVudCxkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvbkxldmVsTG9hZGVkKGV2ZW50LGRhdGEpIHtcbiAgICAvLyBjaGVjayBpZiBjdXJyZW50IHBsYXlsaXN0IGlzIGEgbGl2ZSBwbGF5bGlzdFxuICAgIGlmKGRhdGEuZGV0YWlscy5saXZlICYmICF0aGlzLnRpbWVyKSB7XG4gICAgICAvLyBpZiBsaXZlIHBsYXlsaXN0IHdlIHdpbGwgaGF2ZSB0byByZWxvYWQgaXQgcGVyaW9kaWNhbGx5XG4gICAgICAvLyBzZXQgcmVsb2FkIHBlcmlvZCB0byBwbGF5bGlzdCB0YXJnZXQgZHVyYXRpb25cbiAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCh0aGlzLm9udGljaywgMTAwMCpkYXRhLmRldGFpbHMudGFyZ2V0ZHVyYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHRpY2soKSB7XG4gICAgdmFyIGxldmVsSWQgPSB0aGlzLl9sZXZlbDtcbiAgICBpZihsZXZlbElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBsZXZlbCA9IHRoaXMuX2xldmVsc1tsZXZlbElkXSwgdXJsSWQgPSBsZXZlbC51cmxJZDtcbiAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuTEVWRUxfTE9BRElORywgeyB1cmw6IGxldmVsLnVybFt1cmxJZF0sIGxldmVsIDogbGV2ZWxJZCwgaWQgOiB1cmxJZCB9KTtcbiAgICB9XG4gIH1cblxuICBuZXh0TG9hZExldmVsKCkge1xuICAgIGlmKHRoaXMuX21hbnVhbExldmVsICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuX21hbnVhbExldmVsO1xuICAgIH0gZWxzZSB7XG4gICAgIHJldHVybiB0aGlzLm5leHRBdXRvTGV2ZWwoKTtcbiAgICB9XG4gIH1cblxuICBuZXh0QXV0b0xldmVsKCkge1xuICAgIHZhciBsYXN0YncgPSB0aGlzLmxhc3RidyxhZGp1c3RlZGJ3LGksbWF4QXV0b0xldmVsO1xuICAgIGlmKHRoaXMuX2F1dG9MZXZlbENhcHBpbmcgPT09IC0xKSB7XG4gICAgICBtYXhBdXRvTGV2ZWwgPSB0aGlzLl9sZXZlbHMubGVuZ3RoLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1heEF1dG9MZXZlbCA9IHRoaXMuX2F1dG9MZXZlbENhcHBpbmc7XG4gICAgfVxuICAgIC8vIGZvbGxvdyBhbGdvcml0aG0gY2FwdHVyZWQgZnJvbSBzdGFnZWZyaWdodCA6XG4gICAgLy8gaHR0cHM6Ly9hbmRyb2lkLmdvb2dsZXNvdXJjZS5jb20vcGxhdGZvcm0vZnJhbWV3b3Jrcy9hdi8rL21hc3Rlci9tZWRpYS9saWJzdGFnZWZyaWdodC9odHRwbGl2ZS9MaXZlU2Vzc2lvbi5jcHBcbiAgICAvLyBQaWNrIHRoZSBoaWdoZXN0IGJhbmR3aWR0aCBzdHJlYW0gYmVsb3cgb3IgZXF1YWwgdG8gZXN0aW1hdGVkIGJhbmR3aWR0aC5cbiAgICBmb3IoaSA9MDsgaSA8PSBtYXhBdXRvTGV2ZWwgOyBpKyspIHtcbiAgICAvLyBjb25zaWRlciBvbmx5IDgwJSBvZiB0aGUgYXZhaWxhYmxlIGJhbmR3aWR0aCwgYnV0IGlmIHdlIGFyZSBzd2l0Y2hpbmcgdXAsXG4gICAgLy8gYmUgZXZlbiBtb3JlIGNvbnNlcnZhdGl2ZSAoNzAlKSB0byBhdm9pZCBvdmVyZXN0aW1hdGluZyBhbmQgaW1tZWRpYXRlbHlcbiAgICAvLyBzd2l0Y2hpbmcgYmFjay5cbiAgICAgIGlmKGkgPD0gdGhpcy5fbGV2ZWwpIHtcbiAgICAgICAgYWRqdXN0ZWRidyA9IDAuOCpsYXN0Ync7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGp1c3RlZGJ3ID0gMC43Kmxhc3RidztcbiAgICAgIH1cbiAgICAgIGlmKGFkanVzdGVkYncgPCB0aGlzLl9sZXZlbHNbaV0uYml0cmF0ZSkge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCxpLTEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaS0xO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExldmVsQ29udHJvbGxlcjtcbiIsIiBpbXBvcnQgRXZlbnQgICAgICAgICAgICAgICAgZnJvbSAnLi4vZXZlbnRzJztcbiBpbXBvcnQgVFNEZW11eGVyICAgICAgICAgICAgZnJvbSAnLi90c2RlbXV4ZXInO1xuIGltcG9ydCBUU0RlbXV4ZXJXb3JrZXIgICAgICBmcm9tICcuL3RzZGVtdXhlcndvcmtlcic7XG4gaW1wb3J0IG9ic2VydmVyICAgICAgICAgICAgIGZyb20gJy4uL29ic2VydmVyJztcbiBpbXBvcnQge2xvZ2dlcn0gICAgICAgICAgICAgZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuXG5jbGFzcyBEZW11eGVyIHtcblxuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBpZihjb25maWcuZW5hYmxlV29ya2VyICYmICh0eXBlb2YoV29ya2VyKSAhPT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgIGxvZ2dlci5sb2coJ1RTIGRlbXV4aW5nIGluIHdlYndvcmtlcicpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciB3b3JrID0gcmVxdWlyZSgnd2Vid29ya2lmeScpO1xuICAgICAgICAgIHRoaXMudyA9IHdvcmsoVFNEZW11eGVyV29ya2VyKTtcbiAgICAgICAgICB0aGlzLm9ud21zZyA9IHRoaXMub25Xb3JrZXJNZXNzYWdlLmJpbmQodGhpcyk7XG4gICAgICAgICAgdGhpcy53LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm9ud21zZyk7XG4gICAgICAgICAgdGhpcy53LnBvc3RNZXNzYWdlKHsgY21kIDogJ2luaXQnfSk7XG4gICAgICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdlcnJvciB3aGlsZSBpbml0aWFsaXppbmcgVFNEZW11eGVyV29ya2VyLCBmYWxsYmFjayBvbiByZWd1bGFyIFRTRGVtdXhlcicpO1xuICAgICAgICAgIHRoaXMuZGVtdXhlciA9IG5ldyBUU0RlbXV4ZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZW11eGVyID0gbmV3IFRTRGVtdXhlcigpO1xuICAgICAgfVxuICAgICAgdGhpcy5kZW11eEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYodGhpcy53KSB7XG4gICAgICB0aGlzLncucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsdGhpcy5vbndtc2cpO1xuICAgICAgdGhpcy53LnRlcm1pbmF0ZSgpO1xuICAgICAgdGhpcy53ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZW11eGVyLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBwdXNoKGRhdGEsIGF1ZGlvQ29kZWMsIHZpZGVvQ29kZWMsIHRpbWVPZmZzZXQsIGNjLCBsZXZlbCwgZHVyYXRpb24pIHtcbiAgICBpZih0aGlzLncpIHtcbiAgICAgIC8vIHBvc3QgZnJhZ21lbnQgcGF5bG9hZCBhcyB0cmFuc2ZlcmFibGUgb2JqZWN0cyAobm8gY29weSlcbiAgICAgIHRoaXMudy5wb3N0TWVzc2FnZSh7IGNtZCA6ICdkZW11eCcgLCBkYXRhIDogZGF0YSwgYXVkaW9Db2RlYyA6IGF1ZGlvQ29kZWMsIHZpZGVvQ29kZWM6IHZpZGVvQ29kZWMsIHRpbWVPZmZzZXQgOiB0aW1lT2Zmc2V0LCBjYzogY2MsIGxldmVsIDogbGV2ZWwsIGR1cmF0aW9uIDogZHVyYXRpb259LFtkYXRhXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVtdXhlci5wdXNoKG5ldyBVaW50OEFycmF5KGRhdGEpLCBhdWRpb0NvZGVjLCB2aWRlb0NvZGVjLCB0aW1lT2Zmc2V0LCBjYywgbGV2ZWwsIGR1cmF0aW9uKTtcbiAgICAgIHRoaXMuZGVtdXhlci5lbmQoKTtcbiAgICB9XG4gIH1cblxuICBvbldvcmtlck1lc3NhZ2UoZXYpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdvbldvcmtlck1lc3NhZ2U6JyArIGV2LmRhdGEuZXZlbnQpO1xuICAgIHN3aXRjaChldi5kYXRhLmV2ZW50KSB7XG4gICAgICBjYXNlIEV2ZW50LkZSQUdfUEFSU0lOR19JTklUX1NFR01FTlQ6XG4gICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgaWYoZXYuZGF0YS5hdWRpb01vb3YpIHtcbiAgICAgICAgICBvYmouYXVkaW9Nb292ID0gbmV3IFVpbnQ4QXJyYXkoZXYuZGF0YS5hdWRpb01vb3YpO1xuICAgICAgICAgIG9iai5hdWRpb0NvZGVjID0gZXYuZGF0YS5hdWRpb0NvZGVjO1xuICAgICAgICAgIG9iai5hdWRpb0NoYW5uZWxDb3VudCA9IGV2LmRhdGEuYXVkaW9DaGFubmVsQ291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYoZXYuZGF0YS52aWRlb01vb3YpIHtcbiAgICAgICAgICBvYmoudmlkZW9Nb292ID0gbmV3IFVpbnQ4QXJyYXkoZXYuZGF0YS52aWRlb01vb3YpO1xuICAgICAgICAgIG9iai52aWRlb0NvZGVjID0gZXYuZGF0YS52aWRlb0NvZGVjO1xuICAgICAgICAgIG9iai52aWRlb1dpZHRoID0gZXYuZGF0YS52aWRlb1dpZHRoO1xuICAgICAgICAgIG9iai52aWRlb0hlaWdodCA9IGV2LmRhdGEudmlkZW9IZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX1BBUlNJTkdfSU5JVF9TRUdNRU5ULCBvYmopO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRXZlbnQuRlJBR19QQVJTSU5HX0RBVEE6XG4gICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRlJBR19QQVJTSU5HX0RBVEEse1xuICAgICAgICAgIG1vb2YgOiBuZXcgVWludDhBcnJheShldi5kYXRhLm1vb2YpLFxuICAgICAgICAgIG1kYXQgOiBuZXcgVWludDhBcnJheShldi5kYXRhLm1kYXQpLFxuICAgICAgICAgIHN0YXJ0UFRTIDogZXYuZGF0YS5zdGFydFBUUyxcbiAgICAgICAgICBlbmRQVFMgOiBldi5kYXRhLmVuZFBUUyxcbiAgICAgICAgICBzdGFydERUUyA6IGV2LmRhdGEuc3RhcnREVFMsXG4gICAgICAgICAgZW5kRFRTIDogZXYuZGF0YS5lbmREVFMsXG4gICAgICAgICAgdHlwZSA6IGV2LmRhdGEudHlwZSxcbiAgICAgICAgICBuYiA6IGV2LmRhdGEubmJcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihldi5kYXRhLmV2ZW50LGV2LmRhdGEuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgRGVtdXhlcjtcbiIsIi8qKlxuICogUGFyc2VyIGZvciBleHBvbmVudGlhbCBHb2xvbWIgY29kZXMsIGEgdmFyaWFibGUtYml0d2lkdGggbnVtYmVyIGVuY29kaW5nXG4gKiBzY2hlbWUgdXNlZCBieSBoMjY0LlxuICovXG5cbmltcG9ydCB7bG9nZ2VyfSAgICAgICAgZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuY2xhc3MgRXhwR29sb21iIHtcblxuICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAvLyB0aGUgbnVtYmVyIG9mIGJ5dGVzIGxlZnQgdG8gZXhhbWluZSBpbiB0aGlzLmRhdGFcbiAgICB0aGlzLmJ5dGVzQXZhaWxhYmxlID0gdGhpcy5kYXRhLmJ5dGVMZW5ndGg7XG4gICAgLy8gdGhlIGN1cnJlbnQgd29yZCBiZWluZyBleGFtaW5lZFxuICAgIHRoaXMud29yZCA9IDA7IC8vIDp1aW50XG4gICAgLy8gdGhlIG51bWJlciBvZiBiaXRzIGxlZnQgdG8gZXhhbWluZSBpbiB0aGUgY3VycmVudCB3b3JkXG4gICAgdGhpcy5iaXRzQXZhaWxhYmxlID0gMDsgLy8gOnVpbnRcbiAgfVxuXG4gIC8vICgpOnZvaWRcbiAgbG9hZFdvcmQoKSB7XG4gICAgdmFyXG4gICAgICBwb3NpdGlvbiA9IHRoaXMuZGF0YS5ieXRlTGVuZ3RoIC0gdGhpcy5ieXRlc0F2YWlsYWJsZSxcbiAgICAgIHdvcmtpbmdCeXRlcyA9IG5ldyBVaW50OEFycmF5KDQpLFxuICAgICAgYXZhaWxhYmxlQnl0ZXMgPSBNYXRoLm1pbig0LCB0aGlzLmJ5dGVzQXZhaWxhYmxlKTtcblxuICAgIGlmIChhdmFpbGFibGVCeXRlcyA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyBieXRlcyBhdmFpbGFibGUnKTtcbiAgICB9XG5cbiAgICB3b3JraW5nQnl0ZXMuc2V0KHRoaXMuZGF0YS5zdWJhcnJheShwb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICsgYXZhaWxhYmxlQnl0ZXMpKTtcbiAgICB0aGlzLndvcmQgPSBuZXcgRGF0YVZpZXcod29ya2luZ0J5dGVzLmJ1ZmZlcikuZ2V0VWludDMyKDApO1xuXG4gICAgLy8gdHJhY2sgdGhlIGFtb3VudCBvZiB0aGlzLmRhdGEgdGhhdCBoYXMgYmVlbiBwcm9jZXNzZWRcbiAgICB0aGlzLmJpdHNBdmFpbGFibGUgPSBhdmFpbGFibGVCeXRlcyAqIDg7XG4gICAgdGhpcy5ieXRlc0F2YWlsYWJsZSAtPSBhdmFpbGFibGVCeXRlcztcbiAgfVxuXG4gIC8vIChjb3VudDppbnQpOnZvaWRcbiAgc2tpcEJpdHMoY291bnQpIHtcbiAgICB2YXIgc2tpcEJ5dGVzOyAvLyA6aW50XG4gICAgaWYgKHRoaXMuYml0c0F2YWlsYWJsZSA+IGNvdW50KSB7XG4gICAgICB0aGlzLndvcmQgICAgICAgICAgPDw9IGNvdW50O1xuICAgICAgdGhpcy5iaXRzQXZhaWxhYmxlIC09IGNvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCAtPSB0aGlzLmJpdHNBdmFpbGFibGU7XG4gICAgICBza2lwQnl0ZXMgPSBjb3VudCA+PiAzO1xuXG4gICAgICBjb3VudCAtPSAoc2tpcEJ5dGVzID4+IDMpO1xuICAgICAgdGhpcy5ieXRlc0F2YWlsYWJsZSAtPSBza2lwQnl0ZXM7XG5cbiAgICAgIHRoaXMubG9hZFdvcmQoKTtcblxuICAgICAgdGhpcy53b3JkIDw8PSBjb3VudDtcbiAgICAgIHRoaXMuYml0c0F2YWlsYWJsZSAtPSBjb3VudDtcbiAgICB9XG4gIH1cblxuICAvLyAoc2l6ZTppbnQpOnVpbnRcbiAgcmVhZEJpdHMoc2l6ZSkge1xuICAgIHZhclxuICAgICAgYml0cyA9IE1hdGgubWluKHRoaXMuYml0c0F2YWlsYWJsZSwgc2l6ZSksIC8vIDp1aW50XG4gICAgICB2YWx1ID0gdGhpcy53b3JkID4+PiAoMzIgLSBiaXRzKTsgLy8gOnVpbnRcblxuICAgIGlmKHNpemUgPjMyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Nhbm5vdCByZWFkIG1vcmUgdGhhbiAzMiBiaXRzIGF0IGEgdGltZScpO1xuICAgIH1cblxuICAgIHRoaXMuYml0c0F2YWlsYWJsZSAtPSBiaXRzO1xuICAgIGlmICh0aGlzLmJpdHNBdmFpbGFibGUgPiAwKSB7XG4gICAgICB0aGlzLndvcmQgPDw9IGJpdHM7XG4gICAgfSBlbHNlIGlmICh0aGlzLmJ5dGVzQXZhaWxhYmxlID4gMCkge1xuICAgICAgdGhpcy5sb2FkV29yZCgpO1xuICAgIH1cblxuICAgIGJpdHMgPSBzaXplIC0gYml0cztcbiAgICBpZiAoYml0cyA+IDApIHtcbiAgICAgIHJldHVybiB2YWx1IDw8IGJpdHMgfCB0aGlzLnJlYWRCaXRzKGJpdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdTtcbiAgICB9XG4gIH1cblxuICAvLyAoKTp1aW50XG4gIHNraXBMWigpIHtcbiAgICB2YXIgbGVhZGluZ1plcm9Db3VudDsgLy8gOnVpbnRcbiAgICBmb3IgKGxlYWRpbmdaZXJvQ291bnQgPSAwIDsgbGVhZGluZ1plcm9Db3VudCA8IHRoaXMuYml0c0F2YWlsYWJsZSA7ICsrbGVhZGluZ1plcm9Db3VudCkge1xuICAgICAgaWYgKDAgIT09ICh0aGlzLndvcmQgJiAoMHg4MDAwMDAwMCA+Pj4gbGVhZGluZ1plcm9Db3VudCkpKSB7XG4gICAgICAgIC8vIHRoZSBmaXJzdCBiaXQgb2Ygd29ya2luZyB3b3JkIGlzIDFcbiAgICAgICAgdGhpcy53b3JkIDw8PSBsZWFkaW5nWmVyb0NvdW50O1xuICAgICAgICB0aGlzLmJpdHNBdmFpbGFibGUgLT0gbGVhZGluZ1plcm9Db3VudDtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdaZXJvQ291bnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UgZXhoYXVzdGVkIHdvcmQgYW5kIHN0aWxsIGhhdmUgbm90IGZvdW5kIGEgMVxuICAgIHRoaXMubG9hZFdvcmQoKTtcbiAgICByZXR1cm4gbGVhZGluZ1plcm9Db3VudCArIHRoaXMuc2tpcExaKCk7XG4gIH1cblxuICAvLyAoKTp2b2lkXG4gIHNraXBVRUcoKSB7XG4gICAgdGhpcy5za2lwQml0cygxICsgdGhpcy5za2lwTFooKSk7XG4gIH1cblxuICAvLyAoKTp2b2lkXG4gIHNraXBFRygpIHtcbiAgICB0aGlzLnNraXBCaXRzKDEgKyB0aGlzLnNraXBMWigpKTtcbiAgfVxuXG4gIC8vICgpOnVpbnRcbiAgcmVhZFVFRygpIHtcbiAgICB2YXIgY2x6ID0gdGhpcy5za2lwTFooKTsgLy8gOnVpbnRcbiAgICByZXR1cm4gdGhpcy5yZWFkQml0cyhjbHogKyAxKSAtIDE7XG4gIH1cblxuICAvLyAoKTppbnRcbiAgcmVhZEVHKCkge1xuICAgIHZhciB2YWx1ID0gdGhpcy5yZWFkVUVHKCk7IC8vIDppbnRcbiAgICBpZiAoMHgwMSAmIHZhbHUpIHtcbiAgICAgIC8vIHRoZSBudW1iZXIgaXMgb2RkIGlmIHRoZSBsb3cgb3JkZXIgYml0IGlzIHNldFxuICAgICAgcmV0dXJuICgxICsgdmFsdSkgPj4+IDE7IC8vIGFkZCAxIHRvIG1ha2UgaXQgZXZlbiwgYW5kIGRpdmlkZSBieSAyXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAtMSAqICh2YWx1ID4+PiAxKTsgLy8gZGl2aWRlIGJ5IHR3byB0aGVuIG1ha2UgaXQgbmVnYXRpdmVcbiAgICB9XG4gIH1cblxuICAvLyBTb21lIGNvbnZlbmllbmNlIGZ1bmN0aW9uc1xuICAvLyA6Qm9vbGVhblxuICByZWFkQm9vbGVhbigpIHtcbiAgICByZXR1cm4gMSA9PT0gdGhpcy5yZWFkQml0cygxKTtcbiAgfVxuXG4gIC8vICgpOmludFxuICByZWFkVUJ5dGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZEJpdHMoOCk7XG4gIH1cblxuICAvKipcbiAgICogQWR2YW5jZSB0aGUgRXhwR29sb21iIGRlY29kZXIgcGFzdCBhIHNjYWxpbmcgbGlzdC4gVGhlIHNjYWxpbmdcbiAgICogbGlzdCBpcyBvcHRpb25hbGx5IHRyYW5zbWl0dGVkIGFzIHBhcnQgb2YgYSBzZXF1ZW5jZSBwYXJhbWV0ZXJcbiAgICogc2V0IGFuZCBpcyBub3QgcmVsZXZhbnQgdG8gdHJhbnNtdXhpbmcuXG4gICAqIEBwYXJhbSBjb3VudCB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhpcyBzY2FsaW5nIGxpc3RcbiAgICogQHNlZSBSZWNvbW1lbmRhdGlvbiBJVFUtVCBILjI2NCwgU2VjdGlvbiA3LjMuMi4xLjEuMVxuICAgKi9cbiAgc2tpcFNjYWxpbmdMaXN0KGNvdW50KSB7XG4gICAgdmFyXG4gICAgICBsYXN0U2NhbGUgPSA4LFxuICAgICAgbmV4dFNjYWxlID0gOCxcbiAgICAgIGosXG4gICAgICBkZWx0YVNjYWxlO1xuXG4gICAgZm9yIChqID0gMDsgaiA8IGNvdW50OyBqKyspIHtcbiAgICAgIGlmIChuZXh0U2NhbGUgIT09IDApIHtcbiAgICAgICAgZGVsdGFTY2FsZSA9IHRoaXMucmVhZEVHKCk7XG4gICAgICAgIG5leHRTY2FsZSA9IChsYXN0U2NhbGUgKyBkZWx0YVNjYWxlICsgMjU2KSAlIDI1NjtcbiAgICAgIH1cblxuICAgICAgbGFzdFNjYWxlID0gKG5leHRTY2FsZSA9PT0gMCkgPyBsYXN0U2NhbGUgOiBuZXh0U2NhbGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgYSBzZXF1ZW5jZSBwYXJhbWV0ZXIgc2V0IGFuZCByZXR1cm4gc29tZSBpbnRlcmVzdGluZyB2aWRlb1xuICAgKiBwcm9wZXJ0aWVzLiBBIHNlcXVlbmNlIHBhcmFtZXRlciBzZXQgaXMgdGhlIEgyNjQgbWV0YWRhdGEgdGhhdFxuICAgKiBkZXNjcmliZXMgdGhlIHByb3BlcnRpZXMgb2YgdXBjb21pbmcgdmlkZW8gZnJhbWVzLlxuICAgKiBAcGFyYW0gZGF0YSB7VWludDhBcnJheX0gdGhlIGJ5dGVzIG9mIGEgc2VxdWVuY2UgcGFyYW1ldGVyIHNldFxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGFuIG9iamVjdCB3aXRoIGNvbmZpZ3VyYXRpb24gcGFyc2VkIGZyb20gdGhlXG4gICAqIHNlcXVlbmNlIHBhcmFtZXRlciBzZXQsIGluY2x1ZGluZyB0aGUgZGltZW5zaW9ucyBvZiB0aGVcbiAgICogYXNzb2NpYXRlZCB2aWRlbyBmcmFtZXMuXG4gICAqL1xuICByZWFkU1BTKCkge1xuICAgIHZhclxuICAgICAgZnJhbWVDcm9wTGVmdE9mZnNldCA9IDAsXG4gICAgICBmcmFtZUNyb3BSaWdodE9mZnNldCA9IDAsXG4gICAgICBmcmFtZUNyb3BUb3BPZmZzZXQgPSAwLFxuICAgICAgZnJhbWVDcm9wQm90dG9tT2Zmc2V0ID0gMCxcbiAgICAgIHByb2ZpbGVJZGMscHJvZmlsZUNvbXBhdCxsZXZlbElkYyxcbiAgICAgIG51bVJlZkZyYW1lc0luUGljT3JkZXJDbnRDeWNsZSwgcGljV2lkdGhJbk1ic01pbnVzMSxcbiAgICAgIHBpY0hlaWdodEluTWFwVW5pdHNNaW51czEsXG4gICAgICBmcmFtZU1ic09ubHlGbGFnLFxuICAgICAgc2NhbGluZ0xpc3RDb3VudCxcbiAgICAgIGk7XG5cbiAgICB0aGlzLnJlYWRVQnl0ZSgpO1xuICAgIHByb2ZpbGVJZGMgPSB0aGlzLnJlYWRVQnl0ZSgpOyAvLyBwcm9maWxlX2lkY1xuICAgIHByb2ZpbGVDb21wYXQgPSB0aGlzLnJlYWRCaXRzKDUpOyAvLyBjb25zdHJhaW50X3NldFswLTRdX2ZsYWcsIHUoNSlcbiAgICB0aGlzLnNraXBCaXRzKDMpOyAvLyByZXNlcnZlZF96ZXJvXzNiaXRzIHUoMyksXG4gICAgbGV2ZWxJZGMgPSB0aGlzLnJlYWRVQnl0ZSgpOyAvL2xldmVsX2lkYyB1KDgpXG4gICAgdGhpcy5za2lwVUVHKCk7IC8vIHNlcV9wYXJhbWV0ZXJfc2V0X2lkXG5cbiAgICAvLyBzb21lIHByb2ZpbGVzIGhhdmUgbW9yZSBvcHRpb25hbCBkYXRhIHdlIGRvbid0IG5lZWRcbiAgICBpZiAocHJvZmlsZUlkYyA9PT0gMTAwIHx8XG4gICAgICAgIHByb2ZpbGVJZGMgPT09IDExMCB8fFxuICAgICAgICBwcm9maWxlSWRjID09PSAxMjIgfHxcbiAgICAgICAgcHJvZmlsZUlkYyA9PT0gMTQ0KSB7XG4gICAgICB2YXIgY2hyb21hRm9ybWF0SWRjID0gdGhpcy5yZWFkVUVHKCk7XG4gICAgICBpZiAoY2hyb21hRm9ybWF0SWRjID09PSAzKSB7XG4gICAgICAgIHRoaXMuc2tpcEJpdHMoMSk7IC8vIHNlcGFyYXRlX2NvbG91cl9wbGFuZV9mbGFnXG4gICAgICB9XG4gICAgICB0aGlzLnNraXBVRUcoKTsgLy8gYml0X2RlcHRoX2x1bWFfbWludXM4XG4gICAgICB0aGlzLnNraXBVRUcoKTsgLy8gYml0X2RlcHRoX2Nocm9tYV9taW51czhcbiAgICAgIHRoaXMuc2tpcEJpdHMoMSk7IC8vIHFwcHJpbWVfeV96ZXJvX3RyYW5zZm9ybV9ieXBhc3NfZmxhZ1xuICAgICAgaWYgKHRoaXMucmVhZEJvb2xlYW4oKSkgeyAvLyBzZXFfc2NhbGluZ19tYXRyaXhfcHJlc2VudF9mbGFnXG4gICAgICAgIHNjYWxpbmdMaXN0Q291bnQgPSAoY2hyb21hRm9ybWF0SWRjICE9PSAzKSA/IDggOiAxMjtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNjYWxpbmdMaXN0Q291bnQ7IGkrKykge1xuICAgICAgICAgIGlmICh0aGlzLnJlYWRCb29sZWFuKCkpIHsgLy8gc2VxX3NjYWxpbmdfbGlzdF9wcmVzZW50X2ZsYWdbIGkgXVxuICAgICAgICAgICAgaWYgKGkgPCA2KSB7XG4gICAgICAgICAgICAgIHRoaXMuc2tpcFNjYWxpbmdMaXN0KDE2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuc2tpcFNjYWxpbmdMaXN0KDY0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNraXBVRUcoKTsgLy8gbG9nMl9tYXhfZnJhbWVfbnVtX21pbnVzNFxuICAgIHZhciBwaWNPcmRlckNudFR5cGUgPSB0aGlzLnJlYWRVRUcoKTtcblxuICAgIGlmIChwaWNPcmRlckNudFR5cGUgPT09IDApIHtcbiAgICAgIHRoaXMucmVhZFVFRygpOyAvL2xvZzJfbWF4X3BpY19vcmRlcl9jbnRfbHNiX21pbnVzNFxuICAgIH0gZWxzZSBpZiAocGljT3JkZXJDbnRUeXBlID09PSAxKSB7XG4gICAgICB0aGlzLnNraXBCaXRzKDEpOyAvLyBkZWx0YV9waWNfb3JkZXJfYWx3YXlzX3plcm9fZmxhZ1xuICAgICAgdGhpcy5za2lwRUcoKTsgLy8gb2Zmc2V0X2Zvcl9ub25fcmVmX3BpY1xuICAgICAgdGhpcy5za2lwRUcoKTsgLy8gb2Zmc2V0X2Zvcl90b3BfdG9fYm90dG9tX2ZpZWxkXG4gICAgICBudW1SZWZGcmFtZXNJblBpY09yZGVyQ250Q3ljbGUgPSB0aGlzLnJlYWRVRUcoKTtcbiAgICAgIGZvcihpID0gMDsgaSA8IG51bVJlZkZyYW1lc0luUGljT3JkZXJDbnRDeWNsZTsgaSsrKSB7XG4gICAgICAgIHRoaXMuc2tpcEVHKCk7IC8vIG9mZnNldF9mb3JfcmVmX2ZyYW1lWyBpIF1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNraXBVRUcoKTsgLy8gbWF4X251bV9yZWZfZnJhbWVzXG4gICAgdGhpcy5za2lwQml0cygxKTsgLy8gZ2Fwc19pbl9mcmFtZV9udW1fdmFsdWVfYWxsb3dlZF9mbGFnXG5cbiAgICBwaWNXaWR0aEluTWJzTWludXMxID0gdGhpcy5yZWFkVUVHKCk7XG4gICAgcGljSGVpZ2h0SW5NYXBVbml0c01pbnVzMSA9IHRoaXMucmVhZFVFRygpO1xuXG4gICAgZnJhbWVNYnNPbmx5RmxhZyA9IHRoaXMucmVhZEJpdHMoMSk7XG4gICAgaWYgKGZyYW1lTWJzT25seUZsYWcgPT09IDApIHtcbiAgICAgIHRoaXMuc2tpcEJpdHMoMSk7IC8vIG1iX2FkYXB0aXZlX2ZyYW1lX2ZpZWxkX2ZsYWdcbiAgICB9XG5cbiAgICB0aGlzLnNraXBCaXRzKDEpOyAvLyBkaXJlY3RfOHg4X2luZmVyZW5jZV9mbGFnXG4gICAgaWYgKHRoaXMucmVhZEJvb2xlYW4oKSkgeyAvLyBmcmFtZV9jcm9wcGluZ19mbGFnXG4gICAgICBmcmFtZUNyb3BMZWZ0T2Zmc2V0ID0gdGhpcy5yZWFkVUVHKCk7XG4gICAgICBmcmFtZUNyb3BSaWdodE9mZnNldCA9IHRoaXMucmVhZFVFRygpO1xuICAgICAgZnJhbWVDcm9wVG9wT2Zmc2V0ID0gdGhpcy5yZWFkVUVHKCk7XG4gICAgICBmcmFtZUNyb3BCb3R0b21PZmZzZXQgPSB0aGlzLnJlYWRVRUcoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJvZmlsZUlkYyA6IHByb2ZpbGVJZGMsXG4gICAgICBwcm9maWxlQ29tcGF0IDogcHJvZmlsZUNvbXBhdCxcbiAgICAgIGxldmVsSWRjIDogbGV2ZWxJZGMsXG4gICAgICB3aWR0aDogKChwaWNXaWR0aEluTWJzTWludXMxICsgMSkgKiAxNikgLSBmcmFtZUNyb3BMZWZ0T2Zmc2V0ICogMiAtIGZyYW1lQ3JvcFJpZ2h0T2Zmc2V0ICogMixcbiAgICAgIGhlaWdodDogKCgyIC0gZnJhbWVNYnNPbmx5RmxhZykgKiAocGljSGVpZ2h0SW5NYXBVbml0c01pbnVzMSArIDEpICogMTYpIC0gKGZyYW1lQ3JvcFRvcE9mZnNldCAqIDIpIC0gKGZyYW1lQ3JvcEJvdHRvbU9mZnNldCAqIDIpXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFeHBHb2xvbWI7XG4iLCIvKipcbiAqIEEgc3RyZWFtLWJhc2VkIG1wMnRzIHRvIG1wNCBjb252ZXJ0ZXIuIFRoaXMgdXRpbGl0eSBpcyB1c2VkIHRvXG4gKiBkZWxpdmVyIG1wNHMgdG8gYSBTb3VyY2VCdWZmZXIgb24gcGxhdGZvcm1zIHRoYXQgc3VwcG9ydCBuYXRpdmVcbiAqIE1lZGlhIFNvdXJjZSBFeHRlbnNpb25zLlxuICovXG5cbiBpbXBvcnQgRXZlbnQgICAgICAgICAgIGZyb20gJy4uL2V2ZW50cyc7XG4gaW1wb3J0IEV4cEdvbG9tYiAgICAgICBmcm9tICcuL2V4cC1nb2xvbWInO1xuLy8gaW1wb3J0IEhleCAgICAgICAgICAgICBmcm9tICcuLi91dGlscy9oZXgnO1xuIGltcG9ydCBNUDQgICAgICAgICAgICAgZnJvbSAnLi4vcmVtdXgvbXA0LWdlbmVyYXRvcic7XG4gaW1wb3J0IG9ic2VydmVyICAgICAgICBmcm9tICcuLi9vYnNlcnZlcic7XG4gaW1wb3J0IHtsb2dnZXJ9ICAgICAgICBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuIGltcG9ydCB7RXJyb3JUeXBlcyxFcnJvckRldGFpbHN9IGZyb20gJy4uL2Vycm9ycyc7XG5cbiBjbGFzcyBUU0RlbXV4ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubGFzdENDID0gMDtcbiAgICB0aGlzLlBFU19USU1FU0NBTEU9OTAwMDA7XG4gICAgdGhpcy5QRVMyTVA0U0NBTEVGQUNUT1I9NDtcbiAgICB0aGlzLk1QNF9USU1FU0NBTEU9dGhpcy5QRVNfVElNRVNDQUxFL3RoaXMuUEVTMk1QNFNDQUxFRkFDVE9SO1xuICB9XG5cbiAgc3dpdGNoTGV2ZWwoKSB7XG4gICAgdGhpcy5wbXRQYXJzZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9wbXRJZCA9IHRoaXMuX2F2Y0lkID0gdGhpcy5fYWFjSWQgPSAtMTtcbiAgICB0aGlzLl9hdmNUcmFjayA9IHt0eXBlIDogJ3ZpZGVvJywgc2VxdWVuY2VOdW1iZXIgOiAwfTtcbiAgICB0aGlzLl9hYWNUcmFjayA9IHt0eXBlIDogJ2F1ZGlvJywgc2VxdWVuY2VOdW1iZXIgOiAwfTtcbiAgICB0aGlzLl9hdmNTYW1wbGVzID0gW107XG4gICAgdGhpcy5fYXZjU2FtcGxlc0xlbmd0aCA9IDA7XG4gICAgdGhpcy5fYXZjU2FtcGxlc05iTmFsdSA9IDA7XG4gICAgdGhpcy5fYWFjU2FtcGxlcyA9IFtdO1xuICAgIHRoaXMuX2FhY1NhbXBsZXNMZW5ndGggPSAwO1xuICAgIHRoaXMuX2luaXRTZWdHZW5lcmF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGluc2VydERpc2NvbnRpbnVpdHkoKSB7XG4gICAgdGhpcy5zd2l0Y2hMZXZlbCgpO1xuICAgIHRoaXMuX2luaXRQVFMgPSB0aGlzLl9pbml0RFRTID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gZmVlZCBpbmNvbWluZyBkYXRhIHRvIHRoZSBmcm9udCBvZiB0aGUgcGFyc2luZyBwaXBlbGluZVxuICBwdXNoKGRhdGEsYXVkaW9Db2RlYywgdmlkZW9Db2RlYyx0aW1lT2Zmc2V0LGNjLGxldmVsLGR1cmF0aW9uKSB7XG4gICAgdmFyIGF2Y0RhdGEsYWFjRGF0YSxzdGFydCxsZW4gPSBkYXRhLmxlbmd0aCxzdHQscGlkLGF0ZixvZmZzZXQ7XG4gICAgdGhpcy5hdWRpb0NvZGVjID0gYXVkaW9Db2RlYztcbiAgICB0aGlzLnZpZGVvQ29kZWMgPSB2aWRlb0NvZGVjO1xuICAgIHRoaXMudGltZU9mZnNldCA9IHRpbWVPZmZzZXQ7XG4gICAgdGhpcy5fZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICBpZihjYyAhPT0gdGhpcy5sYXN0Q0MpIHtcbiAgICAgIGxvZ2dlci5sb2coYGRpc2NvbnRpbnVpdHkgZGV0ZWN0ZWRgKTtcbiAgICAgIHRoaXMuaW5zZXJ0RGlzY29udGludWl0eSgpO1xuICAgICAgdGhpcy5sYXN0Q0MgPSBjYztcbiAgICB9IGVsc2UgaWYobGV2ZWwgIT09IHRoaXMubGFzdExldmVsKSB7XG4gICAgICBsb2dnZXIubG9nKGBsZXZlbCBzd2l0Y2ggZGV0ZWN0ZWRgKTtcbiAgICAgIHRoaXMuc3dpdGNoTGV2ZWwoKTtcbiAgICAgIHRoaXMubGFzdExldmVsID0gbGV2ZWw7XG4gICAgfVxuICAgIHZhciBwbXRQYXJzZWQ9dGhpcy5wbXRQYXJzZWQsYXZjSWQ9dGhpcy5fYXZjSWQsYWFjSWQ9dGhpcy5fYWFjSWQ7XG5cbiAgICAvLyBsb29wIHRocm91Z2ggVFMgcGFja2V0c1xuICAgIGZvcihzdGFydCA9IDA7IHN0YXJ0IDwgbGVuIDsgc3RhcnQgKz0gMTg4KSB7XG4gICAgICBpZihkYXRhW3N0YXJ0XSA9PT0gMHg0Nykge1xuICAgICAgICBzdHQgPSAhIShkYXRhW3N0YXJ0KzFdICYgMHg0MCk7XG4gICAgICAgIC8vIHBpZCBpcyBhIDEzLWJpdCBmaWVsZCBzdGFydGluZyBhdCB0aGUgbGFzdCBiaXQgb2YgVFNbMV1cbiAgICAgICAgcGlkID0gKChkYXRhW3N0YXJ0KzFdICYgMHgxZikgPDwgOCkgKyBkYXRhW3N0YXJ0KzJdO1xuICAgICAgICBhdGYgPSAoZGF0YVtzdGFydCszXSAmIDB4MzApID4+IDQ7XG4gICAgICAgIC8vIGlmIGFuIGFkYXB0aW9uIGZpZWxkIGlzIHByZXNlbnQsIGl0cyBsZW5ndGggaXMgc3BlY2lmaWVkIGJ5IHRoZSBmaWZ0aCBieXRlIG9mIHRoZSBUUyBwYWNrZXQgaGVhZGVyLlxuICAgICAgICBpZihhdGYgPiAxKSB7XG4gICAgICAgICAgb2Zmc2V0ID0gc3RhcnQrNStkYXRhW3N0YXJ0KzRdO1xuICAgICAgICAgIC8vIGNvbnRpbnVlIGlmIHRoZXJlIGlzIG9ubHkgYWRhcHRhdGlvbiBmaWVsZFxuICAgICAgICAgIGlmKG9mZnNldCA9PT0gKHN0YXJ0KzE4OCkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmZzZXQgPSBzdGFydCs0O1xuICAgICAgICB9XG4gICAgICAgIGlmKHBtdFBhcnNlZCkge1xuICAgICAgICAgIGlmKHBpZCA9PT0gYXZjSWQpIHtcbiAgICAgICAgICAgIGlmKHN0dCkge1xuICAgICAgICAgICAgICBpZihhdmNEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyc2VBVkNQRVModGhpcy5fcGFyc2VQRVMoYXZjRGF0YSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGF2Y0RhdGEgPSB7ZGF0YTogW10sc2l6ZTogMH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihhdmNEYXRhKSB7XG4gICAgICAgICAgICAgIGF2Y0RhdGEuZGF0YS5wdXNoKGRhdGEuc3ViYXJyYXkob2Zmc2V0LHN0YXJ0KzE4OCkpO1xuICAgICAgICAgICAgICBhdmNEYXRhLnNpemUrPXN0YXJ0KzE4OC1vZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmKHBpZCA9PT0gYWFjSWQpIHtcbiAgICAgICAgICAgIGlmKHN0dCkge1xuICAgICAgICAgICAgICBpZihhYWNEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyc2VBQUNQRVModGhpcy5fcGFyc2VQRVMoYWFjRGF0YSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFhY0RhdGEgPSB7ZGF0YTogW10sc2l6ZTogMH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihhYWNEYXRhKSB7XG4gICAgICAgICAgICAgIGFhY0RhdGEuZGF0YS5wdXNoKGRhdGEuc3ViYXJyYXkob2Zmc2V0LHN0YXJ0KzE4OCkpO1xuICAgICAgICAgICAgICBhYWNEYXRhLnNpemUrPXN0YXJ0KzE4OC1vZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKHN0dCkge1xuICAgICAgICAgICAgb2Zmc2V0ICs9IGRhdGFbb2Zmc2V0XSArIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKHBpZCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fcGFyc2VQQVQoZGF0YSxvZmZzZXQpO1xuICAgICAgICAgIH0gZWxzZSBpZihwaWQgPT09IHRoaXMuX3BtdElkKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJzZVBNVChkYXRhLG9mZnNldCk7XG4gICAgICAgICAgICBwbXRQYXJzZWQgPSB0aGlzLnBtdFBhcnNlZCA9IHRydWU7XG4gICAgICAgICAgICBhdmNJZCA9IHRoaXMuX2F2Y0lkO1xuICAgICAgICAgICAgYWFjSWQgPSB0aGlzLl9hYWNJZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRVJST1IsIHsgdHlwZSA6IEVycm9yVHlwZXMuTUVESUFfRVJST1IsIGRldGFpbHMgOiBFcnJvckRldGFpbHMuRlJBR19QQVJTSU5HX0VSUk9SLCBmYXRhbDpmYWxzZSwgcmVhc29uIDogJ1RTIHBhY2tldCBkaWQgbm90IHN0YXJ0IHdpdGggMHg0Nyd9KTtcbiAgICAgIH1cbiAgICB9XG4gIC8vIHBhcnNlIGxhc3QgUEVTIHBhY2tldFxuICAgIGlmKGF2Y0RhdGEpIHtcbiAgICAgIHRoaXMuX3BhcnNlQVZDUEVTKHRoaXMuX3BhcnNlUEVTKGF2Y0RhdGEpKTtcbiAgICB9XG4gICAgaWYoYWFjRGF0YSkge1xuICAgICAgdGhpcy5fcGFyc2VBQUNQRVModGhpcy5fcGFyc2VQRVMoYWFjRGF0YSkpO1xuICAgIH1cbiAgfVxuXG4gIGVuZCgpIHtcbiAgICAvLyBnZW5lcmF0ZSBJbml0IFNlZ21lbnQgaWYgbmVlZGVkXG4gICAgaWYoIXRoaXMuX2luaXRTZWdHZW5lcmF0ZWQpIHtcbiAgICAgIHRoaXMuX2dlbmVyYXRlSW5pdFNlZ21lbnQoKTtcbiAgICB9XG4gICAgLy9sb2dnZXIubG9nKCduYiBBVkMgc2FtcGxlczonICsgdGhpcy5fYXZjU2FtcGxlcy5sZW5ndGgpO1xuICAgIGlmKHRoaXMuX2F2Y1NhbXBsZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9mbHVzaEFWQ1NhbXBsZXMoKTtcbiAgICB9XG4gICAgLy9sb2dnZXIubG9nKCduYiBBQUMgc2FtcGxlczonICsgdGhpcy5fYWFjU2FtcGxlcy5sZW5ndGgpO1xuICAgIGlmKHRoaXMuX2FhY1NhbXBsZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9mbHVzaEFBQ1NhbXBsZXMoKTtcbiAgICB9XG4gICAgLy9ub3RpZnkgZW5kIG9mIHBhcnNpbmdcbiAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkZSQUdfUEFSU0VEKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5zd2l0Y2hMZXZlbCgpO1xuICAgIHRoaXMuX2luaXRQVFMgPSB0aGlzLl9pbml0RFRTID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2R1cmF0aW9uID0gMDtcbiAgfVxuXG4gIF9wYXJzZVBBVChkYXRhLG9mZnNldCkge1xuICAgIC8vIHNraXAgdGhlIFBTSSBoZWFkZXIgYW5kIHBhcnNlIHRoZSBmaXJzdCBQTVQgZW50cnlcbiAgICB0aGlzLl9wbXRJZCAgPSAoZGF0YVtvZmZzZXQrMTBdICYgMHgxRikgPDwgOCB8IGRhdGFbb2Zmc2V0KzExXTtcbiAgICAvL2xvZ2dlci5sb2coJ1BNVCBQSUQ6JyAgKyB0aGlzLl9wbXRJZCk7XG4gIH1cblxuICBfcGFyc2VQTVQoZGF0YSxvZmZzZXQpIHtcbiAgICB2YXIgc2VjdGlvbkxlbmd0aCx0YWJsZUVuZCxwcm9ncmFtSW5mb0xlbmd0aCxwaWQ7XG4gICAgc2VjdGlvbkxlbmd0aCA9IChkYXRhW29mZnNldCsxXSAmIDB4MGYpIDw8IDggfCBkYXRhW29mZnNldCsyXTtcbiAgICB0YWJsZUVuZCA9IG9mZnNldCArIDMgKyBzZWN0aW9uTGVuZ3RoIC0gNDtcbiAgICAvLyB0byBkZXRlcm1pbmUgd2hlcmUgdGhlIHRhYmxlIGlzLCB3ZSBoYXZlIHRvIGZpZ3VyZSBvdXQgaG93XG4gICAgLy8gbG9uZyB0aGUgcHJvZ3JhbSBpbmZvIGRlc2NyaXB0b3JzIGFyZVxuICAgIHByb2dyYW1JbmZvTGVuZ3RoID0gKGRhdGFbb2Zmc2V0KzEwXSAmIDB4MGYpIDw8IDggfCBkYXRhW29mZnNldCsxMV07XG5cbiAgICAvLyBhZHZhbmNlIHRoZSBvZmZzZXQgdG8gdGhlIGZpcnN0IGVudHJ5IGluIHRoZSBtYXBwaW5nIHRhYmxlXG4gICAgb2Zmc2V0ICs9IDEyICsgcHJvZ3JhbUluZm9MZW5ndGg7XG4gICAgd2hpbGUgKG9mZnNldCA8IHRhYmxlRW5kKSB7XG4gICAgICBwaWQgPSAoZGF0YVtvZmZzZXQgKyAxXSAmIDB4MUYpIDw8IDggfCBkYXRhW29mZnNldCArIDJdO1xuICAgICAgc3dpdGNoKGRhdGFbb2Zmc2V0XSkge1xuICAgICAgICAvLyBJU08vSUVDIDEzODE4LTcgQURUUyBBQUMgKE1QRUctMiBsb3dlciBiaXQtcmF0ZSBhdWRpbylcbiAgICAgICAgY2FzZSAweDBmOlxuICAgICAgICAvL2xvZ2dlci5sb2coJ0FBQyBQSUQ6JyAgKyBwaWQpO1xuICAgICAgICAgIHRoaXMuX2FhY0lkID0gcGlkO1xuICAgICAgICAgIHRoaXMuX2FhY1RyYWNrLmlkID0gcGlkO1xuICAgICAgICBicmVhaztcbiAgICAgICAgLy8gSVRVLVQgUmVjLiBILjI2NCBhbmQgSVNPL0lFQyAxNDQ5Ni0xMCAobG93ZXIgYml0LXJhdGUgdmlkZW8pXG4gICAgICAgIGNhc2UgMHgxYjpcbiAgICAgICAgLy9sb2dnZXIubG9nKCdBVkMgUElEOicgICsgcGlkKTtcbiAgICAgICAgdGhpcy5fYXZjSWQgPSBwaWQ7XG4gICAgICAgIHRoaXMuX2F2Y1RyYWNrLmlkID0gcGlkO1xuICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nZ2VyLmxvZygndW5rb3duIHN0cmVhbSB0eXBlOicgICsgZGF0YVtvZmZzZXRdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBtb3ZlIHRvIHRoZSBuZXh0IHRhYmxlIGVudHJ5XG4gICAgICAvLyBza2lwIHBhc3QgdGhlIGVsZW1lbnRhcnkgc3RyZWFtIGRlc2NyaXB0b3JzLCBpZiBwcmVzZW50XG4gICAgICBvZmZzZXQgKz0gKChkYXRhW29mZnNldCArIDNdICYgMHgwRikgPDwgOCB8IGRhdGFbb2Zmc2V0ICsgNF0pICsgNTtcbiAgICB9XG4gIH1cblxuICBfcGFyc2VQRVMoc3RyZWFtKSB7XG4gICAgdmFyIGkgPSAwLGZyYWcscGVzRmxhZ3MscGVzUHJlZml4LHBlc0xlbixwZXNIZHJMZW4scGVzRGF0YSxwZXNQdHMscGVzRHRzLHBheWxvYWRTdGFydE9mZnNldDtcbiAgICAvL3JldHJpZXZlIFBUUy9EVFMgZnJvbSBmaXJzdCBmcmFnbWVudFxuICAgIGZyYWcgPSBzdHJlYW0uZGF0YVswXTtcbiAgICBwZXNQcmVmaXggPSAoZnJhZ1swXSA8PCAxNikgKyAoZnJhZ1sxXSA8PCA4KSArIGZyYWdbMl07XG4gICAgaWYocGVzUHJlZml4ID09PSAxKSB7XG4gICAgICBwZXNMZW4gPSAoZnJhZ1s0XSA8PCA4KSArIGZyYWdbNV07XG4gICAgICBwZXNGbGFncyA9IGZyYWdbN107XG4gICAgICBpZiAocGVzRmxhZ3MgJiAweEMwKSB7XG4gICAgICAgIC8qIFBFUyBoZWFkZXIgZGVzY3JpYmVkIGhlcmUgOiBodHRwOi8vZHZkLnNvdXJjZWZvcmdlLm5ldC9kdmRpbmZvL3Blcy1oZHIuaHRtbFxuICAgICAgICAgICAgYXMgUFRTIC8gRFRTIGlzIDMzIGJpdCB3ZSBjYW5ub3QgdXNlIGJpdHdpc2Ugb3BlcmF0b3IgaW4gSlMsXG4gICAgICAgICAgICBhcyBCaXR3aXNlIG9wZXJhdG9ycyB0cmVhdCB0aGVpciBvcGVyYW5kcyBhcyBhIHNlcXVlbmNlIG9mIDMyIGJpdHMgKi9cbiAgICAgICAgcGVzUHRzID0gKGZyYWdbOV0gJiAweDBFKSo1MzY4NzA5MTIgKy8vIDEgPDwgMjlcbiAgICAgICAgICAoZnJhZ1sxMF0gJiAweEZGKSo0MTk0MzA0ICsvLyAxIDw8IDIyXG4gICAgICAgICAgKGZyYWdbMTFdICYgMHhGRSkqMTYzODQgKy8vIDEgPDwgMTRcbiAgICAgICAgICAoZnJhZ1sxMl0gJiAweEZGKSoxMjggKy8vIDEgPDwgN1xuICAgICAgICAgIChmcmFnWzEzXSAmIDB4RkUpLzI7XG4gICAgICAgICAgLy8gY2hlY2sgaWYgZ3JlYXRlciB0aGFuIDJeMzIgLTFcbiAgICAgICAgICBpZiAocGVzUHRzID4gNDI5NDk2NzI5NSkge1xuICAgICAgICAgICAgICAvLyBkZWNyZW1lbnQgMl4zM1xuICAgICAgICAgICAgICBwZXNQdHMgLT0gODU4OTkzNDU5MjtcbiAgICAgICAgICB9XG4gICAgICAgIGlmIChwZXNGbGFncyAmIDB4NDApIHtcbiAgICAgICAgICBwZXNEdHMgPSAoZnJhZ1sxNF0gJiAweDBFICkqNTM2ODcwOTEyICsvLyAxIDw8IDI5XG4gICAgICAgICAgICAoZnJhZ1sxNV0gJiAweEZGICkqNDE5NDMwNCArLy8gMSA8PCAyMlxuICAgICAgICAgICAgKGZyYWdbMTZdICYgMHhGRSApKjE2Mzg0ICsvLyAxIDw8IDE0XG4gICAgICAgICAgICAoZnJhZ1sxN10gJiAweEZGICkqMTI4ICsvLyAxIDw8IDdcbiAgICAgICAgICAgIChmcmFnWzE4XSAmIDB4RkUgKS8yO1xuICAgICAgICAgIC8vIGNoZWNrIGlmIGdyZWF0ZXIgdGhhbiAyXjMyIC0xXG4gICAgICAgICAgaWYgKHBlc0R0cyA+IDQyOTQ5NjcyOTUpIHtcbiAgICAgICAgICAgICAgLy8gZGVjcmVtZW50IDJeMzNcbiAgICAgICAgICAgICAgcGVzRHRzIC09IDg1ODk5MzQ1OTI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlc0R0cyA9IHBlc1B0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGVzSGRyTGVuID0gZnJhZ1s4XTtcbiAgICAgIHBheWxvYWRTdGFydE9mZnNldCA9IHBlc0hkckxlbis5O1xuICAgICAgLy8gdHJpbSBQRVMgaGVhZGVyXG4gICAgICBzdHJlYW0uZGF0YVswXSA9IHN0cmVhbS5kYXRhWzBdLnN1YmFycmF5KHBheWxvYWRTdGFydE9mZnNldCk7XG4gICAgICBzdHJlYW0uc2l6ZSAtPSBwYXlsb2FkU3RhcnRPZmZzZXQ7XG4gICAgICAvL3JlYXNzZW1ibGUgUEVTIHBhY2tldFxuICAgICAgcGVzRGF0YSA9IG5ldyBVaW50OEFycmF5KHN0cmVhbS5zaXplKTtcbiAgICAgIC8vIHJlYXNzZW1ibGUgdGhlIHBhY2tldFxuICAgICAgd2hpbGUgKHN0cmVhbS5kYXRhLmxlbmd0aCkge1xuICAgICAgICBmcmFnID0gc3RyZWFtLmRhdGEuc2hpZnQoKTtcbiAgICAgICAgcGVzRGF0YS5zZXQoZnJhZywgaSk7XG4gICAgICAgIGkgKz0gZnJhZy5ieXRlTGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgZGF0YSA6IHBlc0RhdGEsIHB0cyA6IHBlc1B0cywgZHRzIDogcGVzRHRzLCBsZW4gOiBwZXNMZW59O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfcGFyc2VBVkNQRVMocGVzKSB7XG4gICAgdmFyIHVuaXRzLHRyYWNrID0gdGhpcy5fYXZjVHJhY2ssYXZjU2FtcGxlLGtleSA9IGZhbHNlO1xuICAgIHVuaXRzID0gdGhpcy5fcGFyc2VBVkNOQUx1KHBlcy5kYXRhKTtcbiAgICAvLyBubyBOQUx1IGZvdW5kXG4gICAgaWYodW5pdHMubGVuZ3RoID09PSAwICYgdGhpcy5fYXZjU2FtcGxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBhcHBlbmQgcGVzLmRhdGEgdG8gcHJldmlvdXMgTkFMIHVuaXRcbiAgICAgIHZhciBsYXN0YXZjU2FtcGxlID0gdGhpcy5fYXZjU2FtcGxlc1t0aGlzLl9hdmNTYW1wbGVzLmxlbmd0aC0xXTtcbiAgICAgIHZhciBsYXN0VW5pdCA9IGxhc3RhdmNTYW1wbGUudW5pdHMudW5pdHNbbGFzdGF2Y1NhbXBsZS51bml0cy51bml0cy5sZW5ndGgtMV07XG4gICAgICB2YXIgdG1wID0gbmV3IFVpbnQ4QXJyYXkobGFzdFVuaXQuZGF0YS5ieXRlTGVuZ3RoK3Blcy5kYXRhLmJ5dGVMZW5ndGgpO1xuICAgICAgdG1wLnNldChsYXN0VW5pdC5kYXRhLDApO1xuICAgICAgdG1wLnNldChwZXMuZGF0YSxsYXN0VW5pdC5kYXRhLmJ5dGVMZW5ndGgpO1xuICAgICAgbGFzdFVuaXQuZGF0YSA9IHRtcDtcbiAgICAgIGxhc3RhdmNTYW1wbGUudW5pdHMubGVuZ3RoKz1wZXMuZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgdGhpcy5fYXZjU2FtcGxlc0xlbmd0aCs9cGVzLmRhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgLy9mcmVlIHBlcy5kYXRhIHRvIHNhdmUgdXAgc29tZSBtZW1vcnlcbiAgICBwZXMuZGF0YSA9IG51bGw7XG4gICAgdW5pdHMudW5pdHMuZm9yRWFjaCh1bml0ID0+IHtcbiAgICAgIHN3aXRjaCh1bml0LnR5cGUpIHtcbiAgICAgICAgLy9JRFJcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGtleSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vU1BTXG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICBpZighdHJhY2suc3BzKSB7XG4gICAgICAgICAgICB2YXIgZXhwR29sb21iRGVjb2RlciA9IG5ldyBFeHBHb2xvbWIodW5pdC5kYXRhKTtcbiAgICAgICAgICAgIHZhciBjb25maWcgPSBleHBHb2xvbWJEZWNvZGVyLnJlYWRTUFMoKTtcbiAgICAgICAgICAgIHRyYWNrLndpZHRoID0gY29uZmlnLndpZHRoO1xuICAgICAgICAgICAgdHJhY2suaGVpZ2h0ID0gY29uZmlnLmhlaWdodDtcbiAgICAgICAgICAgIHRyYWNrLnByb2ZpbGVJZGMgPSBjb25maWcucHJvZmlsZUlkYztcbiAgICAgICAgICAgIHRyYWNrLnByb2ZpbGVDb21wYXQgPSBjb25maWcucHJvZmlsZUNvbXBhdDtcbiAgICAgICAgICAgIHRyYWNrLmxldmVsSWRjID0gY29uZmlnLmxldmVsSWRjO1xuICAgICAgICAgICAgdHJhY2suc3BzID0gW3VuaXQuZGF0YV07XG4gICAgICAgICAgICB0cmFjay50aW1lc2NhbGUgPSB0aGlzLk1QNF9USU1FU0NBTEU7XG4gICAgICAgICAgICB0cmFjay5kdXJhdGlvbiA9IHRoaXMuTVA0X1RJTUVTQ0FMRSp0aGlzLl9kdXJhdGlvbjtcbiAgICAgICAgICAgIHZhciBjb2RlY2FycmF5ID0gdW5pdC5kYXRhLnN1YmFycmF5KDEsNCk7XG4gICAgICAgICAgICB2YXIgY29kZWNzdHJpbmcgID0gJ2F2YzEuJztcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaCA9IGNvZGVjYXJyYXlbaV0udG9TdHJpbmcoMTYpO1xuICAgICAgICAgICAgICAgIGlmIChoLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgaCA9ICcwJyArIGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvZGVjc3RyaW5nICs9IGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFjay5jb2RlYyA9IGNvZGVjc3RyaW5nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy9QUFNcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGlmKCF0cmFjay5wcHMpIHtcbiAgICAgICAgICAgIHRyYWNrLnBwcyA9IFt1bml0LmRhdGFdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvL2J1aWxkIHNhbXBsZSBmcm9tIFBFU1xuICAgIC8vIEFubmV4IEIgdG8gTVA0IGNvbnZlcnNpb24gdG8gYmUgZG9uZVxuICAgIGlmKHVuaXRzLmxlbmd0aCkge1xuICAgICAgYXZjU2FtcGxlID0geyB1bml0cyA6IHVuaXRzLCBwdHMgOiBwZXMucHRzLCBkdHMgOiBwZXMuZHRzICwga2V5IDoga2V5fTtcbiAgICAgIHRoaXMuX2F2Y1NhbXBsZXMucHVzaChhdmNTYW1wbGUpO1xuICAgICAgdGhpcy5fYXZjU2FtcGxlc0xlbmd0aCArPSB1bml0cy5sZW5ndGg7XG4gICAgICB0aGlzLl9hdmNTYW1wbGVzTmJOYWx1ICs9IHVuaXRzLnVuaXRzLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuXG4gIF9mbHVzaEFWQ1NhbXBsZXMoKSB7XG4gICAgdmFyIHZpZXcsaT04LGF2Y1NhbXBsZSxtcDRTYW1wbGUsbXA0U2FtcGxlTGVuZ3RoLHVuaXQsdHJhY2sgPSB0aGlzLl9hdmNUcmFjayxcbiAgICAgICAgbGFzdFNhbXBsZURUUyxtZGF0LG1vb2YsZmlyc3RQVFMsZmlyc3REVFMscHRzLGR0cyxwdHNub3JtLGR0c25vcm0sc2FtcGxlcyA9IFtdO1xuXG4gICAgLyogY29uY2F0ZW5hdGUgdGhlIHZpZGVvIGRhdGEgYW5kIGNvbnN0cnVjdCB0aGUgbWRhdCBpbiBwbGFjZVxuICAgICAgKG5lZWQgOCBtb3JlIGJ5dGVzIHRvIGZpbGwgbGVuZ3RoIGFuZCBtcGRhdCB0eXBlKSAqL1xuICAgIG1kYXQgPSBuZXcgVWludDhBcnJheSh0aGlzLl9hdmNTYW1wbGVzTGVuZ3RoICsgKDQgKiB0aGlzLl9hdmNTYW1wbGVzTmJOYWx1KSs4KTtcbiAgICB2aWV3ID0gbmV3IERhdGFWaWV3KG1kYXQuYnVmZmVyKTtcbiAgICB2aWV3LnNldFVpbnQzMigwLG1kYXQuYnl0ZUxlbmd0aCk7XG4gICAgbWRhdC5zZXQoTVA0LnR5cGVzLm1kYXQsNCk7XG4gICAgd2hpbGUodGhpcy5fYXZjU2FtcGxlcy5sZW5ndGgpIHtcbiAgICAgIGF2Y1NhbXBsZSA9IHRoaXMuX2F2Y1NhbXBsZXMuc2hpZnQoKTtcbiAgICAgIG1wNFNhbXBsZUxlbmd0aCA9IDA7XG5cbiAgICAgIC8vIGNvbnZlcnQgTkFMVSBiaXRzdHJlYW0gdG8gTVA0IGZvcm1hdCAocHJlcGVuZCBOQUxVIHdpdGggc2l6ZSBmaWVsZClcbiAgICAgIHdoaWxlKGF2Y1NhbXBsZS51bml0cy51bml0cy5sZW5ndGgpIHtcbiAgICAgICAgdW5pdCA9IGF2Y1NhbXBsZS51bml0cy51bml0cy5zaGlmdCgpO1xuICAgICAgICB2aWV3LnNldFVpbnQzMihpLCB1bml0LmRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGkgKz0gNDtcbiAgICAgICAgbWRhdC5zZXQodW5pdC5kYXRhLCBpKTtcbiAgICAgICAgaSArPSB1bml0LmRhdGEuYnl0ZUxlbmd0aDtcbiAgICAgICAgbXA0U2FtcGxlTGVuZ3RoKz00K3VuaXQuZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgfVxuICAgICAgcHRzID0gYXZjU2FtcGxlLnB0cyAtIHRoaXMuX2luaXREVFM7XG4gICAgICBkdHMgPSBhdmNTYW1wbGUuZHRzIC0gdGhpcy5faW5pdERUUztcbiAgICAgIC8vbG9nZ2VyLmxvZygnVmlkZW8vUFRTL0RUUzonICsgYXZjU2FtcGxlLnB0cyArICcvJyArIGF2Y1NhbXBsZS5kdHMpO1xuXG4gICAgICBpZihsYXN0U2FtcGxlRFRTICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcHRzbm9ybSA9IHRoaXMuX1BUU05vcm1hbGl6ZShwdHMsbGFzdFNhbXBsZURUUyk7XG4gICAgICAgIGR0c25vcm0gPSB0aGlzLl9QVFNOb3JtYWxpemUoZHRzLGxhc3RTYW1wbGVEVFMpO1xuXG4gICAgICAgIG1wNFNhbXBsZS5kdXJhdGlvbiA9IChkdHNub3JtIC0gbGFzdFNhbXBsZURUUykvdGhpcy5QRVMyTVA0U0NBTEVGQUNUT1I7XG4gICAgICAgIGlmKG1wNFNhbXBsZS5kdXJhdGlvbiA8IDApIHtcbiAgICAgICAgICAvL2xvZ2dlci5sb2coJ2ludmFsaWQgc2FtcGxlIGR1cmF0aW9uIGF0IFBUUy9EVFM6OicgKyBhdmNTYW1wbGUucHRzICsgJy8nICsgYXZjU2FtcGxlLmR0cyArICc6JyArIG1wNFNhbXBsZS5kdXJhdGlvbik7XG4gICAgICAgICAgbXA0U2FtcGxlLmR1cmF0aW9uID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHRzbm9ybSA9IHRoaXMuX1BUU05vcm1hbGl6ZShwdHMsdGhpcy5uZXh0QXZjUHRzKTtcbiAgICAgICAgZHRzbm9ybSA9IHRoaXMuX1BUU05vcm1hbGl6ZShkdHMsdGhpcy5uZXh0QXZjUHRzKTtcbiAgICAgICAgLy8gY2hlY2sgaWYgZnJhZ21lbnRzIGFyZSBjb250aWd1b3VzIChpLmUuIG5vIG1pc3NpbmcgZnJhbWVzIGJldHdlZW4gZnJhZ21lbnQpXG4gICAgICAgIGlmKHRoaXMubmV4dEF2Y1B0cykge1xuICAgICAgICAgIHZhciBkZWx0YSA9IE1hdGgucm91bmQoKHB0c25vcm0gLSB0aGlzLm5leHRBdmNQdHMpLzkwKSxhYnNkZWx0YT1NYXRoLmFicyhkZWx0YSk7XG4gICAgICAgICAgLy9sb2dnZXIubG9nKCdhYnNkZWx0YS9hdmNTYW1wbGUucHRzOicgKyBhYnNkZWx0YSArICcvJyArIGF2Y1NhbXBsZS5wdHMpO1xuICAgICAgICAgIC8vIGlmIGRlbHRhIGlzIGxlc3MgdGhhbiAzMDAgbXMsIG5leHQgbG9hZGVkIGZyYWdtZW50IGlzIGFzc3VtZWQgdG8gYmUgY29udGlndW91cyB3aXRoIGxhc3Qgb25lXG4gICAgICAgICAgaWYoYWJzZGVsdGEgPCAzMDApIHtcbiAgICAgICAgICAgIC8vbG9nZ2VyLmxvZygnVmlkZW8gbmV4dCBQVFM6JyArIHRoaXMubmV4dEF2Y1B0cyk7XG4gICAgICAgICAgICBpZihkZWx0YSA+IDEpIHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgQVZDOiR7ZGVsdGF9IG1zIGhvbGUgYmV0d2VlbiBmcmFnbWVudHMgZGV0ZWN0ZWQsZmlsbGluZyBpdGApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkZWx0YSA8IC0xKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci5sb2coYEFWQzokeygtZGVsdGEpfSBtcyBvdmVybGFwcGluZyBiZXR3ZWVuIGZyYWdtZW50cyBkZXRlY3RlZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gc2V0IFBUUyB0byBuZXh0IFBUU1xuICAgICAgICAgICAgcHRzbm9ybSA9IHRoaXMubmV4dEF2Y1B0cztcbiAgICAgICAgICAgIC8vIG9mZnNldCBEVFMgYXMgd2VsbCwgZW5zdXJlIHRoYXQgRFRTIGlzIHNtYWxsZXIgb3IgZXF1YWwgdGhhbiBuZXcgUFRTXG4gICAgICAgICAgICBkdHNub3JtID0gTWF0aC5tYXgoZHRzbm9ybS1kZWx0YSwgdGhpcy5sYXN0QXZjRHRzKTtcbiAgICAgICAgICAgLy8gbG9nZ2VyLmxvZygnVmlkZW8vUFRTL0RUUyBhZGp1c3RlZDonICsgYXZjU2FtcGxlLnB0cyArICcvJyArIGF2Y1NhbXBsZS5kdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5vdCBjb250aWd1b3VzIHRpbWVzdGFtcCwgY2hlY2sgaWYgUFRTIGlzIHdpdGhpbiBhY2NlcHRhYmxlIHJhbmdlXG4gICAgICAgICAgICB2YXIgZXhwZWN0ZWRQVFMgPSB0aGlzLlBFU19USU1FU0NBTEUqdGhpcy50aW1lT2Zmc2V0O1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYW55IHVuZXhwZWN0ZWQgZHJpZnQgYmV0d2VlbiBleHBlY3RlZCB0aW1lc3RhbXAgYW5kIHJlYWwgb25lXG4gICAgICAgICAgICBpZihNYXRoLmFicyhleHBlY3RlZFBUUyAtIHB0c25vcm0pID4gdGhpcy5QRVNfVElNRVNDQUxFKjM2MDAgKSB7XG4gICAgICAgICAgICAgIC8vbG9nZ2VyLmxvZyhgUFRTIGxvb3BpbmcgPz8/IEFWQyBQVFMgZGVsdGE6JHtleHBlY3RlZFBUUy1wdHNub3JtfWApO1xuICAgICAgICAgICAgICB2YXIgcHRzT2Zmc2V0ID0gZXhwZWN0ZWRQVFMtcHRzbm9ybTtcbiAgICAgICAgICAgICAgLy8gc2V0IFBUUyB0byBuZXh0IGV4cGVjdGVkIFBUUztcbiAgICAgICAgICAgICAgcHRzbm9ybSA9IGV4cGVjdGVkUFRTO1xuICAgICAgICAgICAgICBkdHNub3JtID0gcHRzbm9ybTtcbiAgICAgICAgICAgICAgLy8gb2Zmc2V0IGluaXRQVFMvaW5pdERUUyB0byBmaXggY29tcHV0YXRpb24gZm9yIGZvbGxvd2luZyBzYW1wbGVzXG4gICAgICAgICAgICAgIHRoaXMuX2luaXRQVFMtPXB0c09mZnNldDtcbiAgICAgICAgICAgICAgdGhpcy5faW5pdERUUy09cHRzT2Zmc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyByZW1lbWJlciBmaXJzdCBQVFMgb2Ygb3VyIGF2Y1NhbXBsZXMsIGVuc3VyZSB2YWx1ZSBpcyBwb3NpdGl2ZVxuICAgICAgICBmaXJzdFBUUyA9IE1hdGgubWF4KDAscHRzbm9ybSk7XG4gICAgICAgIGZpcnN0RFRTID0gTWF0aC5tYXgoMCxkdHNub3JtKTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coYFBUUy9EVFMvaW5pdERUUy9ub3JtUFRTL25vcm1EVFMvcmVsYXRpdmUgUFRTIDogJHthdmNTYW1wbGUucHRzfS8ke2F2Y1NhbXBsZS5kdHN9LyR7dGhpcy5faW5pdERUU30vJHtwdHNub3JtfS8ke2R0c25vcm19LyR7KGF2Y1NhbXBsZS5wdHMvNDI5NDk2NzI5NikudG9GaXhlZCgzKX1gKTtcblxuICAgICAgbXA0U2FtcGxlID0ge1xuICAgICAgICBzaXplOiBtcDRTYW1wbGVMZW5ndGgsXG4gICAgICAgIGR1cmF0aW9uIDogMCxcbiAgICAgICAgY3RzOiAocHRzbm9ybSAtIGR0c25vcm0pL3RoaXMuUEVTMk1QNFNDQUxFRkFDVE9SLFxuICAgICAgICBmbGFnczoge1xuICAgICAgICAgIGlzTGVhZGluZzogMCxcbiAgICAgICAgICBpc0RlcGVuZGVkT246IDAsXG4gICAgICAgICAgaGFzUmVkdW5kYW5jeTogMCxcbiAgICAgICAgICBkZWdyYWRQcmlvOiAwXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmKGF2Y1NhbXBsZS5rZXkgPT09IHRydWUpIHtcbiAgICAgICAgLy8gdGhlIGN1cnJlbnQgc2FtcGxlIGlzIGEga2V5IGZyYW1lXG4gICAgICAgIG1wNFNhbXBsZS5mbGFncy5kZXBlbmRzT24gPSAyO1xuICAgICAgICBtcDRTYW1wbGUuZmxhZ3MuaXNOb25TeW5jID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1wNFNhbXBsZS5mbGFncy5kZXBlbmRzT24gPSAxO1xuICAgICAgICBtcDRTYW1wbGUuZmxhZ3MuaXNOb25TeW5jID0gMTtcbiAgICAgIH1cbiAgICAgIHNhbXBsZXMucHVzaChtcDRTYW1wbGUpO1xuICAgICAgbGFzdFNhbXBsZURUUyA9IGR0c25vcm07XG4gICAgfVxuICAgIGlmKHNhbXBsZXMubGVuZ3RoID49Mikge1xuICAgICAgbXA0U2FtcGxlLmR1cmF0aW9uID0gc2FtcGxlc1tzYW1wbGVzLmxlbmd0aC0yXS5kdXJhdGlvbjtcbiAgICB9XG4gICAgdGhpcy5sYXN0QXZjRHRzID0gZHRzbm9ybTtcbiAgICAvLyBuZXh0IEFWQyBzYW1wbGUgUFRTIHNob3VsZCBiZSBlcXVhbCB0byBsYXN0IHNhbXBsZSBQVFMgKyBkdXJhdGlvblxuICAgIHRoaXMubmV4dEF2Y1B0cyA9IHB0c25vcm0gKyBtcDRTYW1wbGUuZHVyYXRpb24qdGhpcy5QRVMyTVA0U0NBTEVGQUNUT1I7XG4gICAgLy9sb2dnZXIubG9nKCdWaWRlby9sYXN0QXZjRHRzL25leHRBdmNQdHM6JyArIHRoaXMubGFzdEF2Y0R0cyArICcvJyArIHRoaXMubmV4dEF2Y1B0cyk7XG5cbiAgICB0aGlzLl9hdmNTYW1wbGVzTGVuZ3RoID0gMDtcbiAgICB0aGlzLl9hdmNTYW1wbGVzTmJOYWx1ID0gMDtcblxuICAgIHRyYWNrLnNhbXBsZXMgPSBzYW1wbGVzO1xuICAgIG1vb2YgPSBNUDQubW9vZih0cmFjay5zZXF1ZW5jZU51bWJlcisrLGZpcnN0RFRTL3RoaXMuUEVTMk1QNFNDQUxFRkFDVE9SLHRyYWNrKTtcbiAgICB0cmFjay5zYW1wbGVzID0gW107XG4gICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX1BBUlNJTkdfREFUQSx7XG4gICAgICBtb29mOiBtb29mLFxuICAgICAgbWRhdDogbWRhdCxcbiAgICAgIHN0YXJ0UFRTIDogZmlyc3RQVFMvdGhpcy5QRVNfVElNRVNDQUxFLFxuICAgICAgZW5kUFRTIDogdGhpcy5uZXh0QXZjUHRzL3RoaXMuUEVTX1RJTUVTQ0FMRSxcbiAgICAgIHN0YXJ0RFRTIDogZmlyc3REVFMvdGhpcy5QRVNfVElNRVNDQUxFLFxuICAgICAgZW5kRFRTIDogKGR0c25vcm0gKyB0aGlzLlBFUzJNUDRTQ0FMRUZBQ1RPUiptcDRTYW1wbGUuZHVyYXRpb24pL3RoaXMuUEVTX1RJTUVTQ0FMRSxcbiAgICAgIHR5cGUgOiAndmlkZW8nLFxuICAgICAgbmIgOiBzYW1wbGVzLmxlbmd0aFxuICAgIH0pO1xuICB9XG5cbiAgX3BhcnNlQVZDTkFMdShhcnJheSkge1xuICAgIHZhciBpID0gMCxsZW4gPSBhcnJheS5ieXRlTGVuZ3RoLHZhbHVlLG92ZXJmbG93LHN0YXRlID0gMDtcbiAgICB2YXIgdW5pdHMgPSBbXSwgdW5pdCwgdW5pdFR5cGUsIGxhc3RVbml0U3RhcnQsbGFzdFVuaXRUeXBlLGxlbmd0aCA9IDA7XG4gICAgLy9sb2dnZXIubG9nKCdQRVM6JyArIEhleC5oZXhEdW1wKGFycmF5KSk7XG5cbiAgICB3aGlsZShpPCBsZW4pIHtcbiAgICAgIHZhbHVlID0gYXJyYXlbaSsrXTtcbiAgICAgIC8vIGZpbmRpbmcgMyBvciA0LWJ5dGUgc3RhcnQgY29kZXMgKDAwIDAwIDAxIE9SIDAwIDAwIDAwIDAxKVxuICAgICAgc3dpdGNoKHN0YXRlKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBpZih2YWx1ZSA9PT0gMCkge1xuICAgICAgICAgICAgc3RhdGUgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IDI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIGlmKHZhbHVlID09PSAwKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IDM7XG4gICAgICAgICAgfSBlbHNlIGlmKHZhbHVlID09PSAxKSB7XG4gICAgICAgICAgICB1bml0VHlwZSA9IGFycmF5W2ldICYgMHgxZjtcbiAgICAgICAgICAgIC8vbG9nZ2VyLmxvZygnZmluZCBOQUxVIEAgb2Zmc2V0OicgKyBpICsgJyx0eXBlOicgKyB1bml0VHlwZSk7XG4gICAgICAgICAgICBpZihsYXN0VW5pdFN0YXJ0KSB7XG4gICAgICAgICAgICAgIHVuaXQgPSB7IGRhdGEgOiBhcnJheS5zdWJhcnJheShsYXN0VW5pdFN0YXJ0LGktc3RhdGUtMSksIHR5cGUgOiBsYXN0VW5pdFR5cGV9O1xuICAgICAgICAgICAgICBsZW5ndGgrPWktc3RhdGUtMS1sYXN0VW5pdFN0YXJ0O1xuICAgICAgICAgICAgICAvL2xvZ2dlci5sb2coJ3B1c2hpbmcgTkFMVSwgdHlwZS9zaXplOicgKyB1bml0LnR5cGUgKyAnLycgKyB1bml0LmRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgIHVuaXRzLnB1c2godW5pdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBJZiBOQUwgdW5pdHMgYXJlIG5vdCBzdGFydGluZyByaWdodCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBQRVMgcGFja2V0LCBwdXNoIHByZWNlZGluZyBkYXRhIGludG8gcHJldmlvdXMgTkFMIHVuaXQuXG4gICAgICAgICAgICAgIG92ZXJmbG93ICA9IGkgLSBzdGF0ZSAtIDE7XG4gICAgICAgICAgICAgIGlmIChvdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgLy9sb2dnZXIubG9nKCdmaXJzdCBOQUxVIGZvdW5kIHdpdGggb3ZlcmZsb3c6JyArIG92ZXJmbG93KTtcbiAgICAgICAgICAgICAgICAgIGlmKHRoaXMuX2F2Y1NhbXBsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0YXZjU2FtcGxlID0gdGhpcy5fYXZjU2FtcGxlc1t0aGlzLl9hdmNTYW1wbGVzLmxlbmd0aC0xXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RVbml0ID0gbGFzdGF2Y1NhbXBsZS51bml0cy51bml0c1tsYXN0YXZjU2FtcGxlLnVuaXRzLnVuaXRzLmxlbmd0aC0xXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRtcCA9IG5ldyBVaW50OEFycmF5KGxhc3RVbml0LmRhdGEuYnl0ZUxlbmd0aCtvdmVyZmxvdyk7XG4gICAgICAgICAgICAgICAgICAgIHRtcC5zZXQobGFzdFVuaXQuZGF0YSwwKTtcbiAgICAgICAgICAgICAgICAgICAgdG1wLnNldChhcnJheS5zdWJhcnJheSgwLG92ZXJmbG93KSxsYXN0VW5pdC5kYXRhLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdC5kYXRhID0gdG1wO1xuICAgICAgICAgICAgICAgICAgICBsYXN0YXZjU2FtcGxlLnVuaXRzLmxlbmd0aCs9b3ZlcmZsb3c7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2F2Y1NhbXBsZXNMZW5ndGgrPW92ZXJmbG93O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0VW5pdFN0YXJ0ID0gaTtcbiAgICAgICAgICAgIGxhc3RVbml0VHlwZSA9IHVuaXRUeXBlO1xuICAgICAgICAgICAgaWYodW5pdFR5cGUgPT09IDEgfHwgdW5pdFR5cGUgPT09IDUpIHtcbiAgICAgICAgICAgICAgLy8gT1BUSSAhISEgaWYgSURSL05EUiB1bml0LCBjb25zaWRlciBpdCBpcyBsYXN0IE5BTHVcbiAgICAgICAgICAgICAgaSA9IGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYobGFzdFVuaXRTdGFydCkge1xuICAgICAgdW5pdCA9IHsgZGF0YSA6IGFycmF5LnN1YmFycmF5KGxhc3RVbml0U3RhcnQsbGVuKSwgdHlwZSA6IGxhc3RVbml0VHlwZX07XG4gICAgICBsZW5ndGgrPWxlbi1sYXN0VW5pdFN0YXJ0O1xuICAgICAgdW5pdHMucHVzaCh1bml0KTtcbiAgICAgIC8vbG9nZ2VyLmxvZygncHVzaGluZyBOQUxVLCB0eXBlL3NpemU6JyArIHVuaXQudHlwZSArICcvJyArIHVuaXQuZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgdW5pdHMgOiB1bml0cyAsIGxlbmd0aCA6IGxlbmd0aH07XG4gIH1cblxuICBfUFRTTm9ybWFsaXplKHZhbHVlLHJlZmVyZW5jZSkge1xuICAgIHZhciBvZmZzZXQ7XG4gICAgaWYgKHJlZmVyZW5jZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChyZWZlcmVuY2UgPCB2YWx1ZSkge1xuICAgICAgICAvLyAtIDJeMzNcbiAgICAgICAgb2Zmc2V0ID0gLTg1ODk5MzQ1OTI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gKyAyXjMzXG4gICAgICAgIG9mZnNldCA9IDg1ODk5MzQ1OTI7XG4gICAgfVxuICAgIC8qIFBUUyBpcyAzM2JpdCAoZnJvbSAwIHRvIDJeMzMgLTEpXG4gICAgICBpZiBkaWZmIGJldHdlZW4gdmFsdWUgYW5kIHJlZmVyZW5jZSBpcyBiaWdnZXIgdGhhbiBoYWxmIG9mIHRoZSBhbXBsaXR1ZGUgKDJeMzIpIHRoZW4gaXQgbWVhbnMgdGhhdFxuICAgICAgUFRTIGxvb3Bpbmcgb2NjdXJlZC4gZmlsbCB0aGUgZ2FwICovXG4gICAgd2hpbGUgKE1hdGguYWJzKHZhbHVlIC0gcmVmZXJlbmNlKSA+IDQyOTQ5NjcyOTYpIHtcbiAgICAgICAgdmFsdWUgKz0gb2Zmc2V0O1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBfcGFyc2VBQUNQRVMocGVzKSB7XG4gICAgdmFyIHRyYWNrID0gdGhpcy5fYWFjVHJhY2ssYWFjU2FtcGxlLGRhdGEgPSBwZXMuZGF0YSxjb25maWcsYWR0c0ZyYW1lU2l6ZSxhZHRzU3RhcnRPZmZzZXQsYWR0c0hlYWRlckxlbixzdGFtcCxuYlNhbXBsZXMsbGVuO1xuICAgIGlmKHRoaXMuYWFjT3ZlckZsb3cpIHtcbiAgICAgIHZhciB0bXAgPSBuZXcgVWludDhBcnJheSh0aGlzLmFhY092ZXJGbG93LmJ5dGVMZW5ndGgrZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICAgIHRtcC5zZXQodGhpcy5hYWNPdmVyRmxvdywwKTtcbiAgICAgIHRtcC5zZXQoZGF0YSx0aGlzLmFhY092ZXJGbG93LmJ5dGVMZW5ndGgpO1xuICAgICAgZGF0YSA9IHRtcDtcbiAgICB9XG4gICAgLy8gbG9vayBmb3IgQURUUyBoZWFkZXIgKDB4RkZGeClcbiAgICBmb3IoYWR0c1N0YXJ0T2Zmc2V0ID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGFkdHNTdGFydE9mZnNldDxsZW4tMTsgYWR0c1N0YXJ0T2Zmc2V0KyspIHtcbiAgICAgIGlmKChkYXRhW2FkdHNTdGFydE9mZnNldF0gPT09IDB4ZmYpICYmIChkYXRhW2FkdHNTdGFydE9mZnNldCsxXSAmIDB4ZjApID09PSAweGYwKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBpZiBBRFRTIGhlYWRlciBkb2VzIG5vdCBzdGFydCBzdHJhaWdodCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIFBFUyBwYXlsb2FkLCByYWlzZSBhbiBlcnJvclxuICAgIGlmKGFkdHNTdGFydE9mZnNldCkge1xuICAgICAgdmFyIHJlYXNvbixmYXRhbDtcbiAgICAgIGlmKGFkdHNTdGFydE9mZnNldCA8IGxlbiAtIDEpIHtcbiAgICAgICAgcmVhc29uID0gYEFBQyBQRVMgZGlkIG5vdCBzdGFydCB3aXRoIEFEVFMgaGVhZGVyLG9mZnNldDoke2FkdHNTdGFydE9mZnNldH1gO1xuICAgICAgICBmYXRhbCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVhc29uID0gYG5vIEFEVFMgaGVhZGVyIGZvdW5kIGluIEFBQyBQRVNgO1xuICAgICAgICBmYXRhbCA9IHRydWU7XG4gICAgICB9XG4gICAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkVSUk9SLCB7IHR5cGUgOiBFcnJvclR5cGVzLk1FRElBX0VSUk9SLCBkZXRhaWxzIDogRXJyb3JEZXRhaWxzLkZSQUdfUEFSU0lOR19FUlJPUiwgZmF0YWw6ZmF0YWwsIHJlYXNvbiA6IHJlYXNvbn0pO1xuICAgICAgaWYoZmF0YWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCF0cmFjay5hdWRpb3NhbXBsZXJhdGUpIHtcbiAgICAgIGNvbmZpZyA9IHRoaXMuX0FEVFN0b0F1ZGlvQ29uZmlnKGRhdGEsYWR0c1N0YXJ0T2Zmc2V0LHRoaXMuYXVkaW9Db2RlYyk7XG4gICAgICB0cmFjay5jb25maWcgPSBjb25maWcuY29uZmlnO1xuICAgICAgdHJhY2suYXVkaW9zYW1wbGVyYXRlID0gY29uZmlnLnNhbXBsZXJhdGU7XG4gICAgICB0cmFjay5jaGFubmVsQ291bnQgPSBjb25maWcuY2hhbm5lbENvdW50O1xuICAgICAgdHJhY2suY29kZWMgPSBjb25maWcuY29kZWM7XG4gICAgICB0cmFjay50aW1lc2NhbGUgPSB0aGlzLk1QNF9USU1FU0NBTEU7XG4gICAgICB0cmFjay5kdXJhdGlvbiA9IHRoaXMuTVA0X1RJTUVTQ0FMRSp0aGlzLl9kdXJhdGlvbjtcbiAgICAgIGxvZ2dlci5sb2coYHBhcnNlZCAgIGNvZGVjOiR7dHJhY2suY29kZWN9LHJhdGU6JHtjb25maWcuc2FtcGxlcmF0ZX0sbmIgY2hhbm5lbDoke2NvbmZpZy5jaGFubmVsQ291bnR9YCk7XG4gICAgfVxuICAgIG5iU2FtcGxlcyA9IDA7XG4gICAgd2hpbGUoKGFkdHNTdGFydE9mZnNldCArIDUpIDwgbGVuKSB7XG4gICAgICAvLyByZXRyaWV2ZSBmcmFtZSBzaXplXG4gICAgICBhZHRzRnJhbWVTaXplID0gKChkYXRhW2FkdHNTdGFydE9mZnNldCszXSAmIDB4MDMpIDw8IDExKTtcbiAgICAgIC8vIGJ5dGUgNFxuICAgICAgYWR0c0ZyYW1lU2l6ZSB8PSAoZGF0YVthZHRzU3RhcnRPZmZzZXQrNF0gPDwgMyk7XG4gICAgICAvLyBieXRlIDVcbiAgICAgIGFkdHNGcmFtZVNpemUgfD0gKChkYXRhW2FkdHNTdGFydE9mZnNldCs1XSAmIDB4RTApID4+PiA1KTtcbiAgICAgIGFkdHNIZWFkZXJMZW4gPSAoISEoZGF0YVthZHRzU3RhcnRPZmZzZXQrMV0gJiAweDAxKSA/IDcgOiA5KTtcbiAgICAgIGFkdHNGcmFtZVNpemUgLT0gYWR0c0hlYWRlckxlbjtcbiAgICAgIHN0YW1wID0gTWF0aC5yb3VuZChwZXMucHRzICsgbmJTYW1wbGVzKjEwMjQqdGhpcy5QRVNfVElNRVNDQUxFL3RyYWNrLmF1ZGlvc2FtcGxlcmF0ZSk7XG4gICAgICAvL3N0YW1wID0gcGVzLnB0cztcbiAgICAgIC8vY29uc29sZS5sb2coJ0FBQyBmcmFtZSwgb2Zmc2V0L2xlbmd0aC9wdHM6JyArIChhZHRzU3RhcnRPZmZzZXQrNykgKyAnLycgKyBhZHRzRnJhbWVTaXplICsgJy8nICsgc3RhbXAudG9GaXhlZCgwKSk7XG4gICAgICBpZihhZHRzU3RhcnRPZmZzZXQrYWR0c0hlYWRlckxlbithZHRzRnJhbWVTaXplIDw9IGxlbikge1xuICAgICAgICBhYWNTYW1wbGUgPSB7IHVuaXQgOiBkYXRhLnN1YmFycmF5KGFkdHNTdGFydE9mZnNldCthZHRzSGVhZGVyTGVuLGFkdHNTdGFydE9mZnNldCthZHRzSGVhZGVyTGVuK2FkdHNGcmFtZVNpemUpICwgcHRzIDogc3RhbXAsIGR0cyA6IHN0YW1wfTtcbiAgICAgICAgdGhpcy5fYWFjU2FtcGxlcy5wdXNoKGFhY1NhbXBsZSk7XG4gICAgICAgIHRoaXMuX2FhY1NhbXBsZXNMZW5ndGggKz0gYWR0c0ZyYW1lU2l6ZTtcbiAgICAgICAgYWR0c1N0YXJ0T2Zmc2V0Kz1hZHRzRnJhbWVTaXplK2FkdHNIZWFkZXJMZW47XG4gICAgICAgIG5iU2FtcGxlcysrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKGFkdHNTdGFydE9mZnNldCA8IGxlbikge1xuICAgICAgdGhpcy5hYWNPdmVyRmxvdyA9IGRhdGEuc3ViYXJyYXkoYWR0c1N0YXJ0T2Zmc2V0LGxlbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWFjT3ZlckZsb3cgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9mbHVzaEFBQ1NhbXBsZXMoKSB7XG4gICAgdmFyIHZpZXcsaT04LGFhY1NhbXBsZSxtcDRTYW1wbGUsdW5pdCx0cmFjayA9IHRoaXMuX2FhY1RyYWNrLFxuICAgICAgICBsYXN0U2FtcGxlRFRTLG1kYXQsbW9vZixmaXJzdFBUUyxmaXJzdERUUyxwdHMsZHRzLHB0c25vcm0sZHRzbm9ybSxzYW1wbGVzID0gW107XG5cbiAgICAvKiBjb25jYXRlbmF0ZSB0aGUgYXVkaW8gZGF0YSBhbmQgY29uc3RydWN0IHRoZSBtZGF0IGluIHBsYWNlXG4gICAgICAobmVlZCA4IG1vcmUgYnl0ZXMgdG8gZmlsbCBsZW5ndGggYW5kIG1wZGF0IHR5cGUpICovXG4gICAgbWRhdCA9IG5ldyBVaW50OEFycmF5KHRoaXMuX2FhY1NhbXBsZXNMZW5ndGgrOCk7XG4gICAgdmlldyA9IG5ldyBEYXRhVmlldyhtZGF0LmJ1ZmZlcik7XG4gICAgdmlldy5zZXRVaW50MzIoMCxtZGF0LmJ5dGVMZW5ndGgpO1xuICAgIG1kYXQuc2V0KE1QNC50eXBlcy5tZGF0LDQpO1xuICAgIHdoaWxlKHRoaXMuX2FhY1NhbXBsZXMubGVuZ3RoKSB7XG4gICAgICBhYWNTYW1wbGUgPSB0aGlzLl9hYWNTYW1wbGVzLnNoaWZ0KCk7XG4gICAgICB1bml0ID0gYWFjU2FtcGxlLnVuaXQ7XG4gICAgICBtZGF0LnNldCh1bml0LCBpKTtcbiAgICAgIGkgKz0gdW5pdC5ieXRlTGVuZ3RoO1xuXG4gICAgICBwdHMgPSBhYWNTYW1wbGUucHRzIC0gdGhpcy5faW5pdERUUztcbiAgICAgIGR0cyA9IGFhY1NhbXBsZS5kdHMgLSB0aGlzLl9pbml0RFRTO1xuXG4gICAgICAvL2xvZ2dlci5sb2coJ0F1ZGlvL1BUUzonICsgYWFjU2FtcGxlLnB0cy50b0ZpeGVkKDApKTtcbiAgICAgIGlmKGxhc3RTYW1wbGVEVFMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwdHNub3JtID0gdGhpcy5fUFRTTm9ybWFsaXplKHB0cyxsYXN0U2FtcGxlRFRTKTtcbiAgICAgICAgZHRzbm9ybSA9IHRoaXMuX1BUU05vcm1hbGl6ZShkdHMsbGFzdFNhbXBsZURUUyk7XG4gICAgICAgIC8vIHdlIHVzZSBEVFMgdG8gY29tcHV0ZSBzYW1wbGUgZHVyYXRpb24sIGJ1dCB3ZSB1c2UgUFRTIHRvIGNvbXB1dGUgaW5pdFBUUyB3aGljaCBpcyB1c2VkIHRvIHN5bmMgYXVkaW8gYW5kIHZpZGVvXG4gICAgICAgIG1wNFNhbXBsZS5kdXJhdGlvbiA9IChkdHNub3JtIC0gbGFzdFNhbXBsZURUUykvdGhpcy5QRVMyTVA0U0NBTEVGQUNUT1I7XG4gICAgICAgIGlmKG1wNFNhbXBsZS5kdXJhdGlvbiA8IDApIHtcbiAgICAgICAgICAvL2xvZ2dlci5sb2coJ2ludmFsaWQgc2FtcGxlIGR1cmF0aW9uIGF0IFBUUy9EVFM6OicgKyBhdmNTYW1wbGUucHRzICsgJy8nICsgYXZjU2FtcGxlLmR0cyArICc6JyArIG1wNFNhbXBsZS5kdXJhdGlvbik7XG4gICAgICAgICAgbXA0U2FtcGxlLmR1cmF0aW9uID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHRzbm9ybSA9IHRoaXMuX1BUU05vcm1hbGl6ZShwdHMsdGhpcy5uZXh0QWFjUHRzKTtcbiAgICAgICAgZHRzbm9ybSA9IHRoaXMuX1BUU05vcm1hbGl6ZShkdHMsdGhpcy5uZXh0QWFjUHRzKTtcbiAgICAgICAgLy8gY2hlY2sgaWYgZnJhZ21lbnRzIGFyZSBjb250aWd1b3VzIChpLmUuIG5vIG1pc3NpbmcgZnJhbWVzIGJldHdlZW4gZnJhZ21lbnQpXG4gICAgICAgIGlmKHRoaXMubmV4dEFhY1B0cyAmJiB0aGlzLm5leHRBYWNQdHMgIT09IHB0c25vcm0pIHtcbiAgICAgICAgICAvL2xvZ2dlci5sb2coJ0F1ZGlvIG5leHQgUFRTOicgKyB0aGlzLm5leHRBYWNQdHMpO1xuICAgICAgICAgIHZhciBkZWx0YSA9IE1hdGgucm91bmQoMTAwMCoocHRzbm9ybSAtIHRoaXMubmV4dEFhY1B0cykvdGhpcy5QRVNfVElNRVNDQUxFKSxhYnNkZWx0YT1NYXRoLmFicyhkZWx0YSk7XG4gICAgICAgICAgLy8gaWYgZGVsdGEgaXMgbGVzcyB0aGFuIDMwMCBtcywgbmV4dCBsb2FkZWQgZnJhZ21lbnQgaXMgYXNzdW1lZCB0byBiZSBjb250aWd1b3VzIHdpdGggbGFzdCBvbmVcbiAgICAgICAgICBpZihhYnNkZWx0YSA+IDEgJiYgYWJzZGVsdGEgPCAzMDApIHtcbiAgICAgICAgICAgIGlmKGRlbHRhID4gMCkge1xuICAgICAgICAgICAgICBsb2dnZXIubG9nKGBBQUM6JHtkZWx0YX0gbXMgaG9sZSBiZXR3ZWVuIGZyYWdtZW50cyBkZXRlY3RlZCxmaWxsaW5nIGl0YCk7XG4gICAgICAgICAgICAgIC8vIHNldCBQVFMgdG8gbmV4dCBQVFMsIGFuZCBlbnN1cmUgUFRTIGlzIGdyZWF0ZXIgb3IgZXF1YWwgdGhhbiBsYXN0IERUU1xuICAgICAgICAgICAgICBwdHNub3JtID0gTWF0aC5tYXgodGhpcy5uZXh0QWFjUHRzLCB0aGlzLmxhc3RBYWNEdHMpO1xuICAgICAgICAgICAgICBkdHNub3JtID0gcHRzbm9ybTtcbiAgICAgICAgICAgICAgLy9sb2dnZXIubG9nKCdBdWRpby9QVFMvRFRTIGFkanVzdGVkOicgKyBhYWNTYW1wbGUucHRzICsgJy8nICsgYWFjU2FtcGxlLmR0cyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsb2dnZXIubG9nKGBBQUM6JHsoLWRlbHRhKX0gbXMgb3ZlcmxhcHBpbmcgYmV0d2VlbiBmcmFnbWVudHMgZGV0ZWN0ZWRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoYWJzZGVsdGEpIHtcbiAgICAgICAgICAgIC8vIG5vdCBjb250aWd1b3VzIHRpbWVzdGFtcCwgY2hlY2sgaWYgUFRTIGlzIHdpdGhpbiBhY2NlcHRhYmxlIHJhbmdlXG4gICAgICAgICAgICB2YXIgZXhwZWN0ZWRQVFMgPSB0aGlzLlBFU19USU1FU0NBTEUqdGhpcy50aW1lT2Zmc2V0O1xuICAgICAgICAgICAgLy9sb2dnZXIubG9nKGBleHBlY3RlZFBUUy9QVFNub3JtOiR7ZXhwZWN0ZWRQVFN9LyR7cHRzbm9ybX0vJHtleHBlY3RlZFBUUy1wdHNub3JtfWApO1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYW55IHVuZXhwZWN0ZWQgZHJpZnQgYmV0d2VlbiBleHBlY3RlZCB0aW1lc3RhbXAgYW5kIHJlYWwgb25lXG4gICAgICAgICAgICBpZihNYXRoLmFicyhleHBlY3RlZFBUUyAtIHB0c25vcm0pID4gdGhpcy5QRVNfVElNRVNDQUxFKjM2MDAgKSB7XG4gICAgICAgICAgICAgIC8vbG9nZ2VyLmxvZyhgUFRTIGxvb3BpbmcgPz8/IEFBQyBQVFMgZGVsdGE6JHtleHBlY3RlZFBUUy1wdHNub3JtfWApO1xuICAgICAgICAgICAgICB2YXIgcHRzT2Zmc2V0ID0gZXhwZWN0ZWRQVFMtcHRzbm9ybTtcbiAgICAgICAgICAgICAgLy8gc2V0IFBUUyB0byBuZXh0IGV4cGVjdGVkIFBUUztcbiAgICAgICAgICAgICAgcHRzbm9ybSA9IGV4cGVjdGVkUFRTO1xuICAgICAgICAgICAgICBkdHNub3JtID0gcHRzbm9ybTtcbiAgICAgICAgICAgICAgLy8gb2Zmc2V0IGluaXRQVFMvaW5pdERUUyB0byBmaXggY29tcHV0YXRpb24gZm9yIGZvbGxvd2luZyBzYW1wbGVzXG4gICAgICAgICAgICAgIHRoaXMuX2luaXRQVFMtPXB0c09mZnNldDtcbiAgICAgICAgICAgICAgdGhpcy5faW5pdERUUy09cHRzT2Zmc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyByZW1lbWJlciBmaXJzdCBQVFMgb2Ygb3VyIGFhY1NhbXBsZXMsIGVuc3VyZSB2YWx1ZSBpcyBwb3NpdGl2ZVxuICAgICAgICBmaXJzdFBUUyA9IE1hdGgubWF4KDAscHRzbm9ybSk7XG4gICAgICAgIGZpcnN0RFRTID0gTWF0aC5tYXgoMCxkdHNub3JtKTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coYFBUUy9EVFMvaW5pdERUUy9ub3JtUFRTL25vcm1EVFMvcmVsYXRpdmUgUFRTIDogJHthYWNTYW1wbGUucHRzfS8ke2FhY1NhbXBsZS5kdHN9LyR7dGhpcy5faW5pdERUU30vJHtwdHNub3JtfS8ke2R0c25vcm19LyR7KGFhY1NhbXBsZS5wdHMvNDI5NDk2NzI5NikudG9GaXhlZCgzKX1gKTtcbiAgICAgIG1wNFNhbXBsZSA9IHtcbiAgICAgICAgc2l6ZTogdW5pdC5ieXRlTGVuZ3RoLFxuICAgICAgICBjdHM6IDAsXG4gICAgICAgIGR1cmF0aW9uOjAsXG4gICAgICAgIGZsYWdzOiB7XG4gICAgICAgICAgaXNMZWFkaW5nOiAwLFxuICAgICAgICAgIGlzRGVwZW5kZWRPbjogMCxcbiAgICAgICAgICBoYXNSZWR1bmRhbmN5OiAwLFxuICAgICAgICAgIGRlZ3JhZFByaW86IDAsXG4gICAgICAgICAgZGVwZW5kc09uIDogMSxcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNhbXBsZXMucHVzaChtcDRTYW1wbGUpO1xuICAgICAgbGFzdFNhbXBsZURUUyA9IGR0c25vcm07XG4gICAgfVxuICAgIC8vc2V0IGxhc3Qgc2FtcGxlIGR1cmF0aW9uIGFzIGJlaW5nIGlkZW50aWNhbCB0byBwcmV2aW91cyBzYW1wbGVcbiAgICBpZihzYW1wbGVzLmxlbmd0aCA+PTIpIHtcbiAgICAgIG1wNFNhbXBsZS5kdXJhdGlvbiA9IHNhbXBsZXNbc2FtcGxlcy5sZW5ndGgtMl0uZHVyYXRpb247XG4gICAgfVxuICAgIHRoaXMubGFzdEFhY0R0cyA9IGR0c25vcm07XG4gICAgLy8gbmV4dCBhYWMgc2FtcGxlIFBUUyBzaG91bGQgYmUgZXF1YWwgdG8gbGFzdCBzYW1wbGUgUFRTICsgZHVyYXRpb25cbiAgICB0aGlzLm5leHRBYWNQdHMgPSBwdHNub3JtICsgdGhpcy5QRVMyTVA0U0NBTEVGQUNUT1IqbXA0U2FtcGxlLmR1cmF0aW9uO1xuICAgIC8vbG9nZ2VyLmxvZygnQXVkaW8vUFRTL1BUU2VuZDonICsgYWFjU2FtcGxlLnB0cy50b0ZpeGVkKDApICsgJy8nICsgdGhpcy5uZXh0QWFjRHRzLnRvRml4ZWQoMCkpO1xuXG4gICAgdGhpcy5fYWFjU2FtcGxlc0xlbmd0aCA9IDA7XG4gICAgdHJhY2suc2FtcGxlcyA9IHNhbXBsZXM7XG4gICAgbW9vZiA9IE1QNC5tb29mKHRyYWNrLnNlcXVlbmNlTnVtYmVyKyssZmlyc3REVFMvdGhpcy5QRVMyTVA0U0NBTEVGQUNUT1IsdHJhY2spO1xuICAgIHRyYWNrLnNhbXBsZXMgPSBbXTtcbiAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkZSQUdfUEFSU0lOR19EQVRBLHtcbiAgICAgIG1vb2Y6IG1vb2YsXG4gICAgICBtZGF0OiBtZGF0LFxuICAgICAgc3RhcnRQVFMgOiBmaXJzdFBUUy90aGlzLlBFU19USU1FU0NBTEUsXG4gICAgICBlbmRQVFMgOiB0aGlzLm5leHRBYWNQdHMvdGhpcy5QRVNfVElNRVNDQUxFLFxuICAgICAgc3RhcnREVFMgOiBmaXJzdERUUy90aGlzLlBFU19USU1FU0NBTEUsXG4gICAgICBlbmREVFMgOiAoZHRzbm9ybSArIHRoaXMuUEVTMk1QNFNDQUxFRkFDVE9SKm1wNFNhbXBsZS5kdXJhdGlvbikvdGhpcy5QRVNfVElNRVNDQUxFLFxuICAgICAgdHlwZSA6ICdhdWRpbycsXG4gICAgICBuYiA6IHNhbXBsZXMubGVuZ3RoXG4gICAgfSk7XG4gIH1cblxuICBfQURUU3RvQXVkaW9Db25maWcoZGF0YSxvZmZzZXQsYXVkaW9Db2RlYykge1xuICAgIHZhciBhZHRzT2JqZWN0VHlwZSwgLy8gOmludFxuICAgICAgICBhZHRzU2FtcGxlaW5nSW5kZXgsIC8vIDppbnRcbiAgICAgICAgYWR0c0V4dGVuc2lvblNhbXBsZWluZ0luZGV4LCAvLyA6aW50XG4gICAgICAgIGFkdHNDaGFuZWxDb25maWcsIC8vIDppbnRcbiAgICAgICAgY29uZmlnLFxuICAgICAgICB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCksXG4gICAgICAgIGFkdHNTYW1wbGVpbmdSYXRlcyA9IFtcbiAgICAgICAgICAgIDk2MDAwLCA4ODIwMCxcbiAgICAgICAgICAgIDY0MDAwLCA0ODAwMCxcbiAgICAgICAgICAgIDQ0MTAwLCAzMjAwMCxcbiAgICAgICAgICAgIDI0MDAwLCAyMjA1MCxcbiAgICAgICAgICAgIDE2MDAwLCAxMjAwMFxuICAgICAgICAgIF07XG5cbiAgICAvLyBieXRlIDJcbiAgICBhZHRzT2JqZWN0VHlwZSA9ICgoZGF0YVtvZmZzZXQrMl0gJiAweEMwKSA+Pj4gNikgKyAxO1xuICAgIGFkdHNTYW1wbGVpbmdJbmRleCA9ICgoZGF0YVtvZmZzZXQrMl0gJiAweDNDKSA+Pj4gMik7XG4gICAgYWR0c0NoYW5lbENvbmZpZyA9ICgoZGF0YVtvZmZzZXQrMl0gJiAweDAxKSA8PCAyKTtcbiAgICAvLyBieXRlIDNcbiAgICBhZHRzQ2hhbmVsQ29uZmlnIHw9ICgoZGF0YVtvZmZzZXQrM10gJiAweEMwKSA+Pj4gNik7XG5cbiAgICBsb2dnZXIubG9nKGBtYW5pZmVzdCBjb2RlYzoke2F1ZGlvQ29kZWN9LEFEVFMgZGF0YTp0eXBlOiR7YWR0c09iamVjdFR5cGV9LHNhbXBsZWluZ0luZGV4OiR7YWR0c1NhbXBsZWluZ0luZGV4fVske2FkdHNTYW1wbGVpbmdSYXRlc1thZHRzU2FtcGxlaW5nSW5kZXhdfWtIel0sY2hhbm5lbENvbmZpZzoke2FkdHNDaGFuZWxDb25maWd9YCk7XG5cblxuICAgIC8vIGZpcmVmb3g6IGZyZXEgbGVzcyB0aGFuIDI0a0h6ID0gQUFDIFNCUiAoSEUtQUFDKVxuICAgIGlmKHVzZXJBZ2VudC5pbmRleE9mKCdmaXJlZm94JykgIT09IC0xKSB7XG4gICAgICBpZihhZHRzU2FtcGxlaW5nSW5kZXggPj02KSB7XG4gICAgICAgIGFkdHNPYmplY3RUeXBlID0gNTtcbiAgICAgICAgY29uZmlnID0gbmV3IEFycmF5KDQpO1xuICAgICAgICAvLyBIRS1BQUMgdXNlcyBTQlIgKFNwZWN0cmFsIEJhbmQgUmVwbGljYXRpb24pICwgaGlnaCBmcmVxdWVuY2llcyBhcmUgY29uc3RydWN0ZWQgZnJvbSBsb3cgZnJlcXVlbmNpZXNcbiAgICAgICAgLy8gdGhlcmUgaXMgYSBmYWN0b3IgMiBiZXR3ZWVuIGZyYW1lIHNhbXBsZSByYXRlIGFuZCBvdXRwdXQgc2FtcGxlIHJhdGVcbiAgICAgICAgLy8gbXVsdGlwbHkgZnJlcXVlbmN5IGJ5IDIgKHNlZSB0YWJsZSBiZWxvdywgZXF1aXZhbGVudCB0byBzdWJzdHJhY3QgMylcbiAgICAgICAgYWR0c0V4dGVuc2lvblNhbXBsZWluZ0luZGV4ID0gYWR0c1NhbXBsZWluZ0luZGV4LTM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZHRzT2JqZWN0VHlwZSA9IDI7XG4gICAgICAgIGNvbmZpZyA9IG5ldyBBcnJheSgyKTtcbiAgICAgICAgYWR0c0V4dGVuc2lvblNhbXBsZWluZ0luZGV4ID0gYWR0c1NhbXBsZWluZ0luZGV4O1xuICAgICAgfVxuICAgICAgLy8gQW5kcm9pZCA6IGFsd2F5cyB1c2UgQUFDXG4gICAgfSBlbHNlIGlmKHVzZXJBZ2VudC5pbmRleE9mKCdhbmRyb2lkJykgIT09IC0xKSB7XG4gICAgICBhZHRzT2JqZWN0VHlwZSA9IDI7XG4gICAgICBjb25maWcgPSBuZXcgQXJyYXkoMik7XG4gICAgICBhZHRzRXh0ZW5zaW9uU2FtcGxlaW5nSW5kZXggPSBhZHRzU2FtcGxlaW5nSW5kZXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qICBmb3Igb3RoZXIgYnJvd3NlcnMgKGNocm9tZSAuLi4pXG4gICAgICAgICAgYWx3YXlzIGZvcmNlIGF1ZGlvIHR5cGUgdG8gYmUgSEUtQUFDIFNCUiwgYXMgc29tZSBicm93c2VycyBkbyBub3Qgc3VwcG9ydCBhdWRpbyBjb2RlYyBzd2l0Y2ggcHJvcGVybHkgKGxpa2UgQ2hyb21lIC4uLilcbiAgICAgICovXG4gICAgICAgIGFkdHNPYmplY3RUeXBlID0gNTtcbiAgICAgICAgY29uZmlnID0gbmV3IEFycmF5KDQpO1xuICAgICAgIC8vIGlmIChtYW5pZmVzdCBjb2RlYyBpcyBIRS1BQUMpIE9SIChtYW5pZmVzdCBjb2RlYyBub3Qgc3BlY2lmaWVkIEFORCBmcmVxdWVuY3kgbGVzcyB0aGFuIDI0a0h6KVxuICAgICAgaWYoKGF1ZGlvQ29kZWMgJiYgYXVkaW9Db2RlYy5pbmRleE9mKCdtcDRhLjQwLjUnKSAhPT0tMSkgfHwgKCFhdWRpb0NvZGVjICYmIGFkdHNTYW1wbGVpbmdJbmRleCA+PTYpKSAge1xuICAgICAgICAvLyBIRS1BQUMgdXNlcyBTQlIgKFNwZWN0cmFsIEJhbmQgUmVwbGljYXRpb24pICwgaGlnaCBmcmVxdWVuY2llcyBhcmUgY29uc3RydWN0ZWQgZnJvbSBsb3cgZnJlcXVlbmNpZXNcbiAgICAgICAgLy8gdGhlcmUgaXMgYSBmYWN0b3IgMiBiZXR3ZWVuIGZyYW1lIHNhbXBsZSByYXRlIGFuZCBvdXRwdXQgc2FtcGxlIHJhdGVcbiAgICAgICAgLy8gbXVsdGlwbHkgZnJlcXVlbmN5IGJ5IDIgKHNlZSB0YWJsZSBiZWxvdywgZXF1aXZhbGVudCB0byBzdWJzdHJhY3QgMylcbiAgICAgICAgYWR0c0V4dGVuc2lvblNhbXBsZWluZ0luZGV4ID0gYWR0c1NhbXBsZWluZ0luZGV4IC0gMztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiAobWFuaWZlc3QgY29kZWMgaXMgQUFDKSBBTkQgKGZyZXF1ZW5jeSBsZXNzIHRoYW4gMjRrSHogT1IgbmIgY2hhbm5lbCBpcyAxKVxuICAgICAgICBpZihhdWRpb0NvZGVjICYmIGF1ZGlvQ29kZWMuaW5kZXhPZignbXA0YS40MC4yJykgIT09LTEgJiYgKGFkdHNTYW1wbGVpbmdJbmRleCA+PSA2IHx8IGFkdHNDaGFuZWxDb25maWcgPT09MSkpIHtcbiAgICAgICAgICBhZHRzT2JqZWN0VHlwZSA9IDI7XG4gICAgICAgICAgY29uZmlnID0gbmV3IEFycmF5KDIpO1xuICAgICAgICB9XG4gICAgICAgIGFkdHNFeHRlbnNpb25TYW1wbGVpbmdJbmRleCA9IGFkdHNTYW1wbGVpbmdJbmRleDtcbiAgICAgIH1cbiAgICB9XG4gIC8qIHJlZmVyIHRvIGh0dHA6Ly93aWtpLm11bHRpbWVkaWEuY3gvaW5kZXgucGhwP3RpdGxlPU1QRUctNF9BdWRpbyNBdWRpb19TcGVjaWZpY19Db25maWdcbiAgICAgIElTTyAxNDQ5Ni0zIChBQUMpLnBkZiAtIFRhYmxlIDEuMTMg4oCUIFN5bnRheCBvZiBBdWRpb1NwZWNpZmljQ29uZmlnKClcbiAgICBBdWRpbyBQcm9maWxlIC8gQXVkaW8gT2JqZWN0IFR5cGVcbiAgICAwOiBOdWxsXG4gICAgMTogQUFDIE1haW5cbiAgICAyOiBBQUMgTEMgKExvdyBDb21wbGV4aXR5KVxuICAgIDM6IEFBQyBTU1IgKFNjYWxhYmxlIFNhbXBsZSBSYXRlKVxuICAgIDQ6IEFBQyBMVFAgKExvbmcgVGVybSBQcmVkaWN0aW9uKVxuICAgIDU6IFNCUiAoU3BlY3RyYWwgQmFuZCBSZXBsaWNhdGlvbilcbiAgICA2OiBBQUMgU2NhbGFibGVcbiAgIHNhbXBsaW5nIGZyZXFcbiAgICAwOiA5NjAwMCBIelxuICAgIDE6IDg4MjAwIEh6XG4gICAgMjogNjQwMDAgSHpcbiAgICAzOiA0ODAwMCBIelxuICAgIDQ6IDQ0MTAwIEh6XG4gICAgNTogMzIwMDAgSHpcbiAgICA2OiAyNDAwMCBIelxuICAgIDc6IDIyMDUwIEh6XG4gICAgODogMTYwMDAgSHpcbiAgICA5OiAxMjAwMCBIelxuICAgIDEwOiAxMTAyNSBIelxuICAgIDExOiA4MDAwIEh6XG4gICAgMTI6IDczNTAgSHpcbiAgICAxMzogUmVzZXJ2ZWRcbiAgICAxNDogUmVzZXJ2ZWRcbiAgICAxNTogZnJlcXVlbmN5IGlzIHdyaXR0ZW4gZXhwbGljdGx5XG4gICAgQ2hhbm5lbCBDb25maWd1cmF0aW9uc1xuICAgIFRoZXNlIGFyZSB0aGUgY2hhbm5lbCBjb25maWd1cmF0aW9uczpcbiAgICAwOiBEZWZpbmVkIGluIEFPVCBTcGVjaWZjIENvbmZpZ1xuICAgIDE6IDEgY2hhbm5lbDogZnJvbnQtY2VudGVyXG4gICAgMjogMiBjaGFubmVsczogZnJvbnQtbGVmdCwgZnJvbnQtcmlnaHRcbiAgKi9cbiAgICAvLyBhdWRpb09iamVjdFR5cGUgPSBwcm9maWxlID0+IHByb2ZpbGUsIHRoZSBNUEVHLTQgQXVkaW8gT2JqZWN0IFR5cGUgbWludXMgMVxuICAgIGNvbmZpZ1swXSA9IGFkdHNPYmplY3RUeXBlIDw8IDM7XG4gICAgLy8gc2FtcGxpbmdGcmVxdWVuY3lJbmRleFxuICAgIGNvbmZpZ1swXSB8PSAoYWR0c1NhbXBsZWluZ0luZGV4ICYgMHgwRSkgPj4gMTtcbiAgICBjb25maWdbMV0gfD0gKGFkdHNTYW1wbGVpbmdJbmRleCAmIDB4MDEpIDw8IDc7XG4gICAgLy8gY2hhbm5lbENvbmZpZ3VyYXRpb25cbiAgICBjb25maWdbMV0gfD0gYWR0c0NoYW5lbENvbmZpZyA8PCAzO1xuICAgIGlmKGFkdHNPYmplY3RUeXBlID09PSA1KSB7XG4gICAgICAvLyBhZHRzRXh0ZW5zaW9uU2FtcGxlaW5nSW5kZXhcbiAgICAgIGNvbmZpZ1sxXSB8PSAoYWR0c0V4dGVuc2lvblNhbXBsZWluZ0luZGV4ICYgMHgwRSkgPj4gMTtcbiAgICAgIGNvbmZpZ1syXSA9IChhZHRzRXh0ZW5zaW9uU2FtcGxlaW5nSW5kZXggJiAweDAxKSA8PCA3O1xuICAgICAgLy8gYWR0c09iamVjdFR5cGUgKGZvcmNlIHRvIDIsIGNocm9tZSBpcyBjaGVja2luZyB0aGF0IG9iamVjdCB0eXBlIGlzIGxlc3MgdGhhbiA1ID8/P1xuICAgICAgLy8gICAgaHR0cHM6Ly9jaHJvbWl1bS5nb29nbGVzb3VyY2UuY29tL2Nocm9taXVtL3NyYy5naXQvKy9tYXN0ZXIvbWVkaWEvZm9ybWF0cy9tcDQvYWFjLmNjXG4gICAgICBjb25maWdbMl0gfD0gMiA8PCAyO1xuICAgICAgY29uZmlnWzNdID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHsgY29uZmlnIDogY29uZmlnLCBzYW1wbGVyYXRlIDogYWR0c1NhbXBsZWluZ1JhdGVzW2FkdHNTYW1wbGVpbmdJbmRleF0sIGNoYW5uZWxDb3VudCA6IGFkdHNDaGFuZWxDb25maWcsIGNvZGVjIDogKCdtcDRhLjQwLicgKyBhZHRzT2JqZWN0VHlwZSl9O1xuICB9XG5cbiAgX2dlbmVyYXRlSW5pdFNlZ21lbnQoKSB7XG4gICAgaWYodGhpcy5fYXZjSWQgPT09IC0xKSB7XG4gICAgICAvL2F1ZGlvIG9ubHlcbiAgICAgIGlmKHRoaXMuX2FhY1RyYWNrLmNvbmZpZykge1xuICAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX1BBUlNJTkdfSU5JVF9TRUdNRU5ULHtcbiAgICAgICAgICBhdWRpb01vb3Y6IE1QNC5pbml0U2VnbWVudChbdGhpcy5fYWFjVHJhY2tdKSxcbiAgICAgICAgICBhdWRpb0NvZGVjIDogdGhpcy5fYWFjVHJhY2suY29kZWMsXG4gICAgICAgICAgYXVkaW9DaGFubmVsQ291bnQgOiB0aGlzLl9hYWNUcmFjay5jaGFubmVsQ291bnRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2luaXRTZWdHZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYodGhpcy5faW5pdFBUUyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIHJlbWVtYmVyIGZpcnN0IFBUUyBvZiB0aGlzIGRlbXV4aW5nIGNvbnRleHRcbiAgICAgICAgdGhpcy5faW5pdFBUUyA9IHRoaXMuX2FhY1NhbXBsZXNbMF0ucHRzIC0gdGhpcy5QRVNfVElNRVNDQUxFKnRoaXMudGltZU9mZnNldDtcbiAgICAgICAgdGhpcy5faW5pdERUUyA9IHRoaXMuX2FhY1NhbXBsZXNbMF0uZHRzIC0gdGhpcy5QRVNfVElNRVNDQUxFKnRoaXMudGltZU9mZnNldDtcbiAgICAgIH1cbiAgICB9IGVsc2VcbiAgICBpZih0aGlzLl9hYWNJZCA9PT0gLTEpIHtcbiAgICAgIC8vdmlkZW8gb25seVxuICAgICAgaWYodGhpcy5fYXZjVHJhY2suc3BzICYmIHRoaXMuX2F2Y1RyYWNrLnBwcykge1xuICAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX1BBUlNJTkdfSU5JVF9TRUdNRU5ULHtcbiAgICAgICAgICB2aWRlb01vb3Y6IE1QNC5pbml0U2VnbWVudChbdGhpcy5fYXZjVHJhY2tdKSxcbiAgICAgICAgICB2aWRlb0NvZGVjIDogdGhpcy5fYXZjVHJhY2suY29kZWMsXG4gICAgICAgICAgdmlkZW9XaWR0aCA6IHRoaXMuX2F2Y1RyYWNrLndpZHRoLFxuICAgICAgICAgIHZpZGVvSGVpZ2h0IDogdGhpcy5fYXZjVHJhY2suaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9pbml0U2VnR2VuZXJhdGVkID0gdHJ1ZTtcbiAgICAgICAgaWYodGhpcy5faW5pdFBUUyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gcmVtZW1iZXIgZmlyc3QgUFRTIG9mIHRoaXMgZGVtdXhpbmcgY29udGV4dFxuICAgICAgICAgIHRoaXMuX2luaXRQVFMgPSB0aGlzLl9hdmNTYW1wbGVzWzBdLnB0cyAtIHRoaXMuUEVTX1RJTUVTQ0FMRSp0aGlzLnRpbWVPZmZzZXQ7XG4gICAgICAgICAgdGhpcy5faW5pdERUUyA9IHRoaXMuX2F2Y1NhbXBsZXNbMF0uZHRzIC0gdGhpcy5QRVNfVElNRVNDQUxFKnRoaXMudGltZU9mZnNldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvL2F1ZGlvIGFuZCB2aWRlb1xuICAgICAgaWYodGhpcy5fYWFjVHJhY2suY29uZmlnICYmIHRoaXMuX2F2Y1RyYWNrLnNwcyAmJiB0aGlzLl9hdmNUcmFjay5wcHMpIHtcbiAgICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRlJBR19QQVJTSU5HX0lOSVRfU0VHTUVOVCx7XG4gICAgICAgICAgYXVkaW9Nb292OiBNUDQuaW5pdFNlZ21lbnQoW3RoaXMuX2FhY1RyYWNrXSksXG4gICAgICAgICAgYXVkaW9Db2RlYyA6IHRoaXMuX2FhY1RyYWNrLmNvZGVjLFxuICAgICAgICAgIGF1ZGlvQ2hhbm5lbENvdW50IDogdGhpcy5fYWFjVHJhY2suY2hhbm5lbENvdW50LFxuICAgICAgICAgIHZpZGVvTW9vdjogTVA0LmluaXRTZWdtZW50KFt0aGlzLl9hdmNUcmFja10pLFxuICAgICAgICAgIHZpZGVvQ29kZWMgOiB0aGlzLl9hdmNUcmFjay5jb2RlYyxcbiAgICAgICAgICB2aWRlb1dpZHRoIDogdGhpcy5fYXZjVHJhY2sud2lkdGgsXG4gICAgICAgICAgdmlkZW9IZWlnaHQgOiB0aGlzLl9hdmNUcmFjay5oZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2luaXRTZWdHZW5lcmF0ZWQgPSB0cnVlO1xuICAgICAgICBpZih0aGlzLl9pbml0UFRTID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyByZW1lbWJlciBmaXJzdCBQVFMgb2YgdGhpcyBkZW11eGluZyBjb250ZXh0XG4gICAgICAgICAgdGhpcy5faW5pdFBUUyA9IE1hdGgubWluKHRoaXMuX2F2Y1NhbXBsZXNbMF0ucHRzLHRoaXMuX2FhY1NhbXBsZXNbMF0ucHRzKSAtIHRoaXMuUEVTX1RJTUVTQ0FMRSp0aGlzLnRpbWVPZmZzZXQ7XG4gICAgICAgICAgdGhpcy5faW5pdERUUyA9IE1hdGgubWluKHRoaXMuX2F2Y1NhbXBsZXNbMF0uZHRzLHRoaXMuX2FhY1NhbXBsZXNbMF0uZHRzKSAtIHRoaXMuUEVTX1RJTUVTQ0FMRSp0aGlzLnRpbWVPZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVFNEZW11eGVyO1xuIiwiIGltcG9ydCBFdmVudCAgICAgICAgICAgICAgICBmcm9tICcuLi9ldmVudHMnO1xuIGltcG9ydCBUU0RlbXV4ZXIgICAgICAgICAgICBmcm9tICcuLi9kZW11eC90c2RlbXV4ZXInO1xuIGltcG9ydCBvYnNlcnZlciAgICAgICAgICAgICBmcm9tICcuLi9vYnNlcnZlcic7XG5cbnZhciBUU0RlbXV4ZXJXb3JrZXIgPSBmdW5jdGlvbiAoc2VsZikge1xuICAgIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsZnVuY3Rpb24gKGV2KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdkZW11eGVyIGNtZDonICsgZXYuZGF0YS5jbWQpO1xuICAgICAgc3dpdGNoKGV2LmRhdGEuY21kKSB7XG4gICAgICAgIGNhc2UgJ2luaXQnOlxuICAgICAgICAgIHNlbGYuZGVtdXhlciA9IG5ldyBUU0RlbXV4ZXIoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVtdXgnOlxuICAgICAgICAgIHNlbGYuZGVtdXhlci5wdXNoKG5ldyBVaW50OEFycmF5KGV2LmRhdGEuZGF0YSksIGV2LmRhdGEuYXVkaW9Db2RlYyxldi5kYXRhLnZpZGVvQ29kZWMsIGV2LmRhdGEudGltZU9mZnNldCwgZXYuZGF0YS5jYywgZXYuZGF0YS5sZXZlbCwgZXYuZGF0YS5kdXJhdGlvbik7XG4gICAgICAgICAgc2VsZi5kZW11eGVyLmVuZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gbGlzdGVuIHRvIGV2ZW50cyB0cmlnZ2VyZWQgYnkgVFMgRGVtdXhlclxuICAgIG9ic2VydmVyLm9uKEV2ZW50LkZSQUdfUEFSU0lOR19JTklUX1NFR01FTlQsIGZ1bmN0aW9uKGV2LGRhdGEpIHtcbiAgICAgIHZhciBvYmpEYXRhID0geyBldmVudCA6IGV2IH07XG4gICAgICB2YXIgb2JqVHJhbnNmZXJhYmxlID0gW107XG4gICAgICBpZihkYXRhLmF1ZGlvQ29kZWMpIHtcbiAgICAgICAgb2JqRGF0YS5hdWRpb0NvZGVjID0gZGF0YS5hdWRpb0NvZGVjO1xuICAgICAgICBvYmpEYXRhLmF1ZGlvTW9vdiA9IGRhdGEuYXVkaW9Nb292LmJ1ZmZlcjtcbiAgICAgICAgb2JqRGF0YS5hdWRpb0NoYW5uZWxDb3VudCA9IGRhdGEuYXVkaW9DaGFubmVsQ291bnQ7XG4gICAgICAgIG9ialRyYW5zZmVyYWJsZS5wdXNoKG9iakRhdGEuYXVkaW9Nb292KTtcbiAgICAgIH1cbiAgICAgIGlmKGRhdGEudmlkZW9Db2RlYykge1xuICAgICAgICBvYmpEYXRhLnZpZGVvQ29kZWMgPSBkYXRhLnZpZGVvQ29kZWM7XG4gICAgICAgIG9iakRhdGEudmlkZW9Nb292ID0gZGF0YS52aWRlb01vb3YuYnVmZmVyO1xuICAgICAgICBvYmpEYXRhLnZpZGVvV2lkdGggPSBkYXRhLnZpZGVvV2lkdGg7XG4gICAgICAgIG9iakRhdGEudmlkZW9IZWlnaHQgPSBkYXRhLnZpZGVvSGVpZ2h0O1xuICAgICAgICBvYmpUcmFuc2ZlcmFibGUucHVzaChvYmpEYXRhLnZpZGVvTW9vdik7XG4gICAgICB9XG4gICAgICAvLyBwYXNzIG1vb3YgYXMgdHJhbnNmZXJhYmxlIG9iamVjdCAobm8gY29weSlcbiAgICAgIHNlbGYucG9zdE1lc3NhZ2Uob2JqRGF0YSxvYmpUcmFuc2ZlcmFibGUpO1xuICAgIH0pO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50LkZSQUdfUEFSU0lOR19EQVRBLCBmdW5jdGlvbihldixkYXRhKSB7XG4gICAgICB2YXIgb2JqRGF0YSA9IHsgZXZlbnQgOiBldiAsIHR5cGUgOiBkYXRhLnR5cGUsIHN0YXJ0UFRTIDogZGF0YS5zdGFydFBUUywgZW5kUFRTIDogZGF0YS5lbmRQVFMgLCBzdGFydERUUyA6IGRhdGEuc3RhcnREVFMsIGVuZERUUyA6IGRhdGEuZW5kRFRTICxtb29mIDogZGF0YS5tb29mLmJ1ZmZlciwgbWRhdCA6IGRhdGEubWRhdC5idWZmZXIsIG5iIDogZGF0YS5uYn07XG4gICAgICAvLyBwYXNzIG1vb2YvbWRhdCBkYXRhIGFzIHRyYW5zZmVyYWJsZSBvYmplY3QgKG5vIGNvcHkpXG4gICAgICBzZWxmLnBvc3RNZXNzYWdlKG9iakRhdGEsW29iakRhdGEubW9vZixvYmpEYXRhLm1kYXRdKTtcbiAgICB9KTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5GUkFHX1BBUlNFRCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHNlbGYucG9zdE1lc3NhZ2Uoe2V2ZW50OmV2ZW50fSk7XG4gICAgfSk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuRVJST1IsIGZ1bmN0aW9uKGV2ZW50LGRhdGEpIHtcbiAgICAgIHNlbGYucG9zdE1lc3NhZ2Uoe2V2ZW50OmV2ZW50LGRhdGE6ZGF0YX0pO1xuICAgIH0pO1xuICB9O1xuXG5leHBvcnQgZGVmYXVsdCBUU0RlbXV4ZXJXb3JrZXI7XG5cbiIsIlxuZXhwb3J0IHZhciBFcnJvclR5cGVzID0ge1xuICAvLyBJZGVudGlmaWVyIGZvciBhIG5ldHdvcmsgZXJyb3IgKGxvYWRpbmcgZXJyb3IgLyB0aW1lb3V0IC4uLilcbiAgTkVUV09SS19FUlJPUiA6ICAnaGxzTmV0d29ya0Vycm9yJyxcbiAgLy8gSWRlbnRpZmllciBmb3IgYSBtZWRpYSBFcnJvciAodmlkZW8vcGFyc2luZy9tZWRpYXNvdXJjZSBlcnJvcilcbiAgTUVESUFfRVJST1IgOiAgJ2hsc01lZGlhRXJyb3InLFxuICAvLyBJZGVudGlmaWVyIGZvciBhbGwgb3RoZXIgZXJyb3JzXG4gIE9USEVSX0VSUk9SIDogICdobHNPdGhlckVycm9yJ1xufTtcblxuZXhwb3J0IHZhciBFcnJvckRldGFpbHMgPSB7XG4gIC8vIElkZW50aWZpZXIgZm9yIGEgbWFuaWZlc3QgbG9hZCBlcnJvciAtIGRhdGE6IHsgdXJsIDogZmF1bHR5IFVSTCwgcmVzcG9uc2UgOiBYSFIgcmVzcG9uc2V9XG4gIE1BTklGRVNUX0xPQURfRVJST1IgOiAgJ21hbmlmZXN0TG9hZEVycm9yJyxcbiAgLy8gSWRlbnRpZmllciBmb3IgYSBtYW5pZmVzdCBsb2FkIHRpbWVvdXQgLSBkYXRhOiB7IHVybCA6IGZhdWx0eSBVUkwsIHJlc3BvbnNlIDogWEhSIHJlc3BvbnNlfVxuICBNQU5JRkVTVF9MT0FEX1RJTUVPVVQgOiAgJ21hbmlmZXN0TG9hZFRpbWVPdXQnLFxuICAvLyBJZGVudGlmaWVyIGZvciBhIG1hbmlmZXN0IHBhcnNpbmcgZXJyb3IgLSBkYXRhOiB7IHVybCA6IGZhdWx0eSBVUkwsIHJlYXNvbiA6IGVycm9yIHJlYXNvbn1cbiAgTUFOSUZFU1RfUEFSU0lOR19FUlJPUiA6ICAnbWFuaWZlc3RQYXJzaW5nRXJyb3InLFxuICAvLyBJZGVudGlmaWVyIGZvciBwbGF5bGlzdCBsb2FkIGVycm9yIC0gZGF0YTogeyB1cmwgOiBmYXVsdHkgVVJMLCByZXNwb25zZSA6IFhIUiByZXNwb25zZX1cbiAgTEVWRUxfTE9BRF9FUlJPUiA6ICAnbGV2ZWxMb2FkRXJyb3InLFxuICAvLyBJZGVudGlmaWVyIGZvciBwbGF5bGlzdCBsb2FkIHRpbWVvdXQgLSBkYXRhOiB7IHVybCA6IGZhdWx0eSBVUkwsIHJlc3BvbnNlIDogWEhSIHJlc3BvbnNlfVxuICBMRVZFTF9MT0FEX1RJTUVPVVQgOiAgJ2xldmVsTG9hZFRpbWVPdXQnLFxuICAvLyBJZGVudGlmaWVyIGZvciBhIGxldmVsIHN3aXRjaCBlcnJvciAtIGRhdGE6IHsgbGV2ZWwgOiBmYXVsdHkgbGV2ZWwgSWQsIGV2ZW50IDogZXJyb3IgZGVzY3JpcHRpb259XG4gIExFVkVMX1NXSVRDSF9FUlJPUiA6ICAnbGV2ZWxTd2l0Y2hFcnJvcicsXG4gIC8vIElkZW50aWZpZXIgZm9yIGZyYWdtZW50IGxvYWQgZXJyb3IgLSBkYXRhOiB7IGZyYWcgOiBmcmFnbWVudCBvYmplY3QsIHJlc3BvbnNlIDogWEhSIHJlc3BvbnNlfVxuICBGUkFHX0xPQURfRVJST1IgOiAgJ2ZyYWdMb2FkRXJyb3InLFxuICAvLyBJZGVudGlmaWVyIGZvciBmcmFnbWVudCBsb29wIGxvYWRpbmcgZXJyb3IgLSBkYXRhOiB7IGZyYWcgOiBmcmFnbWVudCBvYmplY3R9XG4gIEZSQUdfTE9PUF9MT0FESU5HX0VSUk9SIDogICdmcmFnTG9vcExvYWRpbmdFcnJvcicsXG4gIC8vIElkZW50aWZpZXIgZm9yIGZyYWdtZW50IGxvYWQgdGltZW91dCBlcnJvciAtIGRhdGE6IHsgZnJhZyA6IGZyYWdtZW50IG9iamVjdH1cbiAgRlJBR19MT0FEX1RJTUVPVVQgOiAgJ2ZyYWdMb2FkVGltZU91dCcsXG4gIC8vIElkZW50aWZpZXIgZm9yIGEgZnJhZ21lbnQgcGFyc2luZyBlcnJvciBldmVudCAtIGRhdGE6IHBhcnNpbmcgZXJyb3IgZGVzY3JpcHRpb25cbiAgRlJBR19QQVJTSU5HX0VSUk9SIDogICdmcmFnUGFyc2luZ0Vycm9yJyxcbiAgICAvLyBJZGVudGlmaWVyIGZvciBhIGZyYWdtZW50IGFwcGVuZGluZyBlcnJvciBldmVudCAtIGRhdGE6IGFwcGVuZGluZyBlcnJvciBkZXNjcmlwdGlvblxuICBGUkFHX0FQUEVORElOR19FUlJPUiA6ICAnZnJhZ0FwcGVuZGluZ0Vycm9yJ1xufTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gZmlyZWQgd2hlbiBNZWRpYVNvdXJjZSBoYXMgYmVlbiBzdWNjZXNmdWxseSBhdHRhY2hlZCB0byB2aWRlbyBlbGVtZW50IC0gZGF0YTogeyBtZWRpYVNvdXJjZSB9XG4gIE1TRV9BVFRBQ0hFRCA6ICdobHNNZWRpYVNvdXJjZUF0dGFjaGVkJyxcbiAgLy8gZmlyZWQgd2hlbiBNZWRpYVNvdXJjZSBoYXMgYmVlbiBkZXRhY2hlZCBmcm9tIHZpZGVvIGVsZW1lbnQgLSBkYXRhOiB7IH1cbiAgTVNFX0RFVEFDSEVEIDogJ2hsc01lZGlhU291cmNlRGV0YWNoZWQnLFxuICAvLyBmaXJlZCB0byBzaWduYWwgdGhhdCBhIG1hbmlmZXN0IGxvYWRpbmcgc3RhcnRzIC0gZGF0YTogeyB1cmwgOiBtYW5pZmVzdFVSTH1cbiAgTUFOSUZFU1RfTE9BRElORyAgOiAnaGxzTWFuaWZlc3RMb2FkaW5nJyxcbiAgLy8gZmlyZWQgYWZ0ZXIgbWFuaWZlc3QgaGFzIGJlZW4gbG9hZGVkIC0gZGF0YTogeyBsZXZlbHMgOiBbYXZhaWxhYmxlIHF1YWxpdHkgbGV2ZWxzXSAsIHVybCA6IG1hbmlmZXN0VVJMLCBzdGF0cyA6IHsgdHJlcXVlc3QsIHRmaXJzdCwgdGxvYWQsIG10aW1lfX1cbiAgTUFOSUZFU1RfTE9BREVEICA6ICdobHNNYW5pZmVzdExvYWRlZCcsXG4gIC8vIGZpcmVkIGFmdGVyIG1hbmlmZXN0IGhhcyBiZWVuIHBhcnNlZCAtIGRhdGE6IHsgbGV2ZWxzIDogW2F2YWlsYWJsZSBxdWFsaXR5IGxldmVsc10gLCBmaXJzdExldmVsIDogaW5kZXggb2YgZmlyc3QgcXVhbGl0eSBsZXZlbCBhcHBlYXJpbmcgaW4gTWFuaWZlc3R9XG4gIE1BTklGRVNUX1BBUlNFRCAgOiAnaGxzTWFuaWZlc3RQYXJzZWQnLFxuICAvLyBmaXJlZCB3aGVuIGEgbGV2ZWwgcGxheWxpc3QgbG9hZGluZyBzdGFydHMgLSBkYXRhOiB7IHVybCA6IGxldmVsIFVSTCAgbGV2ZWwgOiBpZCBvZiBsZXZlbCBiZWluZyBsb2FkZWR9XG4gIExFVkVMX0xPQURJTkcgICAgOiAnaGxzTGV2ZWxMb2FkaW5nJyxcbiAgLy8gZmlyZWQgd2hlbiBhIGxldmVsIHBsYXlsaXN0IGxvYWRpbmcgZmluaXNoZXMgLSBkYXRhOiB7IGRldGFpbHMgOiBsZXZlbERldGFpbHMgb2JqZWN0LCBsZXZlbCA6IGlkIG9mIGxvYWRlZCBsZXZlbCwgc3RhdHMgOiB7IHRyZXF1ZXN0LCB0Zmlyc3QsIHRsb2FkLCBtdGltZX0gfVxuICBMRVZFTF9MT0FERUQgOiAgJ2hsc0xldmVsTG9hZGVkJyxcbiAgLy8gZmlyZWQgd2hlbiBhIGxldmVsIHN3aXRjaCBpcyByZXF1ZXN0ZWQgLSBkYXRhOiB7IGxldmVsIDogaWQgb2YgbmV3IGxldmVsIH1cbiAgTEVWRUxfU1dJVENIIDogICdobHNMZXZlbFN3aXRjaCcsXG4gIC8vIGZpcmVkIHdoZW4gYSBmcmFnbWVudCBsb2FkaW5nIHN0YXJ0cyAtIGRhdGE6IHsgZnJhZyA6IGZyYWdtZW50IG9iamVjdH1cbiAgRlJBR19MT0FESU5HIDogICdobHNGcmFnTG9hZGluZycsXG4gIC8vIGZpcmVkIHdoZW4gYSBmcmFnbWVudCBsb2FkaW5nIGlzIHByb2dyZXNzaW5nIC0gZGF0YTogeyBmcmFnIDogZnJhZ21lbnQgb2JqZWN0LCB7IHRyZXF1ZXN0LCB0Zmlyc3QsIGxvYWRlZH19XG4gIEZSQUdfTE9BRF9QUk9HUkVTUyA6ICAnaGxzRnJhZ0xvYWRQcm9ncmVzcycsXG4gIC8vIElkZW50aWZpZXIgZm9yIGZyYWdtZW50IGxvYWQgYWJvcnRpbmcgZm9yIGVtZXJnZW5jeSBzd2l0Y2ggZG93biAtIGRhdGE6IHtmcmFnIDogZnJhZ21lbnQgb2JqZWN0fVxuICBGUkFHX0xPQURfRU1FUkdFTkNZX0FCT1JURUQgOiAgJ2hsc0ZyYWdMb2FkRW1lcmdlbmN5QWJvcnRlZCcsXG4gIC8vIGZpcmVkIHdoZW4gYSBmcmFnbWVudCBsb2FkaW5nIGlzIGNvbXBsZXRlZCAtIGRhdGE6IHsgZnJhZyA6IGZyYWdtZW50IG9iamVjdCwgcGF5bG9hZCA6IGZyYWdtZW50IHBheWxvYWQsIHN0YXRzIDogeyB0cmVxdWVzdCwgdGZpcnN0LCB0bG9hZCwgbGVuZ3RofX1cbiAgRlJBR19MT0FERUQgOiAgJ2hsc0ZyYWdMb2FkZWQnLFxuICAvLyBmaXJlZCB3aGVuIEluaXQgU2VnbWVudCBoYXMgYmVlbiBleHRyYWN0ZWQgZnJvbSBmcmFnbWVudCAtIGRhdGE6IHsgbW9vdiA6IG1vb3YgTVA0IGJveCwgY29kZWNzIDogY29kZWNzIGZvdW5kIHdoaWxlIHBhcnNpbmcgZnJhZ21lbnR9XG4gIEZSQUdfUEFSU0lOR19JTklUX1NFR01FTlQgOiAgJ2hsc0ZyYWdQYXJzaW5nSW5pdFNlZ21lbnQnLFxuICAvLyBmaXJlZCB3aGVuIG1vb2YvbWRhdCBoYXZlIGJlZW4gZXh0cmFjdGVkIGZyb20gZnJhZ21lbnQgLSBkYXRhOiB7IG1vb2YgOiBtb29mIE1QNCBib3gsIG1kYXQgOiBtZGF0IE1QNCBib3h9XG4gIEZSQUdfUEFSU0lOR19EQVRBIDogICdobHNGcmFnUGFyc2luZ0RhdGEnLFxuICAvLyBmaXJlZCB3aGVuIGZyYWdtZW50IHBhcnNpbmcgaXMgY29tcGxldGVkIC0gZGF0YTogdW5kZWZpbmVkXG4gIEZSQUdfUEFSU0VEIDogICdobHNGcmFnUGFyc2VkJyxcbiAgLy8gZmlyZWQgd2hlbiBmcmFnbWVudCByZW11eGVkIE1QNCBib3hlcyBoYXZlIGFsbCBiZWVuIGFwcGVuZGVkIGludG8gU291cmNlQnVmZmVyIC0gZGF0YTogeyBmcmFnIDogZnJhZ21lbnQgb2JqZWN0LCBzdGF0cyA6IHsgdHJlcXVlc3QsIHRmaXJzdCwgdGxvYWQsIHRwYXJzZWQsIHRidWZmZXJlZCwgbGVuZ3RofSB9XG4gIEZSQUdfQlVGRkVSRUQgOiAgJ2hsc0ZyYWdCdWZmZXJlZCcsXG4gIC8vIGZpcmVkIHdoZW4gZnJhZ21lbnQgbWF0Y2hpbmcgd2l0aCBjdXJyZW50IHZpZGVvIHBvc2l0aW9uIGlzIGNoYW5naW5nIC0gZGF0YSA6IHsgZnJhZyA6IGZyYWdtZW50IG9iamVjdCB9XG4gIEZSQUdfQ0hBTkdFRCA6ICAnaGxzRnJhZ0NoYW5nZWQnLFxuICAgIC8vIElkZW50aWZpZXIgZm9yIGEgRlBTIGRyb3AgZXZlbnQgLSBkYXRhOiB7Y3VyZW50RHJvcHBlZCwgY3VycmVudERlY29kZWQsIHRvdGFsRHJvcHBlZEZyYW1lc31cbiAgRlBTX0RST1AgOiAgJ2hsc0ZQU0Ryb3AnLFxuICAvLyBJZGVudGlmaWVyIGZvciBhbiBlcnJvciBldmVudCAtIGRhdGE6IHsgdHlwZSA6IGVycm9yIHR5cGUsIGRldGFpbHMgOiBlcnJvciBkZXRhaWxzLCBmYXRhbCA6IGlmIHRydWUsIGhscy5qcyBjYW5ub3Qvd2lsbCBub3QgdHJ5IHRvIHJlY292ZXIsIGlmIGZhbHNlLCBobHMuanMgd2lsbCB0cnkgdG8gcmVjb3ZlcixvdGhlciBlcnJvciBzcGVjaWZpYyBkYXRhfVxuICBFUlJPUiA6ICdobHNFcnJvcidcbn07XG4iLCIvKipcbiAqIEhMUyBpbnRlcmZhY2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgRXZlbnQgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHtFcnJvclR5cGVzLEVycm9yRGV0YWlsc30gIGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCBTdGF0c0hhbmRsZXIgICAgICAgICAgICAgICBmcm9tICcuL3N0YXRzJztcbmltcG9ydCBvYnNlcnZlciAgICAgICAgICAgICAgICAgICBmcm9tICcuL29ic2VydmVyJztcbmltcG9ydCBQbGF5bGlzdExvYWRlciAgICAgICAgICAgICBmcm9tICcuL2xvYWRlci9wbGF5bGlzdC1sb2FkZXInO1xuaW1wb3J0IEZyYWdtZW50TG9hZGVyICAgICAgICAgICAgIGZyb20gJy4vbG9hZGVyL2ZyYWdtZW50LWxvYWRlcic7XG5pbXBvcnQgQnVmZmVyQ29udHJvbGxlciAgICAgICAgICAgZnJvbSAnLi9jb250cm9sbGVyL2J1ZmZlci1jb250cm9sbGVyJztcbmltcG9ydCBMZXZlbENvbnRyb2xsZXIgICAgICAgICAgICBmcm9tICcuL2NvbnRyb2xsZXIvbGV2ZWwtY29udHJvbGxlcic7XG4vL2ltcG9ydCBGUFNDb250cm9sbGVyICAgICAgICAgICAgICBmcm9tICcuL2NvbnRyb2xsZXIvZnBzLWNvbnRyb2xsZXInO1xuaW1wb3J0IHtsb2dnZXIsZW5hYmxlTG9nc30gICAgICAgIGZyb20gJy4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCBYaHJMb2FkZXIgICAgICAgICAgICAgICAgICBmcm9tICcuL3V0aWxzL3hoci1sb2FkZXInO1xuXG5jbGFzcyBIbHMge1xuXG4gIHN0YXRpYyBpc1N1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gKHdpbmRvdy5NZWRpYVNvdXJjZSAmJiBNZWRpYVNvdXJjZS5pc1R5cGVTdXBwb3J0ZWQoJ3ZpZGVvL21wNDsgY29kZWNzPVwiYXZjMS40MkUwMUUsbXA0YS40MC4yXCInKSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0IEV2ZW50cygpIHtcbiAgICByZXR1cm4gRXZlbnQ7XG4gIH1cblxuICBzdGF0aWMgZ2V0IEVycm9yVHlwZXMoKSB7XG4gICAgcmV0dXJuIEVycm9yVHlwZXM7XG4gIH1cblxuICBzdGF0aWMgZ2V0IEVycm9yRGV0YWlscygpIHtcbiAgICByZXR1cm4gRXJyb3JEZXRhaWxzO1xuICB9XG5cbiAgY29uc3RydWN0b3IoY29uZmlnID0ge30pIHtcbiAgIHZhciBjb25maWdEZWZhdWx0ID0ge1xuICAgICAgYXV0b1N0YXJ0TG9hZCA6IHRydWUsXG4gICAgICBkZWJ1ZyA6IGZhbHNlLFxuICAgICAgbWF4QnVmZmVyTGVuZ3RoIDogMzAsXG4gICAgICBtYXhCdWZmZXJTaXplIDogNjAqMTAwMCoxMDAwLFxuICAgICAgbWF4TWF4QnVmZmVyTGVuZ3RoIDogNjAwLFxuICAgICAgZW5hYmxlV29ya2VyIDogdHJ1ZSxcbiAgICAgIGZyYWdMb2FkaW5nVGltZU91dCA6IDIwMDAwLFxuICAgICAgZnJhZ0xvYWRpbmdNYXhSZXRyeSA6IDEsXG4gICAgICBmcmFnTG9hZGluZ1JldHJ5RGVsYXkgOiAxMDAwLFxuICAgICAgZnJhZ0xvYWRpbmdMb29wVGhyZXNob2xkIDogMyxcbiAgICAgIG1hbmlmZXN0TG9hZGluZ1RpbWVPdXQgOiAxMDAwMCxcbiAgICAgIG1hbmlmZXN0TG9hZGluZ01heFJldHJ5IDogMSxcbiAgICAgIG1hbmlmZXN0TG9hZGluZ1JldHJ5RGVsYXkgOiAxMDAwLFxuICAgICAgZnBzRHJvcHBlZE1vbml0b3JpbmdQZXJpb2QgOiA1MDAwLFxuICAgICAgZnBzRHJvcHBlZE1vbml0b3JpbmdUaHJlc2hvbGQgOiAwLjIsXG4gICAgICBhcHBlbmRFcnJvck1heFJldHJ5IDogMjAwLFxuICAgICAgbG9hZGVyIDogWGhyTG9hZGVyXG4gICAgfTtcbiAgICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZ0RlZmF1bHQpIHtcbiAgICAgICAgaWYgKHByb3AgaW4gY29uZmlnKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgIGNvbmZpZ1twcm9wXSA9IGNvbmZpZ0RlZmF1bHRbcHJvcF07XG4gICAgfVxuICAgIGVuYWJsZUxvZ3MoY29uZmlnLmRlYnVnKTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnBsYXlsaXN0TG9hZGVyID0gbmV3IFBsYXlsaXN0TG9hZGVyKHRoaXMpO1xuICAgIHRoaXMuZnJhZ21lbnRMb2FkZXIgPSBuZXcgRnJhZ21lbnRMb2FkZXIodGhpcyk7XG4gICAgdGhpcy5sZXZlbENvbnRyb2xsZXIgPSBuZXcgTGV2ZWxDb250cm9sbGVyKHRoaXMpO1xuICAgIHRoaXMuYnVmZmVyQ29udHJvbGxlciA9IG5ldyBCdWZmZXJDb250cm9sbGVyKHRoaXMpO1xuICAgIC8vdGhpcy5mcHNDb250cm9sbGVyID0gbmV3IEZQU0NvbnRyb2xsZXIodGhpcyk7XG4gICAgdGhpcy5zdGF0c0hhbmRsZXIgPSBuZXcgU3RhdHNIYW5kbGVyKHRoaXMpO1xuICAgIC8vIG9ic2VydmVyIHNldHVwXG4gICAgdGhpcy5vbiA9IG9ic2VydmVyLm9uLmJpbmQob2JzZXJ2ZXIpO1xuICAgIHRoaXMub2ZmID0gb2JzZXJ2ZXIub2ZmLmJpbmQob2JzZXJ2ZXIpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2dnZXIubG9nKGBkZXN0cm95YCk7XG4gICAgdGhpcy5wbGF5bGlzdExvYWRlci5kZXN0cm95KCk7XG4gICAgdGhpcy5mcmFnbWVudExvYWRlci5kZXN0cm95KCk7XG4gICAgdGhpcy5sZXZlbENvbnRyb2xsZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuYnVmZmVyQ29udHJvbGxlci5kZXN0cm95KCk7XG4gICAgLy90aGlzLmZwc0NvbnRyb2xsZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuc3RhdHNIYW5kbGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLnVybCA9IG51bGw7XG4gICAgdGhpcy5kZXRhY2hWaWRlbygpO1xuICAgIG9ic2VydmVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB9XG5cbiAgYXR0YWNoVmlkZW8odmlkZW8pIHtcbiAgICBsb2dnZXIubG9nKGBhdHRhY2hWaWRlb2ApO1xuICAgIHRoaXMudmlkZW8gPSB2aWRlbztcbiAgICB0aGlzLnN0YXRzSGFuZGxlci5hdHRhY2hWaWRlbyh2aWRlbyk7XG4gICAgLy8gc2V0dXAgdGhlIG1lZGlhIHNvdXJjZVxuICAgIHZhciBtcyA9IHRoaXMubWVkaWFTb3VyY2UgPSBuZXcgTWVkaWFTb3VyY2UoKTtcbiAgICAvL01lZGlhIFNvdXJjZSBsaXN0ZW5lcnNcbiAgICB0aGlzLm9ubXNvID0gdGhpcy5vbk1lZGlhU291cmNlT3Blbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25tc2UgPSB0aGlzLm9uTWVkaWFTb3VyY2VFbmRlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25tc2MgPSB0aGlzLm9uTWVkaWFTb3VyY2VDbG9zZS5iaW5kKHRoaXMpO1xuICAgIG1zLmFkZEV2ZW50TGlzdGVuZXIoJ3NvdXJjZW9wZW4nLCAgdGhpcy5vbm1zbyk7XG4gICAgbXMuYWRkRXZlbnRMaXN0ZW5lcignc291cmNlZW5kZWQnLCB0aGlzLm9ubXNlKTtcbiAgICBtcy5hZGRFdmVudExpc3RlbmVyKCdzb3VyY2VjbG9zZScsIHRoaXMub25tc2MpO1xuICAgIC8vIGxpbmsgdmlkZW8gYW5kIG1lZGlhIFNvdXJjZVxuICAgIHZpZGVvLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwobXMpO1xuICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJyx0aGlzLm9udmVycm9yKTtcbiAgfVxuXG4gIGRldGFjaFZpZGVvKCkge1xuICAgIGxvZ2dlci5sb2coYGRldGFjaFZpZGVvYCk7XG4gICAgdmFyIHZpZGVvID0gdGhpcy52aWRlbztcbiAgICB0aGlzLnN0YXRzSGFuZGxlci5kZXRhY2hWaWRlbyh2aWRlbyk7XG4gICAgdmFyIG1zID0gdGhpcy5tZWRpYVNvdXJjZTtcbiAgICBpZihtcykge1xuICAgICAgaWYobXMucmVhZHlTdGF0ZSAhPT0gJ2VuZGVkJykge1xuICAgICAgICBtcy5lbmRPZlN0cmVhbSgpO1xuICAgICAgfVxuICAgICAgbXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignc291cmNlb3BlbicsICB0aGlzLm9ubXNvKTtcbiAgICAgIG1zLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NvdXJjZWVuZGVkJywgdGhpcy5vbm1zZSk7XG4gICAgICBtcy5yZW1vdmVFdmVudExpc3RlbmVyKCdzb3VyY2VjbG9zZScsIHRoaXMub25tc2MpO1xuICAgICAgLy8gdW5saW5rIE1lZGlhU291cmNlIGZyb20gdmlkZW8gdGFnXG4gICAgICB2aWRlby5zcmMgPSAnJztcbiAgICAgIHRoaXMubWVkaWFTb3VyY2UgPSBudWxsO1xuICAgICAgbG9nZ2VyLmxvZyhgdHJpZ2dlciBNU0VfREVUQUNIRURgKTtcbiAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuTVNFX0RFVEFDSEVEKTtcbiAgICB9XG4gICAgdGhpcy5vbm1zbyA9IHRoaXMub25tc2UgPSB0aGlzLm9ubXNjID0gbnVsbDtcbiAgICBpZih2aWRlbykge1xuICAgICAgdGhpcy52aWRlbyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgbG9hZFNvdXJjZSh1cmwpIHtcbiAgICBsb2dnZXIubG9nKGBsb2FkU291cmNlOiR7dXJsfWApO1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIC8vIHdoZW4gYXR0YWNoaW5nIHRvIGEgc291cmNlIFVSTCwgdHJpZ2dlciBhIHBsYXlsaXN0IGxvYWRcbiAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50Lk1BTklGRVNUX0xPQURJTkcsIHsgdXJsOiB1cmwgfSk7XG4gIH1cblxuICBzdGFydExvYWQoKSB7XG4gICAgbG9nZ2VyLmxvZyhgc3RhcnRMb2FkYCk7XG4gICAgdGhpcy5idWZmZXJDb250cm9sbGVyLnN0YXJ0TG9hZCgpO1xuICB9XG5cbiAgcmVjb3Zlck1lZGlhRXJyb3IoKSB7XG4gICAgbG9nZ2VyLmxvZygncmVjb3Zlck1lZGlhRXJyb3InKTtcbiAgICB2YXIgdmlkZW8gPSB0aGlzLnZpZGVvO1xuICAgIHRoaXMuZGV0YWNoVmlkZW8oKTtcbiAgICB0aGlzLmF0dGFjaFZpZGVvKHZpZGVvKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gYWxsIHF1YWxpdHkgbGV2ZWxzICoqL1xuICBnZXQgbGV2ZWxzKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsQ29udHJvbGxlci5sZXZlbHM7XG4gIH1cblxuICAvKiogUmV0dXJuIGN1cnJlbnQgcGxheWJhY2sgcXVhbGl0eSBsZXZlbCAqKi9cbiAgZ2V0IGN1cnJlbnRMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXJDb250cm9sbGVyLmN1cnJlbnRMZXZlbDtcbiAgfVxuXG4gIC8qIHNldCBxdWFsaXR5IGxldmVsIGltbWVkaWF0ZWx5ICgtMSBmb3IgYXV0b21hdGljIGxldmVsIHNlbGVjdGlvbikgKi9cbiAgc2V0IGN1cnJlbnRMZXZlbChuZXdMZXZlbCkge1xuICAgIGxvZ2dlci5sb2coYHNldCBjdXJyZW50TGV2ZWw6JHtuZXdMZXZlbH1gKTtcbiAgICB0aGlzLmxvYWRMZXZlbCA9IG5ld0xldmVsO1xuICAgIHRoaXMuYnVmZmVyQ29udHJvbGxlci5pbW1lZGlhdGVMZXZlbFN3aXRjaCgpO1xuICB9XG5cbiAgLyoqIFJldHVybiBuZXh0IHBsYXliYWNrIHF1YWxpdHkgbGV2ZWwgKHF1YWxpdHkgbGV2ZWwgb2YgbmV4dCBmcmFnbWVudCkgKiovXG4gIGdldCBuZXh0TGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyQ29udHJvbGxlci5uZXh0TGV2ZWw7XG4gIH1cblxuICAvKiBzZXQgcXVhbGl0eSBsZXZlbCBmb3IgbmV4dCBmcmFnbWVudCAoLTEgZm9yIGF1dG9tYXRpYyBsZXZlbCBzZWxlY3Rpb24pICovXG4gIHNldCBuZXh0TGV2ZWwobmV3TGV2ZWwpIHtcbiAgICBsb2dnZXIubG9nKGBzZXQgbmV4dExldmVsOiR7bmV3TGV2ZWx9YCk7XG4gICAgdGhpcy5sZXZlbENvbnRyb2xsZXIubWFudWFsTGV2ZWwgPSBuZXdMZXZlbDtcbiAgICB0aGlzLmJ1ZmZlckNvbnRyb2xsZXIubmV4dExldmVsU3dpdGNoKCk7XG4gIH1cblxuICAvKiogUmV0dXJuIHRoZSBxdWFsaXR5IGxldmVsIG9mIGN1cnJlbnQvbGFzdCBsb2FkZWQgZnJhZ21lbnQgKiovXG4gIGdldCBsb2FkTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxDb250cm9sbGVyLmxldmVsO1xuICB9XG5cbiAgLyogc2V0IHF1YWxpdHkgbGV2ZWwgZm9yIGN1cnJlbnQvbmV4dCBsb2FkZWQgZnJhZ21lbnQgKC0xIGZvciBhdXRvbWF0aWMgbGV2ZWwgc2VsZWN0aW9uKSAqL1xuICBzZXQgbG9hZExldmVsKG5ld0xldmVsKSB7XG4gICAgbG9nZ2VyLmxvZyhgc2V0IGxvYWRMZXZlbDoke25ld0xldmVsfWApO1xuICAgIHRoaXMubGV2ZWxDb250cm9sbGVyLm1hbnVhbExldmVsID0gbmV3TGV2ZWw7XG4gIH1cblxuICAvKiogUmV0dXJuIHRoZSBxdWFsaXR5IGxldmVsIG9mIG5leHQgbG9hZGVkIGZyYWdtZW50ICoqL1xuICBnZXQgbmV4dExvYWRMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbENvbnRyb2xsZXIubmV4dExvYWRMZXZlbCgpO1xuICB9XG5cbiAgLyoqIHNldCBxdWFsaXR5IGxldmVsIG9mIG5leHQgbG9hZGVkIGZyYWdtZW50ICoqL1xuICBzZXQgbmV4dExvYWRMZXZlbChsZXZlbCkge1xuICAgIHRoaXMubGV2ZWxDb250cm9sbGVyLmxldmVsID0gbGV2ZWw7XG4gIH1cblxuICAvKiogUmV0dXJuIGZpcnN0IGxldmVsIChpbmRleCBvZiBmaXJzdCBsZXZlbCByZWZlcmVuY2VkIGluIG1hbmlmZXN0KVxuICAqKi9cbiAgZ2V0IGZpcnN0TGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxDb250cm9sbGVyLmZpcnN0TGV2ZWw7XG4gIH1cblxuICAvKiogc2V0IGZpcnN0IGxldmVsIChpbmRleCBvZiBmaXJzdCBsZXZlbCByZWZlcmVuY2VkIGluIG1hbmlmZXN0KVxuICAqKi9cbiAgc2V0IGZpcnN0TGV2ZWwobmV3TGV2ZWwpIHtcbiAgICBsb2dnZXIubG9nKGBzZXQgZmlyc3RMZXZlbDoke25ld0xldmVsfWApO1xuICAgIHRoaXMubGV2ZWxDb250cm9sbGVyLmZpcnN0TGV2ZWwgPSBuZXdMZXZlbDtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gc3RhcnQgbGV2ZWwgKGxldmVsIG9mIGZpcnN0IGZyYWdtZW50IHRoYXQgd2lsbCBiZSBwbGF5ZWQgYmFjaylcbiAgICAgIGlmIG5vdCBvdmVycmlkZWQgYnkgdXNlciwgZmlyc3QgbGV2ZWwgYXBwZWFyaW5nIGluIG1hbmlmZXN0IHdpbGwgYmUgdXNlZCBhcyBzdGFydCBsZXZlbFxuICAgICAgaWYgLTEgOiBhdXRvbWF0aWMgc3RhcnQgbGV2ZWwgc2VsZWN0aW9uLCBwbGF5YmFjayB3aWxsIHN0YXJ0IGZyb20gbGV2ZWwgbWF0Y2hpbmcgZG93bmxvYWQgYmFuZHdpZHRoIChkZXRlcm1pbmVkIGZyb20gZG93bmxvYWQgb2YgZmlyc3Qgc2VnbWVudClcbiAgKiovXG4gIGdldCBzdGFydExldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsQ29udHJvbGxlci5zdGFydExldmVsO1xuICB9XG5cbiAgLyoqIHNldCAgc3RhcnQgbGV2ZWwgKGxldmVsIG9mIGZpcnN0IGZyYWdtZW50IHRoYXQgd2lsbCBiZSBwbGF5ZWQgYmFjaylcbiAgICAgIGlmIG5vdCBvdmVycmlkZWQgYnkgdXNlciwgZmlyc3QgbGV2ZWwgYXBwZWFyaW5nIGluIG1hbmlmZXN0IHdpbGwgYmUgdXNlZCBhcyBzdGFydCBsZXZlbFxuICAgICAgaWYgLTEgOiBhdXRvbWF0aWMgc3RhcnQgbGV2ZWwgc2VsZWN0aW9uLCBwbGF5YmFjayB3aWxsIHN0YXJ0IGZyb20gbGV2ZWwgbWF0Y2hpbmcgZG93bmxvYWQgYmFuZHdpZHRoIChkZXRlcm1pbmVkIGZyb20gZG93bmxvYWQgb2YgZmlyc3Qgc2VnbWVudClcbiAgKiovXG4gIHNldCBzdGFydExldmVsKG5ld0xldmVsKSB7XG4gICAgbG9nZ2VyLmxvZyhgc2V0IHN0YXJ0TGV2ZWw6JHtuZXdMZXZlbH1gKTtcbiAgICB0aGlzLmxldmVsQ29udHJvbGxlci5zdGFydExldmVsID0gbmV3TGV2ZWw7XG4gIH1cblxuICAvKiogUmV0dXJuIHRoZSBjYXBwaW5nL21heCBsZXZlbCB2YWx1ZSB0aGF0IGNvdWxkIGJlIHVzZWQgYnkgYXV0b21hdGljIGxldmVsIHNlbGVjdGlvbiBhbGdvcml0aG0gKiovXG4gIGdldCBhdXRvTGV2ZWxDYXBwaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsQ29udHJvbGxlci5hdXRvTGV2ZWxDYXBwaW5nO1xuICB9XG5cbiAgLyoqIHNldCB0aGUgY2FwcGluZy9tYXggbGV2ZWwgdmFsdWUgdGhhdCBjb3VsZCBiZSB1c2VkIGJ5IGF1dG9tYXRpYyBsZXZlbCBzZWxlY3Rpb24gYWxnb3JpdGhtICoqL1xuICBzZXQgYXV0b0xldmVsQ2FwcGluZyhuZXdMZXZlbCkge1xuICAgIGxvZ2dlci5sb2coYHNldCBhdXRvTGV2ZWxDYXBwaW5nOiR7bmV3TGV2ZWx9YCk7XG4gICAgdGhpcy5sZXZlbENvbnRyb2xsZXIuYXV0b0xldmVsQ2FwcGluZyA9IG5ld0xldmVsO1xuICB9XG5cbiAgLyogY2hlY2sgaWYgd2UgYXJlIGluIGF1dG9tYXRpYyBsZXZlbCBzZWxlY3Rpb24gbW9kZSAqL1xuICBnZXQgYXV0b0xldmVsRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMubGV2ZWxDb250cm9sbGVyLm1hbnVhbExldmVsICA9PT0gLTEpO1xuICB9XG5cbiAgLyogcmV0dXJuIG1hbnVhbCBsZXZlbCAqL1xuICBnZXQgbWFudWFsTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxDb250cm9sbGVyLm1hbnVhbExldmVsO1xuICB9XG5cblxuICAvKiByZXR1cm4gcGxheWJhY2sgc2Vzc2lvbiBzdGF0cyAqL1xuICBnZXQgc3RhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdHNIYW5kbGVyLnN0YXRzO1xuICB9XG5cbiAgb25NZWRpYVNvdXJjZU9wZW4oKSB7XG4gICAgbG9nZ2VyLmxvZygnbWVkaWEgc291cmNlIG9wZW5lZCcpO1xuICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuTVNFX0FUVEFDSEVELCB7IHZpZGVvOiB0aGlzLnZpZGVvLCBtZWRpYVNvdXJjZSA6IHRoaXMubWVkaWFTb3VyY2UgfSk7XG4gICAgLy8gb25jZSByZWNlaXZlZCwgZG9uJ3QgbGlzdGVuIGFueW1vcmUgdG8gc291cmNlb3BlbiBldmVudFxuICAgIHRoaXMubWVkaWFTb3VyY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcignc291cmNlb3BlbicsICB0aGlzLm9ubXNvKTtcbiAgfVxuXG4gIG9uTWVkaWFTb3VyY2VDbG9zZSgpIHtcbiAgICBsb2dnZXIubG9nKCdtZWRpYSBzb3VyY2UgY2xvc2VkJyk7XG4gIH1cblxuICBvbk1lZGlhU291cmNlRW5kZWQoKSB7XG4gICAgbG9nZ2VyLmxvZygnbWVkaWEgc291cmNlIGVuZGVkJyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGxzO1xuIiwiIC8qXG4gKiBmcmFnbWVudCBsb2FkZXJcbiAqXG4gKi9cblxuaW1wb3J0IEV2ZW50ICAgICAgICAgICAgICAgIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgb2JzZXJ2ZXIgICAgICAgICAgICAgZnJvbSAnLi4vb2JzZXJ2ZXInO1xuaW1wb3J0IHtFcnJvclR5cGVzLEVycm9yRGV0YWlsc30gZnJvbSAnLi4vZXJyb3JzJztcblxuIGNsYXNzIEZyYWdtZW50TG9hZGVyIHtcblxuICBjb25zdHJ1Y3RvcihobHMpIHtcbiAgICB0aGlzLmhscz1obHM7XG4gICAgdGhpcy5vbmZsID0gdGhpcy5vbkZyYWdMb2FkaW5nLmJpbmQodGhpcyk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuRlJBR19MT0FESU5HLCB0aGlzLm9uZmwpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZih0aGlzLmxvYWRlcikge1xuICAgICAgdGhpcy5sb2FkZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5sb2FkZXIgPSBudWxsO1xuICAgIH1cbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRlJBR19MT0FESU5HLCB0aGlzLm9uZmwpO1xuICB9XG5cbiAgb25GcmFnTG9hZGluZyhldmVudCxkYXRhKSB7XG4gICAgdmFyIGZyYWcgPSBkYXRhLmZyYWc7XG4gICAgdGhpcy5mcmFnID0gZnJhZztcbiAgICB0aGlzLmZyYWcubG9hZGVkID0gMDtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5obHMuY29uZmlnO1xuICAgIGZyYWcubG9hZGVyID0gdGhpcy5sb2FkZXIgPSBuZXcgY29uZmlnLmxvYWRlcigpO1xuICAgIHRoaXMubG9hZGVyLmxvYWQoZnJhZy51cmwsJ2FycmF5YnVmZmVyJyx0aGlzLmxvYWRzdWNjZXNzLmJpbmQodGhpcyksIHRoaXMubG9hZGVycm9yLmJpbmQodGhpcyksIHRoaXMubG9hZHRpbWVvdXQuYmluZCh0aGlzKSwgY29uZmlnLmZyYWdMb2FkaW5nVGltZU91dCwgY29uZmlnLmZyYWdMb2FkaW5nTWF4UmV0cnksY29uZmlnLmZyYWdMb2FkaW5nUmV0cnlEZWxheSx0aGlzLmxvYWRwcm9ncmVzcy5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGxvYWRzdWNjZXNzKGV2ZW50LCBzdGF0cykge1xuICAgIHZhciBwYXlsb2FkID0gZXZlbnQuY3VycmVudFRhcmdldC5yZXNwb25zZTtcbiAgICBzdGF0cy5sZW5ndGggPSBwYXlsb2FkLmJ5dGVMZW5ndGg7XG4gICAgLy8gZGV0YWNoIGZyYWdtZW50IGxvYWRlciBvbiBsb2FkIHN1Y2Nlc3NcbiAgICB0aGlzLmZyYWcubG9hZGVyID0gdW5kZWZpbmVkO1xuICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRlJBR19MT0FERUQsXG4gICAgICAgICAgICAgICAgICAgIHsgcGF5bG9hZCA6IHBheWxvYWQsXG4gICAgICAgICAgICAgICAgICAgICAgZnJhZyA6IHRoaXMuZnJhZyAsXG4gICAgICAgICAgICAgICAgICAgICAgc3RhdHMgOiBzdGF0c30pO1xuICB9XG5cbiAgbG9hZGVycm9yKGV2ZW50KSB7XG4gICAgdGhpcy5sb2FkZXIuYWJvcnQoKTtcbiAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkVSUk9SLCB7IHR5cGUgOiBFcnJvclR5cGVzLk5FVFdPUktfRVJST1IsIGRldGFpbHMgOiBFcnJvckRldGFpbHMuRlJBR19MT0FEX0VSUk9SLCBmYXRhbDpmYWxzZSxmcmFnIDogdGhpcy5mcmFnLCByZXNwb25zZTpldmVudH0pO1xuICB9XG5cbiAgbG9hZHRpbWVvdXQoKSB7XG4gICAgdGhpcy5sb2FkZXIuYWJvcnQoKTtcbiAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkVSUk9SLCB7IHR5cGUgOiBFcnJvclR5cGVzLk5FVFdPUktfRVJST1IsIGRldGFpbHMgOiBFcnJvckRldGFpbHMuRlJBR19MT0FEX1RJTUVPVVQsIGZhdGFsOmZhbHNlLGZyYWcgOiB0aGlzLmZyYWd9KTtcbiAgfVxuXG4gIGxvYWRwcm9ncmVzcyhldmVudCwgc3RhdHMpIHtcbiAgICB0aGlzLmZyYWcubG9hZGVkID0gc3RhdHMubG9hZGVkO1xuICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5GUkFHX0xPQURfUFJPR1JFU1MsIHsgZnJhZyA6IHRoaXMuZnJhZywgc3RhdHMgOiBzdGF0c30pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZyYWdtZW50TG9hZGVyO1xuIiwiLypcbiAqIHBsYXlsaXN0IGxvYWRlclxuICpcbiAqL1xuXG5pbXBvcnQgRXZlbnQgICAgICAgICAgICAgICAgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCBvYnNlcnZlciAgICAgICAgICAgICBmcm9tICcuLi9vYnNlcnZlcic7XG5pbXBvcnQge0Vycm9yVHlwZXMsRXJyb3JEZXRhaWxzfSBmcm9tICcuLi9lcnJvcnMnO1xuLy9pbXBvcnQge2xvZ2dlcn0gICAgICAgICAgICAgZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuIGNsYXNzIFBsYXlsaXN0TG9hZGVyIHtcblxuICBjb25zdHJ1Y3RvcihobHMpIHtcbiAgICB0aGlzLmhscyA9IGhscztcbiAgICB0aGlzLm9ubWwgPSB0aGlzLm9uTWFuaWZlc3RMb2FkaW5nLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbmxsID0gdGhpcy5vbkxldmVsTG9hZGluZy5iaW5kKHRoaXMpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50Lk1BTklGRVNUX0xPQURJTkcsIHRoaXMub25tbCk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuTEVWRUxfTE9BRElORywgdGhpcy5vbmxsKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYodGhpcy5sb2FkZXIpIHtcbiAgICAgIHRoaXMubG9hZGVyLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMubG9hZGVyID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy51cmwgPSB0aGlzLmlkID0gbnVsbDtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuTUFOSUZFU1RfTE9BRElORywgdGhpcy5vbm1sKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuTEVWRUxfTE9BRElORywgdGhpcy5vbmxsKTtcbiAgfVxuXG4gIG9uTWFuaWZlc3RMb2FkaW5nKGV2ZW50LGRhdGEpIHtcbiAgICB0aGlzLmxvYWQoZGF0YS51cmwsbnVsbCk7XG4gIH1cblxuICBvbkxldmVsTG9hZGluZyhldmVudCxkYXRhKSB7XG4gICAgdGhpcy5sb2FkKGRhdGEudXJsLGRhdGEubGV2ZWwsZGF0YS5pZCk7XG4gIH1cblxuICBsb2FkKHVybCxpZDEsaWQyKSB7XG4gICAgdmFyIGNvbmZpZz10aGlzLmhscy5jb25maWc7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy5pZCA9IGlkMTtcbiAgICB0aGlzLmlkMiA9IGlkMjtcbiAgICB0aGlzLmxvYWRlciA9IG5ldyBjb25maWcubG9hZGVyKCk7XG4gICAgdGhpcy5sb2FkZXIubG9hZCh1cmwsJycsdGhpcy5sb2Fkc3VjY2Vzcy5iaW5kKHRoaXMpLCB0aGlzLmxvYWRlcnJvci5iaW5kKHRoaXMpLCB0aGlzLmxvYWR0aW1lb3V0LmJpbmQodGhpcyksIGNvbmZpZy5tYW5pZmVzdExvYWRpbmdUaW1lT3V0LCBjb25maWcubWFuaWZlc3RMb2FkaW5nTWF4UmV0cnksY29uZmlnLm1hbmlmZXN0TG9hZGluZ1JldHJ5RGVsYXkpO1xuICB9XG5cbiAgcmVzb2x2ZSh1cmwsIGJhc2VVcmwpIHtcbiAgICB2YXIgZG9jICAgICAgPSBkb2N1bWVudCxcbiAgICAgICAgb2xkQmFzZSA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYmFzZScpWzBdLFxuICAgICAgICBvbGRIcmVmID0gb2xkQmFzZSAmJiBvbGRCYXNlLmhyZWYsXG4gICAgICAgIGRvY0hlYWQgPSBkb2MuaGVhZCB8fCBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgb3VyQmFzZSA9IG9sZEJhc2UgfHwgZG9jSGVhZC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlRWxlbWVudCgnYmFzZScpKSxcbiAgICAgICAgcmVzb2x2ZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnYScpLFxuICAgICAgICByZXNvbHZlZFVybDtcblxuICAgIG91ckJhc2UuaHJlZiA9IGJhc2VVcmw7XG4gICAgcmVzb2x2ZXIuaHJlZiA9IHVybDtcbiAgICByZXNvbHZlZFVybCAgPSByZXNvbHZlci5ocmVmOyAvLyBicm93c2VyIG1hZ2ljIGF0IHdvcmsgaGVyZVxuXG4gICAgaWYgKG9sZEJhc2UpIHtvbGRCYXNlLmhyZWYgPSBvbGRIcmVmO31cbiAgICBlbHNlIHtkb2NIZWFkLnJlbW92ZUNoaWxkKG91ckJhc2UpO31cbiAgICByZXR1cm4gcmVzb2x2ZWRVcmw7XG4gIH1cblxuICBwYXJzZU1hc3RlclBsYXlsaXN0KHN0cmluZyxiYXNldXJsKSB7XG4gICAgdmFyIGxldmVscyA9IFtdLGxldmVsID0gIHt9LHJlc3VsdCxjb2RlY3MsY29kZWM7XG4gICAgdmFyIHJlID0gLyNFWFQtWC1TVFJFQU0tSU5GOihbXlxcblxccl0qKEJBTkQpV0lEVEg9KFxcZCspKT8oW15cXG5cXHJdKihDT0RFQ1MpPVxcXCIoLiopXFxcIiwpPyhbXlxcblxccl0qKFJFUylPTFVUSU9OPShcXGQrKXgoXFxkKykpPyhbXlxcblxccl0qKE5BTUUpPVxcXCIoLiopXFxcIik/W15cXG5cXHJdKltcXHJcXG5dKyhbXlxcclxcbl0rKS9nO1xuICAgIHdoaWxlKChyZXN1bHQgPSByZS5leGVjKHN0cmluZykpICE9IG51bGwpe1xuICAgICAgcmVzdWx0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKGZ1bmN0aW9uKG4peyByZXR1cm4gKG4gIT09IHVuZGVmaW5lZCk7fSk7XG4gICAgICBsZXZlbC51cmwgPSB0aGlzLnJlc29sdmUocmVzdWx0LnBvcCgpLGJhc2V1cmwpO1xuICAgICAgd2hpbGUocmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3dpdGNoKHJlc3VsdC5zaGlmdCgpKSB7XG4gICAgICAgICAgY2FzZSAnUkVTJzpcbiAgICAgICAgICAgIGxldmVsLndpZHRoID0gcGFyc2VJbnQocmVzdWx0LnNoaWZ0KCkpO1xuICAgICAgICAgICAgbGV2ZWwuaGVpZ2h0ID0gcGFyc2VJbnQocmVzdWx0LnNoaWZ0KCkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQkFORCc6XG4gICAgICAgICAgICBsZXZlbC5iaXRyYXRlID0gcGFyc2VJbnQocmVzdWx0LnNoaWZ0KCkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnTkFNRSc6XG4gICAgICAgICAgICBsZXZlbC5uYW1lID0gcmVzdWx0LnNoaWZ0KCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDT0RFQ1MnOlxuICAgICAgICAgICAgY29kZWNzID0gcmVzdWx0LnNoaWZ0KCkuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIHdoaWxlKGNvZGVjcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGNvZGVjID0gY29kZWNzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgIGlmKGNvZGVjLmluZGV4T2YoJ2F2YzEnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXZlbC52aWRlb0NvZGVjID0gdGhpcy5hdmMxdG9hdmNvdGkoY29kZWMpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldmVsLmF1ZGlvQ29kZWMgPSBjb2RlYztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXZlbHMucHVzaChsZXZlbCk7XG4gICAgICBsZXZlbCA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gbGV2ZWxzO1xuICB9XG5cbiAgYXZjMXRvYXZjb3RpKGNvZGVjKSB7XG4gICAgdmFyIHJlc3VsdCxhdmNkYXRhID0gY29kZWMuc3BsaXQoJy4nKTtcbiAgICBpZihhdmNkYXRhLmxlbmd0aCA+IDIpIHtcbiAgICAgIHJlc3VsdCA9IGF2Y2RhdGEuc2hpZnQoKSArICcuJztcbiAgICAgIHJlc3VsdCArPSBwYXJzZUludChhdmNkYXRhLnNoaWZ0KCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgIHJlc3VsdCArPSAoJzAwJyArIHBhcnNlSW50KGF2Y2RhdGEuc2hpZnQoKSkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBjb2RlYztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHBhcnNlTGV2ZWxQbGF5bGlzdChzdHJpbmcsIGJhc2V1cmwsIGlkKSB7XG4gICAgdmFyIGN1cnJlbnRTTiA9IDAsdG90YWxkdXJhdGlvbiA9IDAsIGxldmVsID0geyB1cmwgOiBiYXNldXJsLCBmcmFnbWVudHMgOiBbXSwgbGl2ZSA6IHRydWUsIHN0YXJ0U04gOiAwfSwgcmVzdWx0LCByZWdleHAsIGNjID0gMDtcbiAgICByZWdleHAgPSAvKD86I0VYVC1YLShNRURJQS1TRVFVRU5DRSk6KFxcZCspKXwoPzojRVhULVgtKFRBUkdFVERVUkFUSU9OKTooXFxkKykpfCg/OiNFWFQoSU5GKTooW1xcZFxcLl0rKVteXFxyXFxuXSpbXFxyXFxuXSsoW15cXHJcXG5dKyl8KD86I0VYVC1YLShFTkRMSVNUKSl8KD86I0VYVC1YLShESVMpQ09OVElOVUlUWSkpL2c7XG4gICAgd2hpbGUoKHJlc3VsdCA9IHJlZ2V4cC5leGVjKHN0cmluZykpICE9PSBudWxsKXtcbiAgICAgIHJlc3VsdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcihmdW5jdGlvbihuKXsgcmV0dXJuIChuICE9PSB1bmRlZmluZWQpO30pO1xuICAgICAgc3dpdGNoKHJlc3VsdFswXSkge1xuICAgICAgICBjYXNlICdNRURJQS1TRVFVRU5DRSc6XG4gICAgICAgICAgY3VycmVudFNOID0gbGV2ZWwuc3RhcnRTTiA9IHBhcnNlSW50KHJlc3VsdFsxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1RBUkdFVERVUkFUSU9OJzpcbiAgICAgICAgICBsZXZlbC50YXJnZXRkdXJhdGlvbiA9IHBhcnNlRmxvYXQocmVzdWx0WzFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRU5ETElTVCc6XG4gICAgICAgICAgbGV2ZWwubGl2ZSA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdESVMnOlxuICAgICAgICAgIGNjKys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0lORic6XG4gICAgICAgICAgdmFyIGR1cmF0aW9uID0gcGFyc2VGbG9hdChyZXN1bHRbMV0pO1xuICAgICAgICAgIGxldmVsLmZyYWdtZW50cy5wdXNoKHt1cmwgOiB0aGlzLnJlc29sdmUocmVzdWx0WzJdLGJhc2V1cmwpLCBkdXJhdGlvbiA6IGR1cmF0aW9uLCBzdGFydCA6IHRvdGFsZHVyYXRpb24sIHNuIDogY3VycmVudFNOKyssIGxldmVsOmlkLCBjYyA6IGNjfSk7XG4gICAgICAgICAgdG90YWxkdXJhdGlvbis9ZHVyYXRpb247XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vbG9nZ2VyLmxvZygnZm91bmQgJyArIGxldmVsLmZyYWdtZW50cy5sZW5ndGggKyAnIGZyYWdtZW50cycpO1xuICAgIGxldmVsLnRvdGFsZHVyYXRpb24gPSB0b3RhbGR1cmF0aW9uO1xuICAgIGxldmVsLmVuZFNOID0gY3VycmVudFNOIC0gMTtcbiAgICByZXR1cm4gbGV2ZWw7XG4gIH1cblxuICBsb2Fkc3VjY2VzcyhldmVudCwgc3RhdHMpIHtcbiAgICB2YXIgc3RyaW5nID0gZXZlbnQuY3VycmVudFRhcmdldC5yZXNwb25zZVRleHQsIHVybCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQucmVzcG9uc2VVUkwsIGlkID0gdGhpcy5pZCxpZDI9IHRoaXMuaWQyLCBsZXZlbHM7XG4gICAgLy8gcmVzcG9uc2VVUkwgbm90IHN1cHBvcnRlZCBvbiBzb21lIGJyb3dzZXJzIChpdCBpcyB1c2VkIHRvIGRldGVjdCBVUkwgcmVkaXJlY3Rpb24pXG4gICAgaWYodXJsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGZhbGxiYWNrIHRvIGluaXRpYWwgVVJMXG4gICAgICB1cmwgPSB0aGlzLnVybDtcbiAgICB9XG4gICAgc3RhdHMudGxvYWQgPSBuZXcgRGF0ZSgpO1xuICAgIHN0YXRzLm10aW1lID0gbmV3IERhdGUoZXZlbnQuY3VycmVudFRhcmdldC5nZXRSZXNwb25zZUhlYWRlcignTGFzdC1Nb2RpZmllZCcpKTtcblxuICAgIGlmKHN0cmluZy5pbmRleE9mKCcjRVhUTTNVJykgPT09IDApIHtcbiAgICAgIGlmIChzdHJpbmcuaW5kZXhPZignI0VYVElORjonKSA+IDApIHtcbiAgICAgICAgLy8gMSBsZXZlbCBwbGF5bGlzdFxuICAgICAgICAvLyBpZiBmaXJzdCByZXF1ZXN0LCBmaXJlIG1hbmlmZXN0IGxvYWRlZCBldmVudCwgbGV2ZWwgd2lsbCBiZSByZWxvYWRlZCBhZnRlcndhcmRzXG4gICAgICAgIC8vICh0aGlzIGlzIHRvIGhhdmUgYSB1bmlmb3JtIGxvZ2ljIGZvciAxIGxldmVsL211bHRpbGV2ZWwgcGxheWxpc3RzKVxuICAgICAgICBpZih0aGlzLmlkID09PSBudWxsKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5NQU5JRkVTVF9MT0FERUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgbGV2ZWxzIDogW3t1cmwgOiB1cmx9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHMgOiBzdGF0c30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuTEVWRUxfTE9BREVELFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IGRldGFpbHMgOiB0aGlzLnBhcnNlTGV2ZWxQbGF5bGlzdChzdHJpbmcsdXJsLGlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXZlbCA6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkIDogaWQyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzIDogc3RhdHN9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV2ZWxzID0gdGhpcy5wYXJzZU1hc3RlclBsYXlsaXN0KHN0cmluZyx1cmwpO1xuICAgICAgICAvLyBtdWx0aSBsZXZlbCBwbGF5bGlzdCwgcGFyc2UgbGV2ZWwgaW5mb1xuICAgICAgICBpZihsZXZlbHMubGVuZ3RoKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5NQU5JRkVTVF9MT0FERUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgbGV2ZWxzIDogbGV2ZWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0cyA6IHN0YXRzfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JzZXJ2ZXIudHJpZ2dlcihFdmVudC5FUlJPUiwgeyB0eXBlIDogRXJyb3JUeXBlcy5ORVRXT1JLX0VSUk9SLCBkZXRhaWxzIDogRXJyb3JEZXRhaWxzLk1BTklGRVNUX1BBUlNJTkdfRVJST1IsIGZhdGFsOnRydWUsIHVybCA6IHVybCwgcmVhc29uIDogJ25vIGxldmVsIGZvdW5kIGluIG1hbmlmZXN0J30pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRVJST1IsIHsgdHlwZSA6IEVycm9yVHlwZXMuTkVUV09SS19FUlJPUiwgZGV0YWlscyA6IEVycm9yRGV0YWlscy5NQU5JRkVTVF9QQVJTSU5HX0VSUk9SLCBmYXRhbDp0cnVlLCB1cmwgOiB1cmwsIHJlYXNvbiA6ICdubyBFWFRNM1UgZGVsaW1pdGVyJ30pO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRlcnJvcihldmVudCkge1xuICAgIHZhciBkZXRhaWxzLGZhdGFsO1xuICAgIGlmKHRoaXMuaWQgPT09IG51bGwpIHtcbiAgICAgIGRldGFpbHMgPSBFcnJvckRldGFpbHMuTUFOSUZFU1RfTE9BRF9FUlJPUjtcbiAgICAgIGZhdGFsID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGV0YWlscyA9IEVycm9yRGV0YWlscy5MRVZFTF9MT0FEX0VSUk9SO1xuICAgICAgZmF0YWwgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5sb2FkZXIuYWJvcnQoKTtcbiAgICBvYnNlcnZlci50cmlnZ2VyKEV2ZW50LkVSUk9SLCB7dHlwZSA6IEVycm9yVHlwZXMuTkVUV09SS19FUlJPUiwgZGV0YWlsczpkZXRhaWxzLCBmYXRhbDpmYXRhbCwgdXJsOnRoaXMudXJsLCBsb2FkZXIgOiB0aGlzLmxvYWRlciwgcmVzcG9uc2U6ZXZlbnQuY3VycmVudFRhcmdldCwgbGV2ZWw6IHRoaXMuaWQsIGlkIDogdGhpcy5pZDJ9KTtcbiAgfVxuXG4gIGxvYWR0aW1lb3V0KCkge1xuICAgIHZhciBkZXRhaWxzLGZhdGFsO1xuICAgIGlmKHRoaXMuaWQgPT09IG51bGwpIHtcbiAgICAgIGRldGFpbHMgPSBFcnJvckRldGFpbHMuTUFOSUZFU1RfTE9BRF9USU1FT1VUO1xuICAgICAgZmF0YWwgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZXRhaWxzID0gRXJyb3JEZXRhaWxzLkxFVkVMX0xPQURfVElNRU9VVDtcbiAgICAgIGZhdGFsID0gZmFsc2U7XG4gICAgfVxuICAgdGhpcy5sb2FkZXIuYWJvcnQoKTtcbiAgIG9ic2VydmVyLnRyaWdnZXIoRXZlbnQuRVJST1IsIHsgdHlwZSA6IEVycm9yVHlwZXMuTkVUV09SS19FUlJPUiwgZGV0YWlsczpkZXRhaWxzLCBmYXRhbDpmYXRhbCwgdXJsIDogdGhpcy51cmwsIGxvYWRlcjogdGhpcy5sb2FkZXIsIGxldmVsOiB0aGlzLmlkLCBpZCA6IHRoaXMuaWQyfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWxpc3RMb2FkZXI7XG4iLCJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5cbmxldCBvYnNlcnZlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxub2JzZXJ2ZXIudHJpZ2dlciA9IGZ1bmN0aW9uIHRyaWdnZXIgKGV2ZW50LCAuLi5kYXRhKSB7XG4gIG9ic2VydmVyLmVtaXQoZXZlbnQsIGV2ZW50LCAuLi5kYXRhKTtcbn07XG5cbm9ic2VydmVyLm9mZiA9IGZ1bmN0aW9uIG9mZiAoZXZlbnQsIC4uLmRhdGEpIHtcbiAgb2JzZXJ2ZXIucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIC4uLmRhdGEpO1xufTtcblxuXG5leHBvcnQgZGVmYXVsdCBvYnNlcnZlcjtcbiIsIi8qKlxuICogZ2VuZXJhdGUgTVA0IEJveFxuICovXG5cbmNsYXNzIE1QNCB7XG4gIHN0YXRpYyBpbml0KCkge1xuICAgIE1QNC50eXBlcyA9IHtcbiAgICAgIGF2YzE6IFtdLCAvLyBjb2RpbmduYW1lXG4gICAgICBhdmNDOiBbXSxcbiAgICAgIGJ0cnQ6IFtdLFxuICAgICAgZGluZjogW10sXG4gICAgICBkcmVmOiBbXSxcbiAgICAgIGVzZHM6IFtdLFxuICAgICAgZnR5cDogW10sXG4gICAgICBoZGxyOiBbXSxcbiAgICAgIG1kYXQ6IFtdLFxuICAgICAgbWRoZDogW10sXG4gICAgICBtZGlhOiBbXSxcbiAgICAgIG1maGQ6IFtdLFxuICAgICAgbWluZjogW10sXG4gICAgICBtb29mOiBbXSxcbiAgICAgIG1vb3Y6IFtdLFxuICAgICAgbXA0YTogW10sXG4gICAgICBtdmV4OiBbXSxcbiAgICAgIG12aGQ6IFtdLFxuICAgICAgc2R0cDogW10sXG4gICAgICBzdGJsOiBbXSxcbiAgICAgIHN0Y286IFtdLFxuICAgICAgc3RzYzogW10sXG4gICAgICBzdHNkOiBbXSxcbiAgICAgIHN0c3o6IFtdLFxuICAgICAgc3R0czogW10sXG4gICAgICB0ZmR0OiBbXSxcbiAgICAgIHRmaGQ6IFtdLFxuICAgICAgdHJhZjogW10sXG4gICAgICB0cmFrOiBbXSxcbiAgICAgIHRydW46IFtdLFxuICAgICAgdHJleDogW10sXG4gICAgICB0a2hkOiBbXSxcbiAgICAgIHZtaGQ6IFtdLFxuICAgICAgc21oZDogW11cbiAgICB9O1xuXG4gICAgdmFyIGk7XG4gICAgZm9yIChpIGluIE1QNC50eXBlcykge1xuICAgICAgaWYgKE1QNC50eXBlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICBNUDQudHlwZXNbaV0gPSBbXG4gICAgICAgICAgaS5jaGFyQ29kZUF0KDApLFxuICAgICAgICAgIGkuY2hhckNvZGVBdCgxKSxcbiAgICAgICAgICBpLmNoYXJDb2RlQXQoMiksXG4gICAgICAgICAgaS5jaGFyQ29kZUF0KDMpXG4gICAgICAgIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgTVA0Lk1BSk9SX0JSQU5EID0gbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgJ2knLmNoYXJDb2RlQXQoMCksXG4gICAgICAncycuY2hhckNvZGVBdCgwKSxcbiAgICAgICdvJy5jaGFyQ29kZUF0KDApLFxuICAgICAgJ20nLmNoYXJDb2RlQXQoMClcbiAgICBdKTtcbiAgICBNUDQuQVZDMV9CUkFORCA9IG5ldyBVaW50OEFycmF5KFtcbiAgICAgICdhJy5jaGFyQ29kZUF0KDApLFxuICAgICAgJ3YnLmNoYXJDb2RlQXQoMCksXG4gICAgICAnYycuY2hhckNvZGVBdCgwKSxcbiAgICAgICcxJy5jaGFyQ29kZUF0KDApXG4gICAgXSk7XG4gICAgTVA0Lk1JTk9SX1ZFUlNJT04gPSBuZXcgVWludDhBcnJheShbMCwgMCwgMCwgMV0pO1xuICAgIE1QNC5WSURFT19IRExSID0gbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMHgwMCwgLy8gdmVyc2lvbiAwXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAvLyBmbGFnc1xuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcHJlX2RlZmluZWRcbiAgICAgIDB4NzYsIDB4NjksIDB4NjQsIDB4NjUsIC8vIGhhbmRsZXJfdHlwZTogJ3ZpZGUnXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyByZXNlcnZlZFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHJlc2VydmVkXG4gICAgICAweDU2LCAweDY5LCAweDY0LCAweDY1LFxuICAgICAgMHg2ZiwgMHg0OCwgMHg2MSwgMHg2ZSxcbiAgICAgIDB4NjQsIDB4NmMsIDB4NjUsIDB4NzIsIDB4MDAgLy8gbmFtZTogJ1ZpZGVvSGFuZGxlcidcbiAgICBdKTtcbiAgICBNUDQuQVVESU9fSERMUiA9IG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDB4MDAsIC8vIHZlcnNpb24gMFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gZmxhZ3NcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHByZV9kZWZpbmVkXG4gICAgICAweDczLCAweDZmLCAweDc1LCAweDZlLCAvLyBoYW5kbGVyX3R5cGU6ICdzb3VuJ1xuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHJlc2VydmVkXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyByZXNlcnZlZFxuICAgICAgMHg1MywgMHg2ZiwgMHg3NSwgMHg2ZSxcbiAgICAgIDB4NjQsIDB4NDgsIDB4NjEsIDB4NmUsXG4gICAgICAweDY0LCAweDZjLCAweDY1LCAweDcyLCAweDAwIC8vIG5hbWU6ICdTb3VuZEhhbmRsZXInXG4gICAgXSk7XG4gICAgTVA0LkhETFJfVFlQRVMgPSB7XG4gICAgICAndmlkZW8nOk1QNC5WSURFT19IRExSLFxuICAgICAgJ2F1ZGlvJzpNUDQuQVVESU9fSERMUlxuICAgIH07XG4gICAgTVA0LkRSRUYgPSBuZXcgVWludDhBcnJheShbXG4gICAgICAweDAwLCAvLyB2ZXJzaW9uIDBcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIGZsYWdzXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAxLCAvLyBlbnRyeV9jb3VudFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwYywgLy8gZW50cnlfc2l6ZVxuICAgICAgMHg3NSwgMHg3MiwgMHg2YywgMHgyMCwgLy8gJ3VybCcgdHlwZVxuICAgICAgMHgwMCwgLy8gdmVyc2lvbiAwXG4gICAgICAweDAwLCAweDAwLCAweDAxIC8vIGVudHJ5X2ZsYWdzXG4gICAgXSk7XG4gICAgTVA0LlNUQ08gPSBuZXcgVWludDhBcnJheShbXG4gICAgICAweDAwLCAvLyB2ZXJzaW9uXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAvLyBmbGFnc1xuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCAvLyBlbnRyeV9jb3VudFxuICAgIF0pO1xuICAgIE1QNC5TVFNDID0gTVA0LlNUQ087XG4gICAgTVA0LlNUVFMgPSBNUDQuU1RDTztcbiAgICBNUDQuU1RTWiA9IG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDB4MDAsIC8vIHZlcnNpb25cbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIGZsYWdzXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBzYW1wbGVfc2l6ZVxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gc2FtcGxlX2NvdW50XG4gICAgXSk7XG4gICAgTVA0LlZNSEQgPSBuZXcgVWludDhBcnJheShbXG4gICAgICAweDAwLCAvLyB2ZXJzaW9uXG4gICAgICAweDAwLCAweDAwLCAweDAxLCAvLyBmbGFnc1xuICAgICAgMHgwMCwgMHgwMCwgLy8gZ3JhcGhpY3Ntb2RlXG4gICAgICAweDAwLCAweDAwLFxuICAgICAgMHgwMCwgMHgwMCxcbiAgICAgIDB4MDAsIDB4MDAgLy8gb3Bjb2xvclxuICAgIF0pO1xuICAgIE1QNC5TTUhEID0gbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMHgwMCwgLy8gdmVyc2lvblxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gZmxhZ3NcbiAgICAgIDB4MDAsIDB4MDAsIC8vIGJhbGFuY2VcbiAgICAgIDB4MDAsIDB4MDAgLy8gcmVzZXJ2ZWRcbiAgICBdKTtcblxuICAgIE1QNC5TVFNEID0gbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMHgwMCwgLy8gdmVyc2lvbiAwXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAvLyBmbGFnc1xuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMV0pOy8vIGVudHJ5X2NvdW50XG5cbiAgICBNUDQuRlRZUCA9IE1QNC5ib3goTVA0LnR5cGVzLmZ0eXAsIE1QNC5NQUpPUl9CUkFORCwgTVA0Lk1JTk9SX1ZFUlNJT04sIE1QNC5NQUpPUl9CUkFORCwgTVA0LkFWQzFfQlJBTkQpO1xuICAgIE1QNC5ESU5GID0gTVA0LmJveChNUDQudHlwZXMuZGluZiwgTVA0LmJveChNUDQudHlwZXMuZHJlZiwgTVA0LkRSRUYpKTtcbiAgfVxuXG4gIHN0YXRpYyBib3godHlwZSkge1xuICB2YXJcbiAgICBwYXlsb2FkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICBzaXplID0gMCxcbiAgICBpID0gcGF5bG9hZC5sZW5ndGgsXG4gICAgcmVzdWx0LFxuICAgIHZpZXc7XG5cbiAgICAvLyBjYWxjdWxhdGUgdGhlIHRvdGFsIHNpemUgd2UgbmVlZCB0byBhbGxvY2F0ZVxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHNpemUgKz0gcGF5bG9hZFtpXS5ieXRlTGVuZ3RoO1xuICAgIH1cbiAgICByZXN1bHQgPSBuZXcgVWludDhBcnJheShzaXplICsgOCk7XG4gICAgdmlldyA9IG5ldyBEYXRhVmlldyhyZXN1bHQuYnVmZmVyKTtcbiAgICB2aWV3LnNldFVpbnQzMigwLCByZXN1bHQuYnl0ZUxlbmd0aCk7XG4gICAgcmVzdWx0LnNldCh0eXBlLCA0KTtcblxuICAgIC8vIGNvcHkgdGhlIHBheWxvYWQgaW50byB0aGUgcmVzdWx0XG4gICAgZm9yIChpID0gMCwgc2l6ZSA9IDg7IGkgPCBwYXlsb2FkLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQuc2V0KHBheWxvYWRbaV0sIHNpemUpO1xuICAgICAgc2l6ZSArPSBwYXlsb2FkW2ldLmJ5dGVMZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdGF0aWMgaGRscih0eXBlKSB7XG4gICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLmhkbHIsIE1QNC5IRExSX1RZUEVTW3R5cGVdKTtcbiAgfVxuXG4gIHN0YXRpYyBtZGF0KGRhdGEpIHtcbiAgICByZXR1cm4gTVA0LmJveChNUDQudHlwZXMubWRhdCwgZGF0YSk7XG4gIH1cblxuICBzdGF0aWMgbWRoZCh0aW1lc2NhbGUsZHVyYXRpb24pIHtcbiAgICByZXR1cm4gTVA0LmJveChNUDQudHlwZXMubWRoZCwgbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMHgwMCwgLy8gdmVyc2lvbiAwXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAvLyBmbGFnc1xuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMiwgLy8gY3JlYXRpb25fdGltZVxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMywgLy8gbW9kaWZpY2F0aW9uX3RpbWVcbiAgICAgICh0aW1lc2NhbGUgPj4gMjQpICYgMHhGRixcbiAgICAgICh0aW1lc2NhbGUgPj4gMTYpICYgMHhGRixcbiAgICAgICh0aW1lc2NhbGUgPj4gIDgpICYgMHhGRixcbiAgICAgIHRpbWVzY2FsZSAmIDB4RkYsIC8vIHRpbWVzY2FsZVxuICAgICAgKGR1cmF0aW9uID4+IDI0KSxcbiAgICAgIChkdXJhdGlvbiA+PiAxNikgJiAweEZGLFxuICAgICAgKGR1cmF0aW9uID4+ICA4KSAmIDB4RkYsXG4gICAgICBkdXJhdGlvbiAmIDB4RkYsIC8vIGR1cmF0aW9uXG4gICAgICAweDU1LCAweGM0LCAvLyAndW5kJyBsYW5ndWFnZSAodW5kZXRlcm1pbmVkKVxuICAgICAgMHgwMCwgMHgwMFxuICAgIF0pKTtcbiAgfVxuXG4gIHN0YXRpYyBtZGlhKHRyYWNrKSB7XG4gICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLm1kaWEsIE1QNC5tZGhkKHRyYWNrLnRpbWVzY2FsZSx0cmFjay5kdXJhdGlvbiksIE1QNC5oZGxyKHRyYWNrLnR5cGUpLCBNUDQubWluZih0cmFjaykpO1xuICB9XG5cbiAgc3RhdGljIG1maGQoc2VxdWVuY2VOdW1iZXIpIHtcbiAgICByZXR1cm4gTVA0LmJveChNUDQudHlwZXMubWZoZCwgbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMHgwMCxcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIGZsYWdzXG4gICAgICAoc2VxdWVuY2VOdW1iZXIgPj4gMjQpLFxuICAgICAgKHNlcXVlbmNlTnVtYmVyID4+IDE2KSAmIDB4RkYsXG4gICAgICAoc2VxdWVuY2VOdW1iZXIgPj4gIDgpICYgMHhGRixcbiAgICAgIHNlcXVlbmNlTnVtYmVyICYgMHhGRiwgLy8gc2VxdWVuY2VfbnVtYmVyXG4gICAgXSkpO1xuICB9XG5cbiAgc3RhdGljIG1pbmYodHJhY2spIHtcbiAgICBpZiAodHJhY2sudHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLm1pbmYsIE1QNC5ib3goTVA0LnR5cGVzLnNtaGQsIE1QNC5TTUhEKSwgTVA0LkRJTkYsIE1QNC5zdGJsKHRyYWNrKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy5taW5mLCBNUDQuYm94KE1QNC50eXBlcy52bWhkLCBNUDQuVk1IRCksIE1QNC5ESU5GLCBNUDQuc3RibCh0cmFjaykpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBtb29mKHNuLCBiYXNlTWVkaWFEZWNvZGVUaW1lLCB0cmFjaykge1xuICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy5tb29mLFxuICAgICAgICAgICAgICAgICAgIE1QNC5tZmhkKHNuKSxcbiAgICAgICAgICAgICAgICAgICBNUDQudHJhZih0cmFjayxiYXNlTWVkaWFEZWNvZGVUaW1lKSk7XG4gIH1cbi8qKlxuICogQHBhcmFtIHRyYWNrcy4uLiAob3B0aW9uYWwpIHthcnJheX0gdGhlIHRyYWNrcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBtb3ZpZVxuICovXG4gIHN0YXRpYyBtb292KHRyYWNrcykge1xuICAgIHZhclxuICAgICAgaSA9IHRyYWNrcy5sZW5ndGgsXG4gICAgICBib3hlcyA9IFtdO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgYm94ZXNbaV0gPSBNUDQudHJhayh0cmFja3NbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiBNUDQuYm94LmFwcGx5KG51bGwsIFtNUDQudHlwZXMubW9vdiwgTVA0Lm12aGQodHJhY2tzWzBdLnRpbWVzY2FsZSx0cmFja3NbMF0uZHVyYXRpb24pXS5jb25jYXQoYm94ZXMpLmNvbmNhdChNUDQubXZleCh0cmFja3MpKSk7XG4gIH1cblxuICBzdGF0aWMgbXZleCh0cmFja3MpIHtcbiAgICB2YXJcbiAgICAgIGkgPSB0cmFja3MubGVuZ3RoLFxuICAgICAgYm94ZXMgPSBbXTtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGJveGVzW2ldID0gTVA0LnRyZXgodHJhY2tzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIE1QNC5ib3guYXBwbHkobnVsbCwgW01QNC50eXBlcy5tdmV4XS5jb25jYXQoYm94ZXMpKTtcbiAgfVxuXG4gIHN0YXRpYyBtdmhkKHRpbWVzY2FsZSxkdXJhdGlvbikge1xuICAgIHZhclxuICAgICAgYnl0ZXMgPSBuZXcgVWludDhBcnJheShbXG4gICAgICAgIDB4MDAsIC8vIHZlcnNpb24gMFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAvLyBmbGFnc1xuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAxLCAvLyBjcmVhdGlvbl90aW1lXG4gICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDIsIC8vIG1vZGlmaWNhdGlvbl90aW1lXG4gICAgICAgICh0aW1lc2NhbGUgPj4gMjQpICYgMHhGRixcbiAgICAgICAgKHRpbWVzY2FsZSA+PiAxNikgJiAweEZGLFxuICAgICAgICAodGltZXNjYWxlID4+ICA4KSAmIDB4RkYsXG4gICAgICAgIHRpbWVzY2FsZSAmIDB4RkYsIC8vIHRpbWVzY2FsZVxuICAgICAgICAoZHVyYXRpb24gPj4gMjQpICYgMHhGRixcbiAgICAgICAgKGR1cmF0aW9uID4+IDE2KSAmIDB4RkYsXG4gICAgICAgIChkdXJhdGlvbiA+PiAgOCkgJiAweEZGLFxuICAgICAgICBkdXJhdGlvbiAmIDB4RkYsIC8vIGR1cmF0aW9uXG4gICAgICAgIDB4MDAsIDB4MDEsIDB4MDAsIDB4MDAsIC8vIDEuMCByYXRlXG4gICAgICAgIDB4MDEsIDB4MDAsIC8vIDEuMCB2b2x1bWVcbiAgICAgICAgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgMHgwMSwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMSwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHg0MCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gdHJhbnNmb3JtYXRpb246IHVuaXR5IG1hdHJpeFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBwcmVfZGVmaW5lZFxuICAgICAgICAweGZmLCAweGZmLCAweGZmLCAweGZmIC8vIG5leHRfdHJhY2tfSURcbiAgICAgIF0pO1xuICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy5tdmhkLCBieXRlcyk7XG4gIH1cblxuICBzdGF0aWMgc2R0cCh0cmFjaykge1xuICAgIHZhclxuICAgICAgc2FtcGxlcyA9IHRyYWNrLnNhbXBsZXMgfHwgW10sXG4gICAgICBieXRlcyA9IG5ldyBVaW50OEFycmF5KDQgKyBzYW1wbGVzLmxlbmd0aCksXG4gICAgICBmbGFncyxcbiAgICAgIGk7XG5cbiAgICAvLyBsZWF2ZSB0aGUgZnVsbCBib3ggaGVhZGVyICg0IGJ5dGVzKSBhbGwgemVyb1xuXG4gICAgLy8gd3JpdGUgdGhlIHNhbXBsZSB0YWJsZVxuICAgIGZvciAoaSA9IDA7IGkgPCBzYW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmbGFncyA9IHNhbXBsZXNbaV0uZmxhZ3M7XG4gICAgICBieXRlc1tpICsgNF0gPSAoZmxhZ3MuZGVwZW5kc09uIDw8IDQpIHxcbiAgICAgICAgKGZsYWdzLmlzRGVwZW5kZWRPbiA8PCAyKSB8XG4gICAgICAgIChmbGFncy5oYXNSZWR1bmRhbmN5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gTVA0LmJveChNUDQudHlwZXMuc2R0cCxcbiAgICAgICAgICAgICAgIGJ5dGVzKTtcbiAgfVxuXG4gIHN0YXRpYyBzdGJsKHRyYWNrKSB7XG4gICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLnN0YmwsXG4gICAgICAgICAgICAgICBNUDQuc3RzZCh0cmFjayksXG4gICAgICAgICAgICAgICBNUDQuYm94KE1QNC50eXBlcy5zdHRzLCBNUDQuU1RUUyksXG4gICAgICAgICAgICAgICBNUDQuYm94KE1QNC50eXBlcy5zdHNjLCBNUDQuU1RTQyksXG4gICAgICAgICAgICAgICBNUDQuYm94KE1QNC50eXBlcy5zdHN6LCBNUDQuU1RTWiksXG4gICAgICAgICAgICAgICBNUDQuYm94KE1QNC50eXBlcy5zdGNvLCBNUDQuU1RDTykpO1xuICB9XG5cbiAgc3RhdGljIGF2YzEodHJhY2spIHtcbiAgICB2YXIgc3BzID0gW10sIHBwcyA9IFtdLCBpO1xuICAgIC8vIGFzc2VtYmxlIHRoZSBTUFNzXG4gICAgZm9yIChpID0gMDsgaSA8IHRyYWNrLnNwcy5sZW5ndGg7IGkrKykge1xuICAgICAgc3BzLnB1c2goKHRyYWNrLnNwc1tpXS5ieXRlTGVuZ3RoID4+PiA4KSAmIDB4RkYpO1xuICAgICAgc3BzLnB1c2goKHRyYWNrLnNwc1tpXS5ieXRlTGVuZ3RoICYgMHhGRikpOyAvLyBzZXF1ZW5jZVBhcmFtZXRlclNldExlbmd0aFxuICAgICAgc3BzID0gc3BzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0cmFjay5zcHNbaV0pKTsgLy8gU1BTXG4gICAgfVxuXG4gICAgLy8gYXNzZW1ibGUgdGhlIFBQU3NcbiAgICBmb3IgKGkgPSAwOyBpIDwgdHJhY2sucHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcHMucHVzaCgodHJhY2sucHBzW2ldLmJ5dGVMZW5ndGggPj4+IDgpICYgMHhGRik7XG4gICAgICBwcHMucHVzaCgodHJhY2sucHBzW2ldLmJ5dGVMZW5ndGggJiAweEZGKSk7XG4gICAgICBwcHMgPSBwcHMuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRyYWNrLnBwc1tpXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy5hdmMxLCBuZXcgVWludDhBcnJheShbXG4gICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHJlc2VydmVkXG4gICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHJlc2VydmVkXG4gICAgICAgIDB4MDAsIDB4MDEsIC8vIGRhdGFfcmVmZXJlbmNlX2luZGV4XG4gICAgICAgIDB4MDAsIDB4MDAsIC8vIHByZV9kZWZpbmVkXG4gICAgICAgIDB4MDAsIDB4MDAsIC8vIHJlc2VydmVkXG4gICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsXG4gICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsXG4gICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHByZV9kZWZpbmVkXG4gICAgICAgICh0cmFjay53aWR0aCA+PiA4KSAmIDB4RkYsXG4gICAgICAgIHRyYWNrLndpZHRoICYgMHhmZiwgLy8gd2lkdGhcbiAgICAgICAgKHRyYWNrLmhlaWdodCA+PiA4KSAmIDB4RkYsXG4gICAgICAgIHRyYWNrLmhlaWdodCAmIDB4ZmYsIC8vIGhlaWdodFxuICAgICAgICAweDAwLCAweDQ4LCAweDAwLCAweDAwLCAvLyBob3JpenJlc29sdXRpb25cbiAgICAgICAgMHgwMCwgMHg0OCwgMHgwMCwgMHgwMCwgLy8gdmVydHJlc29sdXRpb25cbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgMHgwMSwgLy8gZnJhbWVfY291bnRcbiAgICAgICAgMHgxMyxcbiAgICAgICAgMHg3NiwgMHg2OSwgMHg2NCwgMHg2NSxcbiAgICAgICAgMHg2ZiwgMHg2YSwgMHg3MywgMHgyZCxcbiAgICAgICAgMHg2MywgMHg2ZiwgMHg2ZSwgMHg3NCxcbiAgICAgICAgMHg3MiwgMHg2OSwgMHg2MiwgMHgyZCxcbiAgICAgICAgMHg2OCwgMHg2YywgMHg3MywgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gY29tcHJlc3Nvcm5hbWVcbiAgICAgICAgMHgwMCwgMHgxOCwgLy8gZGVwdGggPSAyNFxuICAgICAgICAweDExLCAweDExXSksIC8vIHByZV9kZWZpbmVkID0gLTFcbiAgICAgICAgICBNUDQuYm94KE1QNC50eXBlcy5hdmNDLCBuZXcgVWludDhBcnJheShbXG4gICAgICAgICAgICAweDAxLCAvLyBjb25maWd1cmF0aW9uVmVyc2lvblxuICAgICAgICAgICAgdHJhY2sucHJvZmlsZUlkYywgLy8gQVZDUHJvZmlsZUluZGljYXRpb25cbiAgICAgICAgICAgIHRyYWNrLnByb2ZpbGVDb21wYXQsIC8vIHByb2ZpbGVfY29tcGF0aWJpbGl0eVxuICAgICAgICAgICAgdHJhY2subGV2ZWxJZGMsIC8vIEFWQ0xldmVsSW5kaWNhdGlvblxuICAgICAgICAgICAgMHhmZiAvLyBsZW5ndGhTaXplTWludXNPbmUsIGhhcmQtY29kZWQgdG8gNCBieXRlc1xuICAgICAgICAgIF0uY29uY2F0KFtcbiAgICAgICAgICAgIHRyYWNrLnNwcy5sZW5ndGggLy8gbnVtT2ZTZXF1ZW5jZVBhcmFtZXRlclNldHNcbiAgICAgICAgICBdKS5jb25jYXQoc3BzKS5jb25jYXQoW1xuICAgICAgICAgICAgdHJhY2sucHBzLmxlbmd0aCAvLyBudW1PZlBpY3R1cmVQYXJhbWV0ZXJTZXRzXG4gICAgICAgICAgXSkuY29uY2F0KHBwcykpKSwgLy8gXCJQUFNcIlxuICAgICAgICAgIE1QNC5ib3goTVA0LnR5cGVzLmJ0cnQsIG5ldyBVaW50OEFycmF5KFtcbiAgICAgICAgICAgIDB4MDAsIDB4MWMsIDB4OWMsIDB4ODAsIC8vIGJ1ZmZlclNpemVEQlxuICAgICAgICAgICAgMHgwMCwgMHgyZCwgMHhjNiwgMHhjMCwgLy8gbWF4Qml0cmF0ZVxuICAgICAgICAgICAgMHgwMCwgMHgyZCwgMHhjNiwgMHhjMF0pKSAvLyBhdmdCaXRyYXRlXG4gICAgICAgICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBlc2RzKHRyYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDB4MDAsIC8vIHZlcnNpb24gMFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gZmxhZ3NcblxuICAgICAgMHgwMywgLy8gZGVzY3JpcHRvcl90eXBlXG4gICAgICAweDE3K3RyYWNrLmNvbmZpZy5sZW5ndGgsIC8vIGxlbmd0aFxuICAgICAgMHgwMCwgMHgwMSwgLy9lc19pZFxuICAgICAgMHgwMCwgLy8gc3RyZWFtX3ByaW9yaXR5XG5cbiAgICAgIDB4MDQsIC8vIGRlc2NyaXB0b3JfdHlwZVxuICAgICAgMHgwZit0cmFjay5jb25maWcubGVuZ3RoLCAvLyBsZW5ndGhcbiAgICAgIDB4NDAsIC8vY29kZWMgOiBtcGVnNF9hdWRpb1xuICAgICAgMHgxNSwgLy8gc3RyZWFtX3R5cGVcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIGJ1ZmZlcl9zaXplXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBtYXhCaXRyYXRlXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBhdmdCaXRyYXRlXG5cbiAgICAgIDB4MDUgLy8gZGVzY3JpcHRvcl90eXBlXG4gICAgICBdLmNvbmNhdChbdHJhY2suY29uZmlnLmxlbmd0aF0pLmNvbmNhdCh0cmFjay5jb25maWcpLmNvbmNhdChbMHgwNiwgMHgwMSwgMHgwMl0pKTsgLy8gR0FTcGVjaWZpY0NvbmZpZykpOyAvLyBsZW5ndGggKyBhdWRpbyBjb25maWcgZGVzY3JpcHRvclxuICB9XG5cbiAgc3RhdGljIG1wNGEodHJhY2spIHtcbiAgICAgICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLm1wNGEsIG5ldyBVaW50OEFycmF5KFtcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgMHgwMSwgLy8gZGF0YV9yZWZlcmVuY2VfaW5kZXhcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgICAgMHgwMCwgdHJhY2suY2hhbm5lbENvdW50LCAvLyBjaGFubmVsY291bnRcbiAgICAgICAgMHgwMCwgMHgxMCwgLy8gc2FtcGxlU2l6ZToxNmJpdHNcbiAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWQyXG4gICAgICAgICh0cmFjay5hdWRpb3NhbXBsZXJhdGUgPj4gOCkgJiAweEZGLFxuICAgICAgICB0cmFjay5hdWRpb3NhbXBsZXJhdGUgJiAweGZmLCAvL1xuICAgICAgICAweDAwLCAweDAwXSksXG4gICAgICAgIE1QNC5ib3goTVA0LnR5cGVzLmVzZHMsIE1QNC5lc2RzKHRyYWNrKSkpO1xuICB9XG5cbiAgc3RhdGljIHN0c2QodHJhY2spIHtcbiAgICBpZiAodHJhY2sudHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLnN0c2QsIE1QNC5TVFNEICwgTVA0Lm1wNGEodHJhY2spKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLnN0c2QsIE1QNC5TVFNEICwgTVA0LmF2YzEodHJhY2spKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdGtoZCh0cmFjaykge1xuICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy50a2hkLCBuZXcgVWludDhBcnJheShbXG4gICAgICAweDAwLCAvLyB2ZXJzaW9uIDBcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDcsIC8vIGZsYWdzXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBjcmVhdGlvbl90aW1lXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBtb2RpZmljYXRpb25fdGltZVxuICAgICAgKHRyYWNrLmlkID4+IDI0KSAmIDB4RkYsXG4gICAgICAodHJhY2suaWQgPj4gMTYpICYgMHhGRixcbiAgICAgICh0cmFjay5pZCA+PiA4KSAmIDB4RkYsXG4gICAgICB0cmFjay5pZCAmIDB4RkYsIC8vIHRyYWNrX0lEXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyByZXNlcnZlZFxuICAgICAgKHRyYWNrLmR1cmF0aW9uID4+IDI0KSxcbiAgICAgICh0cmFjay5kdXJhdGlvbiA+PiAxNikgJiAweEZGLFxuICAgICAgKHRyYWNrLmR1cmF0aW9uID4+ICA4KSAmIDB4RkYsXG4gICAgICB0cmFjay5kdXJhdGlvbiAmIDB4RkYsIC8vIGR1cmF0aW9uXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCwgLy8gcmVzZXJ2ZWRcbiAgICAgIDB4MDAsIDB4MDAsIC8vIGxheWVyXG4gICAgICAweDAwLCAweDAwLCAvLyBhbHRlcm5hdGVfZ3JvdXBcbiAgICAgIDB4MDAsIDB4MDAsIC8vIG5vbi1hdWRpbyB0cmFjayB2b2x1bWVcbiAgICAgIDB4MDAsIDB4MDAsIC8vIHJlc2VydmVkXG4gICAgICAweDAwLCAweDAxLCAweDAwLCAweDAwLFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgMHgwMCwgMHgwMSwgMHgwMCwgMHgwMCxcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMCxcbiAgICAgIDB4NDAsIDB4MDAsIDB4MDAsIDB4MDAsIC8vIHRyYW5zZm9ybWF0aW9uOiB1bml0eSBtYXRyaXhcbiAgICAgICh0cmFjay53aWR0aCA+PiA4KSAmIDB4RkYsXG4gICAgICB0cmFjay53aWR0aCAmIDB4RkYsXG4gICAgICAweDAwLCAweDAwLCAvLyB3aWR0aFxuICAgICAgKHRyYWNrLmhlaWdodCA+PiA4KSAmIDB4RkYsXG4gICAgICB0cmFjay5oZWlnaHQgJiAweEZGLFxuICAgICAgMHgwMCwgMHgwMCAvLyBoZWlnaHRcbiAgICBdKSk7XG4gIH1cblxuICBzdGF0aWMgdHJhZih0cmFjayxiYXNlTWVkaWFEZWNvZGVUaW1lKSB7XG4gICAgdmFyIHNhbXBsZURlcGVuZGVuY3lUYWJsZSA9IE1QNC5zZHRwKHRyYWNrKTtcbiAgICByZXR1cm4gTVA0LmJveChNUDQudHlwZXMudHJhZixcbiAgICAgICAgICAgICAgIE1QNC5ib3goTVA0LnR5cGVzLnRmaGQsIG5ldyBVaW50OEFycmF5KFtcbiAgICAgICAgICAgICAgICAgMHgwMCwgLy8gdmVyc2lvbiAwXG4gICAgICAgICAgICAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIC8vIGZsYWdzXG4gICAgICAgICAgICAgICAgICh0cmFjay5pZCA+PiAyNCksXG4gICAgICAgICAgICAgICAgICh0cmFjay5pZCA+PiAxNikgJiAwWEZGLFxuICAgICAgICAgICAgICAgICAodHJhY2suaWQgPj4gOCkgJiAwWEZGLFxuICAgICAgICAgICAgICAgICAodHJhY2suaWQgJiAweEZGKSAvLyB0cmFja19JRFxuICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgTVA0LmJveChNUDQudHlwZXMudGZkdCwgbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgICAgICAgICAgICAweDAwLCAvLyB2ZXJzaW9uIDBcbiAgICAgICAgICAgICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gZmxhZ3NcbiAgICAgICAgICAgICAgICAgKGJhc2VNZWRpYURlY29kZVRpbWUgPj4yNCksXG4gICAgICAgICAgICAgICAgIChiYXNlTWVkaWFEZWNvZGVUaW1lID4+IDE2KSAmIDBYRkYsXG4gICAgICAgICAgICAgICAgIChiYXNlTWVkaWFEZWNvZGVUaW1lID4+IDgpICYgMFhGRixcbiAgICAgICAgICAgICAgICAgKGJhc2VNZWRpYURlY29kZVRpbWUgJiAweEZGKSAvLyBiYXNlTWVkaWFEZWNvZGVUaW1lXG4gICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICBNUDQudHJ1bih0cmFjayxcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlRGVwZW5kZW5jeVRhYmxlLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgIDE2ICsgLy8gdGZoZFxuICAgICAgICAgICAgICAgICAgICAxNiArIC8vIHRmZHRcbiAgICAgICAgICAgICAgICAgICAgOCArICAvLyB0cmFmIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICAxNiArIC8vIG1maGRcbiAgICAgICAgICAgICAgICAgICAgOCArICAvLyBtb29mIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICA4KSwgIC8vIG1kYXQgaGVhZGVyXG4gICAgICAgICAgICAgICBzYW1wbGVEZXBlbmRlbmN5VGFibGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgdHJhY2sgYm94LlxuICAgKiBAcGFyYW0gdHJhY2sge29iamVjdH0gYSB0cmFjayBkZWZpbml0aW9uXG4gICAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9IHRoZSB0cmFjayBib3hcbiAgICovXG4gIHN0YXRpYyB0cmFrKHRyYWNrKSB7XG4gICAgdHJhY2suZHVyYXRpb24gPSB0cmFjay5kdXJhdGlvbiB8fCAweGZmZmZmZmZmO1xuICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy50cmFrLFxuICAgICAgICAgICAgICAgTVA0LnRraGQodHJhY2spLFxuICAgICAgICAgICAgICAgTVA0Lm1kaWEodHJhY2spKTtcbiAgfVxuXG4gIHN0YXRpYyB0cmV4KHRyYWNrKSB7XG4gICAgcmV0dXJuIE1QNC5ib3goTVA0LnR5cGVzLnRyZXgsIG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDB4MDAsIC8vIHZlcnNpb24gMFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgLy8gZmxhZ3NcbiAgICAgKHRyYWNrLmlkID4+IDI0KSxcbiAgICAgKHRyYWNrLmlkID4+IDE2KSAmIDBYRkYsXG4gICAgICh0cmFjay5pZCA+PiA4KSAmIDBYRkYsXG4gICAgICh0cmFjay5pZCAmIDB4RkYpLCAvLyB0cmFja19JRFxuICAgICAgMHgwMCwgMHgwMCwgMHgwMCwgMHgwMSwgLy8gZGVmYXVsdF9zYW1wbGVfZGVzY3JpcHRpb25faW5kZXhcbiAgICAgIDB4MDAsIDB4MDAsIDB4MDAsIDB4MDAsIC8vIGRlZmF1bHRfc2FtcGxlX2R1cmF0aW9uXG4gICAgICAweDAwLCAweDAwLCAweDAwLCAweDAwLCAvLyBkZWZhdWx0X3NhbXBsZV9zaXplXG4gICAgICAweDAwLCAweDAxLCAweDAwLCAweDAxIC8vIGRlZmF1bHRfc2FtcGxlX2ZsYWdzXG4gICAgXSkpO1xuICB9XG5cbiAgc3RhdGljIHRydW4odHJhY2ssIG9mZnNldCkge1xuICAgIHZhciBzYW1wbGVzLCBzYW1wbGUsIGksIGFycmF5O1xuXG4gICAgc2FtcGxlcyA9IHRyYWNrLnNhbXBsZXMgfHwgW107XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheSgxMiArICgxNiAqIHNhbXBsZXMubGVuZ3RoKSk7XG4gICAgb2Zmc2V0ICs9IDggKyBhcnJheS5ieXRlTGVuZ3RoO1xuXG4gICAgYXJyYXkuc2V0KFtcbiAgICAgIDB4MDAsIC8vIHZlcnNpb24gMFxuICAgICAgMHgwMCwgMHgwZiwgMHgwMSwgLy8gZmxhZ3NcbiAgICAgIChzYW1wbGVzLmxlbmd0aCA+Pj4gMjQpICYgMHhGRixcbiAgICAgIChzYW1wbGVzLmxlbmd0aCA+Pj4gMTYpICYgMHhGRixcbiAgICAgIChzYW1wbGVzLmxlbmd0aCA+Pj4gOCkgJiAweEZGLFxuICAgICAgc2FtcGxlcy5sZW5ndGggJiAweEZGLCAvLyBzYW1wbGVfY291bnRcbiAgICAgIChvZmZzZXQgPj4+IDI0KSAmIDB4RkYsXG4gICAgICAob2Zmc2V0ID4+PiAxNikgJiAweEZGLFxuICAgICAgKG9mZnNldCA+Pj4gOCkgJiAweEZGLFxuICAgICAgb2Zmc2V0ICYgMHhGRiAvLyBkYXRhX29mZnNldFxuICAgIF0sMCk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2FtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgc2FtcGxlID0gc2FtcGxlc1tpXTtcbiAgICAgIGFycmF5LnNldChbXG4gICAgICAgIChzYW1wbGUuZHVyYXRpb24gPj4+IDI0KSAmIDB4RkYsXG4gICAgICAgIChzYW1wbGUuZHVyYXRpb24gPj4+IDE2KSAmIDB4RkYsXG4gICAgICAgIChzYW1wbGUuZHVyYXRpb24gPj4+IDgpICYgMHhGRixcbiAgICAgICAgc2FtcGxlLmR1cmF0aW9uICYgMHhGRiwgLy8gc2FtcGxlX2R1cmF0aW9uXG4gICAgICAgIChzYW1wbGUuc2l6ZSA+Pj4gMjQpICYgMHhGRixcbiAgICAgICAgKHNhbXBsZS5zaXplID4+PiAxNikgJiAweEZGLFxuICAgICAgICAoc2FtcGxlLnNpemUgPj4+IDgpICYgMHhGRixcbiAgICAgICAgc2FtcGxlLnNpemUgJiAweEZGLCAvLyBzYW1wbGVfc2l6ZVxuICAgICAgICAoc2FtcGxlLmZsYWdzLmlzTGVhZGluZyA8PCAyKSB8IHNhbXBsZS5mbGFncy5kZXBlbmRzT24sXG4gICAgICAgIChzYW1wbGUuZmxhZ3MuaXNEZXBlbmRlZE9uIDw8IDYpIHxcbiAgICAgICAgICAoc2FtcGxlLmZsYWdzLmhhc1JlZHVuZGFuY3kgPDwgNCkgfFxuICAgICAgICAgIChzYW1wbGUuZmxhZ3MucGFkZGluZ1ZhbHVlIDw8IDEpIHxcbiAgICAgICAgICBzYW1wbGUuZmxhZ3MuaXNOb25TeW5jLFxuICAgICAgICBzYW1wbGUuZmxhZ3MuZGVncmFkUHJpbyAmIDB4RjAgPDwgOCxcbiAgICAgICAgc2FtcGxlLmZsYWdzLmRlZ3JhZFByaW8gJiAweDBGLCAvLyBzYW1wbGVfZmxhZ3NcbiAgICAgICAgKHNhbXBsZS5jdHMgPj4+IDI0KSAmIDB4RkYsXG4gICAgICAgIChzYW1wbGUuY3RzID4+PiAxNikgJiAweEZGLFxuICAgICAgICAoc2FtcGxlLmN0cyA+Pj4gOCkgJiAweEZGLFxuICAgICAgICBzYW1wbGUuY3RzICYgMHhGRiAvLyBzYW1wbGVfY29tcG9zaXRpb25fdGltZV9vZmZzZXRcbiAgICAgIF0sMTIrMTYqaSk7XG4gICAgfVxuICAgIHJldHVybiBNUDQuYm94KE1QNC50eXBlcy50cnVuLCBhcnJheSk7XG4gIH1cblxuICBzdGF0aWMgaW5pdFNlZ21lbnQodHJhY2tzKSB7XG5cbiAgICBpZighTVA0LnR5cGVzKSB7XG4gICAgICBNUDQuaW5pdCgpO1xuICAgIH1cbiAgICB2YXJcbiAgICAgIG1vdmllID0gTVA0Lm1vb3YodHJhY2tzKSxcbiAgICAgIHJlc3VsdDtcblxuICAgIHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KE1QNC5GVFlQLmJ5dGVMZW5ndGggKyBtb3ZpZS5ieXRlTGVuZ3RoKTtcbiAgICByZXN1bHQuc2V0KE1QNC5GVFlQKTtcbiAgICByZXN1bHQuc2V0KG1vdmllLCBNUDQuRlRZUC5ieXRlTGVuZ3RoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1QNDtcblxuXG4iLCIgLypcbiAqIFN0YXRzIEhhbmRsZXJcbiAqXG4gKi9cblxuaW1wb3J0IEV2ZW50ICAgICAgICAgICAgICAgIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCBvYnNlcnZlciAgICAgICAgICAgICBmcm9tICcuL29ic2VydmVyJztcblxuIGNsYXNzIFN0YXRzSGFuZGxlciB7XG5cbiAgY29uc3RydWN0b3IoaGxzKSB7XG4gICAgdGhpcy5obHM9aGxzO1xuICAgIHRoaXMub25tcCA9IHRoaXMub25NYW5pZmVzdFBhcnNlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25mYyA9IHRoaXMub25GcmFnbWVudENoYW5nZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uZmIgPSB0aGlzLm9uRnJhZ21lbnRCdWZmZXJlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25mbGVhID0gdGhpcy5vbkZyYWdtZW50TG9hZEVtZXJnZW5jeUFib3J0ZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uZXJyID0gdGhpcy5vbkVycm9yLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbmZwc2QgPSB0aGlzLm9uRlBTRHJvcC5iaW5kKHRoaXMpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50Lk1BTklGRVNUX1BBUlNFRCwgdGhpcy5vbm1wKTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5GUkFHX0JVRkZFUkVELCB0aGlzLm9uZmIpO1xuICAgIG9ic2VydmVyLm9uKEV2ZW50LkZSQUdfQ0hBTkdFRCwgdGhpcy5vbmZjKTtcbiAgICBvYnNlcnZlci5vbihFdmVudC5FUlJPUiwgdGhpcy5vbmVycik7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuRlJBR19MT0FEX0VNRVJHRU5DWV9BQk9SVEVELCB0aGlzLm9uZmxlYSk7XG4gICAgb2JzZXJ2ZXIub24oRXZlbnQuRlBTX0RST1AsIHRoaXMub25mcHNkKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgb2JzZXJ2ZXIub2ZmKEV2ZW50Lk1BTklGRVNUX1BBUlNFRCwgdGhpcy5vbm1wKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRlJBR19CVUZGRVJFRCwgdGhpcy5vbmZiKTtcbiAgICBvYnNlcnZlci5vZmYoRXZlbnQuRlJBR19DSEFOR0VELCB0aGlzLm9uZmMpO1xuICAgIG9ic2VydmVyLm9mZihFdmVudC5FUlJPUiwgdGhpcy5vbmVycik7XG4gICAgb2JzZXJ2ZXIub2ZmKEV2ZW50LkZSQUdfTE9BRF9FTUVSR0VOQ1lfQUJPUlRFRCwgdGhpcy5vbmZsZWEpO1xuICAgIG9ic2VydmVyLm9mZihFdmVudC5GUFNfRFJPUCwgdGhpcy5vbmZwc2QpO1xuICB9XG5cbiAgYXR0YWNoVmlkZW8odmlkZW8pIHtcbiAgICB0aGlzLnZpZGVvID0gdmlkZW87XG4gIH1cblxuICBkZXRhY2hWaWRlbygpIHtcbiAgICB0aGlzLnZpZGVvID0gbnVsbDtcbiAgfVxuXG4gIC8vIHJlc2V0IHN0YXRzIG9uIG1hbmlmZXN0IHBhcnNlZFxuICBvbk1hbmlmZXN0UGFyc2VkKGV2ZW50LGRhdGEpIHtcbiAgICB0aGlzLl9zdGF0cyA9IHsgdGVjaCA6ICdobHMuanMnLCBsZXZlbE5iIDogZGF0YS5sZXZlbHMubGVuZ3RofTtcbiAgfVxuXG4gIC8vIG9uIGZyYWdtZW50IGNoYW5nZWQgaXMgdHJpZ2dlcmVkIHdoZW5ldmVyIHBsYXliYWNrIG9mIGEgbmV3IGZyYWdtZW50IGlzIHN0YXJ0aW5nIC4uLlxuICBvbkZyYWdtZW50Q2hhbmdlZChldmVudCxkYXRhKSB7XG4gICAgdmFyIHN0YXRzID0gdGhpcy5fc3RhdHMsbGV2ZWwgPSBkYXRhLmZyYWcubGV2ZWwsYXV0b0xldmVsID0gZGF0YS5mcmFnLmF1dG9MZXZlbDtcbiAgICBpZihzdGF0cykge1xuICAgICAgaWYoc3RhdHMubGV2ZWxTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YXRzLmxldmVsU3RhcnQgPSBsZXZlbDtcbiAgICAgIH1cbiAgICAgIGlmKGF1dG9MZXZlbCkge1xuICAgICAgICBpZihzdGF0cy5mcmFnQ2hhbmdlZEF1dG8pIHtcbiAgICAgICAgICBzdGF0cy5hdXRvTGV2ZWxNaW4gPSBNYXRoLm1pbihzdGF0cy5hdXRvTGV2ZWxNaW4sbGV2ZWwpO1xuICAgICAgICAgIHN0YXRzLmF1dG9MZXZlbE1heCA9IE1hdGgubWF4KHN0YXRzLmF1dG9MZXZlbE1heCxsZXZlbCk7XG4gICAgICAgICAgc3RhdHMuZnJhZ0NoYW5nZWRBdXRvKys7XG4gICAgICAgICAgaWYodGhpcy5sZXZlbExhc3RBdXRvICYmIGxldmVsICE9PSBzdGF0cy5hdXRvTGV2ZWxMYXN0KSB7XG4gICAgICAgICAgICBzdGF0cy5hdXRvTGV2ZWxTd2l0Y2grKztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdHMuYXV0b0xldmVsTWluID0gc3RhdHMuYXV0b0xldmVsTWF4ID0gbGV2ZWw7XG4gICAgICAgICAgc3RhdHMuYXV0b0xldmVsU3dpdGNoID0gMDtcbiAgICAgICAgICBzdGF0cy5mcmFnQ2hhbmdlZEF1dG8gPSAxO1xuICAgICAgICAgIHRoaXMuc3VtQXV0b0xldmVsID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN1bUF1dG9MZXZlbCs9bGV2ZWw7XG4gICAgICAgIHN0YXRzLmF1dG9MZXZlbEF2ZyA9IE1hdGgucm91bmQoMTAwMCp0aGlzLnN1bUF1dG9MZXZlbC9zdGF0cy5mcmFnQ2hhbmdlZEF1dG8pLzEwMDA7XG4gICAgICAgIHN0YXRzLmF1dG9MZXZlbExhc3QgPSBsZXZlbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKHN0YXRzLmZyYWdDaGFuZ2VkTWFudWFsKSB7XG4gICAgICAgICAgc3RhdHMubWFudWFsTGV2ZWxNaW4gPSBNYXRoLm1pbihzdGF0cy5tYW51YWxMZXZlbE1pbixsZXZlbCk7XG4gICAgICAgICAgc3RhdHMubWFudWFsTGV2ZWxNYXggPSBNYXRoLm1heChzdGF0cy5tYW51YWxMZXZlbE1heCxsZXZlbCk7XG4gICAgICAgICAgc3RhdHMuZnJhZ0NoYW5nZWRNYW51YWwrKztcbiAgICAgICAgICBpZighdGhpcy5sZXZlbExhc3RBdXRvICYmIGxldmVsICE9PSBzdGF0cy5tYW51YWxMZXZlbExhc3QpIHtcbiAgICAgICAgICAgIHN0YXRzLm1hbnVhbExldmVsU3dpdGNoKys7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXRzLm1hbnVhbExldmVsTWluID0gc3RhdHMubWFudWFsTGV2ZWxNYXggPSBsZXZlbDtcbiAgICAgICAgICBzdGF0cy5tYW51YWxMZXZlbFN3aXRjaCA9IDA7XG4gICAgICAgICAgc3RhdHMuZnJhZ0NoYW5nZWRNYW51YWwgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRzLm1hbnVhbExldmVsTGFzdCA9IGxldmVsO1xuICAgICAgfVxuICAgICAgdGhpcy5sZXZlbExhc3RBdXRvID0gYXV0b0xldmVsO1xuICAgIH1cbiAgfVxuXG4gIC8vIHRyaWdnZXJlZCBlYWNoIHRpbWUgYSBuZXcgZnJhZ21lbnQgaXMgYnVmZmVyZWRcbiAgb25GcmFnbWVudEJ1ZmZlcmVkKGV2ZW50LGRhdGEpIHtcbiAgICB2YXIgc3RhdHMgPSB0aGlzLl9zdGF0cyxsYXRlbmN5ID0gZGF0YS5zdGF0cy50Zmlyc3QgLSBkYXRhLnN0YXRzLnRyZXF1ZXN0LCBwcm9jZXNzID0gZGF0YS5zdGF0cy50YnVmZmVyZWQgLSBkYXRhLnN0YXRzLnRyZXF1ZXN0LCBiaXRyYXRlID0gTWF0aC5yb3VuZCg4KmRhdGEuc3RhdHMubGVuZ3RoLyhkYXRhLnN0YXRzLnRidWZmZXJlZCAtIGRhdGEuc3RhdHMudGZpcnN0KSk7XG4gICAgaWYoc3RhdHMuZnJhZ0J1ZmZlcmVkKSB7XG4gICAgICBzdGF0cy5mcmFnTWluTGF0ZW5jeSA9IE1hdGgubWluKHN0YXRzLmZyYWdNaW5MYXRlbmN5LGxhdGVuY3kpO1xuICAgICAgc3RhdHMuZnJhZ01heExhdGVuY3kgPSBNYXRoLm1heChzdGF0cy5mcmFnTWF4TGF0ZW5jeSxsYXRlbmN5KTtcbiAgICAgIHN0YXRzLmZyYWdNaW5Qcm9jZXNzID0gTWF0aC5taW4oc3RhdHMuZnJhZ01pblByb2Nlc3MscHJvY2Vzcyk7XG4gICAgICBzdGF0cy5mcmFnTWF4UHJvY2VzcyA9IE1hdGgubWF4KHN0YXRzLmZyYWdNYXhQcm9jZXNzLHByb2Nlc3MpO1xuICAgICAgc3RhdHMuZnJhZ01pbkticHMgPSBNYXRoLm1pbihzdGF0cy5mcmFnTWluS2JwcyxiaXRyYXRlKTtcbiAgICAgIHN0YXRzLmZyYWdNYXhLYnBzID0gTWF0aC5tYXgoc3RhdHMuZnJhZ01heEticHMsYml0cmF0ZSk7XG4gICAgICBzdGF0cy5hdXRvTGV2ZWxDYXBwaW5nTWluID0gTWF0aC5taW4oc3RhdHMuYXV0b0xldmVsQ2FwcGluZ01pbix0aGlzLmhscy5hdXRvTGV2ZWxDYXBwaW5nKTtcbiAgICAgIHN0YXRzLmF1dG9MZXZlbENhcHBpbmdNYXggPSBNYXRoLm1heChzdGF0cy5hdXRvTGV2ZWxDYXBwaW5nTWF4LHRoaXMuaGxzLmF1dG9MZXZlbENhcHBpbmcpO1xuICAgICAgc3RhdHMuZnJhZ0J1ZmZlcmVkKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRzLmZyYWdNaW5MYXRlbmN5ID0gc3RhdHMuZnJhZ01heExhdGVuY3kgPSBsYXRlbmN5O1xuICAgICAgc3RhdHMuZnJhZ01pblByb2Nlc3MgPSBzdGF0cy5mcmFnTWF4UHJvY2VzcyA9IHByb2Nlc3M7XG4gICAgICBzdGF0cy5mcmFnTWluS2JwcyA9IHN0YXRzLmZyYWdNYXhLYnBzID0gYml0cmF0ZTtcbiAgICAgIHN0YXRzLmZyYWdCdWZmZXJlZCA9IDE7XG4gICAgICBzdGF0cy5mcmFnQnVmZmVyZWRCeXRlcyA9IDA7XG4gICAgICBzdGF0cy5hdXRvTGV2ZWxDYXBwaW5nTWluID0gc3RhdHMuYXV0b0xldmVsQ2FwcGluZ01heCA9IHRoaXMuaGxzLmF1dG9MZXZlbENhcHBpbmc7XG4gICAgICB0aGlzLnN1bUxhdGVuY3k9MDtcbiAgICAgIHRoaXMuc3VtS2Jwcz0wO1xuICAgICAgdGhpcy5zdW1Qcm9jZXNzPTA7XG4gICAgfVxuICAgIHN0YXRzLmZyYWdsYXN0TGF0ZW5jeT1sYXRlbmN5O1xuICAgIHRoaXMuc3VtTGF0ZW5jeSs9bGF0ZW5jeTtcbiAgICBzdGF0cy5mcmFnQXZnTGF0ZW5jeSA9IE1hdGgucm91bmQodGhpcy5zdW1MYXRlbmN5L3N0YXRzLmZyYWdCdWZmZXJlZCk7XG4gICAgc3RhdHMuZnJhZ0xhc3RQcm9jZXNzPXByb2Nlc3M7XG4gICAgdGhpcy5zdW1Qcm9jZXNzKz1wcm9jZXNzO1xuICAgIHN0YXRzLmZyYWdBdmdQcm9jZXNzID0gTWF0aC5yb3VuZCh0aGlzLnN1bVByb2Nlc3Mvc3RhdHMuZnJhZ0J1ZmZlcmVkKTtcbiAgICBzdGF0cy5mcmFnTGFzdEticHM9Yml0cmF0ZTtcbiAgICB0aGlzLnN1bUticHMrPWJpdHJhdGU7XG4gICAgc3RhdHMuZnJhZ0F2Z0ticHMgPSBNYXRoLnJvdW5kKHRoaXMuc3VtS2Jwcy9zdGF0cy5mcmFnQnVmZmVyZWQpO1xuICAgIHN0YXRzLmZyYWdCdWZmZXJlZEJ5dGVzKz1kYXRhLnN0YXRzLmxlbmd0aDtcbiAgICBzdGF0cy5hdXRvTGV2ZWxDYXBwaW5nTGFzdCA9IHRoaXMuaGxzLmF1dG9MZXZlbENhcHBpbmc7XG4gIH1cblxuICBvbkZyYWdtZW50TG9hZEVtZXJnZW5jeUFib3J0ZWQoKSB7XG4gICAgdmFyIHN0YXRzID0gdGhpcy5fc3RhdHM7XG4gICAgaWYoc3RhdHMpIHtcbiAgICAgIGlmKHN0YXRzLmZyYWdMb2FkRW1lcmdlbmN5QWJvcnRlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YXRzLmZyYWdMb2FkRW1lcmdlbmN5QWJvcnRlZCA9MTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRzLmZyYWdMb2FkRW1lcmdlbmN5QWJvcnRlZCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uRXJyb3IoZXZlbnQsZGF0YSkge1xuICAgIHZhciBzdGF0cyA9IHRoaXMuX3N0YXRzO1xuICAgIGlmKHN0YXRzKSB7XG4gICAgICAvLyB0cmFjayBhbGwgZXJyb3JzIGluZGVwZW5kZW50bHlcbiAgICAgIGlmKHN0YXRzW2RhdGEuZGV0YWlsc10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGF0c1tkYXRhLmRldGFpbHNdID0xO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHNbZGF0YS5kZXRhaWxzXSs9MTtcbiAgICAgIH1cbiAgICAgIC8vIHRyYWNrIGZhdGFsIGVycm9yXG4gICAgICBpZihkYXRhLmZhdGFsKSB7XG4gICAgICAgIGlmKHN0YXRzLmZhdGFsRXJyb3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3RhdHMuZmF0YWxFcnJvcj0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHMuZmF0YWxFcnJvcis9MTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uRlBTRHJvcChldmVudCxkYXRhKSB7XG4gICAgdmFyIHN0YXRzID0gdGhpcy5fc3RhdHM7XG4gICAgaWYoc3RhdHMpIHtcbiAgICAgaWYoc3RhdHMuZnBzRHJvcEV2ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhdHMuZnBzRHJvcEV2ZW50ID0xO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHMuZnBzRHJvcEV2ZW50Kys7XG4gICAgICB9XG4gICAgICBzdGF0cy5mcHNUb3RhbERyb3BwZWRGcmFtZXMgPSBkYXRhLnRvdGFsRHJvcHBlZEZyYW1lcztcbiAgICB9XG4gIH1cblxuICBnZXQgc3RhdHMoKSB7XG4gICAgaWYodGhpcy52aWRlbykge1xuICAgICAgdGhpcy5fc3RhdHMubGFzdFBvcyA9IHRoaXMudmlkZW8uY3VycmVudFRpbWUudG9GaXhlZCgzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXRzSGFuZGxlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbm9vcCgpe31cbmxldCBmYWtlTG9nZ2VyID0ge1xuICBsb2c6IG5vb3AsXG4gIHdhcm46IG5vb3AsXG4gIGluZm86IG5vb3AsXG4gIGVycm9yOiBub29wXG59O1xubGV0IGV4cG9ydGVkTG9nZ2VyID0gZmFrZUxvZ2dlcjtcblxuZXhwb3J0IHZhciBlbmFibGVMb2dzID0gZnVuY3Rpb24oZGVidWcpIHtcbiAgaWYgKGRlYnVnID09PSB0cnVlIHx8IHR5cGVvZiBkZWJ1ZyAgICAgICA9PT0gJ29iamVjdCcpIHtcbiAgICBleHBvcnRlZExvZ2dlci5sb2cgICA9IGRlYnVnLmxvZyAgID8gZGVidWcubG9nLmJpbmQoZGVidWcpICAgOiBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGV4cG9ydGVkTG9nZ2VyLmluZm8gID0gZGVidWcuaW5mbyAgPyBkZWJ1Zy5pbmZvLmJpbmQoZGVidWcpICA6IGNvbnNvbGUuaW5mby5iaW5kKGNvbnNvbGUpO1xuICAgIGV4cG9ydGVkTG9nZ2VyLmVycm9yID0gZGVidWcuZXJyb3IgPyBkZWJ1Zy5lcnJvci5iaW5kKGRlYnVnKSA6IGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtcbiAgICBleHBvcnRlZExvZ2dlci53YXJuICA9IGRlYnVnLndhcm4gID8gZGVidWcud2Fybi5iaW5kKGRlYnVnKSAgOiBjb25zb2xlLndhcm4uYmluZChjb25zb2xlKTtcblxuICAgIC8vIFNvbWUgYnJvd3NlcnMgZG9uJ3QgYWxsb3cgdG8gdXNlIGJpbmQgb24gY29uc29sZSBvYmplY3QgYW55d2F5XG4gICAgLy8gZmFsbGJhY2sgdG8gZGVmYXVsdCBpZiBuZWVkZWRcbiAgICB0cnkge1xuICAgICBleHBvcnRlZExvZ2dlci5sb2coKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIGV4cG9ydGVkTG9nZ2VyLmxvZyAgID0gbm9vcDtcbiAgICAgIGV4cG9ydGVkTG9nZ2VyLmluZm8gID0gbm9vcDtcbiAgICAgIGV4cG9ydGVkTG9nZ2VyLmVycm9yID0gbm9vcDtcbiAgICAgIGV4cG9ydGVkTG9nZ2VyLndhcm4gID0gbm9vcDtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgZXhwb3J0ZWRMb2dnZXIgPSBmYWtlTG9nZ2VyO1xuICB9XG59O1xuZXhwb3J0IHZhciBsb2dnZXIgPSBleHBvcnRlZExvZ2dlcjtcbiIsIiAvKlxuICAqIFhociBiYXNlZCBMb2FkZXJcbiAgKlxuICAqL1xuXG5pbXBvcnQge2xvZ2dlcn0gICAgICAgICAgICAgZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuIGNsYXNzIFhockxvYWRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuYWJvcnQoKTtcbiAgICB0aGlzLmxvYWRlciA9IG51bGw7XG4gIH1cblxuICBhYm9ydCgpIHtcbiAgICBpZih0aGlzLmxvYWRlciAmJnRoaXMubG9hZGVyLnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgIHRoaXMuc3RhdHMuYWJvcnRlZCA9IHRydWU7XG4gICAgICB0aGlzLmxvYWRlci5hYm9ydCgpO1xuICAgIH1cbiAgICBpZih0aGlzLnRpbWVvdXRIYW5kbGUpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SGFuZGxlKTtcbiAgICB9XG4gIH1cblxuICBsb2FkKHVybCxyZXNwb25zZVR5cGUsb25TdWNjZXNzLG9uRXJyb3Isb25UaW1lb3V0LHRpbWVvdXQsbWF4UmV0cnkscmV0cnlEZWxheSxvblByb2dyZXNzPW51bGwpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnJlc3BvbnNlVHlwZSA9IHJlc3BvbnNlVHlwZTtcbiAgICB0aGlzLm9uU3VjY2VzcyA9IG9uU3VjY2VzcztcbiAgICB0aGlzLm9uUHJvZ3Jlc3MgPSBvblByb2dyZXNzO1xuICAgIHRoaXMub25UaW1lb3V0ID0gb25UaW1lb3V0O1xuICAgIHRoaXMub25FcnJvciA9IG9uRXJyb3I7XG4gICAgdGhpcy5zdGF0cyA9IHsgdHJlcXVlc3Q6bmV3IERhdGUoKSwgcmV0cnk6MH07XG4gICAgdGhpcy50aW1lb3V0ID0gdGltZW91dDtcbiAgICB0aGlzLm1heFJldHJ5ID0gbWF4UmV0cnk7XG4gICAgdGhpcy5yZXRyeURlbGF5ID0gcmV0cnlEZWxheTtcbiAgICB0aGlzLnRpbWVvdXRIYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLmxvYWR0aW1lb3V0LmJpbmQodGhpcyksdGltZW91dCk7XG4gICAgdGhpcy5sb2FkSW50ZXJuYWwoKTtcbiAgfVxuXG4gIGxvYWRJbnRlcm5hbCgpIHtcbiAgICB2YXIgeGhyID0gdGhpcy5sb2FkZXIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub25sb2FkID0gIHRoaXMubG9hZHN1Y2Nlc3MuYmluZCh0aGlzKTtcbiAgICB4aHIub25lcnJvciA9IHRoaXMubG9hZGVycm9yLmJpbmQodGhpcyk7XG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSB0aGlzLmxvYWRwcm9ncmVzcy5iaW5kKHRoaXMpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB0aGlzLnVybCAsIHRydWUpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLnJlc3BvbnNlVHlwZTtcbiAgICB0aGlzLnN0YXRzLnRmaXJzdCA9IG51bGw7XG4gICAgdGhpcy5zdGF0cy5sb2FkZWQgPSAwO1xuICAgIHhoci5zZW5kKCk7XG4gIH1cblxuICBsb2Fkc3VjY2VzcyhldmVudCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SGFuZGxlKTtcbiAgICB0aGlzLnN0YXRzLnRsb2FkID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLm9uU3VjY2VzcyhldmVudCx0aGlzLnN0YXRzKTtcbiAgfVxuXG4gIGxvYWRlcnJvcihldmVudCkge1xuICAgIGlmKHRoaXMuc3RhdHMucmV0cnkgPCB0aGlzLm1heFJldHJ5KSB7XG4gICAgICBsb2dnZXIud2FybihgJHtldmVudC50eXBlfSB3aGlsZSBsb2FkaW5nICR7dGhpcy51cmx9LCByZXRyeWluZyBpbiAke3RoaXMucmV0cnlEZWxheX0uLi5gKTtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5sb2FkSW50ZXJuYWwuYmluZCh0aGlzKSx0aGlzLnJldHJ5RGVsYXkpO1xuICAgICAgLy8gZXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgdGhpcy5yZXRyeURlbGF5PU1hdGgubWluKDIqdGhpcy5yZXRyeURlbGF5LDY0MDAwKTtcbiAgICAgIHRoaXMuc3RhdHMucmV0cnkrKztcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRIYW5kbGUpO1xuICAgICAgbG9nZ2VyLmVycm9yKGAke2V2ZW50LnR5cGV9IHdoaWxlIGxvYWRpbmcgJHt0aGlzLnVybH1gICk7XG4gICAgICB0aGlzLm9uRXJyb3IoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGxvYWR0aW1lb3V0KGV2ZW50KSB7XG4gICAgbG9nZ2VyLndhcm4oYHRpbWVvdXQgd2hpbGUgbG9hZGluZyAke3RoaXMudXJsfWAgKTtcbiAgICB0aGlzLm9uVGltZW91dChldmVudCx0aGlzLnN0YXRzKTtcbiAgfVxuXG4gIGxvYWRwcm9ncmVzcyhldmVudCkge1xuICAgIHZhciBzdGF0cyA9IHRoaXMuc3RhdHM7XG4gICAgaWYoc3RhdHMudGZpcnN0ID09PSBudWxsKSB7XG4gICAgICBzdGF0cy50Zmlyc3QgPSBuZXcgRGF0ZSgpO1xuICAgIH1cbiAgICBzdGF0cy5sb2FkZWQgPSBldmVudC5sb2FkZWQ7XG4gICAgaWYodGhpcy5vblByb2dyZXNzKSB7XG4gICAgICB0aGlzLm9uUHJvZ3Jlc3MoZXZlbnQsIHN0YXRzKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWGhyTG9hZGVyO1xuIl19

function X2JS(a,b,c){function d(a){var b=a.localName;return null==b&&(b=a.baseName),(null==b||""==b)&&(b=a.nodeName),b}function e(a){return a.prefix}function f(a){return"string"==typeof a?a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"):a}function g(a){return a.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#x2F;/g,"/")}function h(f){if(f.nodeType==u.DOCUMENT_NODE){var i,j,k,l=f.firstChild;for(j=0,k=f.childNodes.length;k>j;j+=1)if(f.childNodes[j].nodeType!==u.COMMENT_NODE){l=f.childNodes[j];break}if(c)i=h(l);else{i={};var m=d(l);i[m]=h(l)}return i}if(f.nodeType==u.ELEMENT_NODE){var i=new Object;i.__cnt=0;for(var n=[],o=f.childNodes,p=0;p<o.length;p++){var l=o.item(p),m=d(l);if(i.__cnt++,null==i[m]){var q=h(l);if("#text"!=m||/[^\s]/.test(q)){var r={};r[m]=q,n.push(r)}i[m]=q,i[m+"_asArray"]=new Array(1),i[m+"_asArray"][0]=i[m]}else{if(null!=i[m]&&!(i[m]instanceof Array)){var s=i[m];i[m]=new Array,i[m][0]=s,i[m+"_asArray"]=i[m]}for(var v=0;null!=i[m][v];)v++;var q=h(l);if("#text"!=m||/[^\s]/.test(q)){var r={};r[m]=q,n.push(r)}i[m][v]=q}}i.__children=n;for(var w=0;w<f.attributes.length;w++){var x=f.attributes.item(w);i.__cnt++;for(var y=x.value,z=0,A=a.length;A>z;z++){var B=a[z];B.test.call(this,x)&&(y=B.converter.call(this,x.value))}i[b+x.name]=y}var C=e(f);return null!=C&&""!=C&&(i.__cnt++,i.__prefix=C),1==i.__cnt&&null!=i["#text"]&&(i=i["#text"]),null!=i["#text"]&&(i.__text=i["#text"],t&&(i.__text=g(i.__text)),delete i["#text"],delete i["#text_asArray"]),null!=i["#cdata-section"]&&(i.__cdata=i["#cdata-section"],delete i["#cdata-section"],delete i["#cdata-section_asArray"]),(null!=i.__text||null!=i.__cdata)&&(i.toString=function(){return(null!=this.__text?this.__text:"")+(null!=this.__cdata?this.__cdata:"")}),i}return f.nodeType==u.TEXT_NODE||f.nodeType==u.CDATA_SECTION_NODE?f.nodeValue:f.nodeType==u.COMMENT_NODE?null:void 0}function i(a,b,c,d){var e="<"+(null!=a&&null!=a.__prefix?a.__prefix+":":"")+b;if(null!=c)for(var f=0;f<c.length;f++){var g=c[f],h=a[g];e+=" "+g.substr(1)+"='"+h+"'"}return e+=d?"/>":">"}function j(a,b){return"</"+(null!=a.__prefix?a.__prefix+":":"")+b+">"}function k(a,b){return-1!==a.indexOf(b,a.length-b.length)}function l(a,b){return k(b.toString(),"_asArray")||0==b.toString().indexOf("_")||a[b]instanceof Function?!0:!1}function m(a){var b=0;if(a instanceof Object)for(var c in a)l(a,c)||b++;return b}function n(a){var b=[];if(a instanceof Object)for(var c in a)-1==c.toString().indexOf("__")&&0==c.toString().indexOf("_")&&b.push(c);return b}function o(a){var b="";return null!=a.__cdata&&(b+="<![CDATA["+a.__cdata+"]]>"),null!=a.__text&&(b+=t?f(a.__text):a.__text),b}function p(a){var b="";return a instanceof Object?b+=o(a):null!=a&&(b+=t?f(a):a),b}function q(a,b,c){var d="";if(0==a.length)d+=i(a,b,c,!0);else for(var e=0;e<a.length;e++)d+=i(a[e],b,n(a[e]),!1),d+=r(a[e]),d+=j(a[e],b);return d}function r(a){var b="",c=m(a);if(c>0)for(var d in a)if(!l(a,d)){var e=a[d],f=n(e);if(null==e||void 0==e)b+=i(e,d,f,!0);else if(e instanceof Object)if(e instanceof Array)b+=q(e,d,f);else{var g=m(e);g>0||null!=e.__text||null!=e.__cdata?(b+=i(e,d,f,!1),b+=r(e),b+=j(e,d)):b+=i(e,d,f,!0)}else b+=i(e,d,f,!1),b+=p(e),b+=j(e,d)}return b+=p(a)}(null===b||void 0===b)&&(b="_"),(null===c||void 0===c)&&(c=!1);var s="1.0.11",t=!1,u={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};this.parseXmlString=function(a){var b;if(window.DOMParser){var c=new window.DOMParser;b=c.parseFromString(a,"text/xml")}else 0==a.indexOf("<?")&&(a=a.substr(a.indexOf("?>")+2)),b=new ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a);return b},this.xml2json=function(a){return h(a)},this.xml_str2json=function(a){var b=this.parseXmlString(a);return this.xml2json(b)},this.json2xml_str=function(a){return r(a)},this.json2xml=function(a){var b=this.json2xml_str(a);return this.parseXmlString(b)},this.getVersion=function(){return s},this.escapeMode=function(a){t=a}}function ObjectIron(a){var b;for(b=[],i=0,len=a.length;i<len;i+=1)a[i].isRoot?b.push("root"):b.push(a[i].name);var c=function(a,b){var c;if(null!==a&&null!==b)for(c in a)a.hasOwnProperty(c)&&(b.hasOwnProperty(c)||(b[c]=a[c]))},d=function(a,b,d){var e,f,g,h,i;if(null!==a&&0!==a.length)for(e=0,f=a.length;f>e;e+=1)g=a[e],b.hasOwnProperty(g.name)&&(d.hasOwnProperty(g.name)?g.merge&&(h=b[g.name],i=d[g.name],"object"==typeof h&&"object"==typeof i?c(h,i):null!=g.mergeFunction?d[g.name]=g.mergeFunction(h,i):d[g.name]=h+i):d[g.name]=b[g.name])},e=function(a,b){var c,f,g,h,i,j,k,l=a;if(null!==l.children&&0!==l.children.length)for(c=0,f=l.children.length;f>c;c+=1)if(j=l.children[c],b.hasOwnProperty(j.name))if(j.isArray)for(i=b[j.name+"_asArray"],g=0,h=i.length;h>g;g+=1)k=i[g],d(l.properties,b,k),e(j,k);else k=b[j.name],d(l.properties,b,k),e(j,k)},f=function(c){var d,g,h,i,j,k,l;if(null===c)return c;if("object"!=typeof c)return c;for(d=0,g=b.length;g>d;d+=1)"root"===b[d]&&(j=a[d],k=c,e(j,k));for(i in c)if(c.hasOwnProperty(i)&&"__children"!=i){if(h=b.indexOf(i),-1!==h)if(j=a[h],j.isArray)for(l=c[i+"_asArray"],d=0,g=l.length;g>d;d+=1)k=l[d],e(j,k);else k=c[i],e(j,k);f(c[i])}return c};return{run:f}}if(function(a){"use strict";var b={VERSION:"0.5.3"};b.System=function(){this._mappings={},this._outlets={},this._handlers={},this.strictInjections=!0,this.autoMapOutlets=!1,this.postInjectionHook="setup"},b.System.prototype={_createAndSetupInstance:function(a,b){var c=new b;return this.injectInto(c,a),c},_retrieveFromCacheOrCreate:function(a,b){"undefined"==typeof b&&(b=!1);var c;if(!this._mappings.hasOwnProperty(a))throw new Error(1e3);var d=this._mappings[a];return!b&&d.isSingleton?(null==d.object&&(d.object=this._createAndSetupInstance(a,d.clazz)),c=d.object):c=d.clazz?this._createAndSetupInstance(a,d.clazz):d.object,c},mapOutlet:function(a,b,c){if("undefined"==typeof a)throw new Error(1010);return b=b||"global",c=c||a,this._outlets.hasOwnProperty(b)||(this._outlets[b]={}),this._outlets[b][c]=a,this},getObject:function(a){if("undefined"==typeof a)throw new Error(1020);return this._retrieveFromCacheOrCreate(a)},mapValue:function(a,b){if("undefined"==typeof a)throw new Error(1030);return this._mappings[a]={clazz:null,object:b,isSingleton:!0},this.autoMapOutlets&&this.mapOutlet(a),this.hasMapping(a)&&this.injectInto(b,a),this},hasMapping:function(a){if("undefined"==typeof a)throw new Error(1040);return this._mappings.hasOwnProperty(a)},mapClass:function(a,b){if("undefined"==typeof a)throw new Error(1050);if("undefined"==typeof b)throw new Error(1051);return this._mappings[a]={clazz:b,object:null,isSingleton:!1},this.autoMapOutlets&&this.mapOutlet(a),this},mapSingleton:function(a,b){if("undefined"==typeof a)throw new Error(1060);if("undefined"==typeof b)throw new Error(1061);return this._mappings[a]={clazz:b,object:null,isSingleton:!0},this.autoMapOutlets&&this.mapOutlet(a),this},instantiate:function(a){if("undefined"==typeof a)throw new Error(1070);return this._retrieveFromCacheOrCreate(a,!0)},injectInto:function(a,b){if("undefined"==typeof a)throw new Error(1080);if("object"==typeof a){var c=[];this._outlets.hasOwnProperty("global")&&c.push(this._outlets.global),"undefined"!=typeof b&&this._outlets.hasOwnProperty(b)&&c.push(this._outlets[b]);for(var d in c){var e=c[d];for(var f in e){var g=e[f];(!this.strictInjections||f in a)&&(a[f]=this.getObject(g))}}"setup"in a&&a.setup.call(a)}return this},unmap:function(a){if("undefined"==typeof a)throw new Error(1090);return delete this._mappings[a],this},unmapOutlet:function(a,b){if("undefined"==typeof a)throw new Error(1100);if("undefined"==typeof b)throw new Error(1101);return delete this._outlets[a][b],this},mapHandler:function(a,b,c,d,e){if("undefined"==typeof a)throw new Error(1110);return b=b||"global",c=c||a,"undefined"==typeof d&&(d=!1),"undefined"==typeof e&&(e=!1),this._handlers.hasOwnProperty(a)||(this._handlers[a]={}),this._handlers[a].hasOwnProperty(b)||(this._handlers[a][b]=[]),this._handlers[a][b].push({handler:c,oneShot:d,passEvent:e}),this},unmapHandler:function(a,b,c){if("undefined"==typeof a)throw new Error(1120);if(b=b||"global",c=c||a,this._handlers.hasOwnProperty(a)&&this._handlers[a].hasOwnProperty(b)){var d=this._handlers[a][b];for(var e in d){var f=d[e];if(f.handler===c){d.splice(e,1);break}}}return this},notify:function(a){if("undefined"==typeof a)throw new Error(1130);var b=Array.prototype.slice.call(arguments),c=b.slice(1);if(this._handlers.hasOwnProperty(a)){var d=this._handlers[a];for(var e in d){var f,g=d[e];"global"!==e&&(f=this.getObject(e));var h,i,j=[];for(h=0,i=g.length;i>h;h++){var k,l=g[h];k=f&&"string"==typeof l.handler?f[l.handler]:l.handler,l.oneShot&&j.unshift(h),l.passEvent?k.apply(f,b):k.apply(f,c)}for(h=0,i=j.length;i>h;h++)g.splice(j[h],1)}}return this}},a.dijon=b}(this),"undefined"==typeof utils)var utils={};"undefined"==typeof utils.Math&&(utils.Math={}),utils.Math.to64BitNumber=function(a,b){var c,d,e;return c=new goog.math.Long(0,b),d=new goog.math.Long(a,0),e=c.add(d),e.toNumber()},goog={},goog.math={},goog.math.Long=function(a,b){this.low_=0|a,this.high_=0|b},goog.math.Long.IntCache_={},goog.math.Long.fromInt=function(a){if(a>=-128&&128>a){var b=goog.math.Long.IntCache_[a];if(b)return b}var c=new goog.math.Long(0|a,0>a?-1:0);return a>=-128&&128>a&&(goog.math.Long.IntCache_[a]=c),c},goog.math.Long.fromNumber=function(a){return isNaN(a)||!isFinite(a)?goog.math.Long.ZERO:a<=-goog.math.Long.TWO_PWR_63_DBL_?goog.math.Long.MIN_VALUE:a+1>=goog.math.Long.TWO_PWR_63_DBL_?goog.math.Long.MAX_VALUE:0>a?goog.math.Long.fromNumber(-a).negate():new goog.math.Long(a%goog.math.Long.TWO_PWR_32_DBL_|0,a/goog.math.Long.TWO_PWR_32_DBL_|0)},goog.math.Long.fromBits=function(a,b){return new goog.math.Long(a,b)},goog.math.Long.fromString=function(a,b){if(0==a.length)throw Error("number format error: empty string");var c=b||10;if(2>c||c>36)throw Error("radix out of range: "+c);if("-"==a.charAt(0))return goog.math.Long.fromString(a.substring(1),c).negate();if(a.indexOf("-")>=0)throw Error('number format error: interior "-" character: '+a);for(var d=goog.math.Long.fromNumber(Math.pow(c,8)),e=goog.math.Long.ZERO,f=0;f<a.length;f+=8){var g=Math.min(8,a.length-f),h=parseInt(a.substring(f,f+g),c);if(8>g){var i=goog.math.Long.fromNumber(Math.pow(c,g));e=e.multiply(i).add(goog.math.Long.fromNumber(h))}else e=e.multiply(d),e=e.add(goog.math.Long.fromNumber(h))}return e},goog.math.Long.TWO_PWR_16_DBL_=65536,goog.math.Long.TWO_PWR_24_DBL_=1<<24,goog.math.Long.TWO_PWR_32_DBL_=goog.math.Long.TWO_PWR_16_DBL_*goog.math.Long.TWO_PWR_16_DBL_,goog.math.Long.TWO_PWR_31_DBL_=goog.math.Long.TWO_PWR_32_DBL_/2,goog.math.Long.TWO_PWR_48_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_16_DBL_,goog.math.Long.TWO_PWR_64_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_32_DBL_,goog.math.Long.TWO_PWR_63_DBL_=goog.math.Long.TWO_PWR_64_DBL_/2,goog.math.Long.ZERO=goog.math.Long.fromInt(0),goog.math.Long.ONE=goog.math.Long.fromInt(1),goog.math.Long.NEG_ONE=goog.math.Long.fromInt(-1),goog.math.Long.MAX_VALUE=goog.math.Long.fromBits(-1,2147483647),goog.math.Long.MIN_VALUE=goog.math.Long.fromBits(0,-2147483648),goog.math.Long.TWO_PWR_24_=goog.math.Long.fromInt(1<<24),goog.math.Long.prototype.toInt=function(){return this.low_},goog.math.Long.prototype.toNumber=function(){return this.high_*goog.math.Long.TWO_PWR_32_DBL_+this.getLowBitsUnsigned()},goog.math.Long.prototype.toString=function(a){var b=a||10;if(2>b||b>36)throw Error("radix out of range: "+b);if(this.isZero())return"0";if(this.isNegative()){if(this.equals(goog.math.Long.MIN_VALUE)){var c=goog.math.Long.fromNumber(b),d=this.div(c),e=d.multiply(c).subtract(this);return d.toString(b)+e.toInt().toString(b)}return"-"+this.negate().toString(b)}for(var f=goog.math.Long.fromNumber(Math.pow(b,6)),e=this,g="";;){var h=e.div(f),i=e.subtract(h.multiply(f)).toInt(),j=i.toString(b);if(e=h,e.isZero())return j+g;for(;j.length<6;)j="0"+j;g=""+j+g}},goog.math.Long.prototype.getHighBits=function(){return this.high_},goog.math.Long.prototype.getLowBits=function(){return this.low_},goog.math.Long.prototype.getLowBitsUnsigned=function(){return this.low_>=0?this.low_:goog.math.Long.TWO_PWR_32_DBL_+this.low_},goog.math.Long.prototype.getNumBitsAbs=function(){if(this.isNegative())return this.equals(goog.math.Long.MIN_VALUE)?64:this.negate().getNumBitsAbs();for(var a=0!=this.high_?this.high_:this.low_,b=31;b>0&&0==(a&1<<b);b--);return 0!=this.high_?b+33:b+1},goog.math.Long.prototype.isZero=function(){return 0==this.high_&&0==this.low_},goog.math.Long.prototype.isNegative=function(){return this.high_<0},goog.math.Long.prototype.isOdd=function(){return 1==(1&this.low_)},goog.math.Long.prototype.equals=function(a){return this.high_==a.high_&&this.low_==a.low_},goog.math.Long.prototype.notEquals=function(a){return this.high_!=a.high_||this.low_!=a.low_},goog.math.Long.prototype.lessThan=function(a){return this.compare(a)<0},goog.math.Long.prototype.lessThanOrEqual=function(a){return this.compare(a)<=0},goog.math.Long.prototype.greaterThan=function(a){return this.compare(a)>0},goog.math.Long.prototype.greaterThanOrEqual=function(a){return this.compare(a)>=0},goog.math.Long.prototype.compare=function(a){if(this.equals(a))return 0;var b=this.isNegative(),c=a.isNegative();return b&&!c?-1:!b&&c?1:this.subtract(a).isNegative()?-1:1},goog.math.Long.prototype.negate=function(){return this.equals(goog.math.Long.MIN_VALUE)?goog.math.Long.MIN_VALUE:this.not().add(goog.math.Long.ONE)},goog.math.Long.prototype.add=function(a){var b=this.high_>>>16,c=65535&this.high_,d=this.low_>>>16,e=65535&this.low_,f=a.high_>>>16,g=65535&a.high_,h=a.low_>>>16,i=65535&a.low_,j=0,k=0,l=0,m=0;return m+=e+i,l+=m>>>16,m&=65535,l+=d+h,k+=l>>>16,l&=65535,k+=c+g,j+=k>>>16,k&=65535,j+=b+f,j&=65535,goog.math.Long.fromBits(l<<16|m,j<<16|k)},goog.math.Long.prototype.subtract=function(a){return this.add(a.negate())},goog.math.Long.prototype.multiply=function(a){if(this.isZero())return goog.math.Long.ZERO;if(a.isZero())return goog.math.Long.ZERO;if(this.equals(goog.math.Long.MIN_VALUE))return a.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO;if(a.equals(goog.math.Long.MIN_VALUE))return this.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO;if(this.isNegative())return a.isNegative()?this.negate().multiply(a.negate()):this.negate().multiply(a).negate();if(a.isNegative())return this.multiply(a.negate()).negate();if(this.lessThan(goog.math.Long.TWO_PWR_24_)&&a.lessThan(goog.math.Long.TWO_PWR_24_))return goog.math.Long.fromNumber(this.toNumber()*a.toNumber());var b=this.high_>>>16,c=65535&this.high_,d=this.low_>>>16,e=65535&this.low_,f=a.high_>>>16,g=65535&a.high_,h=a.low_>>>16,i=65535&a.low_,j=0,k=0,l=0,m=0;return m+=e*i,l+=m>>>16,m&=65535,l+=d*i,k+=l>>>16,l&=65535,l+=e*h,k+=l>>>16,l&=65535,k+=c*i,j+=k>>>16,k&=65535,k+=d*h,j+=k>>>16,k&=65535,k+=e*g,j+=k>>>16,k&=65535,j+=b*i+c*h+d*g+e*f,j&=65535,goog.math.Long.fromBits(l<<16|m,j<<16|k)},goog.math.Long.prototype.div=function(a){if(a.isZero())throw Error("division by zero");if(this.isZero())return goog.math.Long.ZERO;if(this.equals(goog.math.Long.MIN_VALUE)){if(a.equals(goog.math.Long.ONE)||a.equals(goog.math.Long.NEG_ONE))return goog.math.Long.MIN_VALUE;if(a.equals(goog.math.Long.MIN_VALUE))return goog.math.Long.ONE;var b=this.shiftRight(1),c=b.div(a).shiftLeft(1);if(c.equals(goog.math.Long.ZERO))return a.isNegative()?goog.math.Long.ONE:goog.math.Long.NEG_ONE;var d=this.subtract(a.multiply(c)),e=c.add(d.div(a));return e}if(a.equals(goog.math.Long.MIN_VALUE))return goog.math.Long.ZERO;if(this.isNegative())return a.isNegative()?this.negate().div(a.negate()):this.negate().div(a).negate();if(a.isNegative())return this.div(a.negate()).negate();for(var f=goog.math.Long.ZERO,d=this;d.greaterThanOrEqual(a);){for(var c=Math.max(1,Math.floor(d.toNumber()/a.toNumber())),g=Math.ceil(Math.log(c)/Math.LN2),h=48>=g?1:Math.pow(2,g-48),i=goog.math.Long.fromNumber(c),j=i.multiply(a);j.isNegative()||j.greaterThan(d);)c-=h,i=goog.math.Long.fromNumber(c),j=i.multiply(a);i.isZero()&&(i=goog.math.Long.ONE),f=f.add(i),d=d.subtract(j)}return f},goog.math.Long.prototype.modulo=function(a){return this.subtract(this.div(a).multiply(a))},goog.math.Long.prototype.not=function(){return goog.math.Long.fromBits(~this.low_,~this.high_)},goog.math.Long.prototype.and=function(a){return goog.math.Long.fromBits(this.low_&a.low_,this.high_&a.high_)},goog.math.Long.prototype.or=function(a){return goog.math.Long.fromBits(this.low_|a.low_,this.high_|a.high_)},goog.math.Long.prototype.xor=function(a){return goog.math.Long.fromBits(this.low_^a.low_,this.high_^a.high_)},goog.math.Long.prototype.shiftLeft=function(a){if(a&=63,0==a)return this;var b=this.low_;if(32>a){var c=this.high_;return goog.math.Long.fromBits(b<<a,c<<a|b>>>32-a)}return goog.math.Long.fromBits(0,b<<a-32)},goog.math.Long.prototype.shiftRight=function(a){if(a&=63,0==a)return this;var b=this.high_;if(32>a){var c=this.low_;return goog.math.Long.fromBits(c>>>a|b<<32-a,b>>a)}return goog.math.Long.fromBits(b>>a-32,b>=0?0:-1)},goog.math.Long.prototype.shiftRightUnsigned=function(a){if(a&=63,0==a)return this;var b=this.high_;if(32>a){var c=this.low_;return goog.math.Long.fromBits(c>>>a|b<<32-a,b>>>a)}return 32==a?goog.math.Long.fromBits(b,0):goog.math.Long.fromBits(b>>>a-32,0)};var UTF8={};UTF8.encode=function(a){for(var b=[],c=0;c<a.length;++c){var d=a.charCodeAt(c);128>d?b.push(d):2048>d?(b.push(192|d>>6),b.push(128|63&d)):65536>d?(b.push(224|d>>12),b.push(128|63&d>>6),b.push(128|63&d)):(b.push(240|d>>18),b.push(128|63&d>>12),b.push(128|63&d>>6),b.push(128|63&d))}return b},UTF8.decode=function(a){for(var b=[],c=0;c<a.length;){var d=a[c++];128>d||(224>d?(d=(31&d)<<6,d|=63&a[c++]):240>d?(d=(15&d)<<12,d|=(63&a[c++])<<6,d|=63&a[c++]):(d=(7&d)<<18,d|=(63&a[c++])<<12,d|=(63&a[c++])<<6,d|=63&a[c++])),b.push(String.fromCharCode(d))}return b.join("")};var BASE64={};if(function(b){var c=function(a){for(var c=0,d=[],e=0|a.length/3;0<e--;){var f=(a[c]<<16)+(a[c+1]<<8)+a[c+2];c+=3,d.push(b.charAt(63&f>>18)),d.push(b.charAt(63&f>>12)),d.push(b.charAt(63&f>>6)),d.push(b.charAt(63&f))}if(2==a.length-c){var f=(a[c]<<16)+(a[c+1]<<8);d.push(b.charAt(63&f>>18)),d.push(b.charAt(63&f>>12)),d.push(b.charAt(63&f>>6)),d.push("=")}else if(1==a.length-c){var f=a[c]<<16;d.push(b.charAt(63&f>>18)),d.push(b.charAt(63&f>>12)),d.push("==")}return d.join("")},d=function(){for(var a=[],c=0;c<b.length;++c)a[b.charCodeAt(c)]=c;return a["=".charCodeAt(0)]=0,a}(),e=function(a){for(var b=0,c=[],e=0|a.length/4;0<e--;){var f=(d[a.charCodeAt(b)]<<18)+(d[a.charCodeAt(b+1)]<<12)+(d[a.charCodeAt(b+2)]<<6)+d[a.charCodeAt(b+3)];c.push(255&f>>16),c.push(255&f>>8),c.push(255&f),b+=4}return c&&("="==a.charAt(b-2)?(c.pop(),c.pop()):"="==a.charAt(b-1)&&c.pop()),c},f={};f.encode=function(a){for(var b=[],c=0;c<a.length;++c)b.push(a.charCodeAt(c));return b},f.decode=function(b){for(var c=0;c<s.length;++c)a[c]=String.fromCharCode(a[c]);return a.join("")},BASE64.decodeArray=function(a){var b=e(a);return new Uint8Array(b)},BASE64.encodeASCII=function(a){var b=f.encode(a);return c(b)},BASE64.decodeASCII=function(a){var b=e(a);return f.decode(b)},BASE64.encode=function(a){var b=UTF8.encode(a);return c(b)},BASE64.decode=function(a){var b=e(a);return UTF8.decode(b)}}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),void 0===btoa)var btoa=BASE64.encode;if(void 0===atob)var atob=BASE64.decode;var ISOBoxer=ISOBoxer||{};ISOBoxer.Cursor=function(a){this.offset="undefined"==typeof a?0:a};var ISOBox=function(){this._cursor=new ISOBoxer.Cursor};ISOBox.parse=function(a){var b=new ISOBox;return b._offset=a._cursor.offset,b._root=a._root?a._root:a,b._raw=a._raw,b._parent=a,b._parseBox(),a._cursor.offset=b._raw.byteOffset+b._raw.byteLength,b},ISOBox.prototype._readInt=function(a){var b=null;switch(a){case 8:b=this._raw.getInt8(this._cursor.offset-this._raw.byteOffset);break;case 16:b=this._raw.getInt16(this._cursor.offset-this._raw.byteOffset);break;case 32:b=this._raw.getInt32(this._cursor.offset-this._raw.byteOffset)}return this._cursor.offset+=a>>3,b},ISOBox.prototype._readUint=function(a){var b=null;switch(a){case 8:b=this._raw.getUint8(this._cursor.offset-this._raw.byteOffset);break;case 16:b=this._raw.getUint16(this._cursor.offset-this._raw.byteOffset);break;case 24:var c=this._raw.getUint16(this._cursor.offset-this._raw.byteOffset),d=this._raw.getUint8(this._cursor.offset-this._raw.byteOffset+2);b=(c<<8)+d;break;case 32:b=this._raw.getUint32(this._cursor.offset-this._raw.byteOffset);break;case 64:var c=this._raw.getUint32(this._cursor.offset-this._raw.byteOffset),d=this._raw.getUint32(this._cursor.offset-this._raw.byteOffset+4);b=c*Math.pow(2,32)+d}return this._cursor.offset+=a>>3,b},ISOBox.prototype._readString=function(a){for(var b="",c=0;a>c;c++){var d=this._readUint(8);b+=String.fromCharCode(d)}return b},ISOBox.prototype._readTerminatedString=function(){for(var a="";;){var b=this._readUint(8);if(0==b)break;a+=String.fromCharCode(b)}return a},ISOBox.prototype._readTemplate=function(a){var b=this._readUint(a/2),c=this._readUint(a/2);return b+c/Math.pow(2,a/2)},ISOBox.prototype._parseBox=function(){if(this._cursor.offset=this._offset,this._offset+8>this._raw.buffer.byteLength)return void(this._root._incomplete=!0);switch(this.size=this._readUint(32),this.type=this._readString(4),1==this.size&&(this.largesize=this._readUint(64)),"uuid"==this.type&&(this.usertype=this._readString(16)),this.size){case 0:this._raw=new DataView(this._raw.buffer,this._offset,this._raw.byteLength-this._cursor.offset);break;case 1:this._offset+this.size>this._raw.buffer.byteLength?(this._incomplete=!0,this._root._incomplete=!0):this._raw=new DataView(this._raw.buffer,this._offset,this.largesize);break;default:this._offset+this.size>this._raw.buffer.byteLength?(this._incomplete=!0,this._root._incomplete=!0):this._raw=new DataView(this._raw.buffer,this._offset,this.size)}!this._incomplete&&this._boxParsers[this.type]&&this._boxParsers[this.type].call(this)},ISOBox.prototype._parseFullBox=function(){this.version=this._readUint(8),this.flags=this._readUint(24)},ISOBox.prototype._boxParsers={},["moov","trak","tref","mdia","minf","stbl","edts","dinf","mvex","moof","traf","mfra","udta","meco","strk"].forEach(function(a){ISOBox.prototype._boxParsers[a]=function(){for(this.boxes=[];this._cursor.offset-this._raw.byteOffset<this._raw.byteLength;)this.boxes.push(ISOBox.parse(this))}}),ISOBox.prototype._boxParsers.emsg=function(){this._parseFullBox(),this.scheme_id_uri=this._readTerminatedString(),this.value=this._readTerminatedString(),this.timescale=this._readUint(32),this.presentation_time_delta=this._readUint(32),this.event_duration=this._readUint(32),this.id=this._readUint(32),this.message_data=new DataView(this._raw.buffer,this._cursor.offset,this._raw.byteLength-(this._cursor.offset-this._offset))},ISOBox.prototype._boxParsers.free=ISOBox.prototype._boxParsers.skip=function(){this.data=new DataView(this._raw.buffer,this._cursor.offset,this._raw.byteLength-(this._cursor.offset-this._offset))},ISOBox.prototype._boxParsers.ftyp=ISOBox.prototype._boxParsers.styp=function(){for(this.major_brand=this._readString(4),this.minor_versions=this._readUint(32),this.compatible_brands=[];this._cursor.offset-this._raw.byteOffset<this._raw.byteLength;)this.compatible_brands.push(this._readString(4))},ISOBox.prototype._boxParsers.mdat=function(){this.data=new DataView(this._raw.buffer,this._cursor.offset,this._raw.byteLength-(this._cursor.offset-this._offset))},ISOBox.prototype._boxParsers.mdhd=function(){this._parseFullBox(),1==this.version?(this.creation_time=this._readUint(64),this.modification_time=this._readUint(64),this.timescale=this._readUint(32),this.duration=this._readUint(64)):(this.creation_time=this._readUint(32),this.modification_time=this._readUint(32),this.timescale=this._readUint(32),this.duration=this._readUint(32));var a=this._readUint(16);this.pad=a>>15,this.language=String.fromCharCode((a>>10&31)+96,(a>>5&31)+96,(31&a)+96),this.pre_defined=this._readUint(16)},ISOBox.prototype._boxParsers.mfhd=function(){this._parseFullBox(),this.sequence_number=this._readUint(32)},ISOBox.prototype._boxParsers.mvhd=function(){this._parseFullBox(),1==this.version?(this.creation_time=this._readUint(64),this.modification_time=this._readUint(64),this.timescale=this._readUint(32),this.duration=this._readUint(64)):(this.creation_time=this._readUint(32),this.modification_time=this._readUint(32),this.timescale=this._readUint(32),this.duration=this._readUint(32)),this.rate=this._readTemplate(32),this.volume=this._readTemplate(16),this.reserved1=this._readUint(16),this.reserved2=[this._readUint(32),this._readUint(32)],this.matrix=[];for(var a=0;9>a;a++)this.matrix.push(this._readTemplate(32));this.pre_defined=[];for(var a=0;6>a;a++)this.pre_defined.push(this._readUint(32));this.next_track_ID=this._readUint(32)},ISOBox.prototype._boxParsers.sidx=function(){this._parseFullBox(),this.reference_ID=this._readUint(32),this.timescale=this._readUint(32),0==this.version?(this.earliest_presentation_time=this._readUint(32),this.first_offset=this._readUint(32)):(this.earliest_presentation_time=this._readUint(64),this.first_offset=this._readUint(64)),this.reserved=this._readUint(16),this.reference_count=this._readUint(16),this.references=[];for(var a=0;a<this.reference_count;a++){var b={},c=this._readUint(32);b.reference_type=c>>31&1,b.referenced_size=2147483647&c,b.subsegment_duration=this._readUint(32);var d=this._readUint(32);b.starts_with_SAP=d>>31&1,b.SAP_type=d>>28&7,b.SAP_delta_time=268435455&d,this.references.push(b)}},ISOBox.prototype._boxParsers.ssix=function(){this._parseFullBox(),this.subsegment_count=this._readUint(32),this.subsegments=[];for(var a=0;a<this.subsegment_count;a++){var b={};b.ranges_count=this._readUint(32),b.ranges=[];for(var c=0;c<b.ranges_count;c++){var d={};d.level=this._readUint(8),d.range_size=this._readUint(24),b.ranges.push(d)}this.subsegments.push(b)}},ISOBox.prototype._boxParsers.tkhd=function(){this._parseFullBox(),1==this.version?(this.creation_time=this._readUint(64),this.modification_time=this._readUint(64),this.track_ID=this._readUint(32),this.reserved1=this._readUint(32),this.duration=this._readUint(64)):(this.creation_time=this._readUint(32),this.modification_time=this._readUint(32),this.track_ID=this._readUint(32),this.reserved1=this._readUint(32),this.duration=this._readUint(32)),this.reserved2=[this._readUint(32),this._readUint(32)],this.layer=this._readUint(16),this.alternate_group=this._readUint(16),this.volume=this._readTemplate(16),this.reserved3=this._readUint(16),this.matrix=[];for(var a=0;9>a;a++)this.matrix.push(this._readTemplate(32));this.width=this._readUint(32),this.height=this._readUint(32)},ISOBox.prototype._boxParsers.tfdt=function(){this._parseFullBox(),this.baseMediaDecodeTime=this._readUint(1==this.version?64:32)},ISOBox.prototype._boxParsers.tfhd=function(){this._parseFullBox(),this.track_ID=this._readUint(32),1&this.flags&&(this.base_data_offset=this._readUint(64)),2&this.flags&&(this.sample_description_offset=this._readUint(32)),8&this.flags&&(this.default_sample_duration=this._readUint(32)),16&this.flags&&(this.default_sample_size=this._readUint(32)),32&this.flags&&(this.default_sample_flags=this._readUint(32))},ISOBox.prototype._boxParsers.trun=function(){this._parseFullBox(),this.sample_count=this._readUint(32),1&this.flags&&(this.data_offset=this._readInt(32)),4&this.flags&&(this.first_sample_flags=this._readUint(32)),this.samples=[];for(var a=0;a<this.sample_count;a++){var b={};256&this.flags&&(b.sample_duration=this._readUint(32)),512&this.flags&&(b.sample_size=this._readUint(32)),1024&this.flags&&(b.sample_flags=this._readUint(32)),2048&this.flags&&(b.sample_composition_time_offset=0==this.version?this._readUint(32):this._readInt(32)),this.samples.push(b)}};var ISOBoxer=ISOBoxer||{};ISOBoxer.parseBuffer=function(a){return new ISOFile(a).parse()},ISOBoxer.Utils={},ISOBoxer.Utils.dataViewToString=function(a,b){if("undefined"!=typeof TextDecoder)return new TextDecoder(b||"utf-8").decode(a);for(var c="",d=0;d<a.byteLength;d++)c+=String.fromCharCode(a.getUint8(d));return c},"undefined"!=typeof exports&&(exports.parseBuffer=ISOBoxer.parseBuffer,exports.Utils=ISOBoxer.Utils);var ISOFile=function(a){this._raw=new DataView(a),this._cursor=new ISOBoxer.Cursor,this.boxes=[]};ISOFile.prototype.fetch=function(a){var b=this.fetchAll(a,!0);return b.length?b[0]:null},ISOFile.prototype.fetchAll=function(a,b){var c=[];return ISOFile._sweep.call(this,a,c,b),c},ISOFile.prototype.parse=function(){for(this._cursor.offset=0,this.boxes=[];this._cursor.offset<this._raw.byteLength;){var a=ISOBox.parse(this);if("undefined"==typeof a.type)break;this.boxes.push(a)}return this},ISOFile._sweep=function(a,b,c){this.type&&this.type==a&&b.push(this);for(var d in this.boxes){if(b.length&&c)return;ISOFile._sweep.call(this.boxes[d],a,b,c)}},MediaPlayer=function(a){"use strict";var b,c,d,e,f,g,h,i,j,k,l,m,n,o="1.5.0",p="http://time.akamai.com/?iso",q="urn:mpeg:dash:utc:http-xsdate:2014",r=0,s=null,t=null,u=!1,v=!1,w=!1,x=!0,y=!1,z=MediaPlayer.dependencies.BufferController.BUFFER_SIZE_REQUIRED,A=!0,B=[],C=4,D=!1,E=function(){return!!e&&!!f&&!v},F=function(){if(!u)throw"MediaPlayer not initialized!";if(!this.capabilities.supportsMediaSource())return void this.errHandler.capabilityError("mediasource");if(!e||!f)throw"Missing view or source.";w=!0,this.debug.log("Playback initiated!"),g=b.getObject("streamController"),i.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,g),i.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,g),i.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY,g),i.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR,g),i.setLiveDelayAttributes(C,D),b.mapValue("liveDelayFragmentCount",C),b.mapOutlet("liveDelayFragmentCount","trackController"),g.initialize(x,s,t),n.checkInitialBitrate(),"string"==typeof f?g.load(f):g.loadWithManifest(f),g.setUTCTimingSources(B,A),b.mapValue("scheduleWhilePaused",y),b.mapOutlet("scheduleWhilePaused","stream"),b.mapOutlet("scheduleWhilePaused","scheduleController"),b.mapValue("numOfParallelRequestAllowed",r),b.mapOutlet("numOfParallelRequestAllowed","scheduleController"),b.mapValue("bufferMax",z),b.mapOutlet("bufferMax","bufferController"),h.initialize()},G=function(){E()&&F.call(this)},H=function(){var a=k.getReadOnlyMetricsFor("video")||k.getReadOnlyMetricsFor("audio");return j.getCurrentDVRInfo(a)},I=function(){return H.call(this).manifestInfo.DVRWindowSize},J=function(a){var b=H.call(this),c=b.range.start+a;return c>b.range.end&&(c=b.range.end),c},K=function(a){var b=i.getIsDynamic()?this.getDVRSeekOffset(a):a;this.getVideoModel().setCurrentTime(b)},L=function(){var a=l.getCurrentTime();if(i.getIsDynamic()){var b=H.call(this);a=null===b?0:this.duration()-(b.range.end-b.time)}return a},M=function(){var a=l.getElement().duration;if(i.getIsDynamic()){var b,c=H.call(this);if(null===c)return 0;b=c.range.end-c.range.start,a=b<c.manifestInfo.DVRWindowSize?b:c.manifestInfo.DVRWindowSize}return a},N=function(a){var b,c,d=H.call(this);return null===d?0:(b=d.manifestInfo.availableFrom.getTime()/1e3,c=a+(b+d.range.start))},O=function(){return N.call(this,this.time())},P=function(){return N.call(this,this.duration())},Q=function(a,b,c){var d=new Date(1e3*a),e=d.toLocaleDateString(b),f=d.toLocaleTimeString(b,{hour12:c});return f+" "+e},R=function(a){a=Math.max(a,0);var b=Math.floor(a/3600),c=Math.floor(a%3600/60),d=Math.floor(a%3600%60);return(0===b?"":10>b?"0"+b.toString()+":":b.toString()+":")+(10>c?"0"+c.toString():c.toString())+":"+(10>d?"0"+d.toString():d.toString())},S=function(a,b,c){b&&void 0!==a&&null!==a&&(c?h.setRules(a,b):h.addRules(a,b))},T=function(){var a=g.getActiveStreamInfo();
return a?g.getStreamById(a.id):null},U=function(){if(this.adapter.reset(),w&&g){if(!v){v=!0,i.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,g),i.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,g),i.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY,g),i.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR,g);var a={},b=this;a[MediaPlayer.dependencies.StreamController.eventList.ENAME_TEARDOWN_COMPLETE]=function(){c.reset(),h.reset(),i.reset(),d.reset(),g=null,w=!1,v=!1,E.call(b)&&G.call(b)},g.subscribe(MediaPlayer.dependencies.StreamController.eventList.ENAME_TEARDOWN_COMPLETE,a,void 0,!0),g.reset()}}else E.call(this)&&G.call(this)},V=dijon.System.prototype.getObject;dijon.System.prototype.getObject=function(a){var b=V.call(this,a);return"object"!=typeof b||b.getName||(b.getName=function(){return a},b.setMediaType=function(a){b.mediaType=a},b.getMediaType=function(){return b.mediaType}),b},b=new dijon.System,b.mapValue("system",b),b.mapOutlet("system"),b.mapValue("eventBus",new MediaPlayer.utils.EventBus),b.mapOutlet("eventBus");var W=new MediaPlayer.utils.Debug;return b.mapValue("debug",W),b.mapOutlet("debug"),b.injectInto(W),W.setup(),b.injectInto(a),{notifier:void 0,debug:void 0,eventBus:void 0,capabilities:void 0,adapter:void 0,errHandler:void 0,uriQueryFragModel:void 0,videoElementExt:void 0,setup:function(){j=b.getObject("metricsExt"),c=b.getObject("abrController"),h=b.getObject("rulesController"),k=b.getObject("metricsModel"),n=b.getObject("DOMStorage"),i=b.getObject("playbackController"),d=b.getObject("mediaController"),this.restoreDefaultUTCTimingSources()},addEventListener:function(a,b,c){a=a.toLowerCase(),this.eventBus.addEventListener(a,b,c)},removeEventListener:function(a,b,c){a=a.toLowerCase(),this.eventBus.removeEventListener(a,b,c)},getVersion:function(){return o},getObjectByContextName:function(a){return b.getObject(a)},startup:function(){u||(b.injectInto(this),u=!0)},getDebug:function(){return this.debug},getVideoModel:function(){return l},setLiveDelayFragmentCount:function(a){C=a},useSuggestedPresentationDelay:function(a){D=a},enableLastBitrateCaching:function(a,b){n.enableLastBitrateCaching(a,b)},enableLastMediaSettingsCaching:function(a,b){n.enableLastMediaSettingsCaching(a,b)},setNumOfParallelRequestAllowed:function(a){r=a},setMaxAllowedBitrateFor:function(a,b){c.setMaxAllowedBitrateFor(a,b)},getMaxAllowedBitrateFor:function(a){return c.getMaxAllowedBitrateFor(a)},setAutoPlay:function(a){x=a},getAutoPlay:function(){return x},setScheduleWhilePaused:function(a){y=a},getScheduleWhilePaused:function(){return y},setBufferMax:function(a){z=a},getBufferMax:function(){return z},getMetricsExt:function(){return j},getMetricsFor:function(a){return k.getReadOnlyMetricsFor(a)},getQualityFor:function(a){return c.getQualityFor(a,g.getActiveStreamInfo())},setQualityFor:function(a,b){c.setPlaybackQuality(a,g.getActiveStreamInfo(),b)},setTextTrack:function(a){void 0===m&&(m=b.getObject("textSourceBuffer"));for(var c=e.textTracks,d=c.length,f=0;d>f;f++){var g=c[f],h=a===f?"showing":"hidden";g.mode!==h&&(g.mode=h)}m.isFragmented&&m.setTextTrack()},getBitrateInfoListFor:function(a){var b=T.call(this);return b?b.getBitrateListFor(a):[]},setInitialBitrateFor:function(a,b){c.setInitialBitrateFor(a,b)},getInitialBitrateFor:function(a){return c.getInitialBitrateFor(a)},getStreamsFromManifest:function(a){return this.adapter.getStreamsInfo(a)},getTracksFor:function(a){var b=g?g.getActiveStreamInfo():null;return b?d.getTracksFor(a,b):[]},getTracksForTypeFromManifest:function(a,b,c){return c=c||this.adapter.getStreamsInfo(b)[0],c?this.adapter.getAllMediaInfoForType(b,c,a):[]},getCurrentTrackFor:function(a){var b=g?g.getActiveStreamInfo():null;return b?d.getCurrentTrackFor(a,b):null},setInitialMediaSettingsFor:function(a,b){d.setInitialSettings(a,b)},getInitialMediaSettingsFor:function(a){return d.getInitialSettings(a)},setCurrentTrack:function(a){d.setTrack(a)},getTrackSwitchModeFor:function(a){return d.getSwitchMode(a)},setTrackSwitchModeFor:function(a,b){d.setSwitchMode(a,b)},setSelectionModeForInitialTrack:function(a){d.setSelectionModeForInitialTrack(a)},getSelectionModeForInitialTrack:function(){return d.getSelectionModeForInitialTrack()},getAutoSwitchQuality:function(){return c.getAutoSwitchBitrate()},setAutoSwitchQuality:function(a){c.setAutoSwitchBitrate(a)},setSchedulingRules:function(a){S.call(this,h.SCHEDULING_RULE,a,!0)},addSchedulingRules:function(a){S.call(this,h.SCHEDULING_RULE,a,!1)},setABRRules:function(a){S.call(this,h.ABR_RULE,a,!0)},addABRRules:function(a){S.call(this,h.ABR_RULE,a,!1)},createProtection:function(){return b.getObject("protectionController")},retrieveManifest:function(a,c){!function(a){var d=b.getObject("manifestLoader"),e=b.getObject("uriQueryFragModel"),f={};f[MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED]=function(a){a.error?c(null,a.error):c(a.data.manifest),d.unsubscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,this)},d.subscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,f),d.load(e.parseURI(a))}(a)},addUTCTimingSource:function(a,b){this.removeUTCTimingSource(a,b);var c=new Dash.vo.UTCTiming;c.schemeIdUri=a,c.value=b,B.push(c)},removeUTCTimingSource:function(a,b){B.forEach(function(c,d){c.schemeIdUri===a&&c.value===b&&B.splice(d,1)})},clearDefaultUTCTimingSources:function(){B=[]},restoreDefaultUTCTimingSources:function(){this.addUTCTimingSource(q,p)},enableManifestDateHeaderTimeSource:function(a){A=a},attachView:function(a){if(!u)throw"MediaPlayer not initialized!";e=a,l=null,e&&(l=b.getObject("videoModel"),l.setElement(e)),U.call(this)},attachTTMLRenderingDiv:function(a){if(!l)throw"Must call attachView with video element before you attach TTML Rendering Div";l.setTTMLRenderingDiv(a)},attachSource:function(a,b,c){if(!u)throw"MediaPlayer not initialized!";"string"==typeof a?(this.uriQueryFragModel.reset(),f=this.uriQueryFragModel.parseURI(a)):f=a,s=b,t=c,U.call(this)},reset:function(){this.attachSource(null),this.attachView(null),s=null,t=null},play:F,isReady:E,seek:K,time:L,duration:M,timeAsUTC:O,durationAsUTC:P,getDVRWindowSize:I,getDVRSeekOffset:J,formatUTC:Q,convertToTimeCode:R}},MediaPlayer.prototype={constructor:MediaPlayer},MediaPlayer.dependencies={},MediaPlayer.dependencies.protection={},MediaPlayer.dependencies.protection.servers={},MediaPlayer.utils={},MediaPlayer.models={},MediaPlayer.vo={},MediaPlayer.vo.metrics={},MediaPlayer.vo.protection={},MediaPlayer.rules={},MediaPlayer.di={},MediaPlayer.events={RESET_COMPLETE:"resetComplete",METRICS_CHANGED:"metricschanged",METRIC_CHANGED:"metricchanged",METRIC_UPDATED:"metricupdated",METRIC_ADDED:"metricadded",MANIFEST_LOADED:"manifestloaded",PROTECTION_CREATED:"protectioncreated",PROTECTION_DESTROYED:"protectiondestroyed",STREAM_SWITCH_STARTED:"streamswitchstarted",STREAM_SWITCH_COMPLETED:"streamswitchcompleted",STREAM_INITIALIZED:"streaminitialized",TEXT_TRACK_ADDED:"texttrackadded",TEXT_TRACKS_ADDED:"alltexttracksadded",BUFFER_LOADED:"bufferloaded",BUFFER_EMPTY:"bufferstalled",ERROR:"error",LOG:"log"},MediaPlayer.di.Context=function(){"use strict";var a=function(){var a=document.createElement("video");MediaPlayer.models.ProtectionModel_21Jan2015.detect(a)?this.system.mapClass("protectionModel",MediaPlayer.models.ProtectionModel_21Jan2015):MediaPlayer.models.ProtectionModel_3Feb2014.detect(a)?this.system.mapClass("protectionModel",MediaPlayer.models.ProtectionModel_3Feb2014):MediaPlayer.models.ProtectionModel_01b.detect(a)?this.system.mapClass("protectionModel",MediaPlayer.models.ProtectionModel_01b):(this.debug.log("No supported version of EME detected on this user agent!"),this.debug.log("Attempts to play encrypted content will fail!"))};return{system:void 0,setup:function(){this.system.autoMapOutlets=!0,this.system.mapClass("eventBusCl",MediaPlayer.utils.EventBus),this.system.mapSingleton("capabilities",MediaPlayer.utils.Capabilities),this.system.mapSingleton("DOMStorage",MediaPlayer.utils.DOMStorage),this.system.mapClass("customTimeRanges",MediaPlayer.utils.CustomTimeRanges),this.system.mapSingleton("virtualBuffer",MediaPlayer.utils.VirtualBuffer),this.system.mapClass("isoFile",MediaPlayer.utils.IsoFile),this.system.mapSingleton("textTrackExtensions",MediaPlayer.utils.TextTrackExtensions),this.system.mapSingleton("vttParser",MediaPlayer.utils.VTTParser),this.system.mapSingleton("ttmlParser",MediaPlayer.utils.TTMLParser),this.system.mapSingleton("boxParser",MediaPlayer.utils.BoxParser),this.system.mapSingleton("videoModel",MediaPlayer.models.VideoModel),this.system.mapSingleton("manifestModel",MediaPlayer.models.ManifestModel),this.system.mapSingleton("metricsModel",MediaPlayer.models.MetricsModel),this.system.mapSingleton("uriQueryFragModel",MediaPlayer.models.URIQueryAndFragmentModel),this.system.mapSingleton("ksPlayReady",MediaPlayer.dependencies.protection.KeySystem_PlayReady),this.system.mapSingleton("ksWidevine",MediaPlayer.dependencies.protection.KeySystem_Widevine),this.system.mapSingleton("ksClearKey",MediaPlayer.dependencies.protection.KeySystem_ClearKey),this.system.mapSingleton("serverPlayReady",MediaPlayer.dependencies.protection.servers.PlayReady),this.system.mapSingleton("serverWidevine",MediaPlayer.dependencies.protection.servers.Widevine),this.system.mapSingleton("serverClearKey",MediaPlayer.dependencies.protection.servers.ClearKey),this.system.mapSingleton("serverDRMToday",MediaPlayer.dependencies.protection.servers.DRMToday),this.system.mapSingleton("requestModifierExt",MediaPlayer.dependencies.RequestModifierExtensions),this.system.mapSingleton("textSourceBuffer",MediaPlayer.dependencies.TextSourceBuffer),this.system.mapSingleton("mediaSourceExt",MediaPlayer.dependencies.MediaSourceExtensions),this.system.mapSingleton("sourceBufferExt",MediaPlayer.dependencies.SourceBufferExtensions),this.system.mapSingleton("abrController",MediaPlayer.dependencies.AbrController),this.system.mapSingleton("errHandler",MediaPlayer.dependencies.ErrorHandler),this.system.mapSingleton("videoExt",MediaPlayer.dependencies.VideoModelExtensions),this.system.mapSingleton("protectionExt",MediaPlayer.dependencies.ProtectionExtensions),this.system.mapClass("protectionController",MediaPlayer.dependencies.ProtectionController),this.system.mapSingleton("playbackController",MediaPlayer.dependencies.PlaybackController),a.call(this),this.system.mapSingleton("liveEdgeFinder",MediaPlayer.dependencies.LiveEdgeFinder),this.system.mapClass("metrics",MediaPlayer.models.MetricsList),this.system.mapClass("insufficientBufferRule",MediaPlayer.rules.InsufficientBufferRule),this.system.mapClass("bufferOccupancyRule",MediaPlayer.rules.BufferOccupancyRule),this.system.mapClass("throughputRule",MediaPlayer.rules.ThroughputRule),this.system.mapSingleton("abrRulesCollection",MediaPlayer.rules.ABRRulesCollection),this.system.mapSingleton("rulesController",MediaPlayer.rules.RulesController),this.system.mapClass("bufferLevelRule",MediaPlayer.rules.BufferLevelRule),this.system.mapClass("pendingRequestsRule",MediaPlayer.rules.PendingRequestsRule),this.system.mapClass("playbackTimeRule",MediaPlayer.rules.PlaybackTimeRule),this.system.mapClass("sameTimeRequestRule",MediaPlayer.rules.SameTimeRequestRule),this.system.mapClass("abandonRequestRule",MediaPlayer.rules.AbandonRequestsRule),this.system.mapSingleton("scheduleRulesCollection",MediaPlayer.rules.ScheduleRulesCollection),this.system.mapClass("liveEdgeBinarySearchRule",MediaPlayer.rules.LiveEdgeBinarySearchRule),this.system.mapClass("liveEdgeWithTimeSynchronizationRule",MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule),this.system.mapSingleton("synchronizationRulesCollection",MediaPlayer.rules.SynchronizationRulesCollection),this.system.mapClass("xlinkController",MediaPlayer.dependencies.XlinkController),this.system.mapClass("xlinkLoader",MediaPlayer.dependencies.XlinkLoader),this.system.mapClass("streamProcessor",MediaPlayer.dependencies.StreamProcessor),this.system.mapClass("eventController",MediaPlayer.dependencies.EventController),this.system.mapClass("textController",MediaPlayer.dependencies.TextController),this.system.mapClass("bufferController",MediaPlayer.dependencies.BufferController),this.system.mapClass("manifestLoader",MediaPlayer.dependencies.ManifestLoader),this.system.mapSingleton("manifestUpdater",MediaPlayer.dependencies.ManifestUpdater),this.system.mapClass("fragmentController",MediaPlayer.dependencies.FragmentController),this.system.mapClass("fragmentLoader",MediaPlayer.dependencies.FragmentLoader),this.system.mapClass("fragmentModel",MediaPlayer.dependencies.FragmentModel),this.system.mapSingleton("streamController",MediaPlayer.dependencies.StreamController),this.system.mapSingleton("mediaController",MediaPlayer.dependencies.MediaController),this.system.mapClass("stream",MediaPlayer.dependencies.Stream),this.system.mapClass("scheduleController",MediaPlayer.dependencies.ScheduleController),this.system.mapSingleton("timeSyncController",MediaPlayer.dependencies.TimeSyncController),this.system.mapSingleton("notifier",MediaPlayer.dependencies.Notifier)}}},Dash=function(){"use strict";return{modules:{},dependencies:{},vo:{},di:{}}}(),Dash.di.DashContext=function(){"use strict";return{system:void 0,debug:void 0,setup:function(){Dash.di.DashContext.prototype.setup.call(this),this.system.mapClass("parser",Dash.dependencies.DashParser),this.system.mapClass("indexHandler",Dash.dependencies.DashHandler),this.system.mapSingleton("baseURLExt",Dash.dependencies.BaseURLExtensions),this.system.mapClass("fragmentExt",Dash.dependencies.FragmentExtensions),this.system.mapClass("representationController",Dash.dependencies.RepresentationController),this.system.mapSingleton("manifestExt",Dash.dependencies.DashManifestExtensions),this.system.mapSingleton("metricsExt",Dash.dependencies.DashMetricsExtensions),this.system.mapSingleton("timelineConverter",Dash.dependencies.TimelineConverter),this.system.mapSingleton("adapter",Dash.dependencies.DashAdapter)}}},Dash.di.DashContext.prototype=new MediaPlayer.di.Context,Dash.di.DashContext.prototype.constructor=Dash.di.DashContext,Dash.dependencies.DashAdapter=function(){"use strict";var a=[],b={},c=function(a,b){return b.getRepresentationForQuality(a.quality)},d=function(a){return b[a.streamInfo.id][a.index]},e=function(b){var c,d=a.length,e=0;for(e;d>e;e+=1)if(c=a[e],b.id===c.id)return c;return null},f=function(a,b){var c=new MediaPlayer.vo.TrackInfo,d=b.adaptation.period.mpd.manifest.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index],e=this.manifestExt.getRepresentationFor(b.index,d);return c.id=b.id,c.quality=b.index,c.bandwidth=this.manifestExt.getBandwidth(e),c.DVRWindow=b.segmentAvailabilityRange,c.fragmentDuration=b.segmentDuration||(b.segments&&b.segments.length>0?b.segments[0].duration:NaN),c.MSETimeOffset=b.MSETimeOffset,c.useCalculatedLiveEdgeTime=b.useCalculatedLiveEdgeTime,c.mediaInfo=g.call(this,a,b.adaptation),c},g=function(a,b){var c,d=new MediaPlayer.vo.MediaInfo,e=this,f=b.period.mpd.manifest.Period_asArray[b.period.index].AdaptationSet_asArray[b.index];return d.id=b.id,d.index=b.index,d.type=b.type,d.streamInfo=h.call(this,a,b.period),d.representationCount=this.manifestExt.getRepresentationCount(f),d.lang=this.manifestExt.getLanguageForAdaptation(f),c=this.manifestExt.getViewpointForAdaptation(f),d.viewpoint=c?c.value:void 0,d.accessibility=this.manifestExt.getAccessibilityForAdaptation(f).map(function(a){return a.value}),d.audioChannelConfiguration=this.manifestExt.getAudioChannelConfigurationForAdaptation(f).map(function(a){return a.value}),d.roles=this.manifestExt.getRolesForAdaptation(f).map(function(a){return a.value}),d.codec=this.manifestExt.getCodec(f),d.mimeType=this.manifestExt.getMimeType(f),d.contentProtection=this.manifestExt.getContentProtectionData(f),d.bitrateList=this.manifestExt.getBitrateListForAdaptation(f),d.contentProtection&&d.contentProtection.forEach(function(a){a.KID=e.manifestExt.getKID(a)}),d.isText=this.manifestExt.getIsTextTrack(d.mimeType),d},h=function(a,b){var c=new MediaPlayer.vo.StreamInfo,d=1;return c.id=b.id,c.index=b.index,c.start=b.start,c.duration=b.duration,c.manifestInfo=i.call(this,a,b.mpd),c.isLast=1===a.Period_asArray.length||Math.abs(c.start+c.duration-c.manifestInfo.duration)<d,c},i=function(a,b){var c=new MediaPlayer.vo.ManifestInfo;return c.DVRWindowSize=b.timeShiftBufferDepth,c.loadedTime=b.manifest.loadedTime,c.availableFrom=b.availabilityStartTime,c.minBufferTime=b.manifest.minBufferTime,c.maxFragmentDuration=b.maxSegmentDuration,c.duration=this.manifestExt.getDuration(a),c.isDynamic=this.manifestExt.getIsDynamic(a),c},j=function(a,c,d){var f,h=e(c),i=h.id,j=this.manifestExt.getAdaptationForType(a,c.index,d);return j?(f=this.manifestExt.getIndexForAdaptation(j,a,c.index),b[i]=b[i]||this.manifestExt.getAdaptationsForPeriod(a,h),g.call(this,a,b[i][f])):null},k=function(a,c,d){var f,h,i,j=e(c),k=j.id,l=this.manifestExt.getAdaptationsForType(a,c.index,d),m=[];if(!l)return m;b[k]=b[k]||this.manifestExt.getAdaptationsForPeriod(a,j);for(var n=0,o=l.length;o>n;n+=1)f=l[n],i=this.manifestExt.getIndexForAdaptation(f,a,c.index),h=g.call(this,a,b[k][i]),h&&m.push(h);return m},l=function(c){var d,e,f,g=[];if(!c)return null;for(d=this.manifestExt.getMpd(c),a=this.manifestExt.getRegularPeriods(c,d),d.checkTime=this.manifestExt.getCheckTime(c,a[0]),b={},e=a.length,f=0;e>f;f+=1)g.push(h.call(this,c,a[f]));return g},m=function(a){var b=this.manifestExt.getMpd(a);return i.call(this,a,b)},n=function(a,b){var c=a.representationController.getRepresentationForQuality(b);return a.indexHandler.getInitRequest(c)},o=function(a,b){var d=c(b,a.representationController);return a.indexHandler.getNextSegmentRequest(d)},p=function(a,b,d,e){var f=c(b,a.representationController);return a.indexHandler.getSegmentRequestForTime(f,d,e)},q=function(a,b,d){var e=c(b,a.representationController);return a.indexHandler.generateSegmentRequestForTime(e,d)},r=function(a){return a.indexHandler.getCurrentTime()},s=function(a,b){return a.indexHandler.setCurrentTime(b)},t=function(a,b){var c,f,g=e(b.getStreamInfo()),h=b.getMediaInfo(),i=d(h),j=b.getType();c=h.id,f=c?this.manifestExt.getAdaptationForId(c,a,g.index):this.manifestExt.getAdaptationForIndex(h.index,a,g.index),b.representationController.updateData(f,i,j)},u=function(a,b,c){var d=b.getRepresentationForQuality(c);return d?f.call(this,a,d):null},v=function(a,b){var c=b.getCurrentRepresentation();return c?f.call(this,a,c):null},w=function(a,b,c){var d=new Dash.vo.Event,e=a.scheme_id_uri,f=a.value,g=a.timescale,h=a.presentation_time_delta,i=a.event_duration,j=a.id,k=a.message_data,l=c*g+h;return b[e]?(d.eventStream=b[e],d.eventStream.value=f,d.eventStream.timescale=g,d.duration=i,d.id=j,d.presentationTime=l,d.messageData=k,d.presentationTimeDelta=h,d):null},x=function(a,b,f){var g=[];return b instanceof MediaPlayer.vo.StreamInfo?g=this.manifestExt.getEventsForPeriod(a,e(b)):b instanceof MediaPlayer.vo.MediaInfo?g=this.manifestExt.getEventStreamForAdaptationSet(a,d(b)):b instanceof MediaPlayer.vo.TrackInfo&&(g=this.manifestExt.getEventStreamForRepresentation(a,c(b,f.representationController))),g};return{system:void 0,manifestExt:void 0,timelineConverter:void 0,metricsList:{TCP_CONNECTION:"TcpConnection",HTTP_REQUEST:"HttpRequest",HTTP_REQUEST_TRACE:"HttpRequestTrace",TRACK_SWITCH:"RepresentationSwitch",BUFFER_LEVEL:"BufferLevel",BUFFER_STATE:"BufferState",DVR_INFO:"DVRInfo",DROPPED_FRAMES:"DroppedFrames",SCHEDULING_INFO:"SchedulingInfo",REQUESTS_QUEUE:"RequestsQueue",MANIFEST_UPDATE:"ManifestUpdate",MANIFEST_UPDATE_STREAM_INFO:"ManifestUpdatePeriodInfo",MANIFEST_UPDATE_TRACK_INFO:"ManifestUpdateRepresentationInfo",PLAY_LIST:"PlayList",PLAY_LIST_TRACE:"PlayListTrace"},convertDataToTrack:f,convertDataToMedia:g,convertDataToStream:h,getDataForTrack:c,getDataForMedia:d,getDataForStream:e,getStreamsInfo:l,getManifestInfo:m,getMediaInfoForType:j,getAllMediaInfoForType:k,getCurrentRepresentationInfo:v,getRepresentationInfoForQuality:u,updateData:t,getInitRequest:n,getNextFragmentRequest:o,getFragmentRequestForTime:p,generateFragmentRequestForTime:q,getIndexHandlerTime:r,setIndexHandlerTime:s,getEventsFor:x,getEvent:w,reset:function(){a=[],b={}}}},Dash.dependencies.DashAdapter.prototype={constructor:Dash.dependencies.DashAdapter},Dash.create=function(a,b,c){if("undefined"==typeof a||"VIDEO"!=a.nodeName)return null;var d,e=a.id||a.name||"video element";if(c=c||new Dash.di.DashContext,b=b||[].slice.call(a.querySelectorAll("source")).filter(function(a){return a.type==Dash.supportedManifestMimeTypes.mimeType})[0],void 0===b&&a.src)b=document.createElement("source"),b.src=a.src;else if(void 0===b&&!a.src)return null;return d=new MediaPlayer(c),d.startup(),d.attachView(a),d.setAutoPlay(a.autoplay),d.attachSource(b.src),d.getDebug().log("Converted "+e+" to dash.js player and added content: "+b.src),d},Dash.createAll=function(a,b,c){var d=[];a=a||".dashjs-player",b=b||document,c=c||new Dash.di.DashContext;for(var e=b.querySelectorAll(a),f=0;f<e.length;f++){var g=Dash.create(e[f],void 0,c);d.push(g)}return d},Dash.supportedManifestMimeTypes={mimeType:"application/dash+xml"},Dash.dependencies.DashHandler=function(){"use strict";var a,b,c,d=-1,e=0,f=new RegExp("^(?:(?:[a-z]+:)?/)?/","i"),g=function(a,b){for(;a.length<b;)a="0"+a;return a},h=function(a,b,c){for(var d,e,f,h,i,j,k=b.length,l="%0",m=l.length;;){if(d=a.indexOf("$"+b),0>d)return a;if(e=a.indexOf("$",d+k),0>e)return a;if(f=a.indexOf(l,d+k),f>d&&e>f)switch(h=a.charAt(e-1),i=parseInt(a.substring(f+m,e-1),10),h){case"d":case"i":case"u":j=g(c.toString(),i);break;case"x":j=g(c.toString(16),i);break;case"X":j=g(c.toString(16),i).toUpperCase();break;case"o":j=g(c.toString(8),i);break;default:return this.log("Unsupported/invalid IEEE 1003.1 format identifier string in URL"),a}else j=c;a=a.substring(0,d)+j+a.substring(e+1)}},i=function(a){return a.split("$").join("$")},j=function(a,b){if(null===b||-1===a.indexOf("$RepresentationID$"))return a;var c=b.toString();return a.split("$RepresentationID$").join(c)},k=function(a,b){return a.representation.startNumber+b},l=function(a,b){var c,d=b.adaptation.period.mpd.manifest.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index].Representation_asArray[b.index].BaseURL;return c=a===d?a:f.test(a)?a:d+a},m=function(a,c){var d,e,f=this,g=new MediaPlayer.vo.FragmentRequest;return d=a.adaptation.period,g.mediaType=c,g.type=MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE,g.url=l(a.initialization,a),g.range=a.range,e=d.start,g.availabilityStartTime=f.timelineConverter.calcAvailabilityStartTimeFromPresentationTime(e,a.adaptation.period.mpd,b),g.availabilityEndTime=f.timelineConverter.calcAvailabilityEndTimeFromPresentationTime(e+d.duration,d.mpd,b),g.quality=a.index,g.mediaInfo=f.streamProcessor.getMediaInfo(),g},n=function(a){var b,d=this;return a?b=m.call(d,a,c):null},o=function(a){var c,e,f,g=a.adaptation.period,h=!1;return 0>d?h=!1:b||d<a.availableSegmentsNumber?(e=B(d,a),e&&(f=e.presentationStartTime-g.start,c=a.adaptation.period.duration,this.log(a.segmentInfoType+": "+f+" / "+c),h=f>=c)):h=!0,h},p=function(a,c){var d,e,f,g,h=this;return e=a.segmentDuration,isNaN(e)&&(e=a.adaptation.period.duration),f=a.adaptation.period.start+c*e,g=f+e,d=new Dash.vo.Segment,d.representation=a,d.duration=e,d.presentationStartTime=f,d.mediaStartTime=h.timelineConverter.calcMediaTimeFromPresentationTime(d.presentationStartTime,a),d.availabilityStartTime=h.timelineConverter.calcAvailabilityStartTimeFromPresentationTime(d.presentationStartTime,a.adaptation.period.mpd,b),d.availabilityEndTime=h.timelineConverter.calcAvailabilityEndTimeFromPresentationTime(g,a.adaptation.period.mpd,b),d.wallStartTime=h.timelineConverter.calcWallTimeForSegment(d,b),d.replacementNumber=k(d,c),d.availabilityIdx=c,d},q=function(c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r=this,s=c.adaptation.period.mpd.manifest.Period_asArray[c.adaptation.period.index].AdaptationSet_asArray[c.adaptation.index].Representation_asArray[c.index].SegmentTemplate,v=s.SegmentTimeline,w=c.availableSegmentsNumber>0,x=10,y=[],z=0,A=0,B=-1,C=function(a){return u.call(r,c,z,a.d,q,s.media,a.mediaRange,B)};for(q=c.timescale,d=v.S_asArray,l=t.call(r,c),l?(o=l.start,p=l.end):n=r.timelineConverter.calcMediaTimeFromPresentationTime(a||0,c),f=0,g=d.length;g>f;f+=1){if(e=d[f],i=0,e.hasOwnProperty("r")&&(i=e.r),e.hasOwnProperty("t")&&(z=e.t,A=z/q),0>i){if(k=d[f+1],k&&k.hasOwnProperty("t"))j=k.t/q;else{var D=c.segmentAvailabilityRange?c.segmentAvailabilityRange.end:this.timelineConverter.calcSegmentAvailabilityRange(c,b).end;j=r.timelineConverter.calcMediaTimeFromPresentationTime(D,c),c.segmentDuration=e.d/q}i=Math.ceil((j-A)/(e.d/q))-1}if(m){if(w)break;B+=i+1}else for(h=0;i>=h;h+=1){if(B+=1,l){if(B>p){if(m=!0,w)break;continue}B>=o&&y.push(C.call(r,e))}else{if(y.length>x){if(m=!0,w)break;continue}A>=n-e.d/q*1.5&&y.push(C.call(r,e))}z+=e.d,A=z/q}}return w||(c.availableSegmentsNumber=B+1),y},r=function(a){var c,d,e,f,g,i=[],j=this,k=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].SegmentTemplate,l=a.segmentDuration,m=a.segmentAvailabilityRange,n=null,o=null;for(g=a.startNumber,c=isNaN(l)&&!b?{start:g,end:g}:s.call(j,a),e=c.start,f=c.end,d=e;f>=d;d+=1)n=p.call(j,a,d),n.replacementTime=(g+d-1)*a.segmentDuration,o=k.media,o=h(o,"Number",n.replacementNumber),o=h(o,"Time",n.replacementTime),n.media=o,i.push(n),n=null;return isNaN(l)?a.availableSegmentsNumber=1:a.availableSegmentsNumber=Math.ceil((m.end-m.start)/l),i},s=function(c){var e,f,g,h=this,i=c.segmentDuration,j=c.adaptation.period.mpd.manifest.minBufferTime,k=c.segmentAvailabilityRange,l={start:h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,k.start),end:h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,k.end)},m=NaN,n=null,o=c.segments,p=2*i,q=Math.max(2*j,10*i);return l||(l=h.timelineConverter.calcSegmentAvailabilityRange(c,b)),l.start=Math.max(l.start,0),b&&!h.timelineConverter.isTimeSyncCompleted()?(e=Math.floor(l.start/i),f=Math.floor(l.end/i),g={start:e,end:f}):(o&&o.length>0?(n=B(d,c),m=n?h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,n.presentationStartTime):d>0?d*i:h.timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(c,a||o[0].presentationStartTime)):m=d>0?d*i:b?l.end:l.start,e=Math.floor(Math.max(m-p,l.start)/i),f=Math.floor(Math.min(e+q/i,l.end/i)),g={start:e,end:f})},t=function(){var c,e,f,g=2,h=10,i=0,j=Number.POSITIVE_INFINITY;return b&&!this.timelineConverter.isTimeSyncCompleted()?f={start:i,end:j}:!b&&a||0>d?null:(c=Math.max(d-g,i),e=Math.min(d+h,j),f={start:c,end:e})},u=function(a,c,d,e,f,g,i){var j,l,m,n=this,o=c/e,p=Math.min(d/e,a.adaptation.period.mpd.maxSegmentDuration);return j=n.timelineConverter.calcPresentationTimeFromMediaTime(o,a),l=j+p,m=new Dash.vo.Segment,m.representation=a,m.duration=p,m.mediaStartTime=o,m.presentationStartTime=j,m.availabilityStartTime=a.adaptation.period.mpd.manifest.loadedTime,m.availabilityEndTime=n.timelineConverter.calcAvailabilityEndTimeFromPresentationTime(l,a.adaptation.period.mpd,b),m.wallStartTime=n.timelineConverter.calcWallTimeForSegment(m,b),m.replacementTime=c,m.replacementNumber=k(m,i),f=h(f,"Number",m.replacementNumber),f=h(f,"Time",m.replacementTime),m.media=f,m.mediaRange=g,m.availabilityIdx=i,m},v=function(a){var b,c,d,e,f,g,h,i=this,j=[],k=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].SegmentList,l=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].BaseURL,m=k.SegmentURL_asArray.length;for(h=a.startNumber,e=s.call(i,a),f=Math.max(e.start,0),g=Math.min(e.end,k.SegmentURL_asArray.length-1),b=f;g>=b;b+=1)d=k.SegmentURL_asArray[b],c=p.call(i,a,b),c.replacementTime=(h+b-1)*a.segmentDuration,c.media=d.media?d.media:l,c.mediaRange=d.mediaRange,c.index=d.index,c.indexRange=d.indexRange,j.push(c),c=null;return a.availableSegmentsNumber=m,j},w=function(a){var b,c=this,d=a.segmentInfoType;return"SegmentBase"!==d&&"BaseURL"!==d&&C.call(c,a)?("SegmentTimeline"===d?b=q.call(c,a):"SegmentTemplate"===d?b=r.call(c,a):"SegmentList"===d&&(b=v.call(c,a)),x.call(c,a,b)):b=a.segments,b},x=function(a,c){var d,e,f,g;a.segments=c,d=c.length-1,b&&isNaN(this.timelineConverter.getExpectedLiveEdge())&&(g=c[d],e=g.presentationStartTime,f=this.metricsModel.getMetricsFor("stream"),this.timelineConverter.setExpectedLiveEdge(e),this.metricsModel.updateManifestUpdateInfo(this.metricsExt.getCurrentManifestUpdate(f),{presentationStartTime:e}))},y=function(a){var b=this;if(!a)throw new Error("no representation");return a.segments=null,w.call(b,a),a},z=function(a,e){var f,g=this,h=a.initialization,i="BaseURL"!==a.segmentInfoType&&"SegmentBase"!==a.segmentInfoType;return a.segmentDuration||a.segments||y.call(g,a),a.segmentAvailabilityRange=null,a.segmentAvailabilityRange=g.timelineConverter.calcSegmentAvailabilityRange(a,b),a.segmentAvailabilityRange.end<a.segmentAvailabilityRange.start&&!a.useCalculatedLiveEdgeTime?(f=new MediaPlayer.vo.Error(Dash.dependencies.DashHandler.SEGMENTS_UNAVAILABLE_ERROR_CODE,"no segments are available yet",{availabilityDelay:a.segmentAvailabilityRange.start-a.segmentAvailabilityRange.end}),void g.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:a},f)):(e||(d=-1),a.segmentDuration&&y.call(g,a),h||g.baseURLExt.loadInitialization(a),i||g.baseURLExt.loadSegments(a,c,a.indexRange),void(h&&i&&g.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:a})))},A=function(a,b,c){var d,e,f,g,h,i=b.segments,j=i?i.length:null,k=-1;if(i&&j>0)for(h=0;j>h;h+=1)if(e=i[h],f=e.presentationStartTime,g=e.duration,d=void 0===c||null===c?g/2:c,a+d>=f&&f+g>a-d){k=e.availabilityIdx;break}return k},B=function(a,b){if(!b||!b.segments)return null;var c,d,e=b.segments.length;for(d=0;e>d;d+=1)if(c=b.segments[d],c.availabilityIdx===a)return c;return null},C=function(a){var b,c,e=!1,f=a.segments;return f&&0!==f.length?(c=f[0].availabilityIdx,b=f[f.length-1].availabilityIdx,e=c>d||d>b):e=!0,e},D=function(a){if(null===a||void 0===a)return null;var b,d=new MediaPlayer.vo.FragmentRequest,e=a.representation,f=e.adaptation.period.mpd.manifest.Period_asArray[e.adaptation.period.index].AdaptationSet_asArray[e.adaptation.index].Representation_asArray[e.index].bandwidth;return b=l(a.media,e),b=h(b,"Number",a.replacementNumber),b=h(b,"Time",a.replacementTime),b=h(b,"Bandwidth",f),b=j(b,e.id),b=i(b),d.mediaType=c,d.type=MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE,d.url=b,d.range=a.mediaRange,d.startTime=a.presentationStartTime,d.duration=a.duration,d.timescale=e.timescale,d.availabilityStartTime=a.availabilityStartTime,d.availabilityEndTime=a.availabilityEndTime,d.wallStartTime=a.wallStartTime,d.quality=e.index,d.index=a.availabilityIdx,d.mediaInfo=this.streamProcessor.getMediaInfo(),d},E=function(b,e,f){var g,h,i,j=d,k=f?f.keepIdx:!1,l=f?f.timeThreshold:null,m=f&&f.ignoreIsFinished?!0:!1,n=this;return b?(a=e,n.log("Getting the request for time: "+e),d=A.call(n,e,b,l),w.call(n,b),0>d&&(d=A.call(n,e,b,l)),n.log("Index for time "+e+" is "+d),i=m?!1:o.call(n,b),i?(g=new MediaPlayer.vo.FragmentRequest,g.action=g.ACTION_COMPLETE,g.index=d,g.mediaType=c,g.mediaInfo=n.streamProcessor.getMediaInfo(),n.log("Signal complete."),n.log(g)):(h=B(d,b),g=D.call(n,h)),k&&(d=j),g):null},F=function(a,b){var c=(a.segmentAvailabilityRange.end-a.segmentAvailabilityRange.start)/2;return a.segments=null,a.segmentAvailabilityRange={start:b-c,end:b+c},E.call(this,a,b,{keepIdx:!1,ignoreIsFinished:!0});
},G=function(b){var e,f,g,h,i=this;if(!b)return null;if(-1===d)throw"You must call getSegmentRequestForTime first.";return a=null,d+=1,h=d,g=o.call(i,b),g?(e=new MediaPlayer.vo.FragmentRequest,e.action=e.ACTION_COMPLETE,e.index=h,e.mediaType=c,e.mediaInfo=i.streamProcessor.getMediaInfo(),i.log("Signal complete.")):(w.call(i,b),f=B(h,b),e=D.call(i,f)),e},H=function(a){var b=a.data.representation;b.segments&&this.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:b})},I=function(a){if(!a.error&&c===a.data.mediaType){var b,d,e,f,g=this,h=a.data.segments,i=a.data.representation,j=[],k=0;for(b=0,d=h.length;d>b;b+=1)e=h[b],f=u.call(g,i,e.startTime,e.duration,e.timescale,e.media,e.mediaRange,k),j.push(f),f=null,k+=1;i.segmentAvailabilityRange={start:j[0].presentationStartTime,end:j[d-1].presentationStartTime},i.availableSegmentsNumber=d,x.call(g,i,j),i.initialization&&this.notify(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,{representation:i})}};return{log:void 0,baseURLExt:void 0,timelineConverter:void 0,metricsModel:void 0,metricsExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED]=H,this[Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED]=I},initialize:function(a){this.subscribe(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,a.representationController),c=a.getType(),this.setMediaType(c),b=a.isDynamic(),this.streamProcessor=a},getType:function(){return c},setType:function(a){c=a},getIsDynamic:function(){return b},setIsDynamic:function(a){b=a},setCurrentTime:function(a){e=a},getCurrentTime:function(){return e},reset:function(){e=0,a=void 0,d=-1,b=void 0,this.unsubscribe(Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED,this.streamProcessor.representationController)},getInitRequest:n,getSegmentRequestForTime:E,getNextSegmentRequest:G,generateSegmentRequestForTime:F,updateRepresentation:z}},Dash.dependencies.DashHandler.prototype={constructor:Dash.dependencies.DashHandler},Dash.dependencies.DashHandler.SEGMENTS_UNAVAILABLE_ERROR_CODE=1,Dash.dependencies.DashHandler.eventList={ENAME_REPRESENTATION_UPDATED:"representationUpdated"},Dash.dependencies.DashParser=function(){"use strict";var a=31536e3,b=2592e3,c=86400,d=3600,e=60,f=60,g=1e3,h=/^([-])?P(([\d.]*)Y)?(([\d.]*)M)?(([\d.]*)D)?T?(([\d.]*)H)?(([\d.]*)M)?(([\d.]*)S)?/,i=/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+-])([0-9]{2})([0-9]{2}))?/,j=/^[-+]?[0-9]+[.]?[0-9]*([eE][-+]?[0-9]+)?$/,k=/^https?:\/\//i,l=[{type:"duration",test:function(a){for(var b=["minBufferTime","mediaPresentationDuration","minimumUpdatePeriod","timeShiftBufferDepth","maxSegmentDuration","maxSubsegmentDuration","suggestedPresentationDelay","start","starttime","duration"],c=b.length,d=0;c>d;d++)if(a.nodeName===b[d])return h.test(a.value);return!1},converter:function(f){var g=h.exec(f),i=parseFloat(g[2]||0)*a+parseFloat(g[4]||0)*b+parseFloat(g[6]||0)*c+parseFloat(g[8]||0)*d+parseFloat(g[10]||0)*e+parseFloat(g[12]||0);return void 0!==g[1]&&(i=-i),i}},{type:"datetime",test:function(a){return i.test(a.value)},converter:function(a){var b,c=i.exec(a);if(b=Date.UTC(parseInt(c[1],10),parseInt(c[2],10)-1,parseInt(c[3],10),parseInt(c[4],10),parseInt(c[5],10),c[6]&&parseInt(c[6],10)||0,c[7]&&parseFloat(c[7])*g||0),c[9]&&c[10]){var d=parseInt(c[9],10)*f+parseInt(c[10],10);b+=("+"===c[8]?-1:1)*d*e*g}return new Date(b)}},{type:"numeric",test:function(a){return j.test(a.value)},converter:function(a){return parseFloat(a)}}],m=function(){var a,b,c,d;return d=[{name:"profiles",merge:!1},{name:"width",merge:!1},{name:"height",merge:!1},{name:"sar",merge:!1},{name:"frameRate",merge:!1},{name:"audioSamplingRate",merge:!1},{name:"mimeType",merge:!1},{name:"segmentProfiles",merge:!1},{name:"codecs",merge:!1},{name:"maximumSAPPeriod",merge:!1},{name:"startsWithSap",merge:!1},{name:"maxPlayoutRate",merge:!1},{name:"codingDependency",merge:!1},{name:"scanType",merge:!1},{name:"FramePacking",merge:!0},{name:"AudioChannelConfiguration",merge:!0},{name:"ContentProtection",merge:!0}],a={},a.name="AdaptationSet",a.isRoot=!1,a.isArray=!0,a.parent=null,a.children=[],a.properties=d,b={},b.name="Representation",b.isRoot=!1,b.isArray=!0,b.parent=a,b.children=[],b.properties=d,a.children.push(b),c={},c.name="SubRepresentation",c.isRoot=!1,c.isArray=!0,c.parent=b,c.children=[],c.properties=d,b.children.push(c),a},n=function(){var a,b,c,d;return d=[{name:"SegmentBase",merge:!0},{name:"SegmentTemplate",merge:!0},{name:"SegmentList",merge:!0}],a={},a.name="Period",a.isRoot=!1,a.isArray=!0,a.parent=null,a.children=[],a.properties=d,b={},b.name="AdaptationSet",b.isRoot=!1,b.isArray=!0,b.parent=a,b.children=[],b.properties=d,a.children.push(b),c={},c.name="Representation",c.isRoot=!1,c.isArray=!0,c.parent=b,c.children=[],c.properties=d,b.children.push(c),a},o=function(){var a,b,c,d,e;return e=[{name:"BaseURL",merge:!0,mergeFunction:function(a,b){var c;return c=k.test(b)?b:a+b}}],a={},a.name="mpd",a.isRoot=!0,a.isArray=!0,a.parent=null,a.children=[],a.properties=e,b={},b.name="Period",b.isRoot=!1,b.isArray=!0,b.parent=null,b.children=[],b.properties=e,a.children.push(b),c={},c.name="AdaptationSet",c.isRoot=!1,c.isArray=!0,c.parent=b,c.children=[],c.properties=e,b.children.push(c),d={},d.name="Representation",d.isRoot=!1,d.isArray=!0,d.parent=c,d.children=[],d.properties=e,c.children.push(d),a},p=function(){var a=[];return a.push(m()),a.push(n()),a.push(o()),a},q=function(a,b,c){var d,e=new X2JS(l,"",!0),f=new ObjectIron(p()),g=new Date,h=null,i=null;try{d=e.xml_str2json(a),h=new Date,d.hasOwnProperty("BaseURL")?(d.BaseURL=d.BaseURL_asArray[0],0!==d.BaseURL.toString().indexOf("http")&&(d.BaseURL=b+d.BaseURL)):d.BaseURL=b,d.hasOwnProperty("Location")&&(d.Location=d.Location_asArray[0]),f.run(d),i=new Date,c.setMatchers(l),c.setIron(f),this.log("Parsing complete: ( xml2json: "+(h.getTime()-g.getTime())+"ms, objectiron: "+(i.getTime()-h.getTime())+"ms, total: "+(i.getTime()-g.getTime())/1e3+"s)")}catch(j){return this.errHandler.manifestError("parsing the manifest failed","parse",a),null}return d};return{log:void 0,errHandler:void 0,parse:q}},Dash.dependencies.DashParser.prototype={constructor:Dash.dependencies.DashParser},Dash.dependencies.TimelineConverter=function(){"use strict";var a=0,b=!1,c=NaN,d=function(b,c,d,e){var f=NaN;return f=e?d&&c.timeShiftBufferDepth!=Number.POSITIVE_INFINITY?new Date(c.availabilityStartTime.getTime()+1e3*(b+c.timeShiftBufferDepth)):c.availabilityEndTime:d?new Date(c.availabilityStartTime.getTime()+1e3*(b-a)):c.availabilityStartTime},e=function(a,b,c){return d.call(this,a,b,c)},f=function(a,b,c){return d.call(this,a,b,c,!0)},g=function(b,c){return(b.getTime()-c.mpd.availabilityStartTime.getTime()+1e3*a)/1e3},h=function(a,b){var c=b.adaptation.period.start,d=b.presentationTimeOffset;return a+(c-d)},i=function(a,b){var c=b.adaptation.period.start,d=b.presentationTimeOffset;return a-c+d},j=function(a,b){var c,d,e;return b&&(c=a.representation.adaptation.period.mpd.suggestedPresentationDelay,d=a.presentationStartTime+c,e=new Date(a.availabilityStartTime.getTime()+1e3*d)),e},k=function(a,c){var d,e,f=a.adaptation.period.start,h=f+a.adaptation.period.duration,i={start:f,end:h},j=a.segmentDuration||(a.segments&&a.segments.length?a.segments[a.segments.length-1].duration:0);if(!c)return i;if(!b&&a.segmentAvailabilityRange)return a.segmentAvailabilityRange;d=a.adaptation.period.mpd.checkTime,e=g(new Date,a.adaptation.period),f=Math.max(e-a.adaptation.period.mpd.timeShiftBufferDepth,a.adaptation.period.start);var k=isNaN(d)?e:Math.min(d,e),l=a.adaptation.period.start+a.adaptation.period.duration;return h=k>=l&&l>k-j?l:k-j,i={start:f,end:h}},l=function(a,b){var c=a.adaptation.period.start;return b-c},m=function(a,b){var c=a.adaptation.period.start;return b+c},n=function(d){b||d.error||(a+=d.data.liveEdge-(c+d.data.searchTime),b=!0)},o=function(c){b||c.error||(a=c.data.offset/1e3,b=!0)},p=function(a){var b=a.presentationTimeOffset,c=a.adaptation.period.start;return c-b},q=function(){a=0,b=!1,c=NaN};return{setup:function(){this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=n,this[MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED]=o},calcAvailabilityStartTimeFromPresentationTime:e,calcAvailabilityEndTimeFromPresentationTime:f,calcPresentationTimeFromWallTime:g,calcPresentationTimeFromMediaTime:h,calcPeriodRelativeTimeFromMpdRelativeTime:l,calcMpdRelativeTimeFromPeriodRelativeTime:m,calcMediaTimeFromPresentationTime:i,calcSegmentAvailabilityRange:k,calcWallTimeForSegment:j,calcMSETimeOffset:p,reset:q,isTimeSyncCompleted:function(){return b},setTimeSyncCompleted:function(a){b=a},getClientTimeOffset:function(){return a},getExpectedLiveEdge:function(){return c},setExpectedLiveEdge:function(a){c=a}}},Dash.dependencies.TimelineConverter.prototype={constructor:Dash.dependencies.TimelineConverter},Dash.dependencies.RepresentationController=function(){"use strict";var a,b=null,c=-1,d=!0,e=[],f=function(c,f,g){var h,j,k=this,m=null,n=k.streamProcessor.getStreamInfo(),o=k.abrController.getTopQualityIndexFor(g,n.id);if(d=!0,k.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED),e=l.call(k,f),null===b?(j=k.abrController.getAverageThroughput(g),m=j||k.abrController.getInitialBitrateFor(g,n),h=k.abrController.getQualityForBitrate(k.streamProcessor.getMediaInfo(),m)):h=k.abrController.getQualityFor(g,n),h>o&&(h=o),a=i.call(k,h),b=c,"video"!==g&&"audio"!==g&&"fragmentedText"!==g)return d=!1,void k.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,{data:b,currentRepresentation:a});for(var p=0;p<e.length;p+=1)k.indexHandler.updateRepresentation(e[p],!0)},g=function(){var a=new Date,b=this.getCurrentRepresentation(),c=this.streamProcessor.playbackController.getTime();this.metricsModel.addRepresentationSwitch(b.adaptation.type,a,c,b.id)},h=function(){var b=this.streamProcessor,c=this.timelineConverter.calcSegmentAvailabilityRange(a,b.isDynamic());this.metricsModel.addDVRInfo(b.getType(),b.playbackController.getTime(),b.getStreamInfo().manifestInfo,c)},i=function(a){return e[a]},j=function(a){return e.indexOf(a)},k=function(){for(var a=0,b=e.length;b>a;a+=1){var c=e[a].segmentInfoType;if(null===e[a].segmentAvailabilityRange||null===e[a].initialization||("SegmentBase"===c||"BaseURL"===c)&&!e[a].segments)return!1}return!0},l=function(a){var d,e=this,f=e.manifestModel.getValue();return c=e.manifestExt.getIndexForAdaptation(b,f,a.period.index),d=e.manifestExt.getRepresentationsForAdaptation(f,a)},m=function(a){for(var b,c=this,d=0,f=e.length;f>d;d+=1)b=e[d],b.segmentAvailabilityRange=c.timelineConverter.calcSegmentAvailabilityRange(b,a)},n=function(b){var c=this,f=1e3*(b+a.segmentDuration*this.liveDelayFragmentCount),g=function(){if(!this.isUpdating()){d=!0,c.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED);for(var a=0;a<e.length;a+=1)c.indexHandler.updateRepresentation(e[a],!0)}};d=!1,setTimeout(g.bind(this),f)},o=function(c){if(this.isUpdating()){var e,f,i,l=this,m=c.data.representation,o=l.metricsModel.getMetricsFor("stream"),p=l.metricsModel.getMetricsFor(this.getCurrentRepresentation().adaptation.type),q=l.metricsExt.getCurrentManifestUpdate(o),r=!1;if(c.error&&c.error.code===Dash.dependencies.DashHandler.SEGMENTS_UNAVAILABLE_ERROR_CODE)return h.call(this),n.call(this,c.error.data.availabilityDelay),f=new MediaPlayer.vo.Error(Dash.dependencies.RepresentationController.SEGMENTS_UPDATE_FAILED_ERROR_CODE,"Segments update failed",null),void this.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,{data:b,currentRepresentation:a},f);if(q){for(var s=0;s<q.trackInfo.length;s+=1)if(e=q.trackInfo[s],e.index===m.index&&e.mediaType===l.streamProcessor.getType()){r=!0;break}r||l.metricsModel.addManifestUpdateRepresentationInfo(q,m.id,m.index,m.adaptation.period.index,l.streamProcessor.getType(),m.presentationTimeOffset,m.startNumber,m.segmentInfoType)}k()&&(d=!1,l.abrController.setPlaybackQuality(l.streamProcessor.getType(),l.streamProcessor.getStreamInfo(),j.call(this,a)),l.metricsModel.updateManifestUpdateInfo(q,{latency:a.segmentAvailabilityRange.end-l.streamProcessor.playbackController.getTime()}),i=l.metricsExt.getCurrentRepresentationSwitch(p),i||g.call(l),this.notify(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,{data:b,currentRepresentation:a}))}},p=function(a){m.call(this,a.data.isDynamic)},q=function(b){if(!b.error){m.call(this,!0),this.indexHandler.updateRepresentation(a,!1);var c=this.manifestModel.getValue(),d=a.adaptation.period,e=this.streamController.getActiveStreamInfo();e.isLast&&(d.mpd.checkTime=this.manifestExt.getCheckTime(c,d),d.duration=this.manifestExt.getEndTimeForLastPeriod(this.manifestModel.getValue(),d)-d.start,e.duration=d.duration)}},r=function(){h.call(this)},s=function(b){var c=this;b.data.mediaType===c.streamProcessor.getType()&&c.streamProcessor.getStreamInfo().id===b.data.streamInfo.id&&(a=c.getRepresentationForQuality(b.data.newQuality),t.call(c,b.data.mediaType,a.bandwidth),g.call(c))},t=function(a,b){!this.DOMStorage.isSupported(MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL)||"video"!==a&&"audio"!==a||localStorage.setItem(MediaPlayer.utils.DOMStorage["LOCAL_STORAGE_"+a.toUpperCase()+"_BITRATE_KEY"],JSON.stringify({bitrate:b/1e3,timestamp:(new Date).getTime()}))};return{system:void 0,log:void 0,manifestExt:void 0,manifestModel:void 0,metricsModel:void 0,metricsExt:void 0,abrController:void 0,streamController:void 0,timelineConverter:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,DOMStorage:void 0,liveDelayFragmentCount:void 0,setup:function(){this[MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED]=s,this[Dash.dependencies.DashHandler.eventList.ENAME_REPRESENTATION_UPDATED]=o,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED]=p,this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=q,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED]=r},initialize:function(a){this.streamProcessor=a,this.indexHandler=a.indexHandler},getData:function(){return b},getDataIndex:function(){return c},isUpdating:function(){return d},updateData:f,getRepresentationForQuality:i,getCurrentRepresentation:function(){return a}}},Dash.dependencies.RepresentationController.prototype={constructor:Dash.dependencies.RepresentationController},Dash.dependencies.RepresentationController.SEGMENTS_UPDATE_FAILED_ERROR_CODE=1,Dash.dependencies.RepresentationController.eventList={ENAME_DATA_UPDATE_COMPLETED:"dataUpdateCompleted",ENAME_DATA_UPDATE_STARTED:"dataUpdateStarted"},Dash.dependencies.BaseURLExtensions=function(){"use strict";var a=function(a,b){for(var c,d,e,f,g=a.references,h=g.length,i=a.timescale,j=a.earliest_presentation_time,k=b.range.start+a.first_offset+a.size,l=[],m=0;h>m;m+=1)e=g[m].subsegment_duration,f=g[m].referenced_size,c=new Dash.vo.Segment,c.duration=e,c.media=b.url,c.startTime=j,c.timescale=i,d=k+f-1,c.mediaRange=k+"-"+d,l.push(c),j+=e,k+=f;return l},b=function(a){var b,c,d=a.getBox("ftyp"),e=a.getBox("moov"),f=null;return this.log("Searching for initialization."),e&&e.isComplete&&(b=d?d.offset:e.offset,c=e.offset+e.size-1,f=b+"-"+c,this.log("Found the initialization.  Range: "+f)),f},c=function(a,d){var f=new XMLHttpRequest,g=!0,h=this,i=null,j=null,k=a.adaptation.period.mpd.manifest.Period_asArray[a.adaptation.period.index].AdaptationSet_asArray[a.adaptation.index].Representation_asArray[a.index].BaseURL,l=d||{url:k,range:{start:0,end:1500},searching:!1,bytesLoaded:0,bytesToLoad:1500,request:f};h.log("Start searching for initialization."),f.onload=function(){f.status<200||f.status>299||(g=!1,l.bytesLoaded=l.range.end,j=h.boxParser.parse(f.response),i=b.call(h,j),i?(a.range=i,a.initialization=k,h.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,{representation:a})):(l.range.end=l.bytesLoaded+l.bytesToLoad,c.call(h,a,l)))},f.onloadend=f.onerror=function(){g&&(g=!1,h.errHandler.downloadError("initialization",l.url,f),h.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,{representation:a}))},e.call(h,f,l),h.log("Perform init search: "+l.url)},d=function(b,c,f,g,h){var i=this,j=null!==f,k=new XMLHttpRequest,l=b.adaptation.period.mpd.manifest.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index].Representation_asArray[b.index].BaseURL,m=!0,n=null,o=null,p={url:l,range:j?f:{start:0,end:1500},searching:!j,bytesLoaded:g?g.bytesLoaded:0,bytesToLoad:1500,request:k};k.onload=function(){if(!(k.status<200||k.status>299)){var e=p.bytesToLoad,f=k.response.byteLength;if(m=!1,p.bytesLoaded=p.range.end-p.range.start,n=i.boxParser.parse(k.response),o=n.getBox("sidx"),o&&o.isComplete){var g,j,l=o.references;if(null!==l&&void 0!==l&&l.length>0&&(g=1===l[0].reference_type),g){i.log("Initiate multiple SIDX load."),p.range.end=p.range.start+o.size;var q,r,s,t,u,v=[],w=0,x=(o.offset||p.range.start)+o.size,y=function(a){a?(v=v.concat(a),w+=1,w>=r&&h.call(i,v,b,c)):h.call(i,null,b,c)};for(q=0,r=l.length;r>q;q+=1)s=x,t=x+l[q].referenced_size-1,x+=l[q].referenced_size,u={start:s,end:t},d.call(i,b,null,u,p,y)}else i.log("Parsing segments from SIDX."),j=a.call(i,o,p),h.call(i,j,b,c)}else{if(o)p.range.start=o.offset||p.range.start,p.range.end=p.range.start+(o.size||e);else{if(f<p.bytesLoaded)return void h.call(i,null,b,c);var z=n.getLastBox();z&&z.size?(p.range.start=z.offset+z.size,p.range.end=p.range.start+e):p.range.end+=e}d.call(i,b,c,p.range,p,h)}}},k.onloadend=k.onerror=function(){m&&(m=!1,i.errHandler.downloadError("SIDX",p.url,k),h.call(i,null,b,c))},e.call(i,k,p),i.log("Perform SIDX load: "+p.url)},e=function(a,b){a.open("GET",this.requestModifierExt.modifyRequestURL(b.url)),a.responseType="arraybuffer",a.setRequestHeader("Range","bytes="+b.range.start+"-"+b.range.end),a=this.requestModifierExt.modifyRequestHeader(a),a.send(null)},f=function(a,b,c){var d=this;a?d.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,{segments:a,representation:b,mediaType:c}):d.notify(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,{segments:null,representation:b,mediaType:c},new MediaPlayer.vo.Error(null,"error loading segments",null))};return{log:void 0,errHandler:void 0,requestModifierExt:void 0,boxParser:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,loadSegments:function(a,b,c){var e=c?c.split("-"):null;c=e?{start:parseFloat(e[0]),end:parseFloat(e[1])}:null,d.call(this,a,b,c,null,f.bind(this))},loadInitialization:c}},Dash.dependencies.BaseURLExtensions.prototype={constructor:Dash.dependencies.BaseURLExtensions},Dash.dependencies.BaseURLExtensions.eventList={ENAME_INITIALIZATION_LOADED:"initializationLoaded",ENAME_SEGMENTS_LOADED:"segmentsLoaded"},Dash.dependencies.DashManifestExtensions=function(){"use strict";this.timelineConverter=void 0},Dash.dependencies.DashManifestExtensions.prototype={constructor:Dash.dependencies.DashManifestExtensions,getIsTypeOf:function(a,b){"use strict";var c,d,e,f=a.ContentComponent_asArray,g="text"!==b?new RegExp(b):new RegExp("(vtt|ttml)"),h=!1,i=!1;if(a.Representation_asArray.length>0&&a.Representation_asArray[0].hasOwnProperty("codecs")&&"stpp"==a.Representation_asArray[0].codecs)return"fragmentedText"==b;if(f){if(f.length>1)return"muxed"==b;f[0]&&f[0].contentType===b&&(h=!0,i=!0)}if(a.hasOwnProperty("mimeType")&&(h=g.test(a.mimeType),i=!0),!i)for(c=0,d=a.Representation_asArray.length;!i&&d>c;)e=a.Representation_asArray[c],e.hasOwnProperty("mimeType")&&(h=g.test(e.mimeType),i=!0),c+=1;return h},getIsAudio:function(a){"use strict";return this.getIsTypeOf(a,"audio")},getIsVideo:function(a){"use strict";return this.getIsTypeOf(a,"video")},getIsFragmentedText:function(a){"use strict";return this.getIsTypeOf(a,"fragmentedText")},getIsText:function(a){"use strict";return this.getIsTypeOf(a,"text")},getIsMuxed:function(a){return this.getIsTypeOf(a,"muxed")},getIsTextTrack:function(a){return"text/vtt"===a||"application/ttml+xml"===a},getLanguageForAdaptation:function(a){var b="";return a.hasOwnProperty("lang")&&(b=a.lang),b},getViewpointForAdaptation:function(a){return a.hasOwnProperty("Viewpoint")?a.Viewpoint:null},getRolesForAdaptation:function(a){return a.hasOwnProperty("Role_asArray")?a.Role_asArray:[]},getAccessibilityForAdaptation:function(a){return a.hasOwnProperty("Accessibility_asArray")?a.Accessibility_asArray:[]},getAudioChannelConfigurationForAdaptation:function(a){return a.hasOwnProperty("AudioChannelConfiguration_asArray")?a.AudioChannelConfiguration_asArray:[]},getIsMain:function(a){"use strict";return this.getRolesForAdaptation(a).filter(function(a){return"main"===a.value})[0]},processAdaptation:function(a){"use strict";return void 0!==a.Representation_asArray&&null!==a.Representation_asArray&&a.Representation_asArray.sort(function(a,b){return a.bandwidth-b.bandwidth}),a},getAdaptationForId:function(a,b,c){"use strict";var d,e,f=b.Period_asArray[c].AdaptationSet_asArray;for(d=0,e=f.length;e>d;d+=1)if(f[d].hasOwnProperty("id")&&f[d].id===a)return f[d];return null},getAdaptationForIndex:function(a,b,c){"use strict";var d=b.Period_asArray[c].AdaptationSet_asArray;return d[a]},getIndexForAdaptation:function(a,b,c){"use strict";var d,e,f=b.Period_asArray[c].AdaptationSet_asArray;for(d=0,e=f.length;e>d;d+=1)if(f[d]===a)return d;return-1},getAdaptationsForType:function(a,b,c){"use strict";var d,e,f=this,g=a.Period_asArray[b].AdaptationSet_asArray,h=[];for(d=0,e=g.length;e>d;d+=1)this.getIsTypeOf(g[d],c)&&h.push(f.processAdaptation(g[d]));return h},getAdaptationForType:function(a,b,c){"use strict";var d,e,f,g=this;if(f=this.getAdaptationsForType(a,b,c),!f||0===f.length)return null;for(d=0,e=f.length;e>d;d+=1)if(g.getIsMain(f[d]))return f[d];return f[0]},getCodec:function(a){"use strict";var b=a.Representation_asArray[0];return b.mimeType+';codecs="'+b.codecs+'"'},getMimeType:function(a){"use strict";return a.Representation_asArray[0].mimeType},getKID:function(a){"use strict";return a&&a.hasOwnProperty("cenc:default_KID")?a["cenc:default_KID"]:null},getContentProtectionData:function(a){"use strict";return a&&a.hasOwnProperty("ContentProtection_asArray")&&0!==a.ContentProtection_asArray.length?a.ContentProtection_asArray:null},getIsDynamic:function(a){"use strict";var b=!1,c="dynamic";return a.hasOwnProperty("type")&&(b=a.type===c),b},getIsDVR:function(a){"use strict";var b,c,d=this.getIsDynamic(a);return b=!isNaN(a.timeShiftBufferDepth),c=d&&b},getIsOnDemand:function(a){"use strict";var b=!1;return a.profiles&&a.profiles.length>0&&(b=-1!==a.profiles.indexOf("urn:mpeg:dash:profile:isoff-on-demand:2011")),b},getDuration:function(a){var b;return b=a.hasOwnProperty("mediaPresentationDuration")?a.mediaPresentationDuration:Number.MAX_VALUE},getBandwidth:function(a){"use strict";return a.bandwidth},getRefreshDelay:function(a){"use strict";var b=NaN,c=2;return a.hasOwnProperty("minimumUpdatePeriod")&&(b=Math.max(parseFloat(a.minimumUpdatePeriod),c)),b},getRepresentationCount:function(a){"use strict";return a.Representation_asArray.length},getBitrateListForAdaptation:function(a){if(!a||!a.Representation_asArray||!a.Representation_asArray.length)return null;for(var b=this.processAdaptation(a),c=b.Representation_asArray,d=c.length,e=[],f=0;d>f;f+=1)e.push(c[f].bandwidth);return e},getRepresentationFor:function(a,b){"use strict";return b.Representation_asArray[a]},getRepresentationsForAdaptation:function(a,b){for(var c,d,e,f,g,h=this,i=h.processAdaptation(a.Period_asArray[b.period.index].AdaptationSet_asArray[b.index]),j=[],k=0;k<i.Representation_asArray.length;k+=1)f=i.Representation_asArray[k],c=new Dash.vo.Representation,c.index=k,c.adaptation=b,f.hasOwnProperty("id")&&(c.id=f.id),f.hasOwnProperty("bandwidth")&&(c.bandwidth=f.bandwidth),f.hasOwnProperty("maxPlayoutRate")&&(c.maxPlayoutRate=f.maxPlayoutRate),f.hasOwnProperty("SegmentBase")?(e=f.SegmentBase,c.segmentInfoType="SegmentBase"):f.hasOwnProperty("SegmentList")?(e=f.SegmentList,c.segmentInfoType="SegmentList",c.useCalculatedLiveEdgeTime=!0):f.hasOwnProperty("SegmentTemplate")?(e=f.SegmentTemplate,e.hasOwnProperty("SegmentTimeline")?(c.segmentInfoType="SegmentTimeline",g=e.SegmentTimeline.S_asArray[e.SegmentTimeline.S_asArray.length-1],(!g.hasOwnProperty("r")||g.r>=0)&&(c.useCalculatedLiveEdgeTime=!0)):c.segmentInfoType="SegmentTemplate",e.hasOwnProperty("initialization")&&(c.initialization=e.initialization.split("$Bandwidth$").join(f.bandwidth).split("$RepresentationID$").join(f.id))):(e=f.BaseURL,c.segmentInfoType="BaseURL"),e.hasOwnProperty("Initialization")?(d=e.Initialization,d.hasOwnProperty("sourceURL")?c.initialization=d.sourceURL:d.hasOwnProperty("range")&&(c.initialization=f.BaseURL,c.range=d.range)):f.hasOwnProperty("mimeType")&&h.getIsTextTrack(f.mimeType)&&(c.initialization=f.BaseURL,c.range=0),e.hasOwnProperty("timescale")&&(c.timescale=e.timescale),e.hasOwnProperty("duration")&&(c.segmentDuration=e.duration/c.timescale),e.hasOwnProperty("startNumber")&&(c.startNumber=e.startNumber),e.hasOwnProperty("indexRange")&&(c.indexRange=e.indexRange),e.hasOwnProperty("presentationTimeOffset")&&(c.presentationTimeOffset=e.presentationTimeOffset/c.timescale),c.MSETimeOffset=h.timelineConverter.calcMSETimeOffset(c),j.push(c);return j},getAdaptationsForPeriod:function(a,b){for(var c,d,e=a.Period_asArray[b.index],f=[],g=0;g<e.AdaptationSet_asArray.length;g+=1)d=e.AdaptationSet_asArray[g],c=new Dash.vo.AdaptationSet,d.hasOwnProperty("id")&&(c.id=d.id),c.index=g,c.period=b,this.getIsMuxed(d)?c.type="muxed":this.getIsAudio(d)?c.type="audio":this.getIsVideo(d)?c.type="video":this.getIsFragmentedText(d)?c.type="fragmentedText":c.type="text",f.push(c);return f},getRegularPeriods:function(a,b){var c,d,e=this,f=[],g=e.getIsDynamic(a),h=null,i=null,j=null,k=null;for(c=0,d=a.Period_asArray.length;d>c;c+=1)i=a.Period_asArray[c],i.hasOwnProperty("start")?(k=new Dash.vo.Period,k.start=i.start):null!==h&&i.hasOwnProperty("duration")&&null!==j?(k=new Dash.vo.Period,k.start=j.start+j.duration,k.duration=i.duration):0!==c||g||(k=new Dash.vo.Period,k.start=0),null!==j&&isNaN(j.duration)&&(j.duration=k.start-j.start),null!==k&&i.hasOwnProperty("id")&&(k.id=i.id),null!==k&&i.hasOwnProperty("duration")&&(k.duration=i.duration),null!==k&&(k.index=c,k.mpd=b,f.push(k),h=i,j=k),i=null,k=null;return 0===f.length?f:(null!==j&&isNaN(j.duration)&&(j.duration=e.getEndTimeForLastPeriod(a,j)-j.start),f)},getMpd:function(a){var b=new Dash.vo.Mpd;return b.manifest=a,a.hasOwnProperty("availabilityStartTime")?b.availabilityStartTime=new Date(a.availabilityStartTime.getTime()):b.availabilityStartTime=new Date(a.loadedTime.getTime()),a.hasOwnProperty("availabilityEndTime")&&(b.availabilityEndTime=new Date(a.availabilityEndTime.getTime())),a.hasOwnProperty("suggestedPresentationDelay")&&(b.suggestedPresentationDelay=a.suggestedPresentationDelay),a.hasOwnProperty("timeShiftBufferDepth")&&(b.timeShiftBufferDepth=a.timeShiftBufferDepth),a.hasOwnProperty("maxSegmentDuration")&&(b.maxSegmentDuration=a.maxSegmentDuration),b},getFetchTime:function(a,b){return this.timelineConverter.calcPresentationTimeFromWallTime(a.loadedTime,b)},getCheckTime:function(a,b){var c,d=this,e=NaN;return a.hasOwnProperty("minimumUpdatePeriod")&&(c=d.getFetchTime(a,b),e=c+a.minimumUpdatePeriod),e},getEndTimeForLastPeriod:function(a,b){var c,d=this.getCheckTime(a,b);if(a.mediaPresentationDuration)c=a.mediaPresentationDuration;else{if(isNaN(d))throw new Error("Must have @mediaPresentationDuration or @minimumUpdatePeriod on MPD or an explicit @duration on the last period.");c=d}return c},getEventsForPeriod:function(a,b){var c=a.Period_asArray,d=c[b.index].EventStream_asArray,e=[];if(d)for(var f=0;f<d.length;f+=1){var g=new Dash.vo.EventStream;if(g.period=b,g.timescale=1,!d[f].hasOwnProperty("schemeIdUri"))throw"Invalid EventStream. SchemeIdUri has to be set";g.schemeIdUri=d[f].schemeIdUri,d[f].hasOwnProperty("timescale")&&(g.timescale=d[f].timescale),d[f].hasOwnProperty("value")&&(g.value=d[f].value);for(var h=0;h<d[f].Event_asArray.length;h+=1){var i=new Dash.vo.Event;i.presentationTime=0,i.eventStream=g,d[f].Event_asArray[h].hasOwnProperty("presentationTime")&&(i.presentationTime=d[f].Event_asArray[h].presentationTime),d[f].Event_asArray[h].hasOwnProperty("duration")&&(i.duration=d[f].Event_asArray[h].duration),d[f].Event_asArray[h].hasOwnProperty("id")&&(i.id=d[f].Event_asArray[h].id),e.push(i)}}return e},getEventStreams:function(a,b){var c=[];if(!a)return c;for(var d=0;d<a.length;d++){var e=new Dash.vo.EventStream;if(e.timescale=1,e.representation=b,!a[d].hasOwnProperty("schemeIdUri"))throw"Invalid EventStream. SchemeIdUri has to be set";e.schemeIdUri=a[d].schemeIdUri,a[d].hasOwnProperty("timescale")&&(e.timescale=a[d].timescale),a[d].hasOwnProperty("value")&&(e.value=a[d].value),c.push(e)}return c},getEventStreamForAdaptationSet:function(a,b){var c=a.Period_asArray[b.period.index].AdaptationSet_asArray[b.index].InbandEventStream_asArray;return this.getEventStreams(c,null)},getEventStreamForRepresentation:function(a,b){var c=a.Period_asArray[b.adaptation.period.index].AdaptationSet_asArray[b.adaptation.index].Representation_asArray[b.index].InbandEventStream_asArray;return this.getEventStreams(c,b)},getUTCTimingSources:function(a){"use strict";var b=this,c=b.getIsDynamic(a),d=a.hasOwnProperty("availabilityStartTime"),e=a.UTCTiming_asArray,f=[];return(c||d)&&e&&e.forEach(function(a){var b=new Dash.vo.UTCTiming;a.hasOwnProperty("schemeIdUri")&&(b.schemeIdUri=a.schemeIdUri,a.hasOwnProperty("value")&&(b.value=a.value.toString(),f.push(b)))}),f}},Dash.dependencies.DashMetricsExtensions=function(){"use strict";var a=function(a,b){var c,d,e,f,g,h;for(d=a.AdaptationSet_asArray,g=0;g<d.length;g+=1)for(c=d[g],f=c.Representation_asArray,h=0;h<f.length;h+=1)if(e=f[h],b===e.id)return h;return-1},b=function(a,b){var c,d,e,f,g,h;for(d=a.AdaptationSet_asArray,g=0;g<d.length;g+=1)for(c=d[g],f=c.Representation_asArray,h=0;h<f.length;h+=1)if(e=f[h],b===e.id)return e;return null},c=function(a,b){return this.manifestExt.getIsTypeOf(a,b)},d=function(a,b){var d,e,f,g;if(!a||!b)return-1;for(e=a.AdaptationSet_asArray,g=0;g<e.length;g+=1)if(d=e[g],f=d.Representation_asArray,c.call(this,d,b))return f.length;return-1},e=function(a,c){var d,e=this,f=e.manifestModel.getValue(),g=f.Period_asArray[c];return d=b.call(e,g,a),null===d?null:d.bandwidth},f=function(b,c){var d,e=this,f=e.manifestModel.getValue(),g=f.Period_asArray[c];return d=a.call(e,g,b)},g=function(a,b){var c,e=this,f=e.manifestModel.getValue(),g=f.Period_asArray[b];return c=d.call(this,g,a)},h=function(a,b){var c=this.system.getObject("abrController"),d=0;return c&&(d=c.getTopQualityIndexFor(a,b)),d},i=function(a){if(null===a)return null;var b,c,d,e=a.RepSwitchList;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},j=function(a){if(null===a)return null;var b,c,d,e=a.BufferLevel;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},k=function(a){return a.RequestsQueue},l=function(a){if(null===a)return null;var b,c,d=a.PlayList;return null===d||d.length<=0?null:(b=d[d.length-1].trace,null===b||b.length<=0?null:c=b[b.length-1].playbackspeed)},m=function(a){if(null===a)return null;var b,c,d=a.HttpList,e=null;if(null===d||d.length<=0)return null;for(b=d.length,c=b-1;c>=0;){if(d[c].responsecode){e=d[c];break}c-=1}return e},n=function(a){return null===a?[]:a.HttpList?a.HttpList:[]},o=function(a){if(null===a)return null;var b,c,d,e=a.DroppedFrames;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},p=function(a){if(null===a)return null;var b,c,d,e=a.SchedulingInfo;return null===e||e.length<=0?null:(b=e.length,
c=b-1,d=e[c])},q=function(a){if(null===a)return null;var b,c,d,e=a.ManifestUpdate;return null===e||e.length<=0?null:(b=e.length,c=b-1,d=e[c])},r=function(a){if(null===a)return null;var b,c,d=a.DVRInfo;return null===d||d.length<=0?null:(b=d.length-1,c=d[b])},s=function(a,b){var c,d,e,f={};if(null===a)return null;for(c=n(a),e=c.length-1;e>=0;e-=1)if(d=c[e],d.type===MediaPlayer.vo.metrics.HTTPRequest.MPD_TYPE){f=u(d.responseHeaders);break}return void 0===f[b]?null:f[b]},t=function(a,b){if(null===a)return null;var c,d=m(a);return null===d||null===d.responseHeaders?null:(c=u(d.responseHeaders),void 0===c[b]?null:c[b])},u=function(a){var b={};if(!a)return b;for(var c=a.split("\r\n"),d=0,e=c.length;e>d;d++){var f=c[d],g=f.indexOf(": ");g>0&&(b[f.substring(0,g)]=f.substring(g+2))}return b};return{manifestModel:void 0,manifestExt:void 0,system:void 0,getBandwidthForRepresentation:e,getIndexForRepresentation:f,getMaxIndexForBufferType:g,getMaxAllowedIndexForBufferType:h,getCurrentRepresentationSwitch:i,getCurrentBufferLevel:j,getCurrentPlaybackRate:l,getCurrentHttpRequest:m,getHttpRequests:n,getCurrentDroppedFrames:o,getCurrentSchedulingInfo:p,getCurrentDVRInfo:r,getCurrentManifestUpdate:q,getLatestFragmentRequestHeaderValueByID:t,getLatestMPDRequestHeaderValueByID:s,getRequestsQueue:k}},Dash.dependencies.DashMetricsExtensions.prototype={constructor:Dash.dependencies.DashMetricsExtensions},Dash.dependencies.FragmentExtensions=function(){"use strict";var a=function(a){var b,c,d,e,f,g,h,i,j,k=this.boxParser.parse(a),l=k.getBox("tfhd"),m=k.getBox("tfdt"),n=k.getBox("trun"),o=k.getBox("moof");for(d=n.sample_count,f=m.baseMediaDecodeTime,j=(l.base_data_offset||0)+(n.data_offset||0),g=[],i=0;d>i;i++)h=n.samples[i],b=void 0!==h.sample_duration?h.sample_duration:l.default_sample_duration,e=void 0!==h.sample_size?h.sample_size:l.default_sample_size,c=void 0!==h.sample_composition_time_offset?h.sample_composition_time_offset:0,g.push({dts:f,cts:f+c,duration:b,offset:o.offset+j,size:e}),j+=e,f+=b;return g},b=function(a){var b=this.boxParser.parse(a),c=b.getBox("mdhd");return c?c.timescale:NaN};return{log:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,boxParser:void 0,getSamplesInfo:a,getMediaTimescaleFromMoov:b}},Dash.dependencies.FragmentExtensions.prototype={constructor:Dash.dependencies.FragmentExtensions},Dash.dependencies.FragmentExtensions.eventList={ENAME_FRAGMENT_LOADING_COMPLETED:"fragmentLoadingCompleted"},Dash.vo.AdaptationSet=function(){"use strict";this.period=null,this.index=-1,this.type=null},Dash.vo.AdaptationSet.prototype={constructor:Dash.vo.AdaptationSet},Dash.vo.Event=function(){"use strict";this.duration=NaN,this.presentationTime=NaN,this.id=NaN,this.messageData="",this.eventStream=null,this.presentationTimeDelta=NaN},Dash.vo.Event.prototype={constructor:Dash.vo.Event},Dash.vo.EventStream=function(){"use strict";this.adaptionSet=null,this.representation=null,this.period=null,this.timescale=1,this.value="",this.schemeIdUri=""},Dash.vo.EventStream.prototype={constructor:Dash.vo.EventStream},Dash.vo.Mpd=function(){"use strict";this.manifest=null,this.suggestedPresentationDelay=0,this.availabilityStartTime=null,this.availabilityEndTime=Number.POSITIVE_INFINITY,this.timeShiftBufferDepth=Number.POSITIVE_INFINITY,this.maxSegmentDuration=Number.POSITIVE_INFINITY,this.checkTime=NaN,this.clientServerTimeShift=0,this.isClientServerTimeSyncCompleted=!1},Dash.vo.Mpd.prototype={constructor:Dash.vo.Mpd},Dash.vo.Period=function(){"use strict";this.id=null,this.index=-1,this.duration=NaN,this.start=NaN,this.mpd=null},Dash.vo.Period.prototype={constructor:Dash.vo.Period},Dash.vo.Representation=function(){"use strict";this.id=null,this.index=-1,this.adaptation=null,this.segmentInfoType=null,this.initialization=null,this.segmentDuration=NaN,this.timescale=1,this.startNumber=1,this.indexRange=null,this.range=null,this.presentationTimeOffset=0,this.MSETimeOffset=NaN,this.segmentAvailabilityRange=null,this.availableSegmentsNumber=0,this.bandwidth=NaN,this.maxPlayoutRate=NaN},Dash.vo.Representation.prototype={constructor:Dash.vo.Representation},Dash.vo.Segment=function(){"use strict";this.indexRange=null,this.index=null,this.mediaRange=null,this.media=null,this.duration=NaN,this.replacementTime=null,this.replacementNumber=NaN,this.mediaStartTime=NaN,this.presentationStartTime=NaN,this.availabilityStartTime=NaN,this.availabilityEndTime=NaN,this.availabilityIdx=NaN,this.wallStartTime=NaN,this.representation=null},Dash.vo.Segment.prototype={constructor:Dash.vo.Segment},Dash.vo.UTCTiming=function(){"use strict";this.schemeIdUri="",this.value=""},Dash.vo.UTCTiming.prototype={constructor:Dash.vo.UTCTiming},MediaPlayer.dependencies.ErrorHandler=function(){"use strict";var a=MediaPlayer.events.ERROR;return{eventBus:void 0,capabilityError:function(b){this.eventBus.dispatchEvent({type:a,error:"capability",event:b})},downloadError:function(b,c,d){this.eventBus.dispatchEvent({type:a,error:"download",event:{id:b,url:c,request:d}})},manifestError:function(b,c,d){this.eventBus.dispatchEvent({type:a,error:"manifestError",event:{message:b,id:c,manifest:d}})},closedCaptionsError:function(b,c,d){this.eventBus.dispatchEvent({type:a,error:"cc",event:{message:b,id:c,cc:d}})},mediaSourceError:function(b){this.eventBus.dispatchEvent({type:a,error:"mediasource",event:b})},mediaKeySessionError:function(b){this.eventBus.dispatchEvent({type:a,error:"key_session",event:b})},mediaKeyMessageError:function(b){this.eventBus.dispatchEvent({type:a,error:"key_message",event:b})},mediaKeySystemSelectionError:function(b){this.eventBus.dispatchEvent({type:a,error:"key_system_selection",event:b})}}},MediaPlayer.dependencies.ErrorHandler.prototype={constructor:MediaPlayer.dependencies.ErrorHandler},MediaPlayer.dependencies.FragmentLoader=function(){"use strict";var a=MediaPlayer.dependencies.FragmentLoader.RETRY_ATTEMPTS,b=MediaPlayer.dependencies.FragmentLoader.RETRY_INTERVAL,c=[],d=function(a,e){var f=new XMLHttpRequest,g=[],h=!0,i=!0,j=null,k=this,l=function(b,c){i=!1;var d,e,h=new Date,l=f.response,m=null;g.push({s:h,d:h.getTime()-j.getTime(),b:[l?l.byteLength:0]}),b.firstByteDate||(b.firstByteDate=b.requestStartDate),b.requestEndDate=h,d=b.firstByteDate.getTime()-b.requestStartDate.getTime(),e=b.requestEndDate.getTime()-b.firstByteDate.getTime(),k.log((c?"loaded ":"failed ")+b.mediaType+":"+b.type+":"+b.startTime+" ("+f.status+", "+d+"ms, "+e+"ms)"),m=k.metricsModel.addHttpRequest(a.mediaType,null,a.type,a.url,f.responseURL||null,a.range,a.requestStartDate,b.firstByteDate,b.requestEndDate,f.status,a.duration,f.getAllResponseHeaders()),c&&g.forEach(function(a){k.metricsModel.appendHttpTrace(m,a.s,a.d,a.b)})};c.push(f),a.requestStartDate=new Date,g.push({s:a.requestStartDate,d:0,b:[0]}),j=a.requestStartDate,f.open("GET",k.requestModifierExt.modifyRequestURL(a.url),!0),f.responseType="arraybuffer",f=k.requestModifierExt.modifyRequestHeader(f),a.range&&f.setRequestHeader("Range","bytes="+a.range),f.onprogress=function(b){var c=new Date;h&&(h=!1,(!b.lengthComputable||b.lengthComputable&&b.total!=b.loaded)&&(a.firstByteDate=c)),b.lengthComputable&&(a.bytesLoaded=b.loaded,a.bytesTotal=b.total),g.push({s:c,d:c.getTime()-j.getTime(),b:[f.response?f.response.byteLength:0]}),j=c,k.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS,{request:a})},f.onload=function(){f.status<200||f.status>299||(l(a,!0),k.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,{request:a,response:f.response}))},f.onloadend=f.onerror=function(){-1!==c.indexOf(f)&&(c.splice(c.indexOf(f),1),i&&(l(a,!1),e>0?(k.log("Failed loading fragment: "+a.mediaType+":"+a.type+":"+a.startTime+", retry in "+b+"ms attempts: "+e),e--,setTimeout(function(){d.call(k,a,e)},b)):(k.log("Failed loading fragment: "+a.mediaType+":"+a.type+":"+a.startTime+" no retry attempts left"),k.errHandler.downloadError("content",a.url,f),k.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,{request:a,bytes:null},new MediaPlayer.vo.Error(null,"failed loading fragment",null)))))},f.send()},e=function(a){var b=this,c=new XMLHttpRequest,d=!1;c.open("HEAD",a.url,!0),c.onload=function(){c.status<200||c.status>299||(d=!0,b.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,{request:a,exists:!0}))},c.onloadend=c.onerror=function(){d||b.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,{request:a,exists:!1})},c.send()};return{metricsModel:void 0,errHandler:void 0,log:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,load:function(b){b?d.call(this,b,a):this.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,{request:b,bytes:null},new MediaPlayer.vo.Error(null,"request is null",null))},checkForExistence:function(a){return a?void e.call(this,a):void this.notify(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,{request:a,exists:!1})},abort:function(){var a,b,d=c.length;for(a=0;d>a;a+=1)b=c[a],c[a]=null,b.abort(),b=null;c=[]}}},MediaPlayer.dependencies.FragmentLoader.RETRY_ATTEMPTS=3,MediaPlayer.dependencies.FragmentLoader.RETRY_INTERVAL=500,MediaPlayer.dependencies.FragmentLoader.prototype={constructor:MediaPlayer.dependencies.FragmentLoader},MediaPlayer.dependencies.FragmentLoader.eventList={ENAME_LOADING_COMPLETED:"loadingCompleted",ENAME_LOADING_PROGRESS:"loadingProgress",ENAME_CHECK_FOR_EXISTENCE_COMPLETED:"checkForExistenceCompleted"},MediaPlayer.dependencies.LiveEdgeFinder=function(){"use strict";var a,b=!1,c=NaN,d=null,e=MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES,f=function(a){var b=((new Date).getTime()-c)/1e3;d=a.value,this.notify(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,{liveEdge:d,searchTime:b},null===d?new MediaPlayer.vo.Error(MediaPlayer.dependencies.LiveEdgeFinder.LIVE_EDGE_NOT_FOUND_ERROR_CODE,"live edge has not been found",null):null)},g=function(d){var g=this;!g.streamProcessor.isDynamic()||b||d.error||(a=g.synchronizationRulesCollection.getRules(e),b=!0,c=(new Date).getTime(),g.rulesController.applyRules(a,g.streamProcessor,f.bind(g),null,function(a,b){return b}))},h=function(a){e=a.error?MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES:MediaPlayer.rules.SynchronizationRulesCollection.prototype.TIME_SYNCHRONIZED_RULES};return{system:void 0,synchronizationRulesCollection:void 0,rulesController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED]=g,this[MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED]=h},initialize:function(a){this.streamProcessor=a,this.fragmentLoader=a.fragmentLoader},abortSearch:function(){b=!1,c=NaN},getLiveEdge:function(){return d},reset:function(){this.abortSearch(),d=null}}},MediaPlayer.dependencies.LiveEdgeFinder.prototype={constructor:MediaPlayer.dependencies.LiveEdgeFinder},MediaPlayer.dependencies.LiveEdgeFinder.eventList={ENAME_LIVE_EDGE_SEARCH_COMPLETED:"liveEdgeFound"},MediaPlayer.dependencies.LiveEdgeFinder.LIVE_EDGE_NOT_FOUND_ERROR_CODE=1,MediaPlayer.dependencies.ManifestLoader=function(){"use strict";var a=3,b=500,c=function(a){var b="";return-1!==a.indexOf("/")&&(-1!==a.indexOf("?")&&(a=a.substring(0,a.indexOf("?"))),b=a.substring(0,a.lastIndexOf("/")+1)),b},d=function(a,e){var f,g,h,i,j,k=c(a),l=new XMLHttpRequest,m=new Date,n=null,o=!0,p=this;g=function(){var b=null;l.status<200||l.status>299||(o=!1,n=new Date,l.responseURL&&l.responseURL!==a&&(k=c(l.responseURL),b=l.responseURL),p.metricsModel.addHttpRequest("stream",null,MediaPlayer.vo.metrics.HTTPRequest.MPD_TYPE,a,b,null,m,l.firstByteDate||null,n,l.status,null,l.getAllResponseHeaders()),f=p.parser.parse(l.responseText,k,p.xlinkController),f?(f.url=b||a,f.loadedTime=n,p.metricsModel.addManifestUpdate("stream",f.type,m,n,f.availabilityStartTime),p.xlinkController.resolveManifestOnLoad(f)):p.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,{manifest:null},new MediaPlayer.vo.Error(null,"Failed loading manifest: "+a,null)))},h=function(){o&&(o=!1,p.metricsModel.addHttpRequest("stream",null,MediaPlayer.vo.metrics.HTTPRequest.MPD_TYPE,a,l.responseURL||null,null,m,l.firstByteDate||null,new Date,l.status,null,l.getAllResponseHeaders()),e>0?(p.log("Failed loading manifest: "+a+", retry in "+b+"ms attempts: "+e),e--,setTimeout(function(){d.call(p,a,e)},b)):(p.log("Failed loading manifest: "+a+" no retry attempts left"),p.errHandler.downloadError("manifest",a,l),p.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,null,new Error("Failed loading manifest: "+a+" no retry attempts left"))))},i=function(a){j&&(j=!1,(!a.lengthComputable||a.lengthComputable&&a.total!=a.loaded)&&(l.firstByteDate=new Date))};try{l.onload=g,l.onloadend=h,l.onerror=h,l.onprogress=i,l.open("GET",p.requestModifierExt.modifyRequestURL(a),!0),l.send()}catch(q){l.onerror()}},e=function(a){this.notify(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,{manifest:a.data.manifest})};return{log:void 0,parser:void 0,errHandler:void 0,metricsModel:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,system:void 0,load:function(b){d.call(this,b,a)},setup:function(){e=e.bind(this),this.xlinkController=this.system.getObject("xlinkController"),this.xlinkController.subscribe(MediaPlayer.dependencies.XlinkController.eventList.ENAME_XLINK_READY,this,e)}}},MediaPlayer.dependencies.ManifestLoader.prototype={constructor:MediaPlayer.dependencies.ManifestLoader},MediaPlayer.dependencies.ManifestLoader.eventList={ENAME_MANIFEST_LOADED:"manifestLoaded"},MediaPlayer.dependencies.ManifestUpdater=function(){"use strict";var a,b=NaN,c=null,d=!0,e=!1,f=function(){null!==c&&(clearInterval(c),c=null)},g=function(){f.call(this),isNaN(b)||(this.log("Refresh manifest in "+b+" seconds."),c=setTimeout(i.bind(this),Math.min(1e3*b,Math.pow(2,31)-1),this))},h=function(a){var c,e;this.manifestModel.setValue(a),this.log("Manifest has been refreshed."),c=this.manifestExt.getRefreshDelay(a),e=((new Date).getTime()-a.loadedTime.getTime())/1e3,b=Math.max(c-e,0),this.notify(MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED,{manifest:a}),d||g.call(this)},i=function(){var b,c,f=this;d||e||(e=!0,b=f.manifestModel.getValue(),c=b.url,b.hasOwnProperty("Location")&&(c=b.Location),a.load(c))},j=function(a){a.error||h.call(this,a.data.manifest)},k=function(){d=!1,g.call(this)},l=function(){d=!0,f.call(this)},m=function(){e=!1};return{log:void 0,system:void 0,subscribe:void 0,unsubscribe:void 0,notify:void 0,manifestModel:void 0,manifestExt:void 0,setup:function(){this[MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED]=m,this[MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED]=j,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED]=k,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED]=l},initialize:function(b){e=!1,d=!0,a=b,a.subscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,this)},setManifest:function(a){h.call(this,a)},getManifestLoader:function(){return a},reset:function(){d=!0,e=!1,f.call(this),a.unsubscribe(MediaPlayer.dependencies.ManifestLoader.eventList.ENAME_MANIFEST_LOADED,this),b=NaN}}},MediaPlayer.dependencies.ManifestUpdater.prototype={constructor:MediaPlayer.dependencies.ManifestUpdater},MediaPlayer.dependencies.ManifestUpdater.eventList={ENAME_MANIFEST_UPDATED:"manifestUpdated"},MediaPlayer.dependencies.Notifier=function(){"use strict";var a,b="observableId",c=0,d=function(){return this[b]||(c+=1,this[b]="_id_"+c),this[b]};return{system:void 0,setup:function(){a=this.system,a.mapValue("notify",this.notify),a.mapValue("subscribe",this.subscribe),a.mapValue("unsubscribe",this.unsubscribe)},notify:function(){var b=arguments[0]+d.call(this),c=new MediaPlayer.vo.Event;c.sender=this,c.type=arguments[0],c.data=arguments[1],c.error=arguments[2],c.timestamp=(new Date).getTime(),a.notify.call(a,b,c)},subscribe:function(b,c,e,f){if(!e&&c[b]&&(e=c[b]=c[b].bind(c)),!c)throw"observer object cannot be null or undefined";if(!e)throw"event handler cannot be null or undefined";b+=d.call(this),a.mapHandler(b,void 0,e,f)},unsubscribe:function(b,c,e){e=e||c[b],b+=d.call(this),a.unmapHandler(b,void 0,e)}}},MediaPlayer.dependencies.Notifier.prototype={constructor:MediaPlayer.dependencies.Notifier},MediaPlayer.dependencies.Stream=function(){"use strict";var a,b,c=[],d=!1,e=!1,f=null,g={},h=!1,i=!1,j=null,k=function(a){a.error&&(this.errHandler.mediaKeySessionError(a.error),this.log(a.error),this.reset())},l=function(a){return"text"===a.type?a.mimeType:a.type},m=function(a,b,c){var d,e,f=this,g=a.type;if("muxed"===g&&a)return e="Multiplexed representations are intentionally not supported, as they are not compliant with the DASH-AVC/264 guidelines",this.log(e),this.errHandler.manifestError(e,"multiplexedrep",this.manifestModel.getValue()),!1;if("text"===g||"fragmentedText"===g)return!0;if(d=a.codec,f.log(g+" codec: "+d),a.contentProtection&&!f.capabilities.supportsEncryptedMedia())f.errHandler.capabilityError("encryptedmedia");else if(!f.capabilities.supportsCodec(f.videoModel.getElement(),d))return e=g+"Codec ("+d+") is not supported.",f.errHandler.manifestError(e,"codec",c),f.log(e),!1;return!0},n=function(a){var b=w.call(this,a.data.oldMediaInfo);if(b){var d=this.playbackController.getTime(),e=b.getBuffer(),f=a.data.newMediaInfo,g=this.manifestModel.getValue(),h=c.indexOf(b),i=b.getMediaSource();"fragmentedText"!==f.type?(b.reset(!0),o.call(this,f,g,i,{buffer:e,replaceIdx:h,currentTime:d}),this.playbackController.seek(this.playbackController.getTime())):(b.setIndexHandlerTime(d),b.updateMediaInfo(g,f))}},o=function(a,b,d,e){var g=this,h=g.system.getObject("streamProcessor"),i=this.adapter.getAllMediaInfoForType(b,f,a.type);if(h.initialize(l.call(g,a),g.fragmentController,d,g,j),g.abrController.updateTopQualityIndex(a),e?(h.setBuffer(e.buffer),c[e.replaceIdx]=h,h.setIndexHandlerTime(e.currentTime)):c.push(h),"text"===a.type||"fragmentedText"===a.type){for(var k,m=0;m<i.length;m++)i[m].index===a.index&&(k=m),h.updateMediaInfo(b,i[m]);"fragmentedText"===a.type&&h.updateMediaInfo(b,i[k])}else h.updateMediaInfo(b,a);return h},p=function(a,b){var c,d=this,e=d.manifestModel.getValue(),g=this.adapter.getAllMediaInfoForType(e,f,a),h=null;if(!g||0===g.length)return void d.log("No "+a+" data.");for(var i=0,j=g.length;j>i;i+=1)h=g[i],m.call(d,h,b,e)&&d.mediaController.isMultiTrackSupportedByType(h.type)&&d.mediaController.addTrack(h,f);0!==this.mediaController.getTracksFor(a,f).length&&(this.mediaController.checkInitialMediaSettings(f),c=this.mediaController.getCurrentTrackFor(a,f),o.call(this,c,e,b))},q=function(a){var b,d=this,g=d.manifestModel.getValue();if(j=d.system.getObject("eventController"),b=d.adapter.getEventsFor(g,f),j.addInlineEvents(b),h=!0,p.call(d,"video",a),p.call(d,"audio",a),p.call(d,"text",a),p.call(d,"fragmentedText",a),p.call(d,"muxed",a),t.call(d),e=!0,h=!1,0===c.length){var i="No streams to play.";d.errHandler.manifestError(i,"nostreams",g),d.log(i)}else d.liveEdgeFinder.initialize(c[0]),d.liveEdgeFinder.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,d.playbackController),r.call(this)},r=function(){var b=this,j=c.length,k=!!g.audio||!!g.video,l=k?new MediaPlayer.vo.Error(MediaPlayer.dependencies.Stream.DATA_UPDATE_FAILED_ERROR_CODE,"Data update failed",null):null,m=0;for(m;j>m;m+=1)if(c[m].isUpdating()||h)return;i=!0,b.eventBus.dispatchEvent({type:MediaPlayer.events.STREAM_INITIALIZED,data:{streamInfo:f}}),b.notify(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,{streamInfo:f},l),e&&!d&&(a.init(b.manifestModel.getValue(),s.call(this,"audio"),s.call(this,"video")),d=!0)},s=function(a){for(var b=c.length,d=null,e=0;b>e;e+=1)if(d=c[e],d.getType()===a)return d.getMediaInfo();return null},t=function(){for(var a=0,b=c.length;b>a;a+=1)c[a].createBuffer()},u=function(){var a=x(),b=a.length,c=0;for(c;b>c;c+=1)if(!a[c].isBufferingCompleted())return;this.notify(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED,{streamInfo:f})},v=function(a){var b=a.sender.streamProcessor.getType();g[b]=a.error,r.call(this)},w=function(a){if(!a)return!1;var b=x.call(this);return b.filter(function(b){return b.getType()===a.type})[0]},x=function(){var a,b,d=[],e=0,f=c.length;for(e;f>e;e+=1)b=c[e],a=b.getType(),("audio"===a||"video"===a||"fragmentedText"===a)&&d.push(b);return d},y=function(a){var b,e,g,k=this,l=c.length,m=k.manifestModel.getValue(),n=0;for(d=!1,f=a,k.log("Manifest updated... set new data on buffers."),j&&(e=k.adapter.getEventsFor(m,f),j.addInlineEvents(e)),h=!0,i=!1,n;l>n;n+=1)g=c[n],b=k.adapter.getMediaInfoForType(m,f,g.getType()),this.abrController.updateTopQualityIndex(b),g.updateMediaInfo(m,b);h=!1,r.call(k)};return{system:void 0,eventBus:void 0,manifestModel:void 0,sourceBufferExt:void 0,adapter:void 0,videoModel:void 0,fragmentController:void 0,playbackController:void 0,mediaController:void 0,capabilities:void 0,log:void 0,errHandler:void 0,liveEdgeFinder:void 0,abrController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED]=u,this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=v,this[MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED]=n},initialize:function(c,d){f=c,a=d,b=k.bind(this),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,b),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.SERVER_CERTIFICATE_UPDATED,b),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_ADDED,b),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CREATED,b),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,b),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,b),a.addEventListener(MediaPlayer.dependencies.ProtectionController.events.LICENSE_REQUEST_COMPLETE,b)},activate:function(a){d?t.call(this):q.call(this,a)},deactivate:function(){var a=c.length,b=0;for(b;a>b;b+=1)c[b].reset();c=[],d=!1,e=!1,this.resetEventController()},reset:function(f){this.playbackController.pause();var k,l=c.length,m=0;for(m;l>m;m+=1)k=c[m],k.reset(f),k=null;j&&j.reset(),c=[],h=!1,i=!1,this.fragmentController&&this.fragmentController.reset(),this.fragmentController=void 0,this.liveEdgeFinder.abortSearch(),this.liveEdgeFinder.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,this.playbackController),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,b),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.SERVER_CERTIFICATE_UPDATED,b),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_ADDED,b),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CREATED,b),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,b),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,b),a.removeEventListener(MediaPlayer.dependencies.ProtectionController.events.LICENSE_REQUEST_COMPLETE,b),e=!1,d=!1,g={}},getDuration:function(){return f.duration},getStartTime:function(){return f.start},getStreamIndex:function(){return f.index},getId:function(){return f.id},getStreamInfo:function(){return f},hasMedia:function(a){return null!==s.call(this,a)},getBitrateListFor:function(a){var b=s.call(this,a);return this.abrController.getBitrateList(b)},startEventController:function(){j.start()},resetEventController:function(){j.reset()},isActivated:function(){return d},isInitialized:function(){return i},updateData:y}},MediaPlayer.dependencies.Stream.prototype={constructor:MediaPlayer.dependencies.Stream},MediaPlayer.dependencies.Stream.DATA_UPDATE_FAILED_ERROR_CODE=1,MediaPlayer.dependencies.Stream.eventList={ENAME_STREAM_UPDATED:"streamUpdated",ENAME_STREAM_BUFFERING_COMPLETED:"streamBufferingCompleted"},MediaPlayer.dependencies.StreamProcessor=function(){"use strict";var a,b=null,c=null,d=null,e=null,f=[],g=function(a){var b=this,c="video"===a||"audio"===a||"fragmentedText"===a?"bufferController":"textController";return b.system.getObject(c)};return{system:void 0,videoModel:void 0,indexHandler:void 0,liveEdgeFinder:void 0,timelineConverter:void 0,abrController:void 0,playbackController:void 0,baseURLExt:void 0,adapter:void 0,manifestModel:void 0,initialize:function(c,f,h,i,j){var k,l=this,m=l.system.getObject("representationController"),n=l.system.getObject("scheduleController"),o=l.liveEdgeFinder,p=l.abrController,q=l.indexHandler,r=l.baseURLExt,s=l.playbackController,t=l.system.getObject("mediaController"),u=this.system.getObject("fragmentLoader"),v=g.call(l,c);b=i,d=c,e=j,a=b.getStreamInfo().manifestInfo.isDynamic,l.bufferController=v,l.scheduleController=n,l.representationController=m,l.fragmentController=f,l.fragmentLoader=u,m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,v),f.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED,v),"video"===d||"audio"===d||"fragmentedText"===d?(p.subscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,v),p.subscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,m),p.subscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,n),o.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,this.timelineConverter),o.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,m),o.subscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,n),b.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,s),f.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED,v),f.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START,n),f.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,n),f.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,v),f.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,n.scheduleRulesCollection.bufferLevelRule),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,s),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED,n),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,n),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,n),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,m),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,n),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED,n),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED,b),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED,n),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,n.scheduleRulesCollection.bufferLevelRule),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,n.scheduleRulesCollection.bufferLevelRule),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,s),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS,v),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,v),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,v),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,n),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,v),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,n),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,n),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,n.scheduleRulesCollection.playbackTimeRule),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,p.abrRulesCollection.insufficientBufferRule),a&&s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,m),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,v),s.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,n),r.subscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,q),r.subscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,q),("video"===d||"audio"===d)&&t.subscribe(MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED,v)):v.subscribe(MediaPlayer.dependencies.TextController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED,n),m.subscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,b),q.initialize(this),q.setCurrentTime(s.getStreamStartTime(this.getStreamInfo())),v.initialize(d,h,l),n.initialize(d,this),p.initialize(d,this),k=this.getFragmentModel(),k.setLoader(u),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED,f),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,f),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED,f),k.subscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,n),u.subscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,k),u.subscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS,p),("video"===d||"audio"===d||"fragmentedText"===d)&&(v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,k),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,k),v.subscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED,k)),m.initialize(this)},isUpdating:function(){return this.representationController.isUpdating()},getType:function(){return d},getABRController:function(){return this.abrController},getFragmentLoader:function(){return this.fragmentLoader},getBuffer:function(){return this.bufferController.getBuffer()},setBuffer:function(a){this.bufferController.setBuffer(a)},getFragmentModel:function(){return this.scheduleController.getFragmentModel()},getStreamInfo:function(){return b.getStreamInfo()},updateMediaInfo:function(a,b){b===c||b&&c&&b.type!==c.type||(c=b),-1===f.indexOf(b)&&f.push(b),this.adapter.updateData(a,this)},getMediaInfoArr:function(){return f},getMediaInfo:function(){return c},getMediaSource:function(){return this.bufferController.getMediaSource()},getScheduleController:function(){return this.scheduleController},getEventController:function(){return e},start:function(){
this.scheduleController.start()},stop:function(){this.scheduleController.stop()},getIndexHandlerTime:function(){return this.adapter.getIndexHandlerTime(this)},setIndexHandlerTime:function(a){this.adapter.setIndexHandlerTime(this,a)},getCurrentRepresentationInfo:function(){return this.adapter.getCurrentRepresentationInfo(this.manifestModel.getValue(),this.representationController)},getRepresentationInfoForQuality:function(a){return this.adapter.getRepresentationInfoForQuality(this.manifestModel.getValue(),this.representationController,a)},isBufferingCompleted:function(){return this.bufferController.isBufferingCompleted()},createBuffer:function(){return this.bufferController.getBuffer()||this.bufferController.createBuffer(c)},isDynamic:function(){return a},reset:function(f){var g=this,h=g.bufferController,i=g.representationController,j=g.scheduleController,k=g.liveEdgeFinder,l=g.fragmentController,m=g.abrController,n=g.playbackController,o=this.system.getObject("mediaController"),p=this.indexHandler,q=this.baseURLExt,r=this.getFragmentModel(),s=this.fragmentLoader;m.unsubscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,h),m.unsubscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,i),m.unsubscribe(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,j),k.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,this.timelineConverter),k.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,j),k.unsubscribe(MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED,i),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED,j),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,h),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,j),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,b),i.unsubscribe(Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED,n),b.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,j),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED,h),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED,h),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START,j),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,j),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,h),l.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,j.scheduleRulesCollection.bufferLevelRule),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,n),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,i),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED,b),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED,j),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,j.scheduleRulesCollection.bufferLevelRule),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,j.scheduleRulesCollection.bufferLevelRule),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,n),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,i),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,h),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,j),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,j.scheduleRulesCollection.playbackTimeRule),n.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,m.abrRulesCollection.insufficientBufferRule),q.unsubscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_INITIALIZATION_LOADED,p),q.unsubscribe(Dash.dependencies.BaseURLExtensions.eventList.ENAME_SEGMENTS_LOADED,p),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,r),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,r),h.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED,r),r.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED,l),r.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,l),r.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED,l),r.unsubscribe(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,j),s.unsubscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED,r),s.unsubscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS,m),r.reset(),("video"===d||"audio"===d)&&o.unsubscribe(MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED,h),p.reset(),this.bufferController.reset(f),this.scheduleController.reset(),this.bufferController=null,this.scheduleController=null,this.representationController=null,this.videoModel=null,this.fragmentController=null,a=void 0,b=null,c=null,d=null,e=null}}},MediaPlayer.dependencies.StreamProcessor.prototype={constructor:MediaPlayer.dependencies.StreamProcessor},MediaPlayer.utils.TTMLParser=function(){"use strict";var a,b,c,d=3600,e=60,f=/^([0-9][0-9]+):([0-5][0-9]):([0-5][0-9])|(60)(\.([0-9])+)?$/,g={},h={},i={},j={top:"85%;",left:"5%;",width:"90%;",height:"10%;","align-items":"flex-start;",overflow:"visible;","-ms-writing-mode":"lr-tb, horizontal-tb;;","-webkit-writing-mode":"horizontal-tb;","-moz-writing-mode":"horizontal-tb;","writing-mode":"horizontal-tb;"},k={color:"rgb(255,255,255);",direction:"ltr;","font-family":"monospace, sans-serif;","font-style":"normal;","line-height":"normal;","font-weight":"normal;","text-align":"start;","justify-content":"flex-start;","text-decoration":"none;","unicode-bidi":"normal;","white-space":"normal;",width:"100%;"},l={monospace:"font-family: monospace;",sansSerif:"font-family: sans-serif;",serif:"font-family: serif;",monospaceSansSerif:"font-family: monospace, sans-serif;",monospaceSerif:"font-family: monospace, serif;",proportionalSansSerif:"font-family: Arial;",proportionalSerif:"font-family: Times New Roman;","default":"font-family: monospace, sans-serif;"},m={right:["justify-content: flex-end;","text-align: right;"],start:["justify-content: flex-start;","text-align: start;"],center:["justify-content: center;","text-align: center;"],end:["justify-content: flex-end;","text-align: end;"],left:["justify-content: flex-start;","text-align: left;"]},n={start:"text-align: start;",center:"text-align: center;",end:"text-align: end;",auto:""},o={wrap:"white-space: normal;",noWrap:"white-space: nowrap;"},p={normal:"unicode-bidi: normal;",embed:"unicode-bidi: embed;",bidiOverride:"unicode-bidi: bidi-override;"},q={before:"align-items: flex-start;",center:"align-items: center;",after:"align-items: flex-end;"},r={lrtb:"-webkit-writing-mode: horizontal-tb;writing-mode: horizontal-tb;",rltb:"-webkit-writing-mode: horizontal-tb;writing-mode: horizontal-tb;direction: rtl;unicode-bidi: bidi-override;",tbrl:"-webkit-writing-mode: vertical-rl;writing-mode: vertical-rl;-webkit-text-orientation: upright;text-orientation: upright;",tblr:"-webkit-writing-mode: vertical-lr;writing-mode: vertical-lr;-webkit-text-orientation: upright;text-orientation: upright;",lr:"-webkit-writing-mode: horizontal-tb;writing-mode: horizontal-tb;",rl:"-webkit-writing-mode: horizontal-tb;writing-mode: horizontal-tb;direction: rtl;",tb:"-webkit-writing-mode: vertical-rl;writing-mode: vertical-rl;-webkit-text-orientation: upright;text-orientation: upright;"},s=function(b){var c,g,h,i=f.test(b);if(!i)return NaN;if(c=b.split(":"),g=parseFloat(c[0])*d+parseFloat(c[1])*e+parseFloat(c[2]),c[3]){if(h=a.tt.frameRate,!h||isNaN(h))return NaN;g+=parseFloat(c[3])/h}return g},t=function(){var b=a.hasOwnProperty("tt"),c=b?a.tt.hasOwnProperty("head"):!1,d=c?a.tt.head.hasOwnProperty("layout"):!1,e=c?a.tt.head.hasOwnProperty("styling"):!1,f=b?a.tt.hasOwnProperty("body"):!1;return b&&c&&d&&e&&f},u=function(a,b){var c=Object.keys(a).filter(function(c){return("xmlns"===c.split(":")[0]||"xmlns"===c.split(":")[1])&&a[c]===b}).map(function(a){return a.split(":")[2]||a.split(":")[1]});return 1!=c.length?null:c[0]},v=function(a,b){for(var c in a)if(a.hasOwnProperty(c)){if(("object"==typeof a[c]||a[c]instanceof Object)&&!Array.isArray(a[c]))v(a[c],b);else if(Array.isArray(a[c]))for(var d=0;d<a[c].length;d++)v(a[c][d],b);var e=c.slice(c.indexOf(b)+b.length+1);a[e]=a[c],delete a[c]}},w=function(a){return a.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},x=function(a){var b=a.slice(1),c=b.match(/.{2}/g),d=parseFloat(parseInt(parseInt(c[3],16)/255*1e3)/1e3),e=c.slice(0,3).map(function(a){return parseInt(a,16)});return"rgba("+e.join(",")+","+d+");"},y=function(a,b){for(var c=0;c<b.length;c++)if(b[c].indexOf(a)>-1)return!0;return!1},z=function(a,b){for(var c=0;c<b.length;c++)if(b[c].indexOf(a)>-1)return b[c];return null},A=function(a,b){b.splice(b.indexOf(z(a,b)),1)},B=function(a,b){for(var c=0;c<a.length;c++)for(var d=0;d<b.length;d++)a[c]&&a[c].split(":")[0].indexOf(b[d].split(":")[0])>-1&&a.splice(c,1);return a.concat(b)},C=function(a,b){var c=[];for(var d in a)if(a.hasOwnProperty(d)){var e=d.replace("ebutts:","");e=e.replace("xml:",""),e=e.replace("tts:",""),e=w(e),a[e]=a[d],delete a[d]}if("line-padding"in a){var f=parseFloat(a["line-padding"].slice(a["line-padding"].indexOf(":")+1,a["line-padding"].indexOf("c")));"id"in a&&(i[a.id]=f);var j=f*b[0]+"px;";c.push("padding-left:"+j),c.push("padding-right:"+j)}if("font-size"in a){var k=parseFloat(a["font-size"].slice(a["font-size"].indexOf(":")+1,a["font-size"].indexOf("%")));"id"in a&&(g[a.id]=k);var q=k/100*b[1]+"px;";c.push("font-size:"+q)}if("line-heigt"in a)if("normal"===a["line-height"])c.push("line-heigth: normal;");else{var r=parseFloat(a["line-heigt"].slice(a["line-heigt"].indexOf(":")+1,a["line-heigt"].indexOf("%")));"id"in a&&(h[a.id]=r);var s=r/100*b[1]+"px;";c.push(d+":"+s)}"font-family"in a&&(a["font-family"]in l?c.push(l[a["font-family"]]):c.push("font-family:"+a["font-family"]+";")),"text-align"in a&&a["text-align"]in m&&(c.push(m[a["text-align"]][0]),c.push(m[a["text-align"]][1])),"multi-row-align"in a&&(y("text-align",c)&&"auto"!=a["multi-row-align"]&&A("text-align",c),a["multi-row-align"]in n&&c.push(n[a["multi-row-align"]]));var t;return"background-color"in a&&(a["background-color"].indexOf("#")>-1&&a["background-color"].length-1===8?(t=x(a["background-color"]),c.push("background-color: "+t)):c.push("background-color:"+a["background-color"]+";")),"color"in a&&(a.color.indexOf("#")>-1&&a.color.length-1===8?(t=x(a.color),c.push("color: "+t)):c.push("color:"+a.color+";")),"wrap-option"in a&&(a["wrap-option"]in o?c.push(o[a["wrap-option"]]):c.push("white-space:"+a["wrap-option"])),"unicode-bidi"in a&&(a["unicode-bidi"]in p?c.push(p[a["unicode-bidi"]]):c.push("unicode-bidi:"+a["unicode-bidi"])),"font-style"in a&&c.push("font-style:"+a["font-style"]+";"),"font-weight"in a&&c.push("font-weight:"+a["font-weight"]+";"),"direction"in a&&c.push("direction:"+a.direction+";"),"text-decoration"in a&&c.push("text-decoration:"+a["text-decoration"]+";"),c},D=function(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(d["xml:id"]===b||d.id===b)return d}return null},E=function(a,c){var d=[],e=a.match(/\S+/g);return e.forEach(function(a){var e=D(b,a);if(e){var f=C(JSON.parse(JSON.stringify(e)),c);d=d.concat(f)}}),d},F=function(a,b){var c=[];for(var d in a){var e=d.replace("tts:","");e=e.replace("xml:",""),e=w(e),a[e]=a[d],e!==d&&delete a[d]}if("extent"in a){var f=a.extent.split(/\s/);c.push("width: "+f[0]+";"),c.push("height: "+f[1]+";")}if("origin"in a){var g=a.origin.split(/\s/);c.push("left: "+g[0]+";"),c.push("top: "+g[1]+";")}if("display-align"in a&&c.push(q[a["display-align"]]),"writing-mode"in a&&c.push(r[a["writing-mode"]]),"style"in a){var h=E(a.style,b);c=c.concat(h)}return"padding"in a&&c.push("padding:"+a.padding+";"),"overflow"in a&&c.push("overflow:"+a.overflow+";"),"show-background"in a&&c.push("show-background:"+a["show-background"]+";"),"id"in a&&c.push("regionID:"+a.id+";"),c},G=function(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(d["xml:id"]===b||d.id===b)return d}return null},H=function(a,b){var d=[],e=a.match(/\S+/g);return e.forEach(function(a){var e=G(c,a);if(e){var f=F(JSON.parse(JSON.stringify(e)),b);d=d.concat(f)}}),d},I=function(){var b=[32,15];return a.tt.hasOwnProperty("ttp:cellResolution")?a.tt["ttp:cellResolution"].split(" ").map(parseFloat):b},J=function(a,b){for(var c=z("padding-left",b),d=z("padding-right",b),e=c.concat(" "+d),f="",g="",h="",i=Array.prototype.slice.call(a.children),j=a.getElementsByClassName("lineBreak")[0],k=i.indexOf(j),l=[];-1!=k;)l.push(k),k=i.indexOf(j,k+1);var m="</span>",n="<br>",o='<span class="spanPadding" style="-webkit-box-decoration-break: clone; ';if(l.length)l.forEach(function(a,b){if(0===b){for(var c="",d=0;a>d;d++)f+=i[d].outerHTML,0===d&&(c=e.concat(i[d].style.cssText));f=o+c+'">'+f}for(var j="",k=a+1;k<i.length;k++)g+=i[k].outerHTML,k===i.length-1&&(j+=e.concat(i[k].style.cssText));g=o+j+'">'+g,f&&g&&b===l.length-1?h+=f+m+n+g+m:f&&g&&b!==l.length-1?h+=f+m+n+g+m+n:f&&!g?h+=f+m:!f&&g&&b===l.length-1?h+=g+m:!f&&g&&b!==l.length-1&&(h+=g+m+n)});else{for(var p="",q=0;q<i.length;q++)p+=i[q].style.cssText;h=o+e+p+'">'+a.innerHTML+m}return h},K=function(a,b){var c=document.createElement("div");return a.forEach(function(a){if(!a.hasOwnProperty("metadata"))if(a.hasOwnProperty("span")){var d=a.span.__children,e=document.createElement("span");if(a.span.hasOwnProperty("style")){var f=E(a.span.style,b);e.className="spanPadding "+a.span.style,e.style.cssText=f.join(" ")}d.forEach(function(a){if(!d.hasOwnProperty("metadata"))if(a.hasOwnProperty("#text")){var b=document.createTextNode(a["#text"]);e.appendChild(b)}else if("br"in a){e.hasChildNodes()&&c.appendChild(e);var f=document.createElement("br");f.className="lineBreak",c.appendChild(f);var g=document.createElement("span");g.className=e.className,g.style.cssText=e.style.cssText,e=g}}),c.appendChild(e)}else if(a.hasOwnProperty("br")){var g=document.createElement("br");g.className="lineBreak",c.appendChild(g)}else if(a.hasOwnProperty("#text")){var h=document.createElement("span");h.innerHTML=a["#text"],c.appendChild(h)}}),c},L=function(a,b,c){var d,e,f=[],g=a.region,h=b.region;return h&&(d=H(h,c)),g?(e=f.concat(H(g,c)),f=d?B(d,e):e):d&&(f=d),N(f,j),f},M=function(b,c){var d,e,f,g=[],h=b.style,i=a.tt.body.style,j=a.tt.body.div.style,l="";return i&&(d=E(i,c),l="paragraph "+i),j&&(e=E(j,c),d?(e=B(d,e),l+=" "+j):l="paragraph "+j),h?(f=E(h,c),d&&e?(g=B(e,f),l+=" "+h):d?(g=B(d,f),l+=" "+h):e?(g=B(e,f),l+=" "+h):(g=f,l="paragraph "+h)):d&&!e?g=d:!d&&e&&(g=e),N(g,k),[g,l]},N=function(a,b){for(var c in b)b.hasOwnProperty(c)&&(y(c,a)||a.push(c+":"+b[c]))},O=function(d){var e,f=this,j=new X2JS([],"",!1);a=j.xml_str2json(d),f.videoModel.getTTMLRenderingDiv()&&(e="html");var l=u(a,"http://www.w3.org/ns/ttml");if(l&&v(a,l),c=a.tt.head.layout.region_asArray,b=a.tt.head.styling.style_asArray,!t()){var m="TTML document has incorrect structure";throw m}var n=I(),o=f.videoModel.getElement().clientWidth,p=f.videoModel.getElement().clientHeight,q=[o/n[0],p/n[1]];k["font-size"]=q[1]+"px;";for(var r=[],w=0;w<c.length;w++)r.push(F(JSON.parse(JSON.stringify(c[w])),q));var x=u(a.tt,"http://www.w3.org/ns/ttml#parameter");a.tt.hasOwnProperty(x+":frameRate")&&(a.tt.frameRate=parseInt(a.tt[x+":frameRate"],10));var B=[],C=a.tt.body_asArray[0].__children;return C.forEach(function(b){var c=b.div.p_asArray;if(!c||0===c.length){var d="TTML document does not contain any cues";throw d}var f,j,k,l;c.forEach(function(c){if(c.hasOwnProperty("begin")&&c.hasOwnProperty("end"))f=s(c.begin),j=s(c.end);else{if(!c.span.hasOwnProperty("begin")||!c.span.hasOwnProperty("end"))throw d="TTML document has incorrect timing value";k=s(c.span.begin),l=s(c.span.end)}if(void 0!==c["smpte:backgroundImage"])for(var m=a.tt.head.metadata.image_asArray,t=0;t<m.length;t+=1)"#"+m[t]["xml:id"]==c["smpte:backgroundImage"]&&B.push({start:k||f,end:l||j,id:m[t]["xml:id"],data:"data:image/"+m[t].imagetype.toLowerCase()+";base64, "+m[t].__text,type:"image"});else if("html"===e){h={},i={},g={};var u="";if((c.hasOwnProperty("id")||c.hasOwnProperty("xml:id"))&&(u=c["xml:id"]||c.id),(isNaN(f)||isNaN(j))&&(isNaN(k)||isNaN(l)))throw d="TTML document has incorrect timing value";var v=L(c,b.div,q),w=M(c,q),x=w[1];w=w[0];var C=document.createElement("div");C.className=x;var D=c.__children,E=K(D,q);E.className="cueDirUniWrapper",y("unicode-bidi",w)&&(E.style.cssText+=z("unicode-bidi",w),A("unicode-bidi",w)),y("direction",w)&&(E.style.cssText+=z("direction",w),A("direction",w)),y("padding-left",w)&&y("padding-right",w)&&(E.innerHTML=J(E,w)),y("padding-left",w)&&y("padding-right",w)&&(A("padding-left",w),A("padding-right",w));var F="";if(y("regionID",v)){var G=z("regionID",v);F=G.slice(G.indexOf(":")+1,G.length-1)}w&&(C.style.cssText=w.join(" ")+"display:flex;"),v&&(v=v.join(" ")),C.appendChild(E);var H=document.createElement("div");H.appendChild(C),H.id="subtitle_"+u,H.style.cssText="position: absolute; z-index: 2147483647; margin: 0; display: flex; box-sizing: border-box; pointer-events: none;"+v,0===Object.keys(g).length&&(g.defaultFontSize="100"),B.push({start:k||f,end:l||j,type:"html",cueHTMLElement:H,regions:r,regionID:F,cueID:u,videoHeight:p,videoWidth:o,cellResolution:n,fontSize:g||{defaultFontSize:"100"},lineHeight:h,linePadding:i})}else{var I="",N=c.__children;N.length&&N.forEach(function(a){if(a.hasOwnProperty("span")){var b=a.span.__children;b.forEach(function(a){b.hasOwnProperty("metadata")||(a.hasOwnProperty("#text")?I+=a["#text"].replace(/[\r\n]+/gm," ").trim():"br"in a&&(I+="\n"))})}else I+=a.hasOwnProperty("br")?"\n":a["#text"].replace(/[\r\n]+/gm," ").trim()}),B.push({start:k||f,end:l||j,data:I,type:"text"})}})}),B};return{parse:O,videoModel:void 0}},MediaPlayer.dependencies.TextSourceBuffer=function(){var a=!1,b=null,c=function(){for(var b=this.videoModel.getElement(),c=b.textTracks,d=c.length,e=this,f=0;d>f;f++){var g=c[f];if(a="showing"!==g.mode,"showing"===g.mode){if(e.textTrackExtensions.getCurrentTrackIdx()!==f){var h=e.textTrackExtensions.getCurrentTextTrack();null!==h&&(e.textTrackExtensions.deleteTrackCues(h),"html"===h.renderingType&&(e.textTrackExtensions.removeCueStyle(),e.textTrackExtensions.clearCues())),e.textTrackExtensions.setCurrentTrackIdx(f),e.mediaController.isCurrentTrack(e.allTracks[f])||(e.textTrackExtensions.deleteTrackCues(e.textTrackExtensions.getCurrentTextTrack()),e.fragmentModel.cancelPendingRequests(),e.fragmentModel.abortRequests(),e.buffered.clear(),e.mediaController.setTrack(e.allTracks[f]))}break}}a&&e.textTrackExtensions.setCurrentTrackIdx(-1)};return{system:void 0,videoModel:void 0,errHandler:void 0,adapter:void 0,manifestExt:void 0,mediaController:void 0,streamController:void 0,initialize:function(a,b){this.sp=b.streamProcessor,this.mediaInfos=this.sp.getMediaInfoArr(),this.textTrackExtensions=this.system.getObject("textTrackExtensions"),this.isFragmented=!this.manifestExt.getIsTextTrack(a),this.isFragmented&&(this.fragmentModel=this.sp.getFragmentModel(),this.buffered=this.system.getObject("customTimeRanges"),this.initializationSegmentReceived=!1,this.timescale=9e4,this.allTracks=this.mediaController.getTracksFor("fragmentedText",this.streamController.getActiveStreamInfo()))},append:function(a,c){function d(a,b){var c=new MediaPlayer.vo.TextTrackInfo,d={subtitle:"subtitles",caption:"captions"},e=function(){var a=b.roles.length>0?d[b.roles[0]]:d.caption;return a=a!==d.caption||a!==d.subtitle?d.caption:a};c.captionData=a,c.lang=b.lang,c.label=b.id,c.video=i.videoModel.getElement(),c.defaultTrack=i.getIsDefault(b),c.isFragmented=i.isFragmented,c.kind=e(),i.textTrackExtensions.addTextTrack(c,i.mediaInfos.length)}var e,f,g,h,i=this,j=c.mediaInfo,k=j.type,l=j.mimeType;if("fragmentedText"===k){var m=i.system.getObject("fragmentExt");if(this.initializationSegmentReceived)for(f=m.getSamplesInfo(a),g=0;g<f.length;g++){this.firstSubtitleStart||(this.firstSubtitleStart=f[0].cts-c.start*this.timescale),f[g].cts-=this.firstSubtitleStart,this.buffered.add(f[g].cts/this.timescale,(f[g].cts+f[g].duration)/this.timescale),h=window.UTF8.decode(new Uint8Array(a.slice(f[g].offset,f[g].offset+f[g].size))),b=null!==b?b:i.getParser(l);try{e=b.parse(h),this.textTrackExtensions.addCaptions(this.firstSubtitleStart/this.timescale,e)}catch(n){}}else{for(this.initializationSegmentReceived=!0,g=0;g<this.mediaInfos.length;g++)d(null,this.mediaInfos[g]);this.timescale=m.getMediaTimescaleFromMoov(a)}}else{a=new Uint8Array(a),h=window.UTF8.decode(a);try{e=i.getParser(l).parse(h),d(e,j)}catch(n){i.errHandler.closedCaptionsError(n,"parse",h)}}},getIsDefault:function(a){return a.index===this.mediaInfos[0].index},abort:function(){this.textTrackExtensions.deleteAllTextTracks(),a=!1,b=null},getParser:function(a){var b;return"text/vtt"===a?b=this.system.getObject("vttParser"):("application/ttml+xml"===a||"application/mp4"===a)&&(b=this.system.getObject("ttmlParser")),b},getAllTracksAreDisabled:function(){return a},setTextTrack:c}},MediaPlayer.dependencies.TextSourceBuffer.prototype={constructor:MediaPlayer.dependencies.TextSourceBuffer},MediaPlayer.dependencies.TimeSyncController=function(){"use strict";var a,b=5e3,c=0,d=!1,e=!1,f=function(a){d=a},g=function(){return d},h=function(a){e=a},i=function(a){c=a},j=function(){return c},k=function(a){var b,c,d=60,e=60,f=1e3,g=/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]*)(\.[0-9]*)?)?(?:([+\-])([0-9]{2})([0-9]{2}))?/,h=g.exec(a);return b=Date.UTC(parseInt(h[1],10),parseInt(h[2],10)-1,parseInt(h[3],10),parseInt(h[4],10),parseInt(h[5],10),h[6]&&(parseInt(h[6],10)||0),h[7]&&parseFloat(h[7])*f||0),h[9]&&h[10]&&(c=parseInt(h[9],10)*e+parseInt(h[10],10),b+=("+"===h[8]?-1:1)*c*d*f),new Date(b).getTime()},l=function(a){var b=Date.parse(a);return isNaN(b)&&(b=k(a)),b},m=function(a){return Date.parse(a)},n=function(a){return Date.parse(a)},o=function(a,b,c){c()},p=function(a,b,c){var d=l(a);return isNaN(d)?void c():void b(d)},q=function(a,c,d,e,f){var g,h,i=!1,j=new XMLHttpRequest,k=f?"HEAD":"GET",l=c.match(/\S+/g);c=l.shift(),g=function(){i||(i=!0,l.length?q(a,l.join(" "),d,e,f):e())},h=function(){var b,c;200===j.status&&(b=f?j.getResponseHeader("Date"):j.response,c=a(b),isNaN(c)||(d(c),i=!0))},j.open(k,c),j.timeout=b||0,j.onload=h,j.onloadend=g,j.send()},r=function(a,b,c){q.call(this,n,a,b,c,!0)},s={"urn:mpeg:dash:utc:http-head:2014":r,"urn:mpeg:dash:utc:http-xsdate:2014":q.bind(null,l),"urn:mpeg:dash:utc:http-iso:2014":q.bind(null,m),"urn:mpeg:dash:utc:direct:2014":p,"urn:mpeg:dash:utc:http-head:2012":r,"urn:mpeg:dash:utc:http-xsdate:2012":q.bind(null,l),"urn:mpeg:dash:utc:http-iso:2012":q.bind(null,m),"urn:mpeg:dash:utc:direct:2012":p,"urn:mpeg:dash:utc:http-ntp:2014":o,"urn:mpeg:dash:utc:ntp:2014":o,"urn:mpeg:dash:utc:sntp:2014":o},t=function(){var a=this.metricsModel.getReadOnlyMetricsFor("stream"),b=this.metricsExt.getLatestMPDRequestHeaderValueByID(a,"Date"),d=null!==b?new Date(b).getTime():Number.NaN;isNaN(d)?u.call(this,!0):(i(d-(new Date).getTime()),u.call(this,!1,d/1e3,c))},u=function(a,b,c){f(!1),this.notify(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,{time:b,offset:c},a?new MediaPlayer.vo.Error(MediaPlayer.dependencies.TimeSyncController.TIME_SYNC_FAILED_ERROR_CODE):null)},v=function(b,c){var d=this,e=c||0,g=b[e],h=function(b,c){var e=!b||!c;e&&a?t.call(d):u.call(d,e,b,c)};f(!0),g?s.hasOwnProperty(g.schemeIdUri)?s[g.schemeIdUri](g.value,function(a){var b=(new Date).getTime(),c=a-b;i(c),d.log("Local time:      "+new Date(b)),d.log("Server time:     "+new Date(a)),d.log("Difference (ms): "+c),h.call(d,a,c)},function(){v.call(d,b,e+1)}):v.call(d,b,e+1):(i(0),h.call(d))};return{log:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,metricsModel:void 0,metricsExt:void 0,getOffsetToDeviceTimeMs:function(){return j()},initialize:function(b,c){a=c,g()||(v.call(this,b),h(!0))},reset:function(){h(!1),f(!1)}}},MediaPlayer.dependencies.TimeSyncController.prototype={constructor:MediaPlayer.dependencies.TimeSyncController},MediaPlayer.dependencies.TimeSyncController.eventList={ENAME_TIME_SYNCHRONIZATION_COMPLETED:"timeSynchronizationComplete"},MediaPlayer.dependencies.TimeSyncController.TIME_SYNC_FAILED_ERROR_CODE=1,MediaPlayer.utils.VTTParser=function(){"use strict";var a=/(?:\r\n|\r|\n)/gm,b=/-->/,c=/(^[\s]+|[\s]+$)/g,d=/\s\b/g,e=function(a){var b=a.split(":"),c=b.length-1;return a=60*parseInt(b[c-1],10)+parseFloat(b[c]),2===c&&(a+=3600*parseInt(b[0],10)),a},f=function(a){var c=a.split(b),e=c[1].split(d);return e.shift(),c[1]=e[0],e.shift(),{cuePoints:c,styles:g(e)}},g=function(a){var b={};return a.forEach(function(a){if(a.split(/:/).length>1){var c=a.split(/:/)[1];c&&-1!=c.search(/%/)&&(c=parseInt(c.replace(/%/,""))),(a.match(/align/)||a.match(/A/))&&(b.align=c),(a.match(/line/)||a.match(/L/))&&(b.line=c),(a.match(/position/)||a.match(/P/))&&(b.position=c),(a.match(/size/)||a.match(/S/))&&(b.size=c)}}),b},h=function(a,c){for(var d,e=c,f="",g="";""!==a[e]&&e<a.length;)e++;if(d=e-c,d>1)for(var h=0;d>h;h++){if(g=a[c+h],g.match(b)){f="";break}f+=g,h!==d-1&&(f+="\n")}else g=a[c],g.match(b)||(f=g);return decodeURI(f)};return{log:void 0,parse:function(d){var g,i,j=[];d=d.split(a),g=d.length,i=-1;for(var k=0;g>k;k++){var l=d[k];if(l.length>0&&"WEBVTT"!==l&&l.match(b)){var m=f(l),n=m.cuePoints,o=m.styles,p=h(d,k+1),q=e(n[0].replace(c,"")),r=e(n[1].replace(c,""));!isNaN(q)&&!isNaN(r)&&q>=i&&r>q?""!==p?(i=q,j.push({start:q,end:r,data:p,styles:o})):this.log("Skipping cue due to empty/malformed cue text"):this.log("Skipping cue due to incorrect cue timing")}}return j}}},MediaPlayer.dependencies.XlinkLoader=function(){"use strict";var a=1,b=500,c="urn:mpeg:dash:resolve-to-zero:2013",d=function(a,c,e,f){var g,h,i,j,k=new XMLHttpRequest,l=this,m=!0,n=!0,o=new Date;h=function(){k.status<200||k.status>299||(n=!1,l.metricsModel.addHttpRequest("stream",null,MediaPlayer.vo.metrics.HTTPRequest.XLINK_EXPANSION_TYPE,a,k.responseURL||null,null,o,k.firstByteDate||null,new Date,k.status,null,k.getAllResponseHeaders()),j=k.responseText,c.resolved=!0,j?(c.resolvedContent=j,l.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:c,resolveObject:e})):(c.resolvedContent=null,l.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:c,resolveObject:e},new MediaPlayer.vo.Error(null,"Failed loading Xlink element: "+a,null))))},g=function(){n&&(n=!1,l.metricsModel.addHttpRequest("stream",null,MediaPlayer.vo.metrics.HTTPRequest.XLINK_EXPANSION_TYPE,a,k.responseURL||null,null,o,k.firstByteDate||null,new Date,k.status,null,k.getAllResponseHeaders()),f>0?(console.log("Failed loading xLink content: "+a+", retry in "+b+"ms attempts: "+f),f--,setTimeout(function(){d.call(l,a,c,e,f)},b)):(console.log("Failed loading Xlink content: "+a+" no retry attempts left"),l.errHandler.downloadError("xlink",a,k),c.resolved=!0,c.resolvedContent=null,l.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:c,resolveObject:e},new Error("Failed loading xlink Element: "+a+" no retry attempts left"))))},i=function(a){m&&(m=!1,(!a.lengthComputable||a.lengthComputable&&a.total!=a.loaded)&&(k.firstByteDate=new Date))};try{k.onload=h,k.onloadend=g,k.onerror=g,k.onprogress=i,k.open("GET",l.requestModifierExt.modifyRequestURL(a),!0),k.send()}catch(p){console.log("Error"),k.onerror()}};return{errHandler:void 0,metricsModel:void 0,requestModifierExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,load:function(b,e,f){b===c?(e.resolvedContent=null,e.resolved=!0,this.notify(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,{element:e,resolveObject:f})):d.call(this,b,e,f,a)}}},MediaPlayer.dependencies.XlinkLoader.prototype={constructor:MediaPlayer.dependencies.XlinkLoader},MediaPlayer.dependencies.XlinkLoader.eventList={ENAME_XLINKELEMENT_LOADED:"xlinkElementLoaded"},MediaPlayer.dependencies.AbrController=function(){"use strict";var a,b=!0,c={},d={},e={},f={},g={},h={},i={},j=function(a,b){var c;return d[b]=d[b]||{},d[b].hasOwnProperty(a)||(d[b][a]=0),c=d[b][a]},k=function(a,b,c){d[b]=d[b]||{},d[b][a]=c},l=function(a,b){var c;return e[b]=e[b]||{},e[b].hasOwnProperty(a)||(e[b][a]=0),c=e[b][a]},m=function(a,b,c){e[b]=e[b]||{},e[b][a]=c},n=function(a,b,d){c[b]=c[b]||{},c[b][a]=d},o=function(a){return f[a]},p=function(a,b){f[a]=b},q=function(a){return f.hasOwnProperty("max")&&f.max.hasOwnProperty(a)?f.max[a]:NaN},r=function(a,b){f.max=f.max||{},f.max[a]=b},s=function(a,b){var d;return c[b]=c[b]||{},c[b].hasOwnProperty(a)||(c[b][a]=0),d=t.call(this,c[b][a],a)},t=function(a,b){var c=q(b);if(isNaN(c))return a;var d=this.getQualityForBitrate(h[b].getMediaInfo(),c);return Math.min(a,d)},u=function(c){if(0===MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD&&b){var d=this,e=c.data.request.mediaType,f=d.abrRulesCollection.getRules(MediaPlayer.rules.ABRRulesCollection.prototype.ABANDON_FRAGMENT_RULES),g=h[e].getScheduleController(),i=g.getFragmentModel(),j=function(b){function c(b){a=setTimeout(function(){d.setAbandonmentStateFor(b,MediaPlayer.dependencies.AbrController.ALLOW_LOAD)},MediaPlayer.dependencies.AbrController.ABANDON_TIMEOUT)}if(b.confidence===MediaPlayer.rules.SwitchRequest.prototype.STRONG){var f=i.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING}),h=b.value,j=d.getQualityFor(e,d.streamController.getActiveStreamInfo());j>h&&(i.abortRequests(),d.setAbandonmentStateFor(e,MediaPlayer.dependencies.AbrController.ABANDON_LOAD),d.setPlaybackQuality(e,d.streamController.getActiveStreamInfo(),h),g.replaceCanceledRequests(f),c(e))}};d.rulesController.applyRules(f,h[e],j,c,function(a,b){return b})}};return{log:void 0,abrRulesCollection:void 0,rulesController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,streamController:void 0,setup:function(){this[MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_PROGRESS]=u},initialize:function(a,b){h[a]=b,i[a]=i[a]||{},i[a].state=MediaPlayer.dependencies.AbrController.ALLOW_LOAD},getAutoSwitchBitrate:function(){return b;
},setAutoSwitchBitrate:function(a){b=a},getPlaybackQuality:function(a){var c,d,e,f,g=this,h=a.getType(),n=a.getStreamInfo().id,o=function(b){var e=s.call(g,h,n);c=b.value,f=b.confidence,0>c&&(c=0),c>e&&(c=e),d=j(h,n),c===d||i[h].state===MediaPlayer.dependencies.AbrController.ABANDON_LOAD&&c>d||(k(h,n,c),m(h,n,f),g.notify(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,{mediaType:h,streamInfo:a.getStreamInfo(),oldQuality:d,newQuality:c}))};c=j(h,n),f=l(h,n),b&&(e=g.abrRulesCollection.getRules(MediaPlayer.rules.ABRRulesCollection.prototype.QUALITY_SWITCH_RULES),g.rulesController.applyRules(e,a,o.bind(g),c,function(a,b){return a=a===MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE?0:a,Math.max(a,b)}))},setPlaybackQuality:function(a,b,c){var d=b.id,e=j(a,d),f=null!==c&&!isNaN(c)&&c%1===0;if(!f)throw"argument is not an integer";c!==e&&c>=0&&c<=s.call(this,a,d)&&(k(a,b.id,c),this.notify(MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED,{mediaType:a,streamInfo:b,oldQuality:e,newQuality:c}))},setAbandonmentStateFor:function(a,b){i[a].state=b},getAbandonmentStateFor:function(a){return i[a].state},getQualityFor:function(a,b){return j(a,b.id)},getConfidenceFor:function(a,b){return l(a,b.id)},setInitialBitrateFor:function(a,b){p(a,b)},getInitialBitrateFor:function(a){return o(a)},setMaxAllowedBitrateFor:function(a,b){r(a,b)},getMaxAllowedBitrateFor:function(a){return q(a)},getQualityForBitrate:function(a,b){for(var c,d=this.getBitrateList(a),e=d.length,f=0;e>f;f+=1)if(c=d[f],1e3*b<=c.bitrate)return Math.max(f-1,0);return e-1},getBitrateList:function(a){if(!a||!a.bitrateList)return null;for(var b,c=a.bitrateList,d=a.type,e=[],f=0,g=c.length;g>f;f+=1)b=new MediaPlayer.vo.BitrateInfo,b.mediaType=d,b.qualityIndex=f,b.bitrate=c[f],e.push(b);return e},setAverageThroughput:function(a,b){g[a]=b},getAverageThroughput:function(a){return g[a]},updateTopQualityIndex:function(a){var b,c=a.type,d=a.streamInfo.id;return b=a.representationCount-1,n(c,d,b),b},isPlayingAtTopQuality:function(a){var b,c=this,d=a.id,e=c.getQualityFor("audio",a),f=c.getQualityFor("video",a);return b=e===s.call(this,"audio",d)&&f===s.call(this,"video",d)},getTopQualityIndexFor:s,reset:function(){b=!0,c={},d={},e={},h={},i={},g={},clearTimeout(a),a=null}}},MediaPlayer.dependencies.AbrController.prototype={constructor:MediaPlayer.dependencies.AbrController},MediaPlayer.dependencies.AbrController.eventList={ENAME_QUALITY_CHANGED:"qualityChanged"},MediaPlayer.dependencies.AbrController.DEFAULT_VIDEO_BITRATE=1e3,MediaPlayer.dependencies.AbrController.DEFAULT_AUDIO_BITRATE=100,MediaPlayer.dependencies.AbrController.ABANDON_LOAD="abandonload",MediaPlayer.dependencies.AbrController.ALLOW_LOAD="allowload",MediaPlayer.dependencies.AbrController.ABANDON_TIMEOUT=1e4,MediaPlayer.dependencies.AbrController.BANDWIDTH_SAFETY=.9,MediaPlayer.dependencies.BufferController=function(){"use strict";var a,b,c,d,e=.5,f=0,g=-1,h=!1,i=0,j=0,k=Number.POSITIVE_INFINITY,l=-1,m=-1,n=null,o=null,p=0,q=!1,r=!1,s=!1,t=function(c){if(!c||!a||!this.streamProcessor)return null;var d=null;try{d=this.sourceBufferExt.createSourceBuffer(a,c),d&&d.hasOwnProperty("initialize")&&d.initialize(b,this)}catch(e){this.errHandler.mediaSourceError("Error creating "+b+" source buffer.")}return this.setBuffer(d),P.call(this,this.streamProcessor.getRepresentationInfoForQuality(f).MSETimeOffset),d},u=function(){var a=this.streamProcessor.getStreamInfo().id,b=this.streamController.getActiveStreamInfo().id;return a===b},v=function(){var a=this.streamProcessor.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING}),c=T.call(this),d=this.virtualBuffer.getChunks({streamId:c,mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE,quality:g});return g>f&&(w(d,g)||w(a,g))?!1:g!==f},w=function(a,b){var c=0,d=a.length;for(c;d>c;c+=1)if(a[c].quality===b)return!0;return!1},x=function(a){var b,c=this;a.data.fragmentModel===c.streamProcessor.getFragmentModel()&&(c.log("Initialization finished loading"),b=a.data.chunk,this.virtualBuffer.append(b),b.quality===f&&v.call(c)&&ca.call(c))},y=function(a){if(a.data.fragmentModel===this.streamProcessor.getFragmentModel()){var b,c=a.data.chunk,d=c.bytes,e=c.quality,f=c.index,g=this.streamProcessor.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,quality:e,index:f})[0],h=this.streamProcessor.getRepresentationInfoForQuality(e),i=this.manifestModel.getValue(),j=this.adapter.getEventsFor(i,h.mediaInfo,this.streamProcessor),k=this.adapter.getEventsFor(i,h,this.streamProcessor);(j.length>0||k.length>0)&&(b=C.call(this,d,g,j,k),this.streamProcessor.getEventController().addInbandEvents(b)),c.bytes=D.call(this,d),this.virtualBuffer.append(c),R.call(this)}},z=function(a){r=!0,d=a;var b=this,c=a.quality,e=isNaN(a.index);return c!==f&&e||c!==g&&!e?(b.log("reject request - required quality = "+f+" current quality = "+g+" chunk media type = "+a.mediaType+" chunk quality = "+c+" chunk index = "+a.index),void V.call(b,c,a.index)):void b.sourceBufferExt.append(n,a)},A=function(b){if(n===b.data.buffer){this.isBufferingCompleted()&&this.streamProcessor.getStreamInfo().isLast&&this.mediaSourceExt.signalEndOfStream(a);var c,e=this;if(b.error)return b.error.code===MediaPlayer.dependencies.SourceBufferExtensions.QUOTA_EXCEEDED_ERROR_CODE&&(e.virtualBuffer.append(d),k=.8*e.sourceBufferExt.getTotalBufferedTime(n),e.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED,{criticalBufferLevel:k}),J.call(e,I.call(e))),void(r=!1);if(B.call(e),G.call(e)||(e.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED,{criticalBufferLevel:k}),J.call(e,I.call(e))),c=e.sourceBufferExt.getAllRanges(n),c&&c.length>0){var f,g;for(f=0,g=c.length;g>f;f+=1)e.log("Buffered Range: "+c.start(f)+" - "+c.end(f))}e.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED,{quality:d.quality,index:d.index,bufferedRanges:c}),U.call(e,d.quality,d.index)}},B=function(){var a=this,b=a.playbackController.getTime(),c=this.streamProcessor.getScheduleController().getFragmentToLoadCount(),d=this.streamProcessor.getCurrentRepresentationInfo().fragmentDuration;return i=a.sourceBufferExt.getBufferLength(n,b),j=c>0?c*d+i:j,S.call(this),a.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED,{bufferLevel:i}),E.call(a),M.call(a),!0},C=function(a,b,c,d){var e,f,g,h,i=[],j=Math.max(isNaN(b.startTime)?0:b.startTime,0),k=[];s=!1,h=c.concat(d);for(var l=0;l<h.length;l++)k[h[l].schemeIdUri]=h[l];g=this.boxParser.parse(a),e=g.getBoxes("emsg");for(var m=0,n=e.length;n>m;m+=1)f=this.adapter.getEvent(e[m],k,j),f&&i.push(f);return i},D=function(a){if(!s)return a;for(var b,c,d=a.length,e=0,f=0,g=Math.pow(256,2),h=Math.pow(256,3),i=new Uint8Array(a.length);d>e;){if(b=String.fromCharCode(a[e+4],a[e+5],a[e+6],a[e+7]),c=a[e]*h+a[e+1]*g+256*a[e+2]+1*a[e+3],"emsg"!=b)for(var j=e;e+c>j;j++)i[f]=a[j],f+=1;e+=c}return i.subarray(0,f)},E=function(){var a=F.call(this),b=2*c,d=i-a;d>=b&&!q?(q=!0,this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN)):b/2>d&&q&&(this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED),q=!1,R.call(this))},F=function(){var a=this.metricsModel.getReadOnlyMetricsFor("video"),b=this.metricsExt.getCurrentBufferLevel(a),c=this.metricsModel.getReadOnlyMetricsFor("audio"),d=this.metricsExt.getCurrentBufferLevel(c),e=null;return e=null===b||null===d?null!==d?d.level:null!==b?b.level:null:Math.min(d.level,b.level)},G=function(){var a=this,b=a.sourceBufferExt.getTotalBufferedTime(n);return k>b},H=function(){var b=0,c=this.playbackController.getTime(),d=this.sourceBufferExt.getBufferRange(n,c);null!==d&&(b=c-d.start-MediaPlayer.dependencies.BufferController.BUFFER_TO_KEEP,b>0&&this.sourceBufferExt.remove(n,0,Math.round(d.start+b),a))},I=function(){var a,b,c,d,e,f=this;return n?(a=f.playbackController.getTime(),e=f.streamProcessor.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,time:a})[0],c=e&&!isNaN(e.startTime)?e.startTime:Math.floor(a),d=f.sourceBufferExt.getBufferRange(n,a),null===d&&n.buffered.length>0&&(c=n.buffered.end(n.buffered.length-1)),b=n.buffered.start(0),{start:b,end:c}):null},J=function(b){if(b&&n){var c=this,d=b.start,e=b.end;c.sourceBufferExt.remove(n,d,e,a)}},K=function(a){n===a.data.buffer&&(this.virtualBuffer.updateBufferedRanges({streamId:T.call(this),mediaType:b},this.sourceBufferExt.getAllRanges(n)),B.call(this),this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED,{from:a.data.from,to:a.data.to,hasEnoughSpaceToAppend:G.call(this)}),G.call(this)||setTimeout(J.bind(this,I.call(this)),1e3*c))},L=function(){var a=l===m-1;a&&!h&&(h=!0,this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFERING_COMPLETED))},M=function(){e>i&&!h?O.call(this,!1):O.call(this,!0)},N=function(){return o?MediaPlayer.dependencies.BufferController.BUFFER_LOADED:MediaPlayer.dependencies.BufferController.BUFFER_EMPTY},O=function(a){if(!(o===a||"fragmentedText"===b&&this.textSourceBuffer.getAllTracksAreDisabled())){o=a;var c=N(),d=c===MediaPlayer.dependencies.BufferController.BUFFER_LOADED?MediaPlayer.events.BUFFER_LOADED:MediaPlayer.events.BUFFER_EMPTY;S.call(this),this.eventBus.dispatchEvent({type:d,data:{bufferType:b}}),this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED,{hasSufficientBuffer:a}),this.log(o?"Got enough buffer to start.":"Waiting for more buffer before starting playback.")}},P=function(a){n&&n.timestampOffset!==a&&!isNaN(a)&&(n.timestampOffset=a)},Q=function(){if(n){var a=this;B.call(a),R.call(a)}},R=function(){v.call(this)?ca.call(this):Z.call(this)},S=function(){if(u.call(this)){this.metricsModel.addBufferState(b,N(),j);var a,c=i;a=this.virtualBuffer.getTotalBufferLevel(this.streamProcessor.getMediaInfo()),a&&(c+=a),this.metricsModel.addBufferLevel(b,new Date,c)}},T=function(){return this.streamProcessor.getStreamInfo().id},U=function(a,b){r=!1,isNaN(b)?W.call(this,a):X.call(this,b),R.call(this)},V=function(a,b){r=!1,this.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED,{quality:a,index:b}),R.call(this)},W=function(a){g=a},X=function(a){this.virtualBuffer.storeAppendedChunk(d,n),Y.call(this),l=Math.max(a,l),L.call(this)},Y=function(){var a,c,d,e=this,f=this.virtualBuffer.getChunks({streamId:T.call(this),mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE,appended:!0}),g=new MediaPlayer.utils.CustomTimeRanges,h=new MediaPlayer.utils.CustomTimeRanges,i=this.playbackController.getTime(),j=2*this.streamProcessor.getCurrentRepresentationInfo().fragmentDuration;if(f.forEach(function(a){c=e.mediaController.isCurrentTrack(a.mediaInfo)?h:g,c.add(a.bufferedRange.start,a.bufferedRange.end)}),0!==g.length&&0!==h.length&&(a=this.sourceBufferExt.getBufferLength({buffered:h},i),!(j>a)))for(var k=0,l=g.length;l>k;k+=1)d={start:g.start(k),end:g.end(k)},(e.mediaController.getSwitchMode(b)===MediaPlayer.dependencies.MediaController.trackSwitchModes.ALWAYS_REPLACE||d.start>i)&&J.call(e,d)},Z=function(){var a,c=T.call(this);!n||q||r||v.call(this)||!G.call(this)||(a=this.virtualBuffer.extract({streamId:c,mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE,limit:1})[0],a&&z.call(this,a))},$=function(a){if(!a.error){var b,d=this;P.call(d,a.data.currentRepresentation.MSETimeOffset),b=d.streamProcessor.getStreamInfo().manifestInfo.minBufferTime,c!==b&&(d.setMinBufferTime(b),d.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_MIN_BUFFER_TIME_UPDATED,{minBufferTime:b}))}},_=function(a){var b=this;a.data.fragmentModel===b.streamProcessor.getFragmentModel()&&(m=a.data.request.index,L.call(b))},aa=function(a){if(b===a.data.mediaType&&this.streamProcessor.getStreamInfo().id===a.data.streamInfo.id){var c=this,d=a.data.newQuality;f!==d&&(P.call(c,c.streamProcessor.getRepresentationInfoForQuality(d).MSETimeOffset),f=d,v.call(c)&&ca.call(c))}},ba=function(){S.call(this)},ca=function(){var a=this,c=T.call(a),d={streamId:c,mediaType:b,segmentType:MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE,quality:f},e=a.virtualBuffer.getChunks(d)[0];if(e){if(r||!n)return;z.call(a,e)}else a.notify(MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED,{requiredQuality:f})},da=function(a){if(n){var c=this,d=a.data.newMediaInfo,e=d.type,f=a.data.switchMode,g=this.playbackController.getTime(),h={start:0,end:g};if(b===e)switch(f){case MediaPlayer.dependencies.MediaController.trackSwitchModes.ALWAYS_REPLACE:J.call(c,h);break;case MediaPlayer.dependencies.MediaController.trackSwitchModes.NEVER_REPLACE:break;default:this.log("track switch mode is not supported: "+f)}}},ea=function(){R.call(this),p+=1,p%MediaPlayer.dependencies.BufferController.BUFFER_PRUNING_INTERVAL===0&&H.call(this)},fa=function(){M.call(this)};return{sourceBufferExt:void 0,eventBus:void 0,bufferMax:void 0,manifestModel:void 0,errHandler:void 0,mediaSourceExt:void 0,metricsModel:void 0,metricsExt:void 0,streamController:void 0,playbackController:void 0,mediaController:void 0,adapter:void 0,log:void 0,abrController:void 0,boxParser:void 0,system:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,virtualBuffer:void 0,textSourceBuffer:void 0,setup:function(){this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=$,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED]=x,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED]=y,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=_,this[MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED]=aa,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS]=Q,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=Q,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED]=Q,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED]=fa,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED]=ea,this[MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED]=da,A=A.bind(this),K=K.bind(this),ba=ba.bind(this),this.sourceBufferExt.subscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,this,A),this.sourceBufferExt.subscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,this,K),this.virtualBuffer.subscribe(MediaPlayer.utils.VirtualBuffer.eventList.CHUNK_APPENDED,this,ba)},initialize:function(a,c,d){var e=this;b=a,e.setMediaType(b),e.setMediaSource(c),e.streamProcessor=d,e.fragmentController=d.fragmentController,e.scheduleController=d.scheduleController,f=e.abrController.getQualityFor(b,d.getStreamInfo())},createBuffer:t,getStreamProcessor:function(){return this.streamProcessor},setStreamProcessor:function(a){this.streamProcessor=a},getBuffer:function(){return n},setBuffer:function(a){n=a},getBufferLevel:function(){return i},getMinBufferTime:function(){return c},setMinBufferTime:function(a){c=a},getCriticalBufferLevel:function(){return k},setMediaSource:function(b){a=b},getMediaSource:function(){return a},isBufferingCompleted:function(){return h},reset:function(b){var e=this;k=Number.POSITIVE_INFINITY,o=null,c=null,g=-1,m=-1,l=-1,f=0,e.sourceBufferExt.unsubscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,e,A),e.sourceBufferExt.unsubscribe(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,e,K),d=null,this.virtualBuffer.unsubscribe(MediaPlayer.utils.VirtualBuffer.eventList.CHUNK_APPENDED,e,ba),q=!1,r=!1,b||(e.sourceBufferExt.abort(a,n),e.sourceBufferExt.removeSourceBuffer(a,n)),n=null}}},MediaPlayer.dependencies.BufferController.BUFFER_SIZE_REQUIRED="required",MediaPlayer.dependencies.BufferController.BUFFER_SIZE_MIN="min",MediaPlayer.dependencies.BufferController.BUFFER_SIZE_INFINITY="infinity",MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME=12,MediaPlayer.dependencies.BufferController.LOW_BUFFER_THRESHOLD=4,MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY=30,MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY_LONG_FORM=300,MediaPlayer.dependencies.BufferController.LONG_FORM_CONTENT_DURATION_THRESHOLD=600,MediaPlayer.dependencies.BufferController.RICH_BUFFER_THRESHOLD=20,MediaPlayer.dependencies.BufferController.BUFFER_LOADED="bufferLoaded",MediaPlayer.dependencies.BufferController.BUFFER_EMPTY="bufferStalled",MediaPlayer.dependencies.BufferController.BUFFER_TO_KEEP=30,MediaPlayer.dependencies.BufferController.BUFFER_PRUNING_INTERVAL=30,MediaPlayer.dependencies.BufferController.prototype={constructor:MediaPlayer.dependencies.BufferController},MediaPlayer.dependencies.BufferController.eventList={ENAME_BUFFER_LEVEL_STATE_CHANGED:"bufferLevelStateChanged",ENAME_BUFFER_LEVEL_UPDATED:"bufferLevelUpdated",ENAME_QUOTA_EXCEEDED:"quotaExceeded",ENAME_BYTES_APPENDED:"bytesAppended",ENAME_BYTES_REJECTED:"bytesRejected",ENAME_BUFFERING_COMPLETED:"bufferingCompleted",ENAME_BUFFER_CLEARED:"bufferCleared",ENAME_INIT_REQUESTED:"initRequested",ENAME_BUFFER_LEVEL_OUTRUN:"bufferLevelOutrun",ENAME_BUFFER_LEVEL_BALANCED:"bufferLevelBalanced",ENAME_MIN_BUFFER_TIME_UPDATED:"minBufferTimeUpdated"},MediaPlayer.dependencies.EventController=function(){"use strict";var a={},b={},c={},d=null,e=100,f=e/1e3,g="urn:mpeg:dash:event:2012",h=1,i=function(){j(),a=null,b=null,c=null},j=function(){null!==d&&(clearInterval(d),d=null)},k=function(){var a=this;a.log("Start Event Controller"),isNaN(e)||(d=setInterval(n.bind(this),e))},l=function(b){var c=this;if(a={},b)for(var d=0;d<b.length;d++){var e=b[d];a[e.id]=e,c.log("Add inline event with id "+e.id)}c.log("Added "+b.length+" inline events")},m=function(a){for(var c=this,d=0;d<a.length;d++){var e=a[d];e.id in b?c.log("Repeated event with id "+e.id):(b[e.id]=e,c.log("Add inband event with id "+e.id))}},n=function(){o.call(this,b),o.call(this,a),p.call(this)},o=function(a){var b,d=this,e=this.videoModel.getCurrentTime();if(a)for(var i=Object.keys(a),j=0;j<i.length;j++){var k=i[j],l=a[k];void 0!==l&&(b=l.presentationTime/l.eventStream.timescale,(0===b||e>=b&&b+f>e)&&(d.log("Start Event "+k+" at "+e),l.duration>0&&(c[k]=l),l.eventStream.schemeIdUri==g&&l.eventStream.value==h&&q.call(this),delete a[k]))}},p=function(){var a=this;if(c)for(var b=this.videoModel.getCurrentTime(),d=Object.keys(c),e=0;e<d.length;e++){var f=d[e],g=c[f];null!==g&&(g.duration+g.presentationTime)/g.eventStream.timescale<b&&(a.log("Remove Event "+f+" at time "+b),g=null,delete c[f])}},q=function(){var a=this.manifestModel.getValue(),b=a.url;a.hasOwnProperty("Location")&&(b=a.Location),this.log("Refresh manifest @ "+b),this.manifestUpdater.getManifestLoader().load(b)};return{manifestModel:void 0,manifestUpdater:void 0,log:void 0,system:void 0,videoModel:void 0,addInlineEvents:l,addInbandEvents:m,reset:i,clear:j,start:k}},MediaPlayer.dependencies.EventController.prototype={constructor:MediaPlayer.dependencies.EventController},MediaPlayer.dependencies.FragmentController=function(){"use strict";var a=[],b=!1,c=function(b){for(var c=a.length,d=0;c>d;d++)if(a[d].getContext()==b)return a[d];return null},d=function(b,c){var d=this,e=a[0].getContext().streamProcessor,f=e.getStreamInfo().id,g=d.scheduleRulesCollection.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_EXECUTE_RULES);-1!==g.indexOf(this.scheduleRulesCollection.sameTimeRequestRule)&&this.scheduleRulesCollection.sameTimeRequestRule.setFragmentModels(a,f),d.rulesController.applyRules(g,e,c,b,function(a,b){return b})},e=function(a,b,c){var d=new MediaPlayer.vo.DataChunk;return d.streamId=c,d.mediaInfo=b.mediaInfo,d.segmentType=b.type,d.start=b.startTime,d.duration=b.duration,d.end=d.start+d.duration,d.bytes=a,d.index=b.index,d.quality=b.quality,d},f=function(a){var b=this,c=a.data.request;b.isInitializationRequest(c)?b.notify(MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADING_START,{request:c,fragmentModel:a.sender}):b.notify(MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START,{request:c,fragmentModel:a.sender})},g=function(a){var b,c=this,d=a.data.request,f=a.data.response,g=a.sender.getContext().streamProcessor.getStreamInfo().id,h=this.isInitializationRequest(d),i=h?MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED:MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADED;return f?(b=e.call(this,f,d,g),c.notify(i,{chunk:b,fragmentModel:a.sender}),void k.call(this)):void c.log("No "+d.mediaType+" bytes to push.")},h=function(a){this.notify(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,{request:a.data.request,fragmentModel:a.sender})},i=function(){k.call(this)},j=function(c){var d,e,f,g,h,i=c.value;for(g=0;g<i.length;g+=1)if(e=i[g])for(h=0;h<a.length;h+=1)f=a[h],d=f.getContext().streamProcessor.getType(),e.mediaType===d&&(e instanceof MediaPlayer.vo.FragmentRequest||(e=f.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING,time:e.startTime})[0]),f.executeRequest(e));b=!1},k=function(a){b||(b=!0,d.call(this,a,j.bind(this)))};return{system:void 0,log:void 0,scheduleRulesCollection:void 0,rulesController:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED]=f,this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED]=g,this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED]=h,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED]=i,this.scheduleRulesCollection.sameTimeRequestRule&&this.subscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,this.scheduleRulesCollection.sameTimeRequestRule)},process:function(a){var b=null;return null!==a&&void 0!==a&&a.byteLength>0&&(b=new Uint8Array(a)),b},getModel:function(b){if(!b)return null;var d=c(b);return d||(d=this.system.getObject("fragmentModel"),d.setContext(b),a.push(d)),d},detachModel:function(b){var c=a.indexOf(b);c>-1&&a.splice(c,1)},isInitializationRequest:function(a){return a&&a.type&&a.type===MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE},prepareFragmentForLoading:function(a,b){a&&b&&a.addRequest(b)&&k.call(this,b)},executePendingRequests:function(){k.call(this)},reset:function(){a=[],this.scheduleRulesCollection.sameTimeRequestRule&&this.unsubscribe(MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED,this.scheduleRulesCollection.sameTimeRequestRule)}}},MediaPlayer.dependencies.FragmentController.prototype={constructor:MediaPlayer.dependencies.FragmentController},MediaPlayer.dependencies.FragmentController.eventList={ENAME_STREAM_COMPLETED:"streamCompleted",ENAME_INIT_FRAGMENT_LOADING_START:"initFragmentLoadingStart",ENAME_MEDIA_FRAGMENT_LOADING_START:"mediaFragmentLoadingStart",ENAME_INIT_FRAGMENT_LOADED:"initFragmentLoaded",ENAME_MEDIA_FRAGMENT_LOADED:"mediaFragmentLoaded"},MediaPlayer.dependencies.MediaController=function(){var a,b,c,d={},e=function(a,b){!this.DOMStorage.isSupported(MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL)||"video"!==a&&"audio"!==a||localStorage.setItem(MediaPlayer.utils.DOMStorage["LOCAL_STORAGE_"+a.toUpperCase()+"_SETTINGS_KEY"],JSON.stringify({settings:b,timestamp:(new Date).getTime()}))},f=function(a){var b={lang:a.lang,viewpoint:a.viewpoint,roles:a.roles,accessibility:a.accessibility,audioChannelConfiguration:a.audioChannelConfiguration},c=b.lang||b.viewpoint||b.role&&b.role.length>0||b.accessibility&&b.accessibility.length>0||b.audioChannelConfiguration&&b.audioChannelConfiguration.length>0;return c?b:null},g=function(a,b){var c=!a.lang||a.lang===b.lang,d=!a.viewpoint||a.viewpoint===b.viewpoint,e=!a.role||!!b.roles.filter(function(b){return b===a.role})[0],f=!a.accessibility||!!b.accessibility.filter(function(b){return b===a.accessibility})[0],g=!a.audioChannelConfiguration||!!b.audioChannelConfiguration.filter(function(b){return b===a.audioChannelConfiguration})[0];return c&&d&&e&&f&&g},h=function(){c={audio:MediaPlayer.dependencies.MediaController.trackSwitchModes.ALWAYS_REPLACE,video:MediaPlayer.dependencies.MediaController.trackSwitchModes.NEVER_REPLACE}},i=function(){a={audio:null,video:null}},j=function(a){var b=this.getSelectionModeForInitialTrack(),c=[],d=function(a){var b,c=0,d=[];return a.forEach(function(a){b=Math.max.apply(Math,a.bitrateList),b>c?(c=b,d=[a]):b===c&&d.push(a)}),d},e=function(a){var b,c=0,d=[];return a.forEach(function(a){b=a.representationCount,b>c?(c=b,d=[a]):b===c&&d.push(a)}),d};switch(b){case MediaPlayer.dependencies.MediaController.trackSelectionModes.HIGHEST_BITRATE:c=d(a),c.length>1&&(c=e(c));break;case MediaPlayer.dependencies.MediaController.trackSelectionModes.WIDEST_RANGE:c=e(a),c.length>1&&(c=d(a));break;default:this.log("track selection mode is not supported: "+b)}return c[0]},k=function(){return{audio:{list:[],storeLastSettings:!0,current:null},video:{list:[],storeLastSettings:!0,current:null},text:{list:[],storeLastSettings:!0,current:null},fragmentedText:{list:[],storeLastSettings:!0,current:null}}};return{log:void 0,system:void 0,errHandler:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,DOMStorage:void 0,setup:function(){i.call(this),h.call(this)},checkInitialMediaSettings:function(a){var b=this;["audio","video","text","fragmentedText"].forEach(function(c){var d=b.getInitialSettings(c),e=b.getTracksFor(c,a),f=!1;d||(d=b.DOMStorage.getSavedMediaSettings(c),b.setInitialSettings(c,d)),e&&0!==e.length&&(d&&e.forEach(function(a){!f&&g.call(b,d,a)&&(b.setTrack(a),f=!0)}),f||b.setTrack(j.call(b,e)))})},addTrack:function(a){var b=a?a.type:null,c=a?a.streamInfo.id:null,e=this.getInitialSettings(b);return a&&this.isMultiTrackSupportedByType(b)?(d[c]=d[c]||k.call(this),d[c][b].list.indexOf(a)>=0?!1:(d[c][b].list.push(a),e&&g.call(this,e,a)&&!this.getCurrentTrackFor(b,a.streamInfo)&&this.setTrack(a),!0)):!1},getTracksFor:function(a,b){if(!a||!b)return[];var c=b.id;return d[c]&&d[c][a]?d[c][a].list:[]},getCurrentTrackFor:function(a,b){return a&&b?d[b.id][a].current:null},isCurrentTrack:function(a){var b=a.type,c=a.streamInfo.id;return d[c]&&d[c][b]&&this.isTracksEqual(d[c][b].current,a)},setTrack:function(a){if(a){var b=a.type,g=a.streamInfo,h=g.id,i=this.getCurrentTrackFor(b,g);if(d[h]&&d[h][b]&&(!i||!this.isTracksEqual(a,i))){d[h][b].current=a,i&&this.notify(MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED,{oldMediaInfo:i,newMediaInfo:a,switchMode:c[b]});var j=f.call(this,a);j&&d[h][b].storeLastSettings&&(j.roles&&(j.role=j.roles[0],delete j.roles),j.accessibility&&(j.accessibility=j.accessibility[0]),j.audioChannelConfiguration&&(j.audioChannelConfiguration=j.audioChannelConfiguration[0]),e.call(this,b,j))}}},setInitialSettings:function(b,c){b&&c&&(a[b]=c)},getInitialSettings:function(b){return b?a[b]:null},setSwitchMode:function(a,b){var d=!!MediaPlayer.dependencies.MediaController.trackSwitchModes[b];return d?void(c[a]=b):void this.log("track switch mode is not supported: "+b)},getSwitchMode:function(a){return c[a]},setSelectionModeForInitialTrack:function(a){var c=!!MediaPlayer.dependencies.MediaController.trackSelectionModes[a];return c?void(b=a):void this.log("track selection mode is not supported: "+a)},getSelectionModeForInitialTrack:function(){return b||MediaPlayer.dependencies.MediaController.DEFAULT_INIT_TRACK_SELECTION_MODE},isMultiTrackSupportedByType:function(a){return"audio"===a||"video"===a||"text"===a||"fragmentedText"===a},isTracksEqual:function(a,b){var c=a.id===b.id,d=a.viewpoint===b.viewpoint,e=a.lang===b.lang,f=a.roles.toString()==b.roles.toString(),g=a.accessibility.toString()==b.accessibility.toString(),h=a.audioChannelConfiguration.toString()==b.audioChannelConfiguration.toString();return c&&d&&e&&f&&g&&h},reset:function(){h.call(this),d={},a={audio:null,video:null}}}},MediaPlayer.dependencies.MediaController.prototype={constructor:MediaPlayer.dependencies.MediaController},MediaPlayer.dependencies.MediaController.eventList={CURRENT_TRACK_CHANGED:"currenttrackchanged"},MediaPlayer.dependencies.MediaController.trackSwitchModes={NEVER_REPLACE:"NEVER_REPLACE",ALWAYS_REPLACE:"ALWAYS_REPLACE"},MediaPlayer.dependencies.MediaController.trackSelectionModes={HIGHEST_BITRATE:"HIGHEST_BITRATE",WIDEST_RANGE:"WIDEST_RANGE"},MediaPlayer.dependencies.MediaController.DEFAULT_INIT_TRACK_SELECTION_MODE=MediaPlayer.dependencies.MediaController.trackSelectionModes.HIGHEST_BITRATE,MediaPlayer.dependencies.PlaybackController=function(){"use strict";var a,b,c,d,e=1e3,f=0,g=NaN,h=null,i={},j={},k=NaN,l=function(a){var b,d=parseInt(this.uriQueryFragModel.getURIFragmentData().s);return c?(!isNaN(d)&&d>1262304e3&&(b=d-a.manifestInfo.availableFrom.getTime()/1e3,(b>g||b<g-a.manifestInfo.DVRWindowSize)&&(b=null)),b=b||g):b=!isNaN(d)&&d<a.duration&&d>=0?d:a.start,b},m=function(b){var c,d=this,e=d.metricsModel.getReadOnlyMetricsFor("video")||d.metricsModel.getReadOnlyMetricsFor("audio"),f=d.metricsExt.getCurrentDVRInfo(e),g=f?f.range:null;return g?b>=g.start&&b<=g.end?b:c=Math.max(g.end-2*a.manifestInfo.minBufferTime,g.start):NaN},n=function(){if(null===h){var a=this,b=function(){G.call(a)};h=setInterval(b,e)}},o=function(){clearInterval(h),h=null},p=function(){if(!j[a.id]&&!this.isSeeking()){var b=l.call(this,a);this.log("Starting playback at offset: "+b),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,{seekTime:b})}},q=function(){if(!this.isPaused()&&c&&0!==b.getElement().readyState){var a=this.getTime(),d=m.call(this,a),e=!isNaN(d)&&d!==a;e&&this.seek(d)}},r=function(b){if(!b.error){var c=this.adapter.convertDataToTrack(this.manifestModel.getValue(),b.data.currentRepresentation),d=c.mediaInfo.streamInfo;a.id===d.id&&(a=c.mediaInfo.streamInfo,q.call(this))}},s=function(a){a.error||0===b.getElement().readyState||p.call(this)},t=function(){b&&(b.unlisten("canplay",u),b.unlisten("play",v),b.unlisten("playing",w),b.unlisten("pause",x),b.unlisten("error",F),b.unlisten("seeking",y),b.unlisten("seeked",z),b.unlisten("timeupdate",A),b.unlisten("progress",B),b.unlisten("ratechange",C),b.unlisten("loadedmetadata",D),b.unlisten("ended",E))},u=function(){this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY)},v=function(){this.log("<video> play"),q.call(this),n.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,{startTime:this.getTime()})},w=function(){this.log("<video> playing"),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PLAYING,{playingTime:this.getTime()})},x=function(){this.log("<video> pause"),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED)},y=function(){this.log("<video> seek"),n.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING,{seekTime:this.getTime()})},z=function(){this.log("<video> seeked"),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKED)},A=function(){var a=this.getTime();a!==f&&(f=a,this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED,{timeToEnd:this.getTimeToStreamEnd()}))},B=function(){var c,d,e,f=b.getElement().buffered;f.length&&(c=f.length-1,d=f.end(c),e=l.call(this,a)+a.duration-d),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PROGRESS,{bufferedRanges:b.getElement().buffered,
remainingUnbufferedDuration:e})},C=function(){this.log("<video> ratechange: ",this.getPlaybackRate()),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED)},D=function(){this.log("<video> loadedmetadata"),(!c||this.timelineConverter.isTimeSyncCompleted())&&p.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_METADATA_LOADED),n.call(this)},E=function(){this.log("<video> ended"),o.call(this),this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED)},F=function(a){var b=a.target||a.srcElement;this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR,{error:b.error})},G=function(){this.notify(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED,{isDynamic:c,time:new Date})},H=function(b){var c,d=b.data.bufferedRanges,e=a.id,f=this.getTime(),g=b.sender.streamProcessor,h=g.getType(),k=this.system.getObject("streamController").getStreamById(a.id),m=l.call(this,a),n=this.adapter.getFragmentRequestForTime(g,g.getCurrentRepresentationInfo(),m,{ignoreIsFinished:!0}),o=n?n.index:null,p=i[e];b.data.index===o&&(j[e]=j[e]||{},j[e][h]=!0,j[e].ready=!(k.hasMedia("audio")&&!j[e].audio||k.hasMedia("video")&&!j[e].video)),!d||!d.length||j[e]&&j[e].seekCompleted||(c=Math.max(d.start(0),a.start),i[e]=void 0===i[e]?c:Math.max(i[e],c),p===i[e]&&f===p||!j[e]||!j[e].ready||f>i[e]||(this.isSeeking()?i={}:(this.seek(i[e]),j[e].seekCompleted=!0)))},I=function(c){var d=c.sender.streamProcessor.getType(),e=c.sender.streamProcessor.getStreamInfo();e.id===a.id&&b.setStallState(d,!c.data.hasSufficientBuffer)},J=function(){b.listen("canplay",u),b.listen("play",v),b.listen("playing",w),b.listen("pause",x),b.listen("error",F),b.listen("seeking",y),b.listen("seeked",z),b.listen("timeupdate",A),b.listen("progress",B),b.listen("ratechange",C),b.listen("loadedmetadata",D),b.listen("ended",E)};return{system:void 0,log:void 0,timelineConverter:void 0,uriQueryFragModel:void 0,metricsModel:void 0,metricsExt:void 0,manifestModel:void 0,manifestExt:void 0,videoModel:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,adapter:void 0,setup:function(){this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=r,this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=s,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED]=H,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED]=I,u=u.bind(this),v=v.bind(this),w=w.bind(this),x=x.bind(this),F=F.bind(this),y=y.bind(this),z=z.bind(this),A=A.bind(this),B=B.bind(this),C=C.bind(this),D=D.bind(this),E=E.bind(this)},initialize:function(d){b=this.videoModel,a=d,i={},t.call(this),J.call(this),c=a.manifestInfo.isDynamic,g=d.start},getStreamStartTime:l,getTimeToStreamEnd:function(){var c=b.getCurrentTime();return l.call(this,a)+a.duration-c},getStreamId:function(){return a.id},getStreamDuration:function(){return a.duration},getTime:function(){return b.getCurrentTime()},getPlaybackRate:function(){return b.getPlaybackRate()},getPlayedRanges:function(){return b.getElement().played},getIsDynamic:function(){return c},setLiveStartTime:function(a){g=a},getLiveStartTime:function(){return g},setLiveDelayAttributes:function(a,b){k=a,d=b},getLiveDelay:function(b){var c,e=this.manifestExt.getMpd(this.manifestModel.getValue());return c=d&&e.hasOwnProperty("suggestedPresentationDelay")?e.suggestedPresentationDelay:isNaN(b)?2*a.manifestInfo.minBufferTime:b*k},start:function(){b.play()},isPaused:function(){return b.isPaused()},pause:function(){b&&b.pause()},isSeeking:function(){return b.getElement().seeking},seek:function(a){b&&a!==this.getTime()&&(this.log("Do seek: "+a),b.setCurrentTime(a))},reset:function(){o.call(this),t.call(this),b=null,a=null,f=0,g=NaN,i={},j={},c=void 0,d=void 0,k=NaN}}},MediaPlayer.dependencies.PlaybackController.prototype={constructor:MediaPlayer.dependencies.PlaybackController},MediaPlayer.dependencies.PlaybackController.eventList={ENAME_CAN_PLAY:"canPlay",ENAME_PLAYBACK_STARTED:"playbackStarted",ENAME_PLAYBACK_PLAYING:"playbackPlaying",ENAME_PLAYBACK_STOPPED:"playbackStopped",ENAME_PLAYBACK_PAUSED:"playbackPaused",ENAME_PLAYBACK_ENDED:"playbackEnded",ENAME_PLAYBACK_SEEKING:"playbackSeeking",ENAME_PLAYBACK_SEEKED:"playbackSeeked",ENAME_PLAYBACK_TIME_UPDATED:"playbackTimeUpdated",ENAME_PLAYBACK_PROGRESS:"playbackProgress",ENAME_PLAYBACK_RATE_CHANGED:"playbackRateChanged",ENAME_PLAYBACK_METADATA_LOADED:"playbackMetaDataLoaded",ENAME_PLAYBACK_ERROR:"playbackError",ENAME_WALLCLOCK_TIME_UPDATED:"wallclockTimeUpdated"},MediaPlayer.dependencies.ProtectionController=function(){"use strict";var a,b,c,d=null,e=[],f=!1,g=function(a){var b=null,d=a.systemString;return c&&(b=d in c?c[d]:null),b},h=function(c,d){var f=this,g=[],h=[];b&&h.push(new MediaPlayer.vo.protection.MediaCapability(b.codec)),a&&g.push(new MediaPlayer.vo.protection.MediaCapability(a.codec));var i,j=new MediaPlayer.vo.protection.KeySystemConfiguration(g,h,"optional","temporary"===f.sessionType?"optional":"required",[f.sessionType]),k=[];if(this.keySystem){for(i=0;i<c.length;i++)if(this.keySystem===c[i].ks){k.push({ks:c[i].ks,configs:[j]});var l={};l[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE]=function(a){a.error?d||f.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,error:"DRM: KeySystem Access Denied! -- "+a.error}):(f.log("KeySystem Access Granted"),f.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,data:a.data}),f.createKeySession(c[i].initData))},this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,l,void 0,!0),this.protectionModel.requestKeySystemAccess(k);break}}else if(void 0===this.keySystem){this.keySystem=null,e.push(c);for(var m=0;m<c.length;m++)k.push({ks:c[m].ks,configs:[j]});var n,o={};o[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE]=function(a){a.error?(f.keySystem=void 0,f.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,o),d||f.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,error:"DRM: KeySystem Access Denied! -- "+a.error})):(n=a.data,f.log("KeySystem Access Granted ("+n.keySystem.systemString+")!  Selecting key system..."),f.protectionModel.selectKeySystem(n))},o[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED]=function(a){if(a.error)f.keySystem=void 0,d||f.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,error:"DRM: Error selecting key system! -- "+a.error});else{f.keySystem=f.protectionModel.keySystem,f.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SYSTEM_SELECTED,data:n});for(var b=0;b<e.length;b++)for(i=0;i<e[b].length;i++)if(f.keySystem===e[b][i].ks){f.createKeySession(e[b][i].initData);break}}},this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,o,void 0,!0),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,o,void 0,!0),this.protectionModel.requestKeySystemAccess(k)}else e.push(c)},i=function(a,b){this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.LICENSE_REQUEST_COMPLETE,data:a,error:b})},j=function(a){if(a.error)return void this.log(a.error);var b=a.data;this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_MESSAGE,data:b});var c=b.messageType?b.messageType:"license-request",d=b.message,e=b.sessionToken,f=g(this.keySystem),h=this.keySystem.systemString,j=this.protectionExt.getLicenseServer(this.keySystem,f,c),k=i.bind(this),l={sessionToken:e,messageType:c};if(!j)return this.log("DRM: License server request not required for this message (type = "+a.data.messageType+").  Session ID = "+e.getSessionID()),void k(l);if(this.protectionExt.isClearKey(this.keySystem)){var m=this.protectionExt.processClearKeyLicenseRequest(f,d);if(m)return this.log("DRM: ClearKey license request handled by application!"),k(l),void this.protectionModel.updateKeySession(e,m)}var n=new XMLHttpRequest,o=this,p=null;if(f)if(f.serverURL){var q=f.serverURL;"string"==typeof q&&""!==q?p=q:"object"==typeof q&&q.hasOwnProperty(c)&&(p=q[c])}else f.laURL&&""!==f.laURL&&(p=f.laURL);else p=this.keySystem.getLicenseServerURLFromInitData(MediaPlayer.dependencies.protection.CommonEncryption.getPSSHData(e.initData)),p||(p=a.data.laURL);if(p=j.getServerURLFromMessage(p,d,c),!p)return void k(l,"DRM: No license server URL specified!");n.open(j.getHTTPMethod(c),p,!0),n.responseType=j.getResponseType(h,c),n.onload=function(){200==this.status?(k(l),o.protectionModel.updateKeySession(e,j.getLicenseMessage(this.response,h,c))):k(l,"DRM: "+h+' update, XHR status is "'+this.statusText+'" ('+this.status+"), expected to be 200. readyState is "+this.readyState+".  Response is "+(this.response?j.getErrorResponse(this.response,h,c):"NONE"))},n.onabort=function(){k(l,"DRM: "+h+' update, XHR aborted. status is "'+this.statusText+'" ('+this.status+"), readyState is "+this.readyState)},n.onerror=function(){k(l,"DRM: "+h+' update, XHR error. status is "'+this.statusText+'" ('+this.status+"), readyState is "+this.readyState)};var r=function(a){var b;if(a)for(b in a)"authorization"===b.toLowerCase()&&(n.withCredentials=!0),n.setRequestHeader(b,a[b])};f&&r(f.httpRequestHeaders),r(this.keySystem.getRequestHeadersFromMessage(d)),f&&f.withCredentials&&(n.withCredentials=!0),n.send(this.keySystem.getLicenseRequestFromMessage(d))},k=function(a){if("cenc"!==a.data.initDataType)return void this.log("DRM:  Only 'cenc' initData is supported!  Ignoring initData of type: "+a.data.initDataType);var b=a.data.initData;ArrayBuffer.isView(b)&&(b=b.buffer);var c=this.protectionExt.getSupportedKeySystems(b);return 0===c.length?void this.log("Received needkey event with initData, but we don't support any of the key systems!"):void h.call(this,c,!1)},l=function(a){a.error?this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.SERVER_CERTIFICATE_UPDATED,data:null,error:"DRM: Failed to update license server certificate. -- "+a.error}):(this.log("DRM: License server certificate successfully updated."),this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.SERVER_CERTIFICATE_UPDATED,data:null,error:null}))},m=function(a){a.error?this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CREATED,data:null,error:"DRM: Failed to create key session. -- "+a.error}):(this.log("DRM: Session created.  SessionID = "+a.data.getSessionID()),this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CREATED,data:a.data,error:null}))},n=function(){this.log("DRM: Key added."),this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_ADDED,data:null,error:null})},o=function(a){this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_ADDED,data:null,error:"DRM: MediaKeyError - sessionId: "+a.data.sessionToken.getSessionID()+".  "+a.data.error})},p=function(a){a.error?this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CLOSED,data:null,error:"DRM Failed to close key session. -- "+a.error}):(this.log("DRM: Session closed.  SessionID = "+a.data),this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CLOSED,data:a.data,error:null}))},q=function(a){a.error?this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_REMOVED,data:null,error:"DRM Failed to remove key session. -- "+a.error}):(this.log("DRM: Session removed.  SessionID = "+a.data),this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_REMOVED,data:a.data,error:null}))},r=function(a){this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_STATUSES_CHANGED,data:a.data,error:null})};return{system:void 0,log:void 0,protectionExt:void 0,keySystem:void 0,sessionType:"temporary",setup:function(){this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE]=j.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY]=k.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED]=l.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED]=n.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR]=o.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED]=m.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED]=p.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED]=q.bind(this),this[MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_STATUSES_CHANGED]=r.bind(this),d=this.protectionExt.getKeySystems(),this.protectionModel=this.system.getObject("protectionModel"),this.protectionModel.init(),this.eventBus=this.system.getObject("eventBusCl"),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,this),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_STATUSES_CHANGED,this)},init:function(c,d,e){if(!f){var g,i;d||e||(g=this.system.getObject("adapter"),i=g.getStreamsInfo(c)[0]),a=d||(i?g.getMediaInfoForType(c,i,"audio"):null),b=e||(i?g.getMediaInfoForType(c,i,"video"):null);var j=b?b:a,k=this.protectionExt.getSupportedKeySystemsFromContentProtection(j.contentProtection);k&&k.length>0&&h.call(this,k,!0),f=!0}},addEventListener:function(a,b){this.eventBus.addEventListener(a,b)},removeEventListener:function(a,b){this.eventBus.removeEventListener(a,b)},teardown:function(){this.setMediaElement(null),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,this),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_STATUSES_CHANGED,this),this.keySystem=void 0,this.protectionModel.teardown(),this.protectionModel=void 0},createKeySession:function(a){var b=MediaPlayer.dependencies.protection.CommonEncryption.getPSSHForKeySystem(this.keySystem,a);if(b){for(var c=this.protectionModel.getAllInitData(),d=0;d<c.length;d++)if(this.protectionExt.initDataEquals(b,c[d]))return void this.log("Ignoring initData because we have already seen it!");try{this.protectionModel.createKeySession(b,this.sessionType)}catch(e){this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CREATED,data:null,error:"Error creating key session! "+e.message})}}else this.eventBus.dispatchEvent({type:MediaPlayer.dependencies.ProtectionController.events.KEY_SESSION_CREATED,data:null,error:"Selected key system is "+this.keySystem.systemString+".  needkey/encrypted event contains no initData corresponding to that key system!"})},loadKeySession:function(a){this.protectionModel.loadKeySession(a)},removeKeySession:function(a){this.protectionModel.removeKeySession(a)},closeKeySession:function(a){this.protectionModel.closeKeySession(a)},setServerCertificate:function(a){this.protectionModel.setServerCertificate(a)},setMediaElement:function(a){a?(this.protectionModel.setMediaElement(a),this.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,this)):null===a&&(this.protectionModel.setMediaElement(a),this.protectionModel.unsubscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,this))},setSessionType:function(a){this.sessionType=a},setProtectionData:function(a){c=a}}},MediaPlayer.dependencies.ProtectionController.events={KEY_SYSTEM_SELECTED:"keySystemSelected",SERVER_CERTIFICATE_UPDATED:"serverCertificateUpdated",KEY_ADDED:"keyAdded",KEY_SESSION_CREATED:"keySessionCreated",KEY_SESSION_REMOVED:"keySessionRemoved",KEY_SESSION_CLOSED:"keySessionClosed",KEY_STATUSES_CHANGED:"keyStatusesChanged",KEY_MESSAGE:"keyMessage",LICENSE_REQUEST_COMPLETE:"licenseRequestComplete"},MediaPlayer.dependencies.ProtectionController.prototype={constructor:MediaPlayer.dependencies.ProtectionController},MediaPlayer.dependencies.ScheduleController=function(){"use strict";var a,b,c,d,e,f=0,g=!0,h=null,i=!1,j=null,k=null,l=!0,m=function(a,b){var c=0,d=null;l===!1&&(d=k.start,c=a.getTime()-d.getTime(),k.duration=c,k.stopreason=b,l=!0)},n=function(){b&&(i=!1,g&&(g=!1),this.log("start"),w.call(this))},o=function(){g&&(r.call(this,e.quality),K.call(this,MediaPlayer.vo.metrics.PlayList.INITIAL_PLAY_START_REASON)),n.call(this)},p=function(a){i||(i=!0,this.log("stop"),a&&c.cancelPendingRequests(),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.USER_REQUEST_STOP_REASON))},q=function(a){var b=this,c=b.scheduleRulesCollection.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.NEXT_FRAGMENT_RULES);b.rulesController.applyRules(c,b.streamProcessor,a,null,function(a,b){return b})},r=function(a){var b,d=this;return b=d.adapter.getInitRequest(d.streamProcessor,a),null!==b&&d.fragmentController.prepareFragmentForLoading(c,b),b},s=function(a){var b=this,c=b.scheduleRulesCollection.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_SCHEDULE_RULES);b.rulesController.applyRules(c,b.streamProcessor,a,f,function(a,b){return a=a===MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE?0:a,Math.max(a,b)})},t=function(a){var b,d,f,g=a.length,h=.1;for(f=0;g>f;f+=1)b=a[f],d=b.startTime+b.duration/2+h,b=this.adapter.getFragmentRequestForTime(this.streamProcessor,e,d,{timeThreshold:0,ignoreIsFinished:!0}),this.fragmentController.prepareFragmentForLoading(c,b)},u=function(a){var b=this;return f=a.value,0>=f?void b.fragmentController.executePendingRequests():void q.call(b,v.bind(b))},v=function(a){var b=a.value;null===b||b instanceof MediaPlayer.vo.FragmentRequest||(b=this.adapter.getFragmentRequestForTime(this.streamProcessor,e,b.startTime)),b?(f--,this.fragmentController.prepareFragmentForLoading(c,b)):this.fragmentController.executePendingRequests()},w=function(){var a=(new Date).getTime(),b=h?a-h>c.getLoadingTime():!0;this.abrController.getPlaybackQuality(this.streamProcessor),!b||i||this.playbackController.isPaused()&&this.playbackController.getPlayedRanges().length>0&&(!this.scheduleWhilePaused||d)||(h=a,s.call(this,u.bind(this)))},x=function(a){a.error||(e=this.adapter.convertDataToTrack(this.manifestModel.getValue(),a.data.currentRepresentation))},y=function(a){a.error||(e=this.streamProcessor.getCurrentRepresentationInfo(),d&&null===this.liveEdgeFinder.getLiveEdge()||(b=!0),b&&o.call(this))},z=function(a){a.data.fragmentModel===this.streamProcessor.getFragmentModel()&&(this.log("Stream is complete"),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.END_OF_CONTENT_STOP_REASON))},A=function(a){var b=this;a.data.fragmentModel===b.streamProcessor.getFragmentModel()&&w.call(b)},B=function(a){a.error&&p.call(this)},C=function(){L.call(this)},D=function(){p.call(this,!1)},E=function(a){r.call(this,a.data.requiredQuality)},F=function(a){c.removeExecutedRequestsBeforeTime(a.data.to),a.data.hasEnoughSpaceToAppend&&n.call(this)},G=function(a){var b=this;a.data.hasSufficientBuffer||b.playbackController.isSeeking()||(b.log("Stalling Buffer"),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.REBUFFERING_REASON))},H=function(){w.call(this)},I=function(){p.call(this,!1)},J=function(b){if(a===b.data.mediaType&&this.streamProcessor.getStreamInfo().id===b.data.streamInfo.id){var d,f=this;if(d=c.cancelPendingRequests(b.data.oldQuality),e=f.streamProcessor.getRepresentationInfoForQuality(b.data.newQuality),null===e||void 0===e)throw"Unexpected error!";t.call(f,d),m(new Date,MediaPlayer.vo.metrics.PlayList.Trace.REPRESENTATION_SWITCH_STOP_REASON)}},K=function(b){var c=new Date,d=this.playbackController.getTime();m(c,MediaPlayer.vo.metrics.PlayList.Trace.USER_REQUEST_STOP_REASON),j=this.metricsModel.addPlayList(a,c,d,b)},L=function(){var a=this,b=a.playbackController.getTime(),c=a.playbackController.getPlaybackRate(),d=new Date;l===!0&&e&&j&&(l=!1,k=a.metricsModel.appendPlayListTrace(j,e.id,null,d,b,null,c,null))},M=function(a){var b=this,d=r.call(b,a.data.CCIndex);c.executeRequest(d)},N=function(){n.call(this)},O=function(a){g||c.cancelPendingRequests();var b=this.metricsModel.getMetricsFor("stream"),d=this.metricsExt.getCurrentManifestUpdate(b);this.log("seek: "+a.data.seekTime),K.call(this,MediaPlayer.vo.metrics.PlayList.SEEK_START_REASON),this.metricsModel.updateManifestUpdateInfo(d,{latency:e.DVRWindow.end-this.playbackController.getTime()})},P=function(){L.call(this)},Q=function(){w.call(this)},R=function(a){if(!a.error){var c,d,f=this,g=a.data.liveEdge,h=e.mediaInfo.streamInfo.manifestInfo,i=g-Math.min(f.playbackController.getLiveDelay(e.fragmentDuration),h.DVRWindowSize/2),j=f.metricsModel.getMetricsFor("stream"),k=f.metricsExt.getCurrentManifestUpdate(j),l=f.playbackController.getLiveStartTime();c=f.adapter.getFragmentRequestForTime(f.streamProcessor,e,i,{ignoreIsFinished:!0}),d=c.startTime,(isNaN(l)||d>l)&&f.playbackController.setLiveStartTime(d),f.metricsModel.updateManifestUpdateInfo(k,{currentTime:d,presentationStartTime:g,latency:g-d,clientTimeOffset:f.timelineConverter.getClientTimeOffset()}),b=!0}};return{log:void 0,system:void 0,metricsModel:void 0,manifestModel:void 0,metricsExt:void 0,scheduleWhilePaused:void 0,timelineConverter:void 0,abrController:void 0,playbackController:void 0,adapter:void 0,scheduleRulesCollection:void 0,rulesController:void 0,numOfParallelRequestAllowed:void 0,setup:function(){this[MediaPlayer.dependencies.LiveEdgeFinder.eventList.ENAME_LIVE_EDGE_SEARCH_COMPLETED]=R,this[MediaPlayer.dependencies.AbrController.eventList.ENAME_QUALITY_CHANGED]=J,this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_STARTED]=D,this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=x,this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED]=y,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_MEDIA_FRAGMENT_LOADING_START]=A,this[MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED]=B,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=z,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_CLEARED]=F,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_APPENDED]=C,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_STATE_CHANGED]=G,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_UPDATED]=H,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_INIT_REQUESTED]=E,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_QUOTA_EXCEEDED]=I,this[MediaPlayer.dependencies.TextController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED]=M,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED]=N,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=O,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_RATE_CHANGED]=P,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_WALLCLOCK_TIME_UPDATED]=Q},initialize:function(b,e){var f=this;a=b,f.setMediaType(a),f.streamProcessor=e,f.fragmentController=e.fragmentController,f.liveEdgeFinder=e.liveEdgeFinder,f.bufferController=e.bufferController,d=e.isDynamic(),c=this.fragmentController.getModel(this),MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD=f.numOfParallelRequestAllowed,f.scheduleRulesCollection.bufferLevelRule&&f.scheduleRulesCollection.bufferLevelRule.setScheduleController(f),f.scheduleRulesCollection.pendingRequestsRule&&f.scheduleRulesCollection.pendingRequestsRule.setScheduleController(f),f.scheduleRulesCollection.playbackTimeRule&&f.scheduleRulesCollection.playbackTimeRule.setScheduleController(f)},getFragmentModel:function(){return c},getFragmentToLoadCount:function(){return f},replaceCanceledRequests:t,reset:function(){var a=this;p.call(a,!0),a.bufferController.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN,a.scheduleRulesCollection.bufferLevelRule),a.bufferController.unsubscribe(MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED,a.scheduleRulesCollection.bufferLevelRule),c.abortRequests(),a.fragmentController.detachModel(c),f=0},start:n,stop:p}},MediaPlayer.dependencies.ScheduleController.prototype={constructor:MediaPlayer.dependencies.ScheduleController},MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD=0,MediaPlayer.dependencies.StreamController=function(){"use strict";var a,b,c,d,e,f,g=[],h=!1,i=.2,j=!0,k=!1,l=!1,m=!1,n=!1,o=function(a){var b=this.system.getObject("mediaController");b.subscribe(MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED,a),a.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,this.liveEdgeFinder),a.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED,this)},p=function(a){a.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,this.liveEdgeFinder),a.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED,this)},q=function(a,b,c){this.eventBus.dispatchEvent({type:a,data:{fromStreamInfo:b?b.getStreamInfo():null,toStreamInfo:c.getStreamInfo()}})},r=function(){a.isActivated()&&k&&0===a.getStreamInfo().index&&(a.startEventController(),j&&this.playbackController.start())},s=function(){k=!0,r.call(this)},t=function(a){var b=a.data.error?a.data.error.code:0,c="";if(-1!==b){switch(b){case 1:c="MEDIA_ERR_ABORTED";break;case 2:c="MEDIA_ERR_NETWORK";break;case 3:c="MEDIA_ERR_DECODE";break;case 4:c="MEDIA_ERR_SRC_NOT_SUPPORTED";break;case 5:c="MEDIA_ERR_ENCRYPTED";break;default:c="UNKNOWN"}n=!0,this.log("Video Element Error: "+c),a.error&&this.log(a.error),this.errHandler.mediaSourceError(c),this.reset()}},u=function(a){var b=this,c=b.videoExt.getPlaybackQuality(b.videoModel.getElement());c&&b.metricsModel.addDroppedFrames("video",c),b.playbackController.isSeeking()||a.data.timeToEnd<i&&this.mediaSourceExt.signalEndOfStream(d)},v=function(){A.call(this,a,y())},w=function(b){var c=z(b.data.seekTime);c&&c!==a&&A.call(this,a,c,b.data.seekTime)},x=function(a){var b=y(),c=a.data.streamInfo.isLast;d&&c&&this.mediaSourceExt.signalEndOfStream(d),b&&b.activate(d)},y=function(){var b=a.getStreamInfo().start,c=a.getStreamInfo().duration;return g.filter(function(a){return a.getStreamInfo().start===b+c})[0]},z=function(a){var b=0,c=null,d=g.length;d>0&&(b+=g[0].getStartTime());for(var e=0;d>e;e++)if(c=g[e],b+=c.getDuration(),b>a)return c;return null},A=function(b,c,d){if(!l&&b&&c&&b!==c){q.call(this,MediaPlayer.events.STREAM_SWITCH_STARTED,b,c),l=!0;var e=this,f=function(){void 0!==d&&e.playbackController.seek(d),e.playbackController.start(),a.startEventController(),l=!1,q.call(e,MediaPlayer.events.STREAM_SWITCH_COMPLETED,b,c)};setTimeout(function(){p.call(e,b),b.deactivate(),a=c,o.call(e,c),e.playbackController.initialize(a.getStreamInfo()),B.call(e,f)},0)}},B=function(b){var c,e=this,f=function(g){e.log("MediaSource is open!"),e.log(g),window.URL.revokeObjectURL(c),d.removeEventListener("sourceopen",f),d.removeEventListener("webkitsourceopen",f),C.call(e),a.activate(d),b&&b()};d?e.mediaSourceExt.detachMediaSource(e.videoModel):d=e.mediaSourceExt.createMediaSource(),d.addEventListener("sourceopen",f,!1),d.addEventListener("webkitsourceopen",f,!1),c=e.mediaSourceExt.attachMediaSource(d,e.videoModel)},C=function(){var b,c,e=this;b=a.getStreamInfo().manifestInfo.duration,c=e.mediaSourceExt.setDuration(d,b),e.log("Duration successfully set to: "+c)},D=function(){var e,f,i,j,k,l,n,p=this,r=p.manifestModel.getValue(),s=p.metricsModel.getMetricsFor("stream"),t=p.metricsExt.getCurrentManifestUpdate(s),u=[];if(r){l=p.adapter.getStreamsInfo(r),this.capabilities.supportsEncryptedMedia()&&(b||(b=this.system.getObject("protectionController"),this.eventBus.dispatchEvent({type:MediaPlayer.events.PROTECTION_CREATED,data:{controller:b,manifest:r}}),h=!0),b.setMediaElement(this.videoModel.getElement()),c&&b.setProtectionData(c));try{if(0===l.length)throw new Error("There are no streams");for(p.metricsModel.updateManifestUpdateInfo(t,{currentTime:p.videoModel.getCurrentTime(),buffered:p.videoModel.getElement().buffered,presentationStartTime:l[0].start,clientTimeOffset:p.timelineConverter.getClientTimeOffset()}),m=!0,j=0,f=l.length;f>j;j+=1){for(e=l[j],k=0,i=g.length;i>k;k+=1)g[k].getId()===e.id&&(n=g[k],u.push(n),n.updateData(e));n||(n=p.system.getObject("stream"),n.initialize(e,b,c),n.subscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,p),u.push(n),a&&n.updateData(e)),p.metricsModel.addManifestUpdateStreamInfo(t,e.id,e.index,e.start,e.duration),n=null}g=u,a||(a=g[0],q.call(p,MediaPlayer.events.STREAM_SWITCH_STARTED,null,a),p.playbackController.initialize(a.getStreamInfo()),o.call(p,a),q.call(p,MediaPlayer.events.STREAM_SWITCH_COMPLETED,null,a)),d||B.call(this),m=!1,E.call(p)}catch(v){p.errHandler.manifestError(v.message,"nostreamscomposed",r),p.reset()}}},E=function(){if(!m){var a=this,b=g.length,c=0;for(r.call(this),c;b>c;c+=1)if(!g[c].isInitialized())return;a.notify(MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED)}},F=function(){E.call(this)},G=function(){D.call(this)},H=function(a){if(a.error)this.reset();else{this.log("Manifest has loaded.");var b=a.data.manifest,c=this.adapter.getStreamsInfo(b)[0],d=this.adapter.getMediaInfoForType(b,c,"video")||this.adapter.getMediaInfoForType(b,c,"audio"),g=this.adapter.getDataForMedia(d),h=this.manifestExt.getRepresentationsForAdaptation(b,g)[0].useCalculatedLiveEdgeTime;h&&(this.log("SegmentTimeline detected using calculated Live Edge Time"),f=!1);var i=this.manifestExt.getUTCTimingSources(a.data.manifest),j=!this.manifestExt.getIsDynamic(b)||h?i:i.concat(e);this.timeSyncController.initialize(h?i:j,f)}};return{system:void 0,capabilities:void 0,videoModel:void 0,manifestUpdater:void 0,manifestLoader:void 0,manifestModel:void 0,manifestExt:void 0,adapter:void 0,playbackController:void 0,log:void 0,metricsModel:void 0,metricsExt:void 0,videoExt:void 0,liveEdgeFinder:void 0,
mediaSourceExt:void 0,timelineConverter:void 0,protectionExt:void 0,timeSyncController:void 0,virtualBuffer:void 0,errHandler:void 0,eventBus:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED]=H,this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED]=F,this[MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_BUFFERING_COMPLETED]=x,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=w,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_TIME_UPDATED]=u,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED]=v,this[MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED]=G,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_CAN_PLAY]=s,this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ERROR]=t},getAutoPlay:function(){return j},getActiveStreamInfo:function(){return a?a.getStreamInfo():null},isStreamActive:function(b){return a.getId()===b.id},setUTCTimingSources:function(a,b){e=a,f=b},getStreamById:function(a){return g.filter(function(b){return b.getId()===a})[0]},initialize:function(a,d,e){j=a,b=d,c=e,this.timeSyncController.subscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.timelineConverter),this.timeSyncController.subscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.liveEdgeFinder),this.timeSyncController.subscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this),this.playbackController.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,this.manifestUpdater),this.playbackController.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED,this.manifestUpdater),this.playbackController.subscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED,this),this.subscribe(MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED,this.manifestUpdater),this.manifestUpdater.subscribe(MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED,this),this.manifestUpdater.initialize(this.manifestLoader)},load:function(a){this.manifestLoader.load(a)},loadWithManifest:function(a){this.manifestUpdater.setManifest(a)},reset:function(){a&&p.call(this,a);var e,f=this.system.getObject("mediaController");this.timeSyncController.unsubscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.timelineConverter),this.timeSyncController.unsubscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this.liveEdgeFinder),this.timeSyncController.unsubscribe(MediaPlayer.dependencies.TimeSyncController.eventList.ENAME_TIME_SYNCHRONIZATION_COMPLETED,this),this.timeSyncController.reset();for(var i=0,j=g.length;j>i;i++)e=g[i],e.unsubscribe(MediaPlayer.dependencies.Stream.eventList.ENAME_STREAM_UPDATED,this),f.unsubscribe(MediaPlayer.dependencies.MediaController.eventList.CURRENT_TRACK_CHANGED,e),e.reset(n);g=[],this.unsubscribe(MediaPlayer.dependencies.StreamController.eventList.ENAME_STREAMS_COMPOSED,this.manifestUpdater),this.playbackController.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_STARTED,this.manifestUpdater),this.playbackController.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_PAUSED,this.manifestUpdater),this.playbackController.unsubscribe(MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_ENDED,this),this.manifestUpdater.unsubscribe(MediaPlayer.dependencies.ManifestUpdater.eventList.ENAME_MANIFEST_UPDATED,this),this.manifestUpdater.reset(),this.metricsModel.clearAllCurrentMetrics();var o=this.manifestModel.getValue()?this.manifestModel.getValue().url:null;if(this.manifestModel.setValue(null),this.timelineConverter.reset(),this.liveEdgeFinder.reset(),this.adapter.reset(),this.virtualBuffer.reset(),l=!1,m=!1,a=null,k=!1,n=!1,d&&(this.mediaSourceExt.detachMediaSource(this.videoModel),d=null),b)if(h){var q={},r=this;q[MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE]=function(){h=!1,b=null,c=null,o&&r.eventBus.dispatchEvent({type:MediaPlayer.events.PROTECTION_DESTROYED,data:o}),r.notify(MediaPlayer.dependencies.StreamController.eventList.ENAME_TEARDOWN_COMPLETE)},b.protectionModel.subscribe(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE,q,void 0,!0),b.teardown()}else b.setMediaElement(null),b=null,c=null,this.notify(MediaPlayer.dependencies.StreamController.eventList.ENAME_TEARDOWN_COMPLETE);else this.notify(MediaPlayer.dependencies.StreamController.eventList.ENAME_TEARDOWN_COMPLETE)}}},MediaPlayer.dependencies.StreamController.prototype={constructor:MediaPlayer.dependencies.StreamController},MediaPlayer.dependencies.StreamController.eventList={ENAME_STREAMS_COMPOSED:"streamsComposed",ENAME_TEARDOWN_COMPLETE:"streamTeardownComplete"},MediaPlayer.dependencies.TextController=function(){var a=!1,b=null,c=null,d=null,e=function(){this.notify(MediaPlayer.dependencies.TextController.eventList.ENAME_CLOSED_CAPTIONING_REQUESTED,{CCIndex:0})},f=function(a){var b=this;a.data.fragmentModel===b.streamProcessor.getFragmentModel()&&a.data.chunk.bytes&&b.sourceBufferExt.append(c,a.data.chunk)};return{sourceBufferExt:void 0,log:void 0,system:void 0,errHandler:void 0,videoModel:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){this[Dash.dependencies.RepresentationController.eventList.ENAME_DATA_UPDATE_COMPLETED]=e,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_INIT_FRAGMENT_LOADED]=f},initialize:function(a,b,c){var e=this;d=a,e.setMediaSource(b),e.representationController=c.representationController,e.streamProcessor=c},createBuffer:function(e){try{c=this.sourceBufferExt.createSourceBuffer(b,e),a||(c.hasOwnProperty("initialize")&&c.initialize(d,this),a=!0)}catch(f){this.errHandler.mediaSourceError("Error creating "+d+" source buffer.")}return c},getBuffer:function(){return c},setBuffer:function(a){c=a},setMediaSource:function(a){b=a},reset:function(a){a||(this.sourceBufferExt.abort(b,c),this.sourceBufferExt.removeSourceBuffer(b,c))}}},MediaPlayer.dependencies.TextController.prototype={constructor:MediaPlayer.dependencies.TextController},MediaPlayer.dependencies.TextController.eventList={ENAME_CLOSED_CAPTIONING_REQUESTED:"closedCaptioningRequested"},MediaPlayer.dependencies.XlinkController=function(){"use strict";var a,b,c,d,e="onLoad",f="onActuate",g="Period",h="AdaptationSet",i="EventStream",j="urn:mpeg:dash:resolve-to-zero:2013",k=function(b){var f,h=this;d=new X2JS(a,"",!0),c=b,f=o(c.Period_asArray,c,g,e),l.call(h,f,g,e)},l=function(a,b,c){var d,e,f,g=this,h={};for(h.elements=a,h.type=b,h.resolveType=c,0===h.elements.length&&n.call(g,h),f=0;f<h.elements.length;f+=1)d=h.elements[f],e=-1!==d.url.indexOf("http://")?d.url:d.originalContent.BaseURL+d.url,g.xlinkLoader.load(e,d,h)},m=function(a){var b,c,e,f="<response>",g="</response>",h="";b=a.data.element,c=a.data.resolveObject,b.resolvedContent&&(e=b.resolvedContent.indexOf(">")+1,h=b.resolvedContent.substr(0,e)+f+b.resolvedContent.substr(e)+g,b.resolvedContent=d.xml_str2json(h)),r.call(this,c)&&n.call(this,c)},n=function(a){var b,d,j=[];if(p.call(this,a),a.resolveType===f&&this.notify(MediaPlayer.dependencies.XlinkController.eventList.ENAME_XLINK_READY,{manifest:c}),a.resolveType===e)switch(a.type){case g:for(b=0;b<c[g+"_asArray"].length;b++)d=c[g+"_asArray"][b],d.hasOwnProperty(h+"_asArray")&&(j=j.concat(o.call(this,d[h+"_asArray"],d,h,e))),d.hasOwnProperty(i+"_asArray")&&(j=j.concat(o.call(this,d[i+"_asArray"],d,i,e)));l.call(this,j,h,e);break;case h:this.notify(MediaPlayer.dependencies.XlinkController.eventList.ENAME_XLINK_READY,{manifest:c})}},o=function(a,b,c,d){var e,f,g,h=[];for(f=a.length-1;f>=0;f-=1)e=a[f],e.hasOwnProperty("xlink:href")&&e["xlink:href"]===j&&a.splice(f,1);for(f=0;f<a.length;f++)e=a[f],e.hasOwnProperty("xlink:href")&&e.hasOwnProperty("xlink:actuate")&&e["xlink:actuate"]===d&&(g=q(e["xlink:href"],b,c,f,d,e),h.push(g));return h},p=function(a){var d,e,f,g,h,i,j=[];for(g=a.elements.length-1;g>=0;g--){if(d=a.elements[g],e=d.type+"_asArray",!d.resolvedContent||s())delete d.originalContent["xlink:actuate"],delete d.originalContent["xlink:href"],j.push(d.originalContent);else if(d.resolvedContent)for(h=0;h<d.resolvedContent[e].length;h++)f=d.resolvedContent[e][h],j.push(f);for(d.parentElement[e].splice(d.index,1),i=0;i<j.length;i++)d.parentElement[e].splice(d.index+i,0,j[i]);j=[]}a.elements.length>0&&b.run(c)},q=function(a,b,c,d,e,f){return{url:a,parentElement:b,type:c,index:d,resolveType:e,originalContent:f,resolvedContent:null,resolved:!1}},r=function(a){var b,c;for(b=0;b<a.elements.length;b++)if(c=a.elements[b],c.resolved===!1)return!1;return!0},s=function(){return!1};return{xlinkLoader:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,setup:function(){m=m.bind(this),this.xlinkLoader.subscribe(MediaPlayer.dependencies.XlinkLoader.eventList.ENAME_XLINKELEMENT_LOADED,this,m)},resolveManifestOnLoad:function(a){k.call(this,a)},setMatchers:function(b){a=b},setIron:function(a){b=a}}},MediaPlayer.dependencies.XlinkController.prototype={constructor:MediaPlayer.dependencies.XlinkController},MediaPlayer.dependencies.XlinkController.eventList={ENAME_XLINK_ALLELEMENTSLOADED:"xlinkAllElementsLoaded",ENAME_XLINK_READY:"xlinkReady"},MediaPlayer.dependencies.MediaSourceExtensions=function(){"use strict"},MediaPlayer.dependencies.MediaSourceExtensions.prototype={constructor:MediaPlayer.dependencies.MediaSourceExtensions,createMediaSource:function(){"use strict";var a="WebKitMediaSource"in window,b="MediaSource"in window;return b?new MediaSource:a?new WebKitMediaSource:null},attachMediaSource:function(a,b){"use strict";var c=window.URL.createObjectURL(a);return b.setSource(c),c},detachMediaSource:function(a){"use strict";a.setSource("")},setDuration:function(a,b){"use strict";return a.duration!=b&&(a.duration=b),a.duration},signalEndOfStream:function(a){"use strict";var b=a.sourceBuffers,c=b.length,d=0;if("open"===a.readyState){for(d;c>d;d+=1)if(b[d].updating)return;a.endOfStream()}}},MediaPlayer.dependencies.ProtectionExtensions=function(){"use strict";this.system=void 0,this.log=void 0,this.keySystems=[],this.notify=void 0,this.subscribe=void 0,this.unsubscribe=void 0,this.clearkeyKeySystem=void 0},MediaPlayer.dependencies.ProtectionExtensions.prototype={constructor:MediaPlayer.dependencies.ProtectionExtensions,setup:function(){var a;a=this.system.getObject("ksPlayReady"),this.keySystems.push(a),a=this.system.getObject("ksWidevine"),this.keySystems.push(a),a=this.system.getObject("ksClearKey"),this.keySystems.push(a),this.clearkeyKeySystem=a},getKeySystems:function(){return this.keySystems},getKeySystemBySystemString:function(a){for(var b=0;b<this.keySystems.length;b++)if(this.keySystems[b].systemString===a)return this.keySystems[b];return null},isClearKey:function(a){return a===this.clearkeyKeySystem},initDataEquals:function(a,b){if(a.byteLength===b.byteLength){for(var c=new Uint8Array(a),d=new Uint8Array(b),e=0;e<c.length;e++)if(c[e]!==d[e])return!1;return!0}return!1},getSupportedKeySystemsFromContentProtection:function(a){var b,c,d,e,f=[];if(a)for(d=0;d<this.keySystems.length;++d)for(c=this.keySystems[d],e=0;e<a.length;++e)if(b=a[e],b.schemeIdUri.toLowerCase()===c.schemeIdURI){var g=c.getInitData(b);g&&f.push({ks:this.keySystems[d],initData:g})}return f},getSupportedKeySystems:function(a){var b,c=[],d=MediaPlayer.dependencies.protection.CommonEncryption.parsePSSHList(a);for(b=0;b<this.keySystems.length;++b)this.keySystems[b].uuid in d&&c.push({ks:this.keySystems[b],initData:d[this.keySystems[b].uuid]});return c},getLicenseServer:function(a,b,c){if("license-release"===c||"individualization-request"==c)return null;var d=null;return b&&b.hasOwnProperty("drmtoday")?d=this.system.getObject("serverDRMToday"):"com.widevine.alpha"===a.systemString?d=this.system.getObject("serverWidevine"):"com.microsoft.playready"===a.systemString?d=this.system.getObject("serverPlayReady"):"org.w3.clearkey"===a.systemString&&(d=this.system.getObject("serverClearKey")),d},processClearKeyLicenseRequest:function(a,b){try{return MediaPlayer.dependencies.protection.KeySystem_ClearKey.getClearKeysFromProtectionData(a,b)}catch(c){return this.log("Failed to retrieve clearkeys from ProtectionData"),null}}},MediaPlayer.dependencies.RequestModifierExtensions=function(){"use strict";return{modifyRequestURL:function(a){return a},modifyRequestHeader:function(a){return a}}},MediaPlayer.dependencies.SourceBufferExtensions=function(){"use strict";this.system=void 0,this.notify=void 0,this.subscribe=void 0,this.unsubscribe=void 0,this.manifestExt=void 0},MediaPlayer.dependencies.SourceBufferExtensions.prototype={constructor:MediaPlayer.dependencies.SourceBufferExtensions,createSourceBuffer:function(a,b){"use strict";var c=this,d=b.codec,e=null;try{if(d.match(/application\/mp4;\s*codecs="stpp"/i))throw new Error("not really supported");e=a.addSourceBuffer(d)}catch(f){if(!b.isText&&-1===d.indexOf('codecs="stpp"'))throw f;e=c.system.getObject("textSourceBuffer")}return e},removeSourceBuffer:function(a,b){"use strict";try{a.removeSourceBuffer(b)}catch(c){}},getBufferRange:function(a,b,c){"use strict";var d,e,f=null,g=0,h=0,i=null,j=null,k=0,l=c||.15;try{f=a.buffered}catch(m){return null}if(null!==f&&void 0!==f){for(e=0,d=f.length;d>e;e+=1)if(g=f.start(e),h=f.end(e),null===i)k=Math.abs(g-b),b>=g&&h>b?(i=g,j=h):l>=k&&(i=g,j=h);else{if(k=g-j,!(l>=k))break;j=h}if(null!==i)return{start:i,end:j}}return null},getAllRanges:function(a){var b=null;try{return b=a.buffered}catch(c){return null}},getTotalBufferedTime:function(a){var b,c,d=this.getAllRanges(a),e=0;if(!d)return e;for(c=0,b=d.length;b>c;c+=1)e+=d.end(c)-d.start(c);return e},getBufferLength:function(a,b,c){"use strict";var d,e,f=this;return d=f.getBufferRange(a,b,c),e=null===d?0:d.end-b},getRangeDifference:function(a,b){if(!b)return null;var c,d,e,f,g,h,i,j,k,l=this.getAllRanges(b);if(!l)return null;for(var m=0,n=l.length;n>m;m+=1){if(j=a.length>m,g=j?{start:a.start(m),end:a.end(m)}:null,c=l.start(m),d=l.end(m),!g)return k={start:c,end:d};if(e=g.start===c,f=g.end===d,!e||!f){if(e)k={start:g.end,end:d};else{if(!f)return k={start:c,end:d};k={start:c,end:g.start}}return h=a.length>m+1?{start:a.start(m+1),end:a.end(m+1)}:null,i=n>m+1?{start:l.start(m+1),end:l.end(m+1)}:null,!h||i&&i.start===h.start&&i.end===h.end||(k.end=h.start),k}}return null},waitForUpdateEnd:function(a,b){"use strict";var c,d=50,e=function(){a.updating||(clearInterval(c),b())},f=function(){a.updating||(a.removeEventListener("updateend",f,!1),b())};if(!a.updating)return void b();if("function"==typeof a.addEventListener)try{a.addEventListener("updateend",f,!1)}catch(g){c=setInterval(e,d)}else c=setInterval(e,d)},append:function(a,b){var c=this,d=b.bytes,e="append"in a?"append":"appendBuffer"in a?"appendBuffer":null,f="Object"===Object.prototype.toString.call(a).slice(8,-1);if(e)try{c.waitForUpdateEnd(a,function(){f?a[e](d,b):a[e](d),c.waitForUpdateEnd(a,function(){c.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,{buffer:a,bytes:d})})})}catch(g){c.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_APPEND_COMPLETED,{buffer:a,bytes:d},new MediaPlayer.vo.Error(g.code,g.message,null))}},remove:function(a,b,c,d){var e=this;try{e.waitForUpdateEnd(a,function(){b>=0&&c>b&&"ended"!==d.readyState&&a.remove(b,c),e.waitForUpdateEnd(a,function(){e.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,{buffer:a,from:b,to:c})})})}catch(f){e.notify(MediaPlayer.dependencies.SourceBufferExtensions.eventList.ENAME_SOURCEBUFFER_REMOVE_COMPLETED,{buffer:a,from:b,to:c},new MediaPlayer.vo.Error(f.code,f.message,null))}},abort:function(a,b){"use strict";try{"open"===a.readyState&&b.abort()}catch(c){}}},MediaPlayer.dependencies.SourceBufferExtensions.QUOTA_EXCEEDED_ERROR_CODE=22,MediaPlayer.dependencies.SourceBufferExtensions.eventList={ENAME_SOURCEBUFFER_REMOVE_COMPLETED:"sourceBufferRemoveCompleted",ENAME_SOURCEBUFFER_APPEND_COMPLETED:"sourceBufferAppendCompleted"},MediaPlayer.utils.TextTrackExtensions=function(){"use strict";var a,b,c=[],d=[],e=-1,f=0,g=0,h=null,i=null,j=!1,k=function(a){var d=c[a].kind,e=void 0!==c[a].label?c[a].label:c[a].lang,f=c[a].lang,g=j?b.addTextTrack(d,e,f):document.createElement("track");return j||(g.kind=d,g.label=e,g.srclang=f),g};return{mediaController:void 0,videoModel:void 0,eventBus:void 0,setup:function(){a=window.VTTCue||window.TextTrackCue,j=!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)},addTextTrack:function(a,f){if(c.push(a),void 0===b&&(b=a.video),h=this.videoModel.getTTMLRenderingDiv(),c.length===f){for(var g=0,i=0;i<c.length;i++){var l=k(i);e=i,d.push(l),c[i].defaultTrack&&(l["default"]=!0,g=i),j||b.appendChild(l),this.addCaptions(0,c[i].captionData),this.eventBus.dispatchEvent({type:MediaPlayer.events.TEXT_TRACK_ADDED})}e=g,this.eventBus.dispatchEvent({type:MediaPlayer.events.TEXT_TRACKS_ADDED,data:{index:e,tracks:c}})}},checkVideoSize:function(){var a=this.getCurrentTextTrack();if(a&&"html"===a.renderingType){var c=b.clientWidth,d=b.clientHeight;if(c!=f||d!=g){f=c,g=d,h.style.width=f+"px",h.style.height=g+"px";for(var e=0;e<a.activeCues.length;++e){var i=a.activeCues[e];i.scaleCue(i)}}}},scaleCue:function(a){var b,c,d,e=f,h=g,i=[e/a.cellResolution[0],h/a.cellResolution[1]];if(a.linePadding)for(b in a.linePadding)if(a.linePadding.hasOwnProperty(b)){var j=a.linePadding[b];c=(j*i[0]).toString();for(var k=document.getElementsByClassName("spanPadding"),l=0;l<k.length;l++)k[l].style.cssText=k[l].style.cssText.replace(/(padding-left\s*:\s*)[\d.,]+(?=\s*px)/gi,"$1"+c),k[l].style.cssText=k[l].style.cssText.replace(/(padding-right\s*:\s*)[\d.,]+(?=\s*px)/gi,"$1"+c)}if(a.fontSize)for(b in a.fontSize)if(a.fontSize.hasOwnProperty(b)){var m=a.fontSize[b]/100;c=(m*i[1]).toString(),d="defaultFontSize"!==b?document.getElementsByClassName(b):document.getElementsByClassName("paragraph");for(var n=0;n<d.length;n++)d[n].style.cssText=d[n].style.cssText.replace(/(font-size\s*:\s*)[\d.,]+(?=\s*px)/gi,"$1"+c)}if(a.lineHeight)for(b in a.lineHeight)if(a.lineHeight.hasOwnProperty(b)){var o=a.lineHeight[b]/100;c=(o*i[1]).toString(),d=document.getElementsByClassName(b);for(var p=0;p<d.length;p++)d[p].style.cssText=d[p].style.cssText.replace(/(line-height\s*:\s*)[\d.,]+(?=\s*px)/gi,"$1"+c)}},addCaptions:function(d,f){var g=this.getCurrentTextTrack();if(g){g.mode="showing";for(var j in f){var k,l=f[j];i||"html"!=l.type||(i=setInterval(this.checkVideoSize.bind(this),500)),"image"==l.type?(k=new a(l.start-d,l.end-d,""),k.image=l.data,k.id=l.id,k.size=0,k.type="image",k.onenter=function(){var a=new Image;a.id="ttmlImage_"+this.id,a.src=this.image,a.className="cue-image",h?h.appendChild(a):b.parentNode.appendChild(a)},k.onexit=function(){var a,c,d;for(a=h?h:b.parentNode,d=a.childNodes,c=0;c<d.length;c++)d[c].id=="ttmlImage_"+this.id&&a.removeChild(d[c])}):"html"==l.type?("html"!==g.renderingType&&(g.renderingType="html"),a!==window.TextTrackCue&&(document.getElementById("caption-style")?document.getElementById("caption-style").sheet.cssRules.length||this.setCueStyle():this.setCueStyle()),k=new a(l.start-d,l.end-d,""),k.cueHTMLElement=l.cueHTMLElement,k.regions=l.regions,k.regionID=l.regionID,k.cueID=l.cueID,k.videoWidth=l.videoWidth,k.videoHeight=l.videoHeight,k.cellResolution=l.cellResolution,k.fontSize=l.fontSize,k.lineHeight=l.lineHeight,k.linePadding=l.linePadding,k.scaleCue=this.scaleCue,h.style.width=b.clientWidth+"px",h.style.height=b.clientHeight+"px",k.onenter=function(){"showing"==g.mode&&(h.appendChild(this.cueHTMLElement),this.scaleCue(this))},k.onexit=function(){for(var a=h.childNodes,b=0;b<a.length;++b)a[b].id=="subtitle_"+this.cueID&&h.removeChild(a[b])}):(k=new a(l.start-d,l.end-d,l.data),l.styles&&(void 0!==l.styles.align&&k.hasOwnProperty("align")&&(k.align=l.styles.align),void 0!==l.styles.line&&k.hasOwnProperty("line")&&(k.line=l.styles.line),void 0!==l.styles.position&&k.hasOwnProperty("position")&&(k.position=l.styles.position),void 0!==l.styles.size&&k.hasOwnProperty("size")&&(k.size=l.styles.size))),g.addCue(k)}c[e].isFragmented||(g.mode=c[e].defaultTrack?"showing":"hidden")}},getCurrentTextTrack:function(){return e>=0?b.textTracks[e]:null},getCurrentTrackIdx:function(){return e},setCurrentTrackIdx:function(a){e=a},getTextTrack:function(a){return b.textTracks[a]},deleteTrackCues:function(a){if(a.cues){for(var b=a.cues,c=b.length-1,d=c;d>=0;d--)a.removeCue(b[d]);a.mode="disabled"}},deleteAllTextTracks:function(){for(var a=d.length,e=0;a>e;e++)j?this.deleteTrackCues(this.getTextTrack(e)):b.removeChild(d[e]);d=[],c=[],i&&(clearInterval(i),i=null)},deleteTextTrack:function(a){b.removeChild(d[a]),d.splice(a,1)},setCueStyle:function(){var a;document.getElementById("caption-style")?a=document.getElementById("caption-style"):(a=document.createElement("style"),a.id="caption-style"),document.head.appendChild(a);var c=a.sheet;b.id?c.addRule("#"+b.id+"::cue","background: transparent"):0!==b.classList.length?c.addRule("."+b.className+"::cue","background: transparent"):c.addRule("video::cue","background: transparent")},removeCueStyle:function(){if(a!==window.TextTrackCue){var b=document.getElementById("caption-style").sheet;b.cssRules&&b.cssRules.length>0&&b.deleteRule(0)}},clearCues:function(){for(;h.firstChild;)h.removeChild(h.firstChild)}}},MediaPlayer.dependencies.VideoModelExtensions=function(){"use strict";return{getPlaybackQuality:function(a){var b="webkitDroppedFrameCount"in a,c="getVideoPlaybackQuality"in a,d=null;return c?d=a.getVideoPlaybackQuality():b&&(d={droppedVideoFrames:a.webkitDroppedFrameCount,creationTime:new Date}),d}}},MediaPlayer.dependencies.VideoModelExtensions.prototype={constructor:MediaPlayer.dependencies.VideoModelExtensions},MediaPlayer.dependencies.FragmentModel=function(){"use strict";var a=null,b=[],c=[],d=[],e=[],f=!1,g=function(a){var b=this;b.notify(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_STARTED,{request:a}),b.fragmentLoader.load(a)},h=function(a,b){var c=a.indexOf(b);-1!==c&&a.splice(c,1)},i=function(a,b,c){var d,e=a.length-1,f=NaN,g=NaN,h=null;for(d=e;d>=0;d-=1)if(h=a[d],f=h.startTime,g=f+h.duration,c=c||h.duration/2,!isNaN(f)&&!isNaN(g)&&b+c>=f&&g>b-c||isNaN(f)&&isNaN(b))return h;return null},j=function(a,b){return b?b.hasOwnProperty("time")?[i.call(this,a,b.time,b.threshold)]:a.filter(function(a){for(var c in b)if("state"!==c&&b.hasOwnProperty(c)&&a[c]!=b[c])return!1;return!0}):a},k=function(a){var f;switch(a){case MediaPlayer.dependencies.FragmentModel.states.PENDING:f=c;break;case MediaPlayer.dependencies.FragmentModel.states.LOADING:f=d;break;case MediaPlayer.dependencies.FragmentModel.states.EXECUTED:f=b;break;case MediaPlayer.dependencies.FragmentModel.states.REJECTED:f=e;break;default:f=[]}return f},l=function(a,f){if(a){var g=a.mediaType,h=new Date,i=a.type,j=a.startTime,k=a.availabilityStartTime,l=a.duration,m=a.quality,n=a.range;this.metricsModel.addSchedulingInfo(g,h,i,j,k,l,m,n,f),this.metricsModel.addRequestsQueue(g,c,d,b,e)}},m=function(a){var c=a.data.request,e=a.data.response,f=a.error;d.splice(d.indexOf(c),1),e&&!f&&b.push(c),l.call(this,c,f?MediaPlayer.dependencies.FragmentModel.states.FAILED:MediaPlayer.dependencies.FragmentModel.states.EXECUTED),this.notify(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_FRAGMENT_LOADING_COMPLETED,{request:c,response:e},f)},n=function(a){var c=this.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,quality:a.data.quality,index:a.data.index})[0];c&&(h.call(this,b,c),isNaN(a.data.index)||(e.push(c),l.call(this,c,MediaPlayer.dependencies.FragmentModel.states.REJECTED)))},o=function(){f=!0},p=function(){f=!1};return{system:void 0,log:void 0,metricsModel:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,manifestExt:void 0,setup:function(){this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN]=o,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED]=p,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BYTES_REJECTED]=n,this[MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_LOADING_COMPLETED]=m},setLoader:function(a){this.fragmentLoader=a},setContext:function(b){a=b},getContext:function(){return a},getIsPostponed:function(){return f},addRequest:function(a){return this.manifestExt.getIsTextTrack(a.mediaType)||a&&!this.isFragmentLoadedOrPending(a)?(c.push(a),l.call(this,a,MediaPlayer.dependencies.FragmentModel.states.PENDING),!0):!1},isFragmentLoadedOrPending:function(a){var e=function(a,b){return"complete"===a.action&&a.action===b.action},f=function(a,b){return a.url===b.url&&a.startTime===b.startTime},g=function(a,b){return isNaN(a.index)&&isNaN(b.index)&&a.quality===b.quality},h=function(b){var c,d,h=!1,i=b.length;for(d=0;i>d;d+=1)if(c=b[d],f(a,c)||g(a,c)||e(a,c)){h=!0;break}return h};return h(c)||h(d)||h(b)},getRequests:function(a){var b,c=[],d=[],e=1;if(!a||!a.state)return c;a.state instanceof Array?(e=a.state.length,b=a.state):b=[a.state];for(var f=0;e>f;f+=1)c=k.call(this,b[f]),d=d.concat(j.call(this,c,a));return d},getLoadingTime:function(){var a,c,d=0;for(c=b.length-1;c>=0;c-=1)if(a=b[c],a.requestEndDate instanceof Date&&a.firstByteDate instanceof Date){d=a.requestEndDate.getTime()-a.firstByteDate.getTime();break}return d},removeExecutedRequest:function(a){h.call(this,b,a)},removeRejectedRequest:function(a){h.call(this,e,a)},removeExecutedRequestsBeforeTime:function(a){var c,d=b.length-1,e=NaN,f=null;for(c=d;c>=0;c-=1)f=b[c],e=f.startTime,!isNaN(e)&&a>e&&h.call(this,b,f)},cancelPendingRequests:function(a){var b=this,d=c,e=d;return c=[],void 0!==a&&(c=d.filter(function(b){return b.quality===a?!1:(e.splice(e.indexOf(b),1),!0)})),e.forEach(function(a){l.call(b,a,MediaPlayer.dependencies.FragmentModel.states.CANCELED)}),e},abortRequests:function(){var a=[];for(this.fragmentLoader.abort();d.length>0;)a.push(d[0]),h.call(this,d,d[0]);return d=[],a},executeRequest:function(a){var e=this,f=c.indexOf(a);if(a&&-1!==f)switch(c.splice(f,1),a.action){case"complete":b.push(a),l.call(e,a,MediaPlayer.dependencies.FragmentModel.states.EXECUTED),e.notify(MediaPlayer.dependencies.FragmentModel.eventList.ENAME_STREAM_COMPLETED,{request:a});break;case"download":d.push(a),l.call(e,a,MediaPlayer.dependencies.FragmentModel.states.LOADING),g.call(e,a);break;default:this.log("Unknown request action.")}},reset:function(){this.abortRequests(),this.cancelPendingRequests(),a=null,b=[],c=[],d=[],e=[],f=!1}}},MediaPlayer.dependencies.FragmentModel.prototype={constructor:MediaPlayer.dependencies.FragmentModel},MediaPlayer.dependencies.FragmentModel.eventList={ENAME_STREAM_COMPLETED:"streamCompleted",ENAME_FRAGMENT_LOADING_STARTED:"fragmentLoadingStarted",ENAME_FRAGMENT_LOADING_COMPLETED:"fragmentLoadingCompleted"},MediaPlayer.dependencies.FragmentModel.states={PENDING:"pending",LOADING:"loading",EXECUTED:"executed",REJECTED:"rejected",CANCELED:"canceled",FAILED:"failed"},MediaPlayer.models.ManifestModel=function(){"use strict";var a;return{system:void 0,eventBus:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,getValue:function(){return a},setValue:function(b){a=b,this.eventBus.dispatchEvent({type:MediaPlayer.events.MANIFEST_LOADED,data:b}),this.notify(MediaPlayer.models.ManifestModel.eventList.ENAME_MANIFEST_UPDATED,{manifest:b})}}},MediaPlayer.models.ManifestModel.prototype={constructor:MediaPlayer.models.ManifestModel},MediaPlayer.models.ManifestModel.eventList={ENAME_MANIFEST_UPDATED:"manifestUpdated"},MediaPlayer.models.MetricsModel=function(){"use strict";return{system:void 0,eventBus:void 0,adapter:void 0,streamMetrics:{},metricsChanged:function(){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRICS_CHANGED,data:{}})},metricChanged:function(a){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRIC_CHANGED,data:{stream:a}}),this.metricsChanged()},metricUpdated:function(a,b,c){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRIC_UPDATED,data:{stream:a,metric:b,value:c}}),this.metricChanged(a)},metricAdded:function(a,b,c){this.eventBus.dispatchEvent({type:MediaPlayer.events.METRIC_ADDED,data:{stream:a,metric:b,value:c}}),this.metricChanged(a)},clearCurrentMetricsForType:function(a){delete this.streamMetrics[a],this.metricChanged(a)},clearAllCurrentMetrics:function(){var a=this;this.streamMetrics={},this.metricsChanged.call(a)},getReadOnlyMetricsFor:function(a){return this.streamMetrics.hasOwnProperty(a)?this.streamMetrics[a]:null},getMetricsFor:function(a){var b;return this.streamMetrics.hasOwnProperty(a)?b=this.streamMetrics[a]:(b=this.system.getObject("metrics"),this.streamMetrics[a]=b),b},addTcpConnection:function(a,b,c,d,e,f){var g=new MediaPlayer.vo.metrics.TCPConnection;return g.tcpid=b,g.dest=c,g.topen=d,g.tclose=e,g.tconnect=f,this.getMetricsFor(a).TcpList.push(g),this.metricAdded(a,this.adapter.metricsList.TCP_CONNECTION,g),g},addHttpRequest:function(a,b,c,d,e,f,g,h,i,j,k,l){var m=new MediaPlayer.vo.metrics.HTTPRequest;return e&&e!==d&&(this.addHttpRequest(a,null,c,d,null,f,g,null,null,null,k,null),m.actualurl=e),m.stream=a,m.tcpid=b,m.type=c,m.url=d,m.range=f,m.trequest=g,m.tresponse=h,m.tfinish=i,m.responsecode=j,m.mediaduration=k,m.responseHeaders=l,this.getMetricsFor(a).HttpList.push(m),this.metricAdded(a,this.adapter.metricsList.HTTP_REQUEST,m),m},appendHttpTrace:function(a,b,c,d){var e=new MediaPlayer.vo.metrics.HTTPRequest.Trace;return e.s=b,e.d=c,e.b=d,a.trace.push(e),a.interval||(a.interval=0),a.interval+=c,this.metricUpdated(a.stream,this.adapter.metricsList.HTTP_REQUEST_TRACE,a),e},addRepresentationSwitch:function(a,b,c,d,e){var f=new MediaPlayer.vo.metrics.RepresentationSwitch;return f.t=b,f.mt=c,f.to=d,f.lto=e,this.getMetricsFor(a).RepSwitchList.push(f),this.metricAdded(a,this.adapter.metricsList.TRACK_SWITCH,f),f},addBufferLevel:function(a,b,c){var d=new MediaPlayer.vo.metrics.BufferLevel;return d.t=b,d.level=c,this.getMetricsFor(a).BufferLevel.push(d),this.metricAdded(a,this.adapter.metricsList.BUFFER_LEVEL,d),d},addBufferState:function(a,b,c){var d=new MediaPlayer.vo.metrics.BufferState;return d.target=c,d.state=b,this.getMetricsFor(a).BufferState.push(d),this.metricAdded(a,this.adapter.metricsList.BUFFER_STATE,d),d},addDVRInfo:function(a,b,c,d){var e=new MediaPlayer.vo.metrics.DVRInfo;return e.time=b,e.range=d,e.manifestInfo=c,this.getMetricsFor(a).DVRInfo.push(e),this.metricAdded(a,this.adapter.metricsList.DVR_INFO,e),e},addDroppedFrames:function(a,b){var c=new MediaPlayer.vo.metrics.DroppedFrames,d=this.getMetricsFor(a).DroppedFrames;return c.time=b.creationTime,c.droppedFrames=b.droppedVideoFrames,d.length>0&&d[d.length-1]==c?d[d.length-1]:(d.push(c),this.metricAdded(a,this.adapter.metricsList.DROPPED_FRAMES,c),c)},addSchedulingInfo:function(a,b,c,d,e,f,g,h,i){var j=new MediaPlayer.vo.metrics.SchedulingInfo;return j.mediaType=a,j.t=b,j.type=c,j.startTime=d,j.availabilityStartTime=e,j.duration=f,j.quality=g,j.range=h,j.state=i,this.getMetricsFor(a).SchedulingInfo.push(j),this.metricAdded(a,this.adapter.metricsList.SCHEDULING_INFO,j),j},addRequestsQueue:function(a,b,c,d,e){var f=new MediaPlayer.vo.metrics.RequestsQueue;f.pendingRequests=b,f.loadingRequests=c,f.executedRequests=d,f.rejectedRequests=e,this.getMetricsFor(a).RequestsQueue=f,this.metricAdded(a,this.adapter.metricsList.REQUESTS_QUEUE,f)},addManifestUpdate:function(a,b,c,d,e,f,g,h,i,j){var k=new MediaPlayer.vo.metrics.ManifestUpdate,l=this.getMetricsFor("stream");return k.mediaType=a,k.type=b,k.requestTime=c,k.fetchTime=d,k.availabilityStartTime=e,
k.presentationStartTime=f,k.clientTimeOffset=g,k.currentTime=h,k.buffered=i,k.latency=j,l.ManifestUpdate.push(k),this.metricAdded(a,this.adapter.metricsList.MANIFEST_UPDATE,k),k},updateManifestUpdateInfo:function(a,b){if(a){for(var c in b)a[c]=b[c];this.metricUpdated(a.mediaType,this.adapter.metricsList.MANIFEST_UPDATE,a)}},addManifestUpdateStreamInfo:function(a,b,c,d,e){if(a){var f=new MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo;return f.id=b,f.index=c,f.start=d,f.duration=e,a.streamInfo.push(f),this.metricUpdated(a.mediaType,this.adapter.metricsList.MANIFEST_UPDATE_STREAM_INFO,a),f}return null},addManifestUpdateRepresentationInfo:function(a,b,c,d,e,f,g,h){if(a){var i=new MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo;return i.id=b,i.index=c,i.streamIndex=d,i.mediaType=e,i.startNumber=g,i.fragmentInfoType=h,i.presentationTimeOffset=f,a.trackInfo.push(i),this.metricUpdated(a.mediaType,this.adapter.metricsList.MANIFEST_UPDATE_TRACK_INFO,a),i}return null},addPlayList:function(a,b,c,d){var e=new MediaPlayer.vo.metrics.PlayList;return e.stream=a,e.start=b,e.mstart=c,e.starttype=d,this.getMetricsFor(a).PlayList.push(e),this.metricAdded(a,this.adapter.metricsList.PLAY_LIST,e),e},appendPlayListTrace:function(a,b,c,d,e,f,g,h){var i=new MediaPlayer.vo.metrics.PlayList.Trace;return i.representationid=b,i.subreplevel=c,i.start=d,i.mstart=e,i.duration=f,i.playbackspeed=g,i.stopreason=h,a.trace.push(i),this.metricUpdated(a.stream,this.adapter.metricsList.PLAY_LIST_TRACE,a),i}}},MediaPlayer.models.MetricsModel.prototype={constructor:MediaPlayer.models.MetricsModel},MediaPlayer.models.ProtectionModel=function(){},MediaPlayer.models.ProtectionModel.eventList={ENAME_NEED_KEY:"needkey",ENAME_KEY_SYSTEM_ACCESS_COMPLETE:"keySystemAccessComplete",ENAME_KEY_SYSTEM_SELECTED:"keySystemSelected",ENAME_VIDEO_ELEMENT_SELECTED:"videoElementSelected",ENAME_SERVER_CERTIFICATE_UPDATED:"serverCertificateUpdated",ENAME_KEY_MESSAGE:"keyMessage",ENAME_KEY_ADDED:"keyAdded",ENAME_KEY_ERROR:"keyError",ENAME_KEY_SESSION_CREATED:"keySessionCreated",ENAME_KEY_SESSION_REMOVED:"keySessionRemoved",ENAME_KEY_SESSION_CLOSED:"keySessionClosed",ENAME_KEY_STATUSES_CHANGED:"keyStatusesChanged",ENAME_TEARDOWN_COMPLETE:"protectionTeardownComplete"},MediaPlayer.models.ProtectionModel_01b=function(){var a,b=null,c=null,d=[],e=[],f=function(){var b=this;return{handleEvent:function(f){var g=null;switch(f.type){case c.needkey:var i=ArrayBuffer.isView(f.initData)?f.initData.buffer:f.initData;b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,new MediaPlayer.vo.protection.NeedKey(i,"cenc"));break;case c.keyerror:if(g=h(e,f.sessionId),g||(g=h(d,f.sessionId)),g){var j="";switch(f.errorCode.code){case 1:j+="MEDIA_KEYERR_UNKNOWN - An unspecified error occurred. This value is used for errors that don't match any of the other codes.";break;case 2:j+="MEDIA_KEYERR_CLIENT - The Key System could not be installed or updated.";break;case 3:j+="MEDIA_KEYERR_SERVICE - The message passed into update indicated an error from the license service.";break;case 4:j+="MEDIA_KEYERR_OUTPUT - There is no available output device with the required characteristics for the content protection system.";break;case 5:j+="MEDIA_KEYERR_HARDWARECHANGE - A hardware configuration change caused a content protection error.";break;case 6:j+="MEDIA_KEYERR_DOMAIN - An error occurred in a multi-device domain licensing configuration. The most common error is a failure to join the domain."}j+="  System Code = "+f.systemCode,b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,new MediaPlayer.vo.protection.KeyError(g,j))}else b.log("No session token found for key error");break;case c.keyadded:g=h(e,f.sessionId),g||(g=h(d,f.sessionId)),g?b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,g):b.log("No session token found for key added");break;case c.keymessage:if(a=null!==f.sessionId&&void 0!==f.sessionId,a?(g=h(e,f.sessionId),!g&&d.length>0&&(g=d.shift(),e.push(g),g.sessionID=f.sessionId)):d.length>0&&(g=d.shift(),e.push(g),0!==d.length&&b.errHandler.mediaKeyMessageError("Multiple key sessions were creates with a user-agent that does not support sessionIDs!! Unpredictable behavior ahead!")),g){var k=ArrayBuffer.isView(f.message)?f.message.buffer:f.message;g.keyMessage=k,b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,new MediaPlayer.vo.protection.KeyMessage(g,k,f.defaultURL))}else b.log("No session token found for key message")}}}},g=null,h=function(a,b){if(b&&a){for(var c=a.length,d=0;c>d;d++)if(a[d].sessionID==b)return a[d];return null}return null},i=function(){b.removeEventListener(c.keyerror,g),b.removeEventListener(c.needkey,g),b.removeEventListener(c.keymessage,g),b.removeEventListener(c.keyadded,g)};return{system:void 0,log:void 0,errHandler:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,protectionExt:void 0,keySystem:null,setup:function(){g=f.call(this)},init:function(){var a=document.createElement("video");c=MediaPlayer.models.ProtectionModel_01b.detect(a)},teardown:function(){b&&i();for(var a=0;a<e.length;a++)this.closeKeySession(e[a]);this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE)},getAllInitData:function(){var a,b=[];for(a=0;a<d.length;a++)b.push(d[a].initData);for(a=0;a<e.length;a++)b.push(e[a].initData);return b},requestKeySystemAccess:function(a){var c=b;c||(c=document.createElement("video"));for(var d=!1,e=0;e<a.length;e++)for(var f=a[e].ks.systemString,g=a[e].configs,h=null,i=null,j=0;j<g.length;j++){var k=g[j].videoCapabilities;if(k&&0!==k.length){i=[];for(var l=0;l<k.length;l++)""!==c.canPlayType(k[l].contentType,f)&&i.push(k[l])}if(!(!h&&!i||h&&0===h.length||i&&0===i.length)){d=!0;var m=new MediaPlayer.vo.protection.KeySystemConfiguration(h,i),n=this.protectionExt.getKeySystemBySystemString(f),o=new MediaPlayer.vo.protection.KeySystemAccess(n,m);this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,o);break}}d||this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,null,"Key system access denied! -- No valid audio/video content configurations detected!")},selectKeySystem:function(a){this.keySystem=a.keySystem,this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED)},setMediaElement:function(a){b!==a&&(b&&i(),b=a,b&&(b.addEventListener(c.keyerror,g),b.addEventListener(c.needkey,g),b.addEventListener(c.keymessage,g),b.addEventListener(c.keyadded,g),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_VIDEO_ELEMENT_SELECTED)))},createKeySession:function(f){if(!this.keySystem)throw new Error("Can not create sessions until you have selected a key system");if(a||0===e.length){var g={sessionID:null,initData:f,getSessionID:function(){return this.sessionID},getExpirationTime:function(){return NaN},getSessionType:function(){return"temporary"}};return d.push(g),b[c.generateKeyRequest](this.keySystem.systemString,new Uint8Array(f)),g}throw new Error("Multiple sessions not allowed!")},updateKeySession:function(a,d){var e=a.sessionID;if(this.protectionExt.isClearKey(this.keySystem))for(var f=0;f<d.keyPairs.length;f++)b[c.addKey](this.keySystem.systemString,d.keyPairs[f].key,d.keyPairs[f].keyID,e);else b[c.addKey](this.keySystem.systemString,new Uint8Array(d),a.initData,e)},closeKeySession:function(a){b[c.cancelKeyRequest](this.keySystem.systemString,a.sessionID)},setServerCertificate:function(){},loadKeySession:function(){},removeKeySession:function(){}}},MediaPlayer.models.ProtectionModel_01b.prototype={constructor:MediaPlayer.models.ProtectionModel_01b},MediaPlayer.models.ProtectionModel_01b.APIs=[{generateKeyRequest:"generateKeyRequest",addKey:"addKey",cancelKeyRequest:"cancelKeyRequest",needkey:"needkey",keyerror:"keyerror",keyadded:"keyadded",keymessage:"keymessage"},{generateKeyRequest:"webkitGenerateKeyRequest",addKey:"webkitAddKey",cancelKeyRequest:"webkitCancelKeyRequest",needkey:"webkitneedkey",keyerror:"webkitkeyerror",keyadded:"webkitkeyadded",keymessage:"webkitkeymessage"}],MediaPlayer.models.ProtectionModel_01b.detect=function(a){for(var b=MediaPlayer.models.ProtectionModel_01b.APIs,c=0;c<b.length;c++){var d=b[c];if("function"==typeof a[d.generateKeyRequest]&&"function"==typeof a[d.addKey]&&"function"==typeof a[d.cancelKeyRequest])return d}return null},MediaPlayer.models.ProtectionModel_21Jan2015=function(){var a=null,b=null,c=[],d=function(a,b){var c=this;!function(b){var e=a[b].ks,f=a[b].configs;navigator.requestMediaKeySystemAccess(e.systemString,f).then(function(a){var b="function"==typeof a.getConfiguration?a.getConfiguration():null,d=new MediaPlayer.vo.protection.KeySystemAccess(e,b);d.mksa=a,c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,d)})["catch"](function(){++b<a.length?d.call(c,a,b):c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,null,"Key system access denied!")})}(b)},e=function(a){var b=a.session;return b.removeEventListener("keystatuseschange",a),b.removeEventListener("message",a),b.close()},f=function(){var a=this;return{handleEvent:function(b){switch(b.type){case"encrypted":if(b.initData){var c=ArrayBuffer.isView(b.initData)?b.initData.buffer:b.initData;a.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,new MediaPlayer.vo.protection.NeedKey(c,b.initDataType))}}}}},g=null,h=function(a){for(var b=0;b<c.length;b++)if(c[b]===a){c.splice(b,1);break}},i=function(a,b,d){var e=this,f={session:a,initData:b,handleEvent:function(a){switch(a.type){case"keystatuseschange":e.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_STATUSES_CHANGED,this);break;case"message":var b=ArrayBuffer.isView(a.message)?a.message.buffer:a.message;e.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,new MediaPlayer.vo.protection.KeyMessage(this,b,void 0,a.messageType))}},getSessionID:function(){return this.session.sessionId},getExpirationTime:function(){return this.session.expiration},getKeyStatuses:function(){return this.session.keyStatuses},getSessionType:function(){return d}};return a.addEventListener("keystatuseschange",f),a.addEventListener("message",f),a.closed.then(function(){h(f),e.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,f.getSessionID())}),c.push(f),f};return{system:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,protectionExt:void 0,keySystem:null,setup:function(){g=f.call(this)},init:function(){},teardown:function(){var b,d=c.length,f=this;if(0!==d)for(var i=function(b){h(b),0===c.length&&(a?(a.removeEventListener("encrypted",g),a.setMediaKeys(null).then(function(){f.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE)})):f.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE))},j=0;d>j;j++)b=c[j],function(a){b.session.closed.then(function(){i(a)}),e(b)["catch"](function(){i(a)})}(b);else this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE)},getAllInitData:function(){for(var a=[],b=0;b<c.length;b++)a.push(c[b].initData);return a},requestKeySystemAccess:function(a){d.call(this,a,0)},selectKeySystem:function(c){var d=this;c.mksa.createMediaKeys().then(function(e){d.keySystem=c.keySystem,b=e,a&&a.setMediaKeys(b),d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED)})["catch"](function(){d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,null,"Error selecting keys system ("+c.keySystem.systemString+")! Could not create MediaKeys -- TODO")})},setMediaElement:function(c){a!==c&&(a&&(a.removeEventListener("encrypted",g),a.setMediaKeys(null)),a=c,a&&(a.addEventListener("encrypted",g),b&&a.setMediaKeys(b)))},setServerCertificate:function(a){if(!this.keySystem||!b)throw new Error("Can not set server certificate until you have selected a key system");var c=this;b.setServerCertificate(a).then(function(){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED)})["catch"](function(a){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_SERVER_CERTIFICATE_UPDATED,null,"Error updating server certificate -- "+a.name)})},createKeySession:function(a,c){if(!this.keySystem||!b)throw new Error("Can not create sessions until you have selected a key system");var d=b.createSession(c),e=i.call(this,d,a,c),f=this;d.generateRequest("cenc",a).then(function(){f.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,e)})["catch"](function(a){h(e),f.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,null,"Error generating key request -- "+a.name)})},updateKeySession:function(a,b){var c=a.session,d=this;this.protectionExt.isClearKey(this.keySystem)&&(b=b.toJWK()),c.update(b)["catch"](function(b){d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,new MediaPlayer.vo.protection.KeyError(a,"Error sending update() message! "+b.name))})},loadKeySession:function(a){if(!this.keySystem||!b)throw new Error("Can not load sessions until you have selected a key system");var c=b.createSession(),d=this;c.load(a).then(function(b){if(b){var e=i.call(this,c);d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,e)}else d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,null,"Could not load session! Invalid Session ID ("+a+")")})["catch"](function(b){d.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,null,"Could not load session ("+a+")! "+b.name)})},removeKeySession:function(a){var b=a.session,c=this;b.remove().then(function(){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,a.getSessionID())},function(b){c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_REMOVED,null,"Error removing session ("+a.getSessionID()+"). "+b.name)})},closeKeySession:function(a){var b=this;e(a)["catch"](function(c){h(a),b.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,null,"Error closing session ("+a.getSessionID()+") "+c.name)})}}},MediaPlayer.models.ProtectionModel_21Jan2015.detect=function(a){return void 0===a.onencrypted||void 0===a.mediaKeys?!1:void 0===navigator.requestMediaKeySystemAccess||"function"!=typeof navigator.requestMediaKeySystemAccess?!1:!0},MediaPlayer.models.ProtectionModel_21Jan2015.prototype={constructor:MediaPlayer.models.ProtectionModel_21Jan2015},MediaPlayer.models.ProtectionModel_3Feb2014=function(){var a=null,b=null,c=null,d=null,e=[],f=function(){var a=this;return{handleEvent:function(b){switch(b.type){case d.needkey:if(b.initData){var c=ArrayBuffer.isView(b.initData)?b.initData.buffer:b.initData;a.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_NEED_KEY,new MediaPlayer.vo.protection.NeedKey(c,"cenc"))}}}}},g=null,h=function(){var c=null,e=function(){a.removeEventListener("loadedmetadata",c),a[d.setMediaKeys](b),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_VIDEO_ELEMENT_SELECTED)};a.readyState>=1?e.call(this):(c=e.bind(this),a.addEventListener("loadedmetadata",c))},i=function(a,b){var c=this;return{session:a,initData:b,handleEvent:function(a){switch(a.type){case d.error:var b="KeyError";c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ERROR,new MediaPlayer.vo.protection.KeyError(this,b));break;case d.message:var e=ArrayBuffer.isView(a.message)?a.message.buffer:a.message;c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_MESSAGE,new MediaPlayer.vo.protection.KeyMessage(this,e,a.destinationURL));break;case d.ready:c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_ADDED,this);break;case d.close:c.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CLOSED,this.getSessionID())}},getSessionID:function(){return this.session.sessionId},getExpirationTime:function(){return NaN},getSessionType:function(){return"temporary"}}};return{system:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,protectionExt:void 0,keySystem:null,setup:function(){g=f.call(this)},init:function(){var a=document.createElement("video");d=MediaPlayer.models.ProtectionModel_3Feb2014.detect(a)},teardown:function(){try{for(var b=0;b<e.length;b++)this.closeKeySession(e[b]);a&&a.removeEventListener(d.needkey,g),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE)}catch(c){this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_TEARDOWN_COMPLETE,null,"Error tearing down key sessions and MediaKeys! -- "+c.message)}},getAllInitData:function(){for(var a=[],b=0;b<e.length;b++)a.push(e[b].initData);return a},requestKeySystemAccess:function(a){for(var b=!1,c=0;c<a.length;c++)for(var e=a[c].ks.systemString,f=a[c].configs,g=null,h=null,i=0;i<f.length;i++){var j=f[i].audioCapabilities,k=f[i].videoCapabilities;if(j&&0!==j.length){g=[];for(var l=0;l<j.length;l++)window[d.MediaKeys].isTypeSupported(e,j[l].contentType)&&g.push(j[l])}if(k&&0!==k.length){h=[];for(var m=0;m<k.length;m++)window[d.MediaKeys].isTypeSupported(e,k[m].contentType)&&h.push(k[m])}if(!(!g&&!h||g&&0===g.length||h&&0===h.length)){b=!0;var n=new MediaPlayer.vo.protection.KeySystemConfiguration(g,h),o=this.protectionExt.getKeySystemBySystemString(e),p=new MediaPlayer.vo.protection.KeySystemAccess(o,n);this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,p);break}}b||this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_ACCESS_COMPLETE,null,"Key system access denied! -- No valid audio/video content configurations detected!")},selectKeySystem:function(e){try{b=e.mediaKeys=new window[d.MediaKeys](e.keySystem.systemString),this.keySystem=e.keySystem,c=e,a&&h.call(this),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED)}catch(f){this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SYSTEM_SELECTED,null,"Error selecting keys system ("+this.keySystem.systemString+")! Could not create MediaKeys -- TODO")}},setMediaElement:function(c){a!==c&&(a&&a.removeEventListener(d.needkey,g),a=c,a&&(a.addEventListener(d.needkey,g),b&&h.call(this)))},createKeySession:function(a){if(!this.keySystem||!b||!c)throw new Error("Can not create sessions until you have selected a key system");var f=c.ksConfiguration.videoCapabilities[0].contentType,g=b.createSession(f,new Uint8Array(a)),h=i.call(this,g,a);g.addEventListener(d.error,h),g.addEventListener(d.message,h),g.addEventListener(d.ready,h),g.addEventListener(d.close,h),e.push(h),this.notify(MediaPlayer.models.ProtectionModel.eventList.ENAME_KEY_SESSION_CREATED,h)},updateKeySession:function(a,b){var c=a.session;this.protectionExt.isClearKey(this.keySystem)?c.update(new Uint8Array(b.toJWK())):c.update(new Uint8Array(b))},closeKeySession:function(a){var b=a.session;b.removeEventListener(d.error,a),b.removeEventListener(d.message,a),b.removeEventListener(d.ready,a),b.removeEventListener(d.close,a);for(var c=0;c<e.length;c++)if(e[c]===a){e.splice(c,1);break}b[d.release]()},setServerCertificate:function(){},loadKeySession:function(){},removeKeySession:function(){}}},MediaPlayer.models.ProtectionModel_3Feb2014.APIs=[{setMediaKeys:"setMediaKeys",MediaKeys:"MediaKeys",release:"close",needkey:"needkey",error:"keyerror",message:"keymessage",ready:"keyadded",close:"keyclose"},{setMediaKeys:"msSetMediaKeys",MediaKeys:"MSMediaKeys",release:"close",needkey:"msneedkey",error:"mskeyerror",message:"mskeymessage",ready:"mskeyadded",close:"mskeyclose"}],MediaPlayer.models.ProtectionModel_3Feb2014.detect=function(a){for(var b=MediaPlayer.models.ProtectionModel_3Feb2014.APIs,c=0;c<b.length;c++){var d=b[c];if("function"==typeof a[d.setMediaKeys]&&"function"==typeof window[d.MediaKeys])return d}return null},MediaPlayer.models.ProtectionModel_3Feb2014.prototype={constructor:MediaPlayer.models.ProtectionModel_3Feb2014},MediaPlayer.models.URIQueryAndFragmentModel=function(){"use strict";var a=new MediaPlayer.vo.URIFragmentData,b=[],c=function(c){function d(a,b,c,d){var e=d[0].split(/[=]/);return d.push({key:e[0],value:e[1]}),d.shift(),d}function e(a,c,d){return c>0&&(j&&0===b.length?b=d[c].split(/[&]/):k&&(g=d[c].split(/[&]/))),d}if(!c)return null;var f,g=[],h=new RegExp(/[?]/),i=new RegExp(/[#]/),j=h.test(c),k=i.test(c);return f=c.split(/[?#]/).map(e),b.length>0&&(b=b.reduce(d,null)),g.length>0&&(g=g.reduce(d,null),g.forEach(function(b){a[b.key]=b.value})),c};return{parseURI:c,getURIFragmentData:function(){return a},getURIQueryData:function(){return b},reset:function(){a=new MediaPlayer.vo.URIFragmentData,b=[]}}},MediaPlayer.models.URIQueryAndFragmentModel.prototype={constructor:MediaPlayer.models.URIQueryAndFragmentModel},MediaPlayer.models.VideoModel=function(){"use strict";var a,b,c=[],d=function(){return c.length>0},e=function(b){null===b||a.seeking||(this.setPlaybackRate(0),c[b]!==!0&&(c.push(b),c[b]=!0))},f=function(a){if(null!==a){c[a]=!1;var b=c.indexOf(a);-1!==b&&c.splice(b,1),d()===!1&&this.setPlaybackRate(1)}},g=function(a,b){b?e.call(this,a):f.call(this,a)};return{system:void 0,play:function(){a.play()},pause:function(){a.pause()},isPaused:function(){return a.paused},getPlaybackRate:function(){return a.playbackRate},setPlaybackRate:function(b){!a||a.readyState<2||(a.playbackRate=b)},getCurrentTime:function(){return a.currentTime},setCurrentTime:function(b){if(a.currentTime!=b)try{a.currentTime=b}catch(c){0===a.readyState&&c.code===c.INVALID_STATE_ERR&&setTimeout(function(){a.currentTime=b},400)}},setStallState:function(a,b){g.call(this,a,b)},listen:function(b,c){a.addEventListener(b,c,!1)},unlisten:function(b,c){a.removeEventListener(b,c,!1)},getElement:function(){return a},setElement:function(b){a=b},getTTMLRenderingDiv:function(){return b},setTTMLRenderingDiv:function(a){b=a,b.style.position="absolute",b.style.display="flex",b.style.overflow="hidden",b.style.zIndex=2147483647,b.style.pointerEvents="none",b.style.top=0,b.style.left=0},setSource:function(b){a.src=b}}},MediaPlayer.models.VideoModel.prototype={constructor:MediaPlayer.models.VideoModel},MediaPlayer.dependencies.protection.CommonEncryption={findCencContentProtection:function(a){for(var b=null,c=0;c<a.length;++c){var d=a[c];"urn:mpeg:dash:mp4protection:2011"===d.schemeIdUri.toLowerCase()&&"cenc"===d.value.toLowerCase()&&(b=d)}return b},getPSSHData:function(a){var b=8,c=new DataView(a),d=c.getUint8(b);return b+=20,d>0&&(b+=4+16*c.getUint32(b)),b+=4,a.slice(b)},getPSSHForKeySystem:function(a,b){var c=MediaPlayer.dependencies.protection.CommonEncryption.parsePSSHList(b);return c.hasOwnProperty(a.uuid.toLowerCase())?c[a.uuid.toLowerCase()]:null},parseInitDataFromContentProtection:function(a){return"pssh"in a?BASE64.decodeArray(a.pssh.__text).buffer:null},parsePSSHList:function(a){if(null===a)return[];for(var b=new DataView(a),c=!1,d={},e=0;!c;){var f,g,h,i,j,k=e;if(e>=b.buffer.byteLength)break;if(f=b.getUint32(e),g=e+f,e+=4,1886614376===b.getUint32(e))if(e+=4,h=b.getUint8(e),0===h||1===h){e+=1,e+=3,i="";var l,m;for(l=0;4>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=4,i+="-",l=0;2>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=2,i+="-",l=0;2>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=2,i+="-",l=0;2>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;for(e+=2,i+="-",l=0;6>l;l++)m=b.getUint8(e+l).toString(16),i+=1===m.length?"0"+m:m;e+=6,i=i.toLowerCase(),j=b.getUint32(e),e+=4,d[i]=b.buffer.slice(k,g),e=g}else e=g;else e=g}return d}},MediaPlayer.dependencies.protection.KeySystem=function(){},MediaPlayer.dependencies.protection.KeySystem_Access=function(){"use strict"},MediaPlayer.dependencies.protection.KeySystem_Access.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_Access},MediaPlayer.dependencies.protection.KeySystem_ClearKey=function(){"use strict";var a="org.w3.clearkey",b="1077efec-c0b2-4d02-ace3-3c1e52e2fb4b";return{system:void 0,schemeIdURI:"urn:uuid:"+b,systemString:a,uuid:b,getInitData:MediaPlayer.dependencies.protection.CommonEncryption.parseInitDataFromContentProtection,getRequestHeadersFromMessage:function(){return null},getLicenseRequestFromMessage:function(a){return new Uint8Array(a)},getLicenseServerURLFromInitData:function(){return null}}},MediaPlayer.dependencies.protection.KeySystem_ClearKey.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_ClearKey},MediaPlayer.dependencies.protection.KeySystem_ClearKey.getClearKeysFromProtectionData=function(a,b){var c=null;if(a){for(var d=JSON.parse(String.fromCharCode.apply(null,new Uint8Array(b))),e=[],f=0;f<d.kids.length;f++){var g=d.kids[f],h=a.clearkeys.hasOwnProperty(g)?a.clearkeys[g]:null;if(!h)throw new Error("DRM: ClearKey keyID ("+g+") is not known!");e.push(new MediaPlayer.vo.protection.KeyPair(g,h))}c=new MediaPlayer.vo.protection.ClearKeyKeySet(e)}return c},MediaPlayer.dependencies.protection.KeySystem_PlayReady=function(){"use strict";var a="com.microsoft.playready",b="9a04f079-9840-4286-ab92-e65be0885f95",c="utf16",d=function(a){var b,d,e={},f=new DOMParser,g="utf16"===c?new Uint16Array(a):new Uint8Array(a);b=String.fromCharCode.apply(null,g),d=f.parseFromString(b,"application/xml");for(var h=d.getElementsByTagName("name"),i=d.getElementsByTagName("value"),j=0;j<h.length;j++)e[h[j].childNodes[0].nodeValue]=i[j].childNodes[0].nodeValue;return e.hasOwnProperty("Content")&&(e["Content-Type"]=e.Content,delete e.Content),e},e=function(a){var b,d,e=new DOMParser,f=null,g="utf16"===c?new Uint16Array(a):new Uint8Array(a);if(b=String.fromCharCode.apply(null,g),d=e.parseFromString(b,"application/xml"),d.getElementsByTagName("Challenge")[0]){var h=d.getElementsByTagName("Challenge")[0].childNodes[0].nodeValue;h&&(f=BASE64.decode(h))}return f},f=function(a){if(a)for(var b=new DataView(a),c=b.getUint16(4,!0),d=6,e=new DOMParser,f=0;c>f;f++){var g=b.getUint16(d,!0);d+=2;var h=b.getUint16(d,!0);if(d+=2,1===g){var i=a.slice(d,d+h),j=String.fromCharCode.apply(null,new Uint16Array(i)),k=e.parseFromString(j,"application/xml");if(k.getElementsByTagName("LA_URL")[0]){var l=k.getElementsByTagName("LA_URL")[0].childNodes[0].nodeValue;if(l)return l}if(k.getElementsByTagName("LUI_URL")[0]){var m=k.getElementsByTagName("LUI_URL")[0].childNodes[0].nodeValue;if(m)return m}}else d+=h}return null},g=function(a){var b,c,d,e,f,g=0,h=new Uint8Array([112,115,115,104,0,0,0,0]),i=new Uint8Array([154,4,240,121,152,64,66,134,171,146,230,91,224,136,95,149]),j=null;if("pssh"in a)return MediaPlayer.dependencies.protection.CommonEncryption.parseInitDataFromContentProtection(a);if("pro"in a)j=BASE64.decodeArray(a.pro.__text);else{if(!("prheader"in a))return null;j=BASE64.decodeArray(a.prheader.__text)}return b=j.length,c=4+h.length+i.length+4+b,d=new ArrayBuffer(c),e=new Uint8Array(d),f=new DataView(d),f.setUint32(g,c),g+=4,e.set(h,g),g+=h.length,e.set(i,g),g+=i.length,f.setUint32(g,b),g+=4,e.set(j,g),g+=b,e.buffer};return{schemeIdURI:"urn:uuid:"+b,systemString:a,uuid:b,getInitData:g,getRequestHeadersFromMessage:d,getLicenseRequestFromMessage:e,getLicenseServerURLFromInitData:f,setPlayReadyMessageFormat:function(a){if("utf8"!==a&&"utf16"!==a)throw new Error("Illegal PlayReady message format! -- "+a);c=a}}},MediaPlayer.dependencies.protection.KeySystem_PlayReady.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_PlayReady},MediaPlayer.dependencies.protection.KeySystem_Widevine=function(){"use strict";var a="com.widevine.alpha",b="edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";return{schemeIdURI:"urn:uuid:"+b,systemString:a,uuid:b,getInitData:MediaPlayer.dependencies.protection.CommonEncryption.parseInitDataFromContentProtection,getRequestHeadersFromMessage:function(){return null},getLicenseRequestFromMessage:function(a){return new Uint8Array(a)},getLicenseServerURLFromInitData:function(){return null}}},MediaPlayer.dependencies.protection.KeySystem_Widevine.prototype={constructor:MediaPlayer.dependencies.protection.KeySystem_Widevine},MediaPlayer.dependencies.protection.servers.ClearKey=function(){"use strict";return{getServerURLFromMessage:function(a,b){var c=JSON.parse(String.fromCharCode.apply(null,new Uint8Array(b)));a+="/?";for(var d=0;d<c.kids.length;d++)a+=c.kids[d]+"&";return a=a.substring(0,a.length-1)},getHTTPMethod:function(){return"GET"},getResponseType:function(){return"json"},getLicenseMessage:function(a){if(!a.hasOwnProperty("keys"))return null;var b,c=[];for(b=0;b<a.keys.length;b++){var d=a.keys[b],e=d.kid.replace(/=/g,""),f=d.k.replace(/=/g,"");c.push(new MediaPlayer.vo.protection.KeyPair(e,f))}return new MediaPlayer.vo.protection.ClearKeyKeySet(c)},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}},MediaPlayer.dependencies.protection.servers.ClearKey.prototype={constructor:MediaPlayer.dependencies.protection.servers.ClearKey},MediaPlayer.dependencies.protection.servers.DRMToday=function(){"use strict";var a={"com.widevine.alpha":{responseType:"json",getLicenseMessage:function(a){return BASE64.decodeArray(a.license)},getErrorResponse:function(a){return a}},"com.microsoft.playready":{responseType:"arraybuffer",getLicenseMessage:function(a){return a},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}};return{getServerURLFromMessage:function(a){return a},getHTTPMethod:function(){return"POST"},getResponseType:function(b){return a[b].responseType},getLicenseMessage:function(b,c){return a[c].getLicenseMessage(b)},getErrorResponse:function(b,c){return a[c].getErrorResponse(b)}}},MediaPlayer.dependencies.protection.servers.DRMToday.prototype={constructor:MediaPlayer.dependencies.protection.servers.DRMToday},MediaPlayer.dependencies.protection.servers.LicenseServer=function(){},MediaPlayer.dependencies.protection.servers.PlayReady=function(){"use strict";return{getServerURLFromMessage:function(a){return a},getHTTPMethod:function(){return"POST"},getResponseType:function(){return"arraybuffer"},getLicenseMessage:function(a){return a},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}},MediaPlayer.dependencies.protection.servers.PlayReady.prototype={constructor:MediaPlayer.dependencies.protection.servers.PlayReady},MediaPlayer.dependencies.protection.servers.Widevine=function(){"use strict";return{getServerURLFromMessage:function(a){return a},getHTTPMethod:function(){return"POST"},getResponseType:function(){return"arraybuffer"},getLicenseMessage:function(a){return a},getErrorResponse:function(a){return String.fromCharCode.apply(null,new Uint8Array(a))}}},MediaPlayer.dependencies.protection.servers.Widevine.prototype={constructor:MediaPlayer.dependencies.protection.servers.Widevine},MediaPlayer.rules.ABRRulesCollection=function(){"use strict";var a=[],b=[];return{insufficientBufferRule:void 0,bufferOccupancyRule:void 0,throughputRule:void 0,abandonRequestRule:void 0,getRules:function(c){switch(c){case MediaPlayer.rules.ABRRulesCollection.prototype.QUALITY_SWITCH_RULES:return a;case MediaPlayer.rules.ABRRulesCollection.prototype.ABANDON_FRAGMENT_RULES:return b;default:return null}},setup:function(){a.push(this.insufficientBufferRule),a.push(this.throughputRule),a.push(this.bufferOccupancyRule),b.push(this.abandonRequestRule)}}},MediaPlayer.rules.ABRRulesCollection.prototype={constructor:MediaPlayer.rules.ABRRulesCollection,QUALITY_SWITCH_RULES:"qualitySwitchRules",ABANDON_FRAGMENT_RULES:"abandonFragmentRules"},MediaPlayer.rules.AbandonRequestsRule=function(){"use strict";var a=500,b=1.5,c={},d={},e=function(a,b){c[a]=c[a]||{},c[a][b]=c[a][b]||{}};return{metricsExt:void 0,log:void 0,execute:function(f,g){var h,i=(new Date).getTime(),j=f.getMediaInfo(),k=j.type,l=f.getCurrentValue(),m=f.getTrackInfo(),n=l.data.request,o=f.getStreamProcessor().getABRController(),p=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);if(!isNaN(n.index)){if(e(k,n.index),h=c[k][n.index],
null===h||null===n.firstByteDate||d.hasOwnProperty(h.id))return void g(p);if(void 0===h.firstByteTime&&(h.firstByteTime=n.firstByteDate.getTime(),h.segmentDuration=n.duration,h.bytesTotal=n.bytesTotal,h.id=n.index),h.bytesLoaded=n.bytesLoaded,h.elapsedTime=i-h.firstByteTime,h.bytesLoaded<h.bytesTotal&&h.elapsedTime>=a){if(h.measuredBandwidthInKbps=Math.round(8*h.bytesLoaded/h.elapsedTime),h.estimatedTimeOfDownload=(8*h.bytesTotal*.001/h.measuredBandwidthInKbps).toFixed(2),h.estimatedTimeOfDownload<h.segmentDuration*b||0===m.quality)return void g(p);if(!d.hasOwnProperty(h.id)){var q=o.getQualityForBitrate(j,h.measuredBandwidthInKbps*MediaPlayer.dependencies.AbrController.BANDWIDTH_SAFETY);p=new MediaPlayer.rules.SwitchRequest(q,MediaPlayer.rules.SwitchRequest.prototype.STRONG),d[h.id]=h,this.log("AbandonRequestsRule ( ",k,"frag id",h.id,") is asking to abandon and switch to quality to ",q," measured bandwidth was",h.measuredBandwidthInKbps),delete c[k][h.id]}}else h.bytesLoaded===h.bytesTotal&&delete c[k][h.id]}g(p)},reset:function(){c={},d={}}}},MediaPlayer.rules.AbandonRequestsRule.prototype={constructor:MediaPlayer.rules.AbandonRequestsRule},MediaPlayer.rules.BufferOccupancyRule=function(){"use strict";var a=0;return{log:void 0,metricsModel:void 0,execute:function(b,c){var d=this,e=(new Date).getTime()/1e3,f=b.getMediaInfo(),g=b.getTrackInfo(),h=f.type,i=isNaN(g.fragmentDuration)?2:g.fragmentDuration/2,j=b.getCurrentValue(),k=b.getStreamProcessor(),l=k.getABRController(),m=this.metricsModel.getReadOnlyMetricsFor(h),n=m.BufferLevel.length>0?m.BufferLevel[m.BufferLevel.length-1]:null,o=m.BufferState.length>0?m.BufferState[m.BufferState.length-1]:null,p=!1,q=f.representationCount-1,r=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);return i>e-a||l.getAbandonmentStateFor(h)===MediaPlayer.dependencies.AbrController.ABANDON_LOAD?void c(r):(null!==n&&null!==o&&n.level>o.target&&(p=n.level-o.target>MediaPlayer.dependencies.BufferController.RICH_BUFFER_THRESHOLD,p&&f.representationCount>1&&(r=new MediaPlayer.rules.SwitchRequest(q,MediaPlayer.rules.SwitchRequest.prototype.STRONG))),r.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&r.value!==j&&d.log("BufferOccupancyRule requesting switch to index: ",r.value,"type: ",h," Priority: ",r.priority===MediaPlayer.rules.SwitchRequest.prototype.DEFAULT?"Default":r.priority===MediaPlayer.rules.SwitchRequest.prototype.STRONG?"Strong":"Weak"),void c(r))},reset:function(){a=0}}},MediaPlayer.rules.BufferOccupancyRule.prototype={constructor:MediaPlayer.rules.BufferOccupancyRule},MediaPlayer.rules.InsufficientBufferRule=function(){"use strict";var a={},b=0,c=1e3,d=function(b,c){a[b]=a[b]||{},a[b].state=c,c!==MediaPlayer.dependencies.BufferController.BUFFER_LOADED||a[b].firstBufferLoadedEvent||(a[b].firstBufferLoadedEvent=!0)},e=function(){a={}};return{log:void 0,metricsModel:void 0,playbackController:void 0,setup:function(){this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=e},execute:function(e,f){var g=this,h=(new Date).getTime(),i=e.getMediaInfo().type,j=e.getCurrentValue(),k=g.metricsModel.getReadOnlyMetricsFor(i),l=k.BufferState.length>0?k.BufferState[k.BufferState.length-1]:null,m=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);return c>h-b||null===l?void f(m):(d(i,l.state),l.state===MediaPlayer.dependencies.BufferController.BUFFER_EMPTY&&void 0!==a[i].firstBufferLoadedEvent&&(m=new MediaPlayer.rules.SwitchRequest(0,MediaPlayer.rules.SwitchRequest.prototype.STRONG)),m.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&m.value!==j&&g.log("InsufficientBufferRule requesting switch to index: ",m.value,"type: ",i," Priority: ",m.priority===MediaPlayer.rules.SwitchRequest.prototype.DEFAULT?"Default":m.priority===MediaPlayer.rules.SwitchRequest.prototype.STRONG?"Strong":"Weak"),b=h,void f(m))},reset:function(){a={},b=0}}},MediaPlayer.rules.InsufficientBufferRule.prototype={constructor:MediaPlayer.rules.InsufficientBufferRule},MediaPlayer.rules.ThroughputRule=function(){"use strict";var a=[],b=0,c=2,d=3,e=function(b,c){a[b]=a[b]||[],c!==1/0&&c!==a[b][a[b].length-1]&&a[b].push(c)},f=function(b,e){var f=0,g=e?c:d,h=a[b],i=h.length;if(g=g>i?i:g,i>0){for(var j=i-g,k=0,l=j;i>l;l++)k+=h[l];f=k/g}return h.length>g&&h.shift(),f*MediaPlayer.dependencies.AbrController.BANDWIDTH_SAFETY/1e3};return{log:void 0,metricsExt:void 0,metricsModel:void 0,manifestExt:void 0,manifestModel:void 0,execute:function(a,c){var d,g,h,i=this,j=(new Date).getTime()/1e3,k=a.getMediaInfo(),l=k.type,m=a.getCurrentValue(),n=a.getTrackInfo(),o=i.metricsModel.getReadOnlyMetricsFor(l),p=a.getStreamProcessor(),q=p.getABRController(),r=p.isDynamic(),s=i.metricsExt.getCurrentHttpRequest(o),t=isNaN(n.fragmentDuration)?2:n.fragmentDuration/2,u=o.BufferState.length>0?o.BufferState[o.BufferState.length-1]:null,v=o.BufferLevel.length>0?o.BufferLevel[o.BufferLevel.length-1]:null,w=new MediaPlayer.rules.SwitchRequest(MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,MediaPlayer.rules.SwitchRequest.prototype.WEAK);if(t>j-b||!o||null===s||s.type!==MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE||null===u||null===v)return void c(w);if(d=(s.tfinish.getTime()-s.tresponse.getTime())/1e3,s.trace.length&&(h=Math.round(8*s.trace[s.trace.length-1].b/d),e(l,h)),g=Math.round(f(l,r)),q.setAverageThroughput(l,g),q.getAbandonmentStateFor(l)!==MediaPlayer.dependencies.AbrController.ABANDON_LOAD){if(u.state===MediaPlayer.dependencies.BufferController.BUFFER_LOADED&&(v.level>=2*MediaPlayer.dependencies.BufferController.LOW_BUFFER_THRESHOLD||r)){var x=q.getQualityForBitrate(k,g);w=new MediaPlayer.rules.SwitchRequest(x,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT)}w.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&w.value!==m&&i.log("ThroughputRule requesting switch to index: ",w.value,"type: ",l," Priority: ",w.priority===MediaPlayer.rules.SwitchRequest.prototype.DEFAULT?"Default":w.priority===MediaPlayer.rules.SwitchRequest.prototype.STRONG?"Strong":"Weak","Average throughput",Math.round(g),"kbps")}c(w)},reset:function(){a=[],b=0}}},MediaPlayer.rules.ThroughputRule.prototype={constructor:MediaPlayer.rules.ThroughputRule},MediaPlayer.rules.RulesContext=function(a,b){"use strict";var c=a.getCurrentRepresentationInfo(),d=a;return{getStreamInfo:function(){return c.mediaInfo.streamInfo},getMediaInfo:function(){return c.mediaInfo},getTrackInfo:function(){return c},getCurrentValue:function(){return b},getManifestInfo:function(){return c.mediaInfo.streamInfo.manifestInfo},getStreamProcessor:function(){return d}}},MediaPlayer.rules.RulesContext.prototype={constructor:MediaPlayer.rules.RulesContext},MediaPlayer.rules.RulesController=function(){"use strict";var a={},b=["execute"],c=function(a){return a===this.SCHEDULING_RULE||a===this.ABR_RULE},d=function(a){var c=b.length,d=0;for(d;c>d;d+=1)if(!a.hasOwnProperty(b[d]))return!1;return!0},e=function(a,b){return new MediaPlayer.rules.RulesContext(a,b)},f=function(a){var b=a.execute.bind(a);return a.execute=function(c,d){var e=function(b){d.call(a,new MediaPlayer.rules.SwitchRequest(b.value,b.priority))};b(c,e)},"function"!=typeof a.reset&&(a.reset=function(){}),a},g=function(a,b,c){var e,g,h,i,j,k;for(g in b)if(i=b[g],j=i.length)for(k=0;j>k;k+=1)e=i[k],d.call(this,e)&&(e=f.call(this,e),h=a.getRules(g),c&&(c=!1,h.length=0),this.system.injectInto(e),h.push(e))};return{system:void 0,log:void 0,SCHEDULING_RULE:0,ABR_RULE:1,SYNC_RULE:2,initialize:function(){a[this.ABR_RULE]=this.system.getObject("abrRulesCollection"),a[this.SCHEDULING_RULE]=this.system.getObject("scheduleRulesCollection"),a[this.SYNC_RULE]=this.system.getObject("synchronizationRulesCollection")},setRules:function(b,d){c.call(this,b)&&d&&g.call(this,a[b],d,!0)},addRules:function(b,d){c.call(this,b)&&d&&g.call(this,a[b],d,!1)},applyRules:function(a,b,c,f,g){var h,i,j=a.length,k=j,l={},m=e.call(this,b,f),n=function(a){var b,d;a.value!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(l[a.priority]=g(l[a.priority],a.value)),--j||(l[MediaPlayer.rules.SwitchRequest.prototype.WEAK]!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(d=MediaPlayer.rules.SwitchRequest.prototype.WEAK,b=l[MediaPlayer.rules.SwitchRequest.prototype.WEAK]),l[MediaPlayer.rules.SwitchRequest.prototype.DEFAULT]!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(d=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,b=l[MediaPlayer.rules.SwitchRequest.prototype.DEFAULT]),l[MediaPlayer.rules.SwitchRequest.prototype.STRONG]!==MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE&&(d=MediaPlayer.rules.SwitchRequest.prototype.STRONG,b=l[MediaPlayer.rules.SwitchRequest.prototype.STRONG]),d!=MediaPlayer.rules.SwitchRequest.prototype.STRONG&&d!=MediaPlayer.rules.SwitchRequest.prototype.WEAK&&(d=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT),c({value:void 0!==b?b:f,confidence:d}))};for(l[MediaPlayer.rules.SwitchRequest.prototype.STRONG]=MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,l[MediaPlayer.rules.SwitchRequest.prototype.WEAK]=MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,l[MediaPlayer.rules.SwitchRequest.prototype.DEFAULT]=MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE,i=0;k>i;i+=1)h=a[i],d.call(this,h)?h.execute(m,n):j--},reset:function(){var b,c,d=a[this.ABR_RULE],e=a[this.SCHEDULING_RULE],f=a[this.SYNC_RULE],g=(d.getRules(MediaPlayer.rules.ABRRulesCollection.prototype.QUALITY_SWITCH_RULES)||[]).concat(e.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.NEXT_FRAGMENT_RULES)||[]).concat(e.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_SCHEDULE_RULES)||[]).concat(e.getRules(MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_EXECUTE_RULES)||[]).concat(f.getRules(MediaPlayer.rules.SynchronizationRulesCollection.prototype.TIME_SYNCHRONIZED_RULES)||[]).concat(f.getRules(MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES)||[]),h=g.length;for(c=0;h>c;c+=1)b=g[c],"function"==typeof b.reset&&b.reset();a={}}}},MediaPlayer.rules.RulesController.prototype={constructor:MediaPlayer.rules.RulesController},MediaPlayer.rules.BufferLevelRule=function(){"use strict";var a={},b={},c={},d=function(a){var b=this.metricsExt.getCurrentHttpRequest(a);return null!==b?(b.tresponse.getTime()-b.trequest.getTime())/1e3:0},e=function(a,b,c){var d;return d=c?this.playbackController.getLiveDelay():isNaN(b)||MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME<b&&b>a?Math.max(MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME,a):a>=b?Math.min(b,MediaPlayer.dependencies.BufferController.DEFAULT_MIN_BUFFER_TIME):Math.min(b,a)},f=function(a,b,c){var f=this,g=c.bufferController.getCriticalBufferLevel(),h=f.metricsModel.getReadOnlyMetricsFor("video"),i=f.metricsModel.getReadOnlyMetricsFor("audio"),j=e.call(this,c.bufferController.getMinBufferTime(),b,a),k=j,l=c.bufferController.bufferMax,m=0;return l===MediaPlayer.dependencies.BufferController.BUFFER_SIZE_MIN?m=j:l===MediaPlayer.dependencies.BufferController.BUFFER_SIZE_INFINITY?m=b:l===MediaPlayer.dependencies.BufferController.BUFFER_SIZE_REQUIRED&&(!a&&f.abrController.isPlayingAtTopQuality(c.streamProcessor.getStreamInfo())&&(k=MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY),m=k+Math.max(d.call(f,h),d.call(f,i))),m=Math.min(m,g)},g=function(a,c){return b[a]&&b[a][c]},h=function(b,c){return a[b]&&a[b][c]},i=function(a){var c=a.data.fragmentModel.getContext().streamProcessor.getStreamInfo().id;b[c]=b[c]||{},b[c][a.data.request.mediaType]=!0},j=function(b){var c=b.sender.streamProcessor.getStreamInfo().id;a[c]=a[c]||{},a[c][b.sender.streamProcessor.getType()]=!0},k=function(b){var c=b.sender.streamProcessor.getStreamInfo().id;a[c]=a[c]||{},a[c][b.sender.streamProcessor.getType()]=!1};return{metricsExt:void 0,metricsModel:void 0,abrController:void 0,playbackController:void 0,mediaController:void 0,virtualBuffer:void 0,setup:function(){this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_OUTRUN]=j,this[MediaPlayer.dependencies.BufferController.eventList.ENAME_BUFFER_LEVEL_BALANCED]=k,this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=i},setScheduleController:function(a){var b=a.streamProcessor.getStreamInfo().id;c[b]=c[b]||{},c[b][a.streamProcessor.getType()]=a},execute:function(a,b){var d=a.getStreamInfo(),e=d.id,i=a.getMediaInfo(),j=i.type;if(h(e,j))return void b(new MediaPlayer.rules.SwitchRequest(0,MediaPlayer.rules.SwitchRequest.prototype.STRONG));var k,l=this.metricsModel.getReadOnlyMetricsFor(j),m=this.mediaController.getSwitchMode(),n=this.metricsExt.getCurrentBufferLevel(l)?this.metricsExt.getCurrentBufferLevel(l).level:0,o=this.playbackController.getTime(),p=this.virtualBuffer.getChunks({streamId:e,mediaType:j,appended:!0,mediaInfo:i,forRange:{start:o,end:o+n}}),q=p&&p.length>0?p[p.length-1].bufferedRange.end-o:null,r=m===MediaPlayer.dependencies.MediaController.trackSwitchModes.NEVER_REPLACE?n:q||0,s=c[e][j],t=s.streamProcessor.getCurrentRepresentationInfo(),u=s.streamProcessor.isDynamic(),v=this.metricsExt.getCurrentPlaybackRate(l),w=d.manifestInfo.duration,x=r/Math.max(v,1),y=t.fragmentDuration,z=u?Number.POSITIVE_INFINITY:w-o,A=Math.min(f.call(this,u,w,s),z),B=Math.max(A-x,0);k=Math.ceil(B/y),x>=z&&!g(e,j)&&(k=k||1),b(new MediaPlayer.rules.SwitchRequest(k,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT))},reset:function(){a={},b={},c={}}}},MediaPlayer.rules.BufferLevelRule.prototype={constructor:MediaPlayer.rules.BufferLevelRule},MediaPlayer.rules.PendingRequestsRule=function(){"use strict";var a=3,b={};return{metricsExt:void 0,setScheduleController:function(a){var c=a.streamProcessor.getStreamInfo().id;b[c]=b[c]||{},b[c][a.streamProcessor.getType()]=a},execute:function(c,d){var e=c.getMediaInfo().type,f=c.getStreamInfo().id,g=c.getCurrentValue(),h=b[f][e],i=h.getFragmentModel(),j=i.getRequests({state:[MediaPlayer.dependencies.FragmentModel.states.PENDING,MediaPlayer.dependencies.FragmentModel.states.LOADING]}),k=i.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.REJECTED}),l=k.length,m=j.length,n=Math.max(g-m,0);return l>0?void d(new MediaPlayer.rules.SwitchRequest(l,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT)):m>a?void d(new MediaPlayer.rules.SwitchRequest(0,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT)):0===g?void d(new MediaPlayer.rules.SwitchRequest(n,MediaPlayer.rules.SwitchRequest.prototype.NO_CHANGE)):void d(new MediaPlayer.rules.SwitchRequest(n,MediaPlayer.rules.SwitchRequest.prototype.DEFAULT))},reset:function(){b={}}}},MediaPlayer.rules.PendingRequestsRule.prototype={constructor:MediaPlayer.rules.PendingRequestsRule},MediaPlayer.rules.PlaybackTimeRule=function(){"use strict";var a={},b={},c=function(b){setTimeout(function(){var c=b.data.seekTime;a.audio=c,a.video=c,a.fragmentedText=c},0)};return{adapter:void 0,sourceBufferExt:void 0,virtualBuffer:void 0,playbackController:void 0,textSourceBuffer:void 0,setup:function(){this[MediaPlayer.dependencies.PlaybackController.eventList.ENAME_PLAYBACK_SEEKING]=c},setScheduleController:function(a){var c=a.streamProcessor.getStreamInfo().id;b[c]=b[c]||{},b[c][a.streamProcessor.getType()]=a},execute:function(c,d){var e,f,g,h=c.getMediaInfo(),i=h.type,j=c.getStreamInfo().id,k=b[j][i],l=.1,m=b[j][i].streamProcessor,n=m.getCurrentRepresentationInfo(),o=a?a[i]:null,p=void 0!==o&&null!==o,q=p?MediaPlayer.rules.SwitchRequest.prototype.STRONG:MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,r=k.getFragmentModel().getRequests({state:MediaPlayer.dependencies.FragmentModel.states.REJECTED})[0],s=!!r&&!p,t=m.getIndexHandlerTime(),u=this.playbackController.getTime(),v=r?r.startTime+r.duration:null,w=!p&&r&&(v>u&&r.startTime<=t||isNaN(t)),x=m.bufferController.getBuffer(),y=null;if(f=p?o:w?r.startTime:t,!p&&!r&&f>u+MediaPlayer.dependencies.BufferController.BUFFER_TIME_AT_TOP_QUALITY)return void d(new MediaPlayer.rules.SwitchRequest(null,q));if(r&&k.getFragmentModel().removeRejectedRequest(r),isNaN(f)||"fragmentedText"===i&&this.textSourceBuffer.getAllTracksAreDisabled())return void d(new MediaPlayer.rules.SwitchRequest(null,q));for(p&&(a[i]=null),x&&(y=this.sourceBufferExt.getBufferRange(m.bufferController.getBuffer(),f),null!==y&&(e=this.virtualBuffer.getChunks({streamId:j,mediaType:i,appended:!0,mediaInfo:h,forRange:y}),e&&e.length>0&&(f=e[e.length-1].bufferedRange.end))),g=this.adapter.getFragmentRequestForTime(m,n,f,{keepIdx:s}),w&&g&&g.index!==r.index&&(g=this.adapter.getFragmentRequestForTime(m,n,r.startTime+r.duration/2+l,{keepIdx:s,timeThreshold:0}));g&&m.getFragmentModel().isFragmentLoadedOrPending(g);){if("complete"===g.action){g=null,m.setIndexHandlerTime(NaN);break}g=this.adapter.getNextFragmentRequest(m,n)}g&&!w&&m.setIndexHandlerTime(g.startTime+g.duration),d(new MediaPlayer.rules.SwitchRequest(g,q))},reset:function(){a={},b={}}}},MediaPlayer.rules.PlaybackTimeRule.prototype={constructor:MediaPlayer.rules.PlaybackTimeRule},MediaPlayer.rules.SameTimeRequestRule=function(){"use strict";var a={},b=function(a,b){var c,e,f,g,h,i=0,j=a.length;for(i;j>i;i+=1)for(f=a[i].getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING}),d.call(this,f,"index"),g=0,h=f.length;h>g;g++){if(c=f[g],isNaN(c.startTime)&&"complete"!==c.action){e=c;break}c.startTime>b&&(!e||c.startTime<e.startTime)&&(e=c)}return e||c},c=function(a,b){var c,d,e=a.length,f=null;for(d=0;e>d;d+=1)c=a[d].getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING,time:b})[0],c&&(!f||c.startTime>f.startTime)&&(f=c);return f},d=function(a,b){var c=function(a,c){return a[b]<c[b]||isNaN(a[b])&&"complete"!==a.action?-1:a[b]>c[b]?1:0};a.sort(c)},e=function(b,c){return a[b]&&a[b][c]?a[b][c]:NaN},f=function(b){var c=b.data.fragmentModel,d=b.data.request,e=c.getContext().streamProcessor.getStreamInfo().id,f=d.mediaType;a[e]=a[e]||{},a[e][f]=d.index-1};return{playbackController:void 0,setup:function(){this[MediaPlayer.dependencies.FragmentController.eventList.ENAME_STREAM_COMPLETED]=f},setFragmentModels:function(a,b){this.fragmentModels=this.fragmentModels||{},this.fragmentModels[b]=a},execute:function(a,d){var f,g,h,i,j,k,l,m,n,o=a.getStreamInfo().id,p=a.getCurrentValue(),q=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,r=this.fragmentModels[o],s=new Date,t=null,u=r?r.length:null,v=!1,w=[];if(!r||!u)return void d(new MediaPlayer.rules.SwitchRequest([],q));if(k=this.playbackController.getTime(),l=c(r,k),j=l||b(r,k)||p,!j)return void d(new MediaPlayer.rules.SwitchRequest([],q));for(i=0;u>i;i+=1)if(g=r[i],f=g.getContext().streamProcessor.getType(),("video"===f||"audio"===f||"fragmentedText"===f)&&(m=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING}),n=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING}).length,!g.getIsPostponed()||isNaN(j.startTime))){if(n>MediaPlayer.dependencies.ScheduleController.LOADING_REQUEST_THRESHOLD)return void d(new MediaPlayer.rules.SwitchRequest([],q));if(t=t||(j===l?k:j.startTime),-1===m.indexOf(j)){if(h=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.PENDING,time:t})[0],h||0!==j.index||(h=m.filter(function(a){return a.index===j.index})[0]),h)w.push(h);else if(h=g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.LOADING,time:t})[0]||g.getRequests({state:MediaPlayer.dependencies.FragmentModel.states.EXECUTED,time:t})[0],!h&&j.index!==e.call(this,o,j.mediaType)&&"fragmentedText"!==f){v=!0;break}}else w.push(j)}return w=w.filter(function(a){return"complete"===a.action||s.getTime()>=a.availabilityStartTime.getTime()}),v?void d(new MediaPlayer.rules.SwitchRequest([],q)):void d(new MediaPlayer.rules.SwitchRequest(w,q))},reset:function(){a={}}}},MediaPlayer.rules.SameTimeRequestRule.prototype={constructor:MediaPlayer.rules.SameTimeRequestRule},MediaPlayer.rules.ScheduleRulesCollection=function(){"use strict";var a=[],b=[],c=[];return{bufferLevelRule:void 0,pendingRequestsRule:void 0,playbackTimeRule:void 0,sameTimeRequestRule:void 0,getRules:function(d){switch(d){case MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_SCHEDULE_RULES:return a;case MediaPlayer.rules.ScheduleRulesCollection.prototype.NEXT_FRAGMENT_RULES:return c;case MediaPlayer.rules.ScheduleRulesCollection.prototype.FRAGMENTS_TO_EXECUTE_RULES:return b;default:return null}},setup:function(){a.push(this.bufferLevelRule),a.push(this.pendingRequestsRule),c.push(this.playbackTimeRule),b.push(this.sameTimeRequestRule)}}},MediaPlayer.rules.ScheduleRulesCollection.prototype={constructor:MediaPlayer.rules.ScheduleRulesCollection,FRAGMENTS_TO_SCHEDULE_RULES:"fragmentsToScheduleRules",NEXT_FRAGMENT_RULES:"nextFragmentRules",FRAGMENTS_TO_EXECUTE_RULES:"fragmentsToExecuteRules"},MediaPlayer.rules.SwitchRequest=function(a,b){"use strict";this.value=a,this.priority=b,void 0===this.value&&(this.value=999),void 0===this.priority&&(this.priority=.5)},MediaPlayer.rules.SwitchRequest.prototype={constructor:MediaPlayer.rules.SwitchRequest,NO_CHANGE:999,DEFAULT:.5,STRONG:1,WEAK:0},MediaPlayer.rules.LiveEdgeBinarySearchRule=function(){"use strict";var a,b,c,d=43200,e=NaN,f=null,g=NaN,h=null,i=!1,j=NaN,k=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT,l=function(a,d,e,f){var g,i=this;if(null===f)g=i.adapter.generateFragmentRequestForTime(c,h,a),l.call(i,a,d,e,g);else{var j=function(c){b.unsubscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,i,j),c.data.exists?d.call(i,c.data.request,a):e.call(i,c.data.request,a)};b.subscribe(MediaPlayer.dependencies.FragmentLoader.eventList.ENAME_CHECK_FOR_EXISTENCE_COMPLETED,i,j),b.checkForExistence(f)}},m=function(b,d){var j,p,q;return i?void o.call(this,!1,d):(q=d-e,j=q>0?e-q:e+Math.abs(q)+g,void(j<f.start&&j>f.end?a(new MediaPlayer.rules.SwitchRequest(null,k)):(p=this.adapter.getFragmentRequestForTime(c,h,j,{ignoreIsFinished:!0}),l.call(this,j,n,m,p))))},n=function(b,d){var m,n,p=b.startTime,q=this;if(!i){if(!h.fragmentDuration)return void a(new MediaPlayer.rules.SwitchRequest(p,k));if(i=!0,f.end=p+2*g,d===e)return n=d+j,m=q.adapter.getFragmentRequestForTime(c,h,n,{ignoreIsFinished:!0}),void l.call(q,n,function(){o.call(q,!0,n)},function(){a(new MediaPlayer.rules.SwitchRequest(n,k))},m)}o.call(this,!0,d)},o=function(b,d){var e,g,i;b?f.start=d:f.end=d,e=Math.floor(f.end-f.start)<=j,e?a(new MediaPlayer.rules.SwitchRequest(b?d:d-j,k)):(i=(f.start+f.end)/2,g=this.adapter.getFragmentRequestForTime(c,h,i,{ignoreIsFinished:!0}),l.call(this,i,n,m,g))};return{metricsExt:void 0,adapter:void 0,timelineConverter:void 0,execute:function(i,o){var p,q,r=this;if(a=o,c=i.getStreamProcessor(),b=c.getFragmentLoader(),h=i.getTrackInfo(),j=h.fragmentDuration,q=h.DVRWindow,e=q.end,h.useCalculatedLiveEdgeTime){var s=r.timelineConverter.getExpectedLiveEdge();return r.timelineConverter.setExpectedLiveEdge(e),void a(new MediaPlayer.rules.SwitchRequest(s,k))}f={start:Math.max(0,e-d),end:e+d},g=Math.floor((q.end-q.start)/2),p=r.adapter.getFragmentRequestForTime(c,h,e,{ignoreIsFinished:!0}),l.call(r,e,n,m,p)},reset:function(){e=NaN,f=null,g=NaN,h=null,i=!1,j=NaN,c=null,b=null}}},MediaPlayer.rules.LiveEdgeBinarySearchRule.prototype={constructor:MediaPlayer.rules.LiveEdgeBinarySearchRule},MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule=function(){"use strict";return{timelineConverter:void 0,execute:function(a,b){var c=a.getTrackInfo(),d=c.DVRWindow.end,e=MediaPlayer.rules.SwitchRequest.prototype.DEFAULT;if(c.useCalculatedLiveEdgeTime){var f=this.timelineConverter.getExpectedLiveEdge();this.timelineConverter.setExpectedLiveEdge(d),b(new MediaPlayer.rules.SwitchRequest(f,e))}else b(new MediaPlayer.rules.SwitchRequest(d,e))}}},MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule.prototype={constructor:MediaPlayer.rules.LiveEdgeWithTimeSynchronizationRule},MediaPlayer.rules.SynchronizationRulesCollection=function(){"use strict";var a=[],b=[];return{liveEdgeBinarySearchRule:void 0,liveEdgeWithTimeSynchronizationRule:void 0,getRules:function(c){switch(c){case MediaPlayer.rules.SynchronizationRulesCollection.prototype.TIME_SYNCHRONIZED_RULES:return a;case MediaPlayer.rules.SynchronizationRulesCollection.prototype.BEST_GUESS_RULES:return b;default:return null}},setup:function(){a.push(this.liveEdgeWithTimeSynchronizationRule),b.push(this.liveEdgeBinarySearchRule)}}},MediaPlayer.rules.SynchronizationRulesCollection.prototype={constructor:MediaPlayer.rules.SynchronizationRulesCollection,TIME_SYNCHRONIZED_RULES:"withAccurateTimeSourceRules",BEST_GUESS_RULES:"bestGuestRules"},MediaPlayer.utils.BoxParser=function(){"use strict";var a=function(a){if(!a)return null;void 0===a.fileStart&&(a.fileStart=0);var b=ISOBoxer.parseBuffer(a),c=this.system.getObject("isoFile");return c.setData(b),c};return{system:void 0,log:void 0,parse:a}},MediaPlayer.utils.BoxParser.prototype={constructor:MediaPlayer.utils.BoxParser},MediaPlayer.utils.Capabilities=function(){"use strict"},MediaPlayer.utils.Capabilities.prototype={constructor:MediaPlayer.utils.Capabilities,system:void 0,log:void 0,supportsMediaSource:function(){"use strict";var a="WebKitMediaSource"in window,b="MediaSource"in window;return a||b},supportsEncryptedMedia:function(){return this.system.hasMapping("protectionModel")},supportsCodec:function(a,b){"use strict";if(!(a instanceof HTMLMediaElement))throw"element must be of type HTMLMediaElement.";var c=a.canPlayType(b);return"probably"===c||"maybe"===c}},MediaPlayer.utils.CustomTimeRanges=function(){return{customTimeRangeArray:[],length:0,add:function(a,b){var c=0;for(c=0;c<this.customTimeRangeArray.length&&a>this.customTimeRangeArray[c].start;c++);for(this.customTimeRangeArray.splice(c,0,{start:a,end:b}),c=0;c<this.customTimeRangeArray.length-1;c++)this.mergeRanges(c,c+1)&&c--;this.length=this.customTimeRangeArray.length},clear:function(){this.customTimeRangeArray=[],this.length=0},remove:function(a,b){for(var c=0;c<this.customTimeRangeArray.length;c++)if(a<=this.customTimeRangeArray[c].start&&b>=this.customTimeRangeArray[c].end)this.customTimeRangeArray.splice(c,1),c--;else{if(a>this.customTimeRangeArray[c].start&&b<this.customTimeRangeArray[c].end){this.customTimeRangeArray.splice(c+1,0,{start:b,end:this.customTimeRangeArray[c].end}),this.customTimeRangeArray[c].end=a;break}a>this.customTimeRangeArray[c].start&&a<this.customTimeRangeArray[c].end?this.customTimeRangeArray[c].end=a:b>this.customTimeRangeArray[c].start&&b<this.customTimeRangeArray[c].end&&(this.customTimeRangeArray[c].start=b)}this.length=this.customTimeRangeArray.length},mergeRanges:function(a,b){var c=this.customTimeRangeArray[a],d=this.customTimeRangeArray[b];return c.start<=d.start&&d.start<=c.end&&c.end<=d.end?(c.end=d.end,this.customTimeRangeArray.splice(b,1),!0):d.start<=c.start&&c.start<=d.end&&d.end<=c.end?(c.start=d.start,this.customTimeRangeArray.splice(b,1),!0):d.start<=c.start&&c.start<=d.end&&c.end<=d.end?(this.customTimeRangeArray.splice(a,1),!0):c.start<=d.start&&d.start<=c.end&&d.end<=c.end?(this.customTimeRangeArray.splice(b,1),!0):!1},start:function(a){return this.customTimeRangeArray[a].start},end:function(a){return this.customTimeRangeArray[a].end}}},MediaPlayer.utils.CustomTimeRanges.prototype={constructor:MediaPlayer.utils.CustomTimeRanges},MediaPlayer.utils.DOMStorage=function(){var a,b=!0,c=!0,d=function(a,b){void 0===b||isNaN(b)||"number"!=typeof b||(MediaPlayer.utils.DOMStorage[a]=b)},e=function(a){if(!this.isSupported(MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL)||!c)return null;var b=MediaPlayer.utils.DOMStorage["LOCAL_STORAGE_"+a.toUpperCase()+"_SETTINGS_KEY"],d=JSON.parse(localStorage.getItem(b))||{},e=(new Date).getTime()-parseInt(d.timestamp)>=MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_MEDIA_SETTINGS_EXPIRATION||!1,f=d.settings;return e&&(localStorage.removeItem(b),f=null),f},f=function(){["video","audio"].forEach(function(a){if(void 0===this.abrController.getInitialBitrateFor(a)){if(this.isSupported(MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL)&&b){var c=MediaPlayer.utils.DOMStorage["LOCAL_STORAGE_"+a.toUpperCase()+"_BITRATE_KEY"],d=JSON.parse(localStorage.getItem(c))||{},e=(new Date).getTime()-parseInt(d.timestamp)>=MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_BITRATE_EXPIRATION||!1,f=parseInt(d.bitrate);isNaN(f)||e?e&&localStorage.removeItem(c):(this.abrController.setInitialBitrateFor(a,f),this.log("Last bitrate played for "+a+" was "+f))}void 0===this.abrController.getInitialBitrateFor(a)&&this.abrController.setInitialBitrateFor(a,MediaPlayer.dependencies.AbrController["DEFAULT_"+a.toUpperCase()+"_BITRATE"])}},this)};return{system:void 0,log:void 0,abrController:void 0,checkInitialBitrate:f,getSavedMediaSettings:e,enableLastBitrateCaching:function(a,c){b=a,d.call(this,"LOCAL_STORAGE_BITRATE_EXPIRATION",c)},enableLastMediaSettingsCaching:function(a,b){c=a,d.call(this,"LOCAL_STORAGE_MEDIA_SETTINGS_EXPIRATION",b)},isSupported:function(b){if(void 0!==a)return a;a=!1;var c,d="1",e="1";try{c=window[b]}catch(f){return this.log("Warning: DOMStorage access denied: "+f.message),a}if(!c||b!==MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL&&b!==MediaPlayer.utils.DOMStorage.STORAGE_TYPE_SESSION)return a;try{c.setItem(d,e),c.removeItem(d),a=!0}catch(f){this.log("Warning: DOMStorage is supported, but cannot be used: "+f.message)}return a}}},MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_VIDEO_BITRATE_KEY="dashjs_vbitrate",MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_AUDIO_BITRATE_KEY="dashjs_abitrate",MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_AUDIO_SETTINGS_KEY="dashjs_asettings",MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_VIDEO_SETTINGS_KEY="dashjs_vsettings",MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_BITRATE_EXPIRATION=36e4,MediaPlayer.utils.DOMStorage.LOCAL_STORAGE_MEDIA_SETTINGS_EXPIRATION=36e4,MediaPlayer.utils.DOMStorage.STORAGE_TYPE_LOCAL="localStorage",MediaPlayer.utils.DOMStorage.STORAGE_TYPE_SESSION="sessionStorage",MediaPlayer.utils.DOMStorage.prototype={constructor:MediaPlayer.utils.DOMStorage},MediaPlayer.utils.Debug=function(){"use strict";var a,b=!0,c=!1,d=!1,e=(new Date).getTime();return{system:void 0,eventBus:void 0,setup:function(){this.system.mapValue("log",this.log),this.system.mapOutlet("log"),a=this.eventBus},setLogTimestampVisible:function(a){c=a},showCalleeName:function(a){d=a},setLogToBrowserConsole:function(a){b=a},getLogToBrowserConsole:function(){return b},log:function(){var f="",g=null;c&&(g=(new Date).getTime(),f+="["+(g-e)+"]"),d&&this.getName&&(f+="["+this.getName()+"]"),this.getMediaType&&this.getMediaType()&&(f+="["+this.getMediaType()+"]"),f.length>0&&(f+=" "),Array.apply(null,arguments).forEach(function(a){f+=a+" "}),b&&console.log(f),a.dispatchEvent({type:"log",message:f})}}},MediaPlayer.utils.EventBus=function(){"use strict";var a,b=function(b,c){var d=(c?"1":"0")+b;return d in a||(a[d]=[]),a[d]},c=function(){a={}};return c(),{addEventListener:function(a,c,d){var e=b(a,d),f=e.indexOf(c);-1===f&&e.push(c)},removeEventListener:function(a,c,d){var e=b(a,d),f=e.indexOf(c);-1!==f&&e.splice(f,1)},dispatchEvent:function(a){for(var c=b(a.type,!1).slice(),d=0;d<c.length;d++)c[d].call(this,a);return!a.defaultPrevented}}},MediaPlayer.utils.IsoFile=function(){"use strict";var a,b={offset:"_offset",size:"size",type:"type"},c={references:"references",timescale:"timescale",earliest_presentation_time:"earliest_presentation_time",first_offset:"first_offset"},d={reference_type:"reference_type",referenced_size:"referenced_size",subsegment_duration:"subsegment_duration"},e={id:"id",value:"value",timescale:"timescale",scheme_id_uri:"scheme_id_uri",presentation_time_delta:"presentation_time_delta",event_duration:"event_duration",message_data:"message_data"},f={timescale:"timescale"},g={base_data_offset:"base_data_offset",sample_description_index:"sample_description_index",default_sample_duration:"default_sample_duration",default_sample_size:"default_sample_size",
default_sample_flags:"default_sample_flags",flags:"flags"},h={version:"version",baseMediaDecodeTime:"baseMediaDecodeTime",flags:"flags"},i={sample_count:"sample_count",first_sample_flags:"first_sample_flags",data_offset:"data_offset",flags:"flags",samples:"samples"},j={sample_size:"sample_size",sample_duration:"sample_duration",sample_composition_time_offset:"sample_composition_time_offset"},k=function(a,b,c){for(var d in c)b[d]=a[c[d]]},l=function(a){if(!a)return null;var l,m,n=new MediaPlayer.vo.IsoBox;switch(k(a,n,b),a.hasOwnProperty("_incomplete")&&(n.isComplete=!a._incomplete),n.type){case"sidx":if(k(a,n,c),n.references)for(l=0,m=n.references.length;m>l;l+=1)k(a.references[l],n.references[l],d);break;case"emsg":k(a,n,e);break;case"mdhd":k(a,n,f);break;case"tfhd":k(a,n,g);break;case"tfdt":k(a,n,h);break;case"trun":if(k(a,n,i),n.samples)for(l=0,m=n.samples.length;m>l;l+=1)k(a.samples[l],n.samples[l],j)}return n},m=function(b){return b&&a&&a.boxes&&0!==a.boxes.length?l.call(this,a.fetch(b)):null},n=function(b){for(var c,d=a.fetchAll(b),e=[],f=0,g=d.length;g>f;f+=1)c=l.call(this,d[f]),c&&e.push(c);return e};return{getBox:m,getBoxes:n,setData:function(b){a=b},getLastBox:function(){if(!a||!a.boxes||!a.boxes.length)return null;var b=a.boxes[a.boxes.length-1].type,c=n.call(this,b);return c[c.length-1]},getOffset:function(){return a._cursor.offset}}},MediaPlayer.utils.IsoFile.prototype={constructor:MediaPlayer.utils.IsoFile},MediaPlayer.utils.VirtualBuffer=function(){var a={},b=function(a,b){var c=function(a,c){return a[b]<c[b]?-1:a[b]>c[b]?1:0};a.sort(c)},c=function(b){var c=b.streamId,d=b.mediaType;return a[c]?a[c][d]:null},d=function(a,b,c){var d,e,f,g,h=[],i=b.start,j=b.end;return a.forEach(function(a){d=a.bufferedRange.start,e=a.bufferedRange.end,f=d>=i&&j>d,g=e>i&&j>=e,(f||g)&&(h.push(a),c&&(a.bufferedRange.start=f?d:i,a.bufferedRange.end=g?e:j))}),h},e=function(){var a={};return a.audio={calculatedBufferedRanges:new MediaPlayer.utils.CustomTimeRanges,actualBufferedRanges:new MediaPlayer.utils.CustomTimeRanges,appended:[]},a.audio[MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE]=[],a.audio[MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE]=[],a.video={calculatedBufferedRanges:new MediaPlayer.utils.CustomTimeRanges,actualBufferedRanges:new MediaPlayer.utils.CustomTimeRanges,appended:[]},a.video[MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE]=[],a.video[MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE]=[],a.fragmentedText={calculatedBufferedRanges:new MediaPlayer.utils.CustomTimeRanges,actualBufferedRanges:new MediaPlayer.utils.CustomTimeRanges,appended:[]},a.fragmentedText[MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE]=[],a.fragmentedText[MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE]=[],a};return{system:void 0,sourceBufferExt:void 0,notify:void 0,subscribe:void 0,unsubscribe:void 0,append:function(c){var d=c.streamId,f=c.mediaInfo.type,g=c.segmentType,h=c.start,i=c.end;a[d]=a[d]||e(),a[d][f][g].push(c),b(a[d][f][g],"index"),isNaN(h)||isNaN(i)||(a[d][f].calculatedBufferedRanges.add(h,i),this.notify(MediaPlayer.utils.VirtualBuffer.eventList.CHUNK_APPENDED,{chunk:c}))},storeAppendedChunk:function(c,d){if(c&&d){var e,f,g=c.streamId,h=c.mediaInfo.type,i=a[g][h].actualBufferedRanges,j=this.getChunks({streamId:g,mediaType:h,appended:!0,start:c.start})[0];if(j?(f=a[g][h].appended.indexOf(j),a[g][h].appended[f]=c):a[g][h].appended.push(c),b(a[g][h].appended,"start"),e=this.sourceBufferExt.getRangeDifference(i,d),!e)return void(j&&(c.bufferedRange=j.bufferedRange));c.bufferedRange=e,i.add(e.start,e.end),j&&(c.bufferedRange.start=Math.min(j.bufferedRange.start,e.start),c.bufferedRange.end=Math.max(j.bufferedRange.end,e.end))}},updateBufferedRanges:function(b,c){if(b){var e,f,g=b.streamId,h=b.mediaType,i=this.getChunks({streamId:g,mediaType:h,appended:!0}),j=[];if(a[g][h].actualBufferedRanges=new MediaPlayer.utils.CustomTimeRanges,!c||0===c.length)return void(a[g][h].appended=[]);for(var k=0,l=c.length;l>k;k+=1)e=c.start(k),f=c.end(k),a[g][h].actualBufferedRanges.add(e,f),j=j.concat(d.call(this,i,{start:e,end:f},!0));a[g][h].appended=j}},getChunks:function(a){var b,e=c.call(this,a),f=a.segmentType,g=a.appended,h=a.removeOrigin,i=a.limit||Number.POSITIVE_INFINITY,j=this.system.getObject("mediaController"),k=0,l=[];return e?(delete a.streamId,delete a.mediaType,delete a.segmentType,delete a.removeOrigin,delete a.limit,delete a.appended,b=g?e.appended:f?e[f]:[],l=b.filter(function(b,c,d){if(k>=i)return!1;for(var f in a){if("mediaInfo"===f)return j.isTracksEqual(b[f],a[f]);if(a.hasOwnProperty(f)&&b[f]!=a[f])return!1}return h&&(e.calculatedBufferedRanges.remove(b.start,b.end),d.splice(c,1)),k+=1,!0}),a.forRange&&(l=d.call(this,l,a.forRange,!1)),l):l},extract:function(a){return a.removeOrigin=!0,this.getChunks(a)},getTotalBufferLevel:function(b){var c=b.type,d=0;for(var e in a)a.hasOwnProperty(e)&&(d+=this.sourceBufferExt.getTotalBufferedTime({buffered:a[e][c].calculatedBufferedRanges}));return d},reset:function(){a={}}}},MediaPlayer.utils.VirtualBuffer.prototype={constructor:MediaPlayer.utils.VirtualBuffer},MediaPlayer.utils.VirtualBuffer.eventList={CHUNK_APPENDED:"chunkAppended"},MediaPlayer.vo.BitrateInfo=function(){"use strict";this.mediaType=null,this.bitrate=null,this.qualityIndex=NaN},MediaPlayer.vo.BitrateInfo.prototype={constructor:MediaPlayer.vo.BitrateInfo},MediaPlayer.vo.DataChunk=function(){"use strict";this.streamId=null,this.mediaInfo=null,this.segmentType=null,this.quality=NaN,this.index=NaN,this.bytes=null,this.start=NaN,this.end=NaN,this.duration=NaN},MediaPlayer.vo.DataChunk.prototype={constructor:MediaPlayer.vo.DataChunk},MediaPlayer.vo.Error=function(a,b,c){"use strict";this.code=a||null,this.message=b||null,this.data=c||null},MediaPlayer.vo.Error.prototype={constructor:MediaPlayer.vo.Error},MediaPlayer.vo.Event=function(){"use strict";this.type=null,this.sender=null,this.data=null,this.error=null,this.timestamp=NaN},MediaPlayer.vo.Event.prototype={constructor:MediaPlayer.vo.Event},MediaPlayer.vo.FragmentRequest=function(){"use strict";this.action="download",this.startTime=NaN,this.mediaType=null,this.mediaInfo=null,this.type=null,this.duration=NaN,this.timescale=NaN,this.range=null,this.url=null,this.requestStartDate=null,this.firstByteDate=null,this.requestEndDate=null,this.quality=NaN,this.index=NaN,this.availabilityStartTime=null,this.availabilityEndTime=null,this.wallStartTime=null,this.bytesLoaded=NaN,this.bytesTotal=NaN},MediaPlayer.vo.FragmentRequest.prototype={constructor:MediaPlayer.vo.FragmentRequest,ACTION_DOWNLOAD:"download",ACTION_COMPLETE:"complete"},MediaPlayer.vo.IsoBox=function(){"use strict";this.offset=NaN,this.type=null,this.size=NaN,this.isComplete=!0},MediaPlayer.vo.IsoBox.prototype={constructor:MediaPlayer.vo.IsoBox},MediaPlayer.vo.ManifestInfo=function(){"use strict";this.DVRWindowSize=NaN,this.loadedTime=null,this.availableFrom=null,this.minBufferTime=NaN,this.duration=NaN,this.isDynamic=!1,this.maxFragmentDuration=null},MediaPlayer.vo.ManifestInfo.prototype={constructor:MediaPlayer.vo.ManifestInfo},MediaPlayer.vo.MediaInfo=function(){"use strict";this.id=null,this.index=null,this.type=null,this.streamInfo=null,this.representationCount=0,this.lang=null,this.viewpoint=null,this.accessibility=null,this.audioChannelConfiguration=null,this.roles=null,this.codec=null,this.mimeType=null,this.contentProtection=null,this.isText=!1,this.KID=null,this.bitrateList=null},MediaPlayer.vo.MediaInfo.prototype={constructor:MediaPlayer.vo.MediaInfo},MediaPlayer.models.MetricsList=function(){"use strict";return{TcpList:[],HttpList:[],RepSwitchList:[],BufferLevel:[],BufferState:[],PlayList:[],DroppedFrames:[],SchedulingInfo:[],DVRInfo:[],ManifestUpdate:[],RequestsQueue:null}},MediaPlayer.models.MetricsList.prototype={constructor:MediaPlayer.models.MetricsList},MediaPlayer.vo.StreamInfo=function(){"use strict";this.id=null,this.index=null,this.start=NaN,this.duration=NaN,this.manifestInfo=null,this.isLast=!0},MediaPlayer.vo.StreamInfo.prototype={constructor:MediaPlayer.vo.StreamInfo},MediaPlayer.vo.TextTrackInfo=function(){"use strict";this.video=null,this.captionData=null,this.label=null,this.lang=null,this.defaultTrack=!1,this.kind=null,this.isFragmented=!1},MediaPlayer.vo.TextTrackInfo.prototype={constructor:MediaPlayer.vo.TextTrackInfo},MediaPlayer.vo.TrackInfo=function(){"use strict";this.id=null,this.quality=null,this.DVRWindow=null,this.fragmentDuration=null,this.mediaInfo=null,this.MSETimeOffset=null},MediaPlayer.vo.TrackInfo.prototype={constructor:MediaPlayer.vo.TrackInfo},MediaPlayer.vo.URIFragmentData=function(){"use strict";this.t=null,this.xywh=null,this.track=null,this.id=null,this.s=null},MediaPlayer.vo.URIFragmentData.prototype={constructor:MediaPlayer.vo.URIFragmentData},MediaPlayer.vo.metrics.BufferLevel=function(){"use strict";this.t=null,this.level=null},MediaPlayer.vo.metrics.BufferLevel.prototype={constructor:MediaPlayer.vo.metrics.BufferLevel},MediaPlayer.vo.metrics.BufferState=function(){"use strict";this.target=null,this.state=MediaPlayer.dependencies.BufferController.BUFFER_EMPTY},MediaPlayer.vo.metrics.BufferState.prototype={constructor:MediaPlayer.vo.metrics.BufferState},MediaPlayer.vo.metrics.DVRInfo=function(){"use strict";this.time=null,this.range=null,this.manifestInfo=null},MediaPlayer.vo.metrics.DVRInfo.prototype={constructor:MediaPlayer.vo.metrics.DVRInfo},MediaPlayer.vo.metrics.DroppedFrames=function(){"use strict";this.time=null,this.droppedFrames=null},MediaPlayer.vo.metrics.DroppedFrames.prototype={constructor:MediaPlayer.vo.metrics.DroppedFrames},MediaPlayer.vo.metrics.HTTPRequest=function(){"use strict";this.stream=null,this.tcpid=null,this.type=null,this.url=null,this.actualurl=null,this.range=null,this.trequest=null,this.tresponse=null,this.tfinish=null,this.responsecode=null,this.interval=null,this.mediaduration=null,this.responseHeaders=null,this.trace=[]},MediaPlayer.vo.metrics.HTTPRequest.prototype={constructor:MediaPlayer.vo.metrics.HTTPRequest},MediaPlayer.vo.metrics.HTTPRequest.Trace=function(){"use strict";this.s=null,this.d=null,this.b=[]},MediaPlayer.vo.metrics.HTTPRequest.Trace.prototype={constructor:MediaPlayer.vo.metrics.HTTPRequest.Trace},MediaPlayer.vo.metrics.HTTPRequest.MPD_TYPE="MPD",MediaPlayer.vo.metrics.HTTPRequest.XLINK_EXPANSION_TYPE="XLink Expansion",MediaPlayer.vo.metrics.HTTPRequest.INIT_SEGMENT_TYPE="Initialization Segment",MediaPlayer.vo.metrics.HTTPRequest.INDEX_SEGMENT_TYPE="Index Segment",MediaPlayer.vo.metrics.HTTPRequest.MEDIA_SEGMENT_TYPE="Media Segment",MediaPlayer.vo.metrics.HTTPRequest.BITSTREAM_SWITCHING_SEGMENT_TYPE="Bitstream Switching Segment",MediaPlayer.vo.metrics.HTTPRequest.OTHER_TYPE="other",MediaPlayer.vo.metrics.ManifestUpdate=function(){"use strict";this.mediaType=null,this.type=null,this.requestTime=null,this.fetchTime=null,this.availabilityStartTime=null,this.presentationStartTime=0,this.clientTimeOffset=0,this.currentTime=null,this.buffered=null,this.latency=0,this.streamInfo=[],this.trackInfo=[]},MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo=function(){"use strict";this.id=null,this.index=null,this.start=null,this.duration=null},MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo=function(){"use strict";this.id=null,this.index=null,this.mediaType=null,this.streamIndex=null,this.presentationTimeOffset=null,this.startNumber=null,this.fragmentInfoType=null},MediaPlayer.vo.metrics.ManifestUpdate.prototype={constructor:MediaPlayer.vo.metrics.ManifestUpdate},MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo.prototype={constructor:MediaPlayer.vo.metrics.ManifestUpdate.StreamInfo},MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo.prototype={constructor:MediaPlayer.vo.metrics.ManifestUpdate.TrackInfo},MediaPlayer.vo.metrics.PlayList=function(){"use strict";this.stream=null,this.start=null,this.mstart=null,this.starttype=null,this.trace=[]},MediaPlayer.vo.metrics.PlayList.Trace=function(){"use strict";this.representationid=null,this.subreplevel=null,this.start=null,this.mstart=null,this.duration=null,this.playbackspeed=null,this.stopreason=null},MediaPlayer.vo.metrics.PlayList.prototype={constructor:MediaPlayer.vo.metrics.PlayList},MediaPlayer.vo.metrics.PlayList.INITIAL_PLAY_START_REASON="initial_start",MediaPlayer.vo.metrics.PlayList.SEEK_START_REASON="seek",MediaPlayer.vo.metrics.PlayList.Trace.prototype={constructor:MediaPlayer.vo.metrics.PlayList.Trace()},MediaPlayer.vo.metrics.PlayList.Trace.USER_REQUEST_STOP_REASON="user_request",MediaPlayer.vo.metrics.PlayList.Trace.REPRESENTATION_SWITCH_STOP_REASON="representation_switch",MediaPlayer.vo.metrics.PlayList.Trace.END_OF_CONTENT_STOP_REASON="end_of_content",MediaPlayer.vo.metrics.PlayList.Trace.REBUFFERING_REASON="rebuffering",MediaPlayer.vo.metrics.RepresentationSwitch=function(){"use strict";this.t=null,this.mt=null,this.to=null,this.lto=null},MediaPlayer.vo.metrics.RepresentationSwitch.prototype={constructor:MediaPlayer.vo.metrics.RepresentationSwitch},MediaPlayer.vo.metrics.RequestsQueue=function(){"use strict";this.pendingRequests=[],this.loadingRequests=[],this.executedRequests=[],this.rejectedRequests=[]},MediaPlayer.vo.metrics.RequestsQueue.prototype={constructor:MediaPlayer.vo.metrics.RequestsQueue},MediaPlayer.vo.metrics.SchedulingInfo=function(){"use strict";this.mediaType=null,this.t=null,this.type=null,this.startTime=null,this.availabilityStartTime=null,this.duration=null,this.quality=null,this.range=null,this.state=null},MediaPlayer.vo.metrics.SchedulingInfo.prototype={constructor:MediaPlayer.vo.metrics.SchedulingInfo},MediaPlayer.vo.metrics.TCPConnection=function(){"use strict";this.tcpid=null,this.dest=null,this.topen=null,this.tclose=null,this.tconnect=null},MediaPlayer.vo.metrics.TCPConnection.prototype={constructor:MediaPlayer.vo.metrics.TCPConnection},MediaPlayer.vo.protection.ClearKeyKeySet=function(a,b){if(b&&"persistent"!==b&&"temporary"!==b)throw new Error("Invalid ClearKey key set type!  Must be one of 'persistent' or 'temporary'");this.keyPairs=a,this.type=b,this.toJWK=function(){var a,b=this.keyPairs.length,c={};for(c.keys=[],a=0;b>a;a++){var d={kty:"oct",alg:"A128KW",kid:this.keyPairs[a].keyID,k:this.keyPairs[a].key};c.keys.push(d)}this.type&&(c.type=this.type);var e=JSON.stringify(c),f=e.length,g=new ArrayBuffer(f),h=new Uint8Array(g);for(a=0;f>a;a++)h[a]=e.charCodeAt(a);return g}},MediaPlayer.vo.protection.ClearKeyKeySet.prototype={constructor:MediaPlayer.vo.protection.ClearKeyKeySet},MediaPlayer.vo.protection.KeyError=function(a,b){"use strict";this.sessionToken=a,this.error=b},MediaPlayer.vo.protection.KeyError.prototype={constructor:MediaPlayer.vo.protection.KeyError},MediaPlayer.vo.protection.KeyMessage=function(a,b,c,d){"use strict";this.sessionToken=a,this.message=b,this.defaultURL=c,this.messageType=d?d:"license-request"},MediaPlayer.vo.protection.KeyMessage.prototype={constructor:MediaPlayer.vo.protection.KeyMessage},MediaPlayer.vo.protection.KeyPair=function(a,b){"use strict";this.keyID=a,this.key=b},MediaPlayer.vo.protection.KeyPair.prototype={constructor:MediaPlayer.vo.protection.KeyPair},MediaPlayer.vo.protection.KeySystemAccess=function(a,b){this.keySystem=a,this.ksConfiguration=b},MediaPlayer.vo.protection.KeySystemAccess.prototype={constructor:MediaPlayer.vo.protection.KeySystemAccess},MediaPlayer.vo.protection.KeySystemConfiguration=function(a,b,c,d,e){this.initDataTypes=["cenc"],this.audioCapabilities=a,this.videoCapabilities=b,this.distinctiveIdentifier=c,this.persistentState=d,this.sessionTypes=e},MediaPlayer.vo.protection.KeySystemConfiguration.prototype={constructor:MediaPlayer.vo.protection.KeySystemConfiguration},MediaPlayer.vo.protection.LicenseRequestComplete=function(a,b,c){"use strict";this.message=a,this.sessionToken=b,this.messageType=c?c:"license-request"},MediaPlayer.vo.protection.LicenseRequestComplete.prototype={constructor:MediaPlayer.vo.protection.LicenseRequestComplete},MediaPlayer.vo.protection.MediaCapability=function(a,b){this.contentType=a,this.robustness=b},MediaPlayer.vo.protection.MediaCapability.prototype={constructor:MediaPlayer.vo.protection.MediaCapability},MediaPlayer.vo.protection.NeedKey=function(a,b){this.initData=a,this.initDataType=b},MediaPlayer.vo.protection.NeedKey.prototype={constructor:MediaPlayer.vo.protection.NeedKey},MediaPlayer.vo.protection.ProtectionData=function(a,b,c){this.serverURL=a,this.httpRequestHeaders=b,this.clearkeys=c},MediaPlayer.vo.protection.ProtectionData.prototype={constructor:MediaPlayer.vo.protection.ProtectionData},MediaPlayer.vo.protection.SessionToken=function(){};
/*! videojs-contrib-dash - v1.1.1 - 2015-08-27
 * Copyright (c) 2015 Brightcove  */
(function(window, videojs) {
  'use strict';

  var
    isArray = function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },
    isObject = function (a) {
      return Object.prototype.toString.call(a) === '[object Object]';
    },
    mergeOptions = function(obj1, obj2){
      var key, val1, val2, res;

      // make a copy of obj1 so we're not overwriting original values.
      // like prototype.options_ and all sub options objects
      res = {};

      for (key in obj2){
        if (obj2.hasOwnProperty(key)) {
          val1 = obj1[key];
          val2 = obj2[key];

          // Check if both properties are pure objects and do a deep merge if so
          if (isObject(val1) && isObject(val2)) {
            obj1[key] = mergeOptions(val1, val2);
          } else {
            obj1[key] = obj2[key];
          }
        }
      }
      return obj1;
    };

  /**
   * videojs-contrib-dash
   *
   * Use Dash.js to playback DASH content inside of Video.js via a SourceHandler
   */
  function Html5DashJS (source, tech) {
    var
      options = tech.options(),
      manifestSource;

    this.tech_ = tech;
    this.el_ = tech.el();
    this.elParent_ = this.el_.parentNode;

    // Do nothing if the src is falsey
    if (!source.src) {
      return;
    }

    // While the manifest is loading and Dash.js has not finished initializing
    // we must defer events and functions calls with isReady_ and then `triggerReady`
    // again later once everything is setup
    tech.isReady_ = false;

    manifestSource = source.src;
    this.keySystemOptions_ = Html5DashJS.buildDashJSProtData(source.keySystemOptions);

    // We have to hide errors since SRC_UNSUPPORTED is thrown by the video element when
    // we set src = '' in order to clear the mediaKeys
    Html5DashJS.hideErrors(this.elParent_);

    // Must be before anything is initialized since we are overridding a global object
    // injection
    if (Html5DashJS.useVideoJSDebug) {
      Html5DashJS.useVideoJSDebug(videojs);
    }

    // Save the context after the first initialization for subsequent instances
    Html5DashJS.context_ = Html5DashJS.context_ || new Dash.di.DashContext();

    // But make a fresh MediaPlayer each time the sourceHandler is used
    this.mediaPlayer_ = new MediaPlayer(Html5DashJS.context_);

    // Must run controller before these two lines or else there is no
    // element to bind to.
    this.mediaPlayer_.startup();
    this.mediaPlayer_.attachView(this.el_);

    // Dash.js autoplays by default
    if (!options.autoplay) {
      this.mediaPlayer_.setAutoPlay(false);
    }

    // Fetches and parses the manifest - WARNING the callback is non-standard "error-last" style
    this.mediaPlayer_.retrieveManifest(manifestSource, videojs.bind(this, this.initializeDashJS));
  }

  Html5DashJS.prototype.initializeDashJS = function (manifest, err) {
    var manifestProtectionData = {};

    if (err) {
      Html5DashJS.showErrors(this.elParent_);
      this.tech_.triggerReady();
      this.dispose();
      return;
    }

    // If we haven't received protection data from the outside world try to get it from the manifest
    // We merge the two allowing the manifest to override any keySystemOptions provided via src()
    if (Html5DashJS.getWidevineProtectionData) {
      manifestProtectionData = Html5DashJS.getWidevineProtectionData(manifest);
      this.keySystemOptions_ = mergeOptions(
        this.keySystemOptions_,
        manifestProtectionData);
    }

    // We have to reset any mediaKeys before the attachSource call below
    this.resetSrc_(videojs.bind(this, function afterMediaKeysReset () {
      Html5DashJS.showErrors(this.elParent_);

      // Attach the source with any protection data
      this.mediaPlayer_.attachSource(manifest, null, this.keySystemOptions_);

      this.tech_.triggerReady();
    }));
  };

  /*
   * Add a css-class that is used to temporarily hide the error dialog while so that
   * we don't see a flash of the dialog box when we remove the video element's src
   * to reset MediaKeys in resetSrc_
   */
  Html5DashJS.hideErrors = function (el) {
    el.className += 'vjs-dashjs-hide-errors';
  };

  /*
   * Remove the css-class above to enable the error dialog to be shown once again
   */
  Html5DashJS.showErrors = function (el) {
    // The video element's src is set asynchronously so we have to wait a while
    // before we unhide any errors
    // 250ms is arbitrary but I haven't seen dash.js take longer than that to initialize
    // in my testing
    setTimeout(function () {
      el.className = el.className.replace('vjs-dashjs-hide-errors', '');
    }, 250);
  };

  /*
   * Iterate over the `keySystemOptions` array and convert each object into
   * the type of object Dash.js expects in the `protData` argument.
   *
   * Also rename 'licenseUrl' property in the options to an 'laURL' property
   */
  Html5DashJS.buildDashJSProtData = function (keySystemOptions) {
    var
      keySystem,
      options,
      i,
      output = {};

    if (!keySystemOptions || !isArray(keySystemOptions)) {
      return output;
    }

    for (i = 0; i < keySystemOptions.length; i++) {
      keySystem = keySystemOptions[i];
      options = mergeOptions({}, keySystem.options);

      if (options.licenseUrl) {
        options.laURL = options.licenseUrl;
        delete options.licenseUrl;
      }

      output[keySystem.name] = options;
    }

    return output;
  };

  /*
   * Helper function to clear any EME keys that may have been set on the video element
   *
   * The MediaKeys has to be explicitly set to null before any DRM content can be loaded into
   * a video element that already contained DRM content.
   */
  Html5DashJS.prototype.resetSrc_ = function (callback) {
    // In Chrome, MediaKeys can NOT be changed when a src is loaded in the video element
    // Dash.js has a bug where it doesn't correctly reset the data so we do it manually
    // The order of these two lines is important. The video element's src must be reset
    // to allow `mediaKeys` to changed otherwise a DOMException is thrown.
    if (this.el_) {
      this.el_.src = '';
      if (this.el_.setMediaKeys) {
        this.el_.setMediaKeys(null).then(callback, callback);
      } else {
        callback();
      }
    }
  };

  Html5DashJS.prototype.dispose = function () {
    if (this.mediaPlayer_) {
      this.mediaPlayer_.reset();
    }
    this.resetSrc_(function noop(){});
  };

  // Only add the SourceHandler if the browser supports MediaSourceExtensions
  if (!!window.MediaSource) {
    videojs.Html5.registerSourceHandler({
      canHandleSource: function (source) {
        var dashTypeRE = /^application\/dash\+xml/i;
        var dashExtRE = /\.mpd/i;

        if (dashTypeRE.test(source.type)) {
          return 'probably';
        } else if (dashExtRE.test(source.src)){
          return 'maybe';
        } else {
          return '';
        }
      },

      handleSource: function (source, tech) {
        return new Html5DashJS(source, tech);
      }
    }, 0);
  }

  videojs.Html5DashJS = Html5DashJS;
})(window, window.videojs);

/*! videojs-chromecast - v1.1.1 - 2015-09-10
* https://github.com/kim-company/videojs-chromecast
* Copyright (c) 2015 KIM Keep In Mind GmbH, srl; Licensed MIT */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  vjs.addLanguage("de", {
    "CASTING TO": "WIEDERGABE AUF"
  });

  vjs.addLanguage("it", {
    "CASTING TO": "PLAYBACK SU"
  });

  vjs.plugin("chromecast", function(options) {
    this.chromecastComponent = new vjs.ChromecastComponent(this, options);
    return this.controlBar.addChild(this.chromecastComponent);
  });

  vjs.ChromecastComponent = (function(superClass) {
    extend(ChromecastComponent, superClass);

    ChromecastComponent.prototype.buttonText = "Chromecast";

    ChromecastComponent.prototype.inactivityTimeout = 2000;

    ChromecastComponent.prototype.apiInitialized = false;

    ChromecastComponent.prototype.apiSession = null;

    ChromecastComponent.prototype.apiMedia = null;

    ChromecastComponent.prototype.casting = false;

    ChromecastComponent.prototype.paused = true;

    ChromecastComponent.prototype.muted = false;

    ChromecastComponent.prototype.currentVolume = 1;

    ChromecastComponent.prototype.currentMediaTime = 0;

    ChromecastComponent.prototype.timer = null;

    ChromecastComponent.prototype.timerStep = 1000;

    function ChromecastComponent(player, settings) {
      this.settings = settings;
      ChromecastComponent.__super__.constructor.call(this, player, this.settings);
      if (!player.controls()) {
        this.disable();
      }
      this.hide();
      this.initializeApi();
    }

    ChromecastComponent.prototype.initializeApi = function() {
      var apiConfig, appId, sessionRequest;
      if (!vjs.IS_CHROME) {
        return;
      }
      if (!chrome.cast || !chrome.cast.isAvailable) {
        vjs.log("Cast APIs not available. Retrying...");
        setTimeout(this.initializeApi.bind(this), 1000);
        return;
      }
      vjs.log("Cast APIs are available");
      appId = this.settings.appId || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
      sessionRequest = new chrome.cast.SessionRequest(appId);
      apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionJoinedListener, this.receiverListener.bind(this));
      return chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.castError);
    };

    ChromecastComponent.prototype.sessionJoinedListener = function(session) {
      return console.log("Session joined");
    };

    ChromecastComponent.prototype.receiverListener = function(availability) {
      if (availability === "available") {
        return this.show();
      }
    };

    ChromecastComponent.prototype.onInitSuccess = function() {
      return this.apiInitialized = true;
    };

    ChromecastComponent.prototype.castError = function(castError) {
      return vjs.log("Cast Error: " + (JSON.stringify(castError)));
    };

    ChromecastComponent.prototype.doLaunch = function() {
      vjs.log("Cast video: " + (this.player_.currentSrc()));
      if (this.apiInitialized) {
        return chrome.cast.requestSession(this.onSessionSuccess.bind(this), this.castError);
      } else {
        return vjs.log("Session not initialized");
      }
    };

    ChromecastComponent.prototype.onSessionSuccess = function(session) {
      var image, key, loadRequest, mediaInfo, ref, ref1, value;
      vjs.log("Session initialized: " + session.sessionId);
      this.selectedTrack = null;
      this.apiSession = session;
      this.addClass("connected");
      mediaInfo = new chrome.cast.media.MediaInfo(this.player_.currentSrc(), this.player_.currentType());
      if (this.settings.metadata) {
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        ref = this.settings.metadata;
        for (key in ref) {
          value = ref[key];
          mediaInfo.metadata[key] = value;
        }
        if (this.player_.options_.poster) {
          image = new chrome.cast.Image(this.player_.options_.poster);
          mediaInfo.metadata.images = [image];
        }
      }
      this.plTracks = this.settings.tracks;
      if (this.plTracks) {
        this.nbTrack = 1;
        this.tracks = [];
        ref1 = this.plTracks;
        for (key in ref1) {
          value = ref1[key];
          this.track = new chrome.cast.media.Track(this.nbTrack, chrome.cast.media.TrackType.TEXT);
          this.track.trackContentId = value.src;
          this.track.trackContentType = value.type;
          this.track.subtype = chrome.cast.media.TextTrackType.CAPTIONS;
          this.track.name = value.label;
          this.track.language = value.language;
          if (value.mode === 'showing') {
            this.selectedTrack = this.track;
          }
          this.track.customData = null;
          this.tracks.push(this.track);
          ++this.nbTrack;
        }
        mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
        mediaInfo.tracks = this.tracks;
      }
      loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
      loadRequest.autoplay = true;
      loadRequest.currentTime = this.player_.currentTime();
      this.apiSession.loadMedia(loadRequest, this.onMediaDiscovered.bind(this), this.castError);
      return this.apiSession.addUpdateListener(this.onSessionUpdate.bind(this));
    };

    ChromecastComponent.prototype.onTrackChangeHandler = function() {
      var i, len, ref, track;
      this.activeTrackIds = [];
      ref = this.player_.textTracks();
      for (i = 0, len = ref.length; i < len; i++) {
        track = ref[i];
        if (track['mode'] === 'showing') {
          this.activeTrackIds.push(track.id);
        }
      }
      this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(this.activeTrackIds);
      if (this.apiMedia) {
        return this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      }
    };

    ChromecastComponent.prototype.onTrackSuccess = function() {
      return vjs.log('track added');
    };

    ChromecastComponent.prototype.onTrackError = function() {
      return vjs.log('track error');
    };

    ChromecastComponent.prototype.onMediaDiscovered = function(media) {
      this.apiMedia = media;
      this.apiMedia.addUpdateListener(this.onMediaStatusUpdate.bind(this));
      if (this.selectedTrack) {
        this.activeTrackIds = [this.selectedTrack.trackId];
        this.tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(this.activeTrackIds);
        this.apiMedia.editTracksInfo(this.tracksInfoRequest, this.onTrackSuccess.bind(this), this.onTrackError.bind(this));
      }
      this.startProgressTimer(this.incrementMediaTime.bind(this));
      this.player_.loadTech('ChromecastTech', {
        receiver: this.apiSession.receiver.friendlyName
      });
      this.casting = true;
      this.paused = this.player_.paused();
      this.inactivityTimeout = this.player_.options_.inactivityTimeout;
      this.player_.options_.inactivityTimeout = 0;
      return this.player_.userActive(true);
    };

    ChromecastComponent.prototype.onSessionUpdate = function(isAlive) {
      if (!this.apiMedia) {
        return;
      }
      if (!isAlive) {
        return this.onStopAppSuccess();
      }
    };

    ChromecastComponent.prototype.onMediaStatusUpdate = function(isAlive) {
      if (!this.apiMedia) {
        return;
      }
      this.currentMediaTime = this.apiMedia.currentTime;
      switch (this.apiMedia.playerState) {
        case chrome.cast.media.PlayerState.IDLE:
          this.currentMediaTime = 0;
          this.trigger("timeupdate");
          return this.onStopAppSuccess();
        case chrome.cast.media.PlayerState.PAUSED:
          if (this.paused) {
            return;
          }
          this.player_.pause();
          return this.paused = true;
        case chrome.cast.media.PlayerState.PLAYING:
          if (!this.paused) {
            return;
          }
          this.player_.play();
          return this.paused = false;
      }
    };

    ChromecastComponent.prototype.startProgressTimer = function(callback) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      return this.timer = setInterval(callback.bind(this), this.timerStep);
    };

    ChromecastComponent.prototype.play = function() {
      if (!this.apiMedia) {
        return;
      }
      if (this.paused) {
        this.apiMedia.play(null, this.mediaCommandSuccessCallback.bind(this, "Playing: " + this.apiMedia.sessionId), this.onError);
        return this.paused = false;
      }
    };

    ChromecastComponent.prototype.pause = function() {
      if (!this.apiMedia) {
        return;
      }
      if (!this.paused) {
        this.apiMedia.pause(null, this.mediaCommandSuccessCallback.bind(this, "Paused: " + this.apiMedia.sessionId), this.onError);
        return this.paused = true;
      }
    };

    ChromecastComponent.prototype.seekMedia = function(position) {
      var request;
      request = new chrome.cast.media.SeekRequest();
      request.currentTime = position;
      if (this.player_.controlBar.progressControl.seekBar.videoWasPlaying) {
        request.resumeState = chrome.cast.media.ResumeState.PLAYBACK_START;
      }
      return this.apiMedia.seek(request, this.onSeekSuccess.bind(this, position), this.onError);
    };

    ChromecastComponent.prototype.onSeekSuccess = function(position) {
      return this.currentMediaTime = position;
    };

    ChromecastComponent.prototype.setMediaVolume = function(level, mute) {
      var request, volume;
      if (!this.apiMedia) {
        return;
      }
      volume = new chrome.cast.Volume();
      volume.level = level;
      volume.muted = mute;
      this.currentVolume = volume.level;
      this.muted = mute;
      request = new chrome.cast.media.VolumeRequest();
      request.volume = volume;
      this.apiMedia.setVolume(request, this.mediaCommandSuccessCallback.bind(this, "Volume changed"), this.onError);
      return this.player_.trigger("volumechange");
    };

    ChromecastComponent.prototype.incrementMediaTime = function() {
      if (this.apiMedia.playerState !== chrome.cast.media.PlayerState.PLAYING) {
        return;
      }
      if (this.currentMediaTime < this.apiMedia.media.duration) {
        this.currentMediaTime += 1;
        return this.trigger("timeupdate");
      } else {
        this.currentMediaTime = 0;
        return clearInterval(this.timer);
      }
    };

    ChromecastComponent.prototype.mediaCommandSuccessCallback = function(information, event) {
      return vjs.log(information);
    };

    ChromecastComponent.prototype.onError = function() {
      return vjs.log("error");
    };

    ChromecastComponent.prototype.stopCasting = function() {
      return this.apiSession.stop(this.onStopAppSuccess.bind(this), this.onError);
    };

    ChromecastComponent.prototype.onStopAppSuccess = function() {
      clearInterval(this.timer);
      this.casting = false;
      this.removeClass("connected");
      this.player_.src(this.player_.options_["sources"]);
      if (!this.paused) {
        this.player_.one('seeked', function() {
          return this.player_.play();
        });
      }
      this.player_.currentTime(this.currentMediaTime);
      this.player_.tech.setControls(false);
      this.player_.options_.inactivityTimeout = this.inactivityTimeout;
      this.apiMedia = null;
      return this.apiSession = null;
    };

    ChromecastComponent.prototype.buildCSSClass = function() {
      return ChromecastComponent.__super__.buildCSSClass.apply(this, arguments) + "vjs-chromecast-button";
    };

    ChromecastComponent.prototype.onClick = function() {
      ChromecastComponent.__super__.onClick.apply(this, arguments);
      if (this.casting) {
        return this.stopCasting();
      } else {
        return this.doLaunch();
      }
    };

    return ChromecastComponent;

  })(vjs.Button);

  vjs.ChromecastTech = (function(superClass) {
    extend(ChromecastTech, superClass);

    ChromecastTech.isSupported = function() {
      return this.player_.chromecastComponent.apiInitialized;
    };

    ChromecastTech.canPlaySource = function(source) {
      return source.type === "video/mp4" || source.type === "video/webm" || source.type === "application/x-mpegURL" || source.type === "application/vnd.apple.mpegURL";
    };

    function ChromecastTech(player, options, ready) {
      this.featuresVolumeControl = true;
      this.movingMediaElementInDOM = false;
      this.featuresFullscreenResize = false;
      this.featuresProgressEvents = true;
      this.receiver = options.source.receiver;
      ChromecastTech.__super__.constructor.call(this, player, options, ready);
      this.triggerReady();
    }

    ChromecastTech.prototype.createEl = function() {
      var element;
      element = document.createElement("div");
      element.id = this.player_.id_ + "_chromecast_api";
      element.className = "vjs-tech vjs-tech-chromecast";
      element.innerHTML = "<div class=\"casting-image\" style=\"background-image: url('" + this.player_.options_.poster + "')\"></div>\n<div class=\"casting-overlay\">\n  <div class=\"casting-information\">\n    <div class=\"casting-icon\">&#58880</div>\n    <div class=\"casting-description\"><small>" + (this.localize("CASTING TO")) + "</small><br>" + this.receiver + "</div>\n  </div>\n</div>";
      element.player = this.player_;
      vjs.insertFirst(element, this.player_.el());
      return element;
    };


    /*
    MEDIA PLAYER EVENTS
     */

    ChromecastTech.prototype.play = function() {
      this.player_.chromecastComponent.play();
      return this.player_.onPlay();
    };

    ChromecastTech.prototype.pause = function() {
      this.player_.chromecastComponent.pause();
      return this.player_.onPause();
    };

    ChromecastTech.prototype.paused = function() {
      return this.player_.chromecastComponent.paused;
    };

    ChromecastTech.prototype.currentTime = function() {
      return this.player_.chromecastComponent.currentMediaTime;
    };

    ChromecastTech.prototype.setCurrentTime = function(seconds) {
      return this.player_.chromecastComponent.seekMedia(seconds);
    };

    ChromecastTech.prototype.volume = function() {
      return this.player_.chromecastComponent.currentVolume;
    };

    ChromecastTech.prototype.setVolume = function(volume) {
      return this.player_.chromecastComponent.setMediaVolume(volume, false);
    };

    ChromecastTech.prototype.muted = function() {
      return this.player_.chromecastComponent.muted;
    };

    ChromecastTech.prototype.setMuted = function(muted) {
      return this.player_.chromecastComponent.setMediaVolume(this.player_.chromecastComponent.currentVolume, muted);
    };

    ChromecastTech.prototype.supportsFullScreen = function() {
      return false;
    };

    return ChromecastTech;

  })(vjs.MediaTechController);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  videojs.plugin('ga', function(options) {
    var dataSetupOptions, defaultsEventsToTrack, end, error, eventCategory, eventLabel, eventsToTrack, fullscreen, loaded, parsedOptions, pause, percentsAlreadyTracked, percentsPlayedInterval, play, resize, seekEnd, seekStart, seeking, sendbeacon, timeupdate, volumeChange;
    if (options == null) {
      options = {};
    }
    dataSetupOptions = {};
    if (this.options()["data-setup"]) {
      parsedOptions = JSON.parse(this.options()["data-setup"]);
      if (parsedOptions.ga) {
        dataSetupOptions = parsedOptions.ga;
      }
    }
    defaultsEventsToTrack = ['loaded', 'percentsPlayed', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volumeChange', 'error', 'fullscreen'];
    eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || defaultsEventsToTrack;
    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
    eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Video';
    eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
    options.debug = options.debug || false;
    percentsAlreadyTracked = [];
    seekStart = seekEnd = 0;
    seeking = false;
    loaded = function() {
      if (!eventLabel) {
        eventLabel = this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, '');
      }
      if (__indexOf.call(eventsToTrack, "loadedmetadata") >= 0) {
        sendbeacon('loadedmetadata', true);
      }
    };
    timeupdate = function() {
      var currentTime, duration, percent, percentPlayed, _i;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      percentPlayed = Math.round(currentTime / duration * 100);
      for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
        if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
          if (__indexOf.call(eventsToTrack, "start") >= 0 && percent === 0 && percentPlayed > 0) {
            sendbeacon('start', true);
          } else if (__indexOf.call(eventsToTrack, "percentsPlayed") >= 0 && percentPlayed !== 0) {
            sendbeacon('percent played', true, percent);
          }
          if (percentPlayed > 0) {
            percentsAlreadyTracked.push(percent);
          }
        }
      }
      if (__indexOf.call(eventsToTrack, "seek") >= 0) {
        seekStart = seekEnd;
        seekEnd = currentTime;
        if (Math.abs(seekStart - seekEnd) > 1) {
          seeking = true;
          sendbeacon('seek start', false, seekStart);
          sendbeacon('seek end', false, seekEnd);
        }
      }
    };
    end = function() {
      sendbeacon('end', true);
    };
    play = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon('play', true, currentTime);
      seeking = false;
    };
    pause = function() {
      var currentTime, duration;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      if (currentTime !== duration && !seeking) {
        sendbeacon('pause', false, currentTime);
      }
    };
    volumeChange = function() {
      var volume;
      volume = this.muted() === true ? 0 : this.volume();
      sendbeacon('volume change', false, volume);
    };
    resize = function() {
      sendbeacon('resize - ' + this.width() + "*" + this.height(), true);
    };
    error = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      sendbeacon('error', true, currentTime);
    };
    fullscreen = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if ((typeof this.isFullscreen === "function" ? this.isFullscreen() : void 0) || (typeof this.isFullScreen === "function" ? this.isFullScreen() : void 0)) {
        sendbeacon('enter fullscreen', false, currentTime);
      } else {
        sendbeacon('exit fullscreen', false, currentTime);
      }
    };
    sendbeacon = function(action, nonInteraction, value) {
      if (window.ga) {
        ga('send', 'event', {
          'eventCategory': eventCategory,
          'eventAction': action,
          'eventLabel': eventLabel,
          'eventValue': value,
          'nonInteraction': nonInteraction
        });
      } else if (window._gaq) {
        _gaq.push(['_trackEvent', eventCategory, action, eventLabel, value, nonInteraction]);
      } else if (options.debug) {
        console.log("Google Analytics not detected");
      }
    };
    this.ready(function() {
      this.on("loadedmetadata", loaded);
      this.on("timeupdate", timeupdate);
      if (__indexOf.call(eventsToTrack, "end") >= 0) {
        this.on("ended", end);
      }
      if (__indexOf.call(eventsToTrack, "play") >= 0) {
        this.on("play", play);
      }
      if (__indexOf.call(eventsToTrack, "pause") >= 0) {
        this.on("pause", pause);
      }
      if (__indexOf.call(eventsToTrack, "volumeChange") >= 0) {
        this.on("volumechange", volumeChange);
      }
      if (__indexOf.call(eventsToTrack, "resize") >= 0) {
        this.on("resize", resize);
      }
      if (__indexOf.call(eventsToTrack, "error") >= 0) {
        this.on("error", error);
      }
      if (__indexOf.call(eventsToTrack, "fullscreen") >= 0) {
        return this.on("fullscreenchange", fullscreen);
      }
    });
    return {
      'sendbeacon': sendbeacon
    };
  });

}).call(this);

  return videojs;
}));
