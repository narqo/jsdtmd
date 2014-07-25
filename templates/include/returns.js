match(this.jsdocType === 'returns')(function() {
    this.log('returns', '@depth', this._depth);

    var jsType = apply('jstype-type'),
        res = apply({ block : 'para', content : jsType });

    this.description &&
        (res += apply({ block : 'para', content : this.description }));

    return res;
});
