var ipsSettings = getIpsSettings();

var main = document.querySelector("main#ipsLayout_body");
var tPopup = new Popup();
var tLinks = new Template("html/links.html", "ul#useful-links");
var tContainer = new Template("html/container.html", "div#scripter-overview");
var tScriptTable = new ScriptTable();
var tTrialContainer = new TrialContainer();
var tNewTrial = new NewTrial();

// Visualisation
var tLineChart = new Template("html/visualisation/lineChart.html");
var tPieChart = new Template("html/visualisation/pieChart.html");
var tMaterialBarChart = new Template(
  "html/visualisation/materialBarChart.html"
);

var me = document.querySelector("#elUserLink").text.trim();

/*
 * MAIN EXECUTOR
 */

loadTemplates()
  .then(createOverviewContainer)
  .then(createLinks)
  .then(createScripterTable)
  .then(createPopupContainer)
  .then(revalidateTemplates)
  .then(createControllers)
  .then(reloadScripts);

document.addEventListener("message", console.debug);

/*
 * OTHER METHODS
 */

function loadTemplates() {
  return Promise.all([
    tPopup.load(),
    tContainer.load(),
    tLinks.load(),
    tScriptTable.load(),
    tTrialContainer.load(),
    tNewTrial.load(),
    tLineChart.load(),
    tPieChart.load(),
    tMaterialBarChart.load(),
  ]);
}

function createOverviewContainer() {
  tContainer.prependTo(main, { "container.id": "scripter-overview" });
}

function createLinks() {
  tLinks.appendTo(tContainer);
}

function createScripterTable() {
  tScriptTable.appendTo(tContainer);
}

function createPopupContainer() {
  tPopup.prependTo(tContainer);
  tPopup.hide();
}

function reloadScripts() {
  return tScriptTable.reload();
}

function revalidateTemplates() {
  return Promise.all([
    tContainer.validate(),
    tLinks.validate(),
    tScriptTable.validate(),
    tPopup.validate(),
  ]);
}

function createControllers() {
  window.addEventListener("message", new ScriptTableController().onMessage);
}

async function updateTrials(e) {
  var scriptId = this.dataset["scriptId"];
  var action = this["trial-action"].value;
  var users = {};
  var userIds = null;
  if (scriptId && action && action.length > 0) {
    Array.from(this["user"])
      .filter((cb) => cb.checked)
      .forEach((cb) => (users[cb.dataset["userName"]] = cb.value));
    if (users) {
      switch (action) {
        case "reset":
          await removeTrials(scriptId, users);
          await addTrials(scriptId, users);
          tPopup.hide();
          reloadScripts();
          break;
        case "remove":
          await removeTrials(scriptId, users);
          tPopup.hide();
          reloadScripts();
          break;
      }
    }
  }
}

async function addTrialAndNotifyUser(script, user, trialTime) {
  var trialExpire = null;
  if (script && user) {
    trialExpire = new Date();
    trialExpire.setTime(trialExpire.getTime() + trialTime * 60 * 60 * 1000);
    trialExpire = formatDate(trialExpire);

    await Trial.add(user.userId, script.scriptId, trialTime);
    await DirectMessage.compose(user.userName, `Trial: ${script.scriptName}`, [
      "Hi,",
      `A new trial for <a href="${script.scriptUrl}">${script.scriptName}</a> has been activated for ${trialTime} hours.`,
      `This trial will expire at ${trialExpire} GMT`,
      "Have fun,",
      `${me}`,
    ]);
  }
}

function addTrialForSelf(scriptId) {
  // Infinite
  return Trial.add(ipsSettings.memberID, scriptId, 0);
}

async function addTrials(script, users, trialTime) {
  for (let i = 0; i < users.length; i++) {
    await addTrialAndNotifyUser(script, users[i], trialTime);
  }
}

async function removeTrials(script, users) {
  for (let i = 0; i < users.length; i++) {
    await Trial.remove(users[i].userId, script.scriptId);
  }
}

async function resetTrials(script, users, trialTime) {
  await removeTrials(script, users);
  await addTrials(script, users, trialTime);
}
