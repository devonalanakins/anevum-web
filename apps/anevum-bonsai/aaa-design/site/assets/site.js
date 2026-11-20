/* Progressive interactions: route navigation remains fully functional without JS. */
const studies={
 vertical:{stone:'M165 267Q190 192 224 160L249 94 293 140 320 70 372 150 395 224 432 268Z',root:'M290 147Q265 186 255 207T212 267 M292 144Q307 187 351 219T400 268',note:'Vertical emphasis: investigate a narrow stone with an ascending outline. Root position and rock dimensions are unknown.'},
 shelter:{stone:'M129 269Q151 232 181 215Q218 191 236 196L279 146Q316 162 336 182Q383 178 417 220L458 270Z',root:'M290 151Q267 190 218 226L184 266 M292 150Q320 201 381 238L426 264',note:'Sheltered contour: explore a low, weathered mass and the visual shelter it offers. No physical rock has been selected.'},
 offset:{stone:'M152 270L174 246Q223 221 258 216L284 162L341 140Q383 157 409 213L472 260L453 270Z',root:'M295 142Q274 204 235 218T177 269 M295 142Q331 170 353 207T418 262',note:'Offset balance: test an asymmetric rock silhouette against a small trunk. These paths are speculative and not mapped from the tree.'}
};
document.querySelectorAll('[data-study]').forEach(button=>button.addEventListener('click',()=>{
 const study=studies[button.dataset.study]; if(!study)return;
 document.querySelectorAll('[data-study]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.getElementById('stone-path')?.setAttribute('d',study.stone);
 document.getElementById('root-path')?.setAttribute('d',study.root);
 const note=document.getElementById('study-note');if(note)note.textContent=study.note;
}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('[data-timeline] li').forEach(item=>item.classList.toggle('is-filtered',button.dataset.filter!=='all'&&button.dataset.filter!==item.dataset.state));
}));
