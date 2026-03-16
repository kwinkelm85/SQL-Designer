/* -------------------- base visual element -------------------- */
SQL.Visual = function () {
    this._init();
    this._build();
};

SQL.Visual.prototype._init = function () {
    this.dom = {
        container: null,
        title: null,
    };
    this.data = {
        title: "",
    };
};

SQL.Visual.prototype._build = function () { };

SQL.Visual.prototype.toXML = function () { };

SQL.Visual.prototype.fromXML = function (node) { };

SQL.Visual.prototype.destroy = function () {
    /* "destructor" */
    $(this.dom.container).remove();
};

SQL.Visual.prototype.setTitle = function (text) {
    if (!text) {
        return;
    }
    this.data.title = text;
    this.dom.title.innerHTML = text;
};

SQL.Visual.prototype.getTitle = function () {
    return this.data.title;
};

SQL.Visual.prototype.redraw = function () { };
