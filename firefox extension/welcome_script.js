"use strict";
document.documentElement.className=document.documentElement.className.replace("no-js","js");
window.scrollTo(0, 1);

window.onload = function(){
document.getElementById("desktop-link").href="https://github.com/HughIsaacs2/DatPart/releases/tag/"+chrome.runtime.getManifest().version;

document.getElementById("version-notice").textContent="This is version "+chrome.runtime.getManifest().version+" of DatPart.";
}