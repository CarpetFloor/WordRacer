const acceptedKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

let inputElem = document.querySelector("#wordInput");
let inputPlaceholder = true;

// normal input
document.body.addEventListener("keypress", (e) => {
    if(inputElem.innerText.length < 14) {
        if(acceptedKeys.includes((e.key).toLocaleLowerCase())) {
            if(inputPlaceholder) {
                inputElem.innerText = "";
                inputPlaceholder = false;
                inputElem.style.fontWeight = "bold";
            }

            inputElem.innerText += (e.key).toUpperCase();
        }
    }
});

// backspace
document.body.addEventListener("keydown", (e) => {
    if(e.key == "ArrowLeft") {
        inputPlaceholder = true;
        inputElem.innerText = "Enter word...";
        inputElem.style.fontWeight = "normal";
    }
    else if((e.key == "Backspace") && (inputElem.innerText.length > 0)) {
        let sub = inputElem.innerText.substring(0, inputElem.innerText.length - 1);
        inputElem.innerText = sub;

        if(sub.length == 0) {
            inputPlaceholder = true;
            inputElem.innerText = "Enter word...";
            inputElem.style.fontWeight = "normal";
        }
    }
})