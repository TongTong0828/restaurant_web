import{d as j,m as F,r as S,o as v,g as L,w as q,a as n,t as V,b as C,n as W,_ as Q,p as G,q as w,x as J,c as A,F as O,k as H,h as K,i as X,E as Y}from"./index-B7BW4uVQ.js";import{r as U}from"./data-JFS6uQFP.js";const Z={class:"restaurant-image"},ee=["src","alt"],te={class:"delivery-info"},se={class:"delivery-fee"},ae={class:"restaurant-info"},oe={class:"header"},re={class:"rating"},ne={class:"categories"},ie={class:"footer"},le={class:"min-order"},ce=j({__name:"RestaurantCard",props:{restaurant:{}},setup(_){const c=_,f={2:{delivery_fee:"5.00",minimum_order:"20.00"},3:{delivery_fee:"6.00",minimum_order:"30.00"},5:{delivery_fee:"8.00",minimum_order:"40.00"}},u=F(()=>{const a=f[c.restaurant.id];return a?a.delivery_fee:c.restaurant.delivery_fee||"0.00"}),d=F(()=>{const a=f[c.restaurant.id];return a?a.minimum_order:c.restaurant.minimum_order||"0.00"}),k=F(()=>{if(!c.restaurant.opening_hours)return!1;const a=new Date,g=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][a.getDay()],l=c.restaurant.opening_hours[g];if(!l||typeof l!="string")return!1;const b=l.split("-");if(b.length!==2)return!1;try{const N=a.getHours()*100+a.getMinutes(),[t,p]=b[0].trim().split(":").map(Number),[h,P]=b[1].trim().split(":").map(Number);if(isNaN(t)||isNaN(p)||isNaN(h)||isNaN(P))return!1;const R=t*100+p,$=h*100+P;return N>=R&&N<=$}catch(N){return console.error("Error parsing restaurant hours:",N),!1}});return(a,m)=>{const g=S("el-rate"),l=S("router-link");return v(),L(l,{to:`/restaurants/${a.restaurant.id}`,class:"restaurant-card"},{default:q(()=>[n("div",Z,[n("img",{src:a.restaurant.image,alt:a.restaurant.name},null,8,ee),n("div",te,[n("span",se," Delivery: "+V(u.value)+"$ ",1),m[0]||(m[0]=n("span",{class:"delivery-time"}," 30-45 min ",-1))])]),n("div",ae,[n("div",oe,[n("h3",null,V(a.restaurant.name),1),n("div",re,[C(g,{"model-value":Number(a.restaurant.rating),disabled:"","text-color":"#ff9900"},null,8,["model-value"]),n("span",null,V(a.restaurant.rating),1)])]),n("div",ne,V(a.restaurant.categories.join(" | ")),1),n("div",ie,[n("span",le," Min. order: "+V(d.value)+" $ ",1),n("span",{class:W(["status",{open:k.value}])},V(k.value?"Open":"Closed"),3)])])]),_:1},8,["to"])}}}),x=Q(ce,[["__scopeId","data-v-66194dbc"]]),ue={async getRestaurants(_){try{const c={page:_.page||1,limit:_.limit||10,_t:Date.now()};_.search&&(c.search=_.search),_.category&&(c.category=_.category),_.sort&&(c.sort=_.sort),console.log("Sending request with params:",c);const f=await G.get("/api/restaurants",{params:c});console.log("Raw API response:",f),console.log("Response data:",f.data);const{restaurants:u,pagination:d}=f.data,k={2:{delivery_fee:"5.00",minimum_order:"20.00"},3:{delivery_fee:"6.00",minimum_order:"30.00"},5:{delivery_fee:"8.00",minimum_order:"40.00"}},a=t=>{if(!t)return!1;const p=new Date,P=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][p.getDay()],R=t[P];if(!R)return!1;try{if(typeof R=="string"&&R.includes("-")){const[$,z]=R.split("-"),[D,E]=$.trim().split(":").map(Number),[r,e]=z.trim().split(":").map(Number),o=p.getHours()*100+p.getMinutes(),i=D*100+E,y=r*100+e;return o>=i&&o<=y}return!1}catch($){return console.error("Error parsing restaurant hours:",$),!1}},m=u.map(t=>{const p=k[t.id];return p?{...t,description:t.description||"",image:t.image||"",rating:parseFloat(t.rating||"0.0"),delivery_fee:p.delivery_fee,minimum_order:p.minimum_order,categories:Array.isArray(t.categories)?t.categories:[],opening_hours:t.opening_hours,status:a(t.opening_hours)?"open":"closed"}:{...t,description:t.description||"",image:t.image||"",rating:parseFloat(t.rating||"0.0"),delivery_fee:t.delivery_fee||"0.00",minimum_order:t.minimum_order||"0.00",categories:Array.isArray(t.categories)?t.categories:[],opening_hours:t.opening_hours,status:a(t.opening_hours)?"open":"closed"}}),g=["2","3","5"],l=m.filter(t=>g.includes(t.id.toString())),b=m.filter(t=>!g.includes(t.id.toString()));return{data:{restaurants:[...l,...b],total:d.total,page:d.page,limit:d.limit}}}catch(c){return console.error("Error in getRestaurants:",c),{data:{restaurants:[],total:0,page:1,limit:10}}}}},de={class:"restaurant-list"},me={class:"filters"},ge={key:0,class:"loading"},pe={key:1},ve={class:"restaurant-section"},_e={class:"restaurants"},fe={key:0,class:"restaurant-section"},ye={class:"restaurants"},he={class:"pagination"},Ce={key:1,class:"no-results"},ke="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop",Re=j({__name:"RestaurantList",setup(_){const c=X(),f=w(!1),u=w(""),d=w(""),k=w(""),a=w(1),m=w(10),g=w(0),l=w([]),b=F(()=>{var r;return((r=U)==null?void 0:r.filter(e=>{var y;const o=!u.value||e.name.toLowerCase().includes(u.value.toLowerCase())||(((y=e.description)==null?void 0:y.toLowerCase().includes(u.value.toLowerCase()))??!1),i=!d.value||Array.isArray(e.categories)&&e.categories.includes(d.value);return o&&i}))??[]}),N=F(()=>{var e;const r=new Set(((e=U)==null?void 0:e.map(o=>o.id.toString()))??[]);return console.log("Featured restaurant IDs:",[...r]),r}),t=F(()=>{console.log("Computing apiRestaurants"),console.log("Current restaurants:",l.value);const e=(Array.isArray(l.value)?l.value:[]).filter(o=>{var I;const i=o.id.toString();if(N.value.has(i))return console.log("Skipping featured restaurant:",i),!1;const y=!u.value||o.name.toLowerCase().includes(u.value.toLowerCase())||(((I=o.description)==null?void 0:I.toLowerCase().includes(u.value.toLowerCase()))??!1);let M=!d.value;return d.value&&o.categories&&(M=(Array.isArray(o.categories)?o.categories:typeof o.categories=="string"?o.categories.split(",").map(s=>s.trim()):[]).includes(d.value)),y&&M});return console.log("Filtered restaurants:",e),e}),p=F(()=>{var e;const r=new Set;return(e=U)==null||e.forEach(o=>{o.categories&&Array.isArray(o.categories)&&o.categories.forEach(i=>r.add(i))}),Array.isArray(l.value)&&l.value.forEach(o=>{o.categories&&(typeof o.categories=="string"?o.categories.split(",").forEach(i=>r.add(i.trim())):Array.isArray(o.categories)&&o.categories.forEach(i=>r.add(i)))}),[...r].sort()}),h=async()=>{f.value=!0;try{const r={page:a.value,limit:m.value,search:u.value||void 0,category:d.value||void 0,sort:k.value||void 0};console.log("Fetching restaurants with params:",r);const e=await ue.getRestaurants(r);if(console.log("API Response:",e),e!=null&&e.data){const{restaurants:o,total:i,page:y,limit:M}=e.data;console.log("Setting restaurants:",o),l.value=o,g.value=i,a.value=y,m.value=M,console.log("Updated restaurants:",l.value),console.log("Total restaurants:",g.value),console.log("Current page:",a.value),console.log("Page size:",m.value)}else console.warn("Invalid response format"),l.value=[],g.value=0}catch(r){console.error("Failed to fetch restaurants:",r),l.value=[],g.value=0,Y.error("Failed to load restaurants")}finally{f.value=!1}},P=()=>{a.value=1,h()},R=()=>{a.value=1,h()},$=()=>{a.value=1,h()},z=r=>{m.value=r,h()},D=r=>{a.value=r,h()},E=r=>{c.push(`/restaurants/${r}`)};return J(()=>{h()}),(r,e)=>{const o=S("el-input"),i=S("el-option"),y=S("el-select"),M=S("el-skeleton"),I=S("el-pagination"),B=S("el-empty");return v(),A("div",de,[e[7]||(e[7]=n("h1",null,"All Restaurants",-1)),n("div",me,[C(o,{modelValue:u.value,"onUpdate:modelValue":e[0]||(e[0]=s=>u.value=s),placeholder:"Search restaurants...","prefix-icon":"el-icon-search",clearable:"",onInput:P},null,8,["modelValue"]),C(y,{modelValue:d.value,"onUpdate:modelValue":e[1]||(e[1]=s=>d.value=s),placeholder:"All Categories",clearable:"",onChange:R},{default:q(()=>[(v(!0),A(O,null,H(p.value,s=>(v(),L(i,{key:s,label:s,value:s},null,8,["label","value"]))),128))]),_:1},8,["modelValue"]),C(y,{modelValue:k.value,"onUpdate:modelValue":e[2]||(e[2]=s=>k.value=s),placeholder:"Sort by",clearable:"",onChange:$},{default:q(()=>[C(i,{label:"Rating",value:"rating"}),C(i,{label:"Delivery Fee",value:"deliveryFee"}),C(i,{label:"Minimum Order",value:"minimumOrder"})]),_:1},8,["modelValue"])]),f.value?(v(),A("div",ge,[C(M,{rows:3,animated:""})])):(v(),A("div",pe,[n("div",ve,[e[5]||(e[5]=n("h2",{class:"section-title"},"Featured Restaurants",-1)),n("div",_e,[(v(!0),A(O,null,H(b.value,s=>(v(),L(x,{key:"mock-"+s.id,restaurant:s,"is-mock":!0,onClick:T=>E(s.id)},null,8,["restaurant","onClick"]))),128))])]),t.value.length>0?(v(),A("div",fe,[e[6]||(e[6]=n("h2",{class:"section-title"},"All Restaurants",-1)),n("div",ye,[(v(!0),A(O,null,H(t.value,s=>(v(),L(x,{key:s.id,restaurant:{...s,description:s.description||"No description available",image:s.image||ke,deliveryFee:s.delivery_fee,minimumOrder:s.minimum_order,categories:Array.isArray(s.categories)?s.categories:s.categories?s.categories.split(",").map(T=>T.trim()):[]},onClick:T=>E(s.id)},null,8,["restaurant","onClick"]))),128))]),n("div",he,[C(I,{"current-page":a.value,"onUpdate:currentPage":e[3]||(e[3]=s=>a.value=s),"page-size":m.value,"onUpdate:pageSize":e[4]||(e[4]=s=>m.value=s),total:g.value,"page-sizes":[10,20,30],layout:"total, sizes, prev, pager, next",onSizeChange:z,onCurrentChange:D},null,8,["current-page","page-size","total"])])])):!f.value&&u.value?(v(),A("div",Ce,[C(B,{description:"No restaurants found"})])):K("",!0)]))])}}}),Se=Q(Re,[["__scopeId","data-v-c3f5bc2c"]]);export{Se as default};
