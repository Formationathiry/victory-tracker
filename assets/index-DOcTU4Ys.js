(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&t(u)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}})();const h="https://victory-tracker-backend-seven.vercel.app",U="Ov23liNrRQzccjrIrImT";let B,L,T,S,N,J,y,$,m,b,v,E,j,C,d,I,H,_;function R(){B=document.getElementById("loginPage"),L=document.getElementById("appPage"),T=document.getElementById("githubLoginBtn"),S=document.getElementById("logoutBtn"),N=document.getElementById("userAvatar"),J=document.getElementById("userName"),y=document.getElementById("joueurNom"),$=document.getElementById("btnAjouterJoueur"),m=document.getElementById("messageAjout"),b=document.getElementById("listeJoueurs"),v=document.getElementById("joueur1"),E=document.getElementById("joueur2"),j=document.getElementById("gagnant"),C=document.getElementById("btnAjouterVictoire"),d=document.getElementById("messageVictoire"),I=document.getElementById("tableauConfrontations"),H=document.getElementById("statistiques"),_=document.getElementById("historiqueVictoires")}let a=[],c=[],l=null,f=null;function F(){return localStorage.getItem("auth_token")}function w(){f=null,localStorage.removeItem("auth_token"),l=null}async function G(){const e=F();if(!e){p();return}f=e;try{const n=await fetch(`${h}/auth/me`,{headers:{Authorization:`Bearer ${f}`}});n.ok?(l=await n.json(),K(),D()):(w(),p())}catch(n){console.error("Erreur auth:",n),w(),p()}}function p(){B.style.display="flex",L.style.display="none"}function K(){B.style.display="none",L.style.display="block",l&&(J.textContent=`Bienvenue, ${l.username}!`,l.avatar_url&&(N.src=l.avatar_url))}function Q(){const e=window.location.origin+"/victory-tracker",r=`https://github.com/login/oauth/authorize?client_id=${U}&redirect_uri=${encodeURIComponent(e+"/auth/callback")}&scope=user:email&state=random-state-string`;window.location.href=r}function W(){w(),p()}async function X(){try{const e=await fetch(`${h}/api/joueurs`);if(!e.ok)throw new Error("Erreur");a=await e.json(),z(),O()}catch(e){console.error("Erreur:",e)}}async function Y(){try{const e=await fetch(`${h}/api/victoires`);if(!e.ok)throw new Error("Erreur");c=await e.json(),P(),M(),V()}catch(e){console.error("Erreur:",e)}}async function Z(e){try{const n=await fetch(`${h}/api/joueurs`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({nom:e.trim()})});if(!n.ok){const t=await n.json();throw new Error(t.error||"Erreur serveur")}const r=await n.json();a.push(r),z(),O(),x("Joueur ajouté avec succès!"),y.value=""}catch(n){A(n.message)}}async function ee(e,n,r){try{const t=await fetch(`${h}/api/victoires`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({joueur1_id:e,joueur2_id:n,gagnant_id:r})});if(!t.ok){const i=await t.json();throw new Error(i.error||"Erreur serveur")}const o=await t.json();c.push(o),P(),M(),V(),x("Victoire enregistrée!"),v.value="",E.value="",j.value=""}catch(t){A(t.message)}}function z(){const e=[v,E,j],n=a.map(r=>`<option value="${r.id}">${r.nom}</option>`).join("");e.forEach(r=>{const t=r.value;r.innerHTML=`<option value="">Sélectionner...</option>${n}`,r.value=t})}function O(){if(a.length===0){b.innerHTML='<p class="loading">Aucun joueur</p>';return}const e=q(),n=a.map(r=>{const t=e[r.id]||{victoires:0,total:0,ratio:"0%"};return`
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
      `}).join("");b.innerHTML=n}function P(){if(a.length<2){I.innerHTML='<p class="loading">Ajoutez au moins 2 joueurs</p>';return}const e={};a.forEach(t=>{e[t.id]={},a.forEach(o=>{if(t.id!==o.id){const i=c.filter(s=>s.joueur1_id===t.id&&s.joueur2_id===o.id&&s.gagnant_id===t.id||s.joueur2_id===t.id&&s.joueur1_id===o.id&&s.gagnant_id===t.id).length,u=c.filter(s=>s.joueur1_id===t.id&&s.joueur2_id===o.id&&s.gagnant_id===o.id||s.joueur2_id===t.id&&s.joueur1_id===o.id&&s.gagnant_id===o.id).length;e[t.id][o.id]=`${i}-${u}`}})});const n=`
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
  `}function M(){const e=q(),r=a.sort((t,o)=>{const i=e[t.id]||{victoires:0};return(e[o.id]||{victoires:0}).victoires-i.victoires}).map((t,o)=>{const i=e[t.id]||{victoires:0,total:0,ratio:"0%"};return`
        <div class="stat-card" style="background: ${["linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)","linear-gradient(135deg, #c0cfd9 0%, #999999 100%)","linear-gradient(135deg, #f97316 0%, #dc2626 100%)"][o]||"linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)"}">
          <div class="stat-label">#${o+1} - ${t.nom}</div>
          <div class="stat-value">${i.victoires}</div>
          <div class="stat-label">${i.total} matchs • ${i.ratio}</div>
        </div>
      `}).join("");H.innerHTML=r}function V(){if(c.length===0){_.innerHTML='<p class="loading">Aucune victoire enregistrée</p>';return}const e=c.slice().reverse().map(n=>{const r=a.find(g=>g.id===n.joueur1_id),t=a.find(g=>g.id===n.joueur2_id),o=a.find(g=>g.id===n.gagnant_id),i=n.gagnant_id===n.joueur1_id?t:r,s=new Date(n.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
        <div class="historique-item">
          <div class="historique-titre">
            🏆 ${(o==null?void 0:o.nom)||"Inconnu"} a battu ${(i==null?void 0:i.nom)||"Inconnu"}
          </div>
          <div class="historique-date">${s}</div>
        </div>
      `}).join("");_.innerHTML=e}function q(){const e={};return a.forEach(n=>{const r=c.filter(i=>i.gagnant_id===n.id).length,t=c.filter(i=>i.joueur1_id===n.id||i.joueur2_id===n.id).length,o=t>0?Math.round(r/t*100):0;e[n.id]={victoires:r,total:t,ratio:`${o}%`}}),e}function x(e){m.textContent=e,m.className="message success",setTimeout(()=>{m.className="message"},3e3)}function A(e){m.textContent=e,m.className="message error"}async function D(){await X(),await Y()}function k(){console.log("🚀 Initializing app..."),R(),T.addEventListener("click",Q),S.addEventListener("click",W),$.addEventListener("click",()=>{const e=y.value.trim();if(!e){A("Veuillez entrer un nom");return}Z(e)}),y.addEventListener("keypress",e=>{e.key==="Enter"&&$.click()}),C.addEventListener("click",()=>{const e=v.value,n=E.value,r=j.value;if(!e||!n||!r){d.textContent="Veuillez sélectionner les joueurs et le gagnant",d.className="message error";return}if(e===n){d.textContent="Sélectionnez deux joueurs différents",d.className="message error";return}if(r!==e&&r!==n){d.textContent="Le gagnant doit être l'un des deux joueurs",d.className="message error";return}ee(e,n,r)}),G(),setInterval(()=>{l&&D()},5e3),console.log("✅ App initialized successfully")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();
