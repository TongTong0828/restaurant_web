import{d as X,y as Z,u as ee,q as g,x as te,m as ae,o as i,c as u,a,t as c,b as r,w as v,f as S,h as w,F as V,k as B,e as x,g as se,z as ne,i as le,p as T,E as M,r as y,A as oe,B as re,C as ie,n as ue,D as ce,G as de,_ as ve}from"./index-B7BW4uVQ.js";import{r as me,m as _e}from"./data-JFS6uQFP.js";const pe={class:"restaurant-detail"},fe={key:0,class:"content"},ge={class:"restaurant-header"},ye={class:"restaurant-info"},he={class:"meta"},ke={class:"rating"},be={class:"categories"},Ie={class:"details"},Ce={class:"detail-item"},Se={class:"detail-item"},we={class:"detail-item"},xe={key:0,class:"restaurant-image"},$e=["src","alt"],Fe={class:"menu-section"},Oe={key:0,class:"loading-state"},Re={key:1,class:"error-state"},De={key:2},qe={class:"category-title"},Ve={class:"menu-items"},Be={class:"item-image"},Me={class:"image-error"},je={class:"image-placeholder"},Ne={key:0,class:"unavailable-overlay"},ze={class:"item-info"},Te={class:"description"},Ae={class:"price-action"},Ee={class:"price"},Pe={class:"cart-content"},Ue={key:0,class:"cart-items"},Je={class:"item-info"},Le={class:"price"},Qe={class:"quantity-control"},Ye={key:1,class:"empty-cart"},Ge={key:2,class:"cart-summary"},He={class:"subtotal"},We={class:"delivery-fee"},Ke={class:"total"},Xe={key:3,class:"cart-actions"},Ze={key:0,class:"minimum-order-warning"},et=X({__name:"RestaurantDetail",setup(tt){const A=ne(),j=le(),E=Z(),P=ee(),s=g(null),h=g([]),I=g([]),k=g({}),O=g(!1),b=g(null),m=g([]),R=g(!1),U=async t=>{try{console.log("Fetching restaurant data:",t);const e=await T.get(`/api/restaurants/${t}`);return console.log("Restaurant API response:",e),e.status==="success"&&e.data?(s.value=e.data.restaurant||e.data,console.log("Set restaurant data:",s.value),!0):(console.log("Invalid restaurant response:",e),!1)}catch(e){return console.error("Error fetching restaurant:",e),!1}},J=async t=>{var e;try{O.value=!0,b.value=null,console.log("Fetching menu items for restaurant:",t);const n=await T.get(`/api/restaurants/${t}/menu-items`);if(console.log("Menu items response:",n),n.status==="success")if(n.data.menu_items&&typeof n.data.menu_items=="object"){k.value=n.data.menu_items,I.value=n.data.categories||Object.keys(n.data.menu_items),h.value=Object.values(n.data.menu_items).flat(),console.log("Menu data details:",{categories:I.value,totalItems:h.value.length,itemsByCategory:Object.entries(k.value).map(([o,p])=>({category:o,itemCount:p.length,sampleItem:p[0]}))});const l=h.value.filter(o=>o.image_url||o.image);console.log("Items with images:",{total:h.value.length,withImages:l.length,sampleUrls:l.slice(0,3).map(o=>({id:o.id,name:o.name,imageUrl:o.image_url||o.image}))})}else b.value="Invalid menu items format",h.value=[],I.value=[],k.value={}}catch(n){console.error("Error fetching menu items:",n),((e=n.response)==null?void 0:e.status)===404?b.value="No menu items available":b.value="Failed to load menu items",h.value=[],I.value=[],k.value={}}finally{O.value=!1}};te(async()=>{const t=A.params.id;if(["2","3","5"].includes(t)){const l=me.find(o=>o.id===t);if(l){s.value=l;const o=_e.filter(p=>p.restaurantId===t);h.value=o,k.value=o.reduce((p,f)=>{const C=f.category||"δ����";return p[C]||(p[C]=[]),p[C].push(f),p},{}),I.value=Object.keys(k.value)}}else{console.log("Fetching API data for restaurant:",t);const l=await U(t);console.log("Restaurant exists:",l),l?await J(t):b.value="Restaurant does not exist"}const n=localStorage.getItem("cart");if(n){const l=JSON.parse(n);l.restaurantId===t&&(m.value=l.items)}});const $=t=>{if(!t)return"";const[e,n]=t.split(":");return`${e.padStart(2,"0")}:${n?n.padStart(2,"0"):"00"}`},L=()=>{var l;if(!((l=s.value)!=null&&l.opening_hours))return"Open 24/7";const e=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()],n=s.value.opening_hours[e];if(n){if(typeof n=="string"){if(n.includes("-")){const[o,p]=n.split("-");return`${$(o)}-${$(p)}`}return n}if(typeof n=="object"&&n.open&&n.close)return`${$(n.open)}-${$(n.close)}`}return"Closed"},F=ae(()=>m.value.reduce((t,e)=>t+parseFloat(e.price.toString())*e.quantity,0)),Q=t=>{if(!s.value||!s.value.id){M.error("Restaurant information not available");return}m.value.length||(m.value=[]);const e=m.value.find(o=>o.id===t.id);e?e.quantity++:m.value.push({id:t.id,name:t.name,price:t.price,description:t.description,image:t.image_url||t.image,category:t.category,quantity:1});const n=s.value.id.toString(),l={restaurantId:n,restaurant:{id:n,name:s.value.name,delivery_fee:s.value.delivery_fee||"0",minimum_order:s.value.minimum_order||"0"},items:m.value};console.log("Saving cart data:",l),localStorage.setItem("cart",JSON.stringify(l)),R.value=!0,M.success("Item added to cart")},Y=t=>{t.quantity++,D()},G=t=>{t.quantity>1?t.quantity--:m.value=m.value.filter(e=>e.id!==t.id),D()},D=()=>{if(s.value){const t={restaurantId:s.value.id.toString(),restaurant:{id:s.value.id.toString(),name:s.value.name,delivery_fee:s.value.delivery_fee||s.value.deliveryFee||"0",minimum_order:s.value.minimum_order||s.value.minimumOrder||"0"},items:m.value};localStorage.setItem("cart",JSON.stringify(t))}},H=()=>{if(!E.isAuthenticated&&!P.isLoggedIn){M.warning("Please login to continue"),localStorage.setItem("redirectPath","/checkout"),j.push({path:"/auth/login",query:{redirect:"/checkout"}});return}s.value&&(D(),j.push("/checkout"))},N=()=>{if(!s.value)return 0;const t=s.value.delivery_fee||s.value.deliveryFee;return t?parseFloat(t):0},q=()=>{if(!s.value)return 0;const t=s.value.minimum_order||s.value.minimumOrder;return t?parseFloat(t):0};return(t,e)=>{var z;const n=y("el-rate"),l=y("el-icon"),o=y("el-skeleton"),p=y("el-image"),f=y("el-button"),C=y("el-drawer"),W=y("router-link"),K=y("el-empty");return i(),u("div",pe,[s.value?(i(),u("div",fe,[a("div",ge,[a("div",ye,[a("h1",null,c(s.value.name),1),a("div",he,[a("div",ke,[r(n,{modelValue:s.value.rating,"onUpdate:modelValue":e[0]||(e[0]=_=>s.value.rating=_),disabled:"","show-score":"","text-color":"#ff9900"},null,8,["modelValue"])]),a("div",be,c((z=s.value.categories)==null?void 0:z.join(" | ")),1)]),a("div",Ie,[a("div",Ce,[r(l,null,{default:v(()=>[r(S(oe))]),_:1}),a("span",null,c(s.value.address),1)]),a("div",Se,[r(l,null,{default:v(()=>[r(S(re))]),_:1}),a("span",null,c(s.value.phone),1)]),a("div",we,[r(l,null,{default:v(()=>[r(S(ie))]),_:1}),a("span",null,c(L()),1)])])]),s.value.image?(i(),u("div",xe,[a("img",{src:s.value.image,alt:s.value.name},null,8,$e)])):w("",!0)]),a("div",Fe,[e[4]||(e[4]=a("h2",null,"Menu",-1)),O.value?(i(),u("div",Oe,[r(o,{rows:3,animated:""})])):b.value?(i(),u("div",Re,c(b.value),1)):(i(),u("div",De,[(i(!0),u(V,null,B(I.value,_=>(i(),u("div",{key:_,class:"menu-category"},[a("h3",qe,c(_),1),a("div",Ve,[(i(!0),u(V,null,B(k.value[_],d=>(i(),u("div",{key:d.id,class:ue(["menu-item",{unavailable:d.is_available===!1}])},[a("div",Be,[r(p,{src:d.image_url||d.image||"/default-dish.jpg",alt:d.name,fit:"cover",loading:"lazy","preview-src-list":[d.image_url||d.image].filter(Boolean)},{error:v(()=>[a("div",Me,[r(l,null,{default:v(()=>[r(S(ce))]),_:1}),e[2]||(e[2]=a("span",null,"Image not available",-1))])]),placeholder:v(()=>[a("div",je,[r(l,null,{default:v(()=>[r(S(de))]),_:1}),e[3]||(e[3]=a("span",null,"Loading...",-1))])]),_:2},1032,["src","alt","preview-src-list"]),d.is_available===!1?(i(),u("div",Ne," Out of Stock ")):w("",!0)]),a("div",ze,[a("h3",null,c(d.name),1),a("p",Te,c(d.description),1),a("div",Ae,[a("span",Ee,"$"+c(d.price.toFixed(2)),1),r(f,{type:"primary",size:"small",onClick:at=>Q(d),disabled:d.is_available===!1},{default:v(()=>[x(c(d.is_available===!1?"Out of Stock":"Add to Cart"),1)]),_:2},1032,["onClick","disabled"])])])],2))),128))])]))),128))]))]),r(C,{modelValue:R.value,"onUpdate:modelValue":e[1]||(e[1]=_=>R.value=_),title:"Your Cart",direction:"rtl",size:"400px"},{default:v(()=>[a("div",Pe,[m.value.length?(i(),u("div",Ue,[(i(!0),u(V,null,B(m.value,_=>(i(),u("div",{key:_.id,class:"cart-item"},[a("div",Je,[a("h4",null,c(_.name),1),a("span",Le,"$"+c(_.price.toFixed(2)),1)]),a("div",Qe,[r(f,{type:"primary",circle:"",size:"small",onClick:d=>G(_)},{default:v(()=>e[5]||(e[5]=[x("-")])),_:2},1032,["onClick"]),a("span",null,c(_.quantity),1),r(f,{type:"primary",circle:"",size:"small",onClick:d=>Y(_)},{default:v(()=>e[6]||(e[6]=[x("+")])),_:2},1032,["onClick"])])]))),128))])):(i(),u("div",Ye," Your cart is empty ")),m.value.length?(i(),u("div",Ge,[a("div",He,[e[7]||(e[7]=a("span",null,"Subtotal:",-1)),a("span",null,"$"+c(F.value.toFixed(2)),1)]),a("div",We,[e[8]||(e[8]=a("span",null,"Delivery Fee:",-1)),a("span",null,"$"+c(N()),1)]),a("div",Ke,[e[9]||(e[9]=a("span",null,"Total:",-1)),a("span",null,"$"+c((F.value+N()).toFixed(2)),1)])])):w("",!0),m.value.length?(i(),u("div",Xe,[r(f,{type:"primary",disabled:F.value<q(),onClick:H},{default:v(()=>e[10]||(e[10]=[x(" Proceed to Checkout ")])),_:1},8,["disabled"]),F.value<q()?(i(),u("div",Ze," Minimum order amount: $"+c(q())+" (before delivery fee) ",1)):w("",!0)])):w("",!0)])]),_:1},8,["modelValue"])])):(i(),se(K,{key:1,description:"Restaurant does not exist"},{extra:v(()=>[r(W,{to:"/restaurants"},{default:v(()=>[r(f,{type:"primary"},{default:v(()=>e[11]||(e[11]=[x("Browse other restaurants")])),_:1})]),_:1})]),_:1}))])}}}),lt=ve(et,[["__scopeId","data-v-0bfefb67"]]);export{lt as default};
