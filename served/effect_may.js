var pos = 0;
var iteration = 0;

var center = 100;
var size = 0;

var center2 = 100;
var size2 = 0;

var center3 = 100;
var size3 = 0;


exports.nextFrame = function(pixelData, count) {
  function setRange(color, min, max) {
    if(min < 0) min = 0;
    if(max >= pixelData.length) max = pixelData.length -1;
    for( var i = min; i <= max; ++i) {
      pixelData[i] = color;
    }
  }
  function addRange(color, min, max) {
    if(min < 0) min = 0;
    if(max >= pixelData.length) max = pixelData.length -1;
    for( var i = min; i <= max; ++i) {
      var o = int2RGB(pixelData[i]);
      var n = int2RGB(color);
      pixelData[i] = rgb2Int(Math.min(255,o[0]+n[0]),Math.min(255,o[1]+n[1]),Math.min(255,o[2]+n[2]));
    }
  }
  var NUM_LEDS = pixelData.length;

//log(center, size, left, right)
  //setRange(rgb2Int(20,20,20), 0,300);

  setRange(rgb2Int(60,30,30), 112,127);

  //Daytime blackout
  var hour = (new Date()).getUTCHours();
  if(hour < 4 || hour >= 7) {
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
function int2RGB(i) {
  return [0xff & (i >> 16),0xff & i,0xff & (i >> 8)];
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
