oninit(function() {
    var slice = Array.prototype.slice;

    function JsdtmdContext(ctx) {
        this._ctx = ctx;
        this._depth = 0;
        this._start = false;
    }

    JsdtmdContext.prototype.log = function() {
        //var args = slice.call(arguments);
        //console.info.apply(console, ['⇢ '].concat(args));
    };

    var oldApply = exports.apply;
    exports.apply = function(ctx) {
        var ctx_ = new JsdtmdContext(ctx);
        return oldApply(ctx_);
    };
});

match(this._start === false)(function() {
    this._start = true;
    return apply(this._ctx);
});
