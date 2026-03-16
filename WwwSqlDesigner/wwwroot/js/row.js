/* --------------------- table row ( = db column) ------------ */
SQL.Row = function (owner, title, data) {
    this.owner = owner;
    this.relations = [];
    this.keys = [];
    this.selected = false;
    this.expanded = false;

    SQL.Visual.apply(this);

    this.data.type = 0;
    this.data.size = "";
    this.data.def = null;
    this.data.nll = true;
    this.data.ai = false;
    this.data.comment = "";

    if (data) {
        this.update(data);
    }
    this.setTitle(title);
};
SQL.Row.prototype = Object.create(SQL.Visual.prototype);

SQL.Row.prototype._build = function () {
    this.dom.container = $("<tbody></tbody>").get(0);
    this.dom.content = $("<tr></tr>").get(0);
    this.dom.selected = $("<div class='selected'>&raquo;&nbsp;</div>").get(0);
    this.dom.title = $("<div class='title'></div>").get(0);

    const td1 = $("<td></td>").get(0);
    const td2 = $("<td class='typehint'></td>").get(0);
    this.dom.typehint = td2;

    $(td1).append(this.dom.selected);
    $(td1).append(this.dom.title);
    $(this.dom.content).append(td1);
    $(this.dom.content).append(td2);
    $(this.dom.container).append(this.dom.content);

    this.enter = this.enter.bind(this);
    this.changeComment = this.changeComment.bind(this);

    $(this.dom.container).on("click", this.click.bind(this));
    $(this.dom.container).on("dblclick", this.dblclick.bind(this));
};

SQL.Row.prototype.select = function () {
    if (this.selected) {
        return;
    }
    this.selected = true;
    for (let relation of this.relations) {
        relation.highlight();
    }
    this.redraw();
};

SQL.Row.prototype.deselect = function () {
    if (!this.selected) {
        return;
    }
    this.selected = false;
    for (let relation of this.relations) {
        relation.dehighlight();
    }
    this.redraw();
    this.collapse();
};

SQL.Row.prototype.setTitle = function (t) {
    const old = this.getTitle();
    for (let relation of this.relations) {
        if (relation.row1 != this) {
            continue;
        }
        const tt = relation.row2.getTitle().replace(new RegExp(old, "g"), t);
        if (tt != relation.row2.getTitle()) {
            relation.row2.setTitle(tt);
        }
    }

    SQL.Visual.prototype.setTitle.apply(this, [t]);
};

SQL.Row.prototype.click = function (e) {
    /* clicked on row */
    SQL.publish("rowclick", this);
    this.owner.owner.rowManager.select(this);
};

SQL.Row.prototype.dblclick = function (e) {
    /* dblclicked on row */
    e.preventDefault();
    e.stopPropagation();
    this.expand();
};

SQL.Row.prototype.update = function (data) {
    /* update subset of row data */
    const des = SQL.Designer;
    if (data.nll && data.def && data.def.match(/^null$/i)) {
        data.def = null;
    }

    for (let p in data) {
        this.data[p] = data[p];
    }
    if (!this.data.nll && this.data.def === null) {
        this.data.def = "";
    }

    for (let relation of this.relations) {
        if (relation.row1 == this) {
            relation.row2.update({
                type: des.getFKTypeFor(this.data.type),
                size: this.data.size,
            });
        }
    }
    this.redraw();
};

SQL.Row.prototype.up = function () {
    /* shift up */
    const r = this.owner.rows;
    const idx = r.indexOf(this);
    if (!idx) {
        return;
    }
    r[idx - 1].dom.container.parentNode.insertBefore(
        this.dom.container,
        r[idx - 1].dom.container
    );
    r.splice(idx, 1);
    r.splice(idx - 1, 0, this);
    this.redraw();
};

SQL.Row.prototype.down = function () {
    /* shift down */
    const r = this.owner.rows;
    const idx = r.indexOf(this);
    if (idx + 1 == this.owner.rows.length) {
        return;
    }
    r[idx].dom.container.parentNode.insertBefore(
        this.dom.container,
        r[idx + 1].dom.container.nextSibling
    );
    r.splice(idx, 1);
    r.splice(idx + 1, 0, this);
    this.redraw();
};

