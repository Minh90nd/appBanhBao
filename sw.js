/* Service worker kiểu "dùng bản đã lưu trước, cập nhật ngầm" có thông báo bản mới:
   - Mở app: hiện ngay bản đã lưu (không chờ mạng), đồng thời tải bản mới ở nền và lưu lại.
   - Nếu bản tải về KHÁC bản đang lưu, gửi thông báo cho trang để hiện nút "Cập nhật".
   - Mất mạng thì vẫn mở bình thường từ bản đã lưu. Chỉ đổi số V khi muốn xóa sạch bộ nhớ cũ. */
var V="banhbao-v2",SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function notify(){return self.clients.matchAll({type:"window"}).then(function(cs){cs.forEach(function(c){c.postMessage({type:"update"})})})}
function refresh(r,key){return fetch(r).then(function(res){
 if(!(res&&res.ok))return res;
 var cp=res.clone();
 return caches.open(V).then(function(c){
  if(key!=="index.html")return c.put(key,cp);
  return c.match(key).then(function(old){
   return Promise.all([old?old.text():null,cp.clone().text()]).then(function(t){
    return c.put(key,cp).then(function(){if(t[0]!==null&&t[0]!==t[1])return notify()})})})
 }).then(function(){return res},function(){return res})})}
self.addEventListener("fetch",function(e){
 var r=e.request;if(r.method!=="GET")return;
 var u=new URL(r.url),font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
 if(u.origin!==location.origin&&!font)return; /* không can thiệp Firebase / API */
 if(font){ /* phông chữ: có bản lưu thì dùng luôn */
  e.respondWith(caches.match(r).then(function(h){return h||fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)});return res})}));return}
 var key=r.mode==="navigate"?"index.html":r;
 e.respondWith(caches.match(key).then(function(h){
  var net=refresh(r,key).catch(function(){return h});
  if(h){e.waitUntil(net);return h}
  return net}))});
