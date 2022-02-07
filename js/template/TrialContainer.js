class TrialContainer extends Template {
  constructor() {
    super("html/trialContainer.html", "div#trial-container");
    this.rowTemplate = new Template("html/trialContainerRow.html", null);
    this.listElement = null;
    this.actionSelectElement = null;
  }

  load() {
    return Promise.all([super.load(), this.rowTemplate.load()]);
  }

  validate() {
    var b = super.validate();
    if (b) {
      this.listElement = this.element.querySelector("div#trial-list ul");
      this.actionSelectElement = this.element.querySelector(
        'div#controls select[name="trial-action"]'
      );
    }
    return b;
  }

  addTrial(trial) {
    this.rowTemplate.appendTo(this.listElement, {
      "trial\\.scriptId": trial.scriptId,
      "trial\\.scriptName": trial.scriptName,
      "trial\\.userId": trial.userId,
      "trial\\.userName": trial.userName,
      "trial\\.entryDate": trial.entryDate,
      "trial\\.expirationDate": trial.expirationDate,
      "trial\\.expired": trial.expired,
      "trial\\.duration": trial.duration,
    });
  }

  getSelectedRows() {
    return Array.from(this.listElement.querySelectorAll("li")).filter((li) =>
      li.querySelector('input[type="checkbox"]:checked')
    );
  }

  getSelectedUsers() {
    return this.getSelectedRows().map((li) => li.dataset);
  }

  getSelectedAction() {
    return this.actionSelectElement.value;
  }
}
