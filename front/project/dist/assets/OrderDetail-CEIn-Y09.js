import{d as V,q as w,x as L,o as u,c as _,a as e,b as l,w as i,f as C,e as c,K as z,g as F,t as n,F as K,k as U,h as D,z as Y,i as j,p as $,E as v,I as G,r as p,L as H,M as J,D as Q,_ as W}from"./index-B7BW4uVQ.js";const X={class:"order-detail-page"},Z={class:"page-header"},ee={class:"order-content"},se={class:"card-header"},te={class:"info-section"},oe={class:"restaurant-info"},ne={class:"image-placeholder"},ae={class:"restaurant-details"},re={class:"info-section"},le={class:"order-items"},ie={class:"item-info"},de={class:"item-quantity"},ue={class:"item-name"},ce={class:"item-price"},pe={class:"unit-price"},_e={class:"subtotal"},me={class:"info-section"},ve={class:"delivery-info"},fe={class:"info-section"},ye={class:"payment-info"},ge={class:"order-summary"},he={class:"summary-item"},Oe={class:"summary-item"},ke={class:"summary-item total"},xe={key:0,class:"order-actions"},be=V({__name:"OrderDetail",setup(we){const B=Y();j();const m=w(!1),t=w(null),I=o=>o.reduce((s,a)=>s+a.price*a.quantity,0),y=async()=>{m.value=!0;try{const o=B.params.id,s=await $.get(`/api/orders/user/${o}`);console.log("Order API Response:",s),s&&s.id?t.value=s:(console.log("Order not found in response:",s),v.warning("Order not found"))}catch(o){console.error("Failed to load order details:",o),v.error("Failed to load order details")}finally{m.value=!1}},N=o=>o.charAt(0).toUpperCase()+o.slice(1),q=o=>({pending:"warning",confirmed:"info",preparing:"info",ready:"success",delivering:"success",completed:"success",cancelled:"danger"})[o]||"info",M=o=>{switch(o){case"cash":return"Cash on Delivery";case"credit_card":return"Credit Card";default:return o}},T=async()=>{var o,s,a;try{await G.confirm("Are you sure you want to cancel this order?","Cancel Order",{confirmButtonText:"Yes",cancelButtonText:"No",type:"warning"}),((o=(await $.put(`/api/orders/user/${t.value.id}/cancel`)).data)==null?void 0:o.message)==="Order cancelled successfully"&&(v.success("Order cancelled successfully"),y())}catch(d){if(d==="cancel")return;console.error("Failed to cancel order:",d),v.error(((a=(s=d.response)==null?void 0:s.data)==null?void 0:a.message)||"Failed to cancel order")}};return L(()=>{y()}),(o,s)=>{const a=p("el-icon"),d=p("el-button"),E=p("el-tag"),P=p("el-image"),S=p("el-card"),A=p("el-empty"),R=H("loading");return u(),_("div",X,[e("div",Z,[l(d,{onClick:s[0]||(s[0]=f=>o.$router.back()),class:"back-button"},{default:i(()=>[l(a,null,{default:i(()=>[l(C(J))]),_:1}),s[2]||(s[2]=c(" Back "))]),_:1}),s[3]||(s[3]=e("h1",null,"Order Details",-1))]),z((u(),_("div",ee,[t.value?(u(),F(S,{key:0,class:"order-info"},{header:i(()=>[e("div",se,[e("h3",null,"Order #"+n(t.value.order_number),1),l(E,{type:q(t.value.status)},{default:i(()=>[c(n(N(t.value.status)),1)]),_:1},8,["type"])])]),default:i(()=>{var f,g,h,O,k,x;return[e("div",te,[s[4]||(s[4]=e("h4",null,"Restaurant Information",-1)),e("div",oe,[l(P,{src:(f=t.value.restaurant)==null?void 0:f.image,fit:"cover",class:"restaurant-image",onError:s[1]||(s[1]=r=>{var b;console.error("Failed to load restaurant image:",r,(b=t.value.restaurant)==null?void 0:b.image)})},{error:i(()=>[e("div",ne,[l(a,null,{default:i(()=>[l(C(Q))]),_:1})])]),_:1},8,["src"]),e("div",ae,[e("h5",null,n((g=t.value.restaurant)==null?void 0:g.name),1),e("p",null,n((h=t.value.restaurant)==null?void 0:h.address),1),e("p",null,"Tel: "+n((O=t.value.restaurant)==null?void 0:O.phone),1)])])]),e("div",re,[s[5]||(s[5]=e("h4",null,"Order Items",-1)),e("div",le,[(u(!0),_(K,null,U(t.value.items,r=>(u(),_("div",{key:r.id,class:"order-item"},[e("div",ie,[e("span",de,n(r.quantity)+"x",1),e("span",ue,n(r.name),1)]),e("div",ce,[e("span",pe,"$"+n(r.price)+" each",1),e("span",_e,"$"+n((r.price*r.quantity).toFixed(2)),1)])]))),128))])]),e("div",me,[s[8]||(s[8]=e("h4",null,"Delivery Information",-1)),e("div",ve,[e("p",null,[s[6]||(s[6]=e("strong",null,"Address:",-1)),c(" "+n((k=t.value.delivery_info)==null?void 0:k.address),1)]),e("p",null,[s[7]||(s[7]=e("strong",null,"Phone:",-1)),c(" "+n((x=t.value.delivery_info)==null?void 0:x.phone),1)])])]),e("div",fe,[s[13]||(s[13]=e("h4",null,"Payment Information",-1)),e("div",ye,[e("p",null,[s[9]||(s[9]=e("strong",null,"Payment Method:",-1)),c(" "+n(M(t.value.payment_method)),1)]),e("div",ge,[e("div",he,[s[10]||(s[10]=e("span",null,"Subtotal:",-1)),e("span",null,"$"+n(I(t.value.items).toFixed(2)),1)]),e("div",Oe,[s[11]||(s[11]=e("span",null,"Delivery Fee:",-1)),e("span",null,"$"+n(Number(t.value.delivery_fee||0).toFixed(2)),1)]),e("div",ke,[s[12]||(s[12]=e("span",null,"Total:",-1)),e("span",null,"$"+n(Number(t.value.total_amount).toFixed(2)),1)])])])]),t.value.status==="pending"?(u(),_("div",xe,[l(d,{type:"danger",onClick:T},{default:i(()=>s[14]||(s[14]=[c("Cancel Order")])),_:1})])):D("",!0)]}),_:1})):m.value?D("",!0):(u(),F(A,{key:1,description:"Order not found"}))])),[[R,m.value]])])}}}),Fe=W(be,[["__scopeId","data-v-2ca5299a"]]);export{Fe as default};
