/**
 * Manage private messaging on OSBot.
 */
const DirectMessage = (function() {
	'use strict';
	
	// Constants
	const URL = 'https://osbot.org/forum/messenger/compose/';
	
	// Interact with OSBot server
	
	async function compose(recipient, subject, message) {
		var hiddenFieldValues = await getHiddenValues();
		return rawCompose(encodeURIComponent(formatRecipient(recipient)),
						  encodeURIComponent(subject),
						  encodeURIComponent(formatMessage(message)),
						  encodeURIComponent(hiddenFieldValues['csrfKey']),
						  encodeURIComponent(hiddenFieldValues['MAX_FILE_SIZE']),
						  encodeURIComponent(hiddenFieldValues['plupload']),
						  encodeURIComponent(hiddenFieldValues['messenger_content_upload']));
	}
	
	function rawCompose(recipient, subject, message, csrfKey, maxFileSize, plUpload, messengerContentUpload, messengerToOriginal = '') {
		return send({
			url: URL,
			type: 'POST',
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
			data: `form_submitted=1&csrfKey=${csrfKey}&MAX_FILE_SIZE=${maxFileSize}&plupload=${plUpload}&messenger_to_original${messengerToOriginal}=&messenger_to=${recipient}&messenger_title=${subject}&messenger_content=${message}&messenger_content_upload=${messengerContentUpload}`
		});
	}
	
	function getHiddenValues() {
		return send({
			url: URL,
			type: 'GET'
		})
		.then(toHTML)
		.then(extractHiddenFields);
	}
	
	/**
	 * Get fields containing useful values
	 */
	function extractHiddenFields(html) {
		return {
			'csrfKey': html.querySelector('input[name="csrfKey"]').value,
			'MAX_FILE_SIZE': html.querySelector('input[name="MAX_FILE_SIZE"]').value,
			'plupload': html.querySelector('input[name="plupload"]').value,
			'messenger_content_upload': html.querySelector('input[name="messenger_content_upload"]').value
		};
	}
	
	/**
	 * Format the recipients data
	 */
	function formatRecipient(recipient) {
		
		if (Array.isArray(recipient)) {
			
			recipient = recipient.join('\n');
		}
		
		return recipient;
	}
	
	/**
	 * Format the content data
	 */
	function formatMessage(message) {
		
		var result = '';
		var line = '';
		
		if (!Array.isArray(message)) {
			message = [ message ];
		}
		
		for (let i = 0; i < message.length; i++) {
			
			line = message[i];
			
			/*
			if (line) {
				
				line = line.replace(/\&/g, '&amp;');
				line = line.replace(/\</g, '&lt;');
				line = line.replace(/\>/g, '&gt;');
				line = line.replace(/\"/g, '&quot;');
				line = line.replace(/\'/g, '&#39;');
				line = line.replace(/\|/g, '&#124;');
				
			} else {
				line = '&nbsp;';
			}
			*/
			
			line = `<p>${line}</p>`;
			
			result += line;
		}
		
		return result;
	}
	
	return {
		compose:compose
	};
})();