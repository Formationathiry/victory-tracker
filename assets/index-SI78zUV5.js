(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}})();const h="https://victory-tracker-backend-seven.vercel.app",V="Ov23liNrRQzccjrIrImT",B=document.getElementById("loginPage"),L=document.getElementById("appPage"),O=document.getElementById("githubLoginBtn"),q=document.getElementById("logoutBtn"),M=document.getElementById("userAvatar"),z=document.getElementById("userName"),v=document.getElementById("joueurNom"),k=document.getElementById("btnAjouterJoueur"),g=document.getElementById("messageAjout"),_=document.getElementById("listeJoueurs"),E=document.getElementById("joueur1"),j=document.getElementById("joueur2"),$=document.getElementById("gagnant"),x=document.getElementById("btnAjouterVictoire"),l=document.getElementById("messageVictoire"),I=document.getElementById("tableauConfrontations"),D=document.getElementById("statistiques"),w=document.getElementById("historiqueVictoires");let a=[],u=[],d=null,f=null;function U(){return localStorage.getItem("auth_token")}function y(){f=null,localStorage.removeItem("auth_token"),d=null}async function R(){const e=U();if(!e){p();return}f=e;try{const n=await fetch(`${h}/auth/me`,{headers:{Authorization:`Bearer ${f}`}});n.ok?(d=await n.json(),F(),P()):(y(),p())}catch(n){console.error("Erreur auth:",n),y(),p()}}function p(){B.style.display="flex",L.style.display="none"}function F(){B.style.display="none",L.style.display="block",d&&(z.textContent=`Bienvenue, ${d.username}!`,d.avatar_url&&(M.src=d.avatar_url))}function G(){const e=window.location.origin+"/victory-tracker",r=`https://github.com/login/oauth/authorize?client_id=${V}&redirect_uri=${encodeURIComponent(e+"/auth/callback")}&scope=user:email&state=random-state-string`;window.location.href=r}function K(){y(),p()}async function Q(){try{const e=await fetch(`${h}/api/joueurs`);if(!e.ok)throw new Error("Erreur");a=await e.json(),A(),T()}catch(e){console.error("Erreur:",e)}}async function W(){try{const e=await fetch(`${h}/api/victoires`);if(!e.ok)throw new Error("Erreur");u=await e.json(),S(),N(),J()}catch(e){console.error("Erreur:",e)}}async function X(e){try{const n=await fetch(`${h}/api/joueurs`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({nom:e.trim()})});if(!n.ok){const t=await n.json();throw new Error(t.error||"Erreur serveur")}const r=await n.json();a.push(r),A(),T(),C("Joueur ajouté avec succès!"),v.value=""}catch(n){b(n.message)}}async function Y(e,n,r){try{const t=await fetch(`${h}/api/victoires`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({joueur1_id:e,joueur2_id:n,gagnant_id:r})});if(!t.ok){const i=await t.json();throw new Error(i.error||"Erreur serveur")}const o=await t.json();u.push(o),S(),N(),J(),C("Victoire enregistrée!"),E.value="",j.value="",$.value=""}catch(t){b(t.message)}}function A(){const e=[E,j,$],n=a.map(r=>`<option value="${r.id}">${r.nom}</option>`).join("");e.forEach(r=>{const t=r.value;r.innerHTML=`<option value="">Sélectionner...</option>${n}`,r.value=t})}function T(){if(a.length===0){_.innerHTML='<p class="loading">Aucun joueur</p>';return}const e=H(),n=a.map(r=>{const t=e[r.id]||{victoires:0,total:0,ratio:"0%"};return`
        <div class="joueur-item">
          <div>
            <div class="joueur-nom">${r.nom}</div>
            <div class="joueur-stats">
              ${t.victoires}/${t.total} matchs • ${t.ratio}
            </div>
          </div>
          <button class="btn btn-small" onclick="supprimerJoueur('${r.id}')">
            Supprimer
          </button>
        </div>
      `}).join("");_.innerHTML=n}function S(){if(a.length<2){I.innerHTML='<p class="loading">Ajoutez au moins 2 joueurs</p>';return}const e={};a.forEach(t=>{e[t.id]={},a.forEach(o=>{if(t.id!==o.id){const i=u.filter(s=>s.joueur1_id===t.id&&s.joueur2_id===o.id&&s.gagnant_id===t.id||s.joueur2_id===t.id&&s.joueur1_id===o.id&&s.gagnant_id===t.id).length,c=u.filter(s=>s.joueur1_id===t.id&&s.joueur2_id===o.id&&s.gagnant_id===o.id||s.joueur2_id===t.id&&s.joueur1_id===o.id&&s.gagnant_id===o.id).length;e[t.id][o.id]=`${i}-${c}`}})});const n=`
    <tr>
      <th>Joueur</th>
      ${a.map(t=>`<th>${t.nom}</th>`).join("")}
    </tr>
  `,r=a.map(t=>`
      <tr>
        <td><strong>${t.nom}</strong></td>
        ${a.map(o=>t.id===o.id?"<td>-</td>":`<td class="score-cell">${e[t.id][o.id]}</td>`).join("")}
      </tr>
    `).join("");I.innerHTML=`
    <table>
      <thead>${n}</thead>
      <tbody>${r}</tbody>
    </table>
  `}function N(){const e=H(),r=a.sort((t,o)=>{const i=e[t.id]||{victoires:0};return(e[o.id]||{victoires:0}).victoires-i.victoires}).map((t,o)=>{const i=e[t.id]||{victoires:0,total:0,ratio:"0%"};return`
        <div class="stat-card" style="background: ${["linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)","linear-gradient(135deg, #c0cfd9 0%, #999999 100%)","linear-gradient(135deg, #f97316 0%, #dc2626 100%)"][o]||"linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)"}">
          <div class="stat-label">#${o+1} - ${t.nom}</div>
          <div class="stat-value">${i.victoires}</div>
          <div class="stat-label">${i.total} matchs • ${i.ratio}</div>
        </div>
      `}).join("");D.innerHTML=r}function J(){if(u.length===0){w.innerHTML='<p class="loading">Aucune victoire enregistrée</p>';return}const e=u.slice().reverse().map(n=>{const r=a.find(m=>m.id===n.joueur1_id),t=a.find(m=>m.id===n.joueur2_id),o=a.find(m=>m.id===n.gagnant_id),i=n.gagnant_id===n.joueur1_id?t:r,s=new Date(n.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
        <div class="historique-item">
          <div class="historique-titre">
            🏆 ${(o==null?void 0:o.nom)||"Inconnu"} a battu ${(i==null?void 0:i.nom)||"Inconnu"}
          </div>
          <div class="historique-date">${s}</div>
        </div>
      `}).join("");w.innerHTML=e}function H(){const e={};return a.forEach(n=>{const r=u.filter(i=>i.gagnant_id===n.id).length,t=u.filter(i=>i.joueur1_id===n.id||i.joueur2_id===n.id).length,o=t>0?Math.round(r/t*100):0;e[n.id]={victoires:r,total:t,ratio:`${o}%`}}),e}function C(e){g.textContent=e,g.className="message success",setTimeout(()=>{g.className="message"},3e3)}function b(e){g.textContent=e,g.className="message error"}O.addEventListener("click",G);q.addEventListener("click",K);k.addEventListener("click",()=>{const e=v.value.trim();if(!e){b("Veuillez entrer un nom");return}X(e)});v.addEventListener("keypress",e=>{e.key==="Enter"&&k.click()});x.addEventListener("click",()=>{const e=E.value,n=j.value,r=$.value;if(!e||!n||!r){l.textContent="Veuillez sélectionner les joueurs et le gagnant",l.className="message error";return}if(e===n){l.textContent="Sélectionnez deux joueurs différents",l.className="message error";return}if(r!==e&&r!==n){l.textContent="Le gagnant doit être l'un des deux joueurs",l.className="message error";return}Y(e,n,r)});async function P(){await Q(),await W()}R();setInterval(()=>{d&&P()},5e3);
