/* ----------------- key manager ---------- */

SQL.KeyManager = function (owner) {
    this.owner = owner;
    this.dom = {
        container: $("#keys").get(0),
    };
    this.build();
};

SQL.KeyManager.prototype.build = function () {
    this.dom.list = $("#keyslist").get(0);
    this.dom.type = $("#keytype").get(0);
    this.dom.name = $("#keyname").get(0);
    this.dom.left = $("#keyleft").get(0);
    this.dom.right = $("#keyright").get(0);
    this.dom.fields = $("#keyfields").get(0);
    this.dom.avail = $("#keyavail").get(0);
    this.dom.listlabel = $("#keyslistlabel").get(0);

    let ids = ["keyadd", "keyremove"];
    for (let id of ids) {
        const elm = $("#" + id).get(0);
        this.dom[id] = elm;
        elm.value = _(id);
    }

    ids = [
        "keyedit",
        "keytypelabel",
        "keynamelabel",
        "keyfieldslabel",
        "keyavaillabel",
    ];
    for (let id of ids) {
        const elm = $("#" + id).get(0);
        elm.innerHTML = _(id);
    }

    const types = ["PRIMARY", "INDEX", "UNIQUE", "FULLTEXT"];
    $(this.dom.type).empty();
    for (let type of types) {
        const o = $("<option></option>").get(0);
        o.innerHTML = type;
        o.value = type;
        this.dom.type.appendChild(o);
    }

    this.purge = this.purge.bind(this);

    $(this.dom.list).on("change", this.listchange.bind(this));
    $(this.dom.type).on("change", this.typechange.bind(this));
    $(this.dom.name).on("keyup", this.namechange.bind(this));
    $(this.dom.keyadd).on("click", this.add.bind(this));
    $(this.dom.keyremove).on("click", this.remove.bind(this));
    $(this.dom.left).on("click", this.left.bind(this));
    $(this.dom.right).on("click", this.right.bind(this));

    $(this.dom.container).detach();
};

SQL.KeyManager.prototype.listchange = function (e) {
    this.switchTo(this.dom.list.selectedIndex);
};

SQL.KeyManager.prototype.typechange = function (e) {
    this.key.setType(this.dom.type.value);
    this.redrawListItem();
};

SQL.KeyManager.prototype.namechange = function (e) {
    this.key.setName(this.dom.name.value);
    this.redrawListItem();
};

SQL.KeyManager.prototype.add = function (e) {
    const type = this.table.keys.length ? "INDEX" : "PRIMARY";
    this.table.addKey(type);
    this.sync(this.table);
    this.switchTo(this.table.keys.length - 1);
};

SQL.KeyManager.prototype.remove = function (e) {
    const index = this.dom.list.selectedIndex;
    if (index == -1) {
        return;
    }
    const r = this.table.keys[index];
    this.table.removeKey(r);
    this.sync(this.table);
};

SQL.KeyManager.prototype.purge = function () {
    /* remove empty keys */
    for (let i = this.table.keys.length - 1; i >= 0; i--) {
        const k = this.table.keys[i];
        if (!k.rows.length) {
            this.table.removeKey(k);
        }
    }
};

SQL.KeyManager.prototype.sync = function (table) {
    /* sync content with given table */
    this.table = table;
    this.dom.listlabel.innerHTML = _("keyslistlabel").replace(
        /%s/,
        table.getTitle()
    );

    $(this.dom.list).empty();
    for (let i = 0; i < table.keys.length; i++) {
        const k = table.keys[i];
        const o = $("<option></option>").get(0);
        this.dom.list.appendChild(o);
        const str = i + 1 + ": " + k.getLabel();
        o.innerHTML = str;
    }
    if (table.keys.length) {
        this.switchTo(0);
    } else {
        this.disable();
    }
};

SQL.KeyManager.prototype.redrawListItem = function () {
    const index = this.table.keys.indexOf(this.key);
    this.option.innerHTML = index + 1 + ": " + this.key.getLabel();
};

SQL.KeyManager.prototype.switchTo = function (index) {
    /* show Nth key */
    this.enable();
    const k = this.table.keys[index];
    this.key = k;
    this.option = this.dom.list.getElementsByTagName("option")[index];

    this.dom.list.selectedIndex = index;
    this.dom.name.value = k.getName();

    const opts = this.dom.type.getElementsByTagName("option");
    for (let i = 0; i < opts.length; i++) {
        if (opts[i].value == k.getType()) {
            this.dom.type.selectedIndex = i;
        }
    }

    $(this.dom.fields).empty();
    for (let row of k.rows) {
        const o = $("<option></option>").get(0);
        o.innerHTML = row.getTitle();
        o.value = o.innerHTML;
        this.dom.fields.appendChild(o);
    }

    $(this.dom.avail).empty();
    for (let row of this.table.rows) {
        if (k.rows.indexOf(row) != -1) {
            continue;
        }
        const o = $("<option></option>").get(0);
        o.innerHTML = row.getTitle();
        o.value = o.innerHTML;
        this.dom.avail.appendChild(o);
    }
};

SQL.KeyManager.prototype.disable = function () {
    $(this.dom.fields).empty();
    $(this.dom.avail).empty();
    this.dom.keyremove.disabled = true;
    this.dom.left.disabled = true;
    this.dom.right.disabled = true;
    this.dom.list.disabled = true;
    this.dom.name.disabled = true;
    this.dom.type.disabled = true;
    this.dom.fields.disabled = true;
    this.dom.avail.disabled = true;
};

SQL.KeyManager.prototype.enable = function () {
    this.dom.keyremove.disabled = false;
    this.dom.left.disabled = false;
    this.dom.right.disabled = false;
    this.dom.list.disabled = false;
    this.dom.name.disabled = false;
    this.dom.type.disabled = false;
    this.dom.fields.disabled = false;
    this.dom.avail.disabled = false;
};

SQL.KeyManager.prototype.left = function (e) {
    /* add field to index */
    const opts = this.dom.avail.getElementsByTagName("option");
    for (let opt of opts) {
        if (opt.selected) {
            const row = this.table.findNamedRow(opt.value);
            this.key.addRow(row);
        }
    }
    this.switchTo(this.dom.list.selectedIndex);
};

SQL.KeyManager.prototype.right = function (e) {
    /* remove field from index */
    const opts = this.dom.fields.getElementsByTagName("option");
    for (let opt of opts) {
        if (opt.selected) {
            const row = this.table.findNamedRow(opt.value);
            this.key.removeRow(row);
        }
    }
    this.switchTo(this.dom.list.selectedIndex);
};

SQL.KeyManager.prototype.open = function (table) {
    this.sync(table);
    this.owner.window.open(_("tablekeys"), this.dom.container, this.purge);
};
