export const ENEMY_ABILITIES={
 flank:{name:'ACCERCHIAMENTO',kind:'dash',radius:75,range:170,damage:10,color:0xc5df8d},
 charge:{name:'CARICA',kind:'dash',radius:90,range:240,damage:24,color:0xffbd80},
 slam:{name:'SCHIANTO',kind:'self',radius:145,range:190,damage:32,color:0xffb06f},
 pulse:{name:'IMPULSO',kind:'target',radius:100,range:300,damage:24,color:0x89e8ec},
 wave:{name:'ONDA D’URTO',kind:'self',radius:190,range:240,damage:30,color:0xffcb83},
 shield:{name:'BALUARDO',kind:'shield',radius:125,range:210,damage:16,color:0x9fbfff},
 echo:{name:'DOPPIO IMPULSO',kind:'echo',radius:135,range:330,damage:18,color:0xe5abff},
 shock:{name:'SCOSSA',kind:'self',radius:130,range:200,damage:25,color:0xffdd8b},
 tail:{name:'COLPO DI CODA',kind:'self',radius:180,range:220,damage:35,color:0xb6db89},
 scout:{name:'SCATTO TATTICO',kind:'dash',radius:60,range:240,damage:14,color:0xb7e38c},
 snare:{name:'RETE TATTICA',kind:'slow',radius:95,range:290,damage:8,color:0xb7e38c},
 rally:{name:'RICHIAMO',kind:'rally',radius:240,range:350,damage:0,color:0xf7e6a0},
 mortar:{name:'ZONA ESPLOSIVA',kind:'target',radius:115,range:350,damage:25,color:0xffb477},
 heal:{name:'SOCCORSO DI CAMPO',kind:'heal',radius:210,range:350,damage:0,color:0x9affc6},
 drain:{name:'DRENAGGIO',kind:'drain',radius:105,range:320,damage:10,color:0xbd99ff},
 lunge:{name:'AFFONDO',kind:'dash',radius:65,range:270,damage:23,color:0xecb1ff},
 drone:{name:'DRONE D’ASSALTO',kind:'drone',radius:100,range:360,damage:26,color:0x8ae9ff},
 cross:{name:'INCROCIO',kind:'cross',radius:210,range:300,damage:24,color:0xffd291}
};
export const ENEMY_LOADOUTS={
 soldier:['flank','snare','rally'],guard:['charge','shield','snare'],bruiser:['slam','shield','charge'],technician:['pulse','drain','drone'],captain:['wave','rally','charge'],overseer:['shock','cross','drone'],warden:['shield','charge','wave'],pulse:['echo','drain','snare'],alligator:['tail','charge','wave'],
 ranger:['scout','snare','rally'],sapper:['mortar','shock','shield'],riot:['shield','charge','wave'],medic:['heal','drain','snare'],duelist:['lunge','echo','shield'],dronepilot:['drone','drain','echo'],major:['cross','rally','mortar'],scrapking:['slam','shield','lunge'],volt:['drone','drain','cross'],onyx:['echo','shield','lunge']
};
export function abilityIds(type,difficulty={}){return (ENEMY_LOADOUTS[type]||ENEMY_LOADOUTS.guard).slice(0,difficulty.abilities||1);}