SQL.Row.prototype.buildEdit = function () {
    $(this.dom.container).empty();

    const elms = [];
    this.dom.name = $("<input type='text'>").get(0);
    elms.push(["name", this.dom.name]);
    $(this.dom.name).on("keypress", this.enter);

    this.dom.type = this.buildTypeSelect(this.data.type);
    elms.push(["type", this.dom.type]);

    this.dom.size = $("<input type='text'>").get(0);
    elms.push(["size", this.dom.size]);

    this.dom.def = $("<input type='text'>").get(0);
    elms.push(["def", this.dom.def]);

    this.dom.ai = $("<input type='checkbox'>").get(0);
    elms.push(["ai", this.dom.ai]);

    this.dom.nll = $("<input type='checkbox'>").get(0);
    elms.push(["null", this.dom.nll]);

    this.dom.comment = $("<span class='comment'></span>").get(0);
    this.dom.comment.innerHTML = "";
    this.dom.comment.appendChild(document.createTextNode(this.data.comment));

    this.dom.commentbtn = $("<input type='button' id='commentbtn'>").val(_("comment")).get(0);
    $(this.dom.commentbtn).on("click", this.changeComment);

    let tr;
    let td1;
    let td2
    for (let row of elms) {
        tr = $("<tr></tr>");
        td1 = $("<td></td>");
        td2 = $("<td></td>");
        td1.text(_(row[0]) + ": ");
        td2.append(row[1]);
        tr.append(td1).append(td2);
        $(this.dom.container).append(tr);
    }

    tr = $("<tr></tr>");
    td1 = $("<td></td>");
    td2 = $("<td></td>");
    td1.append(this.dom.comment);
    td2.append(this.dom.commentbtn);
    tr.append(td1).append(td2);
    $(this.dom.container).append(tr);
};

SQL.Row.prototype.changeComment = function (e) {
    const c = prompt(_("commenttext"), this.data.comment);
    if (c === null) {
        return;
    }
    this.data.comment = c;
    this.dom.comment.innerHTML = "";
    this.dom.comment.appendChild(document.createTextNode(this.data.comment));
};

SQL.Row.prototype.expand = function () {
    if (this.expanded) {
        return;
    }
    this.expanded = true;
    this.buildEdit();
    this.load();
    this.redraw();
    $(this.dom.container).addClass("expanded");
    this.dom.name.focus();
    this.dom.name.select();
};

SQL.Row.prototype.collapse = function () {
    if (!this.expanded) {
        return;
    }
    this.expanded = false;
    $(this.dom.container).removeClass("expanded");

    const data = {
        type: this.dom.type.selectedIndex,
        def: this.dom.def.value,
        size: this.dom.size.value,
        nll: this.dom.nll.checked,
        ai: this.dom.ai.checked,
    };

    $(this.dom.container).empty();
    this.dom.container.appendChild(this.dom.content);

    this.update(data);
    this.setTitle(this.dom.name.value);
};

SQL.Row.prototype.load = function () {
    /* put data to expanded form */
    this.dom.name.value = this.getTitle();
    let def = this.data.def;
    if (def === null) {
        def = "NULL";
    }

    // Check if elements exist (in case buildEdit failed or something)
    if (this.dom.def) this.dom.def.value = def;
    if (this.dom.size) this.dom.size.value = this.data.size;
    if (this.dom.nll) this.dom.nll.checked = this.data.nll;
    if (this.dom.ai) this.dom.ai.checked = this.data.ai;
};

SQL.Row.prototype.redraw = function () {
    const color = this.getColor();
    this.dom.container.style.backgroundColor = color;
    this.dom.container.style.borderColor = color;
    $(this.dom.title).removeClass("primary key");
    if (this.isPrimary()) {
        $(this.dom.title).addClass("primary");
    }
    if (this.isKey()) {
        $(this.dom.title).addClass("key");
    }
    this.dom.selected.style.display = this.selected ? "" : "none";
    this.dom.container.title = this.data.comment;

    const typehint = [];
    if (this.owner.owner.getOption("showtype")) {
        const elm = this.getDataType();
        typehint.push(elm.getAttribute("sql"));
    }

    if (this.owner.owner.getOption("showsize") && this.data.size) {
        typehint.push("(" + this.data.size + ")");
    }

    this.dom.typehint.innerHTML = typehint.join(" ");
    this.owner.redraw();
    this.owner.owner.rowManager.redraw();
};

SQL.Row.prototype.addRelation = function (r) {
    this.relations.push(r);
};

SQL.Row.prototype.removeRelation = function (r) {
    const idx = this.relations.indexOf(r);
    if (idx == -1) {
        return;
    }
    this.relations.splice(idx, 1);
};

SQL.Row.prototype.addKey = function (k) {
    this.keys.push(k);
    this.redraw();
};

SQL.Row.prototype.removeKey = function (k) {
    const idx = this.keys.indexOf(k);
    if (idx == -1) {
        return;
    }
    this.keys.splice(idx, 1);
    this.redraw();
};

SQL.Row.prototype.getDataType = function () {
    const type = this.data.type;
    const elm = DATATYPES.getElementsByTagName("type")[type];
    return elm;
};

SQL.Row.prototype.getColor = function () {
    const elm = this.getDataType();
    const g = this.getDataType().parentNode;
    return elm.getAttribute("color") || g.getAttribute("color") || "#fff";
};

