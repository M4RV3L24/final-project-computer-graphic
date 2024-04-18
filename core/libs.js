var LIBS={
  get_json: function(url, func) {
    // create the request:
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        // the file is loaded. Parse it as JSON and lauch func
        func(JSON.parse(xmlHttp.responseText));
      }
    };
    // send the request:
    xmlHttp.send();
  },

  degToRad: function(angle){
    return(angle*Math.PI/180);
  },

  get_ortho_proj: function(angle, a, zMin, zMax) {
    var tan=Math.tan(LIBS.degToRad(0.5*angle)),
        A=-(zMax+zMin)/(zMax-zMin),
          B=(-2*zMax*zMin)/(zMax-zMin);

    return [
      0.5/tan, 0 ,   0, 0,
      0, 0.5*a/tan,  0, 0,
      0, 0,         A, -1,
      0, 0,         B, 0
    ];
  },

  look_at: function(cameraPosition, target, up) {
    var zAxis = Vector.sub(cameraPosition, target).normalize();
    var xAxis = Vector.cross(up, zAxis).normalize();
    var yAxis = zAxis.cross(xAxis).normalize();
 
    return [
       xAxis.get(0), xAxis.get(1), xAxis.get(2), 0,
       yAxis.get(0), yAxis.get(1), yAxis.get(2), 0,
       zAxis.get(0), zAxis.get(1), zAxis.get(2), 0,
       cameraPosition[0],
       cameraPosition[1],
       cameraPosition[2],
       1,
    ];
  },

  fequal(val1, val2, epsilon=1e-9) {
      return Math.abs(val1 - val2) <= epsilon;
  },

  undefinedTanAngle(val) {
      val %= Math.PI;
      if (val < 0)
          val += Math.PI;
      return LIBS.fequal(val, Math.PI/2);
  },

  // Linear map val from range [start1, end1]
  // to a coresponding value in [start2, end2]
  map(val, start1, end1, start2, end2) {
      if (val == start1)
          return start2;
      if (val == end1)
          return end2;
      return ((val - start1) * (end2 - start2) / (end1 - start1)) + start2;
  }, 
};