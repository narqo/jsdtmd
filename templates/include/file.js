match(this.jsdocType === 'file')(function() {
    this.log('file', '@depth', this._depth);
    return applyNext({ _filePath : this.description, description : undefined });
});
