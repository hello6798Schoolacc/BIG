let upgradeIndex=1;
let one=1;
let datenowcheck=0;
let infinityAnimation=false;
let datenow=Date.now;
let gameDataBackup={points: 0, PPS:1, upgrades:{}, check:true};
let gameData={points: 0, PPS:1, upgrades:{}, check:true, ip:0, i:0};
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
    infinityCheck();
    if(datenow!==Date.now) {
        switch(datenowcheck) {
            case 0:
                alert("Congrats, you failed to manipulate time");
            break;
            case 1:
                alert("Congrats, you still failed to manipulate time");
            break;
            case 2:
                alert("Fine, I will let you change the speed of the game");
                let speed=Number(prompt("Speed value"));
                one=1/(1+Math.abs(speed));
                alert(`Speed set to 1/(1+|${speed}|)`);
            break;
            default:
                Date.now=datenow;
            break;
        }
        datenowcheck++;
        Date.now=datenow;
    }
    dt=time-lastTime;
    lastTime=time;
    gameData.points+=gameData.PPS*dt/1000*one;
    update();
    requestAnimationFrame(main);
}
function update() {
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
    document.getElementById("amount").innerText=gameData.points.format();
    document.getElementById("amountPS").innerText=(gameData.PPS*one).format();
}
function setupUpgrades() {
    createUpgrade(10, 1, 1, 1, [1.5,10,1], !upgradeMissing(1));
    createUpgrade(25, 1, 1, 1, [1.35,25,1], !upgradeMissing(2));
    createUpgrade(200, 2, 1.5, 2, [200,2.3,2.5], !upgradeMissing(3));
    createUpgrade(500, 2, 1.5, 2, [500,3.3,3], !upgradeMissing(4));
    createUpgrade(50000, 3, 0.1, 3, [1.17,50000,3], !upgradeMissing(5));
    createUpgrade(1e17, 4, 0.1, 3, [1.5,1e17,4], !upgradeMissing(6));
    createUpgrade(1e25, 4, 0.1, 3, [3,1e25,5], !upgradeMissing(7));
    createUpgrade(1e35, 4, 0.1, 3, [5,1e35,6], !upgradeMissing(8));
    createUpgrade(1e66, 4, 0.1, 3, [7.5,1e66,7], !upgradeMissing(9));
    createUpgrade(1e100, 4, 0.15, 3, [1000,1e100,8], !upgradeMissing(10));
    createUpgrade(1e165, 4, 0.001, 1, [1,1e165,1], !upgradeMissing(11));
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
})
function infinityCheck() {
    if(infinityAnimation) return;
    if(gameData.points==Infinity) {
        hide();
        infinityAnimation=true;
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
            }, 100);
            setTimeout(() => {
                inf.style.opacity="0";
                setTimeout(() => {
                    document.body.removeChild(inf);
                    show();
                }, 2400);
            }, 3600);
        },2000);
    }
}
function hide() {
    document.querySelectorAll("body div button, p, body button").forEach(function(v) {
        v.style.opacity="0";
    });
}
function show() {
    document.querySelectorAll("body div button, p, body button").forEach(function(v) {
        v.style.opacity="1";
    });
}