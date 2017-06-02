(function(tree) {

tree.URL = function URL(val, paths) {
    this.value = val;
    this.paths = paths;
    this.rule = null;
};

tree.URL.prototype = {
    is: 'uri',
    toString: function() {
        return this.value.toString();
    },
    ev: function(ctx) {
        return new tree.URL(this.value.ev(ctx), this.paths);
    },
    setRule: function (rule) {
        this.rule = rule;
        if (typeof this.value.setRule === 'function') {
            this.value.setRule(rule);
        }
    }
};

})(require('../tree'));
