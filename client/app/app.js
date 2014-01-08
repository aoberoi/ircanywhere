// ----------------------------
// Template.app
// - main application template

Template.app.rendered = function() {
	$('body').on('keydown', function() {
		$('input.command-field:visible').focus();
	});
};

Template.app.titleInfo = function() {
	var selected = Session.get('selectedTab');

	if (selected == undefined) {
		return {title: '', modes: '', desc: ''};
	}
	// undefined tab

	var doc = Tabs.findOne({_id: selected._id}, {
		transform: function(doc) {
			if (doc.type == 'network') {
				return {
					key: selected._id,
					title: selected.target,
					modes: '',
					desc: selected.url,
					network: selected.target
				};
			} else if (doc.type == 'channel') {
				return {
					key: doc._id,
					title: doc.target,
					modes: '+' + doc.modes,
					desc: (doc.topic !== undefined) ? doc.topic.topic : '',
					network: Networks.findOne({_id: doc.network}).name
				};
			}
		}
	});
	// we're looking for a channel, transform it so it looks the same
	
	return doc;
};

Template.app.selectedType = function() {
	var selected = Session.get('selectedTab');
	return (selected) ? selected.type : '';
};

Template.app.channelLink = function() {
	var selected = Session.get('selectedTab');
	return (selected.active) ? 'Leave' : 'Rejoin';
};

Template.app.connectionLink = function() {
	var selected = Session.get('selectedTab'),
		network = Networks.findOne({_id: selected.network});

	if (network !== undefined && (network.internal.status === 'disconnected' || network.internal.status === 'closed' || network.internal.status === 'failed')) {
		return 'Connect';
	} else {
		return 'Disconnect';
	}
};

Template.app.events({
	'click .dropdown-toggle': function(e, t) {
		$('.dropdown-menu').toggle();

		e.preventDefault();
	},

	'click #set-topic-link': function(e, t) {
		$('input.command-field:visible').val('/topic ').focus();
		// input topic into the command bar

		e.preventDefault();
	},

	'click #toggle-users-link': function(e, t) {
		e.preventDefault();
	},

	'click #toggle-extra-link': function(e, t) {
		e.preventDefault();
	},

	'click #toggle-chan-link': function(e, t) {
		var selected = Session.get('selectedTab');
		// get the selected tab
		
		if (selected.active) {
			Meteor.call('execCommand', selected.network, selected.title, '/leave');
		} else {
			Meteor.call('execCommand', selected.network, selected.title, '/join');
		}
		// execute the equivalent of /leave or /join, but doing it this way means it wont be in the backlog

		$('.dropdown-menu').hide();
		// close the menu

		e.preventDefault();
	},

	'click #connection-link': function(e, t) {
		e.preventDefault();
	}
});
// ----------------------------

// ----------------------------
// Template.titlebar
// - the titlebar template and its content (dropdown link, topic bar)

Template.titlebar.events({
	'mouseenter .topic-wrap': Application.mouseEnter,
	'mouseleave .topic-wrap': Application.mouseLeave
});
// ----------------------------

// ----------------------------
// Template.sidebar
// - the sidebar template, currently just includes the dynamic network list

Template.sidebar.networks = function() {
	return Tabs.find({}, {sort: {url: 1}});
};
// ----------------------------

// ----------------------------
// Template.network
// - the individual network list on the sidebar

Template.network.isSelected = function() {
	if (!this.selected) {
		return '';
	} else {
		Session.set('selectedTab', this);
		return 'selected';
	}
};

Template.network.isChild = function() {
	return (this.type == 'network') ? '' : 'child';
};

Template.network.getClass = function() {
	var network = Networks.findOne({_id: this.network}, {fields: {'internal.status': 1}});
	// get network so we can get its status

	if (this.type == 'network' && network.internal.status == 'connecting') {
		return 'net-loader';
	} else if (this.type == 'network' && network.internal.status !== 'connecting') {
		return 'net-loaded';
	} else if (this.type == 'channel' || this.type == 'query') {
		return ''
	} else {
		return 'net-loaded';
	}
};

Template.network.getURL = function() {
	var split = this.url.split('/');

	return (split.length == 1) ? split[0] : split[0] + '/' + encodeURIComponent(split[1]);
};

Template.network.getTitle = function() {
	return (!this.active) ? '(' + this.title + ')' : this.title;
};
// ----------------------------