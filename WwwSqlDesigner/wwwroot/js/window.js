/* --------------------- window ------------ */

SQL.Window = function (owner) {
    this.owner = owner;
    this.dom = {
        container: $("#window").get(0),
        background: $("#background").get(0),
        ok: $("#windowok").get(0),
        cancel: $("#windowcancel").get(0),
        title: $("#windowtitle").get(0),
        content: $("#windowcontent").get(0),
        throbber: $("#throbber").get(0),
    };
    this.dom.ok.value = _("windowok");
    this.dom.cancel.value = _("windowcancel");
    this.dom.throbber.alt = this.dom.throbber.title = _("throbber");

    $(this.dom.ok).on("click", this.ok.bind(this));
    $(this.dom.cancel).on("click", this.close.bind(this));
    $(document).on("keydown", this.key.bind(this));

    this.sync = this.sync.bind(this);

    $(window).on("scroll", this.sync);
    $(window).on("resize", this.sync);
    this.state = 0;
    this.hideThrobber();

    this.sync();
};

SQL.Window.prototype.showThrobber = function () {
    this.dom.throbber.style.visibility = "";
};

SQL.Window.prototype.hideThrobber = function () {
    this.dom.throbber.style.visibility = "hidden";
};

SQL.Window.prototype.open = function (title, content, callback) {
    this.state = 1;
    this.callback = callback;

    // Clear title children except the image (throbber is inside title div in original HTML? Check index.html)
    // index.html: <div id="windowtitle"><img id="throbber" ... /></div>
    // So we want to keep the first child (throbber)

    while (this.dom.title.childNodes.length > 1) {
        this.dom.title.removeChild(this.dom.title.childNodes[1]);
    }

    const txt = document.createTextNode(title);
    this.dom.title.appendChild(txt);
    this.dom.background.style.visibility = "visible";

    $(this.dom.content).empty();
    this.dom.content.appendChild(content);

    const win = [$(window).width(), $(window).height()];
    const scroll = [$(window).scrollLeft(), $(window).scrollTop()];

    this.dom.container.style.left =
        Math.round(scroll[0] + (win[0] - this.dom.container.offsetWidth) / 2) +
        "px";
    this.dom.container.style.top =
        Math.round(scroll[1] + (win[1] - this.dom.container.offsetHeight) / 2) +
        "px";

    this.dom.cancel.style.visibility = this.callback ? "" : "hidden";
    this.dom.container.style.visibility = "visible";

    const formElements = ["input", "select", "textarea"];
    const all = this.dom.container.getElementsByTagName("*");
    for (let elm of all) {
        if (formElements.indexOf(elm.tagName.toLowerCase()) != -1) {
            elm.focus();
            break;
        }
    }
};

SQL.Window.prototype.key = function (e) {
    if (!this.state) {
        return;
    }
    if (e.keyCode == 13) {
        this.ok(e);
    }
    if (e.keyCode == 27) {
        this.close();
    }
};

SQL.Window.prototype.ok = function (e) {
    if (this.callback) {
        this.callback();
    }
    this.close();
};

SQL.Window.prototype.close = function () {
    if (!this.state) {
        return;
    }
    this.state = 0;
    this.dom.background.style.visibility = "hidden";
    this.dom.container.style.visibility = "hidden";
};

SQL.Window.prototype.sync = function () {
    /* adjust background position */
    const dims = [$(window).width(), $(window).height()];
    const scroll = [$(window).scrollLeft(), $(window).scrollTop()];
    this.dom.background.style.width = dims[0] + "px";
    this.dom.background.style.height = dims[1] + "px";
    this.dom.background.style.left = scroll[0] + "px";
    this.dom.background.style.top = scroll[1] + "px";
};
