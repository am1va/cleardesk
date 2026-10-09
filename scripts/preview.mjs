import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../verification/site');
const serve=(req,res)=>{
 const path=new URL(req.url,'http://localhost:8087').pathname;
 const name=path==='/cleardesk/'?'index.html':path.startsWith('/cleardesk/')?path.slice(11):'';
 if(!['index.html','app.js','style.css'].includes(name)){res.writeHead(404);res.end('Not found');return;}
 try{const body=readFileSync(resolve(root,name));res.writeHead(200,{'Content-Type':({'index.html':'text/html','app.js':'application/javascript','style.css':'text/css'})[name]+'; charset=utf-8','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(503);res.end('Build the preview first');}
};
createServer(serve).listen(8087,'127.0.0.1',()=>console.log('ClearDesk GitHub-style preview: http://localhost:8087/cleardesk/'));
createServer(serve).listen(8087,'::1');
