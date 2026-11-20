import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root=process.cwd(), build=path.join(root,'.presentation-build');
const deck=Presentation.create({slideSize:{width:960,height:720}});
const K={blue:'#3835B8',black:'#090909',white:'#FFFFFF',text:'#111111',gray:'#757575',light:'#F7F7F7',line:'#C8C8C8'};
const nav=['Introduction','Motivation','Problem Statement','Proposed Solution','Competitive Analysis','System Architecture','Methodology','Project Workflow','Product Screens','Challenges & Solutions','Limitations','Future Improvements','Conclusion'];
const font='Arial';
function addShape(s,geometry,x,y,w,h,fill='none',stroke='none',sw=0,name='shape'){
 return s.shapes.add({geometry,name,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw}});
}
function text(s,value,x,y,w,h,size=17,color=K.text,o={}){
 const sh=addShape(s,'textbox',x,y,w,h,'none','none',0,o.name||'text'); sh.text=value;
 sh.text.style={fontSize:`${size}pt`,typeface:font,color,bold:!!o.bold,italic:!!o.italic,alignment:o.align||'left',verticalAlignment:o.valign||'middle',wrap:'square',autoFit:'shrinkText',insets:o.insets??0};
 return sh;
}
function rect(s,x,y,w,h,fill,stroke='none',sw=0,name='block') {return addShape(s,'rect',x,y,w,h,fill,stroke,sw,name);}
function rule(s,x1,y1,x2,y2,color=K.line,sw=1){return addShape(s,'line',x1,y1,x2-x1,y2-y1,'none',color,sw,'rule');}
function frame(title,active=null){
 const s=deck.slides.add();s.background.fill=K.white;
 rect(s,0,0,480,225,K.black);rect(s,480,0,480,225,K.blue);
 nav.forEach((item,i)=>text(s,item,80,7+i*16.1,385,15,8.5,item===active?K.white:'#777777',{bold:item===active,align:'right'}));
 rect(s,0,225,960,73,K.blue);
 if(title)text(s,title,24,230,910,62,23,K.white,{name:'section title'});
 rect(s,0,690,960,30,K.black);
 text(s,'Under the Supervision of Prof. Mrinal Kanti Deb Barma, Professor, CSE Department',22,692,525,25,8.2,K.white,{bold:true});
 rect(s,548,690,412,30,K.blue);
 text(s,'THE DAILY BRIEF · AI NEWS PLATFORM',558,692,392,25,10,K.white,{bold:true,align:'center'});
 return s;
}
function note(s,t){s.speakerNotes.text=t;}
function bullet(s,y,lead,body,opts={}){
 const x=opts.x??78, labelW=opts.labelW??220, bodyW=opts.bodyW??600, h=opts.h??56, size=opts.size??16;
 text(s,'▶',x,y,24,h,size+1,K.blue,{bold:true,valign:'top'});
 text(s,lead,x+28,y,labelW,h,size,K.text,{bold:true,valign:'top'});
 text(s,body,x+28+labelW+8,y,bodyW,h,size,K.text,{valign:'top'});
}
function image(slide,file,x,y,w,h,alt){return fs.readFile(path.join(build,'assets',file)).then(bytes=>slide.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}}));}
function diagramBox(s,x,y,w,h,titleText,body,fill='#FFFFFF'){
 rect(s,x,y,w,h,fill,K.blue,1.5,'system block');
 text(s,titleText,x+12,y+8,w-24,28,14,K.blue,{bold:true,align:'center'});
 text(s,body,x+14,y+41,w-28,h-48,12,K.text,{align:'center',valign:'top'});
}
function connector(s,x1,y1,x2,y2,label=''){
 if(y1===y2) rule(s,x1,y1,x2,y2,K.blue,2);
 else {
  const elbow=(x1+x2)/2, low=Math.min(y1,y2), high=Math.max(y1,y2);
  rule(s,x1,y1,elbow,y1,K.blue,2);
  rule(s,elbow,low,elbow,high,K.blue,2);
  rule(s,elbow,y2,x2,y2,K.blue,2);
 }
 // Use an editable text arrow so its direction is clear.
 text(s,'▶',x2-17,y2-13,18,24,12,K.blue,{bold:true,align:'center'});
 if(label)text(s,label,(x1+x2)/2-58,y1-26,116,20,9,K.gray,{align:'center'});
}

