(()=>{const host=document.getElementById('food-game-mascot');if(!host||!globalThis.FoodSpriteRig)return;const rig=FoodSpriteRig.roach(true);host.appendChild(rig.node);const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,request=null;rig.update(0,false);
function stop(){if(request!==null)cancelAnimationFrame(request);request=null}
function frame(now){request=null;if(document.hidden||!visible||reduced.matches)return;rig.update(now/1920,false);request=requestAnimationFrame(frame)}
function sync(){stop();if(reduced.matches){rig.update(0,false);return}if(visible&&!document.hidden)request=requestAnimationFrame(frame)}
reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);if('IntersectionObserver'in globalThis)new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync()}).observe(host);sync();})();
