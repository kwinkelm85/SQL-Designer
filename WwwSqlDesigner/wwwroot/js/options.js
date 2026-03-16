/* --------------------- options ------------ */

SQL.Options = function (owner) {
    this.owner = owner;
    this.dom = {
        container: $("#opts").get(0),
        btn: $("#options").get(0),
    };
    this.dom.btn.value = _("options");
    this.save = this.save.bind(this);
    this.build();
};

SQL.Options.prototype.build = function () {
    this.dom.optionlocale = $("#optionlocale").get(0);
    this.dom.optiondb = $("#optiondb").get(0);
    this.dom.optionsnap = $("#optionsnap").get(0);
    this.dom.optionpattern = $("#optionpattern").get(0);
    this.dom.optionstyle = $("#optionstyle").get(0);
    this.dom.optionhide = $("#optionhide").get(0);
    this.dom.optionvector = $("#optionvector").get(0);
    this.dom.optionshowsize = $("#optionshowsize").get(0);
    this.dom.optionshowtype = $("#optionshowtype").get(0);

    let ids = [
        "language",
        "db",
        "snap",
        "pattern",
        "style",
        "hide",
        "vector",
        "showsize",
        "showtype",
        "optionsnapnotice",
        "optionpatternnotice",
        "optionsnotice",
    ];
    for (let id of ids) {
        const elm = $("#" + id).get(0);
        elm.innerHTML = _(id);
    }

    const ls = CONFIG.AVAILABLE_LOCALES;
    $(this.dom.optionlocale).empty();
    for (let i = 0; i < ls.length; i++) {
        const o = $("<option></option>").get(0);
        o.value = ls[i];
        o.innerHTML = ls[i];
        this.dom.optionlocale.appendChild(o);
        if (this.owner.getOption("locale") == ls[i]) {
            this.dom.optionlocale.selectedIndex = i;
        }
    }

    const dbs = CONFIG.AVAILABLE_DBS;
    $(this.dom.optiondb).empty();
    for (let i = 0; i < dbs.length; i++) {
        const o = $("<option></option>").get(0);
        o.value = dbs[i];
        o.innerHTML = dbs[i];
        this.dom.optiondb.appendChild(o);
        if (this.owner.getOption("db") == dbs[i]) {
            this.dom.optiondb.selectedIndex = i;
        }
    }

    const styles = CONFIG.STYLES;
    $(this.dom.optionstyle).empty();
    for (let i = 0; i < styles.length; i++) {
        const o = $("<option></option>").get(0);
        o.value = styles[i];
        o.innerHTML = styles[i];
        this.dom.optionstyle.appendChild(o);
        if (this.owner.getOption("style") == styles[i]) {
            this.dom.optionstyle.selectedIndex = i;
        }
    }

    $(this.dom.btn).on("click", this.click.bind(this));

    $(this.dom.container).detach();
};

SQL.Options.prototype.save = function () {
    this.owner.setOption("locale", this.dom.optionlocale.value);

    var oldDb = this.owner.getOption("db");
    var newDb = this.dom.optiondb.value;
    if (oldDb != newDb) {
        this.owner.setOption("db", newDb);
        this.owner.updateDB(newDb);
    }
    this.owner.setOption("snap", this.dom.optionsnap.value);
    this.owner.setOption("pattern", this.dom.optionpattern.value);
    this.owner.setOption("style", this.dom.optionstyle.value);
    this.owner.setOption("hide", this.dom.optionhide.checked ? "1" : "");
    this.owner.setOption("vector", this.dom.optionvector.checked ? "1" : "");
    this.owner.setOption(
        "showsize",
        this.dom.optionshowsize.checked ? "1" : ""
    );
    this.owner.setOption(
        "showtype",
        this.dom.optionshowtype.checked ? "1" : ""
    );
};

SQL.Options.prototype.click = function () {
    this.owner.window.open(_("options"), this.dom.container, this.save);
    this.dom.optionsnap.value = this.owner.getOption("snap");
    this.dom.optionpattern.value = this.owner.getOption("pattern");
    this.dom.optionhide.checked = this.owner.getOption("hide");
    this.dom.optionvector.checked = this.owner.getOption("vector");
    this.dom.optionshowsize.checked = this.owner.getOption("showsize");
    this.dom.optionshowtype.checked = this.owner.getOption("showtype");
};
