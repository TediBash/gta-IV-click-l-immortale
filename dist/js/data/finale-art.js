// Reviewed against the original manual pages. Pixel crops exclude unrelated panels.
const panel=(id,page,x,y,w,h,alt)=>({id,src:`assets/manual/${page}.jpg`,size:[858,1164],crop:[x/858,y/1164,w/858,h/1164],alt});
export const FINALE_ART={
 technical:panel('technical','m10-0',45,670,613,195,'Ale, Ted al computer e Luca con la custodia coordinano la squadra'),
 prototype:panel('prototype','m10-0',477,668,180,197,'Luca tiene pronta la custodia del prototipo'),
 teamRome:panel('team-rome','m10-0',46,382,764,237,'La banda riunita a Roma prima del ritorno'),
 escape:panel('escape-car','m10-0',45,929,601,174,'Spit con le chiavi accanto all’auto, Andy al telefono e Carlitos'),
 bruce:panel('bruce','m10-1',57,450,142,284,'Bruce discute il passaggio da aprire a Roma'),
 twins:panel('twins','m10-1',278,103,340,272,'Paula e Nico insieme a Roma'),
 square:panel('square','m10-2',204,565,602,220,'Click, Anna, Paula e Nico nella piazza di Roma tra folla e lampeggianti'),
 news:panel('news','m10-2',574,814,221,155,'Il notiziario televisivo riferisce un improvviso incidente a Roma'),
 road:panel('homeward','m10-3',53,108,618,261,'Spit guida il furgone della banda sulla strada verso Fossano'),
 reunion:panel('reunion','m10-3',52,731,760,259,'Tutti gli undici amici brindano insieme a Fossano'),
 birthday:panel('birthday','birthday',49,265,755,565,'Klaudio con il controller PlayStation e la torta con trenta candeline a Fossano')
};
const A=FINALE_ART;
export const FINALE_CHAPTER_ART=[A.technical,A.square,A.bruce,A.escape,A.twins,A.teamRome,A.road,A.birthday];
// null deliberately keeps the actual gameplay visible when the manual has no matching action.
export const FINALE_POINT_ART={link:A.technical,ready:A.prototype,ale:A.square,scene:A.square,route:null,bag:null,car:A.escape,paula:A.twins,nico:null,ride:A.escape,aid:A.square,radio:A.news,party:A.reunion,birthday:A.birthday};
export const FINALE_ZONE_ART={service:A.technical,terrace:A.square,backstreet:null,garage:A.escape,fountain:A.twins,convoy:A.square,road:A.road,home:A.reunion};
const lineArt={
 '10.0.intro':[A.technical,A.teamRome],
 '10.1.intro':[A.bruce,A.escape],
 '10.2.intro':[A.twins,null],
 '10.point.radio':[A.news,A.road],
 '10.point.party':[A.reunion,A.reunion,A.reunion],
 '10.point.nico':[null,null]
};
export function finaleLineArt(scope,index){return lineArt[scope]?.[index];}
