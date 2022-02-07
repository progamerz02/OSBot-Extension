class Template {
  constructor(htmlFile, cssSelector) {
    this.htmlFile = htmlFile;
    this.cssSelector = cssSelector;
    this.html = "";
    this.element = null;
  }

  /**
   * Attempt to load the template HTML file and set it in the object instance.
   *
   * @return {Promise}
   */
  load() {
    return send({
      type: "GET",
      url: chrome.extension.getURL(this.htmlFile),
    }).then((content) => (this.html = content));
  }

  /**
   * Query the document for the css selector.
   *
   * @return {DOMElement}
   */
  find() {
    return this.cssSelector && document.querySelector(this.cssSelector);
  }

  /**
   * Attempt to validate the Template element.
   */
  validate() {
    return (this.element = this.find());
  }

  /**
   * Load html template file and replace text where specified.
   *
   * @param {Object} replaceStringMap
   * @return {String} html
   */
  prepare(replaceStringMap) {
    var htmlCopy = this.html;
    if (typeof replaceStringMap !== "undefined") {
      for (let key in replaceStringMap) {
        htmlCopy = htmlCopy.replace(
          new RegExp(`\\b${key}\\b`, "g"),
          replaceStringMap[key]
        );
      }
    }
    return htmlCopy;
  }

  /**
   * Attempt to append HTML contents to a DOMElement.
   *
   * @param {DOMElement} domElement
   */
  appendTo(domElement, replaceStringMap) {
    if (!domElement) {
      throw "Nothing to append to!";
    } else if (domElement instanceof Template) {
      if (domElement.element) {
        domElement = domElement.element;
      } else {
        throw "Template does not contain a valid element";
      }
    }
    domElement.innerHTML += this.prepare(replaceStringMap);
    return this.validate();
  }

  /**
   * Attempt to prepend HTML contents to a DOMElement.
   *
   * @param {DOMElement} domElement
   */
  prependTo(domElement, replaceStringMap) {
    if (!domElement) {
      throw "Nothing to append to!";
    } else if (domElement instanceof Template) {
      if (domElement.element) {
        domElement = domElement.element;
      } else {
        throw "Template does not contain a valid element";
      }
    }
    domElement.innerHTML =
      this.prepare(replaceStringMap) + domElement.innerHTML;
    return this.validate();
  }

  hide() {
    this.element.style.visibility = "hidden";
  }

  show() {
    this.element.style.visibility = "visible";
  }
}
