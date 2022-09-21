var app=function(){"use strict";function t(){}function n(t,n){for(const e in n)t[e]=n[e];return t}function e(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(e)}function c(t){return"function"==typeof t}function i(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}let l,s;function u(t,n){const e={};n=new Set(n);for(const o in t)n.has(o)||"$"===o[0]||(e[o]=t[o]);return e}function a(t,n){t.appendChild(n)}function d(t,n,e){t.insertBefore(n,e||null)}function f(t){t.parentNode.removeChild(t)}function m(t){return document.createElement(t)}function p(t){return document.createTextNode(t)}function $(){return p(" ")}function g(){return p("")}function v(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function h(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function w(t,n){const e=Object.getOwnPropertyDescriptors(t.__proto__);for(const o in n)null==n[o]?t.removeAttribute(o):"style"===o?t.style.cssText=n[o]:"__value"===o?t.value=t[o]=n[o]:e[o]&&e[o].set?t[o]=n[o]:h(t,o,n[o])}function k(t,n){t.value=null==n?"":n}function b(t,n,e,o){null===e?t.style.removeProperty(n):t.style.setProperty(n,e,o?"important":"")}function y(t){s=t}function x(){if(!s)throw new Error("Function called outside component initialization");return s}function R(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach((t=>t.call(this,n)))}const j=[],P=[],S=[],_=[],C=Promise.resolve();let M=!1;function A(t){S.push(t)}const E=new Set;let N=0;function O(){const t=s;do{for(;N<j.length;){const t=j[N];N++,y(t),I(t.$$)}for(y(null),j.length=0,N=0;P.length;)P.pop()();for(let t=0;t<S.length;t+=1){const n=S[t];E.has(n)||(E.add(n),n())}S.length=0}while(j.length);for(;_.length;)_.pop()();M=!1,E.clear(),y(t)}function I(t){if(null!==t.fragment){t.update(),r(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(A)}}const T=new Set;let L;function G(){L={r:0,c:[],p:L}}function U(){L.r||r(L.c),L=L.p}function D(t,n){t&&t.i&&(T.delete(t),t.i(n))}function V(t,n,e,o){if(t&&t.o){if(T.has(t))return;T.add(t),L.c.push((()=>{T.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}else o&&o()}function F(t){t&&t.c()}function B(t,n,o,i){const{fragment:l,on_mount:s,on_destroy:u,after_update:a}=t.$$;l&&l.m(n,o),i||A((()=>{const n=s.map(e).filter(c);u?u.push(...n):r(n),t.$$.on_mount=[]})),a.forEach(A)}function H(t,n){const e=t.$$;null!==e.fragment&&(r(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function Y(t,n){-1===t.$$.dirty[0]&&(j.push(t),M||(M=!0,C.then(O)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function q(n,e,c,i,l,u,a,d=[-1]){const m=s;y(n);const p=n.$$={fragment:null,ctx:null,props:u,update:t,not_equal:l,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(m?m.$$.context:[])),callbacks:o(),dirty:d,skip_bound:!1,root:e.target||m.$$.root};a&&a(p.root);let $=!1;if(p.ctx=c?c(n,e.props||{},((t,e,...o)=>{const r=o.length?o[0]:e;return p.ctx&&l(p.ctx[t],p.ctx[t]=r)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](r),$&&Y(n,t)),e})):[],p.update(),$=!0,r(p.before_update),p.fragment=!!i&&i(p.ctx),e.target){if(e.hydrate){const t=function(t){return Array.from(t.childNodes)}(e.target);p.fragment&&p.fragment.l(t),t.forEach(f)}else p.fragment&&p.fragment.c();e.intro&&D(n.$$.fragment),B(n,e.target,e.anchor,e.customElement),O()}y(m)}class J{$destroy(){H(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function W(e){let o,r,c,i,l,s,u=[{class:i=`button-wrapper ${e[2]} ${e[1]?"is-active":""}`},e[3]],$={};for(let t=0;t<u.length;t+=1)$=n($,u[t]);return{c(){o=m("button"),r=m("div"),c=p(e[0]),w(o,$)},m(t,n){d(t,o,n),a(o,r),a(r,c),o.autofocus&&o.focus(),l||(s=v(o,"click",e[4]),l=!0)},p(t,[n]){1&n&&function(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}(c,t[0]),w(o,$=function(t,n){const e={},o={},r={$$scope:1};let c=t.length;for(;c--;){const i=t[c],l=n[c];if(l){for(const t in i)t in l||(o[t]=1);for(const t in l)r[t]||(e[t]=l[t],r[t]=1);t[c]=l}else for(const t in i)r[t]=1}for(const t in o)t in e||(e[t]=void 0);return e}(u,[6&n&&i!==(i=`button-wrapper ${t[2]} ${t[1]?"is-active":""}`)&&{class:i},8&n&&t[3]]))},i:t,o:t,d(t){t&&f(o),l=!1,s()}}}function z(t,e,o){const r=["text","isActive","class"];let c=u(e,r),{text:i}=e,{isActive:l}=e,{class:s=""}=e;return t.$$set=t=>{e=n(n({},e),function(t){const n={};for(const e in t)"$"!==e[0]&&(n[e]=t[e]);return n}(t)),o(3,c=u(e,r)),"text"in t&&o(0,i=t.text),"isActive"in t&&o(1,l=t.isActive),"class"in t&&o(2,s=t.class)},[i,l,s,c,function(n){R.call(this,t,n)}]}class K extends J{constructor(t){super(),q(this,t,z,W,i,{text:0,isActive:1,class:2})}}function Q(n){let e;return{c(){e=m("table"),e.innerHTML='<tr><td>Clear Active Spell</td> \n        <td><kbd class="hotkey-badge">Esc</kbd></td></tr> \n    <tr id="center-cam-info"><td>Free Look</td> \n        <td><kbd class="hotkey-badge">W</kbd> \n            <kbd class="hotkey-badge">A</kbd> \n            <kbd class="hotkey-badge">S</kbd> \n            <kbd class="hotkey-badge">D</kbd>\n            or Click and Drag Middle Mouse Button</td></tr> \n    <tr id="center-cam-tooltip"><td>Camera Follow Player</td> \n        <td><kbd class="hotkey-badge">Z</kbd></td></tr> \n    <tr><td>Ping Location</td> \n        <td><kbd class="hotkey-badge">C</kbd></td></tr> \n    <tr><td>Toggle Menu</td> \n        <td><kbd class="hotkey-badge">Esc</kbd></td></tr> \n    <tr><td>Inventory</td> \n        <td><kbd class="hotkey-badge">Tab</kbd>\n            /\n            <kbd class="hotkey-badge">i</kbd></td></tr> \n    <tr><td>View Walk Distance</td> \n        <td><kbd class="hotkey-badge">f</kbd></td></tr>',h(e,"id","keymapping")},m(t,n){d(t,e,n)},p:t,i:t,o:t,d(t){t&&f(e)}}}class Z extends J{constructor(t){super(),q(this,t,null,Q,i,{})}}function X(n){let e,o,c,i,l,s,u,p,g,w;return{c(){e=m("div"),o=m("label"),o.textContent="Robe Color",c=$(),i=m("input"),l=$(),s=m("label"),s.textContent="Player Name",u=$(),p=m("input"),h(o,"for","robe"),h(i,"type","color"),h(i,"name","robe"),h(s,"for","player-name"),h(p,"type","text"),h(p,"name","player-name"),h(e,"class","flex flex-direction-column gap-15")},m(t,r){d(t,e,r),a(e,o),a(e,c),a(e,i),k(i,n[1]),a(e,l),a(e,s),a(e,u),a(e,p),k(p,n[0]),g||(w=[v(i,"input",n[3]),v(i,"blur",n[4]),v(p,"input",n[5]),v(p,"input",n[6])],g=!0)},p(t,[n]){2&n&&k(i,t[1]),1&n&&p.value!==t[0]&&k(p,t[0])},i:t,o:t,d(t){t&&f(e),g=!1,r(w)}}}function tt(t,n,e){let o=localStorage.getItem("player-name"),r=`#${parseInt(localStorage.getItem("player-color")).toString(16)}`;const c=t=>parseInt(t.slice(1),16);return[o,r,c,function(){r=this.value,e(1,r)},()=>{window.configPlayer({color:c(r),name:o})},function(){o=this.value,e(0,o)},()=>{window.configPlayer({color:c(r),name:o})}]}class nt extends J{constructor(t){super(),q(this,t,tt,X,i,{})}}function et(t){let n,e;return n=new Z({props:{setRoute:t[0],lastRoute:t[1]}}),{c(){F(n.$$.fragment)},m(t,o){B(n,t,o),e=!0},p(t,e){const o={};1&e&&(o.setRoute=t[0]),2&e&&(o.lastRoute=t[1]),n.$set(o)},i(t){e||(D(n.$$.fragment,t),e=!0)},o(t){V(n.$$.fragment,t),e=!1},d(t){H(n,t)}}}function ot(t){let n,e;return n=new nt({props:{setRoute:t[0],lastRoute:t[1]}}),{c(){F(n.$$.fragment)},m(t,o){B(n,t,o),e=!0},p(t,e){const o={};1&e&&(o.setRoute=t[0]),2&e&&(o.lastRoute=t[1]),n.$set(o)},i(t){e||(D(n.$$.fragment,t),e=!0)},o(t){V(n.$$.fragment,t),e=!1},d(t){H(n,t)}}}function rt(n){let e,o,c,i,l,s,u,g,w,k,b,y;return w=new K({props:{text:"Toggle FPS/Latency Monitor"}}),w.$on("click",n[9]),{c(){e=m("div"),o=p("Total Volume:\r\n                "),c=m("input"),i=p("\r\n                Music Volume:\r\n                "),l=m("input"),s=p("\r\n                Sound Effects Volume:\r\n                "),u=m("input"),g=$(),F(w.$$.fragment),h(c,"type","range"),c.value=100*window.volume,h(c,"min","0"),h(c,"max","100"),h(l,"type","range"),l.value=100*window.volumeMusic,h(l,"min","0"),h(l,"max","100"),h(u,"type","range"),u.value=100*window.volumeGame,h(u,"min","0"),h(u,"max","100"),h(e,"class","flex flex-direction-column gap-15")},m(t,n){d(t,e,n),a(e,o),a(e,c),a(e,i),a(e,l),a(e,s),a(e,u),a(e,g),B(w,e,null),k=!0,b||(y=[v(c,"input",ut),v(l,"input",at),v(u,"input",dt)],b=!0)},p:t,i(t){k||(D(w.$$.fragment,t),k=!0)},o(t){V(w.$$.fragment,t),k=!1},d(t){t&&f(e),H(w),b=!1,r(y)}}}function ct(t){let n,e,o,r,c,i,l,s,u,p,g,v,w,k,b,y,x,R;r=new K({props:{type:"button",text:"🠔 Back",class:"sm"}}),r.$on("click",t[5]),u=new K({props:{isActive:t[2]==st,type:"button",text:"Audio"}}),u.$on("click",t[6]),g=new K({props:{isActive:t[2]==lt,type:"button",text:"Player Configuration"}}),g.$on("click",t[7]),w=new K({props:{isActive:t[2]==it,type:"button",text:"Controls"}}),w.$on("click",t[8]);const j=[rt,ot,et],P=[];function S(t,n){return t[2]==st?0:t[2]==lt?1:t[2]==it?2:-1}return~(y=S(t))&&(x=P[y]=j[y](t)),{c(){n=m("div"),e=m("aside"),o=m("div"),F(r.$$.fragment),c=$(),i=m("span"),i.textContent="Settings",l=$(),s=m("div"),F(u.$$.fragment),p=$(),F(g.$$.fragment),v=$(),F(w.$$.fragment),k=$(),b=m("main"),x&&x.c(),h(o,"class","flex align-items-center gap-15"),h(s,"class","flex flex-direction-column gap-15"),h(e,"class","flex flex-direction-column gap-15"),h(n,"class","flex")},m(t,f){d(t,n,f),a(n,e),a(e,o),B(r,o,null),a(o,c),a(o,i),a(e,l),a(e,s),B(u,s,null),a(s,p),B(g,s,null),a(s,v),B(w,s,null),a(n,k),a(n,b),~y&&P[y].m(b,null),R=!0},p(t,[n]){const e={};4&n&&(e.isActive=t[2]==st),u.$set(e);const o={};4&n&&(o.isActive=t[2]==lt),g.$set(o);const r={};4&n&&(r.isActive=t[2]==it),w.$set(r);let c=y;y=S(t),y===c?~y&&P[y].p(t,n):(x&&(G(),V(P[c],1,1,(()=>{P[c]=null})),U()),~y?(x=P[y],x?x.p(t,n):(x=P[y]=j[y](t),x.c()),D(x,1),x.m(b,null)):x=null)},i(t){R||(D(r.$$.fragment,t),D(u.$$.fragment,t),D(g.$$.fragment,t),D(w.$$.fragment,t),D(x),R=!0)},o(t){V(r.$$.fragment,t),V(u.$$.fragment,t),V(g.$$.fragment,t),V(w.$$.fragment,t),V(x),R=!1},d(t){t&&f(n),H(r),H(u),H(g),H(w),~y&&P[y].d()}}}const it="KEY_MAPPING",lt="PLAYER_CONFIG",st="AUDIO";function ut(t){window.changeVolume(t.target.value/100)}function at(t){window.changeVolumeMusic(t.target.value/100)}function dt(t){window.changeVolumeGame(t.target.value/100)}function ft(t,n,e){let{setRoute:o}=n,{lastRoute:r}=n,c=st;function i(t){e(2,c=t)}function l(){o(r)}function s(t){if("Escape"===t.code)l()}var u;u=()=>{document.body.addEventListener("keydown",s)},x().$$.on_mount.push(u),function(t){x().$$.on_destroy.push(t)}((()=>{document.body.removeEventListener("keydown",s)}));return t.$$set=t=>{"setRoute"in t&&e(0,o=t.setRoute),"lastRoute"in t&&e(1,r=t.lastRoute)},[o,r,c,i,l,()=>l(),()=>i(st),()=>i(lt),()=>i(it),()=>{window.monitorFPS()}]}class mt extends J{constructor(t){super(),q(this,t,ft,ct,i,{setRoute:0,lastRoute:1})}}function pt(t){let n,e,o,r,c={ctx:t,current:null,token:null,hasCatch:!0,pending:xt,then:vt,catch:gt,blocks:[,,,]};return function(t,n){const e=n.token={};function o(t,o,r,c){if(n.token!==e)return;n.resolved=c;let i=n.ctx;void 0!==r&&(i=i.slice(),i[r]=c);const l=t&&(n.current=t)(i);let s=!1;n.block&&(n.blocks?n.blocks.forEach(((t,e)=>{e!==o&&t&&(G(),V(t,1,1,(()=>{n.blocks[e]===t&&(n.blocks[e]=null)})),U())})):n.block.d(1),l.c(),D(l,1),l.m(n.mount(),n.anchor),s=!0),n.block=l,n.blocks&&(n.blocks[o]=l),s&&O()}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){const e=x();if(t.then((t=>{y(e),o(n.then,1,n.value,t),y(null)}),(t=>{if(y(e),o(n.catch,2,n.error,t),y(null),!n.hasCatch)throw t})),n.current!==n.pending)return o(n.pending,0),!0}else{if(n.current!==n.then)return o(n.then,1,n.value,t),!0;n.resolved=t}var r}(window.setupPixiPromise,c),{c(){n=m("div"),e=$(),o=g(),c.block.c(),h(n,"id","websocket-pie-connection-status")},m(t,i){d(t,n,i),d(t,e,i),d(t,o,i),c.block.m(t,c.anchor=i),c.mount=()=>o.parentNode,c.anchor=o,r=!0},p(n,e){!function(t,n,e){const o=n.slice(),{resolved:r}=t;t.current===t.then&&(o[t.value]=r),t.current===t.catch&&(o[t.error]=r),t.block.p(o,e)}(c,t=n,e)},i(t){r||(D(c.block),r=!0)},o(t){for(let t=0;t<3;t+=1){V(c.blocks[t])}r=!1},d(t){t&&f(n),t&&f(e),t&&f(o),c.block.d(t),c.token=null,c=null}}}function $t(n){let e,o,r,c,i,l,s;return o=new K({props:{text:"Resume Game"}}),o.$on("click",jt),c=new K({props:{text:"Options"}}),c.$on("click",n[15]),l=new K({props:{text:"Quit to Main Menu"}}),l.$on("click",n[13]),{c(){e=m("div"),F(o.$$.fragment),r=$(),F(c.$$.fragment),i=$(),F(l.$$.fragment),h(e,"class","list svelte-jyvijk")},m(t,n){d(t,e,n),B(o,e,null),a(e,r),B(c,e,null),a(e,i),B(l,e,null),s=!0},p:t,i(t){s||(D(o.$$.fragment,t),D(c.$$.fragment,t),D(l.$$.fragment,t),s=!0)},o(t){V(o.$$.fragment,t),V(c.$$.fragment,t),V(l.$$.fragment,t),s=!1},d(t){t&&f(e),H(o),H(c),H(l)}}}function gt(n){let e;return{c(){e=m("p"),e.textContent="Something went wrong loading assets",b(e,"color","red")},m(t,n){d(t,e,n)},p:t,i:t,o:t,d(t){t&&f(e)}}}function vt(t){let n,e,o,r,c,i,l,s,u,p,v;e=new K({props:{text:"New Run"}}),e.$on("click",t[9]),r=new K({props:{text:"Multiplayer"}}),r.$on("click",t[10]),i=new K({props:{text:"Options"}}),i.$on("click",t[16]);let w=!1===t[5]&&ht(t);return{c(){n=m("div"),F(e.$$.fragment),o=$(),F(r.$$.fragment),c=$(),F(i.$$.fragment),l=$(),s=m("br"),u=$(),w&&w.c(),p=g(),h(n,"class","list svelte-jyvijk")},m(t,f){d(t,n,f),B(e,n,null),a(n,o),B(r,n,null),a(n,c),B(i,n,null),d(t,l,f),d(t,s,f),d(t,u,f),w&&w.m(t,f),d(t,p,f),v=!0},p(t,n){!1===t[5]?w?(w.p(t,n),32&n&&D(w,1)):(w=ht(t),w.c(),D(w,1),w.m(p.parentNode,p)):w&&(G(),V(w,1,1,(()=>{w=null})),U())},i(t){v||(D(e.$$.fragment,t),D(r.$$.fragment,t),D(i.$$.fragment,t),D(w),v=!0)},o(t){V(e.$$.fragment,t),V(r.$$.fragment,t),V(i.$$.fragment,t),V(w),v=!1},d(t){t&&f(n),H(e),H(r),H(i),t&&f(l),t&&f(s),t&&f(u),w&&w.d(t),t&&f(p)}}}function ht(t){let n,e,o,c,i,l,s,u,h,w,b,y,x;i=new K({props:{disabled:t[8],text:"Connect"}}),i.$on("click",t[11]),s=new K({props:{disabled:!t[8],text:"Disconnect"}}),s.$on("click",t[12]);let R=t[3]&&wt(),j=t[8]&&kt(t);return{c(){n=p("Server Url\r\n            "),e=m("div"),o=m("input"),c=$(),F(i.$$.fragment),l=$(),F(s.$$.fragment),u=$(),R&&R.c(),h=$(),j&&j.c(),w=g()},m(r,f){d(r,n,f),d(r,e,f),a(e,o),k(o,t[6]),a(e,c),B(i,e,null),a(e,l),B(s,e,null),d(r,u,f),R&&R.m(r,f),d(r,h,f),j&&j.m(r,f),d(r,w,f),b=!0,y||(x=[v(o,"input",t[17]),v(o,"keypress",t[18])],y=!0)},p(t,n){64&n&&o.value!==t[6]&&k(o,t[6]);const e={};256&n&&(e.disabled=t[8]),i.$set(e);const r={};256&n&&(r.disabled=!t[8]),s.$set(r),t[3]?R||(R=wt(),R.c(),R.m(h.parentNode,h)):R&&(R.d(1),R=null),t[8]?j?(j.p(t,n),256&n&&D(j,1)):(j=kt(t),j.c(),D(j,1),j.m(w.parentNode,w)):j&&(G(),V(j,1,1,(()=>{j=null})),U())},i(t){b||(D(i.$$.fragment,t),D(s.$$.fragment,t),D(j),b=!0)},o(t){V(i.$$.fragment,t),V(s.$$.fragment,t),V(j),b=!1},d(t){t&&f(n),t&&f(e),H(i),H(s),t&&f(u),R&&R.d(t),t&&f(h),j&&j.d(t),t&&f(w),y=!1,r(x)}}}function wt(t){let n,e;return{c(){n=p("Connecting...\r\n                "),e=m("div"),e.innerHTML='<div class="svelte-jyvijk"></div> \n                    <div class="svelte-jyvijk"></div> \n                    <div class="svelte-jyvijk"></div> \n                    <div class="svelte-jyvijk"></div>',h(e,"class","lds-ellipsis svelte-jyvijk")},m(t,o){d(t,n,o),d(t,e,o)},d(t){t&&f(n),t&&f(e)}}}function kt(t){let n,e,o,c,i,l,s,u,a,p;const h=[yt,bt],w=[];function b(t,n){return t[4]?0:1}return i=b(t),l=w[i]=h[i](t),{c(){n=m("p"),n.textContent="Game name",e=$(),o=m("input"),c=$(),l.c(),s=g()},m(r,l){d(r,n,l),d(r,e,l),d(r,o,l),k(o,t[7]),d(r,c,l),w[i].m(r,l),d(r,s,l),u=!0,a||(p=[v(o,"input",t[19]),v(o,"keypress",t[20])],a=!0)},p(t,n){128&n&&o.value!==t[7]&&k(o,t[7]);let e=i;i=b(t),i===e?w[i].p(t,n):(G(),V(w[e],1,1,(()=>{w[e]=null})),U(),l=w[i],l?l.p(t,n):(l=w[i]=h[i](t),l.c()),D(l,1),l.m(s.parentNode,s))},i(t){u||(D(l),u=!0)},o(t){V(l),u=!1},d(t){t&&f(n),t&&f(e),t&&f(o),t&&f(c),w[i].d(t),t&&f(s),a=!1,r(p)}}}function bt(n){let e,o,r,c,i;return o=new K({props:{text:"Host"}}),o.$on("click",n[14]),c=new K({props:{text:"Join"}}),c.$on("click",n[14]),{c(){e=m("div"),F(o.$$.fragment),r=$(),F(c.$$.fragment),b(e,"display","flex")},m(t,n){d(t,e,n),B(o,e,null),a(e,r),B(c,e,null),i=!0},p:t,i(t){i||(D(o.$$.fragment,t),D(c.$$.fragment,t),i=!0)},o(t){V(o.$$.fragment,t),V(c.$$.fragment,t),i=!1},d(t){t&&f(e),H(o),H(c)}}}function yt(n){let e,o;return{c(){e=p("Joining...\r\n                    "),o=m("div"),o.innerHTML='<div class="svelte-jyvijk"></div> \n                        <div class="svelte-jyvijk"></div> \n                        <div class="svelte-jyvijk"></div> \n                        <div class="svelte-jyvijk"></div>',h(o,"class","lds-ellipsis svelte-jyvijk")},m(t,n){d(t,e,n),d(t,o,n)},p:t,i:t,o:t,d(t){t&&f(e),t&&f(o)}}}function xt(n){let e;return{c(){e=p("loading assets...")},m(t,n){d(t,e,n)},p:t,i:t,o:t,d(t){t&&f(e)}}}function Rt(t){let n,e,o,r;const c=[$t,pt],i=[];function l(t,n){return t[2]?0:1}return n=l(t),e=i[n]=c[n](t),{c(){e.c(),o=g()},m(t,e){i[n].m(t,e),d(t,o,e),r=!0},p(t,[r]){let s=n;n=l(t),n===s?i[n].p(t,r):(G(),V(i[s],1,1,(()=>{i[s]=null})),U(),e=i[n],e?e.p(t,r):(e=i[n]=c[n](t),e.c()),D(e,1),e.m(o.parentNode,o))},i(t){r||(D(e),r=!0)},o(t){V(e),r=!1},d(t){i[n].d(t),t&&f(o)}}}function jt(){window.closeMenu()}function Pt(t,n,e){let o,{setRoute:r}=n,{OPTIONS:c}=n,{inGame:i}=n,l=!1,s=!1;function u(){window.playMusic(),o&&g(),e(5,o=!1)}let a,d=new URLSearchParams(location.search),f=d.get("pieUrl"),m=d.get("game");function p(){e(8,a=window.isConnected()),e(3,l=!1)}function $(){if(f){console.log("Menu: Connect to server",f),e(3,l=!0);const t=new URL(location.href);return t.searchParams.set("pieUrl",f),window.history.pushState(null,null,t),window.connect_to_wsPie_server(f).catch(console.error).then(p)}return Promise.reject("No wsUrl defined to connect to")}function g(){window.pieDisconnect().then(p)}function v(){m?window.isConnected()?(console.log("Menu: Connect to game name",m),e(4,s=!0),window.joinRoom({name:m}).then((()=>{const t=new URL(location.href);t.searchParams.set("game",m),window.history.pushState(null,null,t)})).catch((t=>{console.error("Could not join room",t)})).then((()=>{e(4,s=!1)}))):console.error("Cannot join room until pieClient is connected to a pieServer"):console.log("Cannot join game until a gameName is provided")}window.tryAutoConnect=()=>{f&&(console.log("Menu: Start auto connect"),u(),$())};return t.$$set=t=>{"setRoute"in t&&e(0,r=t.setRoute),"OPTIONS"in t&&e(1,c=t.OPTIONS),"inGame"in t&&e(2,i=t.inGame)},[r,c,i,l,s,o,f,m,a,function(){window.playMusic(),e(5,o=!0),window.startSingleplayer().then((()=>{p()}))},u,$,g,function(){if(confirm("Are you sure you want to quit to Main Menu?")){const t=new URL(location.href);t.searchParams.delete("game"),t.searchParams.delete("pieUrl"),window.history.pushState(null,null,t),window.exitCurrentGame().then(p)}},v,()=>r(c),()=>r(c),function(){f=this.value,e(6,f)},t=>{"Enter"==t.key&&$()},function(){m=this.value,e(7,m)},t=>{"Enter"==t.key&&v()}]}class St extends J{constructor(t){super(),q(this,t,Pt,Rt,i,{setRoute:0,OPTIONS:1,inGame:2})}}function _t(t){let n,e;return n=new mt({props:{setRoute:t[3],lastRoute:t[0],OPTIONS:At,route:!0}}),{c(){F(n.$$.fragment)},m(t,o){B(n,t,o),e=!0},p(t,e){const o={};1&e&&(o.lastRoute=t[0]),n.$set(o)},i(t){e||(D(n.$$.fragment,t),e=!0)},o(t){V(n.$$.fragment,t),e=!1},d(t){H(n,t)}}}function Ct(t){let n,e,o,r,c,i,s;return i=new St({props:{setRoute:t[3],lastRoute:t[0],OPTIONS:At,inGame:t[2]}}),{c(){var t,s;n=m("div"),e=m("div"),o=m("img"),c=$(),F(i.$$.fragment),h(o,"id","logo"),t=o.src,s=r="ui/logo.png",l||(l=document.createElement("a")),l.href=s,t!==l.href&&h(o,"src","ui/logo.png"),h(o,"alt","Spellmasons logo"),h(o,"width","800"),h(e,"id","menu-inner"),h(n,"id","menu")},m(t,r){d(t,n,r),a(n,e),a(e,o),a(e,c),B(i,e,null),s=!0},p(t,n){const e={};1&n&&(e.lastRoute=t[0]),4&n&&(e.inGame=t[2]),i.$set(e)},i(t){s||(D(i.$$.fragment,t),s=!0)},o(t){V(i.$$.fragment,t),s=!1},d(t){t&&f(n),H(i)}}}function Mt(t){let n,e,o,r;const c=[Ct,_t],i=[];function l(t,n){return t[1]==Et?0:1}return n=l(t),e=i[n]=c[n](t),{c(){e.c(),o=g()},m(t,e){i[n].m(t,e),d(t,o,e),r=!0},p(t,[r]){let s=n;n=l(t),n===s?i[n].p(t,r):(G(),V(i[s],1,1,(()=>{i[s]=null})),U(),e=i[n],e?e.p(t,r):(e=i[n]=c[n](t),e.c()),D(e,1),e.m(o.parentNode,o))},i(t){r||(D(e),r=!0)},o(t){V(e),r=!1},d(t){i[n].d(t),t&&f(o)}}}const At="OPTIONS",Et="PLAY";function Nt(t,n,e){let o,r;console.log("Menu: Svelte menu is running");let c=!1;function i(t){console.log("Menu: Route:",t),e(0,o=r),e(1,r=t),window.updateInGameMenuStatus()}return window.updateInGameMenuStatus=()=>{e(2,c=void 0!==window.player)},i(Et),window.setMenu=i,[o,r,c,i]}return new class extends J{constructor(t){super(),q(this,t,Nt,Mt,i,{})}}({target:document.getElementById("menu-app")||document.body,props:{}})}();
//# sourceMappingURL=svelte-bundle.js.map
