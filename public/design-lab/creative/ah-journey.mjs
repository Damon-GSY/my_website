// Layout-derived endpoints with screen-space flights and document-space holds.
// Scroll reversal needs no accumulated state.
export const clamp = (value, min=0, max=1) => Math.max(min, Math.min(max, value));
export const ease = value => { const t=clamp(value); return t*t*t*(t*(t*6-15)+10); };
export function travel(from, to, progress, rail) {
  const t=ease(progress),v=1-t;
  if(from.x===to.x&&from.y===to.y)return {x:from.x,y:from.y,radius:from.radius+(to.radius-from.radius)*t};
  return {
    x:v*v*v*from.x+3*v*v*t*rail+3*v*t*t*rail+t*t*t*to.x,
    y:from.y+(to.y-from.y)*t,
    radius:from.radius+(to.radius-from.radius)*t,
  };
}
export function segment(stops, scroll) {
  for(let i=1;i<stops.length;i++)if(scroll<stops[i].at)return {from:stops[i-1],to:stops[i],progress:clamp((scroll-stops[i-1].at)/(stops[i].at-stops[i-1].at))};
  const last=stops.at(-1);return {from:last,to:last,progress:1};
}

// Free flights follow a screen-space composition, not a document-space arc.
// Interpolating document Y and then subtracting scroll adds an unwanted
// (ease(t)-t)*scrollSpan excursion on long sections. The actor stays docked
// during holds; graph motion is still supplied by the real spring endpoint.
export function focusTravel(from, to, progress, scroll) {
  if(from.point.x===to.point.x&&from.point.y===to.point.y)return travel(from.point,to.point,progress,from.point.x);
  const a={...from.point,y:from.point.y-from.at},b={...to.point,y:to.point.y-to.at};
  const point=travel(a,b,progress,(a.x+b.x)/2);
  return {...point,y:point.y+scroll};
}

// A native sticky heading holds two real glyphs in one composition. Convert
// each viewport dock at its own beat, so lateral travel does not drift upward.
export function workStops(title, percent, start, distance) {
  return [['built',title,0],['built-hold',title,.25],['percent',percent,.84],['percent-hold',percent,1]].map(([id,point,beat])=>{
    const at=start+distance*beat;
    return {id,at,point:{...point,y:point.y+at}};
  });
}

// A closed-form damped impulse: one clear jump, a smaller rebound, then an
// exact rest. The drawn spring and the actor both sample this function.
export function springOffset(progress) {
  const t=clamp(progress);
  return Math.exp(-4.4*t)*Math.sin(3*Math.PI*t)*ease(t/.09)*(1-ease((t-.8)/.2));
}

export function flight(from,to,progress,scroll,height) {
  const u=clamp(progress),spring=from.id==='built-hold'&&to.id==='percent';
  const holding=to.id.endsWith('hold')||from===to;
  const t=spring?clamp((u-.1)/.9):u;
  const point=focusTravel(from,to,t,scroll);
  if(holding)return {...point,scaleX:1,scaleY:1,angle:0};
  const radius=height<900?12:20;
  const departure=ease(t/.22),arrival=ease((t-.78)/.22);
  const airborne=from.point.radius+(radius-from.point.radius)*departure;
  point.radius=airborne+(to.point.radius-airborne)*arrival;
  const amplitude=spring?Math.min(height*.13,Math.abs(to.point.x-from.point.x)*.3):Math.min(65,height*.075);
  const impulse=springOffset(t);
  point.y-=amplitude*impulse;
  // The incoming Built glyph is already readable during this handoff. Give
  // the actor a clear overhead approach instead of cutting through its stem.
  if(from.id==='hero-hold'&&to.id==='built')point.y-=Math.min(height*.15,130)*Math.sin(Math.PI*t)**2;
  // Anticipation is local to the glyph, not a second actor. Squash/stretch is
  // fully reversible and becomes exactly circular at each docking boundary.
  const preload=spring&&u<.1?Math.sin(Math.PI*u/.1)**2:0;
  const impact=Math.sin(Math.PI*clamp((t-.78)/.22))**2;
  const stretch=.15*Math.sin(Math.PI*t)**2;
  const scaleX=1+.26*preload+.15*impact-stretch;
  return {...point,scaleX,scaleY:1/scaleX,angle:0};
}

const mix = (from,to,t) => from+(to-from)*t;
const cubic = (a,b,c,d,t) => {
  const v=1-t;
  return v*v*v*a+3*v*v*t*b+3*v*t*t*c+t*t*t*d;
};

