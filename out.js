"use strict";(()=>{var o=new Proxy({},{get(h,s){let r=String(s);return(...a)=>`<${r}>${a.join("")}</${r}>`}});var{html:e,body:p,div:t,h1:i,h2:c,p:n}=o,g=e(p(t(i("Hello, world!"),n("This is a paragraph.")),t(c("Another div."),n("This is another paragraph."))));console.log(g);})();
