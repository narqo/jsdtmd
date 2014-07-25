match(this.jsdocType === 'root')(
    function() {
        this.log('root');
        return applyNext();
    }
);
