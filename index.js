const { Telegraf } = require('telegraf')
const config = require('./config.json');
const bot = new Telegraf(config.token)


const Extra = require('telegraf/extra')
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");

const BoostCalc = require('./boostCalculator.js');
const boostCalc = new BoostCalc();

const CalibCalc = require('./calibCalculator.js');
const calibCalc = new CalibCalc();



var lang = 'English'; // or 'Russian'

const buttons = ['🚀 Boost', '🎓 Coach', '⚖️ Calibrate', '🌎 Change Language'] //🚀 🎓 ⚖️ 🌎
const buttonsRu = ['🚀 Буст', '🎓 Тренировка', '⚖️ Калибровка', '🌎 Сменить язык'] //🚀 🎓 ⚖️ 🌎

//['🚀 Boost', '🎓 Coach'],
//['⚖️ Calibrate', '🌎 Change Language'],

bot.start(ctx => {
    ctx.reply(`🤖: Welcome! Selected language: ${lang} 🌎`)
    ctx.reply(`To get more info about this bot, you can use command /help`)

    if (lang === 'Russian') {
      ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
    } else {
      ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
    }
});

// Сцена создания нового матча.
const boost = new WizardScene(
      "boost_calculate", // Имя сцены

      (ctx) => {
          if (lang === 'Russian') {
              ctx.reply("Введите ваш текущий ММР");
          } else {
              ctx.reply("Please, enter your current MMR");
          }
          return ctx.wizard.next(); // Переходим к следующему обработчику.
      },

      (ctx) => {
          //TODO: here and for desired mmr check if this is a number
          ctx.wizard.state.currentMMR = ctx.message.text; // store mmr in the state to share data between middlewares
          if (isNaN(ctx.wizard.state.currentMMR)) {
              if (lang === 'Russian') {
                  ctx.reply("Мы ждали число");
              } else {
                  ctx.reply("We have been waiting for a number");
              }
              if (lang === 'Russian') {
                  ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
              } else {
                  ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
              }
              return ctx.scene.leave();
          }

          if (lang === 'Russian') {
              ctx.reply("До скольки ММР вы хотите заказать буст?");
          } else {
              ctx.reply("How much MMR do you want?");
          }
          return ctx.wizard.next(); // Переходим к следующему обработчику.
      },

      (ctx) => {
          ctx.wizard.state.desiredMMR = ctx.message.text; // retrieve desired mmr from the message which user entered
          if (isNaN(ctx.wizard.state.desiredMMR)) {
              if (lang === 'Russian') {
                  ctx.reply("Мы ждали число");
              } else {
                  ctx.reply("We have been waiting for a number");
              }
              if (lang === 'Russian') {
                  ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
              } else {
                  ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
              }
              return ctx.scene.leave();
          }
          if ((ctx.wizard.state.desiredMMR - ctx.wizard.state.currentMMR) < 0) {
              if (lang === 'Russian') {
                  ctx.reply("Вы указали желаемый ММР меньше текущего 😀");
              } else {
                  ctx.reply("You've typed desired mmr less than current one 😀");
              }
              if (lang === 'Russian') {
                  ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
              } else {
                  ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
              }
              return ctx.scene.leave();
          } else if ((ctx.wizard.state.desiredMMR - ctx.wizard.state.currentMMR) <= 100) {
              if (lang === 'Russian') {
                  ctx.reply("Заказ должен быть на 100 ММР и больше.");
              } else {
                  ctx.reply("Order should be more than 100 MMR.");
              }
              if (lang === 'Russian') {
                  ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
              } else {
                  ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
              }
              return ctx.scene.leave();
          }

          //const yourMMR = ctx.wizard.state.currentMMR; // retrieve your mmr from
          if (lang === 'Russian') {
              ctx.reply(`Хотите передать аккаунт или играть в пати с бустером (+${config.price_modificators.party_boost}% стоимости)?`, Markup
                            .keyboard([
                                [`🥂В пати (+${config.price_modificators.party_boost}% стоимости)`, 'С передачей аккаунта'],
                            ]).oneTime().resize().extra()
                        );
          } else {
              ctx.reply(`Do you want to transfer your account or play in a party with a booster (+${config.price_modificators.party_boost}% of the cost)?`, Markup
                            .keyboard([
                                [`🥂In party (+${config.price_modificators.party_boost}% of the cost)`, 'Transfer account'],
                            ]).oneTime().resize().extra()
                        );
          }
          return ctx.wizard.next(); // Переходим к следующему обработчику.
      },

      (ctx) => {
          ctx.wizard.state.party = ctx.message.text.includes(config.price_modificators.party_boost)
          if (ctx.wizard.state.party === true) {
              ctx.wizard.steps[5](ctx)
              ctx.wizard.next();
              if (lang === 'Russian') {
                  ctx.reply('Выберите сервер, где будет работать бустер 💁‍', Markup
                                .keyboard([
                                    [`🌎 NA (+${config.price_modificators.serv_NA}% стоимости)`, `🌏 SEA (+${config.price_modificators.serv_SEA}% )`, '🌍 EU'],
                                ]).oneTime().resize().extra()
                            );
              } else {
                  ctx.reply('Choose the server for booster to play on 💁‍', Markup
                                .keyboard([
                                    [`🌎 NA (+${config.price_modificators.serv_NA}% of the cost)`, `🌏 SEA (+${config.price_modificators.serv_SEA}%)`, '🌍 EU'],
                                ]).oneTime().resize().extra()
                            );
              }
              return ctx.wizard.next();
          } else {
              if (lang === 'Russian') {
                  ctx.reply(`Хотите, чтобы бустер стримил 📺? (+${config.price_modificators.stream}% стоимости)`, Markup
                                .keyboard([
                                    [`📺 Со стримом (+${config.price_modificators.stream}% стоимости)`, 'Нет'],
                                ]).oneTime().resize().extra()
                            );
              } else {
                  ctx.reply(`Do you want booster to stream 📺 during boost (+${config.price_modificators.stream}% of the cost)?`, Markup
                                .keyboard([
                                    [`📺 Yes (+${config.price_modificators.stream}% of the cost)`, 'No'],
                                ]).oneTime().resize().extra()
                            );
              }

              return ctx.wizard.next();
          }
      },

      (ctx) => {
          if (ctx.wizard.state.party === true) {
              ctx.wizard.state.stream = false;
              return ctx.wizard.next();
          } else {
              ctx.wizard.state.stream = ctx.message.text.includes(config.price_modificators.stream)
              if (lang === 'Russian') {
                  ctx.reply(`🦸Хотите, выбрать определенных героев, на которых надо бустить? (+${config.price_modificators.spec_heroes}% стоимости)`, Markup
                                .keyboard([
                                    [`🦸Да (+${config.price_modificators.spec_heroes}% стоимости)`, 'Нет'],
                                ]).oneTime().resize().extra()
                            );
              } else {
                  ctx.reply(`🦸Want to pick specific heroes for booster to play on? (+${config.price_modificators.spec_heroes}% cost)`, Markup
                                .keyboard([
                                    [`🦸Yes (+${config.price_modificators.spec_heroes}% of the cost)`, 'No'],
                                ]).oneTime().resize().extra()
                            );
              }
              return ctx.wizard.next();
          }
      },
      (ctx) => {
          if (ctx.wizard.state.party === true) {
              ctx.wizard.state.specificHeroes = false;
              return ctx.wizard.next();
          } else {
              if (ctx.message.text.includes(config.price_modificators.spec_heroes)) { ctx.wizard.state.specificHeroes = true;
              } else {ctx.wizard.state.specificHeroes = false;}
          }
          if (lang === 'Russian') {
              ctx.reply('Выберите сервер, где будет работать бустер 💁‍', Markup
                            .keyboard([
                                [`🌎 NA (+${config.price_modificators.serv_NA}% стоимости)`, `🌏 SEA (+${config.price_modificators.serv_SEA}% )`, '🌍 EU'],
                            ]).oneTime().resize().extra()
                        );
          } else {
              ctx.reply('Choose the server for booster to play on 💁‍', Markup
                            .keyboard([
                                [`🌎 NA (+${config.price_modificators.serv_NA}% of the cost)`, `🌏 SEA (+${config.price_modificators.serv_SEA}%)`, '🌍 EU'],
                            ]).oneTime().resize().extra()
                        );
          }
          return ctx.wizard.next();

      },
      (ctx) => {
          if (ctx.message.text.includes(config.price_modificators.serv_NA)) { ctx.wizard.state.region = 'NA'; } else
          if (ctx.message.text.includes(config.price_modificators.serv_SEA)) { ctx.wizard.state.region = 'SEA'; } else
          { ctx.wizard.state.region = 'EU'; }

          if (lang === 'Russian') {
              ctx.reply("🎁 Если у вас есть промокод, пожалуйста введите его. Если нету, отправьте любое сообщение");
          } else {
              ctx.reply("🎁 If you have a promo code, please enter it. If not, send any message");
          }
          return ctx.wizard.next(); // Переходим к следующему обработчику.
      },
      (ctx) => {
          ctx.wizard.state.promocode = ctx.message.text;

          var currency = '';
          // TODO: Other currencies
          if (lang === 'Russian') { currency = 'RUB' } else
          { currency = 'USD' }

          const yourMMR = ctx.wizard.state.currentMMR
          const desiredMMR = ctx.wizard.state.desiredMMR

          const calculatedObject = boostCalc.calculate(currency, yourMMR, desiredMMR,
                ctx.wizard.state.party, ctx.wizard.state.region,
                ctx.wizard.state.specificHeroes, ctx.wizard.state.stream, ctx.wizard.state.promocode)

          const result = calculatedObject.result
          const cleanResult = calculatedObject.cleanResult
          const promocodePercent = calculatedObject.promocodePercent


          if ((typeof result === 'string' || result instanceof String) && result === 0) {
              ctx.reply(result);
          } else if (result <= 0) {
              if (lang === 'Russian') {
                  ctx.reply(
                      `⛔️ Ошибка, проверьте правильность введенных данных`
                  );
              } else {
                  ctx.reply(
                      `⛔️ Error, please check the correctness of the entered data`
                  );
              }
          } else {
              if (lang === 'Russian') {
                  ctx.reply(
                      `🚀 Буст с ${yourMMR} до ${desiredMMR} будет стоить: ${result} ${currency} \n\n🧹 Без модификаторов буст будет стоить: ${cleanResult} ${currency}`
                  );
                  if (promocodePercent !== null && promocodePercent != 0)
                      ctx.reply( "Был применен промокод на "+promocodePercent+"% 🎁" );//`Был применен промокод на ${promocodePercent}% 🎁` );
              } else {
                  ctx.reply(
                      `🚀 Boost from ${yourMMR} to ${desiredMMR} will cost: ${result} ${currency} \n\n🧹 Without modificators boost will cost: ${cleanResult} ${currency}`
                  );
                  if (promocodePercent !== null && promocodePercent != 0)
                      ctx.reply( "Promocode for "+promocodePercent+"% was applied 🎁" );//`Promocode for ${promocodePercent}% was applied 🎁` );
              }
          }
          // After scene actions
          if (lang === 'Russian') {
              ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
          } else {
              ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
          }

          return ctx.scene.leave();
    }
);



