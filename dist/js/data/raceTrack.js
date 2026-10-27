/** One geometry source for driving, checkpoints, guidance and circuit scenery. */
export const TRACK=[[190,650],[1080,650],[1130,550],[1130,200],[1050,120],[250,120],[160,200],[160,550]];
export const TRACK_HALF_WIDTH=66;
export function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
export const trackDistance=(x,y)=>Math.min(...TRACK.map((p,i)=>segmentDistance(x,y,p,TRACK[(i+1)%TRACK.length])));
