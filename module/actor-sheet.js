import { dyeRoll, doRoll } from "./sentimental.js";
import { quickMessage } from "./quickMessage.js";
import {
	enabledUpdate,
	lockedUpdate,
	swingUpdate,
	diceValueUpdate,
	healthValueUpdate
	} from "./updateFunctions.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SentimentalActorSheet extends ActorSheet {
	
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
	  classes: ["sentiment", "sheet", "actor"],
      template: "systems/sentimental/templates/actor-sheet.html",
      width: 600,
      height: 800,
	  tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "dice"}],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }
	

  //stealing from boilerplate here
  /** @override */
  getData() {
    const data = super.getData();
    data.system = this.actor.system;
	// seperate items for access	
	const gifts = [];
	const bonds = [];
    
	for (let i of data.items) {
		switch (i.type) {
			case 'gift':
			gifts.push(i);
			break;
			case 'bond':
			bonds.push(i);
			break;		
		}	
	}
	
	data.gifts = gifts;
	data.bonds = bonds;	
	
    return data;	
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

	var thisActorID = $(html)
      .find(".sheet-header").attr('data-ident');
	
	var actorName = getProperty(game.actors.get(thisActorID),("name"));
	
	
	//prepare sheet
	prepSheet(thisActorID); 
	
	if (!this.options.editable) return;
	
	$(html).find("button#dyeRoll").click(() => {
		// make the roll
      dyeRoll(thisActorID);
	  setTimeout(function () {
		updateSheetValues(thisActorID);
		}
	  , 1);  
	});
	
	$(html).find("button.diceVal").click(() => {
		// make the roll
		let color = $(event.target).parents("li").attr('id');
		
		doRoll(thisActorID, color);
		
		setTimeout(function () {
			updateSheetValues(thisActorID);
		}
	  , 1);
	});

	//rollable Macros
	$(html).find("button.rollMacro").click(() => {
		// make the roll
		let color = $(event.target).attr('data-color');
		let dice = getProperty(game.actors.get(thisActorID),("system.attr_dice."+color));
		
		const macros = game.user.getHotbarMacros();
		$(macros).each( function (i, element) {
			if (!element.macro) {
				createDiceMacro(thisActorID,dice, element.slot);
				return false
			}
		});
		// Create the macro command	

	});
	
	async function createDiceMacro(cName, dice, slot) {
		const command = "game.sentimental.doRoll('"+cName+"', '"+dice.id+"')"
		let macro = game.macros.find(m => (m.name === dice.name) && (m.command === command));
		if (!macro) {
			macro = await Macro.create({
				name: dice.id,
				type: "script",
				img: dice.img,
				command: command,
			});
		}
		game.user.assignHotbarMacro(macro, slot);	
	}
	
	//updating the character sheet!
	function updateSheetValues(thisActorID) {
		let dice = game.actors.get(thisActorID).system.attr_dice;
		let nameArray = Object.keys(dice);		
		//for each available color...		
		nameArray.forEach((item, index) => {
			//if the color is enabled...
			if (Object.values(dice)[index].isEnabled) {
				//set the html element to the value in the JSON.
				$(html).parents(".app").find("[name='system.attr_dice."+item+".value']").html(Object.values(dice)[index].value);
				
			};
		});
		//console.log(dice);
	
	//$(html).parents(".app").find(".red_value").html(value);
	}
	
	function prepSheet(c) {
		// toggle Enabled
		let colorArray =  $(html).find("ol#attrDiceList").children();
		let settingsArray =  $(html).find("ol#settingsList").children();
		//jQuery.makeArray(colorArray);
				
		for (var i = 0; i < 9; i++) {
			let current = colorArray[i];
			let checkbox = settingsArray[i];
			
			let color = $(current).attr("id");
			let isEnabled = getProperty(game.actors.get(c),("system.attr_dice."+color+".isEnabled"));			
			let isLocked = getProperty(game.actors.get(c),("system.attr_dice."+color+".isLocked"));			
			
			//if is enabled....
			if (isEnabled) {
				//set to TRUE
				$(checkbox).find("i#enabledImg").attr('class',"fa-solid fa-check");
				$(current).find("input.colorTitle").removeAttr("disabled");
				//visible
				$(current).css("display","flex");
			} else {
				//set to FALSE
				$(checkbox).find("i#enabledImg").attr('class',"fa-solid fa-xmark");
				$(current).find("input.colorTitle").attr("disabled","disabled");
				//not visible
				$(current).css("display","none");
			}

			//if is locked....
			if (isLocked) {
				//set to TRUE
				$(current).find("i#lockedImg").attr('class',"fa-solid fa-lock");
				$(current).find("button.diceVal").attr('disabled', 'disabled');

			} else {
				//set to FALSE
				$(current).find("i#lockedImg").attr('class',"fa-solid fa-lock-open");
				$(current).find("button.diceVal").removeAttr("disabled");

			}
			};
			
			//swing			
			let color = getProperty(game.actors.get(c),"system.dyed");
			let display = $(html).find("span#swingStatus");
		
			if (color) {		
				display.css("background-color","var(--dice_"+color+")");
				display.css("color","var(--dice_contrast-"+color+")");
				display.html("dyed "+color+"!");
			} else {
				display.css("background-color","var(--sentimentLightBG)");
				display.css("color","var(--sentimentDarkBG)");
				display.html("colorless");
			}
			
			//bond images
			let ol = $(html).find("ol#bondList img.itemImg");
			$(ol).each(function (i, img) {
				let itemID = $(img).attr('data-ident');
				let currentActor = game.actors.get(c);
				let bondID = getProperty(currentActor.items.get(itemID), "system.bondmate");
				let image = getProperty(game.actors.get(bondID), "img");		
				$(img).attr('src', image);
			});

	}
	
		
	
	$(html).find("a.linkIsEnabled").on('click', event => {
		// toggle Enabled
		let color = $(event.target).parents("li").attr('id');
		let container = $(html).find("ol#attrDiceList").children("#"+color);
		
		setProperty(game.actors.get(thisActorID),
			("system.attr_dice."+color+".isEnabled"),
				!(
				getProperty(game.actors.get(thisActorID),
				("system.attr_dice."+color+".isEnabled"))
				)
			);
			
		let isEnabled = getProperty(game.actors.get(thisActorID),("system.attr_dice."+color+".isEnabled"));		
		
		//OK FINE ILL DO IT MANUALLY
		enabledUpdate(thisActorID, color, isEnabled);
			
	});
	
	$(html).find("a.linkIsLocked").on('click', event => {
		// toggle Enabled
		let color = $(event.target).parents("li").attr('id');
		let container = $(html).find("ol#attrDiceList").children("#"+color);
		
		setProperty(game.actors.get(thisActorID),
			("system.attr_dice."+color+".isLocked"),
				!(
				getProperty(game.actors.get(thisActorID),
				("system.attr_dice."+color+".isLocked"))
				)
			);
			
		let isLocked = getProperty(game.actors.get(thisActorID),("system.attr_dice."+color+".isLocked"));		
		
		lockedUpdate(thisActorID, color, isLocked);
			
	});
	
	$(html).find("span#swingStatus").on('click', event => {
		setProperty(game.actors.get(thisActorID),("system.dyed"), "");
		swingUpdate(thisActorID, "");
		updateDyeImage("colorless", game.actors.get(thisActorID).getActiveTokens(true));
		quickMessage(actorName,
		"<p>"+actorName+" dropped their Swing!</p>",
		"swing");
	});	
	
	//manually set swing
	$(html).find("button.setSwingMan").on('click', event => {		
		let color = $(event.target).attr('data-color');
		let c = game.actors.get(thisActorID);
		let display = $(html).find("span#swingStatus");
		let value = 0;
		
	   new Dialog({
		   title: "Set your Swing",
		   content: "<div class='sentimentDialog' What value?<br><input id='swingVal' type='number' value='1'/></div>",
		   buttons: {
			   confirm: {
				   label: "Confirm",
				   callback: () => {					   
					   
						value = parseInt($('input#swingVal').val(), 10);
						
						setProperty(c,("system.dyed"), color);		
						setProperty(c,("system.attr_dice."+color+".value"), value);		

						display.css("background-color","var(--dice_"+color+")");
						display.css("color","var(--dice_contrast-"+color+")");
						display.html("dyed "+color+"!");
						quickMessage(actorName,
						"<p>"+actorName+" just <b>manually</b> swung <b style='border-color: var(--dice_"+color+")'>"+color+"</b> with a value of "+getProperty(c, "system.attr_dice."+color+".value")+"!</p>",
						"swing");


						swingUpdate(thisActorID, color);
						diceValueUpdate(thisActorID, color, value);
						updateDyeImage(color, game.actors.get(thisActorID).getActiveTokens(true));
				   }
		   }
		   }
		


		}).render(true);
	});


	$(html).find("a.linkIsSwing").on('click', event => {
		// set dye
		let color = $(event.target).parents("li").attr('id');
		let c = game.actors.get(thisActorID);
		let display = $(html).find("span#swingStatus");
		
		if (color) {
			setProperty(c,("system.dyed"), color);
		
			display.css("background-color","var(--dice_"+color+")");
			display.css("color","var(--dice_contrast-"+color+")");
			display.html("dyed "+color+"!");
			swingUpdate(thisActorID, color);
			quickMessage(actorName,
				"<p>"+actorName+" just swung <b style='border-color: var(--dice_"+color+")'>"+color+"</b> with a value of "+getProperty(c, "system.attr_dice."+color+".value")+"!</p>",
				"swing");
		} else {
			setProperty(c,("system.dyed"), "");
			display.css("background-color","var(--sentimentLightBG)");
			display.css("color","var(--sentimentDarkBG)");
			display.html("colorless");
			swingUpdate(thisActorID, "");
		}
		
		updateDyeImage(color, game.actors.get(thisActorID).getActiveTokens(true));
		
	});
	
	
	
	function updateDyeImage(color, tokens) {
		if (tokens.length == 0) return;
		
		//set up the dice image
		let dyeImg = getProperty(game.actors.get(thisActorID), "system.attr_dice."+color+".img");
		
		//if its not a dice color, just use the image
		if (!color || color == "colorless") {
			dyeImg = getProperty(game.actors.get(thisActorID), "img");
		}
		
		//only proceed when there's an actual image
		let isImage = true;
		if (!dyeImg) {
				isImage = false;
		}
		
		//change the image to the dyed one
		const updates = [];
		if (isImage) {
			tokens.forEach(function (item, i) {
				updates.push({
					_id: item.document._id,
					img: dyeImg				
				});			
			});
			canvas.scene.updateEmbeddedDocuments("Token", updates);
		}
	}
	
	
	
	$(html).find("span.healthInput e").on('click', event => {
	   new Dialog({
	   title: "Max Health Settings",
	   content: "<div class='sentimentDialog'>Change maximum Health to: <input id='healthMax' type='number' value=''/></div>",
	   buttons: {
		   confirm: {
			   label: "Confirm",
			   callback: () => {
				let val = $('input#healthMax').val();
				setProperty(game.actors.get(thisActorID),
				("system.healthMax"), val);
				healthValueUpdate(thisActorID, true, val);
			   }
	   }
	   }
	
   }).render(true);
			
	});
	
	$(html).find("a#igniteSwing").on('click', event => {
		let swingDisplay = $(html).find("span#swingStatus");
		let color = getProperty(game.actors.get(thisActorID),
				("system.dyed"));
		let string = actorName+" ignites "+color+"!";
		if (!color) {
			string = actorName+" ignites!";
		}
		quickMessage(actorName, ("<i class='fa-duotone fa-fire' style='color:var(--dice_"+color+")'></i> "+string+" <i class='fa-duotone fa-fire' style='color:var(--dice_"+color+")'></i><p>Dice placed in Lock-out. Remember to Roll-to-Dye once without it!</p>"), "ignite");
		
		if (color) {
			setProperty(game.actors.get(thisActorID),
				("system.attr_dice."+color+".isLocked"), true);			
			lockedUpdate(thisActorID, color, true);
			
			//then drop swing
			setProperty(game.actors.get(thisActorID),("system.dyed"), "");
			$(swingDisplay).css("background-color","var(--sentimentLightBG)");
			$(swingDisplay).css("color","var(--sentimentDarkBG)");
			$(swingDisplay).html("colorless");
			swingUpdate(thisActorID, "");
			updateDyeImage("colorless", game.actors.get(thisActorID).getActiveTokens(true));
		}
		
	});
	
	// just do a diceless roll
	$(html).find("button#justRoll").on('click', event => {
		doRoll(thisActorID, "colorless");
	});

// # # # # # # # # # # #--GIFTS STUFF--# # # # # # # # # # # # # # # # # # #
	
	// add Gift
	$(html).find("a.giftCreate").on('click', event => {
		let data = duplicate((event.currentTarget).dataset);
		createGift(game.actors.get(thisActorID), data);
	});
	
	/* OLD ID BASED BOND CREATION
	$(html).find("a.bondCreate").on('click', event => {
		let data = duplicate((event.currentTarget).dataset);
		
		let mate = "";
		
		new Dialog({
		title: "set bondmate",
		content: "<div class='bondmateDialog'> enter id:<br><input id='bondID' class='droppable' type='text' value=''/></div>",
		buttons: {
		   confirm: {
			   label: "Confirm",
			   callback: () => { 
				   let bondmateID = $('input#bondID').val();
				   mate = game.actors.get(bondmateID);
				   createBond(this.actor, data, mate);
			   }
			}
		}
		}).render(true);

	});*/
	
	async function createGift(actor, data) {
		let itemData = {
			name: "new Gift",
			type: "gift",
			data: data
		}
		return await Item.create(itemData, {parent: actor});
	}
	
	$(html).find("a.openItemSheet").on('click', event => {
		let id = $(event.target).attr('data-ident');
		let item = game.actors.get(thisActorID).items.get(id);
		item.sheet.render(true);
		
	});
	
	$(html).find("a.deleteItem").on('click', event => {
		let id = $(event.target).attr('data-ident');
		let li = $(event.target).parents('li');
		let item = game.actors.get(thisActorID).items.get(id);
		li.slideUp(150, function() {
			item.delete();
		});

		
	});
	
	//fix the description
	let ol = $(html).find("ol#giftList").children("li");
	$(ol).each(function (i, li) {
		let descContainer = $(li).find("div.giftDesc");
		let newString = $.parseHTML(descContainer.text());
		descContainer.html(newString);
		descContainer.slideUp();
	});

	$(html).find("div.toggleContent").on('click', event => {
		let container = $(event.target).children("div.giftDesc, div.toToggle");
		$(container).slideToggle(150);
	});
	
  }  

}