// Rounded lift, clear horizontal corridor, rounded landing. Matching the
// horizontal tangent at both joins makes this one flight, not three hops.
function corridorTravel(from,to,progress,laneY) {
  if(progress<=0)return {...from};
  if(progress>=1)return {...to};
  const t=ease(progress),dx=to.x-from.x;
  const turn=.28,cruise=.44,edge=.18;
  const tangent=(1-2*edge)*turn/cruise/3;
  let x,y;
  if(t<turn){
    const u=t/turn;
    x=cubic(from.x,from.x,from.x+dx*(edge-tangent),from.x+dx*edge,u);
    y=cubic(from.y,mix(from.y,laneY,.58),laneY,laneY,u);
  }else if(t>1-turn){
    const u=(t-(1-turn))/turn;
    x=cubic(to.x-dx*edge,to.x-dx*(edge-tangent),to.x,to.x,u);
    y=cubic(laneY,laneY,mix(to.y,laneY,.58),to.y,u);
  }else{
    x=mix(from.x+dx*edge,to.x-dx*edge,(t-turn)/cruise);
    y=laneY;
  }
  return {x,y,radius:mix(from.radius,to.radius,t)};
}

// The work glyphs share a pinned stage. Unlike the spring study, this route
// never rebounds below a glyph or paints a historical line over readable type.
export function workFlight(from,to,progress,scroll,height,laneY) {
  const u=clamp(progress),t=ease(u);
  const a={...from.point,y:from.point.y-from.at};
  const b={...to.point,y:to.point.y-to.at};
  const dx=b.x-a.x,direction=dx<0?-1:1;
  // Corners have a physical radius, never a percentage of the page width.
  // This keeps the descent directly over the % instead of cutting through 0.
  const rise=a.y-laneY,fall=b.y-laneY;
  const corner=Math.max(0,Math.min(18,Math.abs(dx)/2,rise,fall));
  const lift=rise-corner,drop=fall-corner,across=Math.abs(dx)-2*corner;
  const turn=Math.PI*corner/2;
  let distance=t*(lift+2*turn+across+drop),x,y;
  if(distance<lift){
    x=a.x;y=a.y-distance;
  }else if((distance-=lift)<turn){
    const angle=distance/corner;
    x=a.x+direction*corner*(1-Math.cos(angle));
    y=laneY+corner*(1-Math.sin(angle));
  }else if((distance-=turn)<across){
    x=a.x+direction*(corner+distance);y=laneY;
  }else if((distance-=across)<turn){
    const angle=distance/corner;
    x=b.x-direction*corner*(1-Math.sin(angle));
    y=laneY+corner*(1-Math.cos(angle));
  }else{
    x=b.x;y=laneY+corner+Math.min(drop,distance-turn);
  }
  const point=u===0?{...a}:u===1?{...b}:{x,y,radius:mix(a.radius,b.radius,t)};
  const airborne=Math.sin(Math.PI*u)**2;
  const flightRadius=Math.min(height*.014,14);
  point.radius=mix(point.radius,Math.max(a.radius,flightRadius),airborne*.55);
  const landing=Math.sin(Math.PI*clamp((u-.84)/.16))**2;
  const scaleX=1-.08*airborne+.13*landing;
  return {...point,y:point.y+scroll,scaleX,scaleY:1/scaleX,angle:0};
}

export const RESEARCH_BEATS = Object.freeze({
  nodes: Object.freeze([0,.19,.38,.57]),
  nodeHold: .07,
  paperDeparture: .65,
  papers: Object.freeze([.82,.95]),
  paperHold: .055,
  end: 1,
});

function researchArc(from,to,fromAngle,toAngle,progress,rail) {
  if(progress<=0)return {...from};
  if(progress>=1)return {...to};
  const t=ease(progress),angle=mix(fromAngle,toAngle,t);
  // The small endpoint correction preserves measured layout docks even if
  // font rounding places them a fraction off the ideal ellipse.
  const x=rail.cx+rail.rx*Math.cos(angle);
  const y=rail.cy+rail.ry*Math.sin(angle);
  const fromX=from.x-(rail.cx+rail.rx*Math.cos(fromAngle));
  const fromY=from.y-(rail.cy+rail.ry*Math.sin(fromAngle));
  const toX=to.x-(rail.cx+rail.rx*Math.cos(toAngle));
  const toY=to.y-(rail.cy+rail.ry*Math.sin(toAngle));
  return {x:x+mix(fromX,toX,t),y:y+mix(fromY,toY,t),radius:mix(from.radius,to.radius,t)};
}

