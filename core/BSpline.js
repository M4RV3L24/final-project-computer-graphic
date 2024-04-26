function normalizeScreen(x, y, z, width, height) {
  var nx = 2 * x / width - 1
  var ny = -2 * y / height + 1
  var nz = z

  return [nx, ny, nz]
}

function generateBSpline(controlPoint, m, degree) {
  var curves = [];
  var knotVector = []

  var n = controlPoint.length / 3;


  // Calculate the knot values based on the degree and number of control points
  for (var i = 0; i < n + degree + 1; i++) {
    if (i < degree + 1) {
      knotVector.push(0);
    } else if (i >= n) {
      knotVector.push(n - degree);
    } else {
      knotVector.push(i - degree);
    }
  }



  var basisFunc = function (i, j, t) {
    if (j == 0) {
      if (knotVector[i] <= t && t < (knotVector[(i + 1)])) {
        return 1;
      } else {
        return 0;
      }
    }

    var den1 = knotVector[i + j] - knotVector[i];
    var den2 = knotVector[i + j + 1] - knotVector[i + 1];

    var term1 = 0;
    var term2 = 0;


    if (den1 != 0 && !isNaN(den1)) {
      term1 = ((t - knotVector[i]) / den1) * basisFunc(i, j - 1, t);
    }

    if (den2 != 0 && !isNaN(den2)) {
      term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i + 1, j - 1, t);
    }

    return term1 + term2;
  }
  for (var t = 0; t < m; t++) {
    var x = 0;
    var y = 0;
    var z = 0;

    var u = (t / m * (knotVector[controlPoint.length / 3] - knotVector[degree])) + knotVector[degree];

    //C(t)
    for (var key = 0; key < n; key++) {

      var C = basisFunc(key, degree, u);
      // console.log(C);
      x += (controlPoint[key * 3] * C);
      y += (controlPoint[key * 3 + 1] * C);
      z += (controlPoint[key * 3 + 2] * C) //ubha jadi 5 dari 2
      // console.log(t+" "+degree+" "+x+" "+y+" "+C);
    }
    curves.push(x);
    curves.push(y);
    curves.push(z);
  }
  // console.log(curves)
  return curves;
}

function projectContour (curve, rad, stepCount=360) {
  var list = [];
  var distance = [];
  var v = []; //vector
  var n = []; //normal

  // hitung vector antar titik pada kurva
  if (curve.length < 3) return list;
  for (var i = 3; i < curve.length; i+=3) {
      var x = curve[i] - curve[i-3];
      var y = curve[i+1] - curve[i-2];
      var z = curve[i+2] - curve[i-1];
      v = v.concat([x, y, z]);
  }

  // hitung normal vector
  for (var i = 3; i < v.length; i+=3) {
      var x = v[i] + v[i-3];
      var y = v[i+1] + v[i-2];
      var z = v[i+2] + v[i-1];
      n = n.concat([x, y, z]);
  }

  //hitung plane equation di vertex tujuan
  for (var i = 0; i < n.length; i++) {
      var normalLength = Math.sqrt(n[i]*n[i] + n[i+1]*n[i+1] + n[i+2]*n[i+2]);
      var a = curve[3*i+3];
      var b = curve[3*i+4];
      var c = curve[3*i+5];
      var d = -(a*curve[i] + b*curve[i+1] + c*curve[i+2]);
      distance = distance.concat(-d/normalLength);
  }
  var firstContour = generateCircle(v1[0], v[1], v[2], rad);



  // project each vertex of contour to the plane
  // define line with direction and point
  // find the intersection point
  // return the projected vertices of contour at toIndex
} 

function generateCircle(x, y, z, rad, stepCount=360) {
  var list = [];
  for (var i = 0; i < stepCount; i++) {
    var alpha = i / stepCount * 2 * Math.PI;
    var ca = Math.cos(alpha);
    var sa = Math.sin(alpha);
    list.push(rad * ca + x);
    list.push(y);
    list.push(rad * sa + z);
  }
  return list;
}
