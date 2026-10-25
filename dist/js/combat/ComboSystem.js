export class ComboSystem{
 constructor(){this.buffers=new Map();}
 push(id,time){const b=(this.buffers.get(id)||[]).filter(t=>time-t<1250);b.push(time);this.buffers.set(id,b.slice(-3));return b.length;}
 consume(id,time){const b=(this.buffers.get(id)||[]).filter(t=>time-t<1250);this.buffers.set(id,[]);return b.length>=2;}
}
