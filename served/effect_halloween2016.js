var moment = require("http://momentjs.com/downloads/moment.min.js");

var position = 200;

var hOffsets = [];
var vOffsets = [];

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
    var min = i<66?0.7:0.06;
    var max = i<66?0.8:0.09;
    var range = max - min;
    var hold = hOffsets[i]||0.5;
    hOffsets[i] = hold + (newhrand - hold) * 0.05;
    var h = min + hOffsets[i] * range;
    var vold = vOffsets[i]||0.5;
    vOffsets[i] = vold + (newvrand - vold) * 0.05;
    var v = 0.05 + vOffsets[i] * 0.3
    var rgb = HSVtoRGB(1-h, 1, v);
    //pixelData[i] = 0x000000;
    pixelData[i] = rgb2Int(rgb.r,rgb.g,rgb.b);

    //Red/White/Blue
    //var s = 4;
    //pixelData[i] = rgb2Int(0xFF/s,0x88/s,0xFF/s);//0xFF88FF;
    //var color = Math.floor(count/500 + i/12) % 3;
    //if(color === 2) pixelData[i] = rgb2Int(0xFF/s,0,0);//0xFF0000;
    //if(color === 0) pixelData[i] = rgb2Int(0,0xFF/s,0);//0x00FF00;

    /*Basic Lightning, do not delete without recording elsewhere
    var tmp = count % 200;
    if(tmp == 0 || tmp == 1 || tmp == 5)
    pixelData[i] = 0xFFFFFF;
    */
    //pixelData[i] = ((count >> i) % 2 == 0)?0xFFFFFF:0x000000
  }

  setRange(rgb2Int(60,60,00), 112,127);

  //Lightning
  if( moment().utcOffset(-7).date() === 31 ) {
  var tmp = count % 800;
  if(tmp <= 20 && rand > 0.6) {
    setRange(rgb2Int(255,255,255), 0,NUM_LEDS-1);
  }
  }
  //End lightning

//  var tmp = count % 200;
//  if(tmp == 0 || tmp == 1 || tmp == 5)
  //setRange(rgb2Int(255,255,255), 172,177);

  //pixelData[0] = 0xFFFFFF;
  //pixelData[111] = 0x0000FF;
  //pixelData[66] = 0x0000FF;
  //setRange(0xCC5CCC, 112,127);
  //setRange(rgb2Int(20,20,20), 112,127);

  //pixelData[position] = 0x00FF00;
  //setRange(0x004400, 10,49);
  //pixelData[2] = (count) % 2 == 0?0:0x001100;
  //pixelData[3] = (count >> 1) % 2 == 0?0:0x001100;
  //pixelData[4] = (count >> 2) % 2 == 0?0:0x001100;
  //pixelData[position] = 0x00FF00;
  /*var now = new Date();
  function d(n) {
    return Math.floor( now.getTime() / (1000 / n) ) % 2 == 0;
  }
  if( d(1) ) {
    pixelData[111] = 0x010000;
  }
  if( d(2) ) {
    pixelData[110] = 0x010000;
  }
  if( d(4) ) {
    pixelData[109] = 0x010000;
  }
  if( d(8) ) {
    pixelData[108] = 0x010000;
  }*/
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
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
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
