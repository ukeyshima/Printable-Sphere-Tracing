precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform float rotateX; 
uniform float rotateY;
#define PI 3.141592

const vec3 cPos = vec3(0.0, 0.0, -2.0);
const vec3 cDir = vec3(0.0, 0.0, 1.0);
const vec3 cUp = vec3(0.0, 1.0, 0.0);
const float depth = 1.0;
const vec3 lPos = vec3(10.0,10.0,-20.0);

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
  p = rotate(p,rotateX,vec3(1.0,0.0,0.0));
  p = rotate(p,rotateY,vec3(0.0,1.0,0.0));
  //Write distFunc code
}

float boxDistFunc(vec3 p,vec3 b,vec3 c){
  p = p - c;
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float boundingBox(vec3 p){
  vec3 b = vec3(1.0);
  float e = 0.01;
  p = abs(p)-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

float renderingDistFunc(vec3 p, out float distFuncDist, out float boundingBoxDist){
  distFuncDist = distFunc(p);
  boundingBoxDist = boundingBox(p);
  return 
  min(
    max(
      distFuncDist,
      boxDistFunc(p,vec3(1.0,//sliceBoxSizeY,1.0),vec3(0.0,//slicePositionY,0.0))
    ),
  boundingBoxDist
  );
}

vec3 getNormal(vec3 p) {
  float d = 0.001;
  float dummyDistFuncDist = 0.0;
  float dummyBoundingBoXDist = 0.0;
  return normalize(
      vec3(renderingDistFunc(p + vec3(d, 0.0, 0.0),dummyDistFuncDist,dummyBoundingBoXDist) - renderingDistFunc(p + vec3(-d, 0.0, 0.0),dummyDistFuncDist,dummyBoundingBoXDist),
           renderingDistFunc(p + vec3(0.0, d, 0.0),dummyDistFuncDist,dummyBoundingBoXDist) - renderingDistFunc(p + vec3(0.0, -d, 0.0),dummyDistFuncDist,dummyBoundingBoXDist),
           renderingDistFunc(p + vec3(0.0, 0.0, d),dummyDistFuncDist,dummyBoundingBoXDist) - renderingDistFunc(p + vec3(0.0, 0.0, -d),dummyDistFuncDist,dummyBoundingBoXDist)));
}

vec4 rayMarching(vec4 color, vec2 p) {
  vec3 cSide = vec3(1.0,0.0,0.0);  
  vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * depth);
  vec3 rPos = cPos;
  float rLen = 0.0;
  float maxDist = 4.0;
  vec3 objectColor = vec3(0.2, 0.6, 1.0);
  vec3 boundingBoxColor = vec3(1.0,0.2,0.1);
  float distFuncDist = 0.0;
  float boundingBoxDist = 0.0;
  for (float i = 0.0; i < 60.0; i++) {
    float distance = renderingDistFunc(rPos,distFuncDist,boundingBoxDist);
    if (abs(distance) < 0.001) {        
      if(distance == boundingBoxDist){
       color = vec4(boundingBoxColor,1.0);
      }else{
        vec3 normal = getNormal(rPos);
        vec3 lVec = normalize(lPos - rPos);      
        float diffuse = clamp(dot(normal, lVec), 0.1, 1.0) + 0.1;
        float specular = pow(clamp(dot(normal, lVec), 0.0, 1.0), 50.0);
        color = vec4(objectColor * diffuse + specular,1.0);        
      }              
      break;
    }
    rLen += distance;
    if (rLen > maxDist) {
      break;
    }
    rPos = cPos + rLen * ray;
  }
  return color;
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