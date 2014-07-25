match(this.jsdocType === 'module')(function() {
    this.log('module', '@depth', this._depth);

    var name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : this._depth }, content : name });

    local({
        _depth : this._depth + 1,
        _moduleName : this.name,
        _moduleDesc : this.description,
        name : undefined,
        description : undefined
    })(function() {
        var _res = '';

        if(this._filePath) {
            var pathSign = apply('signature', { jsdocType : 'file' });
            _res += apply({ block : 'para', content : 'Defined in: ' + pathSign });
        }

        this._moduleDesc && (_res += apply({ block : 'para', content : this._moduleDesc }));

        if(this.see) {
            var links = apply('see', this.see);
            _res += apply({ block : 'para', content : 'See:' });
            links.forEach(function(link) {
                _res += apply({ block : 'ulist', content : link });
            });
            _res += '\n';
        }

        this.exports && (_res += apply(this.exports));

        res += _res;
    });

    return res;
});
