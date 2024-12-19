function createUpgrade(price, type, factor, pricetype, pricefactor, infUp=[false, false]) {
    if(upgradeMissing(upgradeIndex)) {
        let infTypeIndex=0;
        if(infUp[1]) {
            infTypeIndex=gameData.infinity.boosts[type-1].length;
        }
        gameData.upgrades["up"+upgradeIndex]={price, type, factor, pricefactor, pricetype, bought:0, boost:+(type!==1&&type!==3), infUp, infTypeIndex}
    }
    if(events["#up"+upgradeIndex]) {removeEvent("#up"+upgradeIndex)}
    addEvent("#up"+upgradeIndex, "click", function(){
        if(gameData.points==Infinity) return;
        let u=gameData.upgrades["up"+this.uindex]; // easier reference
        if(gameData.points>=u.price&&!u.infUp[0]) {
            gameData.points-=u.price;
            calculate(u);
        }
        if(gameData.infinity.ip>=u.price&&u.infUp[0]) {
            gameData.infinity.ip-=u.price;
            calculate(u);
        }
        this.querySelector("span").innerText=u.price.format();
    }, function() {this.querySelector('span').innerText=gameData.upgrades["up"+upgradeIndex].price.format(); this.uindex=upgradeIndex; upgradeIndex++;
    });
}
function upgradeMissing(n) {
    let a=gameData.upgrades?.["up"+n]
    return a===undefined;
}
function setupUpgrades(infReset=false) {
    let upgradeCount=11; // normal upgrade, not inf upgrade
    upgradeIndex=1;
    if(infReset&&window.events["#up1"]!==undefined) {
        for(let i=1; i<=upgradeCount; i++) {
            removeEvent("#up"+i);
        }
    }
    if(detectBoost()||!infReset) {
        createUpgrade(10, 1, 1, 1, [1.49,10,1]);
        createUpgrade(25, 1, 1, 1, [1.34,25,1]);
        createUpgrade(200, 2, 1.5, 2, [200,2.29,2.49]);
        createUpgrade(500, 2, 1.5, 2, [500,3.29,2.99]);
        createUpgrade(50000, 3, 0.125, 3, [1.166,50000,2.965]);
        createUpgrade(1e17, 4, 0.1, 3, [1.48,1e17,3.95]);
        createUpgrade(1e25, 4, 0.1, 3, [2.98,1e25,4.97]);
        createUpgrade(1e35, 4, 0.1, 3, [4.8,1e35,5.9]);
        createUpgrade(1e66, 4, 0.11, 3, [7.5,1e66,7]);
        createUpgrade(1e100, 4, 0.15, 3, [1000,1e100,8]);
        createUpgrade(1e165, 4, 0.001, 1, [1,1e165,1]);
    } else {
        upgradeIndex=12;

        document.querySelector("#upgrades").style.display="none"
        document.querySelectorAll("#upgrades button").forEach(function(v) {
            document.querySelector("#upgrades").removeChild(v);
        });
    }
    if(!infReset) {
        createUpgrade(1, 5, 10, 3, [1.1,1,0.6], [true, false]);
        createUpgrade(0, 1, 99, 3, [Infinity,Infinity,1], [true, false]);
        createUpgrade(1, 1, 1, 3, [1.1,1,1.25], [true, true]);
        createUpgrade(10, 2, 1, 1, [1.75,10,1], [true, true]);
        createUpgrade(50, 2, 2, 1, [2,50,1], [true, true]);
        createUpgrade(100000, 3, 0.1, 3, [2,100000,2], [true, true]);
    }
}
function calculate(u) {
    u.bought++;
    switch(u.pricetype) {
        case 1: // b(n+c)^a
            u.price=u.pricefactor[1]*(u.bought+u.pricefactor[2])**u.pricefactor[0];
        break;
        case 2: // an^b (log n)^c
            u.price=u.pricefactor[0]*u.bought**u.pricefactor[1]*(Math.log(u.bought+1)+1)**u.pricefactor[2]; // +1 in log for safety
        break;
        case 3: // ba^(n^c)
            u.price=u.pricefactor[1]*u.pricefactor[0]**(u.bought**u.pricefactor[2]);
        break;
    }
    if(u.type!==5) {
        u.boost+=u.factor;
    } else {
        u.boost*=u.factor;
    }
    if(u.infUp[1]) {
       gameData.infinity.boosts[u.type-1][u.infTypeIndex]=u.boost;
    }
    
}
function detectBoost() {
    try {return gameData.upgrades.up12.boost*gameData.upgrades.up13.boost!=Infinity} catch(e) {return false}
}
