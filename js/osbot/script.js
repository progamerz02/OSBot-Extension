/**
 * Download script information.
 */
const Script = (function () {
  "use strict";

  // Constants
  const URL = "https://osbot.org/mvc/scripters/info";

  // Interact with OSBot server

  /**
   * Load all scripts.
   */
  function getAll() {
    return send({
      url: URL,
      type: "GET",
    })
      .then(toHTML)
      .then(getTable)
      .then(getTableRows)
      .then(extractAllScriptInformation)
      .then(reconstruct);
  }

  // Other methods

  /**
   * Get first table.
   */
  function getTable(html) {
    return html.querySelector("table");
  }

  /**
   * Get all rows from the table except the header.
   */
  function getTableRows(table) {
    return table.querySelectorAll("tr:not(:first-child)");
  }

  function extractScriptInformation(row) {
    var cells = row.querySelectorAll("td");
    var scriptId = 0;
    var scriptName = "";
    var scriptThreadUrl = "";
    var scriptThreadUnreadURL = "";
    var scriptThreadShortUrl = "";
    var nexusId = 0;
    var premium = false;
    var salesUrl = "";
    var salesUrlCode = "";
    var lastCompiledDate = null;
    var gitCommitHash = "";
    var reverseStacktraceUrl = "";
    var reverseStacktraceCode = "";
    var stacktrace = "";

    // Script ID
    scriptId = parseInt(cells[0].innerHTML);
    // Script name
    scriptName = cells[1].innerText;
    // Script URLs
    scriptThreadUrl = cells[1].querySelector("a").getAttribute("href");
    scriptThreadShortUrl = (
      scriptThreadUrl.endsWith("/")
        ? scriptThreadUrl.slice(0, -1)
        : scriptThreadUrl
    )
      .split("/")
      .pop();
    scriptThreadUnreadURL = cells[1]
      .querySelector("a")
      .getAttribute("href")
      .concat("?do=getNewComment");
    // Nexus ID
    nexusId = parseInt(cells[2].innerHTML) || 0;
    // Premium
    premium = cells[3].innerText === "true";
    // Sales URL
    if (premium) {
      salesUrl = extractUnixPath(
        cells[4].querySelector("button").getAttribute("onclick")
      );
      salesUrlCode = extractUrlCode(salesUrl);
    }
    // Compile date
    lastCompiledDate = cells[5].innerText;
    lastCompiledDate =
      lastCompiledDate === "null" ? "" : new Date(lastCompiledDate);
    // Git/reverse
    gitCommitHash = cells[6].innerText;
    reverseStacktraceUrl = extractUnixPath(
      cells[7].querySelector("button").getAttribute("onclick")
    );
    reverseStacktraceCode = extractUrlCode(reverseStacktraceUrl);
    stacktrace = cells[8].innerText;
    if (!stacktrace.trim()) {
      stacktrace = "";
    }

    return {
      scriptId: scriptId,
      scriptName: scriptName,
      scriptThreadUrl: scriptThreadUrl,
      scriptThreadShortUrl: scriptThreadShortUrl,
      scriptThreadUnreadURL: scriptThreadUnreadURL,
      nexusId: nexusId,
      premium: premium,
      salesUrl: salesUrl,
      salesUrlCode: salesUrlCode,
      lastCompiledDate: lastCompiledDate,
      gitCommitHash: gitCommitHash,
      reverseStacktraceUrl: reverseStacktraceUrl,
      reverseStacktraceCode: reverseStacktraceCode,
      stacktrace: stacktrace,
    };
  }

  /**
   * Strip out all table row information.
   */
  function extractAllScriptInformation(rows) {
    return Array.from(rows).map(extractScriptInformation);
  }

  /**
   * Example:
   * 1. /mvc/scripters/sales/F2GSDFG43TF_EXAMPLE_4563GDF45342
   * 2.                      F2GSDFG43TF_EXAMPLE_4563GDF45342
   */
  function extractUrlCode(str) {
    str = str.split("/");
    str = str[str.length - 1];
    return str;
  }

  /**
   * Extracts the href path from the HTML unix path.
   * From: "window.location='/mvc/scripters/sales/F2GSDFG43TF_EXAMPLE_4563GDF45342'"
   * To:    "/mvc/scripters/sales/F2GSDFG43TF_EXAMPLE_4563GDF45342"
   * @param {String} str - unix path
   * @return {String} href
   */
  function extractUnixPath(str) {
    return str.match(/.*?\'(.*?)\'/)[1]; // strip out unixpath
  }

  /**
   * From array to key/value object
   */
  function reconstruct(information) {
    var result = {};

    information.forEach((element) => (result[element.scriptId] = element));

    return result;
  }

  // Exposed functions

  return {
    getAll: getAll,
  };
})();
