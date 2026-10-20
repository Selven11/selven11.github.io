var still=matchMedia("(prefers-reduced-motion: reduce)").matches;
var vids=document.querySelectorAll("video.loop");
if(still){
vids.forEach(function(v){v.removeAttribute("autoplay");v.pause();v.preload="none"});
}else if("IntersectionObserver" in window){
var vo=new IntersectionObserver(function(es){
es.forEach(function(e){
if(e.isIntersecting){var p=e.target.play();if(p&&p.catch)p.catch(function(){})}
else e.target.pause();
});
},{threshold:.2});
vids.forEach(function(v){vo.observe(v)});
}
if(!still&&"IntersectionObserver" in window){
var items=document.querySelectorAll(".build-head,.pair,.quote,.lab-grid article");
var ro=new IntersectionObserver(function(es){
es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");ro.unobserve(e.target)}});
},{rootMargin:"0px 0px -10% 0px"});
items.forEach(function(el){el.classList.add("reveal");ro.observe(el)});
}
