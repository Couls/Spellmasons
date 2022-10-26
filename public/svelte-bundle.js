var app=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(n)}function c(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let s,i;function a(t,e){return s||(s=document.createElement("a")),s.href=e,t===s.href}function u(e,n,o){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const o=e.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}(n,o))}function d(t,n,o,r){return t[1]&&r?e(o.ctx.slice(),t[1](r(n))):o.ctx}function f(t){const e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}function p(t,e){const n={};e=new Set(e);for(const o in t)e.has(o)||"$"===o[0]||(n[o]=t[o]);return n}function $(t,e,n){return t.set(n),e}function m(t,e){t.appendChild(e)}function g(t,e,n){t.insertBefore(e,n||null)}function h(t){t.parentNode.removeChild(t)}function v(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function w(t){return document.createElement(t)}function x(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function b(t){return document.createTextNode(t)}function y(){return b(" ")}function k(){return b("")}function C(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function _(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function A(t,e){const n=Object.getOwnPropertyDescriptors(t.__proto__);for(const o in e)null==e[o]?t.removeAttribute(o):"style"===o?t.style.cssText=e[o]:"__value"===o?t.value=t[o]=e[o]:n[o]&&n[o].set?t[o]=e[o]:_(t,o,e[o])}function L(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function M(t,e){t.value=null==e?"":e}function S(t,e,n,o){null===n?t.style.removeProperty(e):t.style.setProperty(e,n,o?"important":"")}function E(t,e,n){t.classList[n?"add":"remove"](e)}function P(t){i=t}function B(){if(!i)throw new Error("Function called outside component initialization");return i}function R(t){B().$$.on_mount.push(t)}function q(t){B().$$.on_destroy.push(t)}function I(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t.call(this,e)))}const T=[],U=[],D=[],O=[],G=Promise.resolve();let N=!1;function H(t){D.push(t)}const j=new Set;let V=0;function F(){const t=i;do{for(;V<T.length;){const t=T[V];V++,P(t),J(t.$$)}for(P(null),T.length=0,V=0;U.length;)U.pop()();for(let t=0;t<D.length;t+=1){const e=D[t];j.has(e)||(j.add(e),e())}D.length=0}while(T.length);for(;O.length;)O.pop()();N=!1,j.clear(),P(t)}function J(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(H)}}const z=new Set;let Y;function W(){Y={r:0,c:[],p:Y}}function K(){Y.r||r(Y.c),Y=Y.p}function Z(t,e){t&&t.i&&(z.delete(t),t.i(e))}function Q(t,e,n,o){if(t&&t.o){if(z.has(t))return;z.add(t),Y.c.push((()=>{z.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}else o&&o()}function X(t,e){const n={},o={},r={$$scope:1};let c=t.length;for(;c--;){const l=t[c],s=e[c];if(s){for(const t in l)t in s||(o[t]=1);for(const t in s)r[t]||(n[t]=s[t],r[t]=1);t[c]=s}else for(const t in l)r[t]=1}for(const t in o)t in n||(n[t]=void 0);return n}function tt(t){t&&t.c()}function et(t,e,o,l){const{fragment:s,on_mount:i,on_destroy:a,after_update:u}=t.$$;s&&s.m(e,o),l||H((()=>{const e=i.map(n).filter(c);a?a.push(...e):r(e),t.$$.on_mount=[]})),u.forEach(H)}function nt(t,e){const n=t.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function ot(t,e){-1===t.$$.dirty[0]&&(T.push(t),N||(N=!0,G.then(F)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function rt(e,n,c,l,s,a,u,d=[-1]){const f=i;P(e);const p=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:s,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(f?f.$$.context:[])),callbacks:o(),dirty:d,skip_bound:!1,root:n.target||f.$$.root};u&&u(p.root);let $=!1;if(p.ctx=c?c(e,n.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return p.ctx&&s(p.ctx[t],p.ctx[t]=r)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](r),$&&ot(e,t)),n})):[],p.update(),$=!0,r(p.before_update),p.fragment=!!l&&l(p.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);p.fragment&&p.fragment.l(t),t.forEach(h)}else p.fragment&&p.fragment.c();n.intro&&Z(e.$$.fragment),et(e,n.target,n.anchor,n.customElement),F()}P(f)}class ct{$destroy(){nt(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function lt(n){let o,r,c,l,s,i,a=[{class:l=`button-wrapper ${n[2]} ${n[1]?"is-active":""}`},n[3]],u={};for(let t=0;t<a.length;t+=1)u=e(u,a[t]);return{c(){o=w("button"),r=w("div"),c=b(n[0]),A(o,u)},m(t,e){g(t,o,e),m(o,r),m(r,c),o.autofocus&&o.focus(),s||(i=C(o,"click",n[4]),s=!0)},p(t,[e]){1&e&&L(c,t[0]),A(o,u=X(a,[6&e&&l!==(l=`button-wrapper ${t[2]} ${t[1]?"is-active":""}`)&&{class:l},8&e&&t[3]]))},i:t,o:t,d(t){t&&h(o),s=!1,i()}}}function st(t,n,o){const r=["text","isActive","class"];let c=p(n,r),{text:l}=n,{isActive:s}=n,{class:i=""}=n;return t.$$set=t=>{n=e(e({},n),f(t)),o(3,c=p(n,r)),"text"in t&&o(0,l=t.text),"isActive"in t&&o(1,s=t.isActive),"class"in t&&o(2,i=t.class)},[l,s,i,c,function(e){I.call(this,t,e)}]}class it extends ct{constructor(t){super(),rt(this,t,st,lt,l,{text:0,isActive:1,class:2})}}function at(t,e,n){const o=t.slice();return o[2]=e[n][0],o[3]=e[n][1],o[5]=n,o}function ut(e){let n,o,r,c,l,s=e[2]+"",i=e[3]+"";return{c(){n=w("tr"),o=w("td"),r=b(s),c=w("td"),l=b(i)},m(t,e){g(t,n,e),m(n,o),m(o,r),m(n,c),m(c,l)},p:t,d(t){t&&h(n)}}}function dt(t){let e,n,o,r,c,l,s,i,a,u,d;r=new it({props:{type:"button",text:"🠔 Back",class:"sm"}}),r.$on("click",t[1]);let f=t[0],p=[];for(let e=0;e<f.length;e+=1)p[e]=ut(at(t,f,e));return{c(){e=w("div"),n=w("aside"),o=w("div"),tt(r.$$.fragment),c=y(),l=w("span"),l.textContent="Credits",s=y(),i=w("main"),a=w("table"),u=w("tbody");for(let t=0;t<p.length;t+=1)p[t].c();_(o,"class","flex align-items-center gap-15 svelte-5yfd45"),_(n,"class","flex flex-direction-column gap-15"),_(e,"class","flex svelte-5yfd45")},m(t,f){g(t,e,f),m(e,n),m(n,o),et(r,o,null),m(o,c),m(o,l),m(e,s),m(e,i),m(i,a),m(a,u);for(let t=0;t<p.length;t+=1)p[t].m(u,null);d=!0},p(t,[e]){if(1&e){let n;for(f=t[0],n=0;n<f.length;n+=1){const o=at(t,f,n);p[n]?p[n].p(o,e):(p[n]=ut(o),p[n].c(),p[n].m(u,null))}for(;n<p.length;n+=1)p[n].d(1);p.length=f.length}},i(t){d||(Z(r.$$.fragment,t),d=!0)},o(t){Q(r.$$.fragment,t),d=!1},d(t){t&&h(e),nt(r),v(p,t)}}}function ft(t){return[[["Jordan O'Leary","Programming, Game Design, and Concept"],["theBlurryBox","Art and Animation"],["Valentin Cochet","@coc_val | Sound Effect Design"],["Jake O'Connell","UI Design"],["BananaMilk","Music"],["Lost Lumens, Brad Clark","Audio Mastering"],["Matt Sweda","Concept Ideation Assistance"]],()=>window.goBack()]}class pt extends ct{constructor(t){super(),rt(this,t,ft,dt,l,{})}}function $t(n){let o,r,c,l,s,i,u,d,f,p,$,v=[{class:f=`button-wrapper ${n[6]} ${n[4]?"is-active":""}`},n[7]],x={};for(let t=0;t<v.length;t+=1)x=e(x,v[t]);return{c(){o=w("a"),r=w("button"),c=w("div"),l=w("img"),i=y(),u=w("span"),d=b(n[5]),a(l.src,s=n[0])||_(l,"src",s),_(l,"width",n[3]),_(l,"alt",n[1]),_(c,"class","svelte-1c8t67o"),A(r,x),E(r,"svelte-1c8t67o",!0),_(o,"href",n[2])},m(t,e){g(t,o,e),m(o,r),m(r,c),m(c,l),m(c,i),m(c,u),m(u,d),r.autofocus&&r.focus(),p||($=C(r,"click",n[8]),p=!0)},p(t,[e]){1&e&&!a(l.src,s=t[0])&&_(l,"src",s),8&e&&_(l,"width",t[3]),2&e&&_(l,"alt",t[1]),32&e&&L(d,t[5]),A(r,x=X(v,[80&e&&f!==(f=`button-wrapper ${t[6]} ${t[4]?"is-active":""}`)&&{class:f},128&e&&t[7]])),E(r,"svelte-1c8t67o",!0),4&e&&_(o,"href",t[2])},i:t,o:t,d(t){t&&h(o),p=!1,$()}}}function mt(t,n,o){const r=["src","alt","href","width","isActive","text","class"];let c=p(n,r),{src:l}=n,{alt:s}=n,{href:i}=n,{width:a}=n,{isActive:u}=n,{text:d=""}=n,{class:$=""}=n;return t.$$set=t=>{n=e(e({},n),f(t)),o(7,c=p(n,r)),"src"in t&&o(0,l=t.src),"alt"in t&&o(1,s=t.alt),"href"in t&&o(2,i=t.href),"width"in t&&o(3,a=t.width),"isActive"in t&&o(4,u=t.isActive),"text"in t&&o(5,d=t.text),"class"in t&&o(6,$=t.class)},[l,s,i,a,u,d,$,c,function(e){I.call(this,t,e)}]}class gt extends ct{constructor(t){super(),rt(this,t,mt,$t,l,{src:0,alt:1,href:2,width:3,isActive:4,text:5,class:6})}}function ht(t,e,n){const o=t.slice();return o[2]=e[n],o}function vt(t){let e,n;return e=new it({props:{type:"button",text:t[2]}}),e.$on("click",(function(){return t[1](t[2])})),{c(){tt(e.$$.fragment)},m(t,o){et(e,t,o),n=!0},p(e,n){t=e},i(t){n||(Z(e.$$.fragment,t),n=!0)},o(t){Q(e.$$.fragment,t),n=!1},d(t){nt(e,t)}}}function wt(t){let e,n,o,r,c,l,s,i,a,u,d,f,p,$,x,b,k,C,A,L,M,E,P,B,R,q;c=new it({props:{type:"button",text:"🠔 Back",class:"sm"}}),c.$on("click",t[0]),b=new gt({props:{src:"ui/UI_Bird.png",alt:"Twitter @spellmasons",width:"24px",href:"https://twitter.com/spellmasons",class:"button-wrapper-bg-2",text:"@spellmasons"}}),L=new gt({props:{src:"ui/discord_logo.png",alt:"Spellmasons Discord https://discord.gg/q6sUCreHeJ",width:"24px",href:"https://discord.gg/q6sUCreHeJ",class:"button-wrapper-bg-2",text:"Discord"}});let I=window.explainKeys||[],T=[];for(let e=0;e<I.length;e+=1)T[e]=vt(ht(t,I,e));const U=t=>Q(T[t],1,1,(()=>{T[t]=null}));return{c(){e=w("div"),n=w("aside"),o=w("div"),r=w("div"),tt(c.$$.fragment),l=y(),s=w("h1"),s.textContent="Help",i=y(),a=w("div"),u=y(),d=w("main"),f=w("div"),p=w("div"),$=w("h1"),$.textContent="Contact Me!",x=y(),tt(b.$$.fragment),k=y(),C=w("h1"),C.textContent="Join our Discord Community!",A=y(),tt(L.$$.fragment),M=y(),E=w("h1"),E.textContent="How to",P=y();for(let t=0;t<T.length;t+=1)T[t].c();B=y(),R=w("div"),_(s,"class","options-title svelte-z08h7l"),_(r,"class","flex align-items-center gap-20"),_(a,"class","flex flex-direction-column gap-15"),_(o,"class","flex flex-direction-column gap-15 pad-20"),_(n,"class","svelte-z08h7l"),_(p,"class","pad-20 flex flex-direction-column gap-15 overflowyscroll"),S(p,"min-width","300px"),_(R,"id","explain-portal"),_(R,"class","svelte-z08h7l"),_(f,"class","flex gap-15 height100"),_(e,"class","flex height100")},m(t,h){g(t,e,h),m(e,n),m(n,o),m(o,r),et(c,r,null),m(r,l),m(r,s),m(o,i),m(o,a),m(e,u),m(e,d),m(d,f),m(f,p),m(p,$),m(p,x),et(b,p,null),m(p,k),m(p,C),m(p,A),et(L,p,null),m(p,M),m(p,E),m(p,P);for(let t=0;t<T.length;t+=1)T[t].m(p,null);m(f,B),m(f,R),q=!0},p(t,[e]){if(0&e){let n;for(I=window.explainKeys||[],n=0;n<I.length;n+=1){const o=ht(t,I,n);T[n]?(T[n].p(o,e),Z(T[n],1)):(T[n]=vt(o),T[n].c(),Z(T[n],1),T[n].m(p,null))}for(W(),n=I.length;n<T.length;n+=1)U(n);K()}},i(t){if(!q){Z(c.$$.fragment,t),Z(b.$$.fragment,t),Z(L.$$.fragment,t);for(let t=0;t<I.length;t+=1)Z(T[t]);q=!0}},o(t){Q(c.$$.fragment,t),Q(b.$$.fragment,t),Q(L.$$.fragment,t),T=T.filter(Boolean);for(let t=0;t<T.length;t+=1)Q(T[t]);q=!1},d(t){t&&h(e),nt(c),nt(b),nt(L),v(T,t)}}}function xt(t){return[()=>window.goBack(),t=>window.menuExplain(t,!0)]}class bt extends ct{constructor(t){super(),rt(this,t,xt,wt,l,{})}}function yt(e){let n;return{c(){n=w("table"),n.innerHTML='<tr><td>Clear Active Spell</td> \n        <td><kbd class="hotkey-badge">Esc</kbd></td></tr> \n    <tr id="center-cam-info"><td>Free Look</td> \n        <td><kbd class="hotkey-badge">W</kbd> \n            <kbd class="hotkey-badge">A</kbd> \n            <kbd class="hotkey-badge">S</kbd> \n            <kbd class="hotkey-badge">D</kbd>\n            or Click and Drag Middle Mouse Button</td></tr> \n    <tr id="center-cam-tooltip"><td>Camera Follow Player</td> \n        <td><kbd class="hotkey-badge">Z</kbd></td></tr> \n    <tr><td>Ping Location</td> \n        <td><kbd class="hotkey-badge">C</kbd></td></tr> \n    <tr><td>Toggle Menu</td> \n        <td><kbd class="hotkey-badge">Esc</kbd></td></tr> \n    <tr><td>Inventory</td> \n        <td><kbd class="hotkey-badge">Tab</kbd>\n            /\n            <kbd class="hotkey-badge">i</kbd></td></tr> \n    <tr><td>View Walk Distance</td> \n        <td><kbd class="hotkey-badge">f</kbd></td></tr>',_(n,"id","keymapping")},m(t,e){g(t,n,e)},p:t,i:t,o:t,d(t){t&&h(n)}}}class kt extends ct{constructor(t){super(),rt(this,t,null,yt,l,{})}}function Ct(e){let n,o,c,l,s,i,a,u,d,f;return{c(){n=w("div"),o=w("label"),o.textContent="Robe Color",c=y(),l=w("input"),s=y(),i=w("label"),i.textContent="Player Name",a=y(),u=w("input"),_(o,"for","robe"),_(l,"type","color"),_(l,"name","robe"),_(i,"for","player-name"),_(u,"type","text"),_(u,"name","player-name"),_(n,"class","flex flex-direction-column gap-15")},m(t,r){g(t,n,r),m(n,o),m(n,c),m(n,l),M(l,e[1]),m(n,s),m(n,i),m(n,a),m(n,u),M(u,e[0]),d||(f=[C(l,"input",e[3]),C(l,"blur",e[4]),C(u,"input",e[5]),C(u,"input",e[6])],d=!0)},p(t,[e]){2&e&&M(l,t[1]),1&e&&u.value!==t[0]&&M(u,t[0])},i:t,o:t,d(t){t&&h(n),d=!1,r(f)}}}function _t(t,e,n){let o=localStorage.getItem("player-name"),r=`#${parseInt(localStorage.getItem("player-color")).toString(16)}`;const c=t=>parseInt(t.slice(1),16);return[o,r,c,function(){r=this.value,n(1,r)},()=>{window.configPlayer({color:c(r),name:o})},function(){o=this.value,n(0,o)},()=>{window.configPlayer({color:c(r),name:o})}]}class At extends ct{constructor(t){super(),rt(this,t,_t,Ct,l,{})}}function Lt(e){let n,o,r;return o=new it({props:{text:"Toggle FPS/Latency Monitor"}}),o.$on("click",e[9]),{c(){n=w("div"),tt(o.$$.fragment)},m(t,e){g(t,n,e),et(o,n,null),r=!0},p:t,i(t){r||(Z(o.$$.fragment,t),r=!0)},o(t){Q(o.$$.fragment,t),r=!1},d(t){t&&h(n),nt(o)}}}function Mt(e){let n,o;return n=new kt({}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function St(e){let n,o;return n=new At({}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function Et(e){let n,o,r;return o=new it({props:{text:"Toggle Fullscreen"}}),o.$on("click",e[8]),{c(){n=w("div"),tt(o.$$.fragment),_(n,"class","flex flex-direction-column gap-15")},m(t,e){g(t,n,e),et(o,n,null),r=!0},p:t,i(t){r||(Z(o.$$.fragment,t),r=!0)},o(t){Q(o.$$.fragment,t),r=!1},d(t){t&&h(n),nt(o)}}}function Pt(e){let n,o,c,l,s,i,a,u,d;return{c(){n=w("div"),o=b("Total Volume:\r\n                    "),c=w("input"),l=b("\r\n                    Music Volume:\r\n                    "),s=w("input"),i=b("\r\n                    Sound Effects Volume:\r\n                    "),a=w("input"),_(c,"type","range"),c.value=100*window.volume,_(c,"min","0"),_(c,"max","100"),_(s,"type","range"),s.value=100*window.volumeMusic,_(s,"min","0"),_(s,"max","100"),_(a,"type","range"),a.value=100*window.volumeGame,_(a,"min","0"),_(a,"max","100"),_(n,"class","flex flex-direction-column gap-15")},m(t,e){g(t,n,e),m(n,o),m(n,c),m(n,l),m(n,s),m(n,i),m(n,a),u||(d=[C(c,"input",Dt),C(s,"input",Ot),C(a,"input",Gt)],u=!0)},p:t,i:t,o:t,d(t){t&&h(n),u=!1,r(d)}}}function Bt(t){let e,n,o,r,c,l,s,i,a,u,d,f,p,$,v,x,b,k,C,A,L,M,S,E;c=new it({props:{type:"button",text:"🠔 Back",class:"sm"}}),c.$on("click",t[2]),u=new it({props:{isActive:t[0]==Tt,type:"button",text:"Audio"}}),u.$on("click",t[3]),f=new it({props:{isActive:t[0]==Ut,type:"button",text:"Video"}}),f.$on("click",t[4]),$=new it({props:{isActive:t[0]==It,type:"button",text:"Player Configuration"}}),$.$on("click",t[5]),x=new it({props:{isActive:t[0]==Rt,type:"button",text:"Controls"}}),x.$on("click",t[6]),k=new it({props:{isActive:t[0]==qt,type:"button",text:"Extras"}}),k.$on("click",t[7]);const P=[Pt,Et,St,Mt,Lt],B=[];function R(t,e){return t[0]==Tt?0:t[0]==Ut?1:t[0]==It?2:t[0]==Rt?3:t[0]==qt?4:-1}return~(M=R(t))&&(S=B[M]=P[M](t)),{c(){e=w("div"),n=w("aside"),o=w("div"),r=w("div"),tt(c.$$.fragment),l=y(),s=w("h1"),s.textContent="Settings",i=y(),a=w("div"),tt(u.$$.fragment),d=y(),tt(f.$$.fragment),p=y(),tt($.$$.fragment),v=y(),tt(x.$$.fragment),b=y(),tt(k.$$.fragment),C=y(),A=w("main"),L=w("div"),S&&S.c(),_(s,"class","options-title svelte-exei4x"),_(r,"class","flex align-items-center gap-20"),_(a,"class","flex flex-direction-column gap-15"),_(o,"class","flex flex-direction-column gap-15 pad-20"),_(n,"class","svelte-exei4x"),_(L,"class","pad-20"),_(e,"class","flex")},m(t,h){g(t,e,h),m(e,n),m(n,o),m(o,r),et(c,r,null),m(r,l),m(r,s),m(o,i),m(o,a),et(u,a,null),m(a,d),et(f,a,null),m(a,p),et($,a,null),m(a,v),et(x,a,null),m(a,b),et(k,a,null),m(e,C),m(e,A),m(A,L),~M&&B[M].m(L,null),E=!0},p(t,[e]){const n={};1&e&&(n.isActive=t[0]==Tt),u.$set(n);const o={};1&e&&(o.isActive=t[0]==Ut),f.$set(o);const r={};1&e&&(r.isActive=t[0]==It),$.$set(r);const c={};1&e&&(c.isActive=t[0]==Rt),x.$set(c);const l={};1&e&&(l.isActive=t[0]==qt),k.$set(l);let s=M;M=R(t),M===s?~M&&B[M].p(t,e):(S&&(W(),Q(B[s],1,1,(()=>{B[s]=null})),K()),~M?(S=B[M],S?S.p(t,e):(S=B[M]=P[M](t),S.c()),Z(S,1),S.m(L,null)):S=null)},i(t){E||(Z(c.$$.fragment,t),Z(u.$$.fragment,t),Z(f.$$.fragment,t),Z($.$$.fragment,t),Z(x.$$.fragment,t),Z(k.$$.fragment,t),Z(S),E=!0)},o(t){Q(c.$$.fragment,t),Q(u.$$.fragment,t),Q(f.$$.fragment,t),Q($.$$.fragment,t),Q(x.$$.fragment,t),Q(k.$$.fragment,t),Q(S),E=!1},d(t){t&&h(e),nt(c),nt(u),nt(f),nt($),nt(x),nt(k),~M&&B[M].d()}}}const Rt="KEY_MAPPING",qt="EXTRAS",It="PLAYER_CONFIG",Tt="AUDIO",Ut="VIDEO";function Dt(t){window.changeVolume(t.target.value/100)}function Ot(t){window.changeVolumeMusic(t.target.value/100)}function Gt(t){window.changeVolumeGame(t.target.value/100)}function Nt(t,e,n){let o=Tt;function r(t){n(0,o=t)}return[o,r,()=>window.goBack(),()=>r(Tt),()=>r(Ut),()=>r(It),()=>r(Rt),()=>r(qt),()=>{document.fullscreenElement?document.exitFullscreen():document.body.requestFullscreen().catch((t=>{console.error(`Error attempting to enable fullscreen mode: ${t.message} (${t.name})`)}))},()=>{window.monitorFPS()}]}class Ht extends ct{constructor(t){super(),rt(this,t,Nt,Bt,l,{})}}function jt(t){let n,o,r,c,l,s;const i=t[4].default,a=function(t,e,n,o){if(t){const r=d(t,e,n,o);return t[0](r)}}(i,t,t[3],null);let u=[{class:r=`button-wrapper ${t[1]} ${t[0]?"is-active":""}`},t[2]],f={};for(let t=0;t<u.length;t+=1)f=e(f,u[t]);return{c(){n=w("button"),o=w("div"),a&&a.c(),_(o,"class","svelte-1k1vcg6"),A(n,f),E(n,"svelte-1k1vcg6",!0)},m(e,r){g(e,n,r),m(n,o),a&&a.m(o,null),n.autofocus&&n.focus(),c=!0,l||(s=C(n,"click",t[5]),l=!0)},p(t,[e]){a&&a.p&&(!c||8&e)&&function(t,e,n,o,r,c){if(r){const l=d(e,n,o,c);t.p(l,r)}}(a,i,t,t[3],c?function(t,e,n,o){if(t[2]&&o){const r=t[2](o(n));if(void 0===e.dirty)return r;if("object"==typeof r){const t=[],n=Math.max(e.dirty.length,r.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|r[o];return t}return e.dirty|r}return e.dirty}(i,t[3],e,null):function(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}(t[3]),null),A(n,f=X(u,[(!c||3&e&&r!==(r=`button-wrapper ${t[1]} ${t[0]?"is-active":""}`))&&{class:r},4&e&&t[2]])),E(n,"svelte-1k1vcg6",!0)},i(t){c||(Z(a,t),c=!0)},o(t){Q(a,t),c=!1},d(t){t&&h(n),a&&a.d(t),l=!1,s()}}}function Vt(t,n,o){const r=["isActive","class"];let c=p(n,r),{$$slots:l={},$$scope:s}=n,{isActive:i}=n,{class:a=""}=n;return t.$$set=t=>{n=e(e({},n),f(t)),o(2,c=p(n,r)),"isActive"in t&&o(0,i=t.isActive),"class"in t&&o(1,a=t.class),"$$scope"in t&&o(3,s=t.$$scope)},[i,a,c,s,l,function(e){I.call(this,t,e)}]}class Ft extends ct{constructor(t){super(),rt(this,t,Vt,jt,l,{isActive:0,class:1})}}function Jt(e){let n,o,r,c,l,s,i,a,u,d,f,p,$,v,w,y,k,C,A,L;return{c(){n=x("svg"),o=x("title"),r=b("Language / Localization"),c=x("defs"),l=x("style"),s=b(".cls-1 {\r\n                stroke: #231f20;\r\n            }\r\n\r\n            .cls-1,\r\n            .cls-2 {\r\n                fill: none;\r\n                stroke-miterlimit: 10;\r\n            }\r\n\r\n            .cls-2 {\r\n                stroke: #fff;\r\n            }\r\n        "),i=x("g"),a=x("circle"),u=x("path"),d=x("line"),f=x("g"),p=x("path"),$=x("g"),v=x("path"),w=x("g"),y=x("path"),k=x("g"),C=x("path"),A=x("g"),L=x("line"),_(o,"id","title"),_(a,"class","cls-2"),_(a,"cx","32.5"),_(a,"cy","32.5"),_(a,"r","32"),_(u,"class","cls-1"),_(u,"d","M32.5,64.5v0Z"),_(d,"class","cls-2"),_(d,"x1",".5"),_(d,"y1","32.5"),_(d,"x2","64.5"),_(d,"y2","32.5"),_(i,"id","Layer_1"),_(i,"data-name","Layer 1"),_(p,"class","cls-2"),_(p,"d","M32.5,64.5C-8.55,32.5,32.5,.5,32.5,.5"),_(f,"id","Layer_2"),_(f,"data-name","Layer 2"),_(v,"class","cls-2"),_(v,"d","M32.5,.5s42.98,32,0,64"),_($,"id","Layer_3"),_($,"data-name","Layer 3"),_(y,"class","cls-2"),_(y,"d","M11.22,8.49s21.28,13.57,42.6,.15"),_(w,"id","Layer_4"),_(w,"data-name","Layer 4"),_(C,"class","cls-2"),_(C,"d","M11.22,56.56s21.28-13.27,42.6,0"),_(k,"id","Layer_5"),_(k,"data-name","Layer 5"),_(L,"class","cls-2"),_(L,"x1","32.5"),_(L,"y1",".5"),_(L,"x2","32.5"),_(L,"y2","64.5"),_(A,"id","Layer_6"),_(A,"data-name","Layer 6"),_(n,"xmlns","http://www.w3.org/2000/svg"),_(n,"viewBox","-1 0 67 66"),_(n,"labelledby","title"),_(n,"role","img"),_(n,"width","24px"),_(n,"height","24px"),_(n,"class","svelte-1sy6cvw")},m(t,e){g(t,n,e),m(n,o),m(o,r),m(n,c),m(c,l),m(l,s),m(n,i),m(i,a),m(i,u),m(i,d),m(n,f),m(f,p),m(n,$),m($,v),m(n,w),m(w,y),m(n,k),m(k,C),m(n,A),m(A,L)},p:t,i:t,o:t,d(t){t&&h(n)}}}class zt extends ct{constructor(t){super(),rt(this,t,null,Jt,l,{})}}const Yt="OPTIONS",Wt="CREDITS",Kt="HELP",Zt="PLAY",Qt="LOBBY",Xt="MULTIPLAYER_SERVER_CHOOSER",te="TODO",ee=[];const ne=function(e,n=t){let o;const r=new Set;function c(t){if(l(e,t)&&(e=t,o)){const t=!ee.length;for(const t of r)t[1](),ee.push(t,e);if(t){for(let t=0;t<ee.length;t+=2)ee[t][0](ee[t+1]);ee.length=0}}}return{set:c,update:function(t){c(t(e))},subscribe:function(l,s=t){const i=[l,s];return r.add(i),1===r.size&&(o=n(c)||t),l(e),()=>{r.delete(i),0===r.size&&(o(),o=null)}}}}(!1);function oe(t){let e,n;return e=new zt({}),{c(){tt(e.$$.fragment)},m(t,o){et(e,t,o),n=!0},i(t){n||(Z(e.$$.fragment,t),n=!0)},o(t){Q(e.$$.fragment,t),n=!1},d(t){nt(e,t)}}}function re(t){let e,n,o,r,c={ctx:t,current:null,token:null,hasCatch:!0,pending:ie,then:se,catch:le,blocks:[,,,]};return function(t,e){const n=e.token={};function o(t,o,r,c){if(e.token!==n)return;e.resolved=c;let l=e.ctx;void 0!==r&&(l=l.slice(),l[r]=c);const s=t&&(e.current=t)(l);let i=!1;e.block&&(e.blocks?e.blocks.forEach(((t,n)=>{n!==o&&t&&(W(),Q(t,1,1,(()=>{e.blocks[n]===t&&(e.blocks[n]=null)})),K())})):e.block.d(1),s.c(),Z(s,1),s.m(e.mount(),e.anchor),i=!0),e.block=s,e.blocks&&(e.blocks[o]=s),i&&F()}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){const n=B();if(t.then((t=>{P(n),o(e.then,1,e.value,t),P(null)}),(t=>{if(P(n),o(e.catch,2,e.error,t),P(null),!e.hasCatch)throw t})),e.current!==e.pending)return o(e.pending,0),!0}else{if(e.current!==e.then)return o(e.then,1,e.value,t),!0;e.resolved=t}var r}(window.setupPixiPromise,c),{c(){e=w("div"),n=y(),o=k(),c.block.c(),_(e,"id","websocket-pie-connection-status")},m(t,l){g(t,e,l),g(t,n,l),g(t,o,l),c.block.m(t,c.anchor=l),c.mount=()=>o.parentNode,c.anchor=o,r=!0},p(e,n){!function(t,e,n){const o=e.slice(),{resolved:r}=t;t.current===t.then&&(o[t.value]=r),t.current===t.catch&&(o[t.error]=r),t.block.p(o,n)}(c,t=e,n)},i(t){r||(Z(c.block),r=!0)},o(t){for(let t=0;t<3;t+=1){Q(c.blocks[t])}r=!1},d(t){t&&h(e),t&&h(n),t&&h(o),c.block.d(t),c.token=null,c=null}}}function ce(e){let n,o,r,c,l,s,i;return o=new it({props:{text:"Resume Game"}}),o.$on("click",de),c=new it({props:{text:"Settings"}}),c.$on("click",e[7]),s=new it({props:{text:"Quit to Main Menu"}}),s.$on("click",ue),{c(){n=w("div"),tt(o.$$.fragment),r=y(),tt(c.$$.fragment),l=y(),tt(s.$$.fragment),_(n,"class","list svelte-g9yx2d")},m(t,e){g(t,n,e),et(o,n,null),m(n,r),et(c,n,null),m(n,l),et(s,n,null),i=!0},p:t,i(t){i||(Z(o.$$.fragment,t),Z(c.$$.fragment,t),Z(s.$$.fragment,t),i=!0)},o(t){Q(o.$$.fragment,t),Q(c.$$.fragment,t),Q(s.$$.fragment,t),i=!1},d(t){t&&h(n),nt(o),nt(c),nt(s)}}}function le(e){let n;return{c(){n=w("p"),n.textContent="Something went wrong loading assets",S(n,"color","red")},m(t,e){g(t,n,e)},p:t,i:t,o:t,d(t){t&&h(n)}}}function se(e){let n,o,r,c,l,s,i,a,u;return o=new it({props:{text:"New Run"}}),o.$on("click",e[2]),c=new it({props:{text:"Multiplayer"}}),c.$on("click",e[3]),s=new it({props:{text:"Settings"}}),s.$on("click",e[8]),{c(){n=w("div"),tt(o.$$.fragment),r=y(),tt(c.$$.fragment),l=y(),tt(s.$$.fragment),i=y(),a=w("br"),_(n,"class","list svelte-g9yx2d")},m(t,e){g(t,n,e),et(o,n,null),m(n,r),et(c,n,null),m(n,l),et(s,n,null),g(t,i,e),g(t,a,e),u=!0},p:t,i(t){u||(Z(o.$$.fragment,t),Z(c.$$.fragment,t),Z(s.$$.fragment,t),u=!0)},o(t){Q(o.$$.fragment,t),Q(c.$$.fragment,t),Q(s.$$.fragment,t),u=!1},d(t){t&&h(n),nt(o),nt(c),nt(s),t&&h(i),t&&h(a)}}}function ie(e){let n;return{c(){n=b("loading assets...")},m(t,e){g(t,n,e)},p:t,i:t,o:t,d(t){t&&h(n)}}}function ae(t){let e,n,o,r,c,l,s,i,a,u,d,f,p,$,v,x,b;n=new it({props:{text:"Help"}}),n.$on("click",t[4]),c=new it({props:{text:"Credits"}}),c.$on("click",t[5]),i=new gt({props:{src:"ui/UI_Bird.png",alt:"Twitter @spellmasons",width:"24px",href:"https://twitter.com/spellmasons",class:"button-wrapper-bg-2"}}),u=new gt({props:{src:"ui/discord_logo.png",alt:"Spellmasons Discord https://discord.gg/q6sUCreHeJ",width:"24px",href:"https://discord.gg/q6sUCreHeJ",class:"button-wrapper-bg-2"}}),f=new Ft({props:{class:"button-wrapper-bg-2",$$slots:{default:[oe]},$$scope:{ctx:t}}}),f.$on("click",t[6]);const C=[ce,re],A=[];function L(t,e){return t[1]?0:1}return $=L(t),v=A[$]=C[$](t),{c(){e=w("div"),tt(n.$$.fragment),o=y(),r=w("div"),tt(c.$$.fragment),l=y(),s=w("div"),tt(i.$$.fragment),a=y(),tt(u.$$.fragment),d=y(),tt(f.$$.fragment),p=y(),v.c(),x=k(),_(e,"id","corner-left"),_(e,"class","flex gap svelte-g9yx2d"),S(e,"flex-direction","column"),_(s,"class","flex gap svelte-g9yx2d"),_(r,"id","corner"),_(r,"class","flex gap svelte-g9yx2d"),S(r,"flex-direction","column")},m(t,h){g(t,e,h),et(n,e,null),g(t,o,h),g(t,r,h),et(c,r,null),m(r,l),m(r,s),et(i,s,null),m(s,a),et(u,s,null),m(s,d),et(f,s,null),g(t,p,h),A[$].m(t,h),g(t,x,h),b=!0},p(t,[e]){const n={};1024&e&&(n.$$scope={dirty:e,ctx:t}),f.$set(n);let o=$;$=L(t),$===o?A[$].p(t,e):(W(),Q(A[o],1,1,(()=>{A[o]=null})),K(),v=A[$],v?v.p(t,e):(v=A[$]=C[$](t),v.c()),Z(v,1),v.m(x.parentNode,x))},i(t){b||(Z(n.$$.fragment,t),Z(c.$$.fragment,t),Z(i.$$.fragment,t),Z(u.$$.fragment,t),Z(f.$$.fragment,t),Z(v),b=!0)},o(t){Q(n.$$.fragment,t),Q(c.$$.fragment,t),Q(i.$$.fragment,t),Q(u.$$.fragment,t),Q(f.$$.fragment,t),Q(v),b=!1},d(t){t&&h(e),nt(n),t&&h(o),t&&h(r),nt(c),nt(i),nt(u),nt(f),t&&h(p),A[$].d(t),t&&h(x)}}}function ue(){if(confirm("Are you sure you want to quit to Main Menu?")){const t=new URL(location.href);t.searchParams.delete("game"),t.searchParams.delete("pieUrl"),window.history.pushState(null,null,t),window.exitCurrentGame().then(syncConnectedWithPieState)}}function de(){window.closeMenu()}function fe(t,e,n){let o;u(t,ne,(t=>n(9,o=t)));let{setRoute:r}=e,{inGame:c}=e;return t.$$set=t=>{"setRoute"in t&&n(0,r=t.setRoute),"inGame"in t&&n(1,c=t.inGame)},[r,c,function(){window.playMusic(),$(ne,o=!0,o),window.startSingleplayer().then((()=>{syncConnectedWithPieState()}))},function(){window.playMusic(),o&&disconnect(),$(ne,o=!1,o),r(Xt)},()=>r(Kt),()=>r(Wt),()=>{r(te)},()=>r(Yt),()=>r(Yt)]}class pe extends ct{constructor(t){super(),rt(this,t,fe,ae,l,{setRoute:0,inGame:1})}}function $e(t,e,n){const o=t.slice();return o[3]=e[n].name,o[4]=e[n].status,o[5]=e[n].color,o[6]=e[n].ready,o}function me(t){let e,n,o,r,c,l,s,i,a,u,d,f,p,$=t[3]+"",v=t[4]+"",x=t[6]+"";return{c(){e=w("tr"),n=w("td"),o=b($),r=y(),c=w("td"),l=b(v),s=y(),i=w("td"),u=y(),d=w("td"),f=b(x),p=y(),_(i,"class","lobby-player-color svelte-1rf4qtf"),_(i,"style",a=`background-color:${t[5]};`),_(e,"class","lobby-row svelte-1rf4qtf")},m(t,a){g(t,e,a),m(e,n),m(n,o),m(e,r),m(e,c),m(c,l),m(e,s),m(e,i),m(e,u),m(e,d),m(d,f),m(e,p)},p(t,e){1&e&&$!==($=t[3]+"")&&L(o,$),1&e&&v!==(v=t[4]+"")&&L(l,v),1&e&&a!==(a=`background-color:${t[5]};`)&&_(i,"style",a),1&e&&x!==(x=t[6]+"")&&L(f,x)},d(t){t&&h(e)}}}function ge(t){let e,n,o,r,c,l,s,i,a,u,d,f,p,$,x;c=new it({props:{type:"button",text:"🠔 Back",class:"sm"}}),c.$on("click",t[1]),d=new At({});let b=t[0],k=[];for(let e=0;e<b.length;e+=1)k[e]=me($e(t,b,e));return{c(){e=w("div"),n=w("aside"),o=w("div"),r=w("div"),tt(c.$$.fragment),l=y(),s=w("h1"),s.textContent="Lobby",i=y(),a=w("main"),u=w("div"),tt(d.$$.fragment),f=y(),p=w("table"),$=w("tbody");for(let t=0;t<k.length;t+=1)k[t].c();_(s,"class","options-title svelte-1rf4qtf"),_(r,"class","flex align-items-center gap-20"),_(o,"class","flex flex-direction-column gap-15 pad-20"),_(n,"class","svelte-1rf4qtf"),_(p,"id","lobby-player-list"),_(p,"class","svelte-1rf4qtf"),_(u,"class","pad-20"),_(e,"class","flex")},m(t,h){g(t,e,h),m(e,n),m(n,o),m(o,r),et(c,r,null),m(r,l),m(r,s),m(e,i),m(e,a),m(a,u),et(d,u,null),m(u,f),m(u,p),m(p,$);for(let t=0;t<k.length;t+=1)k[t].m($,null);x=!0},p(t,[e]){if(1&e){let n;for(b=t[0],n=0;n<b.length;n+=1){const o=$e(t,b,n);k[n]?k[n].p(o,e):(k[n]=me(o),k[n].c(),k[n].m($,null))}for(;n<k.length;n+=1)k[n].d(1);k.length=b.length}},i(t){x||(Z(c.$$.fragment,t),Z(d.$$.fragment,t),x=!0)},o(t){Q(c.$$.fragment,t),Q(d.$$.fragment,t),x=!1},d(t){t&&h(e),nt(c),nt(d),v(k,t)}}}function he(t,e,n){let o=[];R((()=>{setInterval((()=>{console.log("Update lobby"),n(0,o=globalThis.lobbyPlayerList)}),500)})),q((()=>{clearInterval(undefined)}));return[o,()=>window.goBack()]}class ve extends ct{constructor(t){super(),rt(this,t,he,ge,l,{})}}function we(e){let n,o,r,c;return r=new it({props:{type:"button",text:"🠔 Back",class:"sm"}}),r.$on("click",e[0]),{c(){n=w("h1"),n.textContent="This page is still being built",o=y(),tt(r.$$.fragment),_(n,"class","svelte-1n2jha3")},m(t,e){g(t,n,e),g(t,o,e),et(r,t,e),c=!0},p:t,i(t){c||(Z(r.$$.fragment,t),c=!0)},o(t){Q(r.$$.fragment,t),c=!1},d(t){t&&h(n),t&&h(o),nt(r,t)}}}function xe(t){return[()=>window.goBack()]}class be extends ct{constructor(t){super(),rt(this,t,xe,we,l,{})}}function ye(t){let e,n;return{c(){e=b("Connecting...\r\n                "),n=w("div"),n.innerHTML='<div class="svelte-qcde2c"></div> \n                    <div class="svelte-qcde2c"></div> \n                    <div class="svelte-qcde2c"></div> \n                    <div class="svelte-qcde2c"></div>',_(n,"class","lds-ellipsis svelte-qcde2c")},m(t,o){g(t,e,o),g(t,n,o)},d(t){t&&h(e),t&&h(n)}}}function ke(t){let e,n,o,c,l,s,i,a,u,d;const f=[_e,Ce],p=[];function $(t,e){return t[1]?0:1}return l=$(t),s=p[l]=f[l](t),{c(){e=w("p"),e.textContent="Game name",n=y(),o=w("input"),c=y(),s.c(),i=k(),_(o,"class","svelte-qcde2c")},m(r,s){g(r,e,s),g(r,n,s),g(r,o,s),M(o,t[3]),g(r,c,s),p[l].m(r,s),g(r,i,s),a=!0,u||(d=[C(o,"input",t[12]),C(o,"keypress",t[13])],u=!0)},p(t,e){8&e&&o.value!==t[3]&&M(o,t[3]);let n=l;l=$(t),l===n?p[l].p(t,e):(W(),Q(p[n],1,1,(()=>{p[n]=null})),K(),s=p[l],s?s.p(t,e):(s=p[l]=f[l](t),s.c()),Z(s,1),s.m(i.parentNode,i))},i(t){a||(Z(s),a=!0)},o(t){Q(s),a=!1},d(t){t&&h(e),t&&h(n),t&&h(o),t&&h(c),p[l].d(t),t&&h(i),u=!1,r(d)}}}function Ce(e){let n,o,r,c,l;return o=new it({props:{text:"Host"}}),o.$on("click",e[7]),c=new it({props:{text:"Join"}}),c.$on("click",e[7]),{c(){n=w("div"),tt(o.$$.fragment),r=y(),tt(c.$$.fragment),S(n,"display","flex")},m(t,e){g(t,n,e),et(o,n,null),m(n,r),et(c,n,null),l=!0},p:t,i(t){l||(Z(o.$$.fragment,t),Z(c.$$.fragment,t),l=!0)},o(t){Q(o.$$.fragment,t),Q(c.$$.fragment,t),l=!1},d(t){t&&h(n),nt(o),nt(c)}}}function _e(e){let n,o;return{c(){n=b("Joining...\r\n                    "),o=w("div"),o.innerHTML='<div class="svelte-qcde2c"></div> \n                        <div class="svelte-qcde2c"></div> \n                        <div class="svelte-qcde2c"></div> \n                        <div class="svelte-qcde2c"></div>',_(o,"class","lds-ellipsis svelte-qcde2c")},m(t,e){g(t,n,e),g(t,o,e)},p:t,i:t,o:t,d(t){t&&h(n),t&&h(o)}}}function Ae(t){let e,n,o,c,l,s,i,a,u,d,f,p,$,v,x,k,A,L,S,E,P,B;l=new it({props:{type:"button",text:"🠔 Back",class:"sm"}}),l.$on("click",t[9]),x=new it({props:{disabled:t[4],text:"Connect"}}),x.$on("click",t[5]),A=new it({props:{disabled:!t[4],text:"Disconnect"}}),A.$on("click",t[6]);let R=t[0]&&ye(),q=t[4]&&ke(t);return{c(){e=w("div"),n=w("aside"),o=w("div"),c=w("div"),tt(l.$$.fragment),s=y(),i=w("h1"),i.textContent="Multiplayer",a=y(),u=w("main"),d=w("div"),f=b("Server Url\r\n            "),p=w("div"),$=w("input"),v=y(),tt(x.$$.fragment),k=y(),tt(A.$$.fragment),L=y(),R&&R.c(),S=y(),q&&q.c(),_(i,"class","options-title"),_(c,"class","flex align-items-center gap-20"),_(o,"class","flex flex-direction-column gap-15 pad-20"),_($,"class","svelte-qcde2c"),_(d,"class","pad-20"),_(e,"class","flex")},m(r,h){g(r,e,h),m(e,n),m(n,o),m(o,c),et(l,c,null),m(c,s),m(c,i),m(e,a),m(e,u),m(u,d),m(d,f),m(d,p),m(p,$),M($,t[2]),m(p,v),et(x,p,null),m(p,k),et(A,p,null),m(d,L),R&&R.m(d,null),m(d,S),q&&q.m(d,null),E=!0,P||(B=[C($,"input",t[10]),C($,"keypress",t[11])],P=!0)},p(t,[e]){4&e&&$.value!==t[2]&&M($,t[2]);const n={};16&e&&(n.disabled=t[4]),x.$set(n);const o={};16&e&&(o.disabled=!t[4]),A.$set(o),t[0]?R||(R=ye(),R.c(),R.m(d,S)):R&&(R.d(1),R=null),t[4]?q?(q.p(t,e),16&e&&Z(q,1)):(q=ke(t),q.c(),Z(q,1),q.m(d,null)):q&&(W(),Q(q,1,1,(()=>{q=null})),K())},i(t){E||(Z(l.$$.fragment,t),Z(x.$$.fragment,t),Z(A.$$.fragment,t),Z(q),E=!0)},o(t){Q(l.$$.fragment,t),Q(x.$$.fragment,t),Q(A.$$.fragment,t),Q(q),E=!1},d(t){t&&h(e),nt(l),nt(x),nt(A),R&&R.d(),q&&q.d(),P=!1,r(B)}}}function Le(t,e,n){let o,{setRoute:r}=e,c=!1,l=!1,s=new URLSearchParams(location.search),i=s.get("pieUrl"),a=s.get("game");function u(){n(4,o=window.isConnected()),n(0,c=!1)}function d(){if(i){console.log("Menu: Connect to server",i),n(0,c=!0);const t=new URL(location.href);return t.searchParams.set("pieUrl",i),window.history.pushState(null,null,t),window.connect_to_wsPie_server(i).catch(console.error).then(u).then((()=>{r(Qt)}))}return Promise.reject("No wsUrl defined to connect to")}function f(){a?window.isConnected()?(console.log("Menu: Connect to game name",a),n(1,l=!0),window.joinRoom({name:a}).then((()=>{const t=new URL(location.href);t.searchParams.set("game",a),window.history.pushState(null,null,t)})).catch((t=>{console.error("Could not join room",t)})).then((()=>{n(1,l=!1)}))):console.error("Cannot join room until pieClient is connected to a pieServer"):console.log("Cannot join game until a gameName is provided")}R((()=>{u()}));return t.$$set=t=>{"setRoute"in t&&n(8,r=t.setRoute)},[c,l,i,a,o,d,function(){window.pieDisconnect().then(u)},f,r,()=>window.goBack(),function(){i=this.value,n(2,i)},t=>{"Enter"==t.key&&d()},function(){a=this.value,n(3,a)},t=>{"Enter"==t.key&&f()}]}class Me extends ct{constructor(t){super(),rt(this,t,Le,Ae,l,{setRoute:8})}}function Se(e){let n,o;return n=new be({props:{route:!0}}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function Ee(e){let n,o;return n=new bt({props:{route:!0}}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function Pe(e){let n,o;return n=new pt({props:{route:!0}}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function Be(e){let n,o;return n=new Ht({props:{route:!0}}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function Re(e){let n,o;return n=new Me({props:{setRoute:e[2],route:!0}}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function qe(e){let n,o;return n=new ve({props:{route:!0}}),{c(){tt(n.$$.fragment)},m(t,e){et(n,t,e),o=!0},p:t,i(t){o||(Z(n.$$.fragment,t),o=!0)},o(t){Q(n.$$.fragment,t),o=!1},d(t){nt(n,t)}}}function Ie(t){let e,n,o,r,c,l,s;return l=new pe({props:{setRoute:t[2],inGame:t[1]}}),{c(){e=w("div"),n=w("div"),o=w("img"),c=y(),tt(l.$$.fragment),_(o,"id","logo"),a(o.src,r="ui/logo.png")||_(o,"src","ui/logo.png"),_(o,"alt","Spellmasons logo"),_(o,"width","800"),_(n,"id","main-menu-inner"),_(e,"id","main-menu")},m(t,r){g(t,e,r),m(e,n),m(n,o),m(n,c),et(l,n,null),s=!0},p(t,e){const n={};2&e&&(n.inGame=t[1]),l.$set(n)},i(t){s||(Z(l.$$.fragment,t),s=!0)},o(t){Q(l.$$.fragment,t),s=!1},d(t){t&&h(e),nt(l)}}}function Te(t){let e,n,o,r,c,l;const s=[Ie,qe,Re,Be,Pe,Ee,Se],i=[];function a(t,e){return t[0]==Zt?0:t[0]==Qt?1:t[0]==Xt?2:t[0]==Yt?3:t[0]==Wt?4:t[0]==Kt?5:t[0]==te?6:-1}return~(r=a(t))&&(c=i[r]=s[r](t)),{c(){e=w("div"),n=w("div"),o=w("div"),c&&c.c(),_(o,"class","decorative-border"),_(n,"class","full-fill"),_(e,"id","menu")},m(t,c){g(t,e,c),m(e,n),m(n,o),~r&&i[r].m(o,null),l=!0},p(t,[e]){let n=r;r=a(t),r===n?~r&&i[r].p(t,e):(c&&(W(),Q(i[n],1,1,(()=>{i[n]=null})),K()),~r?(c=i[r],c?c.p(t,e):(c=i[r]=s[r](t),c.c()),Z(c,1),c.m(o,null)):c=null)},i(t){l||(Z(c),l=!0)},o(t){Q(c),l=!1},d(t){t&&h(e),~r&&i[r].d()}}}function Ue(t){if("Escape"===t.code)goBack()}function De(t,e,n){let o,r;console.log("Menu: Svelte menu is running");let c=!1;function l(t){console.log("Menu: Route:",t),o=r,n(0,r=t),window.updateInGameMenuStatus()}return window.updateInGameMenuStatus=()=>{n(1,c=void 0!==window.player)},l(Zt),window.goBack=function(){l(o)},R((()=>{document.body.addEventListener("keydown",Ue)})),q((()=>{document.body.removeEventListener("keydown",Ue)})),window.setMenu=l,[r,c,l]}return new class extends ct{constructor(t){super(),rt(this,t,De,Te,l,{})}}({target:document.getElementById("menu-app")||document.body,props:{}})}();
//# sourceMappingURL=svelte-bundle.js.map
