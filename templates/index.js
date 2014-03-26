match(true)(function() {
    return applyNext();
});

match(!this.jsdocType)(function() {
    console.log('⇢ ANY');

    return '';
});

match(this.jsdocType === 'root')(function() {
    console.log('⇢ root');

    return this.modules.map(function(it) { return apply(it) });
});

match(this.jsdocType === 'module')(function() {
    console.log('⇢ module');

    return [
        apply({ block : 'headline', mods : { level : 1 }, content : this.name }),
        (this.description? apply({ block : 'para', content : this.description }) : ''),
        apply(this.exports)
    ]
    .join('');
});

match(this.jsdocType === 'class')(function() {
    console.log('⇢ class');

    // TODO:
});

match(this.jsdocType === 'type')(
    match(this.jsType)(function() {
        return '';
    }),
    match(this.jsType === 'Object')(function() {
        console.log('⇢ type Object');

        return '{\n\n' + this.props.map(function(it) {
            var headline = it.key,
                val = it.val;

            val.jsType === 'Function' &&
                (headline += ' ' + apply('signature', val));

            return [
                apply({ block : 'headline', mods : { level : 2 }, content : headline }),
                apply(val)
            ].join('')
        }).join('') + '}';
    }),
    match(this.jsType === 'Function')(
        match(true)(function() {
            console.log('⇢ type Function');

            return [
                this.description? apply({ block : 'para', content : this.description }) : '',
                
            ].join('');
        }),
        match(this._mode === 'signature')(function() {
            console.log('⇢ type Function (signature)');

            return '( ' +
                (this.params? this.params.map(function(it) { return apply(it) }).join(', ') : '') +
                ' )' +
                (this.returns? ' → ' + apply(this.returns) : '')
        })
    )
);

match(this.jsdocType === 'param')(function() {
    console.log('⇢ param');

    var res = this.name;
    this.isOptional && (res = '[' + res + ']');
    this.jsType && (res = '{' + this.jsType + '} ' + res);
    return res;
});

match(this.jsdocType === 'returns')(function() {
    console.log('⇢ returns');

    var jsType = this.jsType;
    return '{' + (Array.isArray(jsType)? jsType.join(' | ') : jsType) + '}';
});

// ---

block('headline')(
    mod('level', 1)(function() { return '# ' + this.content + '\n\n' }),
    mod('level', 2)(function() { return '## ' + this.content + '\n\n' }),
    mod('level', 3)(function() { return '### ' + this.content + '\n\n' }),
    mod('level', 4)(function() { return '#### ' + this.content + '\n\n' })
);

block('para')(function() { return this.content + '\n\n' });

block('link')(function() {
    var res = this.url;
    this.content && (res = '[' + this.content + '](' + res + ')');
    return res;
});
