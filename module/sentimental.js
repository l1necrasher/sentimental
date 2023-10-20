import { diceValueUpdate } from "./updateFunctions.js";
/**
 * @param {integer} diceString - Number of rice to role
 * @param {integer} num - An integer value found on the Lasers & Feelings character sheet in the number input
 * @param {RollTypes} roleType - Lasers or Feelings roll
 * @param {string} thisActorID - Name of the character rolling
*/

async function makeRole(diceString, thisActorID, bonus) {
  let roll = await new Roll(diceString).roll();
  let chatTemplate = evaluateRolls(roll, thisActorID, bonus);
  
  let actorName = getProperty(game.actors.get(thisActorID), "name");
  ChatMessage.create({
	type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    content: chatTemplate,
    roll: roll,
    speaker: { alias: actorName },
  });
}

Hooks.once("ready", async function() {
  Hooks.on("dropActorSheetData", (actor, sheet, data) => {
	  let bondmate = parseUuid(data.uuid);
	  bondmate = game.actors.get(bondmate.documentId);
	  createBond(actor, bondmate);
  });
  
  //version control the old fashioned way
 console.log("# # # # # SENTIMENTAL ;; UPDATE: 20.10.23 # # # # # ");
  
});

/*
Hooks.on("createChatMessage", function()  {
	let message = $(".sentimentMessage");
	let thisActor = $(".sentimentMessage").attr('data-senderID');

	setTimeout(function () {
		$(message).find("a").on('click', event => {
		let id = $(event.target).attr('data-ident');
		let item = game.actors.get(thisActor).items.get(id);
		item.sheet.render(true);		
	});
	}, 100);
});
*/


async function createBond(actor, mate) {
	let itemData = {
		name: mate.name,
		type: "bond",
		system: {
			bondmate: mate.id
		}
	}
	return await Item.create(itemData, {parent: actor});
}


function evaluateRolls(r, thisActorID, colorlessBonus) {
  
  var array = r.terms[0].results;
  var resultContent = "<div class='rollTitle'>Roll to Dye!</div><div class='diceResult'>";
  
  let dice = game.actors.get(thisActorID).system.attr_dice;
  let resultIndex = 0;
  let sum = 0;
  let dyeBonus = 0;
  
  Object.keys(dice).forEach(function (item, index) {
	  if (Object.values(dice)[index].isEnabled) {
		  //Object.values(dice)[index].value = array[resultIndex].result;
		  let resultVal = 0;

		  
		  switch ((Object.values(dice)[index].isLocked)) {
			  case false:
			  if (item != game.actors.get(thisActorID).system.dyed) {
				resultVal = array[resultIndex].result;
				setProperty(game.actors.get(thisActorID),("system.attr_dice."+item+".value"), resultVal);
				//save in the back end
				diceValueUpdate(thisActorID, item, resultVal);			  
			  } else {
				resultVal = getProperty(game.actors.get(thisActorID),("system.attr_dice."+item+".value"));
				dyeBonus = getProperty(game.actors.get(thisActorID),("system.attr_dice."+item+".lvl"));
			  }

			  sum += resultVal;			  

			  let diceString = makeDiceHtml(resultVal, item, "d6");;
			  
			  resultContent += diceString;
		      break;
//############################################
			  case true:
			  //no updates needed!
			  let savedVal = getProperty(game.actors.get(thisActorID),
			  ("system.attr_dice."+item+".value"));
			  let s = "";
			  
			  s = "<i class='fa-solid fa-lock' style='color:var(--dice_"+item+")'></i>";
			  
			  switch (item) {
				case "white": 
				s = "<i class='fa-solid fa-lock' style='color:var(--dice_"+item+")' data-outline='yes'></i>";
				break;
			  }
			  
			  resultContent += s;			  
			  break;
			  
			}
			resultIndex++;
		  }	  

  });
  
  // add the extra dice
  let extraSum = -1;
  if (array.length >= resultIndex) {
	  extraSum = 0
	for (let i = resultIndex; i < array.length; i++) {
		resultContent += makeDiceHtml(array[i].result, "colorless", "d6");
		extraSum += array[i].result;
	}	
  }
  
  // lets build the sum div!
  let sumString = "</div><div class='rollTitle smallerText'> = <span style='margin: 0em 0.3em;'>"+sum+"</span>";
  if (dyeBonus > 0) {
	sumString += "+<span style='border:0.1em solid var(--dice_"+game.actors.get(thisActorID).system.dyed+");border-radius: 0.5em;margin: 0em 0.15em;padding: 0em 0.15em;'>"+dyeBonus+"</span>";
  }
  if (colorlessBonus > 0) {
	sumString += "+<span style='margin: 0em 0.3em;'>"+colorlessBonus+"</span>";
  }
  if (extraSum > 0) {
	sumString += "+<span style='border:0.1em solid var(--dice_colorless);border-radius: 0.5em;margin: 0em 0.15em;padding: 0em 0.15em;'>"+extraSum+"</span>"
  } 
  
  let totalSum = sum + dyeBonus + colorlessBonus + extraSum;
  if ((dyeBonus + colorlessBonus + extraSum) > 0) {
	sumString += "</div><div class='rollTitle smallerText' style='font-weight: 700;border: none;background-color: var(--sentimentMidBG);'> = "+totalSum+"</div>";
	resultContent += sumString;
  } else {
	resultContent += "</div><div class='rollTitle smallerText'> = "+sum+"</div>";
  }
    
  return resultContent;
}

