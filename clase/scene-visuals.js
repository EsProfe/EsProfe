/* Data-driven teaching scenes. Positions are illustrative, not real team line-ups. */
(function(root){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icons={goal:'<path d="M15 78V22H145V78M20 30H140M20 45H140M20 60H140M35 22V78M60 22V78M85 22V78M110 22V78M135 22V78"/>',bench:'<path d="M12 56H148V72H12ZM24 32H136V50H24ZM24 72V90M136 72V90M12 32Q80-10 148 32"/>',field:'<path d="M12 12H148V92H12ZM80 12V92"/><circle cx="80" cy="52" r="20"/>'};
 function picture(scene,visual={},lang='ru',conceal=false){
  if(!scene)return '';
  const hidden=conceal||visual.hideLabels;
  return `<figure class="kit-picture location-scene"><div class="scene-title">${esc(scene.title[lang]||scene.title.en)}</div><div class="pitch-map">${scene.places.map(place=>`<section class="pitch-zone zone-${esc(place.id)} ${visual.focus===place.id?'zone-focus':''} ${visual.focus&&visual.focus!==place.id?'zone-muted':''}"><svg class="place-symbol" viewBox="0 0 160 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">${icons[place.id]||''}</g></svg><strong class="place-name" lang="es">${hidden?'…':esc(place.word)}</strong><div class="scene-players">${place.actors.map(actor=>`<div class="scene-player"><img src="images/${esc(actor.photo)}.webp" alt="" decoding="async"><span>${esc(actor.name)}</span></div>`).join('')}</div></section>`).join('')}</div><figcaption>${esc(scene.note[lang]||scene.note.en)} <a href="photo-credits.html" target="_blank" rel="noopener" aria-label="Photo credits">©</a></figcaption></figure>`;
 }
 function thumbnail(v){return icons[v?.focus]?`<span class="vp-place-thumb" aria-hidden="true"><svg viewBox="0 0 160 100"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round">${icons[v.focus]}</g></svg></span>`:''}
 root.EsProfeSceneVisuals={picture,thumbnail};
})(window);
