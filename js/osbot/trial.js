/**
 * Manage auths.
 */
const Trial = (function() {
	
	'use strict';
	
	// Constants
	const URL = 'https://osbot.org/mvc/scripters/auth';
	
	/**
	 * Add trial.
	 * 
	 * @param {String|Number} userId
	 * @param {String|Number} scriptId
	 * @param {String|Number} hours (default = 0)
	 * @return {Promise}
	 */
	function add(userId, scriptId, hours = 0) {
		return send({
			url: URL,
			type: 'POST',
			data: `task=addauth&memberID=${userId}&scriptID=${scriptId}&authDuration=${hours}`
		});
	}
	
	/**
	 * Remove trial.
	 * 
	 * @param {String|Number} userId
	 * @param {String|Number} scriptId
	 * @return {Promise}
	 */
	function remove(userId, scriptId) {
		return send({
			url: URL,
			type: 'POST',
			data: `task=delauth&memberID=${userId}&scriptID=${scriptId}`
		});
	}
	
	/**
	 * Load all trials
	 */
	function getAll() {
		return send({
			url: URL,
			type: 'GET'
		})
		.then(toHTML)
		.then(getTrialTableRows)
		.then(extractAllRowInformation)
		.then(includeExtraInformation)
		.then(groupTrialsByScriptIds);
	}
	
	function getTrialTableRows(html) {
		return html.querySelectorAll('table:last-child tr:not(:first-child)');
	}
	
	function extractRowInformation(row) {
		var cells = row.querySelectorAll('td');
		return {
			scriptId: parseInt(cells[0].innerHTML),
			scriptName: cells[1].innerText,
			userId: parseInt(cells[2].innerHTML),
			userName: cells[3].innerText,
			entryDate: cells[4].innerText,
			expirationDate: cells[5].innerText
		};
	}
	
	function extractAllRowInformation(rows) {
		return Array.from(rows).map(extractRowInformation);
	}
	
	function includeExtraInformation(trials) {
		
		var now = Date.now();
		var entryDate = null;
		var expirationDate = null;
		var expired = false;
		var duration = 0;
		
		for (let i = 0; i < trials.length; i++) {
			
			let trial = trials[i];
			
			// Entry date information
			entryDate = new Date(trial.entryDate);
			entryDate = entryDate.getTime();
			
			// Expiration date
			expirationDate = new Date(trial.expirationDate);
			expirationDate = expirationDate.getTime();
			
			// Durations
			duration = (expirationDate - entryDate);
			expired = (expirationDate - now) <= 0;
			
			// Adding info to trial record
			trial['duration'] = duration;
			trial['expired'] = expired;
		}
		
		return trials;
	}
	
	/**
	 * Strip out all table row information.
	 */
	function stripAllRowsOfInformation(rows) {
		
		for (let i = 0; i < rows.length; i++) {
			rows[i] = stripRowInformation(rows[i]);
		}
		
		return rows;
	}

		
	/**
	 * Group trials by script IDs
	 */
	function groupTrialsByScriptIds(trials) {
		
		var groups = {};
		var trial = {};
		var scriptId = 0;
		
		for (let i = 0; i < trials.length; i++) {
			
			trial = trials[i];
			
			scriptId = trial.scriptId;
			
			if (scriptId) {
				
				if (groups.hasOwnProperty(scriptId)) {
					
					groups[scriptId].push(trial);
					
				} else {
					
					groups[scriptId] = [ trial ];
				}
			}
		}
		
		return groups;
	}
	
	/**
	 * Group trials by renewals and new sales
	 */
	function groupTrialsByActive(groupedTrials) {
		
		for (let scriptId in groupedTrials) {
			
			let trials = groupedTrials[scriptId];
			let activeTrials = [];
			let expiredTrials = [];
			
			for (let i = 0; i < trials.length; i++) {
				
				let trial = trials[i];
				
				if (trial.expired) {
					expiredTrials.push(trial);
				} else {
					activeTrials.push(trial);
				}
			}
			
			groupedTrials[scriptId] = {
				active: activeTrials,
				expired: expiredTrials,
				all: trials
			};
		}
		
		return groupedTrials;
	}

	return {
		add:add,
		remove:remove,
		getAll:getAll
	};

})();