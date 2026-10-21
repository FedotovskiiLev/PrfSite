const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');toggle.focus()}})}
const filters=document.querySelectorAll('[data-filter]');
filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++});const output=document.querySelector('#news-count');if(output)output.textContent=`Показано материалов: ${count}`;}));

// Independent, non-autoplay photo galleries. Keyboard and touch remain local.
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
 const slides=Array.from(carousel.querySelectorAll('.carousel-slide'));
 const dots=Array.from(carousel.querySelectorAll('[data-slide]'));
 const counter=carousel.querySelector('.carousel-count');
 if(!slides.length)return;
 let current=0;
 function show(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.hidden=i!==current});
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  counter.textContent=`${current+1} / ${slides.length}`;
 }
 carousel.querySelector('[data-prev]').addEventListener('click',()=>show(current-1));
 carousel.querySelector('[data-next]').addEventListener('click',()=>show(current+1));
 dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slide))));
 carousel.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));
  }
 });
 const viewport=carousel.querySelector('.carousel-viewport');
 let start=null;
 viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'){
   start={x:event.clientX,y:event.clientY,id:event.pointerId};
   try{viewport.setPointerCapture?.(event.pointerId)}catch{}
  }
 });
 viewport.addEventListener('pointerup',event=>{
  if(!start||event.pointerId!==start.id)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))show(current+(dx<0?1:-1));
 });
 viewport.addEventListener('pointercancel',()=>{start=null});
});