const coach = new WizardScene(
  "coach_calculate", // Имя сцены
  (ctx) => {
    if (lang === 'Russian') {
        ctx.reply('На каком языке должна проходить тренировка?', Markup
                      .keyboard([
                          ['Русский', 'English'],
                      ])
                      .oneTime()
                      .resize()
                      .extra()
                  );
    } else {
        ctx.reply('Choose a language for coaching', Markup
                      .keyboard([
                          ['Russian', 'English'],
                      ])
                      .oneTime()
                      .resize()
                      .extra()
                  );
    }
    return ctx.wizard.next(); // Переходим к следующему обработчику.
  },
  (ctx) => {
      if (ctx.message.text.includes('English')) {
          ctx.reply(`🎓 Coaching costs ${config.coach_usd}$ per 1 hour`);
      } else {
          ctx.reply(`🎓 Обучение стоит ${config.coach_rub} рублей за 1 час`);
      }

      // After scene actions
      if (lang === 'Russian') {
          ctx.reply('Возможные действия:', Markup
                        .keyboard([
                            [buttonsRu[0], buttonsRu[1]],
                            [buttonsRu[2], buttonsRu[3]],
                        ])
                        .oneTime()
                        .resize()
                        .extra()
                    );
      } else {
          ctx.reply('Possible Actions:', Markup
                        .keyboard([
                            [buttons[0], buttons[1]],
                            [buttons[2], buttons[3]],
                        ])
                        .oneTime().resize().extra()
                    );
      }
      return ctx.scene.leave();
  }
);



