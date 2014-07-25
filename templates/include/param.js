match(this.jsdocType === 'param')(
    match(this.jsType)(function() {
        var name = apply('jstype-name'),
            type = apply('jstype-type');
        return name + ' ' + type;
    }),
//    match(this.jsType === 'Function')(function() {
//        // TODO: proper function's signature, e.g. `Function(filePath)`
//        return local({ name : undefined })(apply('signature'));
//    }),
    function() {
        this.log('param', this.jsType, '@depth', this._depth);

        var res,
            name = this.name;

        res = applyNext({ name : name });
        this.description && (res += '<br/>\n  ' + this.description);

        return apply({ block : 'ulist', content : res });
    }
);
