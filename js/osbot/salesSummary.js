/**
 * Download script transaction summary.
 */
const SalesSummary = (function() {
	
	'use strict';
	
	// Constants
	const URL = 'https://osbot.org/mvc/scripters/salessum';
	
	// Interact with OSBot server
	
	/**
	 * Load sale summaries.
	 */
	function getAll() {
		return send({
			url: URL,
			type: 'GET'
		})
		.then(toHTML)
		.then(getTableRows)
		.then(extractAllScriptRowsOfInformation)
		.then(reconstruct);
	}
	
	// Other methods
	
	/**
	 * Get all table rows except for the header and footer.
	 */
	function getTableRows(html) {
		return html.querySelectorAll('table tr:not(:first-child)');
	}
	
	/**
	 * Strip out table row information.
	 */
	function extractScriptRowInformation(row) {
		var cells = row.querySelectorAll('td');
		return {
			nexusId: parseInt(cells[0].innerText),
			scriptName: cells[1].innerText,
			estimatedTotalProfit: parseFloat(cells[2].innerText).toFixed(2),
			estimatedNewProfit: parseFloat(cells[3].innerText).toFixed(2)
		};
	}
	
	/**
	 * Strip out all table row information.
	 */
	function extractAllScriptRowsOfInformation(rows) {
		return Array.from(rows).map(extractScriptRowInformation);
	}
	
	/**
	 * From array to key/value object
	 */
	function reconstruct(information) {
		
		var result = {};

		information.forEach((element) => result[element.nexusId] = element);
		
		return result;
	}
	
	// Exposed functions
	
	return {
		getAll: getAll
	};
	
})();