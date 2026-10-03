// GPU shaders adapted from the Anchor AI HTML supplied by the user.
// Shapes, water reflection, pointer repulsion and spectral fringe retain the reference behavior.

export const spectralVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
`

export const spectralFragment = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uStrength;
varying vec2 vUv;
void main(){
  vec2 center=vUv-.5;
  float radial=pow(clamp(length(center)*1.75,0.,1.),1.2);
  vec2 direction=length(center)>.0001?normalize(center):vec2(0.);
  vec2 offset=direction*(uStrength*radial)/uResolution;
  vec3 base=texture2D(tDiffuse,vUv).rgb;
  vec3 plusSample=texture2D(tDiffuse,vUv+offset).rgb;
  vec3 minusSample=texture2D(tDiffuse,vUv-offset).rgb;
  float plusLum=dot(plusSample,vec3(.299,.587,.114));
  float minusLum=dot(minusSample,vec3(.299,.587,.114));
  float spectralEdge=abs(plusLum-minusLum);
  vec3 blueTint=vec3(.015,.025,1.);
  vec3 redTint=vec3(1.,.012,.018);
  vec3 fringeTint=mix(blueTint,redTint,step(minusLum,plusLum));
  vec3 color=base+fringeTint*spectralEdge*1.65;
  color.g=max(0.,color.g-spectralEdge*.72);
  gl_FragColor=vec4(color,1.);
}
`

export const particleVertex = /* glsl */ `
attribute float aSize,aPhase,aDrift;
attribute vec3 aTarget,aSphere;
uniform float uTime,uPixelRatio,uMorph,uIntro,uOpacity,uHover,uTreeRadius,uCubeRadius,uTreeSpread,uCubeSpread,uTreeCore,uCubeCore,uTreeRamp,uCubeRamp;
uniform float uPointScale,uDepthOffset;
uniform vec2 uPointer,uResolution;
varying float vGlow,vOpacity,vDepth;
void main(){
  float m=smoothstep(0.,1.,uMorph),intro=smoothstep(0.,1.,uIntro);
  vec3 treeShape=mix(aSphere,position,intro);
  vec3 p=mix(treeShape,aTarget,m);
  float wind=sin(uTime*.75+p.y*1.65+aPhase)*(.025+smoothstep(2.5,7.,p.y)*(1.-m)*.14)*intro;
  p.x+=wind+aDrift*mod(uTime*.16+aPhase,6.)*intro;
  p.z+=sin(uTime*.55+aPhase)*.025*(1.-m)*intro;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  vec2 screen=(gl_Position.xy/gl_Position.w*.5+.5)*uResolution;
  vec2 delta=screen-uPointer;
  float dist=length(delta);
  float radius=mix(uTreeRadius,uCubeRadius,m);
  float ramp=clamp(1.-dist/radius,0.,1.);
  ramp=ramp*ramp*(3.-2.*ramp);
  ramp=pow(max(ramp,.0001),mix(uTreeRamp,uCubeRamp,m));
  float core=mix(uTreeCore,uCubeCore,m);
  float softCore=mix(core,1.,smoothstep(0.,radius*.34,dist));
  float repel=ramp*softCore*uHover*intro;
  float spread=mix(uTreeSpread,uCubeSpread,m);
  gl_Position.xy+=normalize(delta+vec2(.001))*repel*spread*gl_Position.w;
  vDepth=clamp((-mv.z-uDepthOffset-8.)/14.,0.,1.);
  float depthScale=mix(1.28,.72,vDepth);
  gl_PointSize=aSize*depthScale*uPixelRatio*uPointScale*(27./-mv.z)*(1.+repel*mix(.07,.22,m));
  vGlow=.62+.38*sin(aPhase+uTime*1.4);
  vOpacity=uOpacity;
}
`

export const particleFragment = /* glsl */ `
varying float vGlow,vOpacity,vDepth;
void main(){
  float d=length(gl_PointCoord-.5);
  float c=1.-smoothstep(0.,.19,d),h=1.-smoothstep(.08,.5,d);
  vec3 nearCol=vec3(.12,.82,1.),farCol=vec3(.018,.16,.72);
  vec3 col=mix(nearCol,farCol,vDepth);
  col=mix(col,vec3(.62,.97,1.),c*.55);
  float depthAlpha=mix(1.,.48,vDepth);
  gl_FragColor=vec4(col,(c+h*.38)*vGlow*vOpacity*depthAlpha);
}
`

