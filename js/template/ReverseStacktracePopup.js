class ReverseStacktracePopup extends Popup {
	
	constructor() {
		super();
	}
	
	validate() {
		var b = super.validate();
		super.set('Reverse Stacktrace', 650, 350);
		return b;
	}
	
	show() {
		super.show()
	}
	
	setContents(text) {
		super.setContents(`<textarea readonly>${text}</textarea>`);
	}
	
}