SQL.IO = function (owner) {
    this.owner = owner;
    this._name = ""; /* last used name with server load/save */
    this.lastUsedName =
        ""; /* last used name with local storage */
    this.dom = {
        container: $("#io").get(0),
    };

    let ids = [
        "saveload",
        "clientlocalsave",
        "clientsave",
        "clientlocalload",
        "clientlocallist",
        "clientload",
        "clientsql",
        "clientef",
        "quicksave",
        "serversave",
        "serverload",
        "serverlist",
        "serverimport",
        "serveraudit",
    ];
    for (let id of ids) {
        let elm = $("#" + id).get(0);
        this.dom[id] = elm;
        elm.value = _(id);
    }

    this.dom.quicksave.value += " (F2)";

    ids = ["client", "server", "output", "backendlabel"];
    for (let id of ids) {
        let elm = $("#" + id).get(0);
        elm.innerHTML = _(id);
    }

    this.dom.ta = $("#textarea").get(0);
    this.dom.backend = $("#backend").get(0);

    $(this.dom.container).detach();
    $(this.dom.container).css("visibility", "");

    this.saveresponse = this.saveresponse.bind(this);
    this.loadresponse = this.loadresponse.bind(this);
    this.listresponse = this.listresponse.bind(this);
    this.importresponse = this.importresponse.bind(this);

    $(this.dom.saveload).on("click", this.click.bind(this));
    $(this.dom.clientlocalsave).on("click", this.clientlocalsave.bind(this));
    $(this.dom.clientsave).on("click", this.clientsave.bind(this));
    $(this.dom.clientlocalload).on("click", this.clientlocalload.bind(this));
    $(this.dom.clientlocallist).on("click", this.clientlocallist.bind(this));
    $(this.dom.clientload).on("click", this.clientload.bind(this));
    $(this.dom.clientsql).on("click", this.clientsql.bind(this));
    $(this.dom.clientef).on("click", this.clientef.bind(this));
    $(this.dom.quicksave).on("click", this.quicksave.bind(this));
    $(this.dom.serversave).on("click", this.serversave.bind(this));
    $(this.dom.serverload).on("click", this.serverload.bind(this));
    $(this.dom.serverlist).on("click", this.serverlist.bind(this));
    $(this.dom.serverimport).on("click", this.serverimport.bind(this));
    $(this.dom.serveraudit).on("click", this.serveraudit.bind(this));
    $(document).on("keydown", this.press.bind(this));
    this.build();
};

SQL.IO.prototype.build = function () {
    $(this.dom.backend).empty();

    const bs = CONFIG.AVAILABLE_BACKENDS;
    let be = CONFIG.DEFAULT_BACKEND;
    const r = window.location.search.substring(1).match(/backend=([^&]*)/);
    if (r) {
        const req = r[1];
        if (bs.indexOf(req) != -1) {
            be = req;
        }
    }
    for (let i = 0; i < bs.length; i++) {
        let o = $("<option></option>").get(0);
        o.value = bs[i];
        o.innerHTML = bs[i];
        this.dom.backend.appendChild(o);
        if (bs[i] == be) {
            this.dom.backend.selectedIndex = i;
        }
    }
};

SQL.IO.prototype.click = function () {
    /* open io dialog */
    this.build();
    this.dom.ta.value = "";
    this.dom.clientsql.value =
        _("clientsql") + " (" + window.DATATYPES.getAttribute("db") + ")";
    this.owner.window.open(_("saveload"), this.dom.container);
};

SQL.IO.prototype.fromXMLText = function (xml) {
    let xmlDoc;
    try {
        if (window.DOMParser) {
            const parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, "text/xml");
        } else if (window.ActiveXObject || "ActiveXObject" in window) {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.loadXML(xml);
        } else {
            throw new Error("No XML parser available.");
        }
    } catch (e) {
        alert(_("xmlerror") + ": " + e.message);
        return;
    }
    this.fromXML(xmlDoc);
};

SQL.IO.prototype.fromXML = function (xmlDoc) {
    if (!xmlDoc || !xmlDoc.documentElement) {
        alert(_("xmlerror") + ": Null document");
        return false;
    }
    this.owner.fromXML(xmlDoc.documentElement);
    this.owner.window.close();
    return true;
};

SQL.IO.prototype.clientsave = function () {
    const xml = this.owner.toXML();
    this.dom.ta.value = xml;
};

SQL.IO.prototype.clientload = function () {
    const xml = this.dom.ta.value;
    if (!xml) {
        alert(_("empty"));
        return;
    }

    this.fromXMLText(xml);
};