const calibrate = new WizardScene(
  "calibrate_calculate", // Имя сцены
  (ctx) => { //0
    if (lang === 'Russian') {
        ctx.reply("Введите ваш прошлый ММР. Введите 0, если это первая калибровка");
    } else {
        ctx.reply("Please, enter your past MMR. Enter 0 if it is your first calibration");
    }
    return ctx.wizard.next(); // Переходим к следующему обработчику.
  },
  (ctx) => { //1
      ctx.wizard.state.prevMMR = ctx.message.text; // store mmr in the state to share data between middlewares
      if (isNaN(ctx.wizard.state.prevMMR)) {
          if (lang === 'Russian') {
              ctx.reply("Мы ждали число");
          } else {
              ctx.reply("We have been waiting for a number");
          }
          if (lang === 'Russian') {
              ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
          } else {
              ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
          }
          return ctx.scene.leave();
      }

      const prevMMR = ctx.wizard.state.prevMMR
      //Data-proove
      if (prevMMR < 0 || prevMMR > config.max_mmr) {
          if (lang === 'Russian') {
              ctx.reply(`Неправильные данные: принимаются только значения от 0 до ${config.max_mmr}`);
          } else {
              ctx.reply(`Wrong input data. Should be from 0 to ${config.max_mmr}`);
          }

        if (lang === 'Russian') {
            ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
        } else {
            ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
        }
        return ctx.scene.leave();
      }

      if (lang === 'Russian') {
          ctx.reply("Сколько игр калибровки нужно провести (от 3 до 10)?");
      } else {
          ctx.reply("How much calibration games needed to be played (from 3 to 10)?");
      }
    return ctx.wizard.next(); // Переходим к следующему обработчику.
  },

  (ctx) => { //2
      ctx.wizard.state.gamesCount = ctx.message.text;
      if (isNaN(ctx.wizard.state.gamesCount)) {
          if (lang === 'Russian') {
              ctx.reply("Мы ждали число");
          } else {
              ctx.reply("We have been waiting for a number");
          }
          if (lang === 'Russian') {
              ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
          } else {
              ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
          }
          return ctx.scene.leave();
      }
      const gamesCount = ctx.wizard.state.gamesCount;
      //Data-proove
      if (gamesCount < 3 || gamesCount > 10) {
        if (lang === 'Russian') {
            ctx.reply('Неправильные данные: принимаются только значения от 3 до 10');
        } else {
            ctx.reply('Wrong input data. Should be from 3 to 10');
        }

        if (lang === 'Russian') {
            ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
        } else {
            ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
        }
        return ctx.scene.leave();
      }

      if (lang === 'Russian') {
          ctx.reply(`Хотите передать аккаунт или играть в пати с бустером (+${config.price_modificators.party_boost}% стоимости)?`, Markup
                        .keyboard([
                            [`🥂В пати (+${config.price_modificators.party_boost}% стоимости)`, 'С передачей аккаунта'],
                        ]).oneTime().resize().extra()
                    );
      } else {
          ctx.reply(`Do you want to transfer your account or play in a party with a booster (+${config.price_modificators.party_boost}% of the cost)?`, Markup
                        .keyboard([
                            [`🥂In party (+${config.price_modificators.party_boost}% of the cost)`, 'Transfer account'],
                        ]).oneTime().resize().extra()
                    );
      }
      return ctx.wizard.next(); // Переходим к следующему обработчику.
  },

  (ctx) => { //3
      ctx.wizard.state.party = ctx.message.text.includes(config.price_modificators.party_boost)
      if (ctx.wizard.state.party === true) {
          ctx.wizard.steps[5](ctx)
          ctx.wizard.next();
          return ctx.wizard.next();
      } else {
          if (lang === 'Russian') {
              ctx.reply(`Хотите, чтобы бустер стримил 📺? (+${config.price_modificators.stream}% стоимости)`, Markup
                            .keyboard([
                                [`📺 Со стримом (+${config.price_modificators.stream}% стоимости)`, 'Нет'],
                            ]).oneTime().resize().extra()
                        );
          } else {
              ctx.reply(`Do you want booster to stream 📺 during boost (+${config.price_modificators.stream}% of the cost)?`, Markup
                            .keyboard([
                                [`📺 Yes (+${config.price_modificators.stream}% of the cost)`, 'No'],
                            ]).oneTime().resize().extra()
                        );
          }

          return ctx.wizard.next();
      }

  },

  (ctx) => { //4
      if (ctx.wizard.state.party === true) {
          ctx.wizard.state.stream = false;
      } else {
          ctx.wizard.state.stream = ctx.message.text.includes(config.price_modificators.stream)
          if (lang === 'Russian') {
              ctx.reply(`🦸Хотите, выбрать определенных героев, на которых надо бустить? (+${config.price_modificators.spec_heroes}% стоимости)`, Markup
                            .keyboard([
                                [`🦸Да (+${config.price_modificators.spec_heroes}% стоимости)`, 'Нет'],
                            ]).oneTime().resize().extra()
                        );
          } else {
              ctx.reply(`🦸Want to pick specific heroes for booster to play on? (+${config.price_modificators.spec_heroes}% cost)`, Markup
                            .keyboard([
                                [`🦸Yes (+${config.price_modificators.spec_heroes}% of the cost)`, 'No'],
                            ]).oneTime().resize().extra()
                        );
          }
          return ctx.wizard.next();
      }
      return ctx.wizard.next();
  },
  (ctx) => { //5
      if (ctx.wizard.state.party === true) {
          ctx.wizard.state.specificHeroes = false;
      } else {
          ctx.wizard.state.specificHeroes = ctx.message.text.includes(config.price_modificators.spec_heroes)
      }
      if (lang === 'Russian') {
          ctx.reply('Выберите сервер, где будет работать бустер 💁‍♂️', Markup
                        .keyboard([
                            [`🌎 NA (+${config.price_modificators.serv_NA}% стоимости)`, `🌏 SEA (+${config.price_modificators.serv_SEA}% )`, '🌍 EU'],
                        ]).oneTime().resize().extra()
                    );
      } else {
          ctx.reply('Choose the server for booster to play on 💁‍♂️', Markup
                        .keyboard([
                            [`🌎 NA (+${config.price_modificators.serv_NA}% of the cost)`, `🌏 SEA (+${config.price_modificators.serv_SEA}%)`, '🌍 EU'],
                        ]).oneTime().resize().extra()
                    );
      }
      return ctx.wizard.next(); // Переходим к следующему обработчику.
  },
  (ctx) => { //6
      if (ctx.message.text.includes(config.price_modificators.serv_NA)) { ctx.wizard.state.region = 'NA'; } else
      if (ctx.message.text.includes(config.price_modificators.serv_SEA)) { ctx.wizard.state.region = 'SEA'; } else
      { ctx.wizard.state.region = 'EU'; }

      if (lang === 'Russian') {
          ctx.reply("🎁 Если у вас есть промокод, пожалуйста введите его. Если нету, отправьте любое сообщение");
      } else {
          ctx.reply("🎁 If you have a promo code, please enter it. If not, send any message");
      }
      return ctx.wizard.next(); // Переходим к следующему обработчику.
  },
  (ctx) => { //7
      ctx.wizard.state.promocode = ctx.message.text;

      var currency = '';
      // TODO: Other currencies
      if (lang === 'Russian') { currency = 'RUB' } else
      { currency = 'USD' }

      const prevMMR = ctx.wizard.state.prevMMR
      const gamesCount = ctx.wizard.state.gamesCount

      const calculatedObject = calibCalc.calculate(currency, prevMMR, gamesCount,
            ctx.wizard.state.party, ctx.wizard.state.region,
            ctx.wizard.state.specificHeroes, ctx.wizard.state.stream, ctx.wizard.state.promocode)

      const result = calculatedObject.result
      const cleanResult = calculatedObject.cleanResult
      const promocodePercent = calculatedObject.promocodePercent

      if (result <= 0) {
          if (lang === 'Russian') {
              ctx.reply(
                  `⛔️ Ошибка, проверьте правильность введенных данных`
              );
          } else {
              ctx.reply(
                  `⛔️ Error, please check the correctness of the entered data`
              );
          }
      } else {
          if (lang === 'Russian') {
              ctx.reply(
                  `🚀 Калибровка с ${prevMMR} MMR, ${gamesCount} игр будет стоить: ${result} ${currency} \n\n🧹 Без модификаторов калибровка будет стоить: ${cleanResult} ${currency}`
              );
              if (promocodePercent !== null && promocodePercent != 0)
                  ctx.reply( "Был применен промокод на "+promocodePercent+"% 🎁" );//`Был применен промокод на ${promocodePercent}% 🎁` );
          } else {
              ctx.reply(
                  `🚀 Calibration from ${prevMMR} MMR, ${gamesCount} games will cost: ${result} ${currency} \n\n🧹 Without modificators calibration will cost: ${cleanResult} ${currency}`
              );
              if (promocodePercent !== null && promocodePercent != 0)
                  ctx.reply( "Promocode for "+promocodePercent+"% was applied 🎁" );//`Promocode for ${promocodePercent}% was applied 🎁` );
          }
      }
      // After scene actions
      if (lang === 'Russian') {
          ctx.reply('Возможные действия:', Markup .keyboard([[buttonsRu[0], buttonsRu[1]],[buttonsRu[2], buttonsRu[3]],]).oneTime().resize().extra());
      } else {
          ctx.reply('Possible Actions:', Markup.keyboard([[buttons[0], buttons[1]],[buttons[2], buttons[3]],]).oneTime().resize().extra());
      }

      return ctx.scene.leave();
}

);