// Four named research docks, then two paper docks. Every value is derived
// from progress; pausing, dragging backwards and direct seeking are identical.
export function researchFrame(progress,g) {
  const p=clamp(progress),beats=RESEARCH_BEATS;
  let dot={...g.nodes[0]},phase='node-hold',activeNode=0,activePaper=-1,nodeProgress=0;
  const nodeWeights=[1,0,0,0],paperWeights=[0,0];
  for(let i=0;i<3;i++){
    if(p<beats.nodes[i+1]){
      const q=clamp((p-beats.nodes[i]-beats.nodeHold)/(beats.nodes[i+1]-beats.nodes[i]-beats.nodeHold));
      dot=researchArc(g.nodes[i],g.nodes[i+1],g.nodeAngles[i],g.nodeAngles[i+1],q,g.rail);
      phase=q>0?'node-travel':'node-hold';
      activeNode=q>.5?i+1:i;nodeProgress=i+ease(q);
      nodeWeights.fill(0);nodeWeights[i]=1-ease(q);nodeWeights[i+1]=ease(q);
      return {dot:{...dot,scaleX:1,scaleY:1,angle:0},phase,activeNode,activePaper,nodeProgress,nodeWeights,paperWeights,progress:p};
    }
  }
  dot={...g.nodes[3]};activeNode=3;nodeProgress=3;
  nodeWeights.fill(0);nodeWeights[3]=1;
  if(p>beats.paperDeparture){
    const q=clamp((p-beats.paperDeparture)/(beats.papers[0]-beats.paperDeparture));
    const lane=g.paperLane??Math.min(g.nodes[3].y,g.papers[0].y,g.rail.cy-g.rail.ry)-28;
    dot=corridorTravel(g.nodes[3],g.papers[0],q,lane);
    phase=q<1?'paper-handoff':'paper-hold';
    nodeWeights[3]=1-ease(q);paperWeights[0]=ease(q);
    if(q>.5)activeNode=-1;
    if(q===1)activePaper=0;
  }
  if(p>=beats.papers[0]+beats.paperHold){
    const q=clamp((p-beats.papers[0]-beats.paperHold)/(beats.papers[1]-beats.papers[0]-beats.paperHold));
    const t=ease(q);
    // The paper docks sit in one reserved gutter: no diagonal cuts through
    // titles and no orbit-like flourish after the reading focus has landed.
    dot={x:mix(g.papers[0].x,g.papers[1].x,t),y:mix(g.papers[0].y,g.papers[1].y,t),radius:mix(g.papers[0].radius,g.papers[1].radius,t)};
    phase=q<1?'paper-travel':'paper-hold';activeNode=-1;activePaper=q>.5?1:0;
    nodeWeights.fill(0);paperWeights[0]=1-t;paperWeights[1]=t;
  }
  return {dot:{...dot,scaleX:1,scaleY:1,angle:0},phase,activeNode,activePaper,nodeProgress,nodeWeights,paperWeights,progress:p};
}

// One persistent actor expands to cover the viewport, then resolves back to
// the research hub. The inner shape carries focus while the orange rim is off
// screen. No hidden position swap or per-frame spring integration.
export function shapeFrame(progress,point,width,height) {
  const u=clamp(progress),blend=(a,b)=>ease((u-a)/(b-a));
  const cover=Math.hypot(Math.max(point.x,width-point.x),Math.max(point.y,height-point.y))+32;
  const expansion=blend(.08,.36),contraction=blend(.72,1);
  const radius=point.radius+(cover-point.radius)*expansion*(1-contraction);
  const appear=blend(.21,.39),pill=blend(.43,.67),shrink=1-blend(.73,.9);
  const size=Math.min(width*.22,190),pillWidth=Math.min(width*.86,700,Math.min(point.x,width-point.x)*2-48);
  const tileWidth=(size+(pillWidth-size)*pill)*appear*shrink;
  const tileHeight=(size+(Math.min(96,width*.18,pillWidth/5)-size)*pill)*appear*shrink;
  return {radius,tileWidth,tileHeight,corner:Math.min(tileHeight/2,22+pill*40),
    angle:-24*(1-blend(.26,.47))+10*Math.sin(Math.PI*pill),
    labelOpacity:blend(.57,.67)*(1-blend(.73,.8)),dark:u>=.4};
}
