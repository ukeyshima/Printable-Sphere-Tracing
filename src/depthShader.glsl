precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
#define PI 3.141592

vec3 rotate(vec3 p, float angle, vec3 axis){
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
    );
    return m * p;
}

float distFunc(vec3 p) {
  //Write distFunc code
}

float boxDistFunc(vec3 p,vec3 b,vec3 c){
  p = p - c;
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float renderingDistFunc(vec3 p){  
  return   
    max(
      distFunc(p),
      boxDistFunc(p,vec3(1.0,0.001,1.0),vec3(0.0,//slicePositionY,0.0))
    );
}

vec4 rayMarching(vec4 color, vec2 p) {
  vec3 cPos = vec3(p.x,//rayStartPosY,p.y);
  vec3 ray = normalize(vec3(0.0,//rayDirectionY,0.0));  
  vec3 rPos = cPos;
  float rLen = 0.0;
  float maxDist = 4.0;  
  for (float i = 0.0; i < 60.0; i++) {
    float distance = renderingDistFunc(rPos);
    if (abs(distance) < 0.001) {
        color = vec4(rPos,1.0);
      break;
    }
    rLen += distance;
    if (rLen > maxDist) {
      break;
    }
    rPos = cPos + rLen * ray;
  }
  return color+vec4(vec3(0.5),0.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 p = (fragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec4 color = rayMarching(vec4(0.0), p);  
  fragColor = color;
}

void main( void ){
  vec4 color = vec4(0.0,0.0,0.0,1.0);
  mainImage( color, gl_FragCoord.xy );  
  gl_FragColor = color;
}