SQL.IO.prototype.promptName = function (title, suffix) {
    const lastUsedName = this.owner.getOption("lastUsedName") || this.lastUsedName;
    let name = prompt(_(title), lastUsedName);
    if (!name) {
        return null;
    }
    if (suffix && name.endsWith(suffix)) {
        // remove suffix from name
        name = name.substring(0, name.length - 4);
    }
    this.owner.setOption("lastUsedName", name);
    this.lastUsedName = name; // save this also in variable in case cookies are disabled
    return name;
};

SQL.IO.prototype.clientlocalsave = function () {
    if (!window.localStorage) {
        alert("Sorry, your browser does not seem to support localStorage.");
        return;
    }

    const xml = this.owner.toXML();
    if (xml.length >= (5 * 1024 * 1024) / 2) {
        /* this is a very big db structure... */
        alert(
            "Warning: your database structure is above 5 megabytes in size, this is above the localStorage single key limit allowed by some browsers, example Mozilla Firefox 10"
        );
        return;
    }

    let key = this.promptName("serversaveprompt");
    if (!key) {
        return;
    }

    key = "wwwsqldesigner_databases_" + (key || "default");

    try {
        localStorage.setItem(key, xml);
        if (localStorage.getItem(key) != xml) {
            throw new Error("Content verification failed");
        }
    } catch (e) {
        alert(
            "Error saving database structure to localStorage! (" +
            e.message +
            ")"
        );
    }
};

SQL.IO.prototype.clientlocalload = function () {
    if (!window.localStorage) {
        alert("Sorry, your browser does not seem to support localStorage.");
        return;
    }

    let key = this.promptName("serverloadprompt");
    if (!key) {
        return;
    }

    key = "wwwsqldesigner_databases_" + (key || "default");

    let xml;
    try {
        xml = localStorage.getItem(key);
        if (!xml) {
            throw new Error("No data available");
        }
    } catch (e) {
        alert(
            "Error loading database structure from localStorage! (" +
            e.message +
            ")"
        );
        return;
    }

    this.fromXMLText(xml);
};

SQL.IO.prototype.clientlocallist = function () {
    if (!window.localStorage) {
        alert("Sorry, your browser does not seem to support localStorage.");
        return;
    }

    /* --- Define some useful vars --- */
    const baseKeysName = "wwwsqldesigner_databases_";
    const localLen = localStorage.length;
    let data = "";
    let schemasFound = false;
    const code = 200;

    /* --- work --- */
    try {
        for (let i = 0; i < localLen; ++i) {
            const key = localStorage.key(i);
            if (new RegExp(baseKeysName).test(key)) {
                const result = key.substring(baseKeysName.length);
                schemasFound = true;
                data += result + "\n";
            }
        }
        if (!schemasFound) {
            throw new Error("No data available");
        }
    } catch (e) {
        alert(
            "Error loading database names from localStorage! (" +
            e.message +
            ")"
        );
        return;
    }
    this.listresponse(data, code);
};

SQL.IO.prototype.clientsql = function () {
    const bp = this.owner.getOption("staticpath");
    const path = bp + "db/" + window.DATATYPES.getAttribute("db") + "/output.xsl";
    const h = this.owner.getXhrHeaders();
    h['transformation'] = 'oracle';
    this.owner.window.showThrobber();

    $.ajax({
        url: path,
        headers: h,
        dataType: "xml",
        success: (data, status, xhr) => {
            // Need data as XML. jQuery handles parsing if dataType is xml
            this.finish(data, xhr.status, this.parseHeaders(xhr));
        }
    });
};

SQL.IO.prototype.clientef = function () {
    const bp = this.owner.getOption("staticpath");
    const path = bp + "db/" + "ef" + "/output.xsl";
    const h = this.owner.getXhrHeaders();
    h['transformation'] = 'ef';
    this.owner.window.showThrobber();

    $.ajax({
        url: path,
        headers: h,
        dataType: "xml",
        success: (data, status, xhr) => {
            this.finish(data, xhr.status, this.parseHeaders(xhr));
        }
    });
};

// Helper for OZ.Request replacement to get headers map
SQL.IO.prototype.parseHeaders = function (xhr) {
    const headers = {};
    const hdrs = xhr.getAllResponseHeaders().split(/[\r\n]/);
    for (let hdr of hdrs) {
        if (hdr) {
            const v = hdr.match(/^([^:]+): *(.*)$/);
            if (v) headers[v[1]] = v[2];
        }
    }
    return headers;
}

SQL.IO.prototype.getXSL = function (xslPath, cb) {
    $.ajax({
        url: xslPath,
        method: "GET",
        dataType: "text", // We want text for parsing later if possible or just use whatever
        success: (data) => {
            cb(null, data);
        },
        error: (xhr, status, err) => {
            // Handle error silently or pass null? Original code didn't handle error explicitly in callback
            // but here we should
            console.error("Error loading XSLT:", err);
        }
    });
}