SQL.Row.prototype.buildTypeSelect = function (id) {
    /* build selectbox with avail datatypes */
    const s = $("<select></select>").get(0);
    const gs = DATATYPES.getElementsByTagName("group");
    for (let g of gs) {
        const og = $("<optgroup></optgroup>").get(0);
        og.style.backgroundColor = g.getAttribute("color") || "#fff";
        og.label = g.getAttribute("label");
        s.appendChild(og);
        const ts = g.getElementsByTagName("type");
        for (let t of ts) {
            const o = $("<option></option>").get(0);
            if (t.getAttribute("color")) {
                o.style.backgroundColor = t.getAttribute("color");
            }
            if (t.getAttribute("note")) {
                o.title = t.getAttribute("note");
            }
            o.innerHTML = t.getAttribute("label");
            og.appendChild(o);
        }
    }
    s.selectedIndex = id;
    return s;
};

SQL.Row.prototype.destroy = function () {
    SQL.Visual.prototype.destroy.apply(this);
    while (this.relations.length) {
        this.owner.owner.removeRelation(this.relations[0]);
    }
    for (let key of this.keys) {
        key.removeRow(this);
    }
};

SQL.Row.prototype.toXML = function () {
    let xml = "";

    let t = this.getTitle().replace(/"/g, "&quot;");
    const nn = this.data.nll ? "1" : "0";
    const ai = this.data.ai ? "1" : "0";
    xml +=
        '<row name="' + t + '" null="' + nn + '" autoincrement="' + ai + '">\n';

    const elm = this.getDataType();
    t = elm.getAttribute("sql");
    if (this.data.size.length) {
        t += "(" + this.data.size + ")";
    }
    xml += "<datatype>" + t + "</datatype>\n";

    if (this.data.def || this.data.def === null) {
        const q = elm.getAttribute("quote");
        let d = this.data.def;
        if (d === null) {
            d = "NULL";
        } else if (d != "CURRENT_TIMESTAMP") {
            d = q + d + q;
        }
        xml += "<default>" + SQL.escape(d) + "</default>";
    }

    for (let relation of this.relations) {
        if (relation.row2 != this) {
            continue;
        }
        xml +=
            '<relation table="' +
            relation.row1.owner.getTitle() +
            '" row="' +
            relation.row1.getTitle() +
            '" />\n';
    }

    if (this.data.comment) {
        xml += "<comment>" + SQL.escape(this.data.comment) + "</comment>\n";
    }

    xml += "</row>\n";
    return xml;
};

SQL.Row.prototype.fromXML = function (node) {
    const name = node.getAttribute("name");

    const obj = { type: 0, size: "" };
    obj.nll = node.getAttribute("null") == "1";
    obj.ai = node.getAttribute("autoincrement") == "1";

    const cs = node.getElementsByTagName("comment");
    if (cs.length && cs[0].firstChild) {
        obj.comment = cs[0].firstChild.nodeValue;
    }

    let d = node.getElementsByTagName("datatype");
    if (d.length && d[0].firstChild) {
        const s = d[0].firstChild.nodeValue;
        const r = s.match(/^([^\(]+)(\((.*)\))?.*$/);
        const type = r[1];
        if (r[3]) {
            obj.size = r[3];
        }
        const types = window.DATATYPES.getElementsByTagName("type");
        for (let i = 0; i < types.length; i++) {
            const sql = types[i].getAttribute("sql");
            const re = types[i].getAttribute("re");
            if (sql == type || (re && new RegExp(re).exec(type))) {
                obj.type = i;
            }
        }
    }

    const elm = DATATYPES.getElementsByTagName("type")[obj.type];
    d = node.getElementsByTagName("default");
    if (d.length && d[0].firstChild) {
        const def = d[0].firstChild.nodeValue;
        obj.def = def;
        const q = elm.getAttribute("quote");
        if (q) {
            const re = new RegExp("^" + q + "(.*)" + q + "$");
            const r = def.match(re);
            if (r) {
                obj.def = r[1];
            }
        }
    }

    this.update(obj);
    this.setTitle(name);
};

SQL.Row.prototype.isPrimary = function () {
    for (let key of this.keys) {
        if (key.getType() == "PRIMARY") {
            return true;
        }
    }
    return false;
};

SQL.Row.prototype.isUnique = function () {
    for (let key of this.keys) {
        if (key.getType() == "PRIMARY" || key.getType() == "UNIQUE") {
            return true;
        }
    }
    return false;
};

SQL.Row.prototype.isKey = function () {
    return this.keys.length > 0;
};

SQL.Row.prototype.enter = function (e) {
    if (e.keyCode == 13) {
        this.collapse();
    }
};
