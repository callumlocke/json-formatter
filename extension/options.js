let button = document.getElementById("save");
let inputTheme = document.getElementsByName("theme")[0];

chrome.storage.sync.get("theme", function(value) { 
    inputTheme.value = value.theme;
});

button.addEventListener("click", function() {    
    chrome.storage.sync.set({theme: inputTheme.value });
    window.close();
});