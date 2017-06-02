(function(tree) {

var util = require('../util');

tree.Filter = function Filter(key, op, val, index, filename) {
    this.key = key;
    this.op = op;
    this.val = val;
    this.index = index;
    this.filename = filename;
    this.rule = null;

    this.id = this.key + this.op + this.val;
};

// xmlsafe, numeric, suffix
var ops = {
    '<': [' &lt; ', 'numeric'],
    '>': [' &gt; ', 'numeric'],
    '=': [' = ', 'both'],
    '!=': [' != ', 'both'],
    '<=': [' &lt;= ', 'numeric'],
    '>=': [' &gt;= ', 'numeric'],
    '=~': ['.match(', 'string', ')']
};

tree.Filter.prototype.ev = function(env) {
    this.key = this.key.ev(env);
    this.val = this.val.ev(env);
    return this;
};

tree.Filter.prototype.toXML = function(env) {
    if (tree.Reference.data.filter) {
        if (this.key.is === 'keyword' && -1 === tree.Reference.data.filter.value.indexOf(this.key.toString())) {
            util.error(env, {
                message: this.key.toString() + ' is not a valid keyword in a filter expression',
                index: this.index,
                filename: this.filename
            });
        }
        if (this.val.is === 'keyword' && -1 === tree.Reference.data.filter.value.indexOf(this.val.toString())) {
            util.error(env, {
                message: this.val.toString() + ' is not a valid keyword in a filter expression',
                index: this.index,
                filename: this.filename
            });
        }
    }
    var key = this.key.toString(false);
    var val = this.val.toString(this.val.is == 'string');

    if (
        (ops[this.op][1] == 'numeric' && isNaN(val) && this.val.is !== 'field') ||
        (ops[this.op][1] == 'string' && (val)[0] != "'")
    ) {
        util.error(env, {
            message: 'Cannot use operator "' + this.op + '" with value ' + this.val,
            index: this.index,
            filename: this.filename
        });
    }

    return key + ops[this.op][0] + val + (ops[this.op][2] || '');
};

tree.Filter.prototype.toString = function() {
    return '[' + this.id + ']';
};

tree.Filter.prototype.setRule = function (rule) {
    this.rule = rule;
    if (typeof this.key.setRule === 'function') {
        this.key.setRule(rule);
    }
    if (typeof this.op.setRule === 'function') {
        this.op.setRule(rule);
    }
    if (typeof this.val.setRule === 'function') {
        this.val.setRule(rule);
    }
}

})(require('../tree'));
