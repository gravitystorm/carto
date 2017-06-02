(function(tree) {

var _ = require('lodash');

tree.ImageFilter = function ImageFilter(filter, args) {
    this.filter = filter;
    this.args = args || null;
    this.rule = null;
};

tree.ImageFilter.prototype = {
    is: 'imagefilter',
    ev: function() { return this; },

    toString: function() {
        if (this.args) {
            return this.filter + '(' + this.args.join(',') + ')';
        } else {
            return this.filter;
        }
    }
};

tree.ImageFilter.prototype.setRule = function (rule) {
    this.rule = rule;
    if (typeof this.filter.setRule === 'function') {
        this.filter.setRule(rule);
    }
    _.forEach(this.args, function (a) {
        if (typeof a.setRule === 'function') {
            a.setRule(rule);
        }
    });
}


})(require('../tree'));
