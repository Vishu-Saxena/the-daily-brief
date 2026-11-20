import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
const root=process.cwd(), build=path.join(root,'.presentation-build');
const p=Presentation.create({slideSize:{width:960,height:720}});
const C={navy:'#142F58',blue:'#173A68',black:'#050505',white:'#FFFFFF',ink:'#111111',gray:'#707070',line:'#AEB7C2',pale:'#EEF2F7',red:'#D92332'};
const liveUrl='https://the-daily-brief-beige.vercel.app/';
const nav=['Outline','Introduction','Architecture','Core Functionality','Advantages & Impact','Conclusion and Future Work'];
function shape(s,g,x,y,w,h,fill='none',stroke='none',sw=0,n='shape'){return s.shapes.add({geometry:g,name:n,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw}})}
function text(s,v,x,y,w,h,size=16,color=C.ink,o={}){const sh=shape(s,'textbox',x,y,w,h,'none','none',0,o.name||'text');sh.text=v;sh.text.style={fontSize:`${size}pt`,typeface:'Arial',color,bold:!!o.bold,italic:!!o.italic,alignment:o.align||'left',verticalAlignment:o.valign||'middle',wrap:'square',autoFit:'shrinkText',insets:o.insets??0};return sh}
function rect(s,x,y,w,h,fill,stroke='none',sw=0,n='block'){return shape(s,'rect',x,y,w,h,fill,stroke,sw,n)}
function rule(s,x1,y1,x2,y2,color=C.line,sw=1){return shape(s,'line',x1,y1,x2-x1,y2-y1,'none',color,sw,'rule')}
function frame(title,section){
 const s=p.slides.add();s.background.fill=C.white;
 rect(s,0,0,480,225,C.black);rect(s,480,0,480,225,C.navy);
 const indexItems=section?[section,...nav.filter(item=>item!==section)]:nav;
 indexItems.forEach((item,i)=>text(s,item===section?`▶  ${item}`:item,68,8+i*20,396,18,8.6,item===section?C.white:'#737373',{bold:item===section,align:'right'}));
 rect(s,0,225,960,73,C.navy);
 if(title)text(s,title,24,229,910,64,23,C.white,{name:'slide title'});
 rect(s,0,690,960,30,C.black);
 text(s,'Mansi Saxena (24MCA016)',20,692,520,24,8.4,C.white,{bold:true});
 rect(s,548,690,412,30,C.navy);text(s,'THE DAILY BRIEF: AI-POWERED NEWS PLATFORM',558,692,392,24,9.5,C.white,{bold:true,align:'center'});
 return s;
}
function note(s,t){s.speakerNotes.text=t}
function bullet(s,y,label,body,o={}){
 const x=o.x??74,labelW=o.labelW??235,bodyW=o.bodyW??560,h=o.h??58,size=o.size??15.5;
 text(s,'▶',x,y,22,h,size+1,C.navy,{bold:true,valign:'top'});
 if(label)text(s,label,x+27,y,labelW,h,size,C.ink,{bold:true,valign:'top'});
 text(s,body,x+27+(label?labelW+8:0),y,bodyW-(label?labelW+8:0),h,size,C.ink,{valign:'top'});
}
function heading(s,v,x,y,w=360){text(s,v,x,y,w,34,17,C.blue)}
function techList(s,title,items,x,y,w){
 heading(s,title,x,y,w);
 items.forEach((it,i)=>{text(s,'▶',x+6,y+44+i*39,20,28,14,C.navy,{bold:true});text(s,it,x+31,y+44+i*39,w-38,30,14.5,C.ink)});
}

