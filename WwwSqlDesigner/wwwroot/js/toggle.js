/* ------------------ minimize/restore bar ----------- */

SQL.Toggle = function (elm) {
    this._state = null;
    this._elm = elm;
    $(elm).on("click", this._click.bind(this));

    let defaultState = true;
    if (document.location.href.match(/toolbar=hidden/)) {
        defaultState = false;
    }
    this._switch(defaultState);
};

SQL.Toggle.prototype._click = function (e) {
    this._switch(!this._state);
};

SQL.Toggle.prototype._switch = function (state) {
    this._state = state;
    if (this._state) {
        $("#bar").css("maxHeight", "");
    } else {
        $("#bar").css("overflow", "hidden");
        $("#bar").css("maxHeight", this._elm.offsetHeight + "px");
    }
    this._elm.className = this._state ? "on" : "off";
};
