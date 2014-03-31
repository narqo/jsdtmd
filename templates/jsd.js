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

match(this.jsdocType === 'root')(
    function() {
        // Fallback if no modules exports
        return '';
    },
    match(this.modules)(function() {
        var res = '';
        this.modules.forEach(function(ctx) {
            res += apply({ _depth : this._depth + 1, modules : undefined }, ctx);
        }, this);
        return res;
    }),
    function() {
        this.log('root');
        return applyNext();
    }
);

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

        this._moduleDesc && (_res += apply({ block : 'para', content : this._moduleDesc }));
        this.exports && (_res += apply(this.exports));

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'class')(function() {
    this.log('class', '@depth', this._depth);

    var depth = this._depth,
        classSign = apply('signature'),
        res = apply({ block : 'headline', mods : { level : depth++ }, content : classSign }),
        clsAugments = this.augments;

    if(clsAugments) {
        res += apply({
            block : 'para',
            content : 'Aughtments ' + apply('jstype-type', clsAugments)
        });
    }

    this.description && (res += apply({ block : 'para', content : this.description }));

    var clsStatic = this.static,
        nestedDepth = depth + 1,
        resBuf = '';

    if(this.cons) {
        resBuf = apply({ name : this.name, _depth : nestedDepth }, this.cons);
        if(resBuf) {
            res += apply({
                block : 'headline',
                mods : { level : depth },
                content : 'Constructor'
            }) + resBuf;
            resBuf = '';
        }
    }

    if(this.members) {
        resBuf = apply(this.members, { _depth : nestedDepth });
        if(resBuf) {
            res += apply({
                block : 'headline',
                mods : { level : depth },
                content : 'Instance properties'
            }) + resBuf;
            resBuf = '';
        }
    }

    if(this.proto) {
        resBuf = apply(this.proto, { _depth : nestedDepth });
        if(resBuf) {
            res += apply({
                block : 'headline',
                mods : { level : depth },
                content : 'Instance methods'
            }) + resBuf;
            resBuf = '';
        }
    }

    if(clsStatic) {
        var clsPropsBuf = '',
            clsMethodsBuf = '';

        if(clsStatic.jsType === 'Object' && clsStatic.props) {
            clsStatic.props.forEach(function(prop) {
                var _res = apply({
                        _depth : nestedDepth,
                        jsdocType : clsStatic.jsdocType,
                        jsType : clsStatic.jsType
                    }, prop);
                prop.val && prop.val.jsType === 'Function'?
                    clsMethodsBuf += _res :
                    clsPropsBuf += _res;
            });
        }

        if(clsPropsBuf) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Static properties' });
            res += clsPropsBuf;
        }

        if(clsMethodsBuf) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Static methods' });
            res += clsMethodsBuf;
        }
    }

    if(this.events) {
        this.events.forEach(function(ctx) {
            resBuf += apply(ctx, { _depth : nestedDepth, events : undefined });
        });
        if(resBuf) {
            res += apply({
                block : 'headline',
                mods : { level : depth },
                content : 'Events'
            }) + resBuf;
            resBuf = '';
        }
    }

    return res;
});

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

match(this.jsdocType === 'returns')(function() {
    this.log('returns', '@depth', this._depth);

    var jsType = apply('jstype-type'),
        res = apply({ block : 'para', content : jsType });

    this.description &&
        (res += apply({ block : 'para', content : this.description }));

    return res;
});

match(this.jsdocType === 'event')(function() {
    this.log('event', '@depth', this._depth);

    var depth = this._depth,
        evtSign = applyNext('signature'),
        res = apply({ block : 'headline', mods : { level : depth }, content : evtSign });

    this.description && (res += apply({ block : 'para', content : this.description }));

    var params = this.params;
    if(params) {
        res += apply({ block : 'headline', mods : { level : depth }, content : 'Event Payload:' });
        params.forEach(function(ctx) {
            res += apply({ params : undefined }, ctx);
        }, this);
        res += '\n';
    }

    return res;
});
