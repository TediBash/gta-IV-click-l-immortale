const atlases={duo:['click','ted'],cast:['child-click','child-paula','child-nico','spit'],cast45:['andy','bruce','alligator'],cast678:['carlitos','ale','luca'],castFinal:['anna','paula','nico','click-suit']};
export const CHARACTER_ATLASES=atlases;
export function appearance(id,{children=false,elegant=false}={}){
 const skin=children?'child-'+id:id==='click'&&elegant?'click-suit':id;
 for(const [texture,names]of Object.entries(atlases))if(names.includes(skin))return {texture,skin,row:names.indexOf(skin),rows:names.length};
 throw new Error('Missing character skin: '+skin);
}
