/* Service worker: lưu sẵn trang để mở nhanh và mở được khi mất mạng.
   Khi sửa index.html, đổi số phiên bản V (ví dụ banhbao-v2) để máy cập nhật lại. */
var V="banhbao-v1",SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url),font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
 if(u.origin!==location.origin&&!font)return; /* không can thiệp Firebase / API */
 if(r.mode==="navigate"){
  e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put("index.html",cp)});return res}).catch(function(){return caches.match("index.html")}));return}
 e.respondWith(caches.match(r).then(function(h){return h||fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)});return res})}))});
