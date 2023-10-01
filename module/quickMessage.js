export function quickMessage(speaking, content, msgType) {
	
	let template = "<div class='sentimentMessage' data-msgType="+msgType+">"+content+"</div>";	
	ChatMessage.create({
		content: template,
		speaker: { alias: speaking },
	});
}