var moment = require("http://momentjs.com/downloads/moment.min.js");

exports.nextFrame = function(pixelData, count) {
function setRange(color, min, max) {
  for( var i = min; i <= max; ++i) {
    pixelData[i] = color;
  }
}
  var NUM_LEDS = pixelData.length;
  var rand = Math.random();
  var colorrand = Math.random();//0.5

  var position = Math.floor(rand * NUM_LEDS);

  if(count % 15 === 0) {
  var color = (colorrand > 0.5) ? rgb2Int(255,0,0) : rgb2Int(0,200,0);
    pixelData[position] = color;
    pixelData[position+1] = color;
    pixelData[position+2] = color;
    pixelData[position+3] = color;
  }

  //Daytime blackout
  var endtime = moment().utcOffset(-8).startOf('day').hour(12+11);
  var starttime = moment().utcOffset(-8).startOf('day').hour(12+4);
  var nowtime = moment().utcOffset(-8);
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
