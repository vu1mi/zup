Zup.elements = [];
function Zup(options = {}) {
  this.opt = Object.assign(
    {
      destroyOnClose: true,
      footer: false,
      cssClass: [],
      closeMethods: ["button", "overlay", "escape"],
    },
    options
  );
  this.template = document.querySelector(`#${this.opt.templateId}`);

  if (!this.template) {
    console.error(`#${this.opt.templateId} does not exist!`);
    return;
  }

  const { closeMethods } = this.opt;
  this._allowButtonClose = closeMethods.includes("button");
  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowEscapeClose = closeMethods.includes("escape");
  this._footerButtons = [];
  this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

Zup.prototype._build = function () {
  const content = this.template.content.cloneNode(true);

  // Create modal elements
  this._backdrop = document.createElement("div");
  this._backdrop.className = "zup-backdrop";

  const container = document.createElement("div");
  container.className = "zup-container";

  this.opt.cssClass.forEach((className) => {
    if (typeof className === "string") {
      container.classList.add(className);
    }
  });

  if (this._allowButtonClose) {
    const closeBtn = this._createButton("&times;", "zup-close", () =>
      this.close()
    );
    container.append(closeBtn);
  }

  const modalContent = document.createElement("div");
  modalContent.className = "zup-content";
  // Append content and elements
  modalContent.append(content);
  container.append(modalContent);

  if (this.opt.footer) {
    this._modalFooter = document.createElement("div");
    this._modalFooter.className = "zup-footer";
    this._renderFooterContent();
    this._renderFooterButton();

    container.append(this._modalFooter);
  }

  this._backdrop.append(container);
  document.body.append(this._backdrop);
};

// set footer content
Zup.prototype.setFooterContent = function (html) {
  this._footerContent = html;
  this._renderFooterContent();
};

Zup.prototype._renderFooterContent = function () {
  if (this._modalFooter && this._footerContent) {
    this._modalFooter.innerHTML = this._footerContent;
  }
};

Zup.prototype.addFooterButton = function (title, cssClass, callback) {
  const button = this._createButton(title, cssClass, callback);
  this._footerButtons.push(button);
  this._renderFooterButton();
};

Zup.prototype._renderFooterButton = function () {
  if (this._modalFooter) {
    this._footerButtons.forEach((button) => {
      this._modalFooter.append(button);
    });
  }
};

// creater Button

Zup.prototype._createButton = function (title, cssClass, callback) {
  const button = document.createElement("button");
  button.className = cssClass;
  button.innerHTML = title;
  button.onclick = callback;
  return button;
};

Zup.prototype.open = function () {
  Zup.elements.push(this);
  console.log(Zup.elements);
  if (!this._backdrop) {
    this._build();
  }

  setTimeout(() => {
    this._backdrop.classList.add("show");
  }, 0);

  // Disable scrolling
  document.body.classList.add("no-scroll");
  document.body.style.paddingRight = this._getScrollbarWidth() + "px";

  // Attach event listeners
  if (this._allowBackdropClose) {
    this._backdrop.onclick = (e) => {
      if (e.target === this._backdrop) {
        this.close();
      }
    };
  }

  if (this._allowEscapeClose) {
    document.addEventListener("keydown", this._handleEscapeKey);
  }
  this._onTransitionEnd(this.opt.onOpen);
  return this._backdrop;
};

Zup.prototype._handleEscapeKey = function (e) {
  const lastModal = Zup.elements[Zup.elements.length - 1];
  if (e.key === "Escape" && this === lastModal) {
    this.close();
  }
};

Zup.prototype._onTransitionEnd = function (callback) {
  this._backdrop.ontransitionend = (e) => {
    if (e.propertyName !== "transform") return;
    if (typeof callback === "function") callback();
  };
};

Zup.prototype.close = function (destroy = this.opt.destroyOnClose) {
  Zup.elements.pop();
  this._backdrop.classList.remove("show");
  if (this._allowEscapeClose) {
    document.removeEventListener("keydown", this._handleEscapeKey);
  }
  this._onTransitionEnd(() => {
    if (this._backdrop && destroy) {
      this._backdrop.remove();
      this._backdrop = null;
      this._modalFooter = null;
    }

    // Enable scrolling
    if (!Zup.elements.length) {
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";
    }

    if (typeof this.opt.onClose === "function") this.opt.onClose();
  });
};

Zup.prototype.destroy = function () {
  this.close(true);
};

Zup.prototype._getScrollbarWidth = function () {
  if (this._scrollbarWidth) return this._scrollbarWidth;

  const div = document.createElement("div");
  Object.assign(div.style, {
    overflow: "scroll",
    position: "absolute",
    top: "-9999px",
  });

  document.body.appendChild(div);
  this._scrollbarWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);

  return this._scrollbarWidth;
};
