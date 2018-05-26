var moment = require("http://momentjs.com/downloads/moment.min.js");

var position = 200;

var hOffsets = [];
var vOffsets = [];

//0=idle, 1=transition, 2=lightning
var mode = 0;
var modectr = 0;

exports.nextFrame = function(pixelData, count) {
function setRange(color, min, max) {
  for( var i = min; i <= max; ++i) {
    pixelData[i] = color;
  }
}
  var NUM_LEDS = pixelData.length;
  var rand = Math.random();
  var newhrand = Math.random();//0.5
  var newvrand = Math.random();//0.5
  
  for (var i = 0; i < NUM_LEDS; i++) {
    if( Math.random() > 0.8 ){
      newhrand = Math.random();
    }
    if( Math.random() > 0.8 ){
      newvrand = Math.random();
    }

    var n = 5000;
    //var rgb = HSVtoRGB((count/4 + 1*i/4 * (n / NUM_LEDS)) / n * 2* 3.14, 1, 0.1);
    //pixelData[i] = 0xFFFFFF;
    //pixelData[i] = 0x010101;
    var min = 0.06;
    var max = 0.19;
    var range = max - min;
    var hold = hOffsets[i]||0.5;
    hOffsets[i] = hold + (newhrand - hold) * 0.05;
    var h = min + hOffsets[i] * range;
    var vold = vOffsets[i]||0.5;
    vOffsets[i] = vold + (newvrand - vold) * 0.15;
    var v = 0.10 + vOffsets[i] * 0.3
    var rgb = HSVtoRGB(1-h, 1, v);
    //pixelData[i] = 0x000000;
    pixelData[i] = rgb2Int(rgb.r,rgb.g,rgb.b);
  }

  //Purple
  //setRange(rgb2Int(60,60,00), 112,127);
  //Orange
  setRange(rgb2Int(255,100,00), 112,127);

  //Lightning
  /*
  if( moment().utcOffset(-7).date() === 31 ) {
  var tmp = count % 800;
  if(tmp <= 20 && rand > 0.6) {
    setRange(rgb2Int(255,255,255), 0,NUM_LEDS-1);
  }
  }
  */
  //End lightning

  var demo = false;

  var tmp = count % (demo?50:100);
  if(demo || moment().utcOffset(-7).date() === 31 ) {
  if(mode===0 && tmp <= 0 && rand > (demo?0.1:0.9)) {
    mode = 1;
    modectr = 0;
  }
  }

  if(mode === 2) {
    if(rand > 0.6) {
      setRange(rgb2Int(255,255,255), 0,NUM_LEDS-1);
    }
    modectr++;
    if(modectr > 15) {
      mode = 0;
      modectr = 0;
    }
  }

  if(mode===1) {
    let i = (112 / 10 * modectr) >> 0;
    pixelData[i] = rgb2Int(255,100,00);
    i = 200 - ((200-127) / 10 * modectr) >> 0;
    pixelData[i] = rgb2Int(255,100,00);
    modectr++;
    if(modectr > 10) {
      mode = 2;
      modectr = 0;
    }
  }

  //Daytime blackout
  var endtime = moment().utcOffset(-7).startOf('day').hour(12+10);
  var starttime = moment().utcOffset(-7).startOf('day').hour(12+4);
  var nowtime = moment().utcOffset(-7);
  if(nowtime.isBefore(starttime) || nowtime.isAfter(endtime)) {
    setRange(rgb2Int(0,0,0), 0,200);
    setRange(rgb2Int(40,40,40), 119,120);
  }
}

// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colowheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((b & 0xff) << 8) + (g & 0xff);
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
        if (h && s === undefined && v === undefined) {
                s = h.s, v = h.v, h = h.h;
                    }
                        i = Math.floor(h * 6);
                            f = h * 6 - i;
                                p = v * (1 - s);
                                    q = v * (1 - f * s);
                                        t = v * (1 - (1 - f) * s);
                                            switch (i % 6) {
                                                    case 0: r = v, g = t, b = p; break;
                                                            case 1: r = q, g = v, b = p; break;
                                                                    case 2: r = p, g = v, b = t; break;
                                                                            case 3: r = p, g = q, b = v; break;
                                                                                    case 4: r = t, g = p, b = v; break;
                                                                                            case 5: r = v, g = p, b = q; break;
                                                                                                }
                                                                                                    return {
                                                                                                            r: Math.floor(r * 255),
                                                                                                                    g: Math.floor(g * 255),
                                                                                                                            b: Math.floor(b * 255)
                                                                                                                                };
                                                                                                                                }


// vim: set ts=2 sw=2 :
