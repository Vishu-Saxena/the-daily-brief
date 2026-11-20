import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = process.cwd();
const build = path.join(root, '.presentation-build');
const outDir = path.join(root, 'deliverables');
const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = { paper:'#F7F5F0', surface:'#FFFDF9', ink:'#242320', muted:'#77736B', line:'#E6E1D8', accent:'#B55B39', soft:'#F3E3DB', blue:'#8294A8', paleBlue:'#E7EDF1', green:'#5F7A69', paleGreen:'#E8EEE9', white:'#FFFFFF' };
const font = 'Arial'; const serif='Georgia';
function shape(slide, geometry, x,y,w,h, fill='none', stroke='none', sw=0, name='shape') {
  return slide.shapes.add({geometry,name,position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:stroke,width:sw}});
}
function txt(slide, text, x,y,w,h, size=20, color=C.ink, opts={}) {
  const s=shape(slide,'textbox',x,y,w,h,'none','none',0,opts.name||'text'); s.text=text;
  s.text.style={fontSize:`${size}pt`,typeface:opts.serif?serif:font,color,bold:!!opts.bold,italic:!!opts.italic,verticalAlignment:opts.valign||'middle',alignment:opts.align||'left',wrap:'square',autoFit:'shrinkText',insets:opts.insets??0};
  return s;
}
function rect(slide,x,y,w,h,fill,stroke=C.line,r=0,name='panel') { return shape(slide,r?'roundRect':'rect',x,y,w,h,fill,stroke,1,name); }
function line(slide,x1,y1,x2,y2,color=C.line,width=1) { return shape(slide,'line',x1,y1,x2-x1,y2-y1,'none',color,width,'divider'); }
function label(slide,text,x,y,color=C.accent,w=500) { txt(slide,text.toUpperCase(),x,y,w,22,10,color,{bold:true}); }
function title(slide,kicker,headline,sub='') { label(slide,kicker,72,48); txt(slide,headline,72,80,1136,82,32,C.ink,{serif:true,bold:true,valign:'top'}); if(sub)txt(slide,sub,74,164,1100,36,14,C.muted,{valign:'top'}); }
function base(n, dark=false) {
  const s=pres.slides.add(); s.background.fill=C.paper;
  line(s,72,674,1208,674,C.line,1);
  txt(s,'THE DAILY BRIEF  ·  MCA PROJECT',72,684,700,20,9,C.muted,{bold:true});
  txt(s,String(n).padStart(2,'0'),1160,682,48,22,10,C.accent,{bold:true,align:'right'});
  return s;
}
function note(s,text){s.speakerNotes.text=text;}
function bullet(slide,text,x,y,w,color=C.ink,accent=C.accent,size=17){shape(slide,'ellipse',x,y+9,7,7,accent,'none',0,'bullet');txt(slide,text,x+20,y,w-20,44,size,color,{valign:'top'});}
function card(slide,x,y,w,h,k,heading,body,accent=C.accent){rect(slide,x,y,w,h,C.surface);rect(slide,x,y,5,h,accent,'none');label(slide,k,x+22,y+18,accent,w-40);txt(slide,heading,x+22,y+47,w-44,54,19,C.ink,{serif:true,bold:true,valign:'top'});txt(slide,body,x+22,y+107,w-44,h-120,13,C.muted,{valign:'top'});}
async function addImage(slide,filename,x,y,w,h,alt,fit='cover') { const data=await fs.readFile(path.join(build,'assets',filename)); return slide.images.add({blob:new Uint8Array(data),contentType:'image/png',alt,fit,position:{left:x,top:y,width:w,height:h}}); }

