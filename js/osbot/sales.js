/**
 * Download all script transaction records.
 */
const Sales = (function() {
	
	'use strict';
	
	// Interact with OSBot server
	
	function get(mvcCode) {
		return send({
			url: `https://osbot.org/mvc/scripters/sales/${mvcCode}`,
			type: 'GET'
		})
		.then(toHTML)
		.then(getTableRows)
		.then(extractAllRowInformation);
	}
	
	// Other methods
	
	function getTableRows(html) {
		return html.querySelectorAll('table tr:nth-child(n+2):nth-last-child(n+3)');
	}
	
	/**
	 * Strip out table row information.
	 */
	function extractRowInformation(row) {
		
		var cells = row.querySelectorAll('td');
		
		return {
			row: parseInt(cells[0].innerText),
			nexusId: parseInt(cells[1].innerText),
			renewal: cells[2].innerText.startsWith('Renew'),
			estimatedProfit: parseFloat(cells[3].innerText),
			date: cells[4].innerText,
			latest: row.hasAttribute('bgcolor')
		};
	}
	
	/**
	 * Strip out all table row information.
	 */
	function extractAllRowInformation(rows) {
		return Array.from(rows).map(extractRowInformation);
	}
	
	return {
		get: get
	};
})();