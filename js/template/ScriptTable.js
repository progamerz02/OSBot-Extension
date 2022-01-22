class ScriptTable extends Template {
  constructor() {
    super("html/scriptTable.html", "table#script-overview");
    this.rowTemplate = new Template("html/scriptTableRow.html", null);
    this.reloadButtonElement = null;
    this.saveTrialDurations = null;
    this.bodyElement = null;
    this.footerElement = null;
    this.footerElements = null;
  }

  load() {
    return Promise.all([super.load(), this.rowTemplate.load()]);
  }

  validate() {
    var b = super.validate();
    if (b) {
      this.reloadButtonElement = this.element.querySelector(
        'input[name="refresh-script-overview"]'
      );
      this.saveTrialDurations = this.element.querySelector(
        'input[name="save-trial-durations"]'
      );
      this.bodyElement = this.element.querySelector("tbody");
      this.footerElement = this.element.querySelector("tfoot");
      this.footerElements = {
        "sales-users": this.footerElement.querySelector("td#all-sales-users a"),
        "sales-profit": this.footerElement.querySelector(
          "td#all-sales-profit a"
        ),
        "sales-latest": this.footerElement.querySelector(
          "td#all-sales-latest a"
        ),
        "sales-renewals": this.footerElement.querySelector(
          "td#all-sales-renewals a"
        ),
        "trials-total": this.footerElement.querySelector(
          "td#all-trial-total a"
        ),
        "trials-active": this.footerElement.querySelector(
          "td#all-trial-active a"
        ),
        "trials-expired": this.footerElement.querySelector(
          "td#all-trial-expired a"
        ),
      };
      // Listeners
      this.reloadButtonElement.onclick = this.reload.bind(this);
      this.saveTrialDurations.onclick = this.saveAllTrialDurations.bind(this);
    }
    return b;
  }

  clear() {
    this.bodyElement.innerHTML = "";
    for (let cellId in this.footerElements) {
      this.footerElements[cellId].innerHTML = "";
    }
  }

  getAllRows(main = true) {
    return Array.from(
      this.bodyElement.querySelectorAll(
        `tr[data-script-id].${main ? "main" : "sub"}-row`
      )
    );
  }

  getRow(scriptId, main = true) {
    return this.bodyElement.querySelector(
      `tr[data-script-id="${scriptId}"].${main ? "main" : "sub"}-row`
    );
  }

  getRowByNexusId(nexusId, main = true) {
    return this.bodyElement.querySelector(
      `tr[data-nexus-id="${nexusId}"].${main ? "main" : "sub"}-row`
    );
  }

  addScript(script) {
    this.rowTemplate.appendTo(this.bodyElement, {
      "script\\.id": script.scriptId,
      "script\\.nexusId": script.nexusId,
      "script\\.salesUrlCode": script.salesUrlCode,
      "script\\.name": script.scriptName,
      "script\\.url": script.scriptThreadUrl,
      "script\\.urlUnRead": script.scriptThreadUnreadURL,
      "script\\.premium": script.premium,
      "script\\.lastCompiled": script.lastCompiledDate
        ? script.lastCompiledDate.toLocaleDateString()
        : "",
      "script\\.lastCompiledClass": script.stacktrace ? "error" : "not-active",
      "script\\.reverseStacktraceUrl": script.reverseStacktraceUrl,
      "script\\.reverseStacktraceCode": script.reverseStacktraceCode,
      "script\\.stacktrace": script.stacktrace,
      "trial\\.trialTime":
        localStorage.getItem(`trial-time-${script.scriptId}`) || 60,
    });
    console.log(this.rowTemplate);
  }

  addAllScripts(scripts) {
    for (let scriptId in scripts) {
      this.addScript(scripts[scriptId]);
    }
  }

  addTrial(scriptId, trialRecords) {
    var row = this.getRow(scriptId);
    var trialCount = 0;
    var trialActiveCount = 0;
    var trialExpiredCount = 0;
    if (row) {
      trialCount = trialRecords.length;
      trialActiveCount = trialRecords.filter(
        (trialRecord) => !trialRecord.expired
      ).length;
      trialExpiredCount = trialCount - trialActiveCount;
      // Update HTML
      row.dataset["trialRecords"] = JSON.stringify(trialRecords);
      row.querySelector('td[data-id="trials-total"] a').innerText = trialCount;
      row.querySelector('td[data-id="trials-active"] a').innerText =
        trialActiveCount;
      row.querySelector('td[data-id="trials-expired"] a').innerText =
        trialExpiredCount;
    }
  }

  addAllTrials(trials) {
    for (let scriptId in trials) {
      this.addTrial(scriptId, trials[scriptId]);
    }
  }

  addSalesSummary(nexusId, salesSummary) {
    var row = this.bodyElement.querySelector(
      `tr[data-nexus-id="${nexusId}"].main-row`
    );
    var cell = null;
    if (row) {
      cell = row.querySelector('td[data-id="sales-profit"] a');
      cell.innerText = salesSummary["estimatedTotalProfit"];

      cell = row.querySelector('td[data-id="sales-latest"] a');
      cell.innerText = salesSummary["estimatedNewProfit"];
    }
  }

  addAllSaleSummaries(salesSummaries) {
    for (let nexusId in salesSummaries) {
      this.addSalesSummary(nexusId, salesSummaries[nexusId]);
    }
  }

  addTransactionRecords(nexusId, transactions) {
    var row = this.getRowByNexusId(nexusId);
    var cell = null;
    if (row && transactions && transactions.length > 0) {
      row.dataset["salesRecords"] = JSON.stringify(transactions);

      cell = row.querySelector('td[data-id="sales-renewals"] a');
      cell.innerHTML = transactions.filter((r) => r.renewal).length;

      cell = row.querySelector('td[data-id="sales-users"] a');
      cell.innerHTML = transactions
        .filter((r) => !r.renewal)
        .map((r) => r.estimatedProfit)
        .reduce((a, b) => a + (b > 0 ? 1 : -2), 0); // -2 for refunds (buy + refund rows)
    }
  }

  addAllTransactionRecords(scripts) {
    for (let scriptId in scripts) {
      let nexusId = scripts[scriptId].nexusId;
      let salesUrlCode = scripts[scriptId].salesUrlCode;
      Sales.get(salesUrlCode).then((transactions) =>
        this.addTransactionRecords(nexusId, transactions)
      );
    }
  }

  /*
   * Invokables
   */

  hideContents() {
    this.bodyElement.style.visibility = "hidden";
    this.footerElement.style.visibility = "hidden";
  }

  showContents() {
    this.bodyElement.style.visibility = "visible";
    this.footerElement.style.visibility = "visible";
  }

  downloadAndInsertScripts() {
    return Script.getAll().then((scripts) => {
      this.addAllScripts(scripts);
      this.addAllTransactionRecords(scripts);
    });
  }

  downloadAndUpdateTrialInformation() {
    return Trial.getAll().then(this.addAllTrials.bind(this));
  }

  downloadAndUpdateSaleSummaryInformation() {
    return SalesSummary.getAll().then(this.addAllSaleSummaries.bind(this));
  }

  calculateAndUpdateFooter() {
    for (let cellId in this.footerElements) {
      let cells = Array.from(
        this.bodyElement.querySelectorAll(
          `tr.main-row td[data-id="${cellId}"] a`
        )
      );
      let num = cells
        .map((cell) => cell.innerText)
        .map(parseFloat)
        .filter(Boolean)
        .reduce((a, b) => a + b, 0);
      num = Math.round(num * 100) / 100; // Round to two decimal places
      this.footerElements[cellId].innerHTML = num;
    }
  }

  /*
   * Controllers
   */

  async reload() {
    this.hideContents();
    this.clear();
    await this.downloadAndInsertScripts();
    await this.downloadAndUpdateTrialInformation();
    await this.downloadAndUpdateSaleSummaryInformation();
    this.showContents();
    this.calculateAndUpdateFooter();
  }

  saveTrialDuration(input) {
    localStorage.setItem(input.name, input.value);
  }

  saveAllTrialDurations() {
    Array.from(
      this.bodyElement.querySelectorAll('input[name^="trial-time-"]')
    ).forEach((input) => this.saveTrialDuration(input));
  }
}
