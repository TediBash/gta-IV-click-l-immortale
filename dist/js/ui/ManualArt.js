const safe=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let serial=0;
// The crop is a viewport into the original page, never a stretched screenshot.
export function artGeometry(art){
 const [x,y,w,h]=art.crop, [pw,ph]=art.size||[126,171];
 if(![x,y,w,h,pw,ph].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>1.001||y+h>1.001||pw<=0||ph<=0)throw new Error('Invalid illustration viewport');
 return {x:x*pw,y:y*ph,w:w*pw,h:h*ph,pw,ph};
}
export function artMarkup(art){
 if(!art)return '';
 const {x,y,w,h,pw,ph}=artGeometry(art),id=`manual-clip-${++serial}`;
 return `<svg class="manual-viewport" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${safe(art.alt)}" style="--art-ratio:${w/h}"><title>${safe(art.alt)}</title><defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${safe(art.src)}" width="${pw}" height="${ph}" preserveAspectRatio="none" clip-path="url(#${id})"/></svg>`;
}
