match(!this.jsdocType)(function() {
    this.log('ANY');
    return '';
});

match(function() { return Array.isArray(this) })(function() {
    this.log('ARRAY');
    var res = '';
    this.forEach(function(ctx) { res += apply(ctx) });
    return res;
});

match(this.jsdocType)(
    function() {
        // Fallback if nothing was exported
        return '';
    },
    match(this.files)(function() {
        var res = '';
        this.files.forEach(function(ctx) {
            res += apply({ _depth : this._depth + 1, files : undefined }, ctx);
        }, this);
        return res;
    }),
    match(this.modules)(function() {
        var res = '';
        this.modules.forEach(function(ctx) {
            res += apply({ _depth : this._depth + 1, modules : undefined }, ctx);
        }, this);
        return res;
    })
);
