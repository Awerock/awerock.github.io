import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
test('persistent roster CRUD, conflict protection, uploads and request isolation',async()=>{
 const temp=await mkdtemp(path.join(tmpdir(),'sleepwalking-test-'));const source=path.join(temp,'src');await mkdir(path.join(source,'data'),{recursive:true});await writeFile(path.join(source,'data/players.json'),'[]');
 const child=spawn(process.execPath,[fileURLToPath(new URL('server.mjs',import.meta.url))],{env:{...process.env,PORT:'4191',SW_DATA_ROOT:source},stdio:['ignore','pipe','pipe']});
 try{await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(Error('Server exited '+code)));setTimeout(()=>reject(Error('Startup timeout')),10000).unref()});
 const base='http://127.0.0.1:4191';let state=await(await fetch(base+'/api/players')).json();assert.deepEqual(state.players,[]);
 const post=(route,data,extra={})=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:base,'X-SW-Token':state.token,...extra},body:JSON.stringify(data)});
 const player={id:'test-player',name:'Тест',nick:'<script>not executed</script>',games:['Apex Legends'],bio:'Описание',image:''};
 let r=await post('/api/players',{players:[player],revision:state.revision},{Origin:'https://example.com'});assert.equal(r.status,403);
 r=await post('/api/players',{players:[player],revision:state.revision},{'X-SW-Token':'invalid'});assert.equal(r.status,403);
 r=await post('/api/players',{players:[player],revision:state.revision});assert.equal(r.status,200);let revision=(await r.json()).revision;
 assert.equal(JSON.parse(await readFile(path.join(source,'data/players.json'),'utf8'))[0].name,'Тест');
 r=await post('/api/players',{players:[],revision:state.revision});assert.equal(r.status,409);
 r=await post('/api/players',{players:[{...player,image:'../secret.jpg'}],revision});assert.equal(r.status,400);
 r=await post('/api/players',{players:[{...player,nick:'Updated'}],revision});assert.equal(r.status,200);revision=(await r.json()).revision;
 r=await post('/api/upload',{data:Buffer.from('<svg></svg>').toString('base64')});assert.equal(r.status,400);
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7XcAAAAASUVORK5CYII=';
 r=await post('/api/upload',{data:png});assert.equal(r.status,200);const upload=await r.json();assert.match(upload.image,/^img\/uploads\/.*\.png$/);assert.equal((await readFile(path.join(source,upload.image))).length,Buffer.from(png,'base64').length);
 r=await post('/api/players',{players:[],revision});assert.equal(r.status,200);assert.deepEqual(JSON.parse(await readFile(path.join(source,'data/players.json'),'utf8')),[]);assert.equal((await readdir(path.join(temp,'.backups'))).length,3);
 assert.equal((await fetch(base+'/admin/server.mjs')).status,404);
 }finally{if(child.exitCode===null){const done=new Promise(resolve=>child.once('exit',resolve));child.kill();await done}await rm(temp,{recursive:true,force:true})}
});
