let upgradeIndex=1;
let infinityAnimation=false;
let gameData={points: 0, PPS:1, upgrades:{}, check:true, infinity:{i: 0, ip: 0, activated:false}};
let elements={
    IP:document.getElementById("IP"),
    a:document.getElementById("amount"),
    aps:document.getElementById("amountPS"),
    aip:document.getElementById("amountIP")
};
let request=window.indexedDB.open("gameData", 1);
Number.prototype.format=function() {
    return (this<1e6) ? this.toFixed(2) : this.toLocaleString(undefined, {
        notation: 'scientific',
        maximumSignificantDigits: 3,
      });
}
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('gameDataStore')) {
        db.createObjectStore('gameDataStore');
    }
};
function save() {
    const dbRequest=indexedDB.open('gameData', 1);

    dbRequest.onsuccess = function(event) {
        const db=event.target.result;
        
        const transaction=db.transaction(['gameDataStore'], 'readwrite');
        const objectStore=transaction.objectStore('gameDataStore');
        
        const request=objectStore.put(gameData, 1); 
        
        request.onsuccess=function() {
            console.log("Game data stored successfully.");
        };

        request.onerror=function(event) {
            console.error("Error storing game data:", event.target.error);
        };
    }; // yes, I did copy this code, don't question me
}
function load() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('gameData', 1);

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['gameDataStore'], 'readonly');
            const objectStore = transaction.objectStore('gameDataStore');
            const request = objectStore.get(1);

            request.onsuccess = function(event) {
                const gameData = event.target.result;
                if (gameData) {
                    resolve(gameData);
                } else {
                    resolve("nothing, sad")
                }
            };

            request.onerror = function(event) {
                reject(event.target.error);
            };
        };

        dbRequest.onerror = function(event) {
            reject(new Error('Error opening the database'));
        };
    });
}
function unsave() {
    const dbRequest = indexedDB.open('gameData', 1);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['gameDataStore'], 'readwrite');
        const objectStore = transaction.objectStore('gameDataStore');

        objectStore.delete(1);
    };
}

(async function(){
    let tmp=await load();
    if(tmp) {
        if(tmp.check) {
            gameData=tmp;
        }
    }
    setupUpgrades();
    main(0);
})();
let dt=0;
let lastTime=0
function main(time) {
    miscCode();
    infinityCheck();
    update(time);
    requestAnimationFrame(main);
}
function update(time) {
    dt=time-lastTime;
    lastTime=time;
    gameData.points+=gameData.PPS*dt/1000;
    gameData.PPS=1;
    let temp=[[0],[1],[0],[1]];
    let temp2=1;
    for (const key in gameData.upgrades) {
        let upg=gameData.upgrades[key];
        temp[upg.type-1].push(upg.boost);
    }
    for(let i=0; i<4; i++) {
        let temp3=temp[i];
        temp3.forEach(function(v) {
            if(i==0) {
                gameData.PPS+=v;
            } else if(i==1) {
                gameData.PPS*=v;
            } else if(i==2) {
                temp2+=v;
            } else {
                temp2*=v;
            }
        });
    }
    gameData.PPS=gameData.PPS**temp2;
    updateUI();
}
addEvent("#fakeUpgrade", "click", function() {
    this.innerText="You activated nothing";
    this.style.opacity="0";
    this.style.minWidth="0px";
    this.style.minHeight="0px";
    this.style.width="0px";
    this.style.width="0px";
    this.style.fontSize="0px";
    removeEvent("#fakeUpgrade");
    setTimeout(()=>{document.querySelector("#upgrades").removeChild(this)},3000);
});
function infinityCheck() {
    if(infinityAnimation) return;
    if(gameData.points==Infinity) {
        ignoreAnimation();
        infinityAnimation=true;
        elements.aip.parentElement.style.transition="opacity 2s linear";
        setTimeout(function() {
            hide();
        },70);
        setTimeout(function(){
            let inf=document.createElement("p");
            inf.style.position = "fixed";
            inf.style.top = "50%";
            inf.style.left = "50%";
            inf.style.transform = "translate(-50%, -55%)";
            inf.style.opacity = "0";
            inf.style.color = "white";
            inf.style.fontSize = "80vw";
            inf.style.margin = "0";
            inf.innerHTML = "&infin;";
            document.body.appendChild(inf);

            setTimeout(() => {
                inf.style.opacity = "1";
            }, 130);
            setTimeout(() => {
                gameData.points=0;
                gameData.PPS=0;
                gameData.upgrades={};
                setupUpgrades(true);
                gameData.infinity.ip++;
                gameData.infinity.i++;
                gameData.infinity.activated=true;
                inf.style.opacity="0";
                setTimeout(() => {
                    document.body.removeChild(inf);
                    setTimeout(function() {
                        infinityAnimation=false;
                    }, 500)
                    show();
                }, 2400);
            }, 3600);
        },2000);
    }
}
function ignoreAnimation() {
    document.querySelectorAll("body div button, p, body button").forEach(function(v) {
        v.classList.add("ignoreAnimation");
    });
}
function hide() {
    document.querySelectorAll("body div button, p, body button").forEach(function(v) {
        v.style.opacity="0";
    });
}
function show() {
    document.querySelectorAll("body div button, p, body button").forEach(function(v) {
        v.style.opacity="1";
        setTimeout(function(){
            v.classList.remove("ignoreAnimation");
        }, 3000);
    });
}
function updateUI() {
    if(gameData.infinity.activated&&!infinityAnimation) {
        elements.aip.parentElement.style.transition="opacity 0s linear";
        setTimeout(function() {
            if(infinityAnimation) return;
            elements.aip.parentElement.style.opacity="1";
        },100);
    }
    elements.a.innerText=gameData.points.format();
    elements.aps.innerText=gameData.PPS.format();
    elements.aip.innerText=gameData.infinity.ip.format();
}
function miscCode() {
    // later
}
addEvent("body", "keydown", function(e) {
    if(e.key=="i"&&gameData.infinity.activated) {
        alert("test successful")
    }
})