SQL.IO.prototype.finish = function (xslDoc, status, headers) {
    // OZ.Request callback signature: (data, status, headers)
    // Note: this.clientsql/clientef above call this with manually constructed args

    // const transformationType = this.owner.getXhrHeaders().transformation;
    const transformationType = window.DATATYPES.getAttribute("db");
    let xslPath = '';

    xslPath = this.owner.getOption("staticpath") + "db/" + transformationType + "/output.xsl";

    // Get XSL content and invoke transformation
    // Note: In original code, it loaded the XSLT inside finish. 
    // Wait, the original code had `OZ.Request(path, this.finish.bind(this))` for clientef/clientsql.
    // So `finish` ACTUALLY received the XSL doc as the first argument? 
    // Looking at clientsql: path = .../output.xsl. So yes, finish receives the XSL.

    // BUT, wait. In `clientsql`, `path` points to `output.xsl`. 
    // And `OZ.Request` fetches it. 
    // So `xslDoc` is indeed the first argument.

    // However, the previous edits added `getXSL` inside `finish`. 
    // That means `finish` was modified to refetch the XSL?
    // Let's re-read the original file content provided in context.

    /*
    Original clientsql:
    OZ.Request(path, this.finish.bind(this), { xml: true, headers: h });
    
    Original finish:
    SQL.IO.prototype.finish = function () {
        ...
        this.getXSL(xslPath, (err, doc) => { ... })
    }
    
    Wait, `finish` in the file I read DOES NOT take arguments?
    Line 304: `SQL.IO.prototype.finish = function () {`
    It seems `OZ.Request` calls `finish(data, code, headers)`, but the `finish` function defined 
    in line 304 DOES NOT USE THEM. 
    Instead, it ignores the fetched data and calls `getXSL` to fetch... what?
    Line 309: `xslPath = ... + "db/" + transformationType + "/output.xsl";`
    
    So `clientsql` fetches `output.xsl` (using static/hardcoded 'oracle' header logic in old code, now fixed to be dynamic path?). 
    Actually `clientsql` uses `window.DATATYPES.getAttribute("db")`. 
    
    It seems `clientsql` fetches the XSL, passes it to `finish`, but `finish` IGNORES it and fetches it AGAIN?
    That seems redundant but that's what the code says.
    
    I will preserve the logic of `finish` as it is (ignoring arguments and refetching), but update `clientsql` to passing *something* 
    or just calling it.
    Actually, `finish` is bound as a callback. 
    
    Let's keep `finish` logic but fix `clientsql` to just trigger it.
    */

    const transformationType2 = window.DATATYPES.getAttribute("db");
    let xslPath2 = this.owner.getOption("staticpath") + "db/" + transformationType2 + "/output.xsl";

    // Get XSL content and invoke transformation
    // Using our new jQuery getXSL
    this.getXSL(xslPath2, (err, doc) => {
        if (err) {
            console.error(err.message);
            return;
        }
        this.performTransformation(doc, this.owner.toXML());
        this.owner.window.hideThrobber();
    });
}

SQL.IO.prototype.performTransformation = function (xslDoc, xml) {
    let result = "";
    try {
        if (window.XSLTProcessor && window.DOMParser) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");
            if (typeof xslDoc === 'string') {
                xslDoc = parser.parseFromString(xslDoc, 'text/xml');
            }
            const xsl = new XSLTProcessor();
            xsl.importStylesheet(xslDoc);
            const transformedDocument = xsl.transformToDocument(xmlDoc);
            result = transformedDocument.documentElement.textContent;
        } else if (window.ActiveXObject || "ActiveXObject" in window) {
            const xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.loadXML(xml);
            result = xmlDoc.transformNode(xslDoc);
        } else {
            throw new Error("No XSLT processor available");
        }
    } catch (e) {
        alert(_("xmlerror") + ": " + e.message);
        return;
    }
    this.dom.ta.value = result.trim();
};

SQL.IO.prototype.serversave = function (e, keyword) {
    const name = keyword || prompt(_("serversaveprompt"), this._name);
    if (!name) {
        return;
    }
    this._name = name;
    const xml = this.owner.toXML();
    const bp = this.owner.getOption("xhrpath");
    const url =
        bp +
        "backend/" +
        this.dom.backend.value +
        "/save/?keyword=" +
        encodeURIComponent(name);
    const h = this.owner.getXhrHeaders();
    h["Content-type"] = "application/xml";
    this.owner.window.showThrobber();
    this.owner.setTitle(name);

    $.ajax({
        url: url,
        method: "POST",
        data: xml,
        headers: h,
        dataType: "xml",
        success: (data, status, xhr) => {
            this.saveresponse(data, xhr.status);
        },
        error: (xhr) => {
            this.saveresponse(xhr.responseXML, xhr.status);
        }
    });
};

