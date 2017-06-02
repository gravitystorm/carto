(function(tree) {

var util = require('../util');

// a rule is a single property and value combination, or variable
// name and value combination, like
// polygon-opacity: 1.0; or @opacity: 1.0;
tree.Rule = function Rule(name, value, index, filename) {
    var parts = name.split('/');
    this.name = parts.pop();
    this.instance = parts.length ? parts[0] : '__default__';
    this.value = (value instanceof tree.Value) ?
        value : new tree.Value([value]);

    if (typeof this.value.setRule === 'function') {
        this.value.setRule(this);
    }

    this.index = index;
    this.filename = filename;
    this.variable = (name.charAt(0) === '@');

    if (this.variable) {
        this.symbolizer = '*';
    }
    else {
        this.symbolizer = tree.Reference.symbolizer(this.name);
    }

    this.parent = null;
};

tree.Rule.prototype.is = 'rule';

tree.Rule.prototype.clone = function() {
    var clone = Object.create(tree.Rule.prototype);
    clone.name = this.name;
    clone.value = this.value;
    clone.index = this.index;
    clone.instance = this.instance;
    clone.symbolizer = this.symbolizer;
    clone.filename = this.filename;
    clone.variable = this.variable;
    clone.selectors = this.selectors;
    return clone;
};

tree.Rule.prototype.updateID = function() {
    return this.id = this.zoom + '#' + this.instance + '#' + this.name;
};

tree.Rule.prototype.toString = function() {
    return '[' + tree.Zoom.toString(this.zoom) + '] ' + this.name + ': ' + this.value;
};

tree.Rule.prototype.validate = function (env) {
    var valid = true;

    if (!tree.Reference.validSelector(this.name) && !this.variable) {
        var mean = getMean(this.name);
        var mean_message = '';
        if (mean[0][1] < 3) {
            mean_message = '. Did you mean ' + mean[0][0] + '?';
        }
        valid = false;
        util.error(env, {
            message: "Unrecognized rule: " + this.name + mean_message,
            index: this.index,
            filename: this.filename
        });
    }
    else {
        var selectorStatus = tree.Reference.selectorStatus(this.name);
        if (selectorStatus !== 'stable') {
            if (selectorStatus === 'deprecated') {
                util.warning(env, {
                    message: this.name + ' is deprecated. It may be removed in the future.',
                    filename: this.filename,
                    index: this.index
                });
            }
            else if (selectorStatus === 'unstable') {
                util.warning(env, {
                    message: this.name + ' is unstable. It may change in the future.',
                    filename: this.filename,
                    index: this.index
                });
            }
            else if (selectorStatus === 'experimental') {
                util.warning(env, {
                    message: this.name + ' is experimental. It may change, be renamed or removed in the future.',
                    filename: this.filename,
                    index: this.index
                });
            }
        }

        if ((this.value instanceof tree.Value) &&
            !tree.Reference.validValue(env, this.name, this.value)) {
            if (!tree.Reference.selector(this.name) && !this.variable) {
                valid = false;
                util.error(env, {
                    message: 'Unrecognized property: ' +
                        this.name,
                    index: this.index,
                    filename: this.filename
                });
            } else if (!this.variable) {
                var typename;
                if (tree.Reference.selector(this.name).validate) {
                    typename = tree.Reference.selector(this.name).validate;
                } else if (typeof tree.Reference.selector(this.name).type === 'object') {
                    typename = 'keyword (options: ' + tree.Reference.selector(this.name).type.join(', ') + ')';
                } else {
                    typename = tree.Reference.selector(this.name).type;
                }

                if (typename !== 'font' ||
                    (typename === 'font' && this.value.value[0].is !== 'string')) {
                    valid = false;
                    util.error(env, {
                        message: 'Invalid value for ' +
                            this.name +
                            ', the type ' + typename +
                            ' is expected. ' + this.value +
                            ' (of type ' + this.value.value[0].is + ') was given.',
                        index: this.index,
                        filename: this.filename
                    });
                }
                else {
                    valid = false;
                    util.error(env, {
                        message: 'The font \'' +
                            this.value +
                            '\' (specified as text-face-name) is not a known font on your system,' +
                            ' please provide an existing font face name.',
                        index: this.index,
                        filename: this.filename
                    });
                }
            }
        }
    }

    return valid;
}

function getMean(name) {
    return Object.keys(tree.Reference.selector_cache).map(function(f) {
        return [f, tree.Reference.editDistance(name, f)];
    }).sort(function(a, b) { return a[1] - b[1]; });
}

// second argument, if true, outputs the value of this
// rule without the usual attribute="content" wrapping. Right
// now this is just for the TextSymbolizer, but applies to other
// properties in reference.json which specify serialization=content
tree.Rule.prototype.toXML = function(env, content, sep, format) { // eslint-disable-line
    if (this.validate(env)) {
        if (this.variable) {
            return '';
        } else if (tree.Reference.isFont(this.name) && this.value.value.length > 1) {
            var f = tree._getFontSet(env, this.value.value);
            return 'fontset-name="' + f.name + '"';
        } else if (content) {
            return this.value.toString(env, this.name, sep);
        } else {
            return tree.Reference.selectorName(this.name) +
                '="' +
                this.value.toString(env, this.name) +
                '"';
        }
    }

    return '';
};

// TODO: Rule ev chain should add fontsets to env.frames
tree.Rule.prototype.ev = function(context) {
    return new tree.Rule(this.name,
        this.value.ev(context),
        this.index,
        this.filename);
};

})(require('../tree'));