// Создаем менеджера сцен
const stage = new Stage();

// Регистрируем сцену создания матча
stage.register(boost);
stage.register(coach);
stage.register(calibrate);


bot.use(session());
bot.use(stage.middleware());
bot.command("boost", (ctx) => ctx.scene.enter("boost_calculate"));

bot.command("coach", (ctx) => ctx.scene.enter("coach_calculate"));
bot.command("calibrate", (ctx) => ctx.scene.enter("calibrate_calculate"));



//'🚀 Boost'
bot.hears(buttons[0], ctx => {
    return ctx.scene.enter("boost_calculate");
})

//'🎓 Coach'
bot.hears(buttons[1], ctx => {
    return ctx.scene.enter("coach_calculate");
})

//'⚖️ Calibrate'
bot.hears(buttons[2], ctx => {
    return ctx.scene.enter("calibrate_calculate");
})

//'🌎 Change Language'
bot.hears(buttons[3], ctx => {
    return ctx.reply('Select a language', Markup
                  .keyboard([
                      ['🇷🇺', '🇺🇸'],
                  ])
                  .oneTime()
                  .resize()
                  .extra()
              );
})

bot.hears(buttonsRu[0], ctx => {
    return ctx.scene.enter("boost_calculate");
})

bot.hears(buttonsRu[1], ctx => {
    return ctx.scene.enter("coach_calculate");
})