export const reflectionVertex = /* glsl */ `
attribute float aSize,aPhase,aDrift;
attribute vec3 aTarget,aSphere;
uniform float uTime,uMorph,uPixelRatio,uIntro,uPointScale;
varying float vFade,vGlint,vMorph;
void main(){
  float m=smoothstep(0.,1.,uMorph);
  vMorph=m;
  float intro=smoothstep(0.,1.,uIntro);
  vec3 p=mix(mix(aSphere,position,intro),aTarget,m);
  float wind=sin(uTime*.75+p.y*1.65+aPhase)*(.018+smoothstep(2.5,7.,p.y)*(1.-m)*.08);
  p.x+=wind+aDrift*mod(uTime*.16+aPhase,6.);
  vec4 world=modelMatrix*vec4(p,1.);
  float waterY=-.58;
  float sourceHeight=max(0.,world.y-waterY);
  world.y=waterY-sourceHeight*.66;
  float breakup=sin(sourceHeight*7.5+world.x*1.7-uTime*1.4+aPhase)*(.025+sourceHeight*.018)*mix(1.,1.55,m);
  world.x+=breakup+sin(world.z*3.+uTime*.55)*sourceHeight*.012;
  world.z+=cos(world.x*2.2-uTime*.38+aPhase)*sourceHeight*.008;
  vec4 mv=viewMatrix*world;
  gl_Position=projectionMatrix*mv;
  float distanceFade=exp(-sourceHeight*.22)*(1.-smoothstep(8.,11.,sourceHeight));
  float bands=.38+.62*pow(.5+.5*sin(sourceHeight*8.-uTime*1.3+aPhase*.15),3.);
  vFade=distanceFade*bands;
  vGlint=.55+.45*sin(aPhase+uTime*.62);
  gl_PointSize=aSize*mix(.78,1.416,m)*(.85+vGlint*.2)*uPixelRatio*uPointScale*(26./-mv.z);
}
`

export const reflectionFragment = /* glsl */ `
varying float vFade,vGlint,vMorph;
void main(){
  vec2 uv=gl_PointCoord-.5;
  float d=length(uv);
  float core=1.-smoothstep(0.,mix(.2,.11,vMorph),d),halo=1.-smoothstep(mix(.055,.015,vMorph),.5,d);
  float coreWeight=mix(1.,.28,vMorph),haloWeight=mix(.38,.82,vMorph);
  vec3 treeCol=mix(vec3(.015,.28,.78),vec3(.12,.84,1.),core+vGlint*.2);
  vec3 cubeCol=mix(vec3(.015,.18,.55),vec3(.06,.5,.88),halo);
  vec3 col=mix(treeCol,cubeCol,vMorph);
  float brightness=mix(.5,.27,vMorph);
  gl_FragColor=vec4(col,(core*coreWeight+halo*haloWeight)*vFade*brightness);
}
`

export const waterVertex = /* glsl */ `
uniform float uTime,uMorph;
varying vec3 vP;
varying float vH;
float wave(vec2 p){
  float r=length(p);
  return sin(r*3.1-uTime*1.8)*.12*exp(-r*.065)+sin(p.x*1.35+uTime*.7)*.045+sin(p.y*1.8-uTime*.55)*.035;
}
void main(){
  vec3 p=position;
  float h=wave(p.xz);
  p.y+=h;
  vP=p;
  vH=h;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}
`

export const waterFragment = /* glsl */ `
uniform float uTime;
varying vec3 vP;
varying float vH;
void main(){
  float e=.06;
  float hx=sin((length(vP.xz+vec2(e,0.))*3.1)-uTime*1.8)*.12;
  float hz=sin((length(vP.xz+vec2(0.,e))*3.1)-uTime*1.8)*.12;
  vec3 n=normalize(vec3(vH-hx,e,vH-hz));
  vec3 l=normalize(vec3(-.35,1.,.25));
  float spec=pow(max(dot(reflect(-l,n),normalize(vec3(0.,1.,.6))),0.),36.);
  float wave=.5+.5*sin(length(vP.xz)*4.-uTime*1.7);
  float rings=pow(wave,14.4);
  float halo=pow(wave,5.5);
  float fade=exp(-length(vP.xz)*.1);
  float shimmer=pow(max(0.,sin(vP.x*2.8+uTime*.85)*cos(vP.z*4.2-uTime*.62)),18.)*fade;
  vec3 col=mix(vec3(.006,.028,.061),vec3(.022,.374,.792),rings*.5+spec);
  col+=vec3(.088,.605,1.)*(shimmer*.3+spec*.24+halo*fade*.045);
  gl_FragColor=vec4(col,.48+fade*.18+rings*.11+halo*fade*.025+shimmer*.13);
}
`

