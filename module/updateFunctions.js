//THANK U HOOPY FOR THE CODE HELP
export function enabledUpdate(cName, color, value) {
	if (!isValidColor(color)) return
	updateActor(cName, `system.attr_dice.${color}.isEnabled`, value)
}

export function lockedUpdate(cName, color, value) {
	if (!isValidColor(color)) return
	updateActor(cName, `system.attr_dice.${color}.isLocked`, value)
}

export function swingUpdate(cName, color) {
	if (!isValidColor(color)) {
		updateActor(cName, `system.dyed`, "")
		return;
	}
	updateActor(cName, `system.dyed`, color)
}

export function diceValueUpdate(cName, color, value) {
	if (!isValidColor(color)) return
	updateActor(cName, `system.attr_dice.${color}.value`, value)
}

export function healthValueUpdate(cName, isMax, value) {
	if (isMax) {
	updateActor(cName, `system.healthMax`, value)
	} else if (!isMax) {
	updateActor(cName, `system.health`, value)
	}
}
export const colors = ['red', 'blue', 'yellow', 'orange', 'green', 'purple', 'grey', 'white', 'black']

function updateActor(cName, field, value) {
	const patch = {}
	patch[field] = value
	game.actors.get(cName).update(patch);
}

function isValidColor(color) {
	return colors.includes(color)
}