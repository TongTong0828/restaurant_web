import{d as C,q as b,J as i,x as q,o as x,c as U,a as m,b as s,w as n,e as _,p as f,E as p,r as w,_ as N}from"./index-B7BW4uVQ.js";const R={class:"profile-page"},k={class:"profile-card"},E={class:"password-section"},B=C({__name:"Profile",setup($){const c=b(),P=b(),u=i({name:"",phone:""}),o=i({currentPassword:"",newPassword:"",confirmPassword:""}),y=i({name:[{required:!0,message:"Please input your name",trigger:"blur"},{min:2,message:"Length should be at least 2 characters",trigger:"blur"}],phone:[{required:!0,message:"Please input your phone number",trigger:"blur"},{pattern:/^\d{10,}$/,message:"Please enter a valid phone number",trigger:"blur"}]}),h=i({currentPassword:[{required:!0,message:"Current password is required",trigger:"blur"}],newPassword:[{required:!0,message:"New password is required",trigger:"blur"},{min:6,message:"Length should be at least 6 characters",trigger:"blur"}],confirmPassword:[{validator:(a,e,r)=>{o.newPassword&&!e?r(new Error("Please confirm your password")):o.newPassword!==e?r(new Error("Passwords do not match!")):r()},trigger:"blur"}]}),V=async()=>{try{const a=await f.get("/api/auth/me");a.status==="success"&&(u.name=a.data.name,u.phone=a.data.phone||"")}catch(a){console.error("Failed to fetch user profile:",a),p.error("Failed to load user profile")}},v=async a=>{a&&await a.validate(async e=>{var r,t;if(e)try{(await f.put("/api/auth/profile",{name:u.name,phone:u.phone})).status==="success"&&p.success("Profile updated successfully")}catch(d){console.error("Failed to update profile:",d),p.error(((t=(r=d.response)==null?void 0:r.data)==null?void 0:t.message)||"Failed to update profile")}})},F=async a=>{a&&await a.validate(async e=>{var r,t;if(e)try{(await f.put("/api/auth/password",{currentPassword:o.currentPassword,newPassword:o.newPassword})).status==="success"&&(p.success("Password updated successfully"),o.currentPassword="",o.newPassword="",o.confirmPassword="",a.resetFields())}catch(d){console.error("Failed to update password:",d),p.error(((t=(r=d.response)==null?void 0:r.data)==null?void 0:t.message)||"Failed to update password")}})};return q(()=>{V()}),(a,e)=>{const r=w("el-input"),t=w("el-form-item"),d=w("el-button"),g=w("el-form");return x(),U("div",R,[m("div",k,[e[10]||(e[10]=m("h2",null,"Profile Settings",-1)),s(g,{ref_key:"profileFormRef",ref:c,model:u,rules:y,"label-width":"120px",class:"profile-form"},{default:n(()=>[s(t,{label:"Name",prop:"name"},{default:n(()=>[s(r,{modelValue:u.name,"onUpdate:modelValue":e[0]||(e[0]=l=>u.name=l)},null,8,["modelValue"])]),_:1}),s(t,{label:"Phone",prop:"phone"},{default:n(()=>[s(r,{modelValue:u.phone,"onUpdate:modelValue":e[1]||(e[1]=l=>u.phone=l)},null,8,["modelValue"])]),_:1}),s(t,null,{default:n(()=>[s(d,{type:"primary",onClick:e[2]||(e[2]=l=>v(c.value))},{default:n(()=>e[7]||(e[7]=[_(" Update Profile ")])),_:1})]),_:1})]),_:1},8,["model","rules"]),m("div",E,[e[9]||(e[9]=m("h2",null,"Change Password",-1)),s(g,{ref_key:"passwordFormRef",ref:P,model:o,rules:h,"label-width":"120px",class:"profile-form"},{default:n(()=>[s(t,{label:"Current Password",prop:"currentPassword"},{default:n(()=>[s(r,{modelValue:o.currentPassword,"onUpdate:modelValue":e[3]||(e[3]=l=>o.currentPassword=l),type:"password","show-password":"",placeholder:"Enter current password"},null,8,["modelValue"])]),_:1}),s(t,{label:"New Password",prop:"newPassword"},{default:n(()=>[s(r,{modelValue:o.newPassword,"onUpdate:modelValue":e[4]||(e[4]=l=>o.newPassword=l),type:"password","show-password":"",placeholder:"Enter new password"},null,8,["modelValue"])]),_:1}),s(t,{label:"Confirm Password",prop:"confirmPassword"},{default:n(()=>[s(r,{modelValue:o.confirmPassword,"onUpdate:modelValue":e[5]||(e[5]=l=>o.confirmPassword=l),type:"password","show-password":"",placeholder:"Confirm new password"},null,8,["modelValue"])]),_:1}),s(t,null,{default:n(()=>[s(d,{type:"primary",onClick:e[6]||(e[6]=l=>F(P.value))},{default:n(()=>e[8]||(e[8]=[_(" Update Password ")])),_:1})]),_:1})]),_:1},8,["model","rules"])])])])}}}),I=N(B,[["__scopeId","data-v-0bce520e"]]);export{I as default};