export const rippleVertex = /* glsl */ `
attribute float aAngle,aBand,aJitter,aSize,aPhase;
uniform float uTime,uPixelRatio;
varying float vAlpha,vSpark;
void main(){
  float cycle=mod(aBand*2.25+uTime*.48,13.5);
  float r=.7+cycle+aJitter;
  float angle=aAngle+sin(uTime*.12+aPhase)*.012;
  vec3 p=vec3(cos(angle)*r,-.51,sin(angle)*r);
  p.y+=sin(r*3.1-uTime*1.8)*.105*exp(-r*.06);
  float inner=smoothstep(.3,1.6,cycle),outer=1.-smoothstep(9.5,13.5,cycle);
  float flick=.68+.32*sin(aPhase+uTime*.75);
  vAlpha=inner*outer*flick;
  vSpark=pow(flick,3.);
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=aSize*(1.+vSpark*.32)*uPixelRatio*(25./-mv.z);
}
`

export const rippleFragment = /* glsl */ `
varying float vAlpha,vSpark;
void main(){
  float d=length(gl_PointCoord-.5);
  float core=1.-smoothstep(0.,.18,d),halo=1.-smoothstep(.06,.5,d);
  vec3 col=mix(vec3(.015,.28,.9),vec3(.25,.92,1.),core+vSpark*.2);
  gl_FragColor=vec4(col,(core+halo*.38)*vAlpha*.72);
}
`

export const mistVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
`

export const mistFragment = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
void main(){
  vec2 p=vUv-.5;
  float radial=exp(-dot(p*vec2(1.1,1.45),p*vec2(1.1,1.45))*8.);
  float mist=.86+.14*sin(uTime*.18+vUv.y*5.);
  gl_FragColor=vec4(.015,.22,.55,radial*mist*.2);
}
`

export const shaftVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
`

export const shaftFragment = /* glsl */ `
varying vec2 vUv;
void main(){
  float x=abs(vUv.x-.5)*2.;
  float shaft=pow(max(0.,1.-x),4.)*sin(vUv.y*3.14159);
  gl_FragColor=vec4(.03,.42,.9,shaft*.055);
}
`

export const starVertex = /* glsl */ `
attribute float aSize,aPhase;
uniform float uTime,uPixelRatio;
varying float vGlow;
void main(){
  float twinkle=.5+.5*sin(aPhase+uTime*.34);
  vec4 mv=modelViewMatrix*vec4(position,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=aSize*1.85*(.86+twinkle*.3)*uPixelRatio*(28./-mv.z);
  vGlow=.42+.58*twinkle;
}
`

export const starFragment = /* glsl */ `
varying float vGlow;
void main(){
  float d=length(gl_PointCoord-.5);
  float core=1.-smoothstep(0.,.22,d),halo=1.-smoothstep(.05,.5,d);
  gl_FragColor=vec4(vec3(1.),(core+halo*.68)*vGlow);
}
`

export const bokehVertex = /* glsl */ `
attribute float aSize,aPhase;
uniform float uTime,uPixelRatio;
varying float vAlpha;
void main(){
  vec3 p=position;
  p.x+=sin(uTime*.11+aPhase)*.35;
  p.y+=cos(uTime*.08+aPhase)*.2;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=aSize*uPixelRatio*(18./-mv.z);
  vAlpha=.035+.025*sin(uTime*.17+aPhase);
}
`

export const bokehFragment = /* glsl */ `
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-.5);
  float a=1.-smoothstep(.05,.5,d);
  gl_FragColor=vec4(.1,.55,1.,a*vAlpha);
}
`
