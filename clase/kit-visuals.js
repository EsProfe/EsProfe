/* Original code-drawn teaching illustrations: no club marks or borrowed kit photos. */
(function(root){
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function picture(v){
  if(!v)return '';const color=/^#[0-9a-f]{6}$/i.test(v.color)?v.color:'#ffffff';
  const shirt='<path d="M70 35 40 50 18 93 47 110 65 85 65 185 175 185 175 85 193 110 222 93 200 50 170 35 145 27Q120 55 95 27Z"/>';
  const shapes={shirt,shorts:'<path d="M60 38H180L195 181H130L120 105 110 181H45Z"/><path d="M60 50H180M120 54V105" fill="none"/>',boots:'<path d="M37 48H92V106L119 124Q137 150 120 162H20V138L33 112ZM143 48H198V106L225 124Q243 150 226 162H126V138L139 112Z"/><path d="M30 164V173M57 164V173M88 164V173M140 164V173M170 164V173M201 164V173M51 110H86M156 110H191" fill="none"/>',gloves:'<path d="M35 182V120L17 97Q9 79 25 77L42 90 35 40Q35 24 47 31L58 76 56 23Q61 8 70 24L76 77 81 26Q91 13 95 31L96 86 104 52Q115 41 117 60L109 124 103 182Z"/><path d="M205 182V120L223 97Q231 79 215 77L198 90 205 40Q205 24 193 31L182 76 184 23Q179 8 170 24L164 77 159 26Q149 13 145 31L144 86 136 52Q125 41 123 60L131 124 137 182Z"/>',keeper:'<circle cx="120" cy="28" r="22" fill="#d6a07c"/><path d="M92 56H148L184 93 167 111 145 91V145H95V91L73 111 56 93Z"/><path d="M95 145H145V174H125V164H115V174H95Z" fill="#263951"/><path d="M101 174V198M139 174V198" fill="none"/><path d="M58 94 42 72 32 84 54 111ZM182 94 198 72 208 84 186 111Z" fill="#f4ce3c"/><path d="M88 200H111M129 200H152" fill="none"/>'};
  return `<figure class="kit-picture"><svg viewBox="0 0 240 220" role="img" aria-label="${esc(v.label||({shirt:'camiseta',shorts:'pantalones cortos',boots:'botas de fútbol',gloves:'guantes',keeper:'portero'})[v.kind])}"><g fill="${color}" stroke="#25445a" stroke-width="3.5" stroke-linejoin="round">${shapes[v.kind]||shirt}</g></svg>${v.label?`<figcaption>${esc(v.label)}</figcaption>`:''}</figure>`;
 }
 root.EsProfeKitVisuals={picture};
})(window);
