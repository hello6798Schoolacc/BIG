let upgradeIndex=1;
let infinityAnimation=false;
let infShop=false;
let currentTab="upgrades"
let gameData={points: 0, PPS:1, upgrades:{}, check:true, infinity:{i: 0, ip: 0, activated:false, boosts:[[0], [1], [0], [1], [1]]}, options:{delay:5000, active:true, infAnim:true}};
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
    }; // yes, I did copy this code, don't question me, same for every indexedDB function excluding autosave
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
            document.querySelector("#o1 span").innerText=(gameData.options.active) ? "on":"off";
            document.querySelector("#o2 span").innerText=(gameData.options.delay/1000).toFixed(2)+"s";
            document.querySelector("#o3 span").innerText=(gameData.options.infAnim) ? "on":"off";
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
    let temp=[[0],[1],[0],[1],[1]];
    for (const key in gameData.upgrades) {
        let upg=gameData.upgrades[key];
        if(upg.infUp[1]) {continue}
        temp[upg.type-1].push(upg.boost);
    }
    gameData.PPS=calculateBoost(temp);
    updateUI();
}
function calculateBoost(temp) {
    let temp5=1;
    let temp2=1;
    let temp4=1;
    for(let i=0; i<5; i++) {
        let temp3=temp[i];
        temp3.forEach(function(v) {
            if(i==0) {
                temp5+=v;
            } else if(i==1) {
                temp5*=v;
            } else if(i==2) {
                temp2+=v;
            } else if(i==3) {
                temp2*=v;
            }  else if(i==4) {
                temp4*=v;
            }
        });
    }
    return (temp5**temp2)*temp4
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
        if(!gameData.options.infAnim) {
            infReset();
            return;
        }
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
                infReset();
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
function infReset() {
    gameData.points=0;
    gameData.PPS=0;
    for(let i=1; i<=11; i++) {
        delete gameData.upgrades["up"+i]
    }
    setupUpgrades(true);
    let ipAdded
    gameData.infinity.ip+=calculateBoost(gameData.infinity.boosts);
    gameData.infinity.i++;
    gameData.infinity.activated=true;
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
            document.querySelector("#fakeUpgrade")?.classList?.add("ignoreAnimation");
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
    if(gameData.options.infAnim&&gameData.infinity.i>=50) {
        alert("The infinity animation has been forcibly disabled to prevent the slow animation with quick progress");
        gameData.options.infAnim=false;
    }
    if(gameData.upgrades.up12.boost*gameData.upgrades.up13.boost==Infinity) {
        document.querySelector("#points").style.opacity="0";
        document.querySelector("#pointsPerSecond").style.opacity="0";
        document.querySelector("#IP").style.fontSize="40px";
        document.querySelector("#IP").style.top="-20px";
    }
    if(isNaN(gameData.points)) {
        gameData.points=0;
    }
}
addEvent("body", "keydown", function(e) {
    toggleShops(e.key);
});
function toggleShops(k) {
    if(gameData.infinity.activated&&k=="i") {
        if(currentTab!=="infinityUpgrades") {
            toggleHelper(currentTab, "infinityUpgrades");
        } else {
            toggleHelper("infinityUpgrades", "upgrades");
        }
    }
    if(k=="o") {
        if(currentTab!=="options") {
            toggleHelper(currentTab, "options");
        } else {
            toggleHelper("options", "upgrades");
        }
    }
}
function toggleHelper(a,b) {
    document.querySelectorAll(`#${a} button`).forEach(function(v) {
        v.style.clipPath="circle(0% at 50% 50%)";
    });
    document.querySelectorAll(`#${b} button`).forEach(function(v) {
        v.style.clipPath="circle(100% at 50% 50%)";
    });
    currentTab=b;
}

function autosave() {
    if(gameData.options.active) {
        save();
    }
    setTimeout(autosave, gameData.options.delay);
}
setTimeout(autosave, 1000);




addEvent("#endGame", "click", function() {
    const createText=(text, top) => {let tempText=document.createElement("p"); tempText.style.position="fixed"; tempText.innerText=text; tempText.style.top=top+"%";tempText.style.transition="top 50s linear"; document.body.appendChild(tempText); tempText.style.color="white"; return tempText}
    if(gameData.infinity.ip>=1e10) {
        document.querySelectorAll("body *").forEach(function(v) {
            v.style.opacity="0";
        });
        let list=[createText("Thank you for playing my game", 120), createText("Dev: me", 130),
            createText("Graphics: me", 140), createText("Audio: none", 150), createText("Sacrifices: my school grade", 160),
            createText("Code readability: false", 170), createText("useless features: all of them", 180), 
            createText("next update in: never", 190), createText("Time spent just being bored: 97%", 200), 
            createText("Rating: probably 1/5", 210), createText("annoyed at myself: 101%", 220),
            createText("Teamwork: I don't even work with myself well", 230), createText("Effort: Yes and no", 240),
            createText("Best working part: the html, potentially", 250), createText("repetitiveness: 100% after 100% after 100%", 260)];
        setTimeout(function() {
            list.forEach(function(v) {
                let top=v.style.top.slice(0, v.style.top.indexOf("%"));
                top=Number(top);
                v.style.top=(top-500)+"%";
            })
        }, 200);
    }
});