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
