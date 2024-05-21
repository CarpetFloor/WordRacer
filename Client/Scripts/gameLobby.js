for(let i = 0; i < mygame.players.length; i++) {
    let p = document.createElement("p");
    p.innerText = playersMap.get(mygame.players[i]);

    if(mygame.players[i] == myid) {
        p.innerText += " (you)";
        p.style.color = "var(--colorDark3)";
    }

    document.querySelector("div").appendChild(p);
}