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