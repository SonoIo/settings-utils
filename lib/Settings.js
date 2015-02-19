;(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return factory(root);
		});
	}
	else if (typeof exports !== 'undefined') {
		module.exports = factory(root);
	}
	else {
		root.context = factory(root);
	}

}(this, function (root) {
	
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
		localStorage.removeItem(key);
	};

	Settings.prototype.set = function set(key, value) {

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

		localStorage.setItem(key, parsedValue);
	};

	Settings.prototype.get = function get(key) {
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