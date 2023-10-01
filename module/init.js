import { SentimentalActorSheet } from "./actor-sheet.js";
import { SentimentalItemSheet } from "./item-sheet.js";
import { doRoll, dyeRoll } from "./sentimental.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function() {
  console.log(`Initializing Sentimental System`);
 
  game.settings.register("sentimental", "Name", {
    name: "SENTIMENTAL.Name",
    hint: "SENTIMENTAL.Name",
    scope: "world",
    type: String,
    default: true,
    config: true
  });
  
  game.sentimental = {
    doRoll,
	dyeRoll
  };

  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("sentimental", SentimentalActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("sentimental", SentimentalItemSheet, { makeDefault: true });

  // Register system settings
  game.settings.register("sentimental", "macroShorthand", {
    name: "SETTINGS.SimpleMacroShorthandN",
    hint: "SETTINGS.SimpleMacroShorthandL",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  // Register initiative setting.
  game.settings.register("sentimental", "initFormula", {
    name: "SETTINGS.SimpleInitFormulaN",
    hint: "SETTINGS.SimpleInitFormulaL",
    scope: "world",
    type: String,
    default: "1d20",
    config: true,
    onChange: formula => _simpleUpdateInit(formula, true)
  });

  // Retrieve and assign the initiative formula setting.
  const initFormula = game.settings.get("sentimental", "initFormula");
  _simpleUpdateInit(initFormula);

  /**
   * Update the initiative formula.
   * @param {string} formula - Dice formula to evaluate.
   * @param {boolean} notify - Whether or not to post nofications.
   */
  function _simpleUpdateInit(formula, notify = false) {
    // If the formula is valid, use it.
    try {
      new Roll(formula).roll();
      CONFIG.Combat.initiative.formula = formula;
      if (notify) {
        ui.notifications.notify(game.i18n.localize("SIMPLE.NotifyInitFormulaUpdated") + ` ${formula}`);
      }
    }
    // Otherwise, fall back to a d20.
    catch (error) {
      CONFIG.Combat.initiative.formula = "1d20";
      if (notify) {
        ui.notifications.error(game.i18n.localize("SIMPLE.NotifyInitFormulaInvalid") + ` ${formula}`);
      }
    }
  }
});
