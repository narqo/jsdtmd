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
