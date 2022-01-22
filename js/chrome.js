var syncXhr = null;

/**
 * Convert text to HTML element <template>
 *
 * @param {String} text
 * @return {DOMElement} template
 */
function toHTML(text) {
  var template = document.createElement("div");
  template.innerHTML = text;
  return template;
}

/**
 * Loads file from extension folder.
 *
 * Note: Resource must be defined in the "web_accessible_resources" in the manifest.
 *
 * @param {String} resourceUrl - Url to the resource (e.g., "html/container.html")
 * @return {Promise}
 */
function loadFile(resourceUrl) {
  return send({
    type: "GET",
    url: chrome.extension.getURL(resourceUrl),
  });
}

/**
 * $.ajax(...) without the JQuery dependency.
 *
 * @param {Object} data
 * @return {Promise}
 */
function send(data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(data.type, data.url);
    xhr.setRequestHeader(
      "Content-type",
      data.hasOwnProperty("contentType")
        ? data.contentType
        : "application/x-www-form-urlencoded"
    );
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.status);
        }
      }
    };
    xhr.send(data.data);
  });
}

function interruptAndSend(data) {
  if (syncXhr && syncXhr.abort) {
    syncXhr.abort();
  }
  return new Promise(function (resolve, reject) {
    syncXhr = new XMLHttpRequest();
    syncXhr.open(data.type, data.url);
    syncXhr.setRequestHeader(
      "Content-type",
      data.hasOwnProperty("contentType")
        ? data.contentType
        : "application/x-www-form-urlencoded"
    );
    syncXhr.onreadystatechange = function () {
      if (syncXhr.readyState == 4) {
        if (syncXhr.status === 200) {
          resolve(syncXhr.responseText);
        } else {
          reject(syncXhr.status);
        }
      }
    };
    syncXhr.send(data.data);
  });
}

function formatDate(date) {
  var year = date.getUTCFullYear();
  var month = date.getUTCMonth() + 1;
  var day = date.getUTCDate();
  var hour = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var seconds = date.getUTCSeconds();

  month = ("0" + month).slice(-2);
  day = ("0" + day).slice(-2);
  hour = ("0" + hour).slice(-2);
  minutes = ("0" + minutes).slice(-2);
  seconds = ("0" + seconds).slice(-2);

  return `${year}-${month}-${day} @ ${hour}:${minutes}:${seconds}`;
}

/**
 * Create a temporary 'div' element, add a script that setSeconds
 * the div's inner HTML to the stringified JS value of 'ipsSetting' (on main webpage),
 * then grab that value, parse and return it.
 */
function getIpsSettings() {
  var value = undefined;
  var scriptElement = null;
  var divElement = null;

  scriptElement = document.createElement("script");
  scriptElement.type = "text/javascript";
  scriptElement.charset = "utf-8";
  scriptElement.textContent = `document.querySelector('div#injected-div').innerHTML = JSON.stringify(ipsSettings);`;

  divElement = document.createElement("div");
  divElement.id = "injected-div";
  divElement.appendChild(scriptElement);

  (document.head || document.documentElement).appendChild(divElement);

  //Fixes the cannot parse char c which is because there was 2 double quotes returned in the json value.
  const regExp = new RegExp("span[^>]*");
  replacedQuotes = regExp.exec(divElement.innerHTML)[0].replaceAll('"', "'");

  replacedContent = divElement.innerHTML.replace(regExp, replacedQuotes);

  value = JSON.parse(replacedContent);

  divElement.remove();

  return value;
}

/**
 * Extract user name and ID from profile url
 */
function extractUserIdAndName(profileUrl) {
  var userId = 0;
  var userName = "";
  if (profileUrl && profileUrl.length > 0) {
    /* Remove stuff from URL */
    profileUrl = profileUrl.split("profile");
    profileUrl = profileUrl[1];
    profileUrl = profileUrl.match(/(\w+)/g);
    /* Extract ID */
    userId = profileUrl[0];
    userId = parseInt(userId);
    /* Extract name */
    userName = profileUrl.slice(1).join(" ");
  }
  return {
    userId: userId,
    userName: userName,
  };
}
