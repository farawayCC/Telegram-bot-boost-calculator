const config = require('./config.json');
class BoostCalc {
    constructor() { }

    calculate(currency, from, count, party, server, specHeroes, stream, promocode) {
        var result = this.getPrice(from, currency)*count;

        var cleanResult = result

        //console.log(`Price: ${result}. Before modificators`)
        if (party === true) {
            result *= (100+config.price_modificators.party_boost)/100
            //console.log(`Price: ${result}. After party`)

            if (stream === true) {
                result *= (100+config.price_modificators.stream)/100
            }
            //console.log(`Price: ${result}. After stream`)
        }
        if (specHeroes === true) { result *= (100+config.price_modificators.spec_heroes)/100 }
        //console.log(`Price: ${result}. After specHeroes`)

        if (server === 'SEA') { result *= (100+config.price_modificators.serv_SEA)/100 } else
        if (server === 'NA') { result *= (100+config.price_modificators.serv_NA)/100 }
        //console.log(`Price: ${result}. After regions`)

        var promocodePercent = 0;
        if ( config.promocode10.includes(promocode) ) {
            result *= (100-config.price_modificators.promocode10)/100
            promocodePercent = 10;
        } else if ( config.promocode20.includes(promocode) ) {
            result *= (100-config.price_modificators.promocode20)/100
            promocodePercent = 20;
        } else if ( config.promocode30.includes(promocode) ) {
            result *= (100-config.price_modificators.promocode30)/100
            promocodePercent = 30;
        }

        result = parseFloat(result).toFixed(2);
        cleanResult = parseFloat(cleanResult).toFixed(2);

        return { result : result, cleanResult: cleanResult, promocodePercent: promocodePercent };
    }

    getPrice(mmr, currency) {
        if (currency == 'RUB') {
            if (mmr === 0) { return 75; } else
            if (mmr < 2000) { return 50; } else
            if (mmr < 3000) { return 65; } else
            if (mmr < 4000) { return 75; } else
            if (mmr < 5000) { return 90; } else
            if (mmr < 5500) { return 120; } else
            if (mmr < 6000) { return 150; } else
            if (mmr < 6500) { return 330; } else
            if (mmr < 7000) { return 470; } else
            if (mmr <= 7500) { return 740; }
        } else {
            if (mmr === 0) { return 1.5; } else
            if (mmr < 2000) { return 0.8; } else
            if (mmr < 3000) { return 1; } else
            if (mmr < 4000) { return 1.2; } else
            if (mmr < 5000) { return 1.5; } else
            if (mmr < 5500) { return 1.9; } else
            if (mmr < 6000) { return 2.7; } else
            if (mmr < 6500) { return 4.5; } else
            if (mmr < 7000) { return 6.5; } else
            if (mmr <= 7500) { return 10; }
        }
    }

}

module.exports = BoostCalc;
