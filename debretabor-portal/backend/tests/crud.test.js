require('./helpers');
const { test } = require('node:test');
const assert=require('assert'); const fs=require('fs'); const path=require('path');
const B = require('path').join(__dirname, '..', 'src');
const createCrud=require(B+'/crud/createCrud');
const {errorHandler}=require(B+'/middleware/errorHandler');
const {UPLOAD_DIR}=require(B+'/utils/files');
fs.mkdirSync(UPLOAD_DIR,{recursive:true});
const R=(n)=>require(B+'/resources/'+n);
const sql=()=>globalThis.__sql; const reset=()=>{sql().length=0; globalThis.__handler=null};
function mk(body={},files,params={},query={},user={id:7,role:'Editor'}){return{body,files,params,query,user}}
function run(handler,req){return new Promise((resolve)=>{const res={code:200,status(c){this.code=c;return this},json(b){resolve({code:this.code,body:b})}}; handler(req,res,(err)=>{const r2={status(c){this.c=c;return this},json(b){resolve({code:this.c,body:b})}}; errorHandler(err,req,r2,()=>{})})})}
const tmpFile=(n)=>{fs.writeFileSync(path.join(UPLOAD_DIR,n),'x');return {filename:n}};
test('CRUD factory: validation, enums, dates, files, list queries', async () => {
 // ---- CREATE news: bilingual, bool "false", files, author
 reset(); let news=createCrud(R('news'));
 globalThis.__handler=(s)=>/^INSERT/.test(s)?[{insertId:5}]:[[{id:5,title_en:'T'}]];
 let r=await run(news.create,mk({title_en:' Hello ',title_am:'ሰላም',content_en:'Body',content_am:'',category:'',is_published:'false',evil:'x',id:99},{images:[{filename:'images-1.jpg'},{filename:'images-2.jpg'}]}));
 assert.equal(r.code,201); let ins=sql()[0];
 console.log(ins.sql); console.log(ins.params);
 assert(ins.sql.includes('`title_en`')&&!ins.sql.includes('evil')&&!ins.sql.includes('`id`'));
 assert(!ins.sql.includes('`category`')); // notNull + empty -> DB default
 assert.equal(ins.params[ins.sql.includes('`is_published`')?ins.sql.split(',').findIndex(x=>x.includes('is_published')):0],0);
 assert(ins.params.includes('["/uploads/images-1.jpg","/uploads/images-2.jpg"]')); assert(ins.params.includes(7));
 assert(ins.params.includes('ሰላም')); assert(ins.params.includes(null)); // content_am '' -> NULL
 // ---- validation: missing EN, bad enum, bad dates
 reset(); r=await run(news.create,mk({title_am:'x',content_en:'c'})); assert.equal(r.code,400); assert.match(r.body.message,/title_en is required/); assert.equal(sql().length,0);
 let tenders=createCrud(R('tenders'));
 r=await run(tenders.create,mk({reference_no:'R1',title_en:'t',closing_date:'2026-02-30 10:00',status:'Bogus'})); assert.equal(r.code,400);
 assert.match(r.body.message,/closing_date/); assert.match(r.body.message,/status must be one of: Open, Closed, Awarded/);
 reset(); globalThis.__handler=(s)=>/^INSERT/.test(s)?[{insertId:1}]:[[{id:1}]];
 r=await run(tenders.create,mk({reference_no:'R1',title_en:'t',closing_date:'2026-09-22T10:00',submission_place:'',status:'Open'},{document:[{filename:'document-1.pdf'}]}));
 assert.equal(r.code,201); ins=sql()[0]; console.log(ins.params); assert(ins.params.includes('2026-09-22 10:00:00')); assert(ins.params.includes('/uploads/document-1.pdf')); assert(!ins.sql.includes('submission_place'));
 // duplicate key -> 409 via error handler
 globalThis.__handler=()=>{const e=new Error('dup');e.code='ER_DUP_ENTRY';throw e}; r=await run(tenders.create,mk({reference_no:'R1',title_en:'t',closing_date:'2026-09-22 10:00'},{document:[tmpFile('document-dup.pdf')]}));
 assert.equal(r.code,409); await new Promise(s=>setTimeout(s,50)); assert(!fs.existsSync(path.join(UPLOAD_DIR,'document-dup.pdf')),'orphan upload removed after failed insert');
 // ---- vacancies int/enum
 let vac=createCrud(R('vacancies')); globalThis.__handler=()=>[{insertId:1}];
 r=await run(vac.create,mk({job_code:'J',position_title_en:'p',department:'d',deadline:'2026-10-01',quantity:'0',employment_type:'Intern'})); assert.equal(r.code,400); assert.match(r.body.message,/quantity must be at least 1/); assert.match(r.body.message,/employment_type must be one of/);
 // ---- video: external link OR upload
 let vid=createCrud(R('videoGallery')); globalThis.__handler=(s)=>/^INSERT/.test(s)?[{insertId:3}]:[[{id:3}]];
 r=await run(vid.create,mk({title_en:'v'})); assert.equal(r.code,400); assert.match(r.body.message,/video_url is required/);
 r=await run(vid.create,mk({title_en:'v',video_url:'https://youtu.be/x'})); assert.equal(r.code,201);
 r=await run(vid.create,mk({title_en:'v'},{video:[{filename:'video-1.mp4'}],thumbnail:[{filename:'thumbnail-1.jpg'}]})); assert.equal(r.code,201);
 r=await run(vid.create,mk({title_en:'v',video_url:'javascript:alert(1)'})); assert.equal(r.code,400);
 // ---- photo album requires >=1 image
 let ph=createCrud(R('photoGallery')); r=await run(ph.create,mk({title_en:'a'},{})); assert.equal(r.code,400); assert.match(r.body.message,/at least one file/);
 // ---- projects: decimal + date order
 let pr=createCrud(R('projects')); r=await run(pr.create,mk({title_en:'p',budget:'abc'})); assert.equal(r.code,400);
 r=await run(pr.create,mk({title_en:'p',start_date:'2026-05-01',end_date:'2026-04-01'})); assert.equal(r.code,400); assert.match(r.body.message,/end_date/);
 // ---- UPDATE partial: only sent fields; replaced single file removed
 reset(); fs.writeFileSync(path.join(UPLOAD_DIR,'document-old.pdf'),'x');
 globalThis.__handler=(s)=>/^SELECT/.test(s)?[[{id:4,reference_no:'R',document_url:'/uploads/document-old.pdf',closing_date:'2026-09-22T10:00:00'}]]:[{affectedRows:1}];
 r=await run(tenders.update,mk({status:'Closed'},{document:[{filename:'document-new.pdf'}]},{id:'4'})); assert.equal(r.code,200);
 let upd=sql().find(x=>/^UPDATE/.test(x.sql)); console.log(upd.sql,upd.params); assert(upd.sql.includes('`status` = ?')&&upd.sql.includes('`document_url` = ?')&&!upd.sql.includes('title_en'));
 await new Promise(s=>setTimeout(s,50)); assert(!fs.existsSync(path.join(UPLOAD_DIR,'document-old.pdf')),'old file deleted on replace');
 // update: required field sent empty -> 400, nothing written
 reset(); globalThis.__handler=(s)=>/^SELECT/.test(s)?[[{id:4}]]:[{affectedRows:1}]; r=await run(tenders.update,mk({title_en:''},undefined,{id:'4'})); assert.equal(r.code,400); assert(!sql().some(x=>/^UPDATE/.test(x.sql)));
 // 404s and id validation
 globalThis.__handler=()=>[[]]; r=await run(tenders.update,mk({status:'Open'},undefined,{id:'9'})); assert.equal(r.code,404);
 r=await run(tenders.getOne,mk({},undefined,{id:'abc'})); assert.equal(r.code,404);
 // ---- images keep/remove on update (places)
 let pl=createCrud(R('places')); fs.writeFileSync(path.join(UPLOAD_DIR,'images-a.jpg'),'x'); fs.writeFileSync(path.join(UPLOAD_DIR,'images-b.jpg'),'x');
 reset(); globalThis.__handler=(s)=>/^SELECT/.test(s)?[[{id:2,images:['/uploads/images-a.jpg','/uploads/images-b.jpg']}]]:[{affectedRows:1}];
 r=await run(pl.update,mk({existing_images:JSON.stringify(['/uploads/images-a.jpg','/uploads/evil.jpg'])},{images:[{filename:'images-c.jpg'}]},{id:'2'}));
 upd=sql().find(x=>/^UPDATE/.test(x.sql)); assert.equal(upd.params[0],'["/uploads/images-a.jpg","/uploads/images-c.jpg"]'); await new Promise(s=>setTimeout(s,50)); assert(!fs.existsSync(path.join(UPLOAD_DIR,'images-b.jpg'))); assert(fs.existsSync(path.join(UPLOAD_DIR,'images-a.jpg'))); fs.unlinkSync(path.join(UPLOAD_DIR,'images-a.jpg'));
 r=await run(pl.update,mk({},{images:Array.from({length:6},(_,i)=>({filename:'i'+i+'.jpg'}))},{id:'2'})); assert.equal(r.code,400); assert.match(r.body.message,/at most 5/);
 // places category enum
 r=await run(pl.create,mk({name_en:'x',category:'Zoo'})); assert.equal(r.code,400);
 // ---- LIST: public filter, filters, search escaping, pagination + count
 reset(); let nb=createCrud(R('noticeboard')); globalThis.__handler=(s)=>/COUNT/.test(s)?[[{total:42}]]:[[{id:1}]];
 r=await run(nb.list,mk({},undefined,{},{priority:'Urgent',search:'50%_off',limit:'10',page:'3'})); let q1=sql()[0]; console.log(q1.sql,q1.params);
 assert(q1.sql.includes('t.is_active = 1 AND t.expiry_date >= CURDATE()')); assert(q1.sql.includes('FIELD(t.priority')); assert.deepEqual(q1.params.slice(-2),[10,20]); assert.equal(r.body.total,42);
 assert(q1.params.some(p=>p==='%50\\%\\_off%')); assert(q1.params.includes('Urgent'));
 reset(); r=await run(nb.adminList,mk({},undefined,{},{})); assert(!sql()[0].sql.includes('CURDATE')); 
 // SQL-injection shaped filter value is only ever a bound parameter
 reset(); r=await run(createCrud(R('news')).list,mk({},undefined,{},{category:"x' OR 1=1 --"})); assert(!sql()[0].sql.includes('OR 1=1')); assert(sql()[0].params.includes("x' OR 1=1 --"));
 // ---- DELETE removes uploaded files, not external links
 fs.writeFileSync(path.join(UPLOAD_DIR,'video-del.mp4'),'x'); reset();
 globalThis.__handler=(s)=>/^SELECT/.test(s)?[[{id:1,video_url:'/uploads/video-del.mp4',thumbnail_url:'https://cdn/x.jpg'}]]:[{affectedRows:1}];
 r=await run(vid.remove,mk({},undefined,{id:'1'})); assert.equal(r.code,200); await new Promise(s=>setTimeout(s,50)); assert(!fs.existsSync(path.join(UPLOAD_DIR,'video-del.mp4')));
 // ---- ABOUT upsert by category
 let ab=createCrud(R('aboutCity')); reset(); globalThis.__handler=(s)=>/^SELECT/.test(s)?[[]]:[{affectedRows:1}];
 r=await run(ab.upsert,mk({category:'history',title_en:'H',content_en:'C'})); assert.equal(r.code,201); assert(sql().some(x=>/^INSERT INTO about_city/.test(x.sql)));
 r=await run(ab.upsert,mk({title_en:'H',content_en:'C'},undefined,{category:'bogus'})); assert.equal(r.code,404);
 reset(); globalThis.__handler=(s)=>/^SELECT/.test(s)?[[{id:1,category:'history',title_en:'old'}]]:[{affectedRows:1}];
 r=await run(ab.upsert,mk({title_en:'New'},undefined,{category:'history'})); assert.equal(r.code,200); assert(sql().some(x=>/^UPDATE about_city/.test(x.sql)));
 // ---- events time order + sub-cities bilingual
 let ev=createCrud(R('events')); r=await run(ev.create,mk({title_en:'e',event_date:'2026-10-01',location_en:'sq',start_time:'14:00',end_time:'09:00'})); assert.equal(r.code,400);
 let sc=createCrud(R('subCities')); globalThis.__handler=(s)=>/^INSERT/.test(s)?[{insertId:1}]:[[{id:1}]]; r=await run(sc.create,mk({name_en:'K1',name_am:'ቀበሌ',head_office_location_am:'ዋና',is_active:true})); assert.equal(r.code,201);
});
