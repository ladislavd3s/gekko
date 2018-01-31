// This is a basic example strategy for Gekko.
// For more information on everything please refer
// to this document:
//
// https://gekko.wizb.it/docs/strategies/creating_a_strategy.html
//
// The example below is pretty bad investment advice: on every new candle there is
// a 10% chance it will recommend to change your position (to either
// long or short).

var log = require('../core/log');
var RSI = require('./indicators/RSI.js');
var EMA = require('./indicators/EMA.js');

// Let's create our own strat
var strat = {};

// Prepare everything our method needs
strat.init = function() {
  this.input = 'candle';

  this.own = false;

  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('rsi1d', 'RSI', new { interval: 60 * 24});
  this.addIndicator('rsi1h', 'RSI', new { interval: 60});
  this.addIndicator('rsi15m', 'RSI', new { interval: 15});
  this.addIndicator('rsi1m', 'RSI', new { interval: 1});
  this.addIndicator('macd1d', 'MACDLine', new {short: 12, fast: 24});
  this.addIndicator('macd1h', 'MACDLine', new {short: 12, fast: 24});
}

// What happens on every new candle?
strat.update = function(candle) {
  this.currentPrice = candle.close;
}

// For debugging purposes.
strat.log = function() {
  log.debug('calculated random number:');
  log.debug('\t', this.randomNumber.toFixed(3));
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function() {
  if (this.own) {
    // try sell it
    if (this.currentPrice <= 1.01 * this.buyPrice)
      return;

    if (this.indicators.rsi1m.result <= 70)
      return;

    this.advice('short');
    this.own = false;
  } else {
    // should I buy?

    if (!(this.indicators.macd1d > 0
        || ())
    /*MACD-d > 0 nebo už tři dny po sobě roste (toto lze zkusit obměnit a otestovat se stejnou
podmínkou pro MACD-4h)
• MACD-1h > 0 nebo (( průměr tří posledních MACD-1h je aspoň o třetinu větší než průměr
4. až 6. posledního MACD-1h) a současně MACD-1h už třetí hodinu po sobě roste)
• RSI-15m < 55 and RSI-1h < 60 and RSI-5m < 45 (ta čísla jsou hoodně od boku a můžou být
i úplně jinde, kdyby šlo jen o nákup na malou chvíli)
• RSI-1m < 33*/

    this.advice('long');
    this.buyPrice = this.currentPrice;
    this.own = true;
  }
}

function grows(array) {
  for (i = 1; i < array.length; i++){
    if (array[i-1] >= array[i])
      return false;
  }

  return true;
}

function avg(array) {
  sum = 0;
  for (i = 0; i < array.length; i++)
    sum += array[i];

  return sum / array.length;
}

module.exports = strat;
