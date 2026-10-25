import {createServer} from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2'};
export async function serveRequest(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const requested=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!requested.startsWith(root)){res.writeHead(403);res.end();return;}
  const actual=await realpath(requested),base=await realpath(root);
  if(!actual.startsWith(base+sep)||!(await stat(actual)).isFile()){res.writeHead(403);res.end();return;}
  const data=await readFile(actual);
  res.writeHead(200,{'Content-Type':types[extname(actual)]||'application/octet-stream','Content-Length':data.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch(e){res.writeHead(e instanceof URIError?400:404);res.end('File non trovato');}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||8080),host=process.argv.includes('--lan')?'0.0.0.0':'127.0.0.1';
 const server=createServer(serveRequest);
 server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Porta ${port} occupata: chiudi l’altra istanza del gioco.`:e.message);process.exitCode=1;});
 server.listen(port,host,()=>{console.log(`GTA CLick: apri http://localhost:${port}\nLascia questo terminale aperto. Ctrl+C per terminare.`);if(host==='0.0.0.0')console.log('Smartphone: stessa rete Wi-Fi, apri http://IP-DEL-COMPUTER:'+port);});
}
