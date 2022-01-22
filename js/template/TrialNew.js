class NewTrial extends Template {
	constructor() {
		super('html/trialNew.html', 'div#trial-new');
		this.rowTemplate = new Template('html/trialNewRow.html', null);
		this.searchBoxElement = null;
		this.searchButtonElement = null;
		this.listElement = null;
		this.xhr = null;
	}
	
	load() {
		return Promise.all([ super.load(), this.rowTemplate.load() ]);
	}
	
	validate() {
		var b = super.validate();
		var updateUserListFunc = null;
		if (b) {
			updateUserListFunc = this.updateUserList.bind(this);
			
			this.searchBoxElement = this.element.querySelector('input[name="search"]');
			this.searchButtonElement = this.element.querySelector('input[name="search-button"]');
			this.listElement = this.element.querySelector('ul#trial-new-search-users');
			// Listeners
			this.searchBoxElement.addEventListener('change', updateUserListFunc);
			this.searchButtonElement.addEventListener('click', updateUserListFunc);
		}
		return b;
	}
	
	clearList() {
		this.listElement.innerHTML = '';
	}
	
	addUser(user) {
		this.rowTemplate.appendTo(this.listElement, {
			'user\\.userId': user.userId,
			'user\\.userName': user.userName,
			'user\\.userProfileUrl': user.userProfileUrl,
			'user\\.userAvatarUrl': user.userAvatarUrl
		});
	}
	
	addAllUsers(users) {
		for (let i = 0; i < users.length; i++) {
			this.addUser(users[i]);
		}
	}
	
	updateUserList() {
		var self = this;
		return SearchUser.find(this.searchBoxElement.value)
			.then(users => {
				self.clearList();
				if (users && users.length > 0) {
					self.addAllUsers(users);
				}
			})
			.catch(e => {
				self.clearList();
			});
	}
	
	async updateUserList2() {
		var input = this.searchBoxElement.value;
		var users = [];
		if (input && input.length > 0) {
			users = await SearchUser.find(input);
			this.clearList();
			if (users != null && users.length > 0) {
				this.addAllUsers(users);
			}
		}
	}
	
	getSelectedRows() {
		return Array.from(this.listElement.querySelectorAll('li'))
					.filter(li => li.querySelector('input[type="checkbox"]:checked'));
	}
	
	getSelectedUsers() {
		return this.getSelectedRows().map(li => li.dataset);
	}
}