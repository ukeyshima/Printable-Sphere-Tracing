import { atom } from 'recoil';

export const codeState = atom({
    key: 'codeState',
    default: `p = rotate(p,PI/2.0,vec3(1.0,0.0,0.0));
vec2 h = vec2(0.5,1.0);
vec3 k = vec3(-0.8660254, 0.5, 0.57735);
p = abs(p);
p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
vec2 d = vec2(length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),p.z-h.y);
float a =  min(max(d.x,d.y),0.0) + length(max(d,0.0));

h = vec2(0.4,1.1);
k = vec3(-0.8660254, 0.5, 0.57735);
p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
d = vec2(length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),p.z-h.y);
float b =  min(max(d.x,d.y),0.0) + length(max(d,0.0));

return max(a,-b);`
});

export const renderResultState = atom({
    key: 'renderResultState',
    default: [new Uint8Array(128 * 128 * 4)]
})

export const canvasSizeState = atom({
    key: 'canvasSizeState',
    default: { width: 300, height: 300 }
})

export const sliceNumState = atom({
    key: 'sliceNumState',
    default: 3
})

export default codeState;