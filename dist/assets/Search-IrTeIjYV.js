import{q as a,j as e,v as i,F as t,y as h,T as n,L as m,B as f,t as u,H as l,S as j}from"./index--WTcuLUy.js";import{I as g}from"./index-YhYeChE2.js";import{V as p}from"./chunk-NTCQBYKE-DppzSCO-.js";import{u as S}from"./useFetch-Cc7htHJd.js";import{D as I}from"./chunk-W7WUSNWJ-CeHpZ36T.js";function y({student:r}){const{colorMode:s}=a();return e.jsx(i,{w:"full",children:e.jsxs(t,{alignItems:"center",justifyContent:"space-between",children:[e.jsxs(t,{alignItems:"center",gap:3,children:[e.jsx(h,{src:r.profilePicture,w:"70px",h:"70px",rounded:"full",objectFit:"cover"}),e.jsxs(i,{children:[e.jsx(n,{fontSize:"lg",fontWeight:600,children:r.fullname}),e.jsx(n,{size:"sm",textColor:s==="dark"?"gray.500":"#838383",children:r.degree||"No degree provided"})]})]}),e.jsx(m,{to:`/student-profile/${r._id}`,children:e.jsx(f,{leftIcon:e.jsx(g,{size:22}),colorScheme:"purple",children:"View profile"})})]})})}function w({searchResults:r}){return e.jsx(p,{gap:8,children:r.length>0?r.map(s=>e.jsx(y,{student:s},s._id)):e.jsx(n,{size:"md",children:"No results found"})})}function M(){const[r,s]=u(),{colorMode:c}=a(),{loading:d,result:x,error:o}=S(`/api/students/search?${r.toString()}`);return e.jsxs(e.Fragment,{children:[e.jsxs(t,{alignItems:"center",gap:"5",mb:12,children:[e.jsx(l,{fontWeight:700,fontSize:"4xl",children:"Search"}),e.jsx(I,{w:"full",bg:c==="light"?"gray":"gray.800",rounded:"full",h:"2px",flex:"1"})]}),e.jsxs(l,{fontWeight:700,fontSize:"2xl",mb:12,children:['Showing results for "',r.get("sname"),'"']}),d?e.jsx(t,{alignItems:"center",justifyContent:"center",h:"200px",children:e.jsx(j,{})}):o?e.jsx(n,{color:"red.400",mt:5,children:o}):e.jsx(w,{searchResults:x})]})}export{M as default};