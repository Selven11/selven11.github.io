var mail=document.getElementById("mail");
if(mail&&navigator.clipboard){
mail.addEventListener("click",function(e){
if(e.metaKey||e.ctrlKey||e.shiftKey)return;
e.preventDefault();
var old=mail.textContent;
navigator.clipboard.writeText(old).then(function(){
mail.textContent="copied";
setTimeout(function(){mail.textContent=old},1200);
});
});
}
var shot=document.querySelector(".shot");
if(shot&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&matchMedia("(hover: hover)").matches){
var img=shot.querySelector("img");
shot.addEventListener("pointermove",function(e){
var r=shot.getBoundingClientRect();
var x=(e.clientX-r.left)/r.width-.5;
var y=(e.clientY-r.top)/r.height-.5;
img.style.setProperty("--ry",(x*8).toFixed(2)+"deg");
img.style.setProperty("--rx",(-y*8).toFixed(2)+"deg");
});
shot.addEventListener("pointerleave",function(){
img.style.setProperty("--ry","0deg");
img.style.setProperty("--rx","0deg");
});
}