function makeDiceHtml(resultVal, color, diceType) {
//making the html
	let diceString = "class='fa-solid fa-dice'";
	
	if (diceType == "d6") {
	switch (resultVal) {
		case 1:
		diceString = "class='fa-solid fa-dice-one'";
		break;
		
		case 2:
		diceString = "class='fa-solid fa-dice-two'";
		break;
		
		case 3:
		diceString = "class='fa-solid fa-dice-three'";
		break;
		
		case 4:
		diceString = "class='fa-solid fa-dice-four'";
		break;
		
		case 5:
		diceString = "class='fa-solid fa-dice-five'";
		break;
		
		case 6:
		diceString = "class='fa-solid fa-dice-six'";
		break;
		
		default:
		diceString = "class='fa-solid fa-square-heart'";
		break;
	}
	} else {
		diceString = "class='fa-thin fa-dice-d20'";	
	}
	
	let spanTitle = "<span data-title='"+resultVal+"'>";
	
	if (parseInt(resultVal, 10) >= 10) {
		spanTitle = "<span data-long='true' data-title='"+resultVal+"'>";
	}
	
	
	
	if (color == "white") {
		diceString = spanTitle+"<i "+diceString+" style='color:var(--dice_"+color+")' data-outline='yes'></i></span>";
	} else if(resultVal == 0) {
		diceString = "";
	} else {
		diceString = spanTitle+"<i "+diceString+" style='color:var(--dice_"+color+")'></i></span>";
	}
	return diceString;
}

function makeNumberHtml(resultVal) {	
	let numberString = "<p>"+resultVal+"</p>";	
	
	if (resultVal > 0) {
		numberString = "<p>+"+resultVal+"</p>";
	}
	
	if (resultVal == 0 || !resultVal) {
		numberString = "";
	}
	return numberString;

  }

/**
 * dye roll: roll all dice
 * @param {String} thisActorID - The name of the character passed in as a string from actor-sheet.js
*/
function dyeRoll(thisActorID) {
   
   let dice = game.actors.get(thisActorID).system.attr_dice;
   let rollAmount = 0;
   
   //function determines how many dice we're rolling. 

   new Dialog({
	   title: "Any bonuses or extra dice?",
	   content: "<div class='sentimentDialog'><p>Bonuses:<input id='bonusVal' type='number' value='0'/></p><p>Extra dice:<input id='bonusDice' type='number' value='0'/></p></div>",
	   buttons: {
		   confirm: {
			   label: "Confirm",
			   callback: () => {
					let bonus = parseInt($('input#bonusVal').val(),10);
					rollAmount = parseInt($('input#bonusDice').val(),10);
					
					Object.keys(dice).forEach(function (item, index) {
						if (Object.values(dice)[index].isEnabled) {
						rollAmount++;
					}
					});
					makeRole(rollAmount+"d6", thisActorID, bonus);
			   }
	   }
	   }
	
   }).render(true);
}
// ############################################################

