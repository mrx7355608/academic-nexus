import{r as e}from"./index--WTcuLUy.js";function p(r,s=!1){const[c,n]=e.useState(!0),[l,o]=e.useState(null),[i,a]=e.useState("");return e.useEffect(()=>{const f=`https://academic-nexus-iqrauni.vercel.app${r}`,u={};return s&&(u.credentials="include"),fetch(f,u).then(async t=>{if(t.ok)return t.json();const h=await t.json();throw new Error(h.error)}).then(({data:t})=>o(t)).catch(t=>a(t.message)).finally(()=>n(!1)),()=>{n(!0),a(""),o(null)}},[r,s]),{loading:c,result:l,error:i}}export{p as u};
