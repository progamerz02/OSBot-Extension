/**
 * Download and decode script build error.
 */
const Stacktrace = (function() {
	
	'use strict';
	
	// Interact with OSBot server
	
	function get(urlCode, obfuscatedStacktrace) {
		return send({
			url: `https://osbot.org/mvc/scripters/stacktrace/${urlCode}`,
			type: 'POST',
			data: `stacktrace=${encodeURIComponent(obfuscatedStacktrace)}`
		})
		.then(toHTML)
		.then(getTextArea)
		.then(getText)
		.then(formatText);
	}
	
	function getTextArea(html) {
		return html.querySelector('textarea[name="stacktraceReversed"]');
	}
	
	function getText(textArea) {
		return textArea.value;
	}
	
	function formatText(text) {
		return text.trim().split('<br>').join('\n');
	}
	
	// Exposed functions
	
	return {
		get: get
	};
	
})();