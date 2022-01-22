const ChartUtil = (function() {
	
	/*
	 * Main functions
	 */
	
	function generateUserLineChart(data) {
		var sanatisedData = [ [ 'Date', 'Users' ] ];
		data = JSON.parse(data);
		data = data.filter(r => !r.renewal);
		data = convertTimestampToDate(data);
		data = groupByYearMonth(data);
		data = countByEstimatedProfitEntries(data);
		for (let key in data) {
			let value = data[key];
			sanatisedData.push([ key, value ]);
		}
		return sanatisedData;
	}
	
	function generateAllSalesMaterialBarChart(obj, filter) {
		var result = {};
		var header = [];
		//Header
		for (let k in obj) {
			let scriptName = obj[k].name;
			header.push(`${scriptName} (sales)`);
			header.push(`${scriptName} (refunds)`);
			header.push(`${scriptName} (renewals)`);
		}
		// Zero-fill
		for (let k in obj) {
			let scriptName = obj[k].name;
			let data = obj[k].data;
			let o = obj[k].data;
				o = JSON.parse(o);
				if (filter) {
					o = o.filter(filter);
				}
				o = convertTimestampToDate(o);
				o = groupByYearMonth(o);
				o = calculateCustomerPurchasesAndRefundsAndRenewalsByMonth(o);
			for (let date in o) {
				if (!result.hasOwnProperty(date)) {
					result[date] = new Array(header.length).fill(0);
				}
				result[date][header.indexOf(`${scriptName} (sales)`)] = o[date].purchases;
				result[date][header.indexOf(`${scriptName} (refunds)`)] = o[date].refunds;
				result[date][header.indexOf(`${scriptName} (renewals)`)] = o[date].renewals;
			}
		}
		result = Object.keys(result).map(key => [ key ].concat(result[key]));
		header.unshift('Date');
		result.unshift(header);
		return result;
	}
	
	function generateSalesMaterialBarChart(data, filter) {
		var sanatisedData = [ [ 'Date', 'Purchases', 'Refunds', 'Renewals' ] ];
		data = JSON.parse(data);
		if (filter) {
			data = data.filter(filter);
		}
		data = convertTimestampToDate(data);
		data = groupByYearMonth(data);
		data = calculateCustomerPurchasesAndRefundsAndRenewalsByMonth(data);
		for (let key in data) {
			let value = data[key];
			sanatisedData.push([key, value.purchases, value.refunds, value.renewals]);
		}
		return sanatisedData;
	}
	
	function generateRenewalsLineChart(data) {
		var sanatisedData = [ [ 'Date', 'Renewals' ] ];
		data = JSON.parse(data);
		data = data.filter(r => r.renewal);
		data = convertTimestampToDate(data);
		data = groupByYearMonth(data);
		data = countByEstimatedProfitEntries(data);
		for (let key in data) {
			let value = data[key];
			sanatisedData.push([ key, value ]);
		}
		return sanatisedData;
	}
	
	/*
	 * Other functions
	 */
	
	function convertTimestampToDate(arr) {
		return arr.map(r => (r.date = new Date(r.date), r));
	}

	function groupByYearMonth(arr) {
		var obj = {};
		for (let i = 0; i < arr.length; i++) {
			let r = arr[i];
			let k = `${r.date.getFullYear()}-${r.date.getMonth()+1}`;
			if (!obj.hasOwnProperty(k)) {
				obj[k] = [];
			}
			obj[k].push(r);
		}
		return obj;
	}

	function countByEstimatedProfitEntries(obj) {
		for (let key in obj) {
			let r = obj[key];
			obj[key] = r.map(r => r.estimatedProfit)
						.reduce((a, b) => a + (b > 0 ? 1 : -2), 0);
		}
		return obj;
	}
	
	function calculateCustomerPurchasesAndRefundsAndRenewalsByMonth(obj) {
		for (let key in obj) {
			let monthRecords = obj[key];
			let purchases = 0;
			let refunds = 0;
			let renewals = 0;
			for (let i = 0; i < monthRecords.length; i++) {
				let monthRecord = monthRecords[i];
				if (monthRecord.renewal) {
					renewals++;
				} else if (monthRecord.estimatedProfit > 0) {
					purchases++;
				} else {
					refunds++;
				}
			}
			obj[key] = {
				purchases: purchases,
				refunds: refunds,
				renewals: renewals
			};
		}
		return obj;
	}
	
	function consolidateForDataUserArray(obj, filter) {
		var result = {};
		var header = [];
		//Header
		for (let k in obj) {
			header.push(obj[k].name);
		}
		// Zero-fill
		for (let k in obj) {
			let name = obj[k].name;
			let data = obj[k].data;
			let o = obj[k].data;
				o = JSON.parse(o);
				if (filter) {
					o = o.filter(filter);
				}
				//o = filterOutRenewals(o);
				o = convertTimestampToDate(o);
				o = groupByYearMonth(o);
				o = countByEstimatedProfitEntries(o);
			for (let date in o) {
				if (!result.hasOwnProperty(date)) {
					result[date] = new Array(header.length).fill(0);
				}
				result[date][header.indexOf(name)] = o[date];
			}
		}
		result = Object.keys(result).map(key => [ key ].concat(result[key]));
		header.unshift('Date');
		result.unshift(header);
		return result;
	}

	function processForCustomerPieChart(obj, filter) {
		var result = {};
		var header = [ 'Script', 'Customers' ];
		// Zero-fill
		for (let k in obj) {
			let name = obj[k].name;
			let data = obj[k].data;
			let o = obj[k].data;
				o = JSON.parse(o);
				if (filter) {
					o = o.filter(filter);
				}
				//o = filterOutRenewals(o);
				o = o.map(r => r.estimatedProfit).reduce((a, b) => a + (b > 0 ? 1 : -2), 0);
			result[name] = o;
		}
		result = Object.keys(result).map(key => [ key, result[key] ]);
		result.unshift(header);
		return result;
	}

	return {
		generateUserLineChart: generateUserLineChart,
		generateRenewalsLineChart: generateRenewalsLineChart,
		generateSalesMaterialBarChart: generateSalesMaterialBarChart,
		generateAllSalesMaterialBarChart: generateAllSalesMaterialBarChart,
		
		processForCustomerPieChart: processForCustomerPieChart,
		consolidateForDataUserArray: consolidateForDataUserArray
	};
})();