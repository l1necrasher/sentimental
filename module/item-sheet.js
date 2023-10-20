/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SentimentalItemSheet extends ItemSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["sentimental", "sheet", "item"],
			template: "systems/sentimental/templates/item-sheet.html",
			width: 620,
			height: 600,
		});
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);
	
	if(this.item.type !== 'bond') {
		let div = $(html).find(".bondmate");
		$(div).toggle(false);
	} else {
		$(html).find(".sheet-header img.profile-img").toggle(false);
		
		let bondmate = game.actors.get(getProperty(this.item,"system.bondmate"));
		let profileImg = $(html).find("img.bondmate");
		let nameSpan = $(html).find("span.bondmateName");
		
		$(profileImg).attr('src', getProperty(bondmate, "img"));
		$(nameSpan).text(getProperty(bondmate, "name"));
		
	}

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
	
	}
  /* -------------------------------------------- */

}
