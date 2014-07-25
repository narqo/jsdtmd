match(this.jsdocType === 'class')(function() {
    this.log('class', '@depth', this._depth);

    var depth = this._depth,
        bem = this.bem,
        clsAugments = this.augments,
        classSign,
        resBuf = '';

    // BEM item description
    if(bem) {
        classSign = apply('signature', bem);
        var params = bem.params;
        if(params) {
            resBuf += apply({ block : 'headline', mods : { level : depth + 1 }, content : 'Block parameters:' });
            params.forEach(function(ctx) {
                resBuf += apply({ params : undefined }, ctx);
            }, this);
            resBuf += '\n';
        }
    } else {
        classSign = apply('signature');
    }

    var res = apply({ block : 'headline', mods : { level : depth++ }, content : classSign });

    // Augments
    if(clsAugments) {
        res += apply({
            block : 'para',
            content : 'Aughtments ' + apply('jstype-type', clsAugments)
        });
    }

    if(resBuf) {
        res += resBuf;
    }
    resBuf = '';

    this.description && (res += apply({ block : 'para', content : this.description }));

    var clsStatic = this.static,
        nestedDepth = depth + 1;

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
