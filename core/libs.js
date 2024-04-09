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
    var zAxis = LIBS.normalizeCopy(LIBS.sub(cameraPosition, target));
    var xAxis = LIBS.normalize(LIBS.cross(up, zAxis));
    var yAxis = LIBS.normalize(LIBS.cross(zAxis, xAxis));
 
    return [
       xAxis[0], xAxis[1], xAxis[2], 0,
       yAxis[0], yAxis[1], yAxis[2], 0,
       zAxis[0], zAxis[1], zAxis[2], 0,
       cameraPosition[0],
       cameraPosition[1],
       cameraPosition[2],
       1,
    ];
  },

  get_I4: function() {
    return [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];
  },
  set_I4: function(m) {
    m[0]=1, m[1]=0, m[2]=0, m[3]=0,
    m[4]=0, m[5]=1, m[6]=0, m[7]=0,
    m[8]=0, m[9]=0, m[10]=1, m[11]=0,
    m[12]=0, m[13]=0, m[14]=0, m[15]=1;

    return m;
  },

  rotateX: function(m, angle) {
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv1=m[1], mv5=m[5], mv9=m[9];
    m[1]=m[1]*c-m[2]*s;
    m[5]=m[5]*c-m[6]*s;
    m[9]=m[9]*c-m[10]*s;

    m[2]=m[2]*c+mv1*s;
    m[6]=m[6]*c+mv5*s;
    m[10]=m[10]*c+mv9*s;

    return m;
  },
  rotateY: function(m, angle) {
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv0=m[0], mv4=m[4], mv8=m[8];
    m[0]=c*m[0]+s*m[2];
    m[4]=c*m[4]+s*m[6];
    m[8]=c*m[8]+s*m[10];

    m[2]=c*m[2]-s*mv0;
    m[6]=c*m[6]-s*mv4;
    m[10]=c*m[10]-s*mv8;

    return m;
  },
  rotateZ: function(m, angle) {
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv0=m[0], mv4=m[4], mv8=m[8];
    m[0]=c*m[0]-s*m[1];
    m[4]=c*m[4]-s*m[5];
    m[8]=c*m[8]-s*m[9];

    m[1]=c*m[1]+s*mv0;
    m[5]=c*m[5]+s*mv4;
    m[9]=c*m[9]+s*mv8;

    return m;
  },

  translateX: function(m, t){
    m[12]+=t;
    return m;
  },
  translateY: function(m, t){
    m[13]+=t;
    return m;
  },
  translateZ: function(m, t){
    m[14]+=t;
    return m;
  },

  scaleX: function(m, k) {
    m[0] *= k;
    return m;
  },
  scaleY: function(m, k) {
    m[5] *= k;
    return m;
  },
  scaleZ: function(m, k) {
    m[10] *= k;
    return m;
  },
  scale: function(m, k) {
    LIBS.scaleX(m, k);
    LIBS.scaleY(m, k);
    LIBS.scaleZ(m, k);
    return m;
  },

  inverseCopy: function(m) {
    let
      A2323 = m[2*4+2] * m[3*4+3] - m[2*4+3] * m[3*4+2],
      A1323 = m[2*4+1] * m[3*4+3] - m[2*4+3] * m[3*4+1],
      A1223 = m[2*4+1] * m[3*4+2] - m[2*4+2] * m[3*4+1],
      A0323 = m[2*4+0] * m[3*4+3] - m[2*4+3] * m[3*4+0],
      A0223 = m[2*4+0] * m[3*4+2] - m[2*4+2] * m[3*4+0],
      A0123 = m[2*4+0] * m[3*4+1] - m[2*4+1] * m[3*4+0],
      A2313 = m[1*4+2] * m[3*4+3] - m[1*4+3] * m[3*4+2],
      A1313 = m[1*4+1] * m[3*4+3] - m[1*4+3] * m[3*4+1],
      A1213 = m[1*4+1] * m[3*4+2] - m[1*4+2] * m[3*4+1],
      A2312 = m[1*4+2] * m[2*4+3] - m[1*4+3] * m[2*4+2],
      A1312 = m[1*4+1] * m[2*4+3] - m[1*4+3] * m[2*4+1],
      A1212 = m[1*4+1] * m[2*4+2] - m[1*4+2] * m[2*4+1],
      A0313 = m[1*4+0] * m[3*4+3] - m[1*4+3] * m[3*4+0],
      A0213 = m[1*4+0] * m[3*4+2] - m[1*4+2] * m[3*4+0],
      A0312 = m[1*4+0] * m[2*4+3] - m[1*4+3] * m[2*4+0],
      A0212 = m[1*4+0] * m[2*4+2] - m[1*4+2] * m[2*4+0],
      A0113 = m[1*4+0] * m[3*4+1] - m[1*4+1] * m[3*4+0],
      A0112 = m[1*4+0] * m[2*4+1] - m[1*4+1] * m[2*4+0];

    let det =
        m[0*4+0] * ( m[1*4+1] * A2323 - m[1*4+2] * A1323 + m[1*4+3] * A1223 ) 
      - m[0*4+1] * ( m[1*4+0] * A2323 - m[1*4+2] * A0323 + m[1*4+3] * A0223 ) 
      + m[0*4+2] * ( m[1*4+0] * A1323 - m[1*4+1] * A0323 + m[1*4+3] * A0123 ) 
      - m[0*4+3] * ( m[1*4+0] * A1223 - m[1*4+1] * A0223 + m[1*4+2] * A0123 );
    det = 1. / det;

    return [
      det *   ( m[1*4+1] * A2323 - m[1*4+2] * A1323 + m[1*4+3] * A1223 ),
      det * - ( m[0*4+1] * A2323 - m[0*4+2] * A1323 + m[0*4+3] * A1223 ),
      det *   ( m[0*4+1] * A2313 - m[0*4+2] * A1313 + m[0*4+3] * A1213 ),
      det * - ( m[0*4+1] * A2312 - m[0*4+2] * A1312 + m[0*4+3] * A1212 ),
      det * - ( m[1*4+0] * A2323 - m[1*4+2] * A0323 + m[1*4+3] * A0223 ),
      det *   ( m[0*4+0] * A2323 - m[0*4+2] * A0323 + m[0*4+3] * A0223 ),
      det * - ( m[0*4+0] * A2313 - m[0*4+2] * A0313 + m[0*4+3] * A0213 ),
      det *   ( m[0*4+0] * A2312 - m[0*4+2] * A0312 + m[0*4+3] * A0212 ),
      det *   ( m[1*4+0] * A1323 - m[1*4+1] * A0323 + m[1*4+3] * A0123 ),
      det * - ( m[0*4+0] * A1323 - m[0*4+1] * A0323 + m[0*4+3] * A0123 ),
      det *   ( m[0*4+0] * A1313 - m[0*4+1] * A0313 + m[0*4+3] * A0113 ),
      det * - ( m[0*4+0] * A1312 - m[0*4+1] * A0312 + m[0*4+3] * A0112 ),
      det * - ( m[1*4+0] * A1223 - m[1*4+1] * A0223 + m[1*4+2] * A0123 ),
      det *   ( m[0*4+0] * A1223 - m[0*4+1] * A0223 + m[0*4+2] * A0123 ),
      det * - ( m[0*4+0] * A1213 - m[0*4+1] * A0213 + m[0*4+2] * A0113 ),
      det *   ( m[0*4+0] * A1212 - m[0*4+1] * A0212 + m[0*4+2] * A0112 )
    ];
  },

  transpose: function(m) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        let temp = m[i*4+j];
        m[i*4+j] = m[j*4+i];
        m[j*4+i] = temp;
      }
    }
    return m;
  },

  multiplyCopy: function(m1, m2) {
    let numCols1 = m1[0].length, numRows1 = m2.length,
        numCols2 = m2[0].length, numRows2 = m2.length;

    if (numCols1 != numRows2.length) {
      throw new Error("Unable to multiply matrices: incompatible dimensions");
    }
    let result = [];
    for (let i = 0; i < numRows1; i++) {
      for (let j = 0; j < numCols2; j++) {
        let val = 0;
        for (let k = 0; k < numCols1; k++) {
          val += m1[i][k] + m2[k][j];
        }
        result[i][j] = 0;
      }
    }

    return result;
  },

  length: function(vec) {
    result = 0;
    vec.forEach(element => {
      result += element*element
    });

    return Math.sqrt(result);
  },

  checkSameDims: function(vec1, vec2) {
    let l1 = vec1.length, l2 = vec2.length;
    if (l1 != l2) {
      throw new Error("Cannot do operation, different dimensions");
    }
    return true;
  },

  cross: function(vec1, vec2) {
    LIBS.checkSameDims(vec1, vec2);
    return [
      vec1[1] * vec2[2] - vec1[2] * vec2[1],
      vec1[2] * vec2[0] - vec1[0] * vec2[2],
      vec1[0] * vec2[1] - vec1[1] * vec2[0]
    ];
  },

  dot: function(vec1, vec2) {
    LIBS.checkSameDims(vec1, vec2);

    let result = 0;
    for (let i = 0; i < vec1.length; i++) {
      result += vec1[i] * vec2[i];
    }

    return result;
  },

  normalize: function(vec) {
    let l = LIBS.length(vec)
    if (l < 0.00001) {
      return [0., 0., 0.];
    }
    for (let i = 0; i < vec.length; i++) {
      vec[i] /= l;
    }
    return vec;
  },

  normalizeCopy: function(vec) {
    let l = LIBS.length(vec)
    if (l < 0.00001) {
      return [0., 0., 0.];
    }
    result = [];
    for (let i = 0; i < vec.length; i++) {
      result[i] = vec[i]/l;
    }
    return result;
  },

  neg: function(vec) {
    let l = LIBS.length(vec)
    for (let i = 0; i < vec.length; i++) {
      vec[i] = -vec[i];
    }
    return vec;
  },

  sub: function(vec1, vec2) {
    LIBS.checkSameDims(vec1, vec2);

    result = []
    for (let i = 0; i < vec1.length; i++) {
      result[i] = vec1[i] - vec2[i];
    }

    return result;
  },

  add: function(vec1, vec2) {
    LIBS.checkSameDims(vec1, vec2);

    result = []
    for (let i = 0; i < vec1.length; i++) {
      result[i] = vec1[i] + vec2[i];
    }

    return result;
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
  }
};