// 1 Cover
{
 const s=frame(null);
 rect(s,72,260,816,112,K.blue);
 text(s,'THE DAILY BRIEF',92,272,776,50,29,K.white,{align:'center',bold:true});
 text(s,'AI-Powered Personalized News Platform',92,321,776,37,19,K.white,{align:'center'});
 text(s,'Under the Supervision of',120,420,720,28,16,K.text,{align:'center'});
 text(s,'Prof. Mrinal Kanti Deb Barma, Professor, CSE Department',100,451,760,32,17,K.text,{align:'center'});
 text(s,'Presented by',120,515,720,26,15,K.text,{align:'center'});
 text(s,'Mansi Saxena (24MCA016)',120,544,720,30,18,K.text,{bold:true,align:'center'});
 text(s,'MCA PROJECT PRESENTATION',120,622,720,22,10,K.gray,{bold:true,align:'center'});
 note(s,'Good morning or afternoon. My project is The Daily Brief, an AI-powered news platform. I will explain the problem it addresses, show how readers and writers use it, and describe how its main parts work together.');
}
// 2 Contents
{
 const s=frame('Table of Contents');
 const contents=['Introduction','Motivation','Problem Statement','Proposed Solution','Competitive Analysis','System Architecture','Methodology','Project Workflow','Product Screens','Challenges and Solutions','Limitations','Future Improvements','Conclusion'];
 contents.forEach((item,i)=>text(s,item,76,307+i*28,710,27,16,K.blue,{bold:false}));
 note(s,'This presentation introduces the project and its goals, then walks through the solution, main features, and system design. It ends with the project workflow, current limits, and possible future improvements.');
}
// 3 Introduction
{
 const s=frame('Introduction','Introduction');
 bullet(s,330,'The Daily Brief:','A website for reading news and sharing articles written by users.',{labelW:195,bodyW:570,h:54});
 bullet(s,405,'News topics:','Browse stories from eight categories, popular stories, or search.',{labelW:195,bodyW:570,h:54});
 bullet(s,480,'AI tools:','Get a short summary or help writing an article.',{labelW:195,bodyW:570,h:54});
 bullet(s,555,'Reader tools:','Follow writers, save stories, listen, like, share, and report concerns.',{labelW:195,bodyW:570,h:60});
 note(s,'The Daily Brief is a website where people can read news and publish their own articles. Readers can browse eight topics, search for stories, and see popular articles. AI can summarize a story or help a writer prepare an article. Readers can also follow writers and interact with stories.');
}
// 4 Motivation
{
 const s=frame('Motivation','Motivation');
 bullet(s,344,'Many sources:','News is spread across websites and topics, so finding a useful story can take time.',{labelW:180,bodyW:600,h:62});
 bullet(s,426,'Long articles:','Readers may want the main points before reading a full story.',{labelW:180,bodyW:600,h:56});
 bullet(s,506,'Writing takes effort:','New writers may need help organizing their ideas into an article.',{labelW:180,bodyW:600,h:58});
 bullet(s,585,'The goal:','Bring news reading and article writing together in one easy-to-use site.',{labelW:180,bodyW:600,h:58});
 note(s,'The project aims to make it easier to find news and understand long stories. It also gives readers a way to become writers. AI tools can help with summaries and article structure, while the writer can edit the final article.');
}
// 5 Problem statement
{
 const s=frame('Problem Statement','Problem Statement');
 bullet(s,342,'Finding stories:','Readers may need to visit several sites to follow different topics.',{labelW:190,bodyW:590,h:55});
 bullet(s,422,'Reading time:','Long articles can make it harder to quickly understand the main points.',{labelW:190,bodyW:590,h:56});
 bullet(s,502,'Starting to write:','A blank page can make it difficult to organize a news article.',{labelW:190,bodyW:590,h:58});
 bullet(s,582,'Trust:','Harmful content and inaccurate claims need careful review.',{labelW:190,bodyW:590,h:55});
 note(s,'The project focuses on four challenges: finding stories across topics, understanding long articles, helping people start writing, and reviewing content. The platform provides tools for these needs, while recognizing that automated checks cannot confirm every fact.');
}
// 6 Proposed solution
{
 const s=frame('Proposed Solution','Proposed Solution');
 bullet(s,330,'News in one place:','Browse home, topic, trending, and reader-written stories.',{labelW:210,bodyW:565,h:54});
 bullet(s,406,'AI summaries:','Get the main points of an article and listen to the full text.',{labelW:210,bodyW:565,h:54});
 bullet(s,482,'Writing help:','Start with a topic or draft, then review and edit the article.',{labelW:210,bodyW:565,h:54});
 bullet(s,558,'Community:','Follow writers, save and like stories, share, and report concerns.',{labelW:210,bodyW:565,h:58});
 note(s,'The Daily Brief brings news stories and reader-written articles together. Readers can ask AI for a summary and use the listen feature. Writers can start with a topic or a full draft, edit the result, add an image, and send it for review.');
}
// 7 Competitive analysis / category comparison
{
 const s=frame('Competitive Analysis','Competitive Analysis');
 const x=[64,282,500,718], widths=[218,218,218,218], y=356, hh=48, rh=58;
 const heads=['Feature','The Daily Brief','News website','Writing tool'];
 for(let c=0;c<4;c++){rect(s,x[c],y,widths[c],hh,c===1?'#E8E8FA':'#F0F0F0',K.blue,1);text(s,heads[c],x[c]+8,y+4,widths[c]-16,hh-8,13,K.text,{bold:true,align:'center'});}
 const rows=[
  ['News topics','Eight categories','News sections','Not the main focus'],
  ['AI summaries','Available on stories','May vary by site','Usually for drafts'],
  ['Reader articles','Writers can publish','May be limited','Writing is the focus'],
  ['Reader actions','Follow, save, like, report','May vary by site','Not the main focus']
 ];
 rows.forEach((row,r)=>{const yy=y+hh+r*rh;for(let c=0;c<4;c++){rect(s,x[c],yy,widths[c],rh,K.white,K.line,1);text(s,row[c],x[c]+8,yy+4,widths[c]-16,rh-8,12.5,K.text,{bold:c===0,align:c===0?'left':'center'});}});
 text(s,'A general feature comparison; other products may offer different tools.',64,642,872,20,9,K.gray,{italic:true});
 note(s,'This slide compares broad product types, not specific companies. The Daily Brief combines category-based news browsing with AI summaries and reader articles. A traditional news website often focuses on news from its own newsroom. A writing tool usually focuses on drafting text. The features offered by individual services can differ.');
}
// 8 System block diagram
{
 const s=frame('System Block Diagram','System Architecture');
 diagramBox(s,58,374,170,112,'Reader','Opens the website\nand reads stories');
 diagramBox(s,300,358,220,136,'Daily Brief website','Pages, search,\narticle tools','#F2F2FF');
 diagramBox(s,620,374,210,112,'MongoDB','Accounts, articles,\nlikes and follows');
 diagramBox(s,275,548,270,82,'OpenAI','Summaries and article writing');
 diagramBox(s,590,548,270,82,'Google News feed','Links to stories by topic');
 connector(s,228,430,296,430,'Page request');
 connector(s,520,430,616,430,'Read / save');
 rule(s,410,494,410,520,K.blue,2);
 rule(s,410,520,725,520,K.blue,2);
 rule(s,410,520,410,544,K.blue,2);text(s,'▼',401,536,18,22,12,K.blue,{bold:true,align:'center'});
 rule(s,725,520,725,544,K.blue,2);text(s,'▼',716,536,18,22,12,K.blue,{bold:true,align:'center'});
 text(s,'AI and news services used by the website',472,500,310,20,9,K.gray,{align:'center'});
 note(s,'Readers use the website to browse news and community articles. The website reads and saves information in MongoDB. It also sends requests to OpenAI for summaries, writing help, and content checks. A news feed provides links that appear by topic.');
}
// 9 System architecture
{
 const s=frame('System Architecture','System Architecture');
 bullet(s,330,'Website:','Next.js and React build the pages people use.',{labelW:180,bodyW:590,h:54});
 bullet(s,408,'Server:','Handles sign-in, search, article writing, and reader actions.',{labelW:180,bodyW:590,h:54});
 bullet(s,486,'Database:','MongoDB stores accounts, news links, articles, and activity.',{labelW:180,bodyW:590,h:54});
 bullet(s,564,'AI and other tools:','OpenAI supports summaries and writing; browser speech reads articles aloud.',{labelW:180,bodyW:590,h:62});
 note(s,'The project uses Next.js and React for the website. Server code handles sign-in, search, article writing, and reader actions. MongoDB stores accounts and articles, and GridFS stores uploaded images. OpenAI provides AI features, and the browser reads articles aloud.');
}
// 10 Methodology
{
 const s=frame('Methodology: How It Works','Methodology');
 bullet(s,330,'1. Browse:','Choose a topic or search for a story.',{labelW:155,bodyW:615,h:50});
 bullet(s,398,'2. Read:','Open an article or ask AI for its main points.',{labelW:155,bodyW:615,h:50});
 bullet(s,466,'3. Take part:','Save, like, share, listen, or follow the writer.',{labelW:155,bodyW:615,h:50});
 bullet(s,534,'4. Write:','Start with a topic or draft and edit the preview.',{labelW:155,bodyW:615,h:50});
 bullet(s,602,'5. Review:','Screen the post and send cases needing review to an admin.',{labelW:155,bodyW:615,h:50});
 note(s,'This is the basic user journey. A reader browses or searches for news, opens a story, and can ask for a summary. The reader may save or share it, or follow its writer. Someone who wants to publish can create and edit an article, then submit it for screening and, when needed, admin review.');
}
// 11 Project workflow
{
 const s=frame('Project Workflow','Project Workflow');
 const steps=[
  ['1','Choose','Write a full draft or enter a topic.'],
  ['2','Prepare','AI organizes a draft or writes a first version.'],
  ['3','Research','For topic writing, search runs only if AI needs more facts.'],
  ['4','Edit','Review the headline, topic, article, and image.'],
  ['5','Review','Safety check; admin reviews flagged or unavailable cases.'],
  ['6','Publish','Approved articles appear for readers and in search.']
 ];
 steps.forEach((r,i)=>{const yy=316+i*57;text(s,r[0],78,yy,35,42,16,K.blue,{bold:true});text(s,r[1],126,yy,140,42,15,K.text,{bold:true});text(s,r[2],275,yy,620,42,14,K.text);if(i<steps.length-1)rule(s,126,yy+47,895,yy+47,'#DDDDDD',0.8);});
 note(s,'A writer starts with either a full article draft or a topic. For topic writing, the system checks whether AI already knows enough; it searches only when more information is needed. The writer edits the article and image before submitting. Safety checks run, and an admin reviews cases that need a person. Approved posts become visible to readers.');
}
// 12-14 Product screenshots
{
 const s=frame('User Sign In','Product Screens');
 await image(s,'login.png',96,326,768,305,'The Daily Brief sign-in page');
 text(s,'Figure 1: Sign-in page',80,646,800,25,12,K.blue,{align:'center'});
 note(s,'The sign-in page lets readers access their account. Signed-in readers can save stories, follow writers, and publish articles.');
}
{
 const s=frame('Trending News Page','Product Screens');
 await image(s,'trending.png',56,322,848,310,'The Daily Brief Trending page');
 text(s,'Figure 2: Trending news and story cards',60,642,840,22,12,K.blue,{align:'center'});
 note(s,'The Trending page displays popular story cards with a category, headline, image, and short description. It gives readers a quick way to browse current content on the site.');
}
{
 const s=frame('Search Page','Product Screens');
 await image(s,'search.png',56,322,848,310,'The Daily Brief search page');
 text(s,'Figure 3: Search across available stories',60,642,840,22,12,K.blue,{align:'center'});
 note(s,'The search page lets readers look for stories by topic or idea. Search results include stories available in the project, including reader-published articles.');
}
// 15 Challenges
{
 const s=frame('Challenges Faced','Challenges & Solutions');
 bullet(s,340,'Many story types:','The home page combines news links and articles written by users.',{labelW:200,bodyW:575,h:56});
 bullet(s,422,'Current topics:','Some article topics need fresh information from the web.',{labelW:200,bodyW:575,h:55});
 bullet(s,504,'Content safety:','Text and images need screening, with people to review uncertain cases.',{labelW:200,bodyW:575,h:57});
 bullet(s,586,'Saved data:','Accounts, posts, images, and reader actions need reliable storage.',{labelW:200,bodyW:575,h:57});
 note(s,'The project needed to bring different kinds of stories together. Some topics need fresh information. Posts and images need safety checks, and uncertain submissions need human review. The database also needs to keep user accounts and article activity.');
}
// 16 Solutions
{
 const s=frame('Solutions Implemented','Challenges & Solutions');
 bullet(s,340,'Shared categories:','News links and community articles appear in topic pages and search.',{labelW:205,bodyW:570,h:56});
 bullet(s,422,'Search when needed:','AI checks its knowledge before deciding whether to use web search.',{labelW:205,bodyW:570,h:55});
 bullet(s,504,'Review steps:','AI screens text and images; admins decide cases needing review.',{labelW:205,bodyW:570,h:55});
 bullet(s,586,'Database storage:','MongoDB stores posts and reader activity; images use GridFS.',{labelW:205,bodyW:570,h:57});
 note(s,'The project uses shared topic categories for different story types and includes community stories in search. For AI writing, it checks model knowledge before using web search. It screens article text and images, then sends uncertain content to an admin. MongoDB stores user and article data, and GridFS stores images.');
}
// 17 Limitations
{
 const s=frame('Current Limitations','Limitations');
 bullet(s,340,'Fact checking:','Content screening does not prove that every statement is true.',{labelW:190,bodyW:585,h:55});
 bullet(s,422,'Reader flags:','A flag count shows concern, not whether a claim is false.',{labelW:190,bodyW:585,h:55});
 bullet(s,504,'AI drafts:','Writers should review and edit generated content before publishing.',{labelW:190,bodyW:585,h:55});
 bullet(s,586,'External services:','AI, database, and news feed features depend on other services.',{labelW:190,bodyW:585,h:56});
 note(s,'The current safety system looks for harmful content but does not check every claim against evidence. Reader reports are signals that something may need review. AI can also make mistakes, so writers should edit drafts before publishing. Some features rely on external services being available.');
}
// 18 Future work
{
 const s=frame('Future Improvements','Future Improvements');
 bullet(s,326,'AI article images:','Create a relevant image from the article topic.',{labelW:210,bodyW:565,h:57});
 bullet(s,404,'Related stories:','Suggest articles connected to what the reader is viewing.',{labelW:210,bodyW:565,h:57});
 bullet(s,482,'Better image checks:','Look for harmful content, misleading edits, and text in images.',{labelW:210,bodyW:565,h:62});
 bullet(s,568,'Fact checking:','Show sources that support or challenge important claims.',{labelW:210,bodyW:565,h:57});
 note(s,'Future versions could create a relevant image from an article topic, recommend related stories, and improve image checks. Image checks could look for harmful content, misleading edits, or text inside an image. Another goal is to compare important claims with reliable sources and show readers the evidence.');
}
// 19 Conclusion
{
 const s=frame('Conclusion','Conclusion');
 bullet(s,340,'News discovery:','Browse categories, trending stories, and community articles.',{labelW:185,bodyW:590,h:55});
 bullet(s,422,'AI support:','Summarize stories and help prepare editable article drafts.',{labelW:185,bodyW:590,h:55});
 bullet(s,504,'Community:','Writers can publish; readers can follow and interact with stories.',{labelW:185,bodyW:590,h:55});
 bullet(s,586,'Human review:','Admins review content that needs a closer look.',{labelW:185,bodyW:590,h:55});
 note(s,'The Daily Brief combines news discovery, AI reading and writing tools, and community publishing. Readers can follow writers and interact with stories. Safety checks and admin review help manage submissions. Future work can improve source checks and image tools.');
}
// 20 Thank you
{
 const s=frame(null);
 text(s,'Thank You!',120,310,720,70,34,K.text,{bold:true,align:'center'});
 const logo=await fs.readFile(path.join(root,'public','logo.png'));
 s.images.add({blob:new Uint8Array(logo),contentType:'image/png',alt:'The Daily Brief logo',fit:'contain',position:{left:360,top:405,width:240,height:120}});
 note(s,'Thank you for listening. I am happy to answer your questions about The Daily Brief.');
}

const draft=path.join(build,'The_Daily_Brief_Vetting_Style_draft.pptx');
await (await PresentationFile.exportPptx(deck)).save(draft);
const renderDir=path.join(build,'vetting_style_render');await fs.mkdir(renderDir,{recursive:true});
for(let i=0;i<deck.slides.items.length;i++){
 const blob=await deck.export({slide:deck.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(renderDir,`slide-${String(i+1).padStart(2,'0')}.png`),Buffer.from(await blob.arrayBuffer()));
}
const montage=await deck.export({format:'png',montage:true});await fs.writeFile(path.join(build,'The_Daily_Brief_Vetting_Style_montage.png'),Buffer.from(await montage.arrayBuffer()));
console.log(JSON.stringify({draft,slides:deck.slides.items.length,renderDir,montage:path.join(build,'The_Daily_Brief_Vetting_Style_montage.png')}));
