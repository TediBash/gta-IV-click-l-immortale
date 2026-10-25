export const ITEMS=[
 {id:'gloves',name:'Guanti da officina',slot:'ARMA',description:'+5 forza · −1 difesa',buffs:{strength:5,defense:-1}},
 {id:'boots',name:'Scarpe antinfortunistiche',slot:'SCARPE',description:'+3 difesa · −8 velocità',buffs:{defense:3,speed:-8}},
 {id:'controller',name:'Controller sperimentale',slot:'GIOIELLO',description:'+1 drone per Ted · livello speciale +1',buffs:{specialLevel:1}}
];
export class WearableItem{constructor(data){Object.assign(this,data);}}
export class EquipmentLoadout{
 constructor(base,slots={}){this.base={...base};this.slots={...slots};}
 equip(id){const item=ITEMS.find(i=>i.id===id);if(!item)return;this.slots[item.slot]=this.slots[item.slot]===id?null:id;}
 stats(){const stats={...this.base,specialLevel:1};for(const id of Object.values(this.slots)){const item=ITEMS.find(i=>i.id===id);for(const [k,v] of Object.entries(item?.buffs||{}))stats[k]=(stats[k]||0)+v;}stats.specialLevel=Math.min(4,stats.specialLevel);return stats;}
}
