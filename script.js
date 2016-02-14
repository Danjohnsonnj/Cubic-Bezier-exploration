var JS = {
slope: function(start, end) {
    // m = (y1 - y2) / (x1 - x2);
    var m = (start.y - end.y) / (start.x - end.x);
    return m;
  },

  yIntercept: function(point, slope) {
    // y = m * x + b;
    var b = point.y - (slope * point.x);
    return b;
  },

  splineCurve: function(FirstPoint, MiddlePoint, EndPoint, t) {
    //Props to Rob Spencer at scaled innovation for his post on splining between points
    //http://scaledinnovation.com/analytics/splines/aboutSplines.html
    var _t = t || 0.5;
    var d01 = Math.sqrt(Math.pow(MiddlePoint.x - FirstPoint.x, 2) + Math.pow(MiddlePoint.y - FirstPoint.y, 2)),
      d12 = Math.sqrt(Math.pow(EndPoint.x - MiddlePoint.x, 2) + Math.pow(EndPoint.y - MiddlePoint.y, 2)),
      fa = _t * d01 / (d01 + d12), // scaling factor for triangle Ta
      fb = _t * d12 / (d01 + d12);
    return {
      inner: {
        x: MiddlePoint.x - fa * (EndPoint.x - FirstPoint.x),
        y: MiddlePoint.y - fa * (EndPoint.y - FirstPoint.y)
      },
      outer: {
        x: MiddlePoint.x + fb * (EndPoint.x - FirstPoint.x),
        y: MiddlePoint.y + fb * (EndPoint.y - FirstPoint.y)
      }
    };
  },

  getPointOnCurve: function(start, middle, end, percent, scaleFactor) {
    //This function is slightly modified from Chart.js (https://github.com/nnnick/Chart.js/blob/master/src/Chart.Core.js#L343).
    //Used uner the MIT license.

    //====================================\\
    // 13thParallel.org Beziér Curve Code \\
    //   by Dan Pupius (www.pupius.net)   \\
    //====================================\\
    var coord = function(x, y) {
      if (!x) var x = 0;
      if (!y) var y = 0;
      return {
        x: x,
        y: y
      };
    }

    function B1(t) {
      return t * t * t
    }

    function B2(t) {
      return 3 * t * t * (1 - t)
    }

    function B3(t) {
      return 3 * t * (1 - t) * (1 - t)
    }

    function B4(t) {
      return (1 - t) * (1 - t) * (1 - t)
    }

    var getBezier = function (percent, C1, C2, C3, C4) {  // start, inner, outer, end
      var pos = new coord();
      pos.x = C1.x * B1(percent) + C2.x * B2(percent) + C3.x * B3(percent) + C4.x * B4(percent);
      pos.y = C1.y * B1(percent) + C2.y * B2(percent) + C3.y * B3(percent) + C4.y * B4(percent);
      return pos;
    }
    //====================================\\


    var init = function() {
      if (!Array.isArray(start) || !Array.isArray(middle) || !Array.isArray(end)) {
        console.warn('Points must be in Arrays');
        return {x: null, y: null};
      }
      var s = {
        x: start[0],
        y: start[1]
      }
      var m = {
        x: middle[0],
        y: middle[1]
      }
      var e = {
        x: end[0],
        y: end[1]
      }
      var controls = JS.splineCurve(s, m, e, (scaleFactor || 0.5));
      var controlOne = controls.inner;
      var controlTwo = controls.outer;

      return getBezier(percent, s, controlOne, controlTwo, e);
    }

    var point = init();
    console.log(point);
    return point;
  },

  interpolateY: function(start, end, x, bezierMidpoint) {
    if (bezierMidpoint) {
      var y = JS.getPointOnCurve([start.x, start.y],[bezierMidpoint.x, bezierMidpoint.y],[end.x, end.y], (x - start.x) / (end.x - start.x)).y;
      return y;
    }
    else {
      var m = JS.slope(start, end);
      var b = JS.yIntercept(start, m);
      var y = m * x + b;
      return y;
    }
  }
}

function doBezier(start, middle, end) {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  var radius = 5;

  var xOffset = canvas.clientWidth * .25;
  var yOffset = canvas.clientHeight * .25;
  var availX = canvas.clientWidth - (2 * xOffset);
  var availY = canvas.clientHeight - (2 * yOffset);

  var _start = {
    x: start.x * availX + xOffset,
    y: start.y * availY + yOffset
  }
  var _middle = {
    x: middle.x * availX + xOffset,
    y: middle.y * availY + yOffset
  }
  var _end = {
    x: end.x * availX + xOffset,
    y: end.y * availY + yOffset
  }

  var c1 = JS.splineCurve(_start, _middle, _end).inner;
  var c2 = JS.splineCurve(_start, _middle, _end).outer;

  context.beginPath();
  context.moveTo(xOffset, yOffset);
  context.lineTo(xOffset + availX, yOffset);
  context.lineTo(xOffset + availX, yOffset + availY);
  context.lineTo(xOffset, yOffset + availY);
  context.closePath();
  context.strokeStyle = '#efefef';
  context.lineWidth = 1;
  context.stroke();

  context.beginPath();
  context.arc(_middle.x + (radius/2), _middle.y + (radius/2), radius, 0, 2 * Math.PI, false);
  context.strokeStyle = 'blue';
  context.stroke();

  context.beginPath();
  context.moveTo(c1.x + (radius/2), c1.y + (radius/2));
  context.lineTo(_start.x, _start.y);
  context.strokeStyle = 'gray';
  context.stroke();

  context.beginPath();
  context.arc(c1.x + (radius/2), c1.y + (radius/2), radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'red';
  context.fill();

  context.beginPath();
  context.moveTo(c2.x + (radius/2), c2.y + (radius/2));
  context.lineTo(_end.x, _end.y);
  context.strokeStyle = 'gray';
  context.stroke();

  context.beginPath();
  context.arc(c2.x + (radius/2), c2.y + (radius/2), radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();

  context.beginPath();
  context.moveTo(_start.x, _start.y);
  context.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, _end.x, _end.y);
  context.lineWidth = 2;
  context.strokeStyle = 'black';
  context.stroke();
}

function getValues(elements) {
  var start = {};
  var mid = {};
  var end = {};
  for (var c = 0; c < elements.length; c++) {
    var _c = elements[c];
    eval(_c.getAttribute('data-name'))[_c.getAttribute('data-axis')] = _c.value / 100;
  }
  document.documentElement.querySelector('.start input[type="text"]').value =  start.x + ', ' + start.y;
  document.documentElement.querySelector('.mid input[type="text"]').value =  mid.x + ', ' + mid.y;
  document.documentElement.querySelector('.end input[type="text"]').value =  end.x + ', ' + end.y;
  doBezier(start, mid, end);
}

function resetValues() {
  var controls = document.documentElement.querySelectorAll('input[type="range"]');
  for (var c = 0; c < controls.length; c++) {
    controls[c].value = controls[c].getAttribute('data-default-value');
    getValues(controls);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var controls = document.documentElement.querySelectorAll('input[type="range"]');
  resetValues();
  for (var c = 0; c < controls.length; c++) {
    controls[c].addEventListener('change', function() {
      getValues(controls);
    }, false);
  }
  document.getElementById('reset').addEventListener('click', resetValues, false);
}, false);
