(function(tree) {

tree.Keyword = function Keyword(value) {
    this.value = value;
    var special = {
        'transparent': 'color',
        'true': 'boolean',
        'false': 'boolean'
    };
    this.is = special[value] ? special[value] : 'keyword';
    this.rule = null;
};
tree.Keyword.prototype = {
    ev: function() { return this; },
    toString: function() { return this.value; }
};
tree.Keyword.prototype.setRule = function (rule) {
    this.rule = rule;
    if (typeof this.value.setRule === 'function') {
        this.value.setRule(rule);
    }
}

})(require('../tree'));
