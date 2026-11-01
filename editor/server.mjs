import http from 'node:http';
import {readFile,writeFile,mkdir,rename,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,createHash,randomUUID} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=process.env.SW_DATA_ROOT||path.join(root,'src');
const dataFile=path.join(source,'data','players.json');
const port=Number(process.env.PORT||4173),origin=`http://127.0.0.1:${port}`,token=randomBytes(32).toString('hex');
const version=b=>createHash('sha256').update(b).digest('hex');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};
function validate(players){
 if(!Array.isArray(players)||players.length>200)throw Error('Допустимо до 200 игроков.');
 const ids=new Set();
 return players.map(p=>{if(!p||typeof p!=='object')throw Error('Некорректная карточка.');
 const limits={id:80,name:100,nick:80,bio:2000,image:200};const clean={};
 for(const [k,max]of Object.entries(limits)){if(typeof p[k]!=='string'||p[k].length>max)throw Error(`Проверьте поле ${k}.`);clean[k]=p[k].trim()}
 if(!/^[a-zA-Z0-9_-]+$/.test(clean.id)||ids.has(clean.id))throw Error('Идентификаторы игроков должны быть уникальными.');ids.add(clean.id);
 if(!clean.name||!clean.nick)throw Error('Укажите имя и ник.');
 if(clean.image&&!/^img\/[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp)$/i.test(clean.image))throw Error('Используйте загруженное изображение.');
 if(clean.image.split('/').includes('..'))throw Error('Недопустимый путь.');
 if(!Array.isArray(p.games)||!p.games.length||p.games.length>8||p.games.some(g=>typeof g!=='string'||!g.trim()||g.length>50))throw Error('Укажите от 1 до 8 дисциплин.');
 clean.games=[...new Set(p.games.map(g=>g.trim()))];return clean;
 });
}
let saving=false;
const server=http.createServer(async(req,res)=>{
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
 try{
 if(req.headers.host!==`127.0.0.1:${port}`){send(403,{error:'Недопустимый адрес.'});return}
 const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
 if(req.headers['sec-fetch-site']==='cross-site'){send(403,{error:'Запрос запрещён.'});return}
 if(req.method==='GET'&&url.pathname==='/api/players'){const raw=await readFile(dataFile);send(200,{players:JSON.parse(raw.toString().replace(/^\uFEFF/,'')),revision:version(raw),token});return}
 if(req.method!=='POST'||req.headers.origin!==origin||req.headers['x-sw-token']!==token||!req.headers['content-type']?.startsWith('application/json')){send(403,{error:'Откройте редактор с этого компьютера.'});return}
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8*1024*1024){send(413,{error:'Файл слишком большой.'});return}}
 const body=JSON.parse(raw);
 if(url.pathname==='/api/players'){
 if(saving){send(409,{error:'Сохранение уже выполняется. Повторите попытку.'});return}saving=true;
 try{const players=validate(body.players),old=await readFile(dataFile);if(body.revision!==version(old)){send(409,{error:'Состав изменён в другом окне. Обновите страницу перед редактированием.'});return}
 const backups=path.join(path.dirname(source),'.backups');await mkdir(backups,{recursive:true});await writeFile(path.join(backups,`${Date.now()}-${randomUUID()}.json`),old);
 const next=JSON.stringify(players,null,2)+'\n',tmp=dataFile+'.tmp';await writeFile(tmp,next);await rename(tmp,dataFile);send(200,{revision:version(next)});
 }finally{saving=false}return;
 }
 if(url.pathname==='/api/upload'){
 if(typeof body.data!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(body.data))throw Error('Некорректное изображение.');
 const bytes=Buffer.from(body.data,'base64');if(bytes.length>5*1024*1024)throw Error('Максимальный размер фотографии — 5 МБ.');
 let ext;if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)ext='jpg';else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';else throw Error('Поддерживаются JPG, PNG и WebP.');
 const rel=`img/uploads/${randomUUID()}.${ext}`;await mkdir(path.join(source,'img','uploads'),{recursive:true});await writeFile(path.join(source,rel),bytes,{flag:'wx'});send(200,{image:rel});return;
 }
 send(404,{error:'Не найдено.'});return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){send(405,{error:'Метод не поддерживается.'});return}
 let base,relative;if(url.pathname==='/admin'||url.pathname.startsWith('/admin/')){base=path.join(root,'editor');relative=url.pathname==='/admin'||url.pathname==='/admin/'?'index.html':decodeURIComponent(url.pathname.slice(7));if(!['index.html','admin.js','admin.css'].includes(relative)){send(404,{error:'Не найдено.'});return}}
 else{base=source;relative=decodeURIComponent(url.pathname.replace(/^\/src(?=\/|$)/,'').replace(/^\//,''))||'index.html'}
 const file=path.resolve(base,relative);if(!file.startsWith(base+path.sep)){send(403,{error:'Нет доступа.'});return}
 const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){send(e.code==='ENOENT'?404:400,{error:e.code==='ENOENT'?'Файл не найден.':e.message})}
});
server.listen(port,'127.0.0.1',()=>console.log(`Сайт: ${origin}/src/\nРедактор: ${origin}/admin/`));
