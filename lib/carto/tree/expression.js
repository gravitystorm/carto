(function(tree) {

var _ = require('lodash');

tree.Expression = function Expression(value) {
    this.value = value;
    this.rule = null;
};

tree.Expression.prototype = {
    is: 'expression',
    ev: function(env) {
        if (this.value.length > 1) {
            return new tree.Expression(this.value.map(function(e) {
                return e.ev(env);
            }));
        } else {
            return this.value[0].ev(env);
        }
    },

    toString: function(env) {
        return this.value.map(function(e) {
            return e.toString(env);
        }).join(' ');
    },

    setRule: function (rule) {
        this.rule = rule;
        if (_.isArray(this.value)) {
            _.forEach(this.value, function (v) {
                if (typeof v.setRule === 'function') {
                    v.setRule(rule);
                }
            });
        }
        else {
            if (typeof this.value.setRule === 'function') {
                this.value.setRule(rule);
            }
        }
    }
};

})(require('../tree'));
