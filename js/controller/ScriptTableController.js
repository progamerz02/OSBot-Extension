const ScriptTableController = function () {
  // Message listener
  function onMessage(e) {
    var scriptId = 0;
    var action = "";
    var scriptRow = null;
    if (e.source === window) {
      scriptId = e.data["scriptId"];
      action = e.data["action"];

      if (Number.isInteger(scriptId)) {
        scriptRow = tScriptTable.getRow(scriptId);
      } else {
        scriptRow = tScriptTable.getAllRows();
      }

      switch (action) {
        case "sales-users":
          showSalesUsers(scriptRow);
          break;
        case "sales-profit":
          showSalesProfit(scriptRow);
          break;
        case "sales-latest":
          showSalesLatest(scriptRow);
          break;
        case "sales-renewals":
          showSalesRenewals(scriptRow);
          break;
        case "trial-total":
          showTrialTotal(scriptRow);
          break;
        case "trial-active":
          showTrialActive(scriptRow);
          break;
        case "trial-expired":
          showTrialExpired(scriptRow);
          break;

        case "all-sales-users":
          showAllSalesUsers(scriptRow);
          break;
        case "all-sales-profit":
          showAllSalesProfit(scriptRow);
          break;
        case "all-sales-latest":
          showAllSalesLatest(scriptRow);
          break;
        case "all-sales-renewals":
          showAllSalesRenewals(scriptRow);
          break;
        case "all-trial-total":
          showAllTrialTotal(scriptRow);
          break;
        case "all-trial-active":
          showAllTrialActive(scriptRow);
          break;
        case "all-trial-expired":
          showAllTrialExpired(scriptRow);
          break;

        case "stacktrace":
          showStacktrace(scriptRow);
          break;

        case "add-trial":
          showAddTrial(scriptRow);
          break;
      }
    }
  }

  // Script row

  function showAddTrial(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var scriptId = scriptRow.dataset.scriptId;
    var trialTime = parseInt(
      scriptRow.querySelector(`input[name="trial-time-${scriptId}"]`).value ||
        localStorage.getItem(`trial-time-${scriptId}`)
    );
    // Try obtain from field. If doesn't work, try get it from local cache.

    tPopup.set(
      `${scriptName} (${trialTime} Hours)`,
      512,
      256,
      tNewTrial.html,
      async function (e) {
        var selectedUsers = tNewTrial.getSelectedUsers();

        tPopup.setContents();
        if (selectedUsers && selectedUsers.length > 0) {
          for (let i = 0; i < selectedUsers.length; i++) {
            await addTrialAndNotifyUser(
              scriptRow.dataset,
              selectedUsers[i],
              trialTime
            );
          }

          //selectedUsers.forEach(user => addTrialAndNotifyUser(scriptRow.dataset, user, trialTime));
        } else {
          await addTrialForSelf(scriptId);
        }

        tPopup.hide();
        tScriptTable.reload();
      }
    );

    tNewTrial.validate();
    tPopup.show();
  }

  function showSalesUsers(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var data = scriptRow.dataset.salesRecords;
    data = ChartUtil.generateUserLineChart(data);
    data = JSON.stringify(data);
    tPopup.set(
      scriptName,
      650,
      650,
      prepareIFrameChart(tLineChart, {
        "chart.title": `Users for ${scriptName}`,
        "chart.sub-title": "Purchases and refunds by month",
        "chart.data": data,
        "chart.xAxis": "Date (by month)",
        "chart.yAxis": "Number of new customers",
        "chart.width": "650px",
        "chart.height": "650px",
      })
    );
    tPopup.show();
  }

  function showSalesProfit(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var data = scriptRow.dataset.salesRecords;
    data = ChartUtil.generateSalesMaterialBarChart(data);
    data = JSON.stringify(data);
    tPopup.set(
      scriptName,
      "100%",
      650,
      prepareIFrameChart(tMaterialBarChart, {
        "chart.title": `Transactions for ${scriptName}`,
        "chart.sub-title": "Purchases and refunds by month",
        "chart.data": data,
        "chart.xAxis": "Scripts",
        "chart.yAxis": "Customers",
        "chart.width": "100%",
        "chart.height": "650px",
      })
    );
    tPopup.show();
  }

  function showSalesLatest(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var data = scriptRow.dataset.salesRecords;
    data = ChartUtil.generateSalesMaterialBarChart(data, (sale) => sale.latest);
    data = JSON.stringify(data);
    tPopup.set(
      scriptName,
      "100%",
      650,
      prepareIFrameChart(tMaterialBarChart, {
        "chart.title": `Latest Transactions for ${scriptName}`,
        "chart.sub-title": "Purchases, refunds, and renewals by month",
        "chart.data": data,
        "chart.xAxis": "Scripts",
        "chart.yAxis": "Customers",
        "chart.width": "100%",
        "chart.height": "650px",
      })
    );
    tPopup.show();
  }

  function showSalesRenewals(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var data = scriptRow.dataset.salesRecords;
    data = ChartUtil.generateRenewalsLineChart(data, (r) => r.renewal);
    data = JSON.stringify(data);
    tPopup.set(
      scriptName,
      650,
      650,
      prepareIFrameChart(tLineChart, {
        "chart.title": `Renewals for ${scriptName}`,
        "chart.data": data,
        "chart.xAxis": "Scripts",
        "chart.yAxis": "Renewals",
        "chart.width": "650px",
        "chart.height": "650px",
      })
    );
    tPopup.show();
  }

  function showTrialTotal(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var trials = JSON.parse(scriptRow.dataset.trialRecords);
    if (trials) {
      preparePopupForTrials(`All Trials for ${scriptName}`, scriptRow, trials);
      tPopup.show();
    }
  }

  function showTrialActive(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var trials = JSON.parse(scriptRow.dataset.trialRecords);
    if (trials) {
      trials = trials.filter((trial) => !trial.expired);
      preparePopupForTrials(
        `Active Trials for ${scriptName}`,
        scriptRow,
        trials
      );
      tPopup.show();
    }
  }

  function showTrialExpired(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var trials = JSON.parse(scriptRow.dataset.trialRecords);
    if (trials) {
      trials = trials.filter((trial) => trial.expired);
      preparePopupForTrials(
        `Expired Trials for ${scriptName}`,
        scriptRow,
        trials
      );
      tPopup.show();
    }
  }

  // All script rows ("arguments")

  function showAllSalesUsers(scriptRows) {
    var html = "";

    var rows = scriptRows
      .filter((tr) => Boolean(tr.dataset.salesRecords))
      .map((tr) =>
        Object.assign({
          name: tr.dataset.scriptName,
          data: tr.dataset.salesRecords,
        })
      );

    // Line chart

    data = ChartUtil.consolidateForDataUserArray(rows);
    data = JSON.stringify(data);

    html += prepareIFrameChart(tLineChart, {
      "chart.title": "Users for all Scripts",
      "chart.data": data,
      "chart.xAxis": "Scripts",
      "chart.yAxis": "Customers",
      "chart.width": "650px",
      "chart.height": "650px",
    });

    // Pie chart

    data = ChartUtil.processForCustomerPieChart(rows, (r) => !r.renewal);
    data = JSON.stringify(data);

    html += prepareIFrameChart(tPieChart, {
      "chart.title": "Users for all Scripts",
      "chart.data": data,
      "chart.width": "650px",
      "chart.height": "650px",
    });

    // Render

    tPopup.set("All Users", 1300, 650, html);
    tPopup.show();
  }

  function showAllSalesProfit(scriptRows) {
    var html = "";

    var rows = scriptRows
      .filter((tr) => Boolean(tr.dataset.salesRecords))
      .map((tr) =>
        Object.assign({
          name: tr.dataset.scriptName,
          data: tr.dataset.salesRecords,
        })
      );

    var data = ChartUtil.generateAllSalesMaterialBarChart(rows);

    tPopup.set(
      "All Transactions",
      "100%",
      650,
      prepareIFrameChart(tMaterialBarChart, {
        "chart.title": `All Transactions`,
        "chart.sub-title": "All purchases and refunds by month",
        "chart.data": JSON.stringify(data),
        "chart.xAxis": "Date (by month)",
        "chart.yAxis": "Number of new customers",
        "chart.width": "100%",
        "chart.height": "650px",
      })
    );

    tPopup.show();
  }

  function showAllSalesLatest(scriptRows) {
    var html = "";

    var rows = scriptRows
      .filter((tr) => Boolean(tr.dataset.salesRecords))
      .map((tr) =>
        Object.assign({
          name: tr.dataset.scriptName,
          data: tr.dataset.salesRecords,
        })
      );

    var data = ChartUtil.generateAllSalesMaterialBarChart(
      rows,
      (sale) => sale.latest
    );

    tPopup.set(
      "All Transactions",
      "100%",
      650,
      prepareIFrameChart(tMaterialBarChart, {
        "chart.title": `All Transactions`,
        "chart.sub-title": "All purchases and refunds by month",
        "chart.data": JSON.stringify(data),
        "chart.xAxis": "Date (by month)",
        "chart.yAxis": "Number of new customers",
        "chart.width": "100%",
        "chart.height": "650px",
      })
    );

    tPopup.show();
  }

  function showAllSalesRenewals(scriptRows) {
    var html = "";

    var rows = scriptRows
      .filter((tr) => Boolean(tr.dataset.salesRecords))
      .map((tr) =>
        Object.assign({
          name: tr.dataset.scriptName,
          data: tr.dataset.salesRecords,
        })
      );

    // Line chart
    data = ChartUtil.consolidateForDataUserArray(rows, (r) => r.renewal);
    data = JSON.stringify(data);

    html += prepareIFrameChart(tLineChart, {
      "chart.title": "Renewals for all Scripts",
      "chart.data": data,
      "chart.xAxis": "Scripts",
      "chart.yAxis": "Customers",
      "chart.width": "650px",
      "chart.height": "650px",
    });

    // Pie chart

    data = ChartUtil.processForCustomerPieChart(rows, (r) => r.renewal);
    data = JSON.stringify(data);

    html += prepareIFrameChart(tPieChart, {
      "chart.title": "Renewals for all Scripts",
      "chart.data": data,
      "chart.width": "650px",
      "chart.height": "650px",
    });

    // Render

    tPopup.set("All Renewals", 1300, 650, html);
    tPopup.show();
  }

  function showAllTrialTotal(scriptRows) {
    console.debug("Unsupported feature - maybe implemented in the future :)");
  }

  function showAllTrialActive(scriptRows) {
    console.debug("Unsupported feature - maybe implemented in the future :)");
  }

  function showAllTrialExpired(scriptRows) {
    console.debug("Unsupported feature - maybe implemented in the future :)");
  }

  // Other

  function showStacktrace(scriptRow) {
    var scriptName = scriptRow.dataset.scriptName;
    var stacktraceCode = scriptRow.dataset.stacktraceCode;
    var stacktrace = scriptRow.dataset.stacktrace;
    if (stacktraceCode && stacktrace) {
      tPopup.set(`Reverse Stacktrace - ${scriptName}`, 650, 350);
      tPopup.show();
      Stacktrace.get(stacktraceCode, stacktrace)
        .then(preparePopupForReverseStacktrace)
        .catch(preparePopupForReverseStacktrace);
    }
  }

  /*
   * Prepare functions
   */

  /**
   * Creates an iFrame with pre-defined contents.
   */
  function prepareIFrameChart(chartTemplate, data) {
    return `<iframe src="data:text/html;charset=utf-8,${escape(
      chartTemplate.prepare(data)
    )}" width="${data["chart.width"]}" height="${
      data["chart.height"]
    }"></iframe>`;
  }

  /**
   * Creates a trial row.
   */
  function preparePopupForTrials(title, scriptRow, trials) {
    var scriptId = scriptRow.dataset.scriptId;
    var trialTime = parseInt(
      scriptRow.querySelector(`input[name="trial-time-${scriptId}"]`).value ||
        localStorage.getItem(`trial-time-${scriptId}`)
    );
    tPopup.set(title, 350, 650, tTrialContainer.html, async function () {
      var action = tTrialContainer.getSelectedAction();
      var selectedUsers = tTrialContainer.getSelectedUsers();
      if (action && selectedUsers && selectedUsers.length > 0) {
        tPopup.setContents();
        switch (action) {
          case "reset":
            await resetTrials(scriptRow.dataset, selectedUsers, trialTime);
            break;
          case "remove":
            await removeTrials(scriptRow.dataset, selectedUsers);
            break;
        }
        tPopup.hide();
        tScriptTable.reload();
      }
      return false;
    });
    if (tTrialContainer.validate()) {
      // Sort so your trial record appears at the top of the list
      trials.sort(
        (a, b) =>
          (a.userId === ipsSettings.memberID) +
          (b.userId === ipsSettings.memberID)
      );
      for (let i = 0; i < trials.length; i++) {
        tTrialContainer.addTrial(trials[i]);
      }
    }
  }

  /**
   * Prepares popup for reverse stacktrace.
   */
  function preparePopupForReverseStacktrace(text) {
    tPopup.setContents(`<textarea readonly>${text}</textarea>`);
  }

  return {
    onMessage: onMessage,
  };
};
