export function quickMessage(speaking, content, msgType) {
	
	let id = getProperty(game.actors.getName(speaking),"id");
	
	let template = "<div class='sentimentMessage' data-msgType="+msgType+" data-senderID="+id+">"+content+"</div>";	
	ChatMessage.create({
		content: template,
		speaker: { alias: speaking },
	});
}