function doRoll(thisActorID, color) {

	if (color == "colorless") {
	var diceAmount = 1;	
	   new Dialog({
		   title: "Extra d6!",
		   content: "<div class='sentimentDialog'>How many d6?<br><input id='amountVal' type='number' value='1'/></div>",
		   buttons: {
			   confirm: {
				   label: "Confirm",
				   callback: () => {
					   diceAmount = $('input#amountVal').val();
					   x(diceAmount+"d6", thisActorID, color);
				   }
		   }
		   }
		
	   }).render(true);
	} else {
		x("1d6", thisActorID, color);
		
	}
	
	function x (diceString, c, color) {
	   new Dialog({
		   title: "Roll bonuses!",
		   content: "<div class='sentimentDialog'>Any bonuses?<br><input id='bonusVal' type='number' value='0'/></div>",
		   buttons: {
			   confirm: {
				   label: "Confirm",
				   callback: () => {
					   let bonus = parseInt($('input#bonusVal').val(),10);
					   rollOnce(diceString, c, color, bonus);
				   }
		   }
		   }
		
	   }).render(true);		
	}

}

async function rollOnce(diceString, thisActorID, color, bonus) {
	
  let colorTitle = getProperty(game.actors.get(thisActorID), ("system.attr_dice."+color+".title"));
  if (!colorTitle) { colorTitle = "colorless" };
  
  let chatTemplate = "<div class='rollTitle' style='border-image: none; border-color: var(--dice_"+color+")'>Roll to Do!</div>";
  chatTemplate += "<div class='colorTitle' style='border-color: var(--dice_"+color+")'>"+colorTitle+"</div>"; 
  let val = 0;
  let roll = await new Roll(diceString).roll();
  let rollD20 = await new Roll("1d20").roll();
  
  //dice so nice
  
  let val20 = rollD20.terms[0].results[0].result;
  let multiArray = [];
	
  if (colorTitle == "colorless") {
	  multiArray = colorlessMulti(roll.terms[0].results);
	  
  }  
  
  if ((game.actors.get(thisActorID).system.dyed) != color) {
	  //if its not the dyed color
	  val = roll.terms[0].results[0].result;  
	  setProperty(game.actors.get(thisActorID),
	  ("system.attr_dice."+color+".value"), val);  
	  diceValueUpdate(thisActorID, color, val);    
  } else {
		  //youre dyed!
	  val = getProperty(game.actors.get(thisActorID),
	  ("system.attr_dice."+color+".value"));
	  chatTemplate += "<div class='dyedAnnounce'>"+game.actors.get(thisActorID).name+" is currently DYED "+color+"!</div>";
  }
  
  let sum = parseInt(val, 10) + parseInt(bonus, 10) + val20;
  let diceHtml = makeDiceHtml(val, color, "d6");
  
  if (colorTitle == "colorless") {
	sum = 0;
	diceHtml = "";
	$(multiArray).each( function (index, item) {
		sum += parseInt(item, 10);
		diceHtml += makeDiceHtml(item, "colorless", "d6");
	});
	sum += parseInt(bonus, 10) + parseInt(val20, 10);

  }
  
  let attrLvl = getProperty(game.actors.get(thisActorID),("system.attr_dice."+color+".lvl"));

  chatTemplate += "<div class='diceResult'>"+
  "<p>[</p>"+makeDiceHtml(val20, "colorless", "d20")+"<p>]</p>"+
  ""+diceHtml+""+makeNumberHtml(bonus)+""+makeNumberHtml(attrLvl)+"</span></div>";
  
  chatTemplate += "<div class='rollTitle smallerText' style='border-image: none;border-color: var(--dice_"+color+")'> = "+sum+"</div>";  
  
  let actorName = getProperty(game.actors.get(thisActorID), "name");
 
  let msg = new ChatMessage({
	type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    content: chatTemplate,
    roll: roll,
    speaker: { alias: actorName },
  });
  
  if (game.dice3d && (game.settings.get('core', 'rollMode') == "publicroll")) {
	game.dice3d.showForRoll(rollD20, game.user, true);
  } else if (game.dice3d) {
	game.dice3d.showForRoll(rollD20, game.user, false);
  }
	  
  ChatMessage.create(msg);
}

function colorlessMulti(resultArray) {
	let array = [];
	$(resultArray).each( function (index, item) {
		array[index] = item.result;
	});
	return array;
}

export { dyeRoll, doRoll };