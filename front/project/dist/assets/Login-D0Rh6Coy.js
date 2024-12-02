import{d as x,y as E,q as d,o as L,c as P,a as l,b as o,w as t,f as _,e as g,P as R,i as S,r,Q as I,R as U,U as q,E as v,_ as z}from"./index-B7BW4uVQ.js";const B={class:"login-container"},C={class:"form-footer"},N={class:"auth-links"},A=x({__name:"Login",setup(M){const w=S(),m=E(),n=d(!1),i=d(),a=d({email:"",password:""}),b={email:[{required:!0,message:"Please enter email",trigger:"blur"},{type:"email",message:"Please enter valid email",trigger:"blur"}],password:[{required:!0,message:"Please enter password",trigger:"blur"},{min:6,message:"Password must be at least 6 characters",trigger:"blur"}]},y=async()=>{if(i.value)try{await i.value.validate(),n.value=!0;const s=await q.login(a.value);if(console.log("Login response:",s),s&&s.token&&s.user)m.setToken(s.token),m.setUser(s.user),v.success("Login successful"),w.push("/restaurant-admin");else throw console.error("Invalid response structure:",s),new Error("Invalid response data")}catch(s){console.error("Login error:",s),v.error(s.message||"Login failed")}finally{n.value=!1}};return(s,e)=>{const p=r("el-icon"),c=r("el-input"),f=r("el-form-item"),k=r("el-button"),V=r("el-form"),h=r("router-link");return L(),P("div",B,[e[4]||(e[4]=l("h2",null,"Restaurant Login",-1)),e[5]||(e[5]=l("p",{class:"subtitle"},"Please sign in to manage your restaurant",-1)),o(V,{ref_key:"formRef",ref:i,model:a.value,rules:b,"label-position":"top",onSubmit:R(y,["prevent"])},{default:t(()=>[o(f,{label:"Email",prop:"email"},{default:t(()=>[o(c,{modelValue:a.value.email,"onUpdate:modelValue":e[0]||(e[0]=u=>a.value.email=u),placeholder:"Enter your email",type:"email",size:"large"},{prefix:t(()=>[o(p,null,{default:t(()=>[o(_(I))]),_:1})]),_:1},8,["modelValue"])]),_:1}),o(f,{label:"Password",prop:"password"},{default:t(()=>[o(c,{modelValue:a.value.password,"onUpdate:modelValue":e[1]||(e[1]=u=>a.value.password=u),placeholder:"Enter your password",type:"password",size:"large","show-password":""},{prefix:t(()=>[o(p,null,{default:t(()=>[o(_(U))]),_:1})]),_:1},8,["modelValue"])]),_:1}),l("div",C,[o(k,{type:"primary","native-type":"submit",size:"large",loading:n.value,class:"submit-btn"},{default:t(()=>e[2]||(e[2]=[g(" Sign In ")])),_:1},8,["loading"])])]),_:1},8,["model"]),l("div",N,[o(h,{to:"/restaurant/register"},{default:t(()=>e[3]||(e[3]=[g("Don't have an account? Register your restaurant")])),_:1})])])}}}),D=z(A,[["__scopeId","data-v-11dac4e3"]]);export{D as default};
