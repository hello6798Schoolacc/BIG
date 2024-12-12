function createUpgrade(price, type, factor, pricetype, pricefactor=[1,1,1], updateButton) {
    if(!updateButton) {gameData.upgrades["up"+upgradeIndex]={price, type, factor, pricefactor, pricetype, bought:0, boost:+(type!==1&&type!==3)}}
    addEvent("#up"+upgradeIndex, "click", function(){
        if(gameData.points==Infinity) return;
        let u=gameData.upgrades["up"+this.uindex]; // easier reference
        if(gameData.points>=u.price) {
            gameData.points-=u.price;
            u.bought++;
            switch(u.pricetype) {
                case 1: // b(n+c)^a
                    u.price=u.pricefactor[1]*(u.bought+u.pricefactor[2])**u.pricefactor[0];
                break;
                case 2: // an^b (log n)^c
                    u.price=u.pricefactor[0]*u.bought**u.pricefactor[1]*(Math.log(u.bought+1)+1)**u.pricefactor[2]; // +1 in log for safety
                break;
                case 3: // ba^(n^c)
                    u.price=u.pricefactor[1]*pricefactor[0]**(u.bought**u.pricefactor[2]);
                break;
            }
            u.boost+=u.factor;
        }
        this.querySelector("span").innerText=u.price.format();
    }, function() {this.querySelector('span').innerText=gameData.upgrades["up"+upgradeIndex].price.format(); this.uindex=upgradeIndex; upgradeIndex++;});
}
function upgradeMissing(n) {
    let a=gameData.upgrades?.["up"+n]
    return a===undefined;
}
function setupUpgrades(infReset=false) {
    let upgradeCount=11;
    if(infReset) {
        upgradeIndex=1;
        for(let i=1; i<=upgradeCount; i++) {
            removeEvent("#up"+i);
        }
    }
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