// 1 — Cover
{
 const s=base(1); s.background.fill=C.paper;
 rect(s,870,0,410,674,C.soft,'none');
 const logo=await fs.readFile(path.join(root,'public','logo.png'));
 s.images.add({blob:new Uint8Array(logo),contentType:'image/png',alt:'The Daily Brief logo',fit:'contain',position:{left:86,top:56,width:230,height:84}});
 label(s,'MCA capstone presentation',88,180);
 txt(s,'THE DAILY\nBRIEF',82,225,760,205,62,C.ink,{serif:true,bold:true,valign:'top'});
 txt(s,'An AI-powered personalized news and\ncommunity publishing platform',88,451,700,78,23,C.muted,{valign:'top'});
 line(s,88,557,728,557,C.line,1);
 txt(s,'Under the supervision of',88,575,250,24,11,C.muted,{bold:true});
 txt(s,'Prof. Mrinal Kanti Deb Barma  ·  Professor, CSE Department',88,602,710,24,14,C.ink,{bold:true});
 txt(s,'Presented by  Mansi Saxena  ·  24MCA016',88,632,710,23,12,C.muted);
 label(s,'Read clearly. Write thoughtfully.',910,285,C.accent,300);
 txt(s,'A single place to discover stories, understand them faster, and publish your own.',910,324,286,126,22,C.ink,{serif:true,bold:true,valign:'top'});
 txt(s,'MCA PROJECT  /  2026',910,610,286,25,10,C.accent,{bold:true});
 note(s,'Good morning/afternoon. I am Mansi Saxena, and this is The Daily Brief, an AI-powered personalized news platform. I will introduce the problem it addresses, show how the product works, and explain its architecture and trust safeguards.');
}
// 2 — Table of contents
{
 const s=base(2);
 rect(s,0,0,1280,122,C.soft,'none');
 rect(s,0,0,12,122,C.accent,'none');
 label(s,'THE DAILY BRIEF  ·  PRESENTATION GUIDE',72,22,C.accent,700);
 txt(s,'Table of Contents',72,48,900,60,34,C.ink,{serif:true,bold:true});
 const outline=['Introduction & motivation','Product goals','Reader experience','AI-assisted reading','Community publishing workflow','Trust & safety','System architecture','Data & community features','Technology stack','Limitations & future work','Conclusion'];
 outline.forEach((item,i)=>{
   const y=143+i*46;
   txt(s,String(i+1).padStart(2,'0'),94,y,54,34,16,C.accent,{serif:true,bold:true});
   txt(s,item,164,y,760,34,19,C.ink,{serif:true,bold:i===0});
   if(i<outline.length-1) line(s,164,y+38,930,y+38,C.line,1);
 });
 rect(s,980,166,228,444,C.surface);
 label(s,'IN THIS PROJECT',1002,190,C.accent,185);
 txt(s,'Discover.\nUnderstand.\nPublish.',1002,232,182,122,23,C.ink,{serif:true,bold:true,valign:'top'});
 line(s,1002,378,1184,378,C.line,1);
 txt(s,'An AI-powered news experience with personalized discovery, writer tools, and human review.',1002,402,182,120,14,C.muted,{valign:'top'});
 note(s,'This presentation moves from the motivation and product goals into the reader experience, AI features, and community writing workflow. It then covers trust safeguards, the system architecture, data and technology choices, and future work.');
}
// 3 — Problem
{
 const s=base(3); title(s,'01  ·  Introduction & motivation','A simpler way to follow the news','The Daily Brief helps people find stories, understand them, and share their own writing.');
 card(s,72,246,350,304,'01  ·  Find','News is spread out','Stories come from many publishers and cover many topics. Finding the right ones can take time.');
 card(s,465,246,350,304,'02  ·  Understand','Long stories take time','Readers may want the main ideas before deciding to read the full article.');
 card(s,858,246,350,304,'03  ·  Take part','Writing can feel difficult','A clear writing guide can help people turn an idea into a well-organized article.');
 txt(s,'One site brings news, helpful AI tools, and reader-written stories together.',72,588,1136,46,20,C.ink,{serif:true,bold:true});
 note(s,'The idea for The Daily Brief came from three everyday needs. News is spread across many sites and topics. Long articles can take time to read. And starting a well-organized article can be hard. This project brings news and writing tools together in one place.');
}
// 3 — Objectives
{
 const s=base(4); title(s,'02  ·  Product goals','One experience for reading and publishing','The design combines editorial discovery with AI support and reader participation.');
 const items=[['01','Find stories','Browse the home page, topics, popular stories, or search.'],['02','Read with ease','Get a short AI summary or listen to an article.'],['03','Write','Start with a topic or a draft, then edit the article before posting.'],['04','Join in','Follow writers, save or like stories, share them, and report concerns.']];
 items.forEach((it,i)=>{const y=232+i*96;rect(s,72,y,1136,76,C.surface);txt(s,it[0],92,y+17,62,42,22,C.accent,{serif:true,bold:true});txt(s,it[1],170,y+12,210,52,20,C.ink,{serif:true,bold:true});txt(s,it[2],400,y+12,770,52,15,C.muted);});
 note(s,'The platform has four main goals: help people find stories, make reading easier, support writing, and let readers take part. For example, a reader can follow a writer, save an article, or report a concern. These features are part of the current project.');
}
// 4 — Product screenshot
{
 const s=base(5); title(s,'03  ·  Reader experience','Find stories at a glance','This is a real screen from the project’s Trending page.');
 rect(s,72,222,730,410,C.surface); await addImage(s,'trending.png',82,232,710,390,'Screenshot of The Daily Brief Trending page','contain');
 label(s,'On this page',852,242); txt(s,'Stories made easy to scan',852,274,350,48,21,C.ink,{serif:true,bold:true});
 bullet(s,'Choose from eight news topics',852,341,330);
 bullet(s,'See popular stories and headlines',852,398,330);
 bullet(s,'Browse articles written by readers',852,455,330);
 bullet(s,'Use the site on desktop or mobile',852,512,330);
 txt(s,'Project screenshot · Trending page',852,602,350,22,10,C.muted,{italic:true});
 note(s,'This screenshot shows the Trending page from the project. Each story card gives readers a picture, topic, headline, and short description. The top menu links to the news topics, search, and saved stories. The page is designed to work on both large and small screens.');
}
// 5 — AI reader tools
{
 const s=base(6); title(s,'04  ·  AI-assisted reading','Understand a story in your own way','Use a short summary, read the full article, or listen to it.');
 const cx=128,cy=276; const nodes=[['READ','Full article'],['AI SUMMARY','Main points'],['LISTEN','Read aloud']];
 nodes.forEach((n,i)=>{const x=cx+i*366;rect(s,x,cy,300,148,i===1?C.soft:C.surface);label(s,n[0],x+22,cy+20);txt(s,n[1],x+22,cy+60,255,55,24,C.ink,{serif:true,bold:true});if(i<2){line(s,x+301,cy+74,x+354,cy+74,C.accent,2);shape(s,'triangle',x+346,cy+66,16,16,C.accent,'none',0,'arrowhead');}});
 card(s,128,470,300,142,'SAVE','Keep it for later','Saved stories are linked to your account.',C.blue);
 card(s,490,470,300,142,'RESPOND','Like and share','Show your support or pass a story along.',C.green);
 card(s,852,470,300,142,'LISTEN','Hear the article','Your browser reads the article aloud.',C.accent);
 note(s,'Readers can ask AI for a short list of the article’s main points. They can then read the full story or use the listen button, which reads the text aloud in their browser. Signed-in readers can also save and like stories, and share them. The summary is a quick guide; readers should still check the full article.');
}
// 6 — Writer flow
{
 const s=base(7); title(s,'05  ·  Community publishing workflow','Write a story with step-by-step help','Start with your own draft or just a topic. You stay in control of the final article.');
 const ys=258; const boxes=[{x:72,k:'OPTION 1',h:'Bring a draft',b:'AI helps organize the article and checks it before review.'},{x:461,k:'OPTION 2',h:'Bring a topic',b:'AI writes a first draft. It searches the web only when needed.'},{x:850,k:'FOR BOTH',h:'Edit and submit',b:'Check the headline and topic, edit the text, add an image, then send it in.'}];
 boxes.forEach((b,i)=>{rect(s,b.x,ys,330,194,i===2?C.soft:C.surface);label(s,b.k,b.x+22,ys+20);txt(s,b.h,b.x+22,ys+54,286,54,20,C.ink,{serif:true,bold:true,valign:'top'});txt(s,b.b,b.x+22,ys+113,286,60,13,C.muted,{valign:'top'});if(i<2){line(s,b.x+331,ys+97,b.x+374,ys+97,C.accent,2);shape(s,'triangle',b.x+366,ys+89,16,16,C.accent,'none',0,'arrowhead');}});
 rect(s,72,500,1136,102,C.paleBlue,'none');label(s,'How topic writing works',96,517,C.blue);txt(s,'AI checks what it already knows first. It searches the web only if it needs more information.',96,548,1072,38,16,C.ink,{bold:true});
 note(s,'A writer can bring a full draft or enter only a topic. For a topic, AI first checks whether it already knows enough to write a useful article. If it needs more information, it searches the web. The writer can edit the result, add a picture, and submit it for review.');
}
// 7 — Trust flow
{
 const s=base(8); title(s,'06  ·  Trust & safety','Check posts and review concerns','AI checks for harmful content. People review posts that need a closer look.');
 const steps=[['01','AI check','Text and image'],['02','Admin review','Posts needing review'],['03','Publish','After approval'],['04','Reader report','Reason and count']];
 steps.forEach((a,i)=>{const x=72+i*292;rect(s,x,256,252,168,i===1?C.soft:C.surface);txt(s,a[0],x+20,274,52,42,20,C.accent,{serif:true,bold:true});txt(s,a[1],x+20,325,210,36,18,C.ink,{serif:true,bold:true});txt(s,a[2],x+20,369,210,34,12,C.muted);if(i<3){line(s,x+253,338,x+281,338,C.accent,2);shape(s,'triangle',x+275,330,16,16,C.accent,'none',0,'arrowhead');}});
 rect(s,72,478,542,124,C.paleGreen,'none');label(s,'What happens now',96,495,C.green);txt(s,'AI checks article text and images. Posts that need review go to an admin. Readers can report a story.',96,526,488,56,14,C.ink,{valign:'top'});
 rect(s,640,478,568,124,C.paleBlue,'none');label(s,'What this cannot confirm',664,495,C.blue);txt(s,'A passed check does not prove facts are true. A flag count shows reader concerns; it is not a final decision.',664,526,520,56,14,C.ink,{valign:'top'});
 note(s,'AI checks the words and any uploaded image for harmful content. If something needs a closer look, an admin reviews it and decides whether to publish or reject it. Readers can also report a story and explain why. These checks look for harmful content; they do not prove that every fact is true. A flag count shows concerns, not a final answer.');
}
// 8 — Architecture
{
 const s=base(9); title(s,'07  ·  System architecture','How the parts of the site work together','The website connects its pages to the database and AI services.');
 rect(s,72,254,290,258,C.surface);label(s,'Website',96,276);txt(s,'Next.js 14\nApp Router',96,314,232,72,23,C.ink,{serif:true,bold:true,valign:'top'});txt(s,'Builds the pages you see\nReact · TypeScript · Tailwind',96,414,240,50,14,C.muted,{valign:'top'});
 rect(s,495,254,290,258,C.soft);label(s,'Server',519,276);txt(s,'Behind-the-scenes\nwork',519,314,238,72,23,C.ink,{serif:true,bold:true,valign:'top'});txt(s,'Sign-in · search · writing\nAI tools · article actions',519,414,240,50,14,C.muted,{valign:'top'});
 rect(s,918,254,290,258,C.surface);label(s,'Storage & services',942,276);txt(s,'MongoDB',942,314,238,52,23,C.ink,{serif:true,bold:true,valign:'top'});txt(s,'Saves accounts, stories, and images\nConnects to AI and news feeds',942,394,242,60,13,C.muted,{valign:'top'});
 line(s,363,382,492,382,C.accent,2);shape(s,'triangle',483,374,16,16,C.accent,'none',0,'arrowhead');
 line(s,786,382,915,382,C.accent,2);shape(s,'triangle',906,374,16,16,C.accent,'none',0,'arrowhead');
 txt(s,'Sign-in and page requests',370,348,120,25,9,C.muted,{align:'center'});txt(s,'Save and read data',790,348,120,25,9,C.muted,{align:'center'});
 txt(s,'News feed → database → stories shown on home and topic pages',72,560,1136,32,15,C.ink,{bold:true});
 note(s,'The site has three main parts. The pages are what readers see. The server handles sign-in, search, article writing, and requests to AI. MongoDB saves user accounts and stories, and image storage saves article pictures. The project also receives news links from a news feed.');
}
// 9 — Persistence and features
{
 const s=base(10); title(s,'08  ·  Data & community features','Keep stories and reader activity together','The database remembers who wrote each post and how readers interact with it.');
 const dbs=[['ACCOUNTS','Reader and writer details'],['POSTS','Articles and review status'],['NEWS','Stories sorted by topic'],['ACTIONS','Likes · follows · saves · flags']];
 dbs.forEach((d,i)=>{const x=72+i*284;rect(s,x,254,256,141,i===1?C.soft:C.surface);label(s,d[0],x+18,270);txt(s,d[1],x+18,305,218,66,15,C.ink,{serif:true,bold:true,valign:'top'});});
 rect(s,72,438,1136,165,C.surface);label(s,'How people use it',96,458);txt(s,'Reader',96,494,130,34,19,C.ink,{serif:true,bold:true});txt(s,'follow writers → see new posts → like, save, listen, share, or report',240,494,908,34,15,C.muted);
 line(s,96,540,1176,540,C.line,1);
 txt(s,'Writer',96,554,130,34,19,C.ink,{serif:true,bold:true});txt(s,'publish a story → readers find it → check followers and likes on the dashboard',240,554,908,34,15,C.muted);
 note(s,'The database keeps accounts, news links, reader-written articles, and reader actions such as likes and saves. Each post is linked to its writer. Writers can see their followers and the likes their posts have received on the dashboard.');
}
// 10 — Tech stack
{
 const s=base(11); title(s,'09  ·  Technology stack','Tools used to build the project','These tools run the website, save its data, and provide AI features.');
 const groups=[['WEB PAGES','Next.js 14','Builds the website'],['CODE','TypeScript','Helps write reliable code'],['DATABASE','MongoDB','Stores users and articles'],['AI','OpenAI','Writing, summaries, and safety checks'],['DESIGN','Tailwind CSS','Styles the pages'],['NEWS','Google News feed','Brings in news links']];
 groups.forEach((g,i)=>{const col=i%3,row=Math.floor(i/3),x=72+col*390,y=246+row*174;card(s,x,y,354,145,g[0],g[1],g[2],i===3?C.blue:C.accent);});
 txt(s,'Passwords are stored in protected form; sign-in uses a secure session.',72,607,1136,26,13,C.muted,{italic:true});
 note(s,'Next.js and React build the website pages. TypeScript helps keep the code organized. MongoDB stores accounts and articles. OpenAI provides the writing, summary, and safety-check features. Tailwind CSS styles the pages, and a Google News feed supplies news links. Passwords are protected before storage.');
}
// 11 — Limitations & next steps
{
 const s=base(12); title(s,'10  ·  Limitations & future work','What the project can improve next','The current safety checks do not confirm whether every news claim is true.');
 card(s,72,248,350,292,'01  ·  Check facts','Compare claims with sources','Show readers the sources that support or disagree with important claims.',C.blue);
 card(s,465,248,350,292,'02  ·  Show origins','Make sources clearer','Show who first reported a story and when it was published.',C.green);
 card(s,858,248,350,292,'03  ·  Review images','Look for hidden context','Read text inside images and send unclear cases to a human reviewer.',C.accent);
 rect(s,72,572,1136,54,C.soft,'none');txt(s,'Goal: help readers see the evidence and understand what is still uncertain.',94,584,1090,28,15,C.ink,{bold:true});
 note(s,'The project checks for harmful content, but it does not yet confirm whether every fact is correct. Future versions could compare important claims with reliable sources, show where a story first appeared, and read text inside images. When the result is unclear, a person should review it.');
}
// 12 — Closing
{
 const s=base(13); s.background.fill=C.ink;
 rect(s,850,0,430,674,C.accent,'none');
 label(s,'THE DAILY BRIEF  ·  MCA PROJECT',82,88,C.soft,620);
 txt(s,'Find the news.\nUnderstand it.\nShare your story.',78,145,735,226,40,C.white,{serif:true,bold:true,valign:'top'});
 txt(s,'The Daily Brief brings news, simple AI tools, and reader writing together in one place.',84,398,670,84,20,'#E9E4DB',{valign:'top'});
 line(s,84,527,712,527,'#5B5852',1);
 txt(s,'Mansi Saxena  ·  24MCA016',84,550,500,28,15,C.white,{bold:true});
 txt(s,'Thank you',910,270,296,62,34,C.white,{serif:true,bold:true});
 txt(s,'Questions?',910,337,296,42,21,'#F7E9E2');
 txt(s,'Under the supervision of\nProf. Mrinal Kanti Deb Barma\nProfessor, CSE Department',910,475,300,100,14,C.white,{valign:'top'});
 line(s,72,674,1208,674,'#5B5852',1);txt(s,'THE DAILY BRIEF  ·  MCA PROJECT',72,684,700,20,9,'#C6C0B7',{bold:true});txt(s,'13',1160,682,48,22,10,C.soft,{bold:true,align:'right'});
 note(s,'The Daily Brief helps readers find news, understand stories with simple AI tools, and publish their own writing. Readers can follow writers and take part in the community. The next step is to help readers check facts with clear sources. Thank you. I am happy to answer your questions.');
}

const candidate=path.join(build,'The_Daily_Brief_candidate.pptx');
const pptx=await PresentationFile.exportPptx(pres); await pptx.save(candidate);
// Render each slide for visual inspection and a contact sheet preview.
const renderDir=path.join(build,'rendered'); await fs.mkdir(renderDir,{recursive:true});
for(let i=0;i<pres.slides.items.length;i++){
 const blob=await pres.export({slide:pres.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(renderDir,`slide-${String(i+1).padStart(2,'0')}.png`),Buffer.from(await blob.arrayBuffer()));
}
const montage=await pres.export({format:'png',montage:true});
await fs.writeFile(path.join(build,'montage.png'),Buffer.from(await montage.arrayBuffer()));
console.log(JSON.stringify({candidate,slides:pres.slides.items.length,renderDir,montage:path.join(build,'montage.png')}));
