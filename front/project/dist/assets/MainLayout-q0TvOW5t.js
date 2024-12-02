import{d as L,u as c,o as u,c as i,a as r,b as o,w as e,e as s,f as l,F as m,g as x,h as f,t as B,i as D,r as d,j as F,_ as M}from"./index-B7BW4uVQ.js";const N={class:"app-container"},S={class:"header"},V={class:"logo"},I={class:"nav"},U={key:2,class:"user-controls"},A={class:"user-name"},O={class:"main-content"},j={class:"footer"},E={class:"footer-content"},P=L({__name:"MainLayout",setup(T){const _=D(),a=c(),w=p=>{switch(p){case"profile":a.isRestaurant?_.push("/restaurant-admin/profile"):_.push("/customer/profile");break;case"logout":a.logout(),_.push("/");break}};return(p,t)=>{const n=d("router-link"),v=d("el-icon"),g=d("el-dropdown-item"),y=d("el-dropdown-menu"),b=d("el-dropdown"),R=d("router-view"),C=d("el-button");return u(),i("div",N,[r("header",S,[r("div",V,[o(n,{to:"/"},{default:e(()=>t[0]||(t[0]=[s("Food Delivery")])),_:1})]),r("nav",I,[l(a).isRestaurant?f("",!0):(u(),i(m,{key:0},[o(n,{to:"/restaurants"},{default:e(()=>t[1]||(t[1]=[s("Restaurants")])),_:1}),l(a).isLoggedIn?(u(),x(n,{key:0,to:"/orders"},{default:e(()=>t[2]||(t[2]=[s("My Orders")])),_:1})):f("",!0),o(n,{to:"/cart"},{default:e(()=>t[3]||(t[3]=[s("Cart")])),_:1})],64)),l(a).isRestaurant?(u(),i(m,{key:1},[o(n,{to:"/restaurant-admin/dashboard"},{default:e(()=>t[4]||(t[4]=[s("Dashboard")])),_:1}),o(n,{to:"/restaurant-admin/menu"},{default:e(()=>t[5]||(t[5]=[s("Menu")])),_:1}),o(n,{to:"/restaurant-admin/orders"},{default:e(()=>t[6]||(t[6]=[s("Orders")])),_:1}),o(n,{to:"/restaurant-admin/profile"},{default:e(()=>t[7]||(t[7]=[s("Settings")])),_:1})],64)):f("",!0),l(a).isLoggedIn?(u(),i("div",U,[o(b,{onCommand:w},{dropdown:e(()=>[o(y,null,{default:e(()=>[o(g,{command:"profile"},{default:e(()=>t[8]||(t[8]=[s("Profile")])),_:1}),o(g,{command:"logout"},{default:e(()=>t[9]||(t[9]=[s("Logout")])),_:1})]),_:1})]),default:e(()=>{var k;return[r("span",A,[s(B((k=l(a).user)==null?void 0:k.name)+" ",1),o(v,{class:"el-icon--right"},{default:e(()=>[o(l(F))]),_:1})])]}),_:1})])):(u(),i(m,{key:3},[o(n,{to:"/auth/login"},{default:e(()=>t[10]||(t[10]=[s("User Login")])),_:1}),o(n,{to:"/auth/register"},{default:e(()=>t[11]||(t[11]=[s("User Register")])),_:1}),o(n,{to:"/restaurant/login"},{default:e(()=>t[12]||(t[12]=[s("Restaurant Login")])),_:1}),o(n,{to:"/restaurant/register"},{default:e(()=>t[13]||(t[13]=[s("Restaurant Register")])),_:1})],64))])]),r("main",O,[o(R)]),r("footer",j,[r("div",E,[t[15]||(t[15]=r("p",null,"© 2023 Food Delivery. All rights reserved.",-1)),o(n,{to:"/about",class:"about-link"},{default:e(()=>[o(C,{link:""},{default:e(()=>t[14]||(t[14]=[s("About")])),_:1})]),_:1})])])])}}}),z=M(P,[["__scopeId","data-v-15233019"]]);export{z as default};
