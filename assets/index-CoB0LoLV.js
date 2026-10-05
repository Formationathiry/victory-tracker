(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&t(u)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}})();const h="http://localhost:3000",w=document.getElementById("loginPage"),L=document.getElementById("appPage"),V=document.getElementById("githubLoginBtn"),q=document.getElementById("logoutBtn"),M=document.getElementById("userAvatar"),O=document.getElementById("userName"),E=document.getElementById("joueurNom"),A=document.getElementById("btnAjouterJoueur"),g=document.getElementById("messageAjout"),_=document.getElementById("listeJoueurs"),j=document.getElementById("joueur1"),$=document.getElementById("joueur2"),b=document.getElementById("gagnant"),x=document.getElementById("btnAjouterVictoire"),l=document.getElementById("messageVictoire"),I=document.getElementById("tableauConfrontations"),z=document.getElementById("statistiques"),B=document.getElementById("historiqueVictoires");let a=[],c=[],d=null,f=null;function D(){return localStorage.getItem("auth_token")}function v(){f=null,localStorage.removeItem("auth_token"),d=null}async function G(){const e=D();if(!e){p();return}f=e;try{const n=await fetch(`${h}/auth/me`,{headers:{Authorization:`Bearer ${f}`}});n.ok?(d=await n.json(),U(),P()):(v(),p())}catch(n){console.error("Erreur auth:",n),v(),p()}}function p(){w.style.display="flex",L.style.display="none"}function U(){w.style.display="none",L.style.display="block",d&&(O.textContent=`Bienvenue, ${d.username}!`,d.avatar_url&&(M.src=d.avatar_url))}function F(){{console.error("GITHUB_CLIENT_ID non configuré"),y("Erreur: Client ID GitHub manquant");return}}function R(){v(),p()}async function K(){try{const e=await fetch(`${h}/api/joueurs`);if(!e.ok)throw new Error("Erreur");a=await e.json(),T(),S()}catch(e){console.error("Erreur:",e)}}async function Q(){try{const e=await fetch(`${h}/api/victoires`);if(!e.ok)throw new Error("Erreur");c=await e.json(),k(),J(),N()}catch(e){console.error("Erreur:",e)}}async function W(e){try{const n=await fetch(`${h}/api/joueurs`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({nom:e.trim()})});if(!n.ok){const t=await n.json();throw new Error(t.error||"Erreur serveur")}const r=await n.json();a.push(r),T(),S(),C("Joueur ajouté avec succès!"),E.value=""}catch(n){y(n.message)}}async function X(e,n,r){try{const t=await fetch(`${h}/api/victoires`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({joueur1_id:e,joueur2_id:n,gagnant_id:r})});if(!t.ok){const i=await t.json();throw new Error(i.error||"Erreur serveur")}const o=await t.json();c.push(o),k(),J(),N(),C("Victoire enregistrée!"),j.value="",$.value="",b.value=""}catch(t){y(t.message)}}function T(){const e=[j,$,b],n=a.map(r=>`<option value="${r.id}">${r.nom}</option>`).join("");e.forEach(r=>{const t=r.value;r.innerHTML=`<option value="">Sélectionner...</option>${n}`,r.value=t})}function S(){if(a.length===0){_.innerHTML='<p class="loading">Aucun joueur</p>';return}const e=H(),n=a.map(r=>{const t=e[r.id]||{victoires:0,total:0,ratio:"0%"};return`
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
      `}).join("");_.innerHTML=n}function k(){if(a.length<2){I.innerHTML='<p class="loading">Ajoutez au moins 2 joueurs</p>';return}const e={};a.forEach(t=>{e[t.id]={},a.forEach(o=>{if(t.id!==o.id){const i=c.filter(s=>s.joueur1_id===t.id&&s.joueur2_id===o.id&&s.gagnant_id===t.id||s.joueur2_id===t.id&&s.joueur1_id===o.id&&s.gagnant_id===t.id).length,u=c.filter(s=>s.joueur1_id===t.id&&s.joueur2_id===o.id&&s.gagnant_id===o.id||s.joueur2_id===t.id&&s.joueur1_id===o.id&&s.gagnant_id===o.id).length;e[t.id][o.id]=`${i}-${u}`}})});const n=`
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
  `}function J(){const e=H(),r=a.sort((t,o)=>{const i=e[t.id]||{victoires:0};return(e[o.id]||{victoires:0}).victoires-i.victoires}).map((t,o)=>{const i=e[t.id]||{victoires:0,total:0,ratio:"0%"};return`
        <div class="stat-card" style="background: ${["linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)","linear-gradient(135deg, #c0cfd9 0%, #999999 100%)","linear-gradient(135deg, #f97316 0%, #dc2626 100%)"][o]||"linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)"}">
          <div class="stat-label">#${o+1} - ${t.nom}</div>
          <div class="stat-value">${i.victoires}</div>
          <div class="stat-label">${i.total} matchs • ${i.ratio}</div>
        </div>
      `}).join("");z.innerHTML=r}function N(){if(c.length===0){B.innerHTML='<p class="loading">Aucune victoire enregistrée</p>';return}const e=c.slice().reverse().map(n=>{const r=a.find(m=>m.id===n.joueur1_id),t=a.find(m=>m.id===n.joueur2_id),o=a.find(m=>m.id===n.gagnant_id),i=n.gagnant_id===n.joueur1_id?t:r,s=new Date(n.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
        <div class="historique-item">
          <div class="historique-titre">
            🏆 ${(o==null?void 0:o.nom)||"Inconnu"} a battu ${(i==null?void 0:i.nom)||"Inconnu"}
          </div>
          <div class="historique-date">${s}</div>
        </div>
      `}).join("");B.innerHTML=e}function H(){const e={};return a.forEach(n=>{const r=c.filter(i=>i.gagnant_id===n.id).length,t=c.filter(i=>i.joueur1_id===n.id||i.joueur2_id===n.id).length,o=t>0?Math.round(r/t*100):0;e[n.id]={victoires:r,total:t,ratio:`${o}%`}}),e}function C(e){g.textContent=e,g.className="message success",setTimeout(()=>{g.className="message"},3e3)}function y(e){g.textContent=e,g.className="message error"}V.addEventListener("click",F);q.addEventListener("click",R);A.addEventListener("click",()=>{const e=E.value.trim();if(!e){y("Veuillez entrer un nom");return}W(e)});E.addEventListener("keypress",e=>{e.key==="Enter"&&A.click()});x.addEventListener("click",()=>{const e=j.value,n=$.value,r=b.value;if(!e||!n||!r){l.textContent="Veuillez sélectionner les joueurs et le gagnant",l.className="message error";return}if(e===n){l.textContent="Sélectionnez deux joueurs différents",l.className="message error";return}if(r!==e&&r!==n){l.textContent="Le gagnant doit être l'un des deux joueurs",l.className="message error";return}X(e,n,r)});async function P(){await K(),await Q()}G();setInterval(()=>{d&&P()},5e3);
