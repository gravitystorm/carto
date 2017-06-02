(function(tree) {

tree.Field = function Field(content) {
    this.value = content || '';
    this.rule = null;
};

tree.Field.prototype = {
    is: 'field',
    toString: function() {
        return '[' + this.value + ']';
    },
    'ev': function() {
        return this;
    },
    setRule: function (rule) {
        this.rule = rule;
        if (typeof this.value.setRule === 'function') {
            this.value.setRule(rule);
        }
    }
};

})(require('../tree'));