// 1 Cover
{
 const s=frame(null,'Outline');
 rect(s,74,260,812,124,C.navy);
 text(s,'THE DAILY BRIEF',94,272,772,52,27,C.white,{align:'center'});
 text(s,'AI-Powered Personalized News Platform',94,326,772,40,18,C.white,{align:'center'});
 text(s,'Presented by:',110,420,740,27,15,C.ink,{bold:true,align:'center'});
 text(s,'Mansi Saxena (24MCA016)',110,448,740,30,16,C.ink,{align:'center'});
 text(s,'Under the Supervision of:',110,494,740,28,15,C.ink,{bold:true,align:'center'});
 text(s,'Prof. Mrinal Kanti Deb Barma',110,523,740,28,16,C.ink,{bold:true,align:'center'});
 text(s,'Professor, CSE Department',110,551,740,27,14.5,C.ink,{align:'center'});
 const coverLink=text(s,'Live project: the-daily-brief-beige.vercel.app',110,592,740,22,12,C.blue,{align:'center',bold:true});coverLink.hyperlink={uri:liveUrl,isExternal:true};
 text(s,'November 2026',110,626,740,24,13,C.ink,{align:'center'});
 note(s,'Good morning or afternoon. I am Mansi Saxena. My project is The Daily Brief, an AI-powered news platform. I will explain why I built it, how the system works, and what readers and writers can do with it. The live project is available at https://the-daily-brief-beige.vercel.app/.');
}
// 2 Outline
{
 const s=frame('Presentation Outline','Outline');
 const items=['Introduction','Architecture and Tech Stack','Core Functionality','System Advantages & Impact','Conclusion and Future Work'];
 items.forEach((v,i)=>text(s,v,76,362+i*56,740,36,17,C.blue));
 note(s,'I will begin with the project background and problem. Then I will cover the technology, main features, benefits, current limits, and future improvements.');
}
// 3 Introduction
{
 const s=frame('Introduction','Introduction');
 bullet(s,326,'The Daily Brief:','A website for reading news and sharing articles written by users.',{labelW:200,bodyW:610,h:58});
 bullet(s,401,'News topics:','Browse stories from eight categories, trending articles, and search results.',{labelW:200,bodyW:610,h:58});
 bullet(s,476,'AI tools:','Get a short summary or help prepare an article.',{labelW:200,bodyW:610,h:58});
 bullet(s,551,'Reader tools:','Follow writers, save stories, listen, like, share, and report concerns.',{labelW:200,bodyW:610,h:60});
 note(s,'The Daily Brief brings news browsing and community publishing into one site. Readers can explore eight categories, search for stories, and read articles written by users. AI can summarize articles and help writers prepare their work.');
}
// 4 Problem Statement
{
 const s=frame('Problem Statement','Introduction');
 bullet(s,322,'Too many stories:','A large news feed can make it hard to choose what to read first.',{labelW:215,bodyW:595,h:58});
 bullet(s,391,'Long articles:','Readers may want the main points before reading the full story.',{labelW:215,bodyW:595,h:58});
 bullet(s,460,'Writing a story:','New writers may need help organizing an article clearly.',{labelW:215,bodyW:595,h:58});
 bullet(s,529,'Checking trust:','Harmful content and claims that may be false need careful review.',{labelW:215,bodyW:595,h:58});
 note(s,'The project responds to four needs: choosing from a large amount of news, understanding long stories quickly, helping people structure articles, and reviewing content concerns.');
}
// 5 Proposed Solution
{
 const s=frame('Proposed Solution','Introduction');
 bullet(s,317,'One news platform:','Browse news by topic and see stories written by users.',{labelW:220,bodyW:590,h:58});
 bullet(s,386,'Quick summaries:','Use AI to see the main points of a story.',{labelW:220,bodyW:590,h:58});
 bullet(s,455,'Writing support:','Start from a topic or a full draft, then edit the article.',{labelW:220,bodyW:590,h:58});
 bullet(s,524,'Reader actions:','Save, like, share, follow writers, or report a concern.',{labelW:220,bodyW:590,h:58});
 bullet(s,593,'Human review:','Send posts that need a closer look to an admin.',{labelW:220,bodyW:590,h:58});
 note(s,'The solution combines category news, AI summaries, and reader-written articles. Writers can start with a topic or a draft and edit the result. The site also supports reader actions and admin review of posts that need more attention.');
}
// 9 Key Functionality (1/2): reading and interaction
{
 const s=frame('Key Functionality (1/2)','Core Functionality');
 bullet(s,322,'News and search:','Browse categories and search news, editorial stories, and user posts.',{labelW:230,bodyW:570,h:62});
 bullet(s,405,'AI summaries:','Generate a short list of key points for an article.',{labelW:230,bodyW:570,h:58});
 bullet(s,484,'Listen to stories:','Use browser speech to read the article text aloud.',{labelW:230,bodyW:570,h:58});
 bullet(s,563,'Reader actions:','Save, like, share, follow the author, or raise a flag with a reason.',{labelW:230,bodyW:570,h:64});
 note(s,'Readers can browse and search stories across different sources, including posts written by users. They can generate an AI summary, listen to a full article, save it, like it, share it, follow its author, or report a concern.');
}
// 10 Key Functionality (2/2): publishing and trust
{
 const s=frame('Key Functionality (2/2)','Core Functionality');
 bullet(s,312,'Create an article:','Write a full draft or give AI a topic to develop.',{labelW:230,bodyW:570,h:58});
 bullet(s,382,'Search only when needed:','AI checks what it knows first, then searches if it needs more information.',{labelW:230,bodyW:570,h:65});
 bullet(s,462,'Edit before posting:','Review the headline and article, and upload your own image.',{labelW:230,bodyW:570,h:58});
 bullet(s,532,'Safety review:','AI screens text and images; admins review flagged or unavailable posts.',{labelW:230,bodyW:570,h:64});
 bullet(s,604,'Author dashboard:','Track posts and likes; edit rejected posts and submit them again.',{labelW:230,bodyW:570,h:55});
 note(s,'Writers can submit a manual draft or create a first draft from a topic. In topic mode, the system checks its existing knowledge before deciding whether to search the web. The writer edits the preview and can add an image. AI screening and admin review help manage posts that need attention.');
}
// 11 Advantages & Impact
{
 const s=frame('Advantages and Impact','Advantages & Impact');
 heading(s,'For Readers',74,340,340);heading(s,'For Writers and Admins',500,340,390);
 const left=['Browse news by topic','Get a quick article summary','Listen to stories','Follow writers and save stories','Report a concern with a reason'];
 const right=['Use AI to structure or draft an article','Edit and add an image before posting','See posts and likes on a dashboard','Review flagged posts and reader reports','Make community articles visible to readers'];
 left.forEach((v,i)=>{text(s,'▶',80,382+i*47,20,28,13,C.navy,{bold:true});text(s,v,105,382+i*47,350,40,13.5,C.ink)});
 right.forEach((v,i)=>{text(s,'▶',506,382+i*47,20,28,13,C.navy,{bold:true});text(s,v,531,382+i*47,360,40,13.5,C.ink)});
 note(s,'Readers can find stories, understand them with AI summaries, and listen to articles. Writers can create and publish articles with help from AI. Admins can review posts and reports that need attention.');
}
// 6 Technology Stack
{
 const s=frame('Technology Stack','Architecture');
 techList(s,'Web Application',['Next.js 14','React','TypeScript','Tailwind CSS','Lucide icons'],74,342,350);
 techList(s,'Data and AI Services',['MongoDB and Mongoose','GridFS for article images','OpenAI API','Google News RSS','Browser speech playback'],500,342,390);
 note(s,'The website uses Next.js, React, and TypeScript. Tailwind CSS styles the pages. MongoDB stores account and article data, while GridFS stores article images. OpenAI provides summaries, writing help, and content screening. Google News RSS supplies external news links.');
}
// 7 Three-tier architecture
{
 const s=frame('Three-Tier Architecture Model','Architecture');
 bullet(s,326,'Presentation Tier:','Next.js and React show pages for browsing, search, and articles.',{labelW:230,bodyW:570,h:62});
 bullet(s,412,'Application Tier:','Server routes handle sign-in, writing, summaries, moderation, and reader actions.',{labelW:230,bodyW:570,h:68});
 bullet(s,505,'Data Tier:','MongoDB stores accounts, stories, likes, follows, and saved items.',{labelW:230,bodyW:570,h:64});
 text(s,'Design Highlight',76,594,810,27,17,C.red);
 text(s,'The website, server, and database each have a clear role.',76,620,810,34,14.5,C.ink);
 note(s,'The system has three parts. The presentation tier contains the pages readers use. The application tier handles requests such as search and article publishing. The data tier stores accounts, stories, and user activity. Uploaded images use GridFS storage linked to the database.');
}
// 8 Role and Feature Matrix (native editable table)
{
 const s=frame('Role and Feature Matrix','Architecture');
 const values=[
  ['Feature','Visitor','Signed-in User','Admin'],
  ['Browse and search stories','Yes','Yes','Yes'],
  ['Save, like, or follow','Sign in','Yes','Yes'],
  ['Publish an article','Sign in','Yes','Yes'],
  ['Review held articles','No','No','Yes'],
  ['Review reader reports','No','No','Yes'],
 ];
 const t=s.tables.add({rows:6,columns:4,left:64,top:360,width:832,height:250,columnWidths:[340,150,180,162],values});
 t.borders.assign({style:'solid',fill:'#555555',width:1});
 for(let r=0;r<6;r++)for(let c=0;c<4;c++){
  const cell=t.getCell(r,c);cell.fill=r===0?C.pale:C.white;
  cell.text.style={fontSize:r===0?'12pt':'11.5pt',typeface:'Arial',color:C.ink,bold:r===0||c===0,alignment:c===0?'left':'center',verticalAlignment:'middle',wrap:'square',autoFit:'shrinkText',insets:4};
 }
 note(s,'Visitors can browse and search public stories. Readers and writers need an account to save, like, follow, or publish. Admin reviewers handle articles held for review and reader reports.');
}
// 12 Conclusion
{
 const s=frame('Conclusion','Conclusion and Future Work');
 bullet(s,327,'A shared platform:','The Daily Brief brings news and community articles together.',{labelW:220,bodyW:590,h:58});
 bullet(s,405,'AI reading and writing:','AI can summarize stories and help prepare article drafts.',{labelW:220,bodyW:590,h:58});
 bullet(s,483,'Reader participation:','Readers can follow writers and interact with stories.',{labelW:220,bodyW:590,h:58});
 bullet(s,561,'Review process:','Admins review content that needs a closer look.',{labelW:220,bodyW:590,h:58});
 note(s,'The Daily Brief combines news discovery, AI support, and community publishing. Readers can take part by following writers and interacting with articles. Admin review supports the platform’s content safety process.');
}
// 13 Future Scope
{
 const s=frame('Future Scope','Conclusion and Future Work');
 bullet(s,322,'AI article images:','Create an image based on the article topic.',{labelW:235,bodyW:575,h:58});
 bullet(s,397,'Related articles:','Suggest connected stories to help readers explore a topic.',{labelW:235,bodyW:575,h:58});
 bullet(s,472,'Improved image checks:','Look for harmful content, misleading edits, and text inside images.',{labelW:235,bodyW:575,h:62});
 bullet(s,552,'Fact checking:','Show sources that support or challenge important claims.',{labelW:235,bodyW:575,h:58});
 note(s,'Future work could generate a suitable image from an article topic, suggest related stories, improve image screening, and compare important factual claims with sources. These are planned improvements; they are not current platform features.');
}
// 14 Thank You
{
 const s=frame(null,'Conclusion and Future Work');
 text(s,'THANK YOU!',120,315,720,58,32,C.navy,{bold:true,align:'center'});
 text(s,'Questions & Discussion',120,388,720,42,21,C.ink,{bold:true,align:'center'});
 text(s,'Mansi Saxena (24MCA016)',120,474,720,30,16,C.ink,{bold:true,align:'center'});
 text(s,'Department of Computer Science and Engineering',100,510,760,28,14.5,C.ink,{align:'center'});
 const endLink=text(s,'Visit the live project: the-daily-brief-beige.vercel.app',100,555,760,28,13,C.blue,{bold:true,align:'center'});endLink.hyperlink={uri:liveUrl,isExternal:true};
 note(s,'Thank you for your time. I am happy to answer your questions about The Daily Brief. You can visit the live project at https://the-daily-brief-beige.vercel.app/.');
}

const draft=path.join(build,'The_Daily_Brief_Sahil_Style_draft.pptx');
await (await PresentationFile.exportPptx(p)).save(draft);
const renderDir=path.join(build,'sahil_style_render');await import('node:fs/promises').then(m=>m.mkdir(renderDir,{recursive:true}));
const fs=await import('node:fs/promises');
for(let i=0;i<p.slides.items.length;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(renderDir,`slide-${String(i+1).padStart(2,'0')}.png`),Buffer.from(await blob.arrayBuffer()));
}
const montage=await p.export({format:'png',montage:true});await fs.writeFile(path.join(build,'The_Daily_Brief_Sahil_Style_montage.png'),Buffer.from(await montage.arrayBuffer()));
console.log(JSON.stringify({draft,slides:p.slides.items.length,renderDir,montage:path.join(build,'The_Daily_Brief_Sahil_Style_montage.png')}));