SQL.IO.prototype.quicksave = function (e) {
    this.serversave(e, this._name);
};

SQL.IO.prototype.serverload = function (e, keyword, version) {
    const name = keyword || prompt(_("serverloadprompt"), this._name);
    if (!name) {
        return;
    }
    this._name = name;
    const bp = this.owner.getOption("xhrpath");
    let url =
        bp +
        "backend/" +
        this.dom.backend.value +
        "/load/?keyword=" +
        encodeURIComponent(name);
    if (version) {
        url += "&version=" + encodeURIComponent(version);
    }
    const h = this.owner.getXhrHeaders();
    this.owner.window.showThrobber();

    $.ajax({
        url: url,
        method: "GET",
        headers: h,
        dataType: "xml",
        success: (data, status, xhr) => {
            this.loadresponse(data, xhr.status);
        },
        error: (xhr) => {
            this.loadresponse(xhr.responseXML, xhr.status);
        }
    });
};

SQL.IO.prototype.serverlist = function (e) {
    const bp = this.owner.getOption("xhrpath");
    const url = bp + "backend/" + this.dom.backend.value + "/list";
    const h = this.owner.getXhrHeaders();
    this.owner.window.showThrobber();

    $.ajax({
        url: url,
        method: "GET",
        headers: h,
        dataType: "text", // List returns text usually
        success: (data, status, xhr) => {
            this.listresponse(data, xhr.status);
        },
        error: (xhr) => {
            this.listresponse(xhr.responseText, xhr.status);
        }
    });
};

SQL.IO.prototype.serverimport = function (e) {
    const name = prompt(_("serverimportprompt"), "");
    if (!name) {
        return;
    }
    const bp = this.owner.getOption("xhrpath");
    const url =
        bp +
        "backend/" +
        this.dom.backend.value +
        "/import/?database=" +
        name;
    const h = this.owner.getXhrHeaders();
    this.owner.window.showThrobber();

    $.ajax({
        url: url,
        method: "GET",
        headers: h,
        dataType: "xml",
        success: (data, status, xhr) => {
            this.importresponse(data, xhr.status);
        },
        error: (xhr) => {
            this.importresponse(xhr.responseXML, xhr.status);
        }
    });
};

SQL.IO.prototype.serveraudit = function (e) {
    const objectType = prompt(_("serverauditprompt"), "TABLE");
    if (!objectType) {
        return;
    }
    const typeUpper = objectType.toUpperCase();
    if (typeUpper !== "TABLE" && typeUpper !== "PACKAGE" && typeUpper !== "SEQUENCE") {
        alert("Invalid object type. Must be TABLE, PACKAGE, or SEQUENCE.");
        return;
    }

    const bp = this.owner.getOption("xhrpath");
    const url = bp + "backend/audit/execute?objectType=" + encodeURIComponent(typeUpper);
    const h = this.owner.getXhrHeaders();
    this.owner.window.showThrobber();
    this.dom.ta.value = "Executing audit for " + typeUpper + "... Please wait.";

    $.ajax({
        url: url,
        method: "POST",
        headers: h,
        dataType: "text",
        success: (data, status, xhr) => {
            this.owner.window.hideThrobber();
            this.dom.ta.value = data;
        },
        error: (xhr) => {
            this.owner.window.hideThrobber();
            this.dom.ta.value = "Error executing audit: " + xhr.responseText;
        }
    });
};

SQL.IO.prototype.check = function (code) {
    switch (code) {
        case 201:
        case 404:
        case 500:
        case 501:
        case 503:
            const lang = "http" + code;
            this.dom.ta.value = _("httpresponse") + ": " + _(lang);
            return false;
        default:
            return true;
    }
};

SQL.IO.prototype.saveresponse = function (data, code) {
    this.owner.window.hideThrobber();
    this.check(code);
};

SQL.IO.prototype.loadresponse = function (data, code) {
    this.owner.window.hideThrobber();
    if (!this.check(code)) {
        return;
    }
    this.fromXML(data);
    this.owner.setTitle(this.name);
};

SQL.IO.prototype.listresponse = function (data, code) {
    this.owner.window.hideThrobber();
    if (!this.check(code)) {
        return;
    }
    this.dom.ta.value = data;
};

SQL.IO.prototype.importresponse = function (data, code) {
    this.owner.window.hideThrobber();
    if (!this.check(code)) {
        return;
    }
    if (this.fromXML(data)) {
        this.owner.alignTables();
    }
};

SQL.IO.prototype.press = function (e) {
    if (e.keyCode == 113) {
        // if (OZ.opera) { e.preventDefault(); } // Removed Opera specific check
        e.preventDefault();
        this.quicksave(e);
    }
};
