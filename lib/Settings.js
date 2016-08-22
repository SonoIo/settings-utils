;(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['moment'], function (moment) {
			return factory(root, moment);
		});
	}
	else if (typeof exports !== 'undefined') {
		var moment = require('moment');
		module.exports = factory(root, moment);
	}
	else {
		root.Settings = factory(root, root.moment);
	}

}(this, function (root, moment) {

	var Settings = function Settings() {
		if (typeof localStorage === 'undefined')
			throw new Error('localStorage does not exists');
	};

	Settings.middleware = function middleware(options) {
		return function (context, next) {
			context.settings = new Settings(options);
			return next();
		};
	};

	Settings.prototype.remove = function remove(key) {
		localStorage.removeItem("ttl-"+key);
		localStorage.removeItem(key);
	};

	Settings.prototype.set = function set(key, value, ttl) {

		var parsedValue;

		switch (typeof value) {
			case 'boolean':
				parsedValue = value ? 'b|true' : 'b|false';
				break;
			case 'object':
				parsedValue = 'o|' + JSON.stringify(value);
				break;
			default:
				parsedValue = value;
				break;
		}
		if (typeof ttl !== 'undefined') {
			localStorage.setItem('ttl-'+key,  JSON.stringify({
				date: moment(),
				ttl: ttl
			}) );
		}
		localStorage.setItem(key, parsedValue);
	};

	Settings.prototype.get = function get(key) {
		var ttl = localStorage.getItem('ttl-'+key);
		if ( ttl ){
			try{
				ttl = JSON.parse(ttl);
				if ( ttl.date && ttl.ttl && moment(ttl.date).isBefore(moment().subtract(ttl.ttl)) ){
					this.remove(key);
					return null;
				}
			}catch(e){}
		}

		var value = localStorage.getItem(key);
		var result;

		if (value === null)
			return null;

		switch (value.substr(0, 2)) {
			case 'b|':
				result = value.substr(2) == 'true';
				break;
			case 'o|':
				try {
					result = JSON.parse(value.substr(2));
				}
				catch (e) {
					result = value;
				}
				break;
			default:
				result = value;
				break;
		}

		return result;
	};

	return Settings;

}));
