class Popup extends Template {
  constructor() {
    super("html/popup.html", "div#popup-overlay");
    this.container = null;
    this.header = null;
    this.main = null;
    this.form = null;
    this.closeLink = null;
    this.titleElement = null;
    this.mainElement = null;
  }

  validate() {
    var b = super.validate();
    if (b) {
      this.container = this.element.querySelector("section#popup");
      this.header = this.container.querySelector("header");
      this.main = this.container.querySelector("main");
      this.form = this.element.querySelector('form[name="popup-form"]');
      // Other elements
      this.closeLink = this.header.querySelector('input[name="close-popup"]');
      this.titleElement = this.header.querySelector("h3");
      // Listeners
      this.closeLink.onclick = this.hide.bind(this);
    }
    return b;
  }

  setWidth(width = 650) {
    if (typeof width === "number") {
      width = `${width}px`;
    }
    this.container.style.width = width;
  }

  setHeight(height = 368) {
    if (typeof height === "number") {
      height = `${height}px`;
    }
    this.main.style.height = height;
  }

  setTitle(title = "Placeholder") {
    this.titleElement.innerHTML = title;
  }

  setContents(
    html = '<span class="ipsLoading align-middle" style="display: block;"></span>'
  ) {
    this.main.innerHTML = html;
  }

  setSubmitListener(submitListener) {
    this.form.onsubmit = submitListener;
  }

  set(title, width, height, html, submitListener) {
    this.setTitle(title);
    this.setWidth(width);
    this.setHeight(height);
    this.setContents(html);
    this.setSubmitListener(submitListener);
  }

  clear() {
    this.setContents("");
  }
}
