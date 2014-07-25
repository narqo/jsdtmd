match(this.jsdocType === 'type')(
    match(this.jsType)(
        function() {
            var res = '';

            if(this.jsType !== 'Function') {
                // `Function`'s signature will be processed within `jsType === 'Function'`
                var objectSign = apply('signature');
                res += apply({ block : 'headline', mods : { level : this._depth }, content : objectSign });
            }

            this.description &&
            (res += apply({ block : 'para', content : this.description }));

            this.jsValue &&
            (res += apply({ block : 'para', content : 'Value: "' + this.jsValue + '"' }));

            return res;
        },
        match(function() {
            return this.classes && this.classes.hasOwnProperty(this.jsType)
        })(function() {
            this.log('type (custom classes)', this.jsType, '@depth', this._depth);
            return apply(this.classes[this.jsType]);
        })
    ),
    match(this.jsType === 'Object')(
        match(this.key && this.val)(function() {
            var val = this.val;
            return val.jsdocType === 'class'?
                apply(val) :
                apply({ name : this.key, key : undefined, val : undefined }, val);
        }),
        match(this.props)(function() {
            var res = '';
            this.props.forEach(function(ctx) {
                res += apply({ props : undefined }, ctx);
            });
            return res;
        })
    ),
    match(this.jsType === 'Function')(function() {
        var res = '',
            funcSign = apply('signature');

        res += apply({ block : 'headline', mods : { level : this._depth }, content : funcSign });

        this.description && (res += apply({ block : 'para', content : this.description }));

        var depth = this._depth + 1,
            params = this.params,
            returns = this.returns;

        if(params) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
            params.forEach(function(ctx) {
                res += apply({ params : undefined }, ctx);
            }, this);
            res += '\n';
        }

        if(returns) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Returns:' });
            res += apply(returns);
        }

        return res;
    }),
    match(this.accessLevel === 'private')(function() {
        this.log('type', this.jsType, '(skip private)', this.name);
        return '';
    }),
    function() {
        this.log('type', this.jsType, '@depth', this._depth);
        return applyNext();
    }
);