bot.hears(buttonsRu[2], ctx => {
    return ctx.scene.enter("calibrate_calculate");
})

bot.hears(buttonsRu[3], ctx => {
    return ctx.reply('Select a language', Markup
                  .keyboard([
                      ['🇷🇺', '🇺🇸'],
                  ])
                  .oneTime()
                  .resize()
                  .extra()
              );
})


bot.hears('🇷🇺', ctx => {
    lang = 'Russian';
    ctx.reply('Язык изменён на русский');
    return ctx.reply('Возможные действия:', Markup
                  .keyboard([
                      [buttonsRu[0], buttonsRu[1]],
                      [buttonsRu[2], buttonsRu[3]],
                  ])
                  .oneTime()
                  .resize()
                  .extra()
              );
})
bot.hears('🇺🇸', ctx => {
    lang = 'English';
    ctx.reply('Language changed to english');
    return ctx.reply('Possible Actions:', Markup
                  .keyboard([
                      ['🚀 Boost', '🎓 Coach'],
                      ['⚖️ Calibrate', '🌎 Change Language'],
                  ])
                  .oneTime()
                  .resize()
                  .extra()
              );
})

bot.command('help', (ctx) => {
    ctx.reply(`Here you can get information about the cost of 🚀 Boost, 🎓 Training and ⚖️ Calibration from the CalibrateYourMom portal. \n \n 🌎 Long live Belarus! 🌎 \n \n The /start command restarts the bot for you`);
    ctx.reply(`Здесь вы можете получить информацию о стоимости 🚀 Буста, 🎓 Обучения и ⚖️ Калибровке от портала КалИБровкаТвоейМамы. \n \n 🌎Жыве Беларусь!🌎 \n \n Команда /start перезапускает бота для вас`);
})

bot.launch()
