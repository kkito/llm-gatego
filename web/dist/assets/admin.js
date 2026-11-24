"use strict";
(() => {
  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/lit/node_modules/@lit/reactive-element/css-tag.js
  var t = globalThis;
  var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var s = /* @__PURE__ */ Symbol();
  var o = /* @__PURE__ */ new WeakMap();
  var n = class {
    constructor(t3, e4, o5) {
      if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t3, this.t = e4;
    }
    get styleSheet() {
      let t3 = this.o;
      const s4 = this.t;
      if (e && void 0 === t3) {
        const e4 = void 0 !== s4 && 1 === s4.length;
        e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
      }
      return t3;
    }
    toString() {
      return this.cssText;
    }
  };
  var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
  var i = (t3, ...e4) => {
    const o5 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o6) => e5 + ((t4) => {
      if (true === t4._$cssResult$) return t4.cssText;
      if ("number" == typeof t4) return t4;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
    })(s4) + t3[o6 + 1], t3[0]);
    return new n(o5, t3, s);
  };
  var S = (s4, o5) => {
    if (e) s4.adoptedStyleSheets = o5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
    else for (const e4 of o5) {
      const o6 = document.createElement("style"), n4 = t.litNonce;
      void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
    }
  };
  var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
    let e4 = "";
    for (const s4 of t4.cssRules) e4 += s4.cssText;
    return r(e4);
  })(t3) : t3;

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/lit/node_modules/@lit/reactive-element/reactive-element.js
  var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
  var a = globalThis;
  var c2 = a.trustedTypes;
  var l = c2 ? c2.emptyScript : "";
  var p = a.reactiveElementPolyfillSupport;
  var d = (t3, s4) => t3;
  var u = { toAttribute(t3, s4) {
    switch (s4) {
      case Boolean:
        t3 = t3 ? l : null;
        break;
      case Object:
      case Array:
        t3 = null == t3 ? t3 : JSON.stringify(t3);
    }
    return t3;
  }, fromAttribute(t3, s4) {
    let i5 = t3;
    switch (s4) {
      case Boolean:
        i5 = null !== t3;
        break;
      case Number:
        i5 = null === t3 ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          i5 = JSON.parse(t3);
        } catch (t4) {
          i5 = null;
        }
    }
    return i5;
  } };
  var f = (t3, s4) => !i2(t3, s4);
  var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
  Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
  var y = class extends HTMLElement {
    static addInitializer(t3) {
      this._$Ei(), (this.l ?? (this.l = [])).push(t3);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t3, s4 = b) {
      if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
        const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
        void 0 !== h3 && e2(this.prototype, t3, h3);
      }
    }
    static getPropertyDescriptor(t3, s4, i5) {
      const { get: e4, set: r4 } = h(this.prototype, t3) ?? { get() {
        return this[s4];
      }, set(t4) {
        this[s4] = t4;
      } };
      return { get: e4, set(s5) {
        const h3 = e4?.call(this);
        r4?.call(this, s5), this.requestUpdate(t3, h3, i5);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t3) {
      return this.elementProperties.get(t3) ?? b;
    }
    static _$Ei() {
      if (this.hasOwnProperty(d("elementProperties"))) return;
      const t3 = n2(this);
      t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
    }
    static finalize() {
      if (this.hasOwnProperty(d("finalized"))) return;
      if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
        const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
        for (const i5 of s4) this.createProperty(i5, t4[i5]);
      }
      const t3 = this[Symbol.metadata];
      if (null !== t3) {
        const s4 = litPropertyMetadata.get(t3);
        if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
      }
      this._$Eh = /* @__PURE__ */ new Map();
      for (const [t4, s4] of this.elementProperties) {
        const i5 = this._$Eu(t4, s4);
        void 0 !== i5 && this._$Eh.set(i5, t4);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s4) {
      const i5 = [];
      if (Array.isArray(s4)) {
        const e4 = new Set(s4.flat(1 / 0).reverse());
        for (const s5 of e4) i5.unshift(c(s5));
      } else void 0 !== s4 && i5.push(c(s4));
      return i5;
    }
    static _$Eu(t3, s4) {
      const i5 = s4.attribute;
      return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
    }
    constructor() {
      super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
    }
    _$Ev() {
      this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
    }
    addController(t3) {
      (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
    }
    removeController(t3) {
      this._$EO?.delete(t3);
    }
    _$E_() {
      const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
      for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
      t3.size > 0 && (this._$Ep = t3);
    }
    createRenderRoot() {
      const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
      return S(t3, this.constructor.elementStyles), t3;
    }
    connectedCallback() {
      this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
    }
    enableUpdating(t3) {
    }
    disconnectedCallback() {
      this._$EO?.forEach((t3) => t3.hostDisconnected?.());
    }
    attributeChangedCallback(t3, s4, i5) {
      this._$AK(t3, i5);
    }
    _$ET(t3, s4) {
      const i5 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i5);
      if (void 0 !== e4 && true === i5.reflect) {
        const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
        this._$Em = t3, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
      }
    }
    _$AK(t3, s4) {
      const i5 = this.constructor, e4 = i5._$Eh.get(t3);
      if (void 0 !== e4 && this._$Em !== e4) {
        const t4 = i5.getPropertyOptions(e4), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
        this._$Em = e4;
        const r4 = h3.fromAttribute(s4, t4.type);
        this[e4] = r4 ?? this._$Ej?.get(e4) ?? r4, this._$Em = null;
      }
    }
    requestUpdate(t3, s4, i5, e4 = false, h3) {
      if (void 0 !== t3) {
        const r4 = this.constructor;
        if (false === e4 && (h3 = this[t3]), i5 ?? (i5 = r4.getPropertyOptions(t3)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r4._$Eu(t3, i5)))) return;
        this.C(t3, s4, i5);
      }
      false === this.isUpdatePending && (this._$ES = this._$EP());
    }
    C(t3, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r4) {
      i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t3) && (this._$Ej.set(t3, r4 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r4) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e4 && this._$Em !== t3 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t3));
    }
    async _$EP() {
      this.isUpdatePending = true;
      try {
        await this._$ES;
      } catch (t4) {
        Promise.reject(t4);
      }
      const t3 = this.scheduleUpdate();
      return null != t3 && await t3, !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      if (!this.isUpdatePending) return;
      if (!this.hasUpdated) {
        if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
          for (const [t5, s5] of this._$Ep) this[t5] = s5;
          this._$Ep = void 0;
        }
        const t4 = this.constructor.elementProperties;
        if (t4.size > 0) for (const [s5, i5] of t4) {
          const { wrapped: t5 } = i5, e4 = this[s5];
          true !== t5 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
        }
      }
      let t3 = false;
      const s4 = this._$AL;
      try {
        t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
      } catch (s5) {
        throw t3 = false, this._$EM(), s5;
      }
      t3 && this._$AE(s4);
    }
    willUpdate(t3) {
    }
    _$AE(t3) {
      this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
    }
    _$EM() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t3) {
      return true;
    }
    update(t3) {
      this._$Eq && (this._$Eq = this._$Eq.forEach((t4) => this._$ET(t4, this[t4]))), this._$EM();
    }
    updated(t3) {
    }
    firstUpdated(t3) {
    }
  };
  y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/lit/node_modules/lit-html/lit-html.js
  var t2 = globalThis;
  var i3 = (t3) => t3;
  var s2 = t2.trustedTypes;
  var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var h2 = "$lit$";
  var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
  var n3 = "?" + o3;
  var r3 = `<${n3}>`;
  var l2 = document;
  var c3 = () => l2.createComment("");
  var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
  var u2 = Array.isArray;
  var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
  var f2 = "[ 	\n\f\r]";
  var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var _ = /-->/g;
  var m = />/g;
  var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var g = /'/g;
  var $ = /"/g;
  var y2 = /^(?:script|style|textarea|title)$/i;
  var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
  var b2 = x(1);
  var w = x(2);
  var T = x(3);
  var E = /* @__PURE__ */ Symbol.for("lit-noChange");
  var A = /* @__PURE__ */ Symbol.for("lit-nothing");
  var C = /* @__PURE__ */ new WeakMap();
  var P = l2.createTreeWalker(l2, 129);
  function V(t3, i5) {
    if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== e3 ? e3.createHTML(i5) : i5;
  }
  var N = (t3, i5) => {
    const s4 = t3.length - 1, e4 = [];
    let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
    for (let i6 = 0; i6 < s4; i6++) {
      const s5 = t3[i6];
      let a3, u3, d3 = -1, f3 = 0;
      for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
      const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
      l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
    }
    return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
  };
  var S2 = class _S {
    constructor({ strings: t3, _$litType$: i5 }, e4) {
      let r4;
      this.parts = [];
      let l3 = 0, a3 = 0;
      const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
      if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
        const t4 = this.el.content.firstChild;
        t4.replaceWith(...t4.childNodes);
      }
      for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
        if (1 === r4.nodeType) {
          if (r4.hasAttributes()) for (const t4 of r4.getAttributeNames()) if (t4.endsWith(h2)) {
            const i6 = v2[a3++], s4 = r4.getAttribute(t4).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
            d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r4.removeAttribute(t4);
          } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t4));
          if (y2.test(r4.tagName)) {
            const t4 = r4.textContent.split(o3), i6 = t4.length - 1;
            if (i6 > 0) {
              r4.textContent = s2 ? s2.emptyScript : "";
              for (let s4 = 0; s4 < i6; s4++) r4.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
              r4.append(t4[i6], c3());
            }
          }
        } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
        else {
          let t4 = -1;
          for (; -1 !== (t4 = r4.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
        }
        l3++;
      }
    }
    static createElement(t3, i5) {
      const s4 = l2.createElement("template");
      return s4.innerHTML = t3, s4;
    }
  };
  function M(t3, i5, s4 = t3, e4) {
    if (i5 === E) return i5;
    let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
    const o5 = a2(i5) ? void 0 : i5._$litDirective$;
    return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? (s4._$Co ?? (s4._$Co = []))[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e4)), i5;
  }
  var R = class {
    constructor(t3, i5) {
      this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t3) {
      const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t3?.creationScope ?? l2).importNode(i5, true);
      P.currentNode = e4;
      let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
      for (; void 0 !== r4; ) {
        if (o5 === r4.index) {
          let i6;
          2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t3) : 6 === r4.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r4 = s4[++n4];
        }
        o5 !== r4?.index && (h3 = P.nextNode(), o5++);
      }
      return P.currentNode = l2, e4;
    }
    p(t3) {
      let i5 = 0;
      for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
    }
  };
  var k = class _k {
    get _$AU() {
      return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t3, i5, s4, e4) {
      this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
    }
    get parentNode() {
      let t3 = this._$AA.parentNode;
      const i5 = this._$AM;
      return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t3, i5 = this) {
      t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
    }
    O(t3) {
      return this._$AA.parentNode.insertBefore(t3, this._$AB);
    }
    T(t3) {
      this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
    }
    _(t3) {
      this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
    }
    $(t3) {
      const { values: i5, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
      if (this._$AH?._$AD === e4) this._$AH.p(i5);
      else {
        const t4 = new R(e4, this), s5 = t4.u(this.options);
        t4.p(i5), this.T(s5), this._$AH = t4;
      }
    }
    _$AC(t3) {
      let i5 = C.get(t3.strings);
      return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
    }
    k(t3) {
      u2(this._$AH) || (this._$AH = [], this._$AR());
      const i5 = this._$AH;
      let s4, e4 = 0;
      for (const h3 of t3) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
      e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
    }
    _$AR(t3 = this._$AA.nextSibling, s4) {
      for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
        const s5 = i3(t3).nextSibling;
        i3(t3).remove(), t3 = s5;
      }
    }
    setConnected(t3) {
      void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
    }
  };
  var H = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t3, i5, s4, e4, h3) {
      this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
    }
    _$AI(t3, i5 = this, s4, e4) {
      const h3 = this.strings;
      let o5 = false;
      if (void 0 === h3) t3 = M(this, t3, i5, 0), o5 = !a2(t3) || t3 !== this._$AH && t3 !== E, o5 && (this._$AH = t3);
      else {
        const e5 = t3;
        let n4, r4;
        for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e5[s4 + n4], i5, n4), r4 === E && (r4 = this._$AH[n4]), o5 || (o5 = !a2(r4) || r4 !== this._$AH[n4]), r4 === A ? t3 = A : t3 !== A && (t3 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
      }
      o5 && !e4 && this.j(t3);
    }
    j(t3) {
      t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
    }
  };
  var I = class extends H {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t3) {
      this.element[this.name] = t3 === A ? void 0 : t3;
    }
  };
  var L = class extends H {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t3) {
      this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
    }
  };
  var z = class extends H {
    constructor(t3, i5, s4, e4, h3) {
      super(t3, i5, s4, e4, h3), this.type = 5;
    }
    _$AI(t3, i5 = this) {
      if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
      const s4 = this._$AH, e4 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e4);
      e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
    }
    handleEvent(t3) {
      "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
    }
  };
  var Z = class {
    constructor(t3, i5, s4) {
      this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3) {
      M(this, t3);
    }
  };
  var B = t2.litHtmlPolyfillSupport;
  B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
  var D = (t3, i5, s4) => {
    const e4 = s4?.renderBefore ?? i5;
    let h3 = e4._$litPart$;
    if (void 0 === h3) {
      const t4 = s4?.renderBefore ?? null;
      e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
    }
    return h3._$AI(t3), h3;
  };

  // ../../../.nvm/versions/node/v24.16.0/lib/node_modules/lit/node_modules/lit-element/lit-element.js
  var s3 = globalThis;
  var i4 = class extends y {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
    }
    createRenderRoot() {
      var _a;
      const t3 = super.createRenderRoot();
      return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t3.firstChild), t3;
    }
    update(t3) {
      const r4 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r4, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      super.connectedCallback(), this._$Do?.setConnected(true);
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this._$Do?.setConnected(false);
    }
    render() {
      return E;
    }
  };
  i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
  var o4 = s3.litElementPolyfillSupport;
  o4?.({ LitElement: i4 });
  (s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

  // web/src/styles/tokens.ts
  var globalCSSString = `
:root{--ui-bg:#F6F8FB;--ui-panel:#fff;--ui-line:#E3E8EF;--ui-ink:#111827;--ui-muted:#64748B;--ui-accent:#2563EB;--ui-soft:#EFF4FF;--ui-radius:14px}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{background:var(--ui-bg);color:var(--ui-ink);font:14px/1.55 Inter,"Noto Sans SC",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--ui-accent);text-decoration:none}a:hover{text-decoration:none}
`;

  // web/src/styles/tokens-lit.ts
  var globalCSS = r(globalCSSString);

  // web/src/api.ts
  async function api(path, opts) {
    const r4 = await fetch(path, opts);
    const j = await r4.json();
    if (!j.ok) throw new Error(j.error?.message || "HTTP " + r4.status);
    return j;
  }

  // web/src/components/gw-shell.ts
  var adminNav = [
    { href: "/admin/models", label: "\u6A21\u578B", icon: "\u25C7" },
    { href: "/admin/model-groups", label: "\u5206\u7EC4", icon: "\u25A6" },
    { href: "/admin/api-keys", label: "\u5BC6\u94A5", icon: "\u2318" },
    { href: "/admin/users", label: "\u7528\u6237", icon: "\u25CE" },
    { href: "/admin/stats", label: "\u7EDF\u8BA1", icon: "\u25A4" },
    { href: "/admin/announcement", label: "\u516C\u544A", icon: "\u270E" },
    { href: "/admin/privacy", label: "\u9690\u79C1", icon: "\u25C8" },
    { href: "/admin/password", label: "\u5BC6\u7801", icon: "\u26BF" }
  ];
  var userNav = [
    { href: "/user/main", label: "\u63A7\u5236\u53F0", icon: "\u25C7" },
    { href: "/user/stats", label: "\u7528\u91CF\u7EDF\u8BA1", icon: "\u25A4" }
  ];
  var GwShell = class extends i4 {
    constructor() {
      super(...arguments);
      this.title = "";
      this.path = "";
      this.version = "1.15.0";
      this.nav = adminNav;
      this.width = 1180;
    }
    render() {
      const links = this.nav.map((n4) => {
        const active = this.path === n4.href || n4.href !== "/admin/models" && this.path.startsWith(n4.href + "/") || n4.href === "/admin/models" && this.path.startsWith("/admin/models/");
        return b2`<a href=${n4.href} class=${"ui-nav-link" + (active ? " is-active" : "")}>${n4.icon ? b2`<span class="ui-nav-icon">${n4.icon}</span>` : ""}<span>${n4.label}</span></a>`;
      });
      return b2`
<header class="ui-topbar"><div class="ui-topbar-inner" style=${`max-width:${this.width}px`}>
  <a href="/admin/models" class="ui-brand"><span class="ui-brand-mark">L</span><span>LLM Gateway</span></a>
  <nav class="ui-nav">${links}</nav>
  <div class="ui-topbar-end"><a href="/user/main" class="ui-link">用户端</a><span class="ui-version">v${this.version}</span></div>
</div></header>
<main class="ui-main" style=${`max-width:${this.width}px`}><slot></slot></main>
<footer class="ui-footer" style=${`max-width:${this.width}px`}>LLM Gateway · Go rewrite</footer>
`;
    }
  };
  GwShell.styles = [globalCSS, i`
  :host{display:block}
  .ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
  .ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
  .ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
  .ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
  .ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}
  .ui-nav::-webkit-scrollbar{display:none}
  .ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
  .ui-nav-link:hover{background:var(--ui-soft);color:var(--ui-accent)}
  .ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
  .ui-nav-icon{font-size:12px;opacity:.8}
  .ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
  .ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
  .ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
  .ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
  @media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}}
  `];
  GwShell.properties = { title: { state: true }, path: { state: true }, version: { state: true }, nav: { state: true }, width: { state: true } };
  if (!customElements.get("gw-shell")) customElements.define("gw-shell", GwShell);

  // web/src/components/ui.ts
  var uiCSS = i`
.ui-topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--ui-line)}
.ui-topbar-inner{margin:0 auto;padding:0 20px;min-height:64px;display:flex;align-items:center;gap:20px}
.ui-brand{display:flex;align-items:center;gap:9px;font-weight:800;color:var(--ui-ink);font-size:15px;white-space:nowrap}
.ui-brand-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--ui-accent);color:#fff;font-size:13px}
.ui-nav{display:flex;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}.ui-nav::-webkit-scrollbar{display:none}
.ui-nav-link{display:flex;align-items:center;gap:6px;color:var(--ui-muted);padding:8px 11px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}
.ui-nav-link:hover{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-link.is-active{background:var(--ui-soft);color:var(--ui-accent)}
.ui-nav-icon{font-size:12px;opacity:.8}
.ui-topbar-end{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--ui-muted);white-space:nowrap}
.ui-version{font-family:ui-monospace,monospace;padding:2px 7px;border:1px solid var(--ui-line);border-radius:999px}
.ui-main{margin:0 auto;padding:26px 20px 60px;min-height:70vh}
.ui-footer{margin:0 auto;padding:0 20px 28px;color:var(--ui-muted);font-size:12px;text-align:center}
.ui-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--ui-line);flex-wrap:wrap}
.ui-eyebrow{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ui-accent);margin-bottom:4px}
.ui-title{font-size:25px;line-height:1.2;letter-spacing:-.02em;margin:0;font-weight:800}
.ui-subtitle{margin:5px 0 0;color:var(--ui-muted);font-size:13px}
.ui-actions{display:flex;gap:8px;flex-wrap:wrap}
.ui-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.ui-btn:hover{background:#F9FAFB;box-shadow:0 2px 8px rgba(16,24,40,.06)}
.ui-btn-primary{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}
.ui-btn-primary:hover{background:#1D4ED8}
.ui-btn-danger{color:#DC2626;border-color:#FECACA;background:#fff}
.ui-btn-sm{padding:5px 9px;min-height:30px;font-size:12px}
.ui-panel{background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:var(--ui-radius);box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03);overflow:hidden;margin-bottom:16px}
.ui-panel-head{padding:15px 18px;border-bottom:1px solid var(--ui-line);display:flex;align-items:center;justify-content:space-between;gap:12px}
.ui-panel-title{margin:0;font-size:15px;font-weight:800}
.ui-panel-sub{margin:2px 0 0;color:var(--ui-muted);font-size:12px}
.ui-panel-body{padding:18px}
.ui-grid{display:grid;gap:16px}.ui-grid-2{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)}.ui-grid-auto{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.ui-notice{padding:11px 14px;border-radius:10px;margin-bottom:16px;font-size:13px;border:1px solid}
.ui-notice-error{background:#FEF2F2;border-color:#FECACA;color:#991B1B}.ui-notice-success{background:#ECFDF5;border-color:#A7F3D0;color:#065F46}.ui-notice-info{background:var(--ui-soft);border-color:#D7E3FF;color:#1E40AF}
.ui-empty{text-align:center;padding:42px 20px;border:1px dashed var(--ui-line);border-radius:var(--ui-radius);color:var(--ui-muted)}
.ui-empty-mark{font-size:24px;color:var(--ui-accent);margin-bottom:8px}.ui-empty h3{margin:0 0 4px;color:var(--ui-ink)}.ui-empty p{margin:0 0 14px}
.ui-table-wrap{overflow:auto;border:1px solid var(--ui-line);border-radius:var(--ui-radius);background:#fff}
.ui-table{width:100%;border-collapse:collapse;min-width:680px}
.ui-table th{text-align:left;padding:11px 14px;background:#F8FAFC;color:var(--ui-muted);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--ui-line)}
.ui-table td{padding:12px 14px;border-bottom:1px solid var(--ui-line);vertical-align:middle;font-size:13px}
.ui-table tr:last-child td{border-bottom:0}.ui-table tbody tr:hover{background:#FAFCFF}
.ui-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.ui-field-label{font-size:12px;font-weight:800}.ui-field-hint{font-size:11px;color:var(--ui-muted)}
.ui-input,.ui-select,.ui-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.ui-input:focus,.ui-select:focus,.ui-textarea:focus{border-color:var(--ui-accent);box-shadow:0 0 0 3px rgba(37,99,235,.12);outline:none}
.ui-badge{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 7px;border-radius:8px;background:var(--ui-soft);color:var(--ui-accent);font-weight:800;font-size:12px}
.ui-mono{font-family:"IBM Plex Mono",ui-monospace,monospace}
.ui-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ui-spacer{flex:1}
@media(max-width:820px){.ui-topbar-inner{flex-wrap:wrap;padding:10px 14px;gap:8px}.ui-nav{order:3;width:100%;flex-basis:100%}.ui-topbar-end{margin-left:auto}.ui-main{padding:18px 14px 48px}.ui-grid-2{grid-template-columns:1fr}.ui-page-head{align-items:flex-start}.ui-btn{min-height:44px}}

:root{--border-color:var(--ui-line);--bg-page:var(--ui-bg);--text-secondary:var(--ui-muted)}
.form-card,.limits-card{background:#fff;border:1px solid var(--ui-line);border-radius:var(--ui-radius);padding:18px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(16,24,40,.03)}
.form-title,.limits-title{margin:0 0 4px;font-size:18px;font-weight:800}.page-subtitle,.limits-subtitle{margin:0 0 16px;color:var(--ui-muted)}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.form-label{font-size:12px;font-weight:800;color:var(--ui-ink)}
.form-input,.form-select,.form-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
.form-textarea{min-height:120px;resize:vertical}.form-hint{font-size:11px;color:var(--ui-muted)}
.form-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.btn,.btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;min-height:38px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:13px;cursor:pointer}
.btn-primary,.btn-submit{background:var(--ui-accent);border-color:var(--ui-accent);color:#fff}.btn-secondary{background:#fff}.btn-danger{color:#DC2626;border-color:#FECACA}.btn-small{padding:5px 9px;min-height:30px;font-size:12px}.btn-icon{min-width:30px;padding:5px}
.error-banner,.alert-error{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:10px;padding:11px 14px;margin-bottom:16px}.success-banner,.alert-success{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:10px;padding:11px 14px;margin-bottom:16px}
.section-title{font-size:14px;margin:18px 0 10px}.limits-table{width:100%;border-collapse:collapse}.limits-table th,.limits-table td{padding:10px 12px;border-bottom:1px solid var(--ui-line);text-align:left;font-size:13px}.limits-table th{color:var(--ui-muted);font-size:11px}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.model-selector{display:grid;grid-template-columns:1fr 1fr;gap:14px}.model-list{min-height:180px;border:1px solid var(--ui-line);border-radius:10px;padding:12px;background:#FAFCFF}.model-list-title{font-size:13px;margin:0 0 10px}.model-list-empty{color:var(--ui-muted);font-size:12px}.checkbox-list{display:grid;gap:8px}.checkbox-item,.model-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--ui-line);border-radius:8px;background:#fff;font-size:13px}.model-item-name{flex:1}.model-item-desc{color:var(--ui-muted)}.model-actions{display:flex;gap:5px}.selected-index{color:var(--ui-muted);font-family:ui-monospace,monospace}.apikey-display{margin-bottom:14px}.apikey-label{display:block;font-size:12px;font-weight:800;margin-bottom:6px}.apikey-code{display:block;padding:10px;background:#F8FAFC;border:1px solid var(--ui-line);border-radius:8px;word-break:break-all}.apikey-note{font-size:11px;color:var(--ui-muted)}
.heatmap-scroll{overflow-x:auto;padding-bottom:6px}.heatmap-grid{display:flex;gap:3px;min-width:660px}.heatmap-col{display:flex;flex-direction:column;gap:3px;flex:1 1 0;min-width:0}.heatmap-months{display:flex;gap:3px;min-width:660px}.heatmap-months>span{flex:1 1 0;min-width:0;overflow:hidden;white-space:nowrap;color:var(--ui-muted);font-size:11px}.heatmap-cell{display:block;width:100%;aspect-ratio:1/1;border-radius:2px;background:#ebedf0;min-width:0}.heatmap-legend{display:flex;align-items:center;gap:4px;margin-top:10px;color:var(--ui-muted);font-size:11px}.heatmap-legend .heatmap-cell{width:11px;height:11px;flex:none;aspect-ratio:auto}.heatmap-tip{position:fixed;z-index:9999;pointer-events:none;background:#101828;color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 6px 18px rgba(16,24,40,.22)}
@media(max-width:820px){.model-selector{grid-template-columns:1fr}.form-card,.limits-card{padding:14px}.form-actions .btn,.btn-submit{min-height:44px}}
`;
  function pageHeader(opts) {
    return b2`<div class="ui-page-head"><div><div class="ui-eyebrow">${opts.eyebrow || "\u63A7\u5236\u53F0"}</div><h1 class="ui-title">${opts.title}</h1>${opts.subtitle ? b2`<p class="ui-subtitle">${opts.subtitle}</p>` : ""}</div>${opts.actions ? b2`<div class="ui-actions">${opts.actions}</div>` : ""}</div>`;
  }
  function panel(title, subtitle, content = "", actions = "") {
    return b2`<section class="ui-panel">${title || actions ? b2`<div class="ui-panel-head"><div>${title ? b2`<h2 class="ui-panel-title">${title}</h2>` : ""}${subtitle ? b2`<p class="ui-panel-sub">${subtitle}</p>` : ""}</div>${actions ? b2`<div class="ui-panel-actions">${actions}</div>` : ""}</div>` : ""}<div class="ui-panel-body">${content}</div></section>`;
  }
  function notice(message, kind = "info") {
    return b2`<div class=${"ui-notice ui-notice-" + kind}>${message}</div>`;
  }
  function empty(title, hint, action = "") {
    return b2`<div class="ui-empty"><div class="ui-empty-mark">◇</div><h3>${title}</h3><p>${hint}</p>${action}</div>`;
  }
  function table(headers, rows) {
    return b2`<div class="ui-table-wrap"><table class="ui-table"><thead><tr>${headers.map((h3) => b2`<th>${h3}</th>`)}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function formField(label, input, hint = "") {
    return b2`<label class="ui-field"><span class="ui-field-label">${label}</span>${input}${hint ? b2`<span class="ui-field-hint">${hint}</span>` : ""}</label>`;
  }

  // web/src/components/pages/gw-models-page.ts
  function postForm(url) {
    const f3 = document.createElement("form");
    f3.method = "POST";
    f3.action = url;
    document.body.appendChild(f3);
    f3.submit();
  }
  var GwModelsPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = [];
      this.error = "";
      this.post = postForm;
    }
    move(model, dir) {
      this.post(`/admin/models/move/${encodeURIComponent(model.customModel)}?direction=${dir}`);
    }
    toggle(model) {
      this.post(`/admin/models/toggle-hidden/${encodeURIComponent(model.customModel)}`);
    }
    copy(model) {
      if (confirm(`\u786E\u5B9A\u8981\u590D\u5236\u6A21\u578B "${model.customModel}" \u5417\uFF1F`)) this.post(`/admin/models/copy/${encodeURIComponent(model.customModel)}`);
    }
    deleteModel(model) {
      if (confirm(`\u786E\u5B9A\u8981\u5220\u9664\u6A21\u578B "${model.customModel}" \u5417\uFF1F`)) this.post(`/admin/models/delete/${encodeURIComponent(model.customModel)}`);
    }
    render() {
      const rows = this.data.map((m2, i5) => b2`<tr style=${m2.hidden ? "opacity:.55" : ""}>
      <td><span class="ui-badge">${i5 + 1}</span></td>
      <td><strong>${m2.customModel}</strong><div class="ui-field-hint ui-mono">→ ${m2.realModel}</div></td>
      <td>${m2.desc || "\u2014"}</td>
      <td><div class="ui-row">
        <button class="ui-btn ui-btn-sm" data-move-url=${`/admin/models/move/${encodeURIComponent(m2.customModel)}`} data-direction="up" ?disabled=${i5 === 0} @click=${() => this.move(m2, "up")}>↑</button>
        <button class="ui-btn ui-btn-sm" data-move-url=${`/admin/models/move/${encodeURIComponent(m2.customModel)}`} data-direction="down" ?disabled=${i5 === this.data.length - 1} @click=${() => this.move(m2, "down")}>↓</button>
        <button class="ui-btn ui-btn-sm" data-toggle-url=${`/admin/models/toggle-hidden/${encodeURIComponent(m2.customModel)}`} @click=${() => this.toggle(m2)}>${m2.hidden ? "\u663E\u793A" : "\u9690\u85CF"}</button>
        <button class="ui-btn ui-btn-sm" data-copy-url=${`/admin/models/copy/${encodeURIComponent(m2.customModel)}`} @click=${() => this.copy(m2)}>复制</button>
        <a class="ui-btn ui-btn-sm" href=${`/admin/models/edit/${encodeURIComponent(m2.customModel)}`}>编辑</a>
        <a class="ui-btn ui-btn-sm" href=${`/admin/models/${encodeURIComponent(m2.customModel)}/limits`}>限制</a>
        <button class="ui-btn ui-btn-sm ui-btn-danger" data-delete-url=${`/admin/models/delete/${encodeURIComponent(m2.customModel)}`} @click=${() => this.deleteModel(m2)}>删除</button>
      </div></td>
    </tr>`);
      return b2`
${pageHeader({
        eyebrow: "Routing",
        title: "\u6A21\u578B\u7BA1\u7406",
        subtitle: "\u914D\u7F6E\u548C\u7BA1\u7406\u6240\u6709\u4E0A\u6E38\u6A21\u578B\u4FE1\u606F\uFF0C\u8C03\u6574\u987A\u5E8F\u53CA\u589E\u51CF\u6A21\u578B\u3002",
        actions: b2`<a class="ui-btn" href="/admin/model-groups">模型分组</a><a class="ui-btn ui-btn-primary" href="/admin/models/new">+ 新增模型</a>`
      })}
${this.error ? notice(this.error, "error") : ""}
${panel("\u6A21\u578B\u5217\u8868", `${this.data.length} \u4E2A\u6A21\u578B`, this.data.length ? table(["#", "\u6A21\u578B\u540D\u79F0", "\u63CF\u8FF0", "\u64CD\u4F5C"], rows) : empty("\u6682\u65E0\u6A21\u578B", "\u70B9\u51FB\u201C\u65B0\u589E\u6A21\u578B\u201D\u5F00\u59CB\u914D\u7F6E\u3002"))}
`;
    }
  };
  GwModelsPage.styles = [uiCSS];
  GwModelsPage.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-models-page")) customElements.define("gw-models-page", GwModelsPage);

  // web/src/components/pages/gw-groups-page.ts
  var GwGroupsPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = [];
      this.error = "";
      this.success = "";
    }
    render() {
      const cards = this.data.map((g2) => b2`<article class="ui-panel" style="margin:0">
      <div class="ui-panel-head"><div><h3 class="ui-panel-title">${g2.name}</h3><p class="ui-panel-sub">${g2.models.length} 个模型</p></div><a class="ui-btn ui-btn-sm" href=${`/admin/model-groups/edit/${encodeURIComponent(g2.name)}`}>管理模型</a></div>
      <div class="ui-panel-body"><p class="ui-field-hint">${g2.desc || "\u2014"}</p><div class="ui-row" style="margin:10px 0 14px">${g2.models.slice(0, 5).map((m2) => b2`<a class="ui-badge" href=${`/admin/models/edit/${encodeURIComponent(m2)}`}>${m2}</a>`)}${g2.models.length > 5 ? b2`<span class="ui-field-hint">+${g2.models.length - 5}</span>` : ""}</div>
      <form method="POST" action=${`/admin/model-groups/delete/${encodeURIComponent(g2.name)}`}><button class="ui-btn ui-btn-sm ui-btn-danger">删除分组</button></form></div></article>`);
      return b2`
${pageHeader({ eyebrow: "Routing", title: "\u6A21\u578B\u5206\u7EC4", subtitle: "\u7BA1\u7406\u6A21\u578B\u5206\u7EC4\u914D\u7F6E", actions: b2`<a class="ui-btn" href="/admin/models">返回模型</a><a class="ui-btn ui-btn-primary" href="/admin/model-groups/new">+ 新建分组</a>` })}
${this.error ? notice(this.error, "error") : ""}${this.success ? notice(this.success, "success") : ""}
${this.data.length ? b2`<div class="ui-grid ui-grid-auto">${cards}</div>` : panel("\u5206\u7EC4\u5217\u8868", "", empty("\u6682\u65E0\u5206\u7EC4", "\u521B\u5EFA\u5206\u7EC4\u540E\u53EF\u914D\u7F6E\u6A21\u578B\u56DE\u9000\u987A\u5E8F\u3002"))}
`;
    }
  };
  GwGroupsPage.styles = [uiCSS];
  GwGroupsPage.properties = { data: { state: true }, error: { state: true }, success: { state: true } };
  if (!customElements.get("gw-groups-page")) customElements.define("gw-groups-page", GwGroupsPage);

  // web/src/components/pages/gw-users-page.ts
  var GwUsersPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = [];
      this.enabled = true;
      this.error = "";
    }
    render() {
      const cards = this.data.map((u3) => b2`<article class="ui-panel" style="margin:0">
      <div class="ui-panel-head"><div><h3 class="ui-panel-title">${u3.name}</h3><p class="ui-panel-sub">${u3.desc || "\u2014"}</p></div><a class="ui-btn ui-btn-sm" href=${`/admin/users/edit/${encodeURIComponent(u3.name)}`}>编辑</a></div>
      <div class="ui-panel-body">
        <div class="ui-field-hint ui-mono" style="margin-bottom:10px">${u3.apikey.slice(0, 8)}…</div>
        <div class="ui-row">${!u3.allowedModels || u3.allowedModels.length === 0 ? b2`<span class="ui-badge">所有模型</span>` : b2`${u3.allowedModels.slice(0, 3).map((m2) => b2`<span class="ui-badge">${m2}</span>`)}${(u3.allowedModels?.length || 0) > 3 ? b2`<span class="ui-field-hint">等${u3.allowedModels.length - 3}个模型</span>` : ""}`}</div>
        <div class="ui-row" style="margin-top:14px"><form method="POST" action=${`/api/admin/users/delete/${encodeURIComponent(u3.name)}`}><button class="ui-btn ui-btn-sm ui-btn-danger">删除</button></form></div>
      </div></article>`);
      const toggle = b2`<form method="post" action="/admin/users/toggle"><input type="hidden" name="enabled" value=${this.enabled ? "false" : "true"}><button class="ui-btn">${this.enabled ? "\u7981\u7528\u7528\u6237\u8BA4\u8BC1" : "\u542F\u7528\u7528\u6237\u8BA4\u8BC1"}</button></form>`;
      return b2`
${pageHeader({ eyebrow: "Access", title: "\u7528\u6237\u7BA1\u7406", subtitle: "\u7BA1\u7406\u8BBF\u95EE API \u7684\u7528\u6237\u548C\u5BC6\u94A5", actions: b2`<a class="ui-btn ui-btn-primary" href="/admin/users/new">+ 新增用户</a>${toggle}` })}
${this.error ? notice(this.error, "error") : ""}
${this.data.length ? b2`<div class="ui-grid ui-grid-auto">${cards}</div>` : panel("\u7528\u6237\u5217\u8868", "", empty("\u6682\u65E0\u7528\u6237", "\u6DFB\u52A0\u7528\u6237\u540E\u5373\u53EF\u6309\u5BC6\u94A5\u9650\u5236\u8BBF\u95EE\u3002"))}
`;
    }
  };
  GwUsersPage.styles = [uiCSS];
  GwUsersPage.properties = { data: { state: true }, error: { state: true }, enabled: { state: true } };
  if (!customElements.get("gw-users-page")) customElements.define("gw-users-page", GwUsersPage);

  // web/src/components/pages/gw-api-keys-page.ts
  var GwApiKeysPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = [];
      this.error = "";
      this.success = "";
    }
    render() {
      const rows = this.data.map((k2) => b2`<tr>
      <td><strong>${k2.name}</strong><div class="ui-field-hint">${k2.createdAt ? new Date(k2.createdAt).toLocaleDateString("zh-CN") : ""}</div></td>
      <td class="ui-mono">${k2.keyHint || (k2.key ? "*****" + k2.key.slice(-4) : "*****")}</td>
      <td><div class="ui-row">
        <a class="ui-btn ui-btn-sm" href=${`/admin/api-keys/edit/${encodeURIComponent(k2.id)}`}>编辑</a>
        <form method="POST" action=${`/admin/api-keys/delete/${encodeURIComponent(k2.id)}`} @submit=${(e4) => {
        if (!confirm(`\u786E\u5B9A\u5220\u9664 ${k2.name}?`)) e4.preventDefault();
      }}><button class="ui-btn ui-btn-sm ui-btn-danger">删除</button></form>
      </div></td>
    </tr>`);
      const form = b2`<form method="POST" action=${this.editing ? "/admin/api-keys/edit/" + encodeURIComponent(this.editing.id) : "/admin/api-keys"}>
      ${formField("\u540D\u79F0", b2`<input class="ui-input" name="name" value=${this.editing ? this.editing.name : ""} placeholder="例如：主网关 Key" required>`)}
      ${formField("API Key", b2`<input class="ui-input" name="key" placeholder=${this.editing ? "\u7559\u7A7A\u8868\u793A\u4FDD\u6301\u5F53\u524D\u503C" : "sk-..."} ?required=${!this.editing}>`, this.editing ? `\u5F53\u524D\u503C\uFF1A${this.editing.keyHint}` : "")}
      <div class="ui-row"><button class="ui-btn ui-btn-primary">${this.editing ? "\u4FDD\u5B58\u4FEE\u6539" : "\u6DFB\u52A0\u5BC6\u94A5"}</button><a class="ui-btn" href="/admin/api-keys">取消</a></div>
    </form>`;
      return b2`
${pageHeader({ eyebrow: "Credentials", title: "API Key \u7BA1\u7406", subtitle: "\u96C6\u4E2D\u7EF4\u62A4\u4E0A\u6E38\u8C03\u7528\u4F7F\u7528\u7684\u5BC6\u94A5\uFF0C\u6A21\u578B\u914D\u7F6E\u53EF\u901A\u8FC7 $$\u540D\u79F0$$ \u5F15\u7528\u3002", actions: b2`<a class="ui-btn ui-btn-primary" href="/admin/api-keys">+ 新增密钥</a>` })}
${this.error ? notice(this.error, "error") : ""}${this.success ? notice(this.success, "success") : ""}
<div class="ui-grid ui-grid-2">
  ${panel("\u5BC6\u94A5\u5217\u8868", `${this.data.length} \u4E2A\u5DF2\u5B58\u50A8\u5BC6\u94A5`, this.data.length ? table(["\u540D\u79F0", "Key", "\u64CD\u4F5C"], rows) : empty("\u6682\u65E0\u5BC6\u94A5", "\u6DFB\u52A0\u7B2C\u4E00\u4E2A API Key \u540E\u5373\u53EF\u5728\u6A21\u578B\u914D\u7F6E\u4E2D\u5F15\u7528\u3002"))}
  ${panel(this.editing ? "\u7F16\u8F91\u5BC6\u94A5" : "\u65B0\u589E\u5BC6\u94A5", "", form)}
</div>
`;
    }
  };
  GwApiKeysPage.styles = [uiCSS];
  GwApiKeysPage.properties = { data: { state: true }, error: { state: true }, success: { state: true }, editing: { state: true } };
  if (!customElements.get("gw-api-keys-page")) customElements.define("gw-api-keys-page", GwApiKeysPage);

  // web/src/components/pages/gw-announcement-page.ts
  var GwAnnouncementPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = "";
      this.enabled = true;
      this.error = "";
      this.success = "";
    }
    render() {
      return b2`
${pageHeader({ eyebrow: "ANNOUNCEMENT", title: "\u516C\u544A\u7BA1\u7406", subtitle: "\u8BBE\u7F6E\u7528\u6237\u9875\u9762\u663E\u793A\u7684\u516C\u544A\uFF08\u652F\u6301 Markdown\uFF09" })}
${this.error ? notice(this.error, "error") : ""}${this.success ? notice(this.success, "success") : ""}
${panel("", "", b2`<div class="form-card"><form method="POST" action="/admin/announcement"><div class="form-group"><label class="form-label" for="content">公告内容</label><textarea class="form-textarea" id="content" name="content" rows="12">${this.data}</textarea></div><div class="form-group"><label><input type="checkbox" name="enabled" ?checked=${this.enabled}> 启用公告</label></div><div class="form-actions"><button class="btn btn-primary" type="submit">保存公告</button></div></form></div>`)}
`;
    }
  };
  GwAnnouncementPage.styles = [uiCSS];
  GwAnnouncementPage.properties = { data: { state: true }, error: { state: true }, success: { state: true }, enabled: { state: true } };
  if (!customElements.get("gw-announcement-page")) customElements.define("gw-announcement-page", GwAnnouncementPage);

  // web/src/components/pages/gw-privacy-page.ts
  var GwPrivacyPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = { enabled: false, stripUserField: false, sanitizeFilePaths: false, pathPlaceholder: "USER", whitelistFilter: false };
      this.detailLogEnabled = false;
      this.cliDebug = false;
      this.error = "";
      this.success = "";
    }
    render() {
      const s4 = this.data;
      const checks = [
        ["enabled", "\u542F\u7528\u9690\u79C1\u4FDD\u62A4"],
        ["stripUserField", "\u62B9\u6389 user \u5B57\u6BB5"],
        ["sanitizeFilePaths", "\u6587\u4EF6\u8DEF\u5F84\u7528\u6237\u540D\u66FF\u6362"],
        ["whitelistFilter", "\u767D\u540D\u5355\u5B57\u6BB5\u8FC7\u6EE4"]
      ];
      return b2`
${pageHeader({ eyebrow: "PRIVACY", title: "\u9690\u79C1\u4FDD\u62A4", subtitle: "\u63A7\u5236\u65E5\u5FD7\u4E2D\u7684\u654F\u611F\u4FE1\u606F\u5904\u7406" })}
${this.error ? notice(this.error, "error") : ""}${this.success ? notice(this.success, "success") : ""}
${panel("", "", b2`<div class="form-card"><form id="privacy-form" method="POST" action="/admin/privacy">
  ${checks.map(([k2, label]) => b2`<div class="form-group"><label><input type="checkbox" name=${k2} ?checked=${!!s4[k2]}> ${label}</label></div>`)}
  <div class="form-group"><label class="form-label" for="pathPlaceholder">路径占位符</label><input class="form-input" id="pathPlaceholder" name="pathPlaceholder" value=${s4.pathPlaceholder || "USER"}></div>
  <div class="form-group"><label class="form-label">日志记录</label><label><input type="checkbox" name="detailLogEnabled" ?checked=${this.detailLogEnabled} ?disabled=${this.cliDebug}> 记录完整请求/响应日志</label>${this.cliDebug ? b2`<p class="form-hint">命令行启动时使用了 --debug，日志记录设置不可修改</p>` : ""}</div>
  <div class="form-group"><label class="form-label">命令行调试参数</label><code>--debug</code></div>
  <div class="form-actions"><button class="btn btn-primary" type="submit">保存设置</button></div>
</form></div>`)}
`;
    }
  };
  GwPrivacyPage.styles = [uiCSS];
  GwPrivacyPage.properties = { data: { state: true }, error: { state: true }, success: { state: true }, enabled: { state: true }, detailLogEnabled: { state: true }, cliDebug: { state: true } };
  if (!customElements.get("gw-privacy-page")) customElements.define("gw-privacy-page", GwPrivacyPage);

  // web/src/components/pages/gw-password-page.ts
  var GwPasswordPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.hasPassword = true;
      this.error = "";
      this.success = "";
    }
    async submit(e4) {
      e4.preventDefault();
      const f3 = e4.target;
      const action = document.activeElement?.value || "change";
      const body = {
        action,
        currentPassword: f3.querySelector("[name=currentPassword]")?.value || "",
        newPassword: f3.querySelector("[name=newPassword]").value,
        confirmPassword: f3.querySelector("[name=confirmPassword]").value
      };
      const r4 = await fetch("/api/admin/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r4.json();
      if (j.ok) location.reload();
      else alert(j.error?.message || "\u64CD\u4F5C\u5931\u8D25");
    }
    render() {
      return b2`
${pageHeader({ eyebrow: "SECURITY", title: "\u5BC6\u7801\u8BBE\u7F6E", subtitle: "\u8BBE\u7F6E\u6216\u4FEE\u6539\u7BA1\u7406\u540E\u53F0\u767B\u5F55\u5BC6\u7801" })}
${this.error ? notice(this.error, "error") : ""}${this.success ? notice(this.success, "success") : ""}
${panel("", "", b2`<div class="form-card"><form method="POST" action="/api/admin/password" @submit=${this.submit}>
  ${this.hasPassword ? b2`<div class="form-group"><label class="form-label" for="currentPassword">当前密码</label><input class="form-input" type="password" id="currentPassword" name="currentPassword"></div>` : ""}
  <div class="form-group"><label class="form-label" for="newPassword">新密码</label><input class="form-input" type="password" id="newPassword" name="newPassword"></div>
  <div class="form-group"><label class="form-label" for="confirmPassword">确认新密码</label><input class="form-input" type="password" id="confirmPassword" name="confirmPassword"></div>
  <div class="form-actions"><button class="btn btn-primary" name="action" value="change">保存密码</button>${this.hasPassword ? b2`<button class="btn btn-danger" name="action" value="delete">删除密码</button>` : ""}</div>
</form></div>`)}
`;
    }
  };
  GwPasswordPage.styles = [uiCSS];
  GwPasswordPage.properties = { error: { state: true }, success: { state: true }, hasPassword: { state: true } };
  if (!customElements.get("gw-password-page")) customElements.define("gw-password-page", GwPasswordPage);

  // web/src/components/gw-json-editor.ts
  var GwJsonEditor = class extends i4 {
    constructor() {
      super(...arguments);
      this.name = "defaultParams";
      this.value = "";
      this.previewText = "";
      this.valid = true;
    }
    firstUpdated() {
      this.validate();
    }
    validate() {
      const ta = this.shadowRoot.querySelector("textarea");
      this.value = ta?.value ?? this.value;
      try {
        const parsed = JSON.parse(this.value);
        this.previewText = JSON.stringify(parsed, null, 2);
        this.valid = true;
      } catch (e4) {
        this.previewText = "JSON \u683C\u5F0F\u9519\u8BEF\uFF1A" + e4.message;
        this.valid = false;
      }
      const hidden = this.shadowRoot.querySelector("input[type=hidden]");
      if (hidden) hidden.value = this.value;
    }
    format() {
      const ta = this.shadowRoot.querySelector("textarea");
      try {
        ta.value = JSON.stringify(JSON.parse(ta.value), null, 2);
      } catch {
      }
      this.validate();
    }
    clear() {
      const ta = this.shadowRoot.querySelector("textarea");
      ta.value = "";
      this.validate();
    }
    render() {
      return b2`
<textarea class="form-textarea" .value=${this.value} placeholder='{"temperature":0.7}' @input=${() => this.validate()}></textarea>
<input type="hidden" name=${this.name} .value=${this.value}>
<pre class=${"json-preview " + (this.valid ? "valid" : "invalid")}>${this.previewText}</pre>
<div class="form-actions"><button type="button" class="btn" @click=${() => this.format()}>格式化</button><button type="button" class="btn" @click=${() => this.clear()}>清空</button></div>
`;
    }
  };
  GwJsonEditor.styles = i`
  static properties = { value: { state: true } }
  .form-input,.form-textarea{width:100%;border:1px solid #D0D5DD;border-radius:9px;padding:9px 11px;min-height:38px;font:inherit;background:#fff;color:var(--ui-ink)}
  .form-textarea{min-height:120px;resize:vertical}
  .form-hint{font-size:11px;color:var(--ui-muted)}
  .json-preview{background:#F8FAFC;border:1px solid var(--ui-line);border-radius:8px;padding:10px;font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;margin-top:8px}
  .json-preview.valid{background:#ECFDF5;border-color:#A7F3D0;color:#065F46}
  .json-preview.invalid{background:#FEF2F2;border-color:#FECACA;color:#991B1B}
  .form-actions{display:flex;gap:8px;margin-top:8px}
  .btn{padding:5px 9px;min-height:30px;border:1px solid var(--ui-line);border-radius:9px;background:#fff;color:var(--ui-ink);font-weight:700;font-size:12px;cursor:pointer}
  `;
  if (!customElements.get("gw-json-editor")) customElements.define("gw-json-editor", GwJsonEditor);

  // web/src/components/pages/gw-model-form-page.ts
  var GwModelFormPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = { keys: [] };
      this.error = "";
    }
    keyOptions() {
      const keys = this.data.keys;
      return (Array.isArray(keys) ? keys : []).map((k2) => typeof k2 === "string" ? { id: k2, name: k2 } : k2);
    }
    onApiKeySource(e4) {
      const sel = e4.target;
      const input = this.shadowRoot.querySelector("#apiKeyManual");
      input.disabled = sel.value !== "manual";
      if (input.disabled) input.value = "";
    }
    async runTest() {
      const sr = this.shadowRoot;
      const btn = sr.querySelector("#testBtn");
      btn.disabled = true;
      sr.querySelector("#testLoading").style.display = "block";
      const show = (id, display = "block") => {
        const el = sr.querySelector("#" + id);
        if (el) el.style.display = display;
      };
      const text = (id, value) => {
        const el = sr.querySelector("#" + id);
        if (el) el.textContent = value;
      };
      try {
        const src = sr.querySelector("#apiKeySourceTest").value;
        const payload = {
          provider: btn.dataset.provider,
          baseUrl: btn.dataset.base,
          realModel: btn.dataset.real,
          message: sr.querySelector("#testMessage").value,
          defaultParams: JSON.parse(btn.dataset.params || "{}"),
          proxy: sr.querySelector("#proxy")?.value || ""
        };
        if (src !== "manual") payload.apiKeyId = src;
        else payload.apiKey = sr.querySelector("#apiKeyTest").value;
        const res = await fetch("/admin/models/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const d3 = await res.json();
        if (d3.success) {
          text("testResultModel", d3.model || btn.dataset.real || "");
          text("testResultContent", d3.content || "(\u65E0\u5185\u5BB9)");
          text("testResultUsage", d3.usage ? `Tokens: \u8F93\u5165=${d3.usage.prompt_tokens}, \u8F93\u51FA=${d3.usage.completion_tokens}` : "");
          if (d3.requestBody) {
            text("requestBodyContent", d3.requestBody);
            show("requestSection");
          }
          if (d3.fullResponse) {
            text("responseBodyContent", d3.fullResponse);
            show("responseSection");
          }
          show("testResult");
        } else {
          text("testErrorMessage", d3.message || "\u672A\u77E5\u9519\u8BEF");
          if (d3.rawResponse) {
            text("testRawResponse", d3.rawResponse);
            show("rawResponseSection");
          }
          show("testError");
        }
      } catch (e4) {
        const el = this.shadowRoot.querySelector("#testErrorMessage");
        if (el) el.textContent = "\u8BF7\u6C42\u5931\u8D25: " + e4.message;
        show("testError");
      } finally {
        btn.disabled = false;
        this.shadowRoot.querySelector("#testLoading").style.display = "none";
      }
    }
    toggleRawResponse() {
      const s4 = this.shadowRoot.querySelector("#rawResponseSection");
      s4.style.display = s4.style.display === "none" ? "block" : "none";
    }
    render() {
      const d3 = this.data || {};
      const model = d3.model || {};
      const isEdit = !!d3.model;
      const refName = this.data.ref || (model.apiKey?.startsWith("$$") && model.apiKey.endsWith("$$") ? model.apiKey.slice(2, -2) : "");
      const opts = this.keyOptions();
      const keyOptions = opts.map((k2) => b2`<option value=${k2.id} ?selected=${refName === k2.name}>${k2.name}</option>`);
      const err = this.error || this.data.error || "";
      const title = isEdit ? "\u7F16\u8F91\u6A21\u578B" : "\u65B0\u589E\u6A21\u578B";
      const testHtml = isEdit ? b2`<details class="test-details"><summary>🧪 测试模型配置</summary><div class="form-card" style="margin-top:1rem">
      <div class="form-group"><label class="form-label" for="testMessage">测试消息</label><textarea class="form-textarea" id="testMessage" placeholder="请介绍一下你自己">请介绍一下你自己</textarea></div>
      <div class="form-group"><label class="form-label" for="apiKeySourceTest">API Key 来源</label><select id="apiKeySourceTest"><option value="manual">手动输入</option>${keyOptions}</select><input id="apiKeyTest" placeholder="留空则使用模型已保存的 Key"></div>
      <button type="button" class="btn btn-primary" id="testBtn" @click=${() => this.runTest()} data-provider=${model.provider || ""} data-base=${model.baseUrl || ""} data-real=${model.realModel || ""} data-params=${JSON.stringify(model.defaultParams || {})}>发送测试请求</button>
      <div id="testLoading" style="display:none;margin-top:0.75rem">发送中…</div>
      <div id="testResult" style="display:none;margin-top:1rem">模型: <strong id="testResultModel"></strong><pre id="testResultContent"></pre><div id="testResultUsage"></div></div>
      <div id="requestSection" style="display:none"><pre id="requestBodyContent"></pre></div>
      <div id="responseSection" style="display:none"><pre id="responseBodyContent"></pre></div>
      <div id="testError" style="display:none;margin-top:1rem;color:#dc2626"><span id="testErrorMessage"></span><div id="rawResponseSection" style="display:none"><pre id="testRawResponse"></pre><button type="button" class="btn" @click=${() => this.toggleRawResponse()}>切换原始响应</button></div></div>
    </div></details>` : "";
      return b2`
${pageHeader({ eyebrow: "MODEL", title, subtitle: isEdit ? "\u4FEE\u6539\u6A21\u578B\u914D\u7F6E\u4E0E API Key \u5F15\u7528" : "\u521B\u5EFA\u65B0\u7684\u4E0A\u6E38\u6A21\u578B\u914D\u7F6E", actions: b2`<a class="ui-btn" href="/admin/models">返回模型</a>` })}
${err ? notice(err, "error") : ""}
${panel("\u6A21\u578B\u914D\u7F6E", "", b2`<div class="form-card"><form method="post" action=${isEdit ? `/admin/models/edit/${encodeURIComponent(model.customModel)}` : "/admin/models"}>
  <div class="form-group"><label class="form-label" for="customModel">模型名称</label><input class="form-input" id="customModel" name="customModel" value=${model.customModel || ""} placeholder="例如：my-gpt4" required><span class="form-hint">调用 API 时使用此名称</span></div>
  <div class="form-group"><label class="form-label" for="realModel">实际模型名称</label><input class="form-input" id="realModel" name="realModel" value=${model.realModel || ""} placeholder="例如：gpt-4" required><span class="form-hint">上游 API 支持的模型名称</span></div>
  <div class="form-group"><label class="form-label" for="provider">Provider</label><select class="form-select" id="provider" name="provider" required><option value="">请选择...</option>${["openai", "response-api", "anthropic"].map((p3) => b2`<option value=${p3} ?selected=${model.provider === p3}>${p3}</option>`)}</select></div>
  <div class="form-group"><label class="form-label" for="baseUrl">Base URL</label><input class="form-input" id="baseUrl" name="baseUrl" value=${model.baseUrl || ""} placeholder="例如：https://api.openai.com" required><span class="form-hint">API 提供商的地址</span></div>
  <div class="form-group"><label class="form-label" for="proxy">代理（可选）</label><input class="form-input" id="proxy" name="proxy" value=${model.proxy || ""} placeholder="http://user:pass@127.0.0.1:7890 或 socks5://127.0.0.1:1080"><span class="form-hint">发往上游的请求通过此代理转发，留空则直连。支持 http://、https://、socks5://（可带 user:pass@ 认证）；不支持 socks5h:// 和 socks4://</span></div>
  <div class="form-group"><label class="form-label" for="apiKeySource">API Key</label><select class="form-select" id="apiKeySource" name="apiKeySource" @change=${(e4) => this.onApiKeySource(e4)}><option value="manual" ?selected=${!refName}>手动输入</option>${keyOptions}</select><input class="form-input" id="apiKeyManual" name="apiKey" ?disabled=${!!refName} placeholder=${refName ? `\u4F7F\u7528\u5F15\u7528\uFF1A$$${refName}$$` : isEdit ? "\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : "\u8BF7\u8F93\u5165 API Key"}><span class="form-hint">${refName ? `\u5F15\u7528 API Key\u300C${refName}\u300D\uFF0C\u4FEE\u6539\u540E\u5C06\u5168\u5C40\u751F\u6548` : "\u53EF\u9009\u62E9\u5DF2\u4FDD\u5B58\u7684 API Key\uFF0C\u6216\u624B\u52A8\u8F93\u5165"}${isEdit ? "\uFF1B\u7559\u7A7A\u5219\u4FDD\u6301\u539F\u5BC6\u94A5\u4E0D\u53D8" : ""}</span></div>
  <div class="form-group"><label class="form-label" for="desc">描述</label><textarea class="form-textarea" id="desc" name="desc" placeholder="请输入模型描述（可选）">${model.desc || ""}</textarea><span class="form-hint">用于记录模型的用途或备注</span></div>
  <div class="form-group"><label class="form-label" for="maxContextLength">最大上下文长度</label><input class="form-input" id="maxContextLength" name="maxContextLength" type="number" value=${model.maxContextLength || ""} placeholder="默认 200000"><span class="form-hint">模型支持的最大 token 数，未填写则使用默认值 200000</span></div>
  <div class="form-group"><label class="form-label">默认参数 (JSON)</label><gw-json-editor name="defaultParams" .value=${model.defaultParams ? JSON.stringify(model.defaultParams, null, 2) : ""}></gw-json-editor></div>
  <div class="form-actions"><button type="submit" class="btn btn-primary">保存模型</button><a href="/admin/models" class="btn btn-secondary">取消</a></div>
</form></div>`)}
${testHtml}
`;
    }
  };
  GwModelFormPage.styles = [uiCSS];
  GwModelFormPage.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-model-form-page")) customElements.define("gw-model-form-page", GwModelFormPage);

  // web/src/components/pages/gw-group-form-page.ts
  var GwGroupFormPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = { models: [] };
      this.error = "";
      this.selected = [];
      this.filter = "";
    }
    willUpdate() {
      const selected = this.data.group?.models;
      if (selected && this.selected.length === 0) this.selected = [...selected];
    }
    sync() {
      const boxes = this.shadowRoot.querySelectorAll('input[name="modelCheckbox"]');
      this.selected = Array.from(boxes).filter((b3) => b3.checked).map((b3) => b3.value);
      const hidden = this.shadowRoot.querySelector('input[name="models"]');
      hidden.value = JSON.stringify(this.selected);
    }
    removeModel(i5) {
      this.selected.splice(i5, 1);
      const boxes = this.shadowRoot.querySelectorAll('input[name="modelCheckbox"]');
      boxes.forEach((c4) => {
        c4.checked = this.selected.includes(c4.value);
      });
      this.sync();
      this.requestUpdate();
    }
    render() {
      const group = this.data.group || {};
      const isEdit = !!group.name;
      const title = isEdit ? `\u7F16\u8F91 Model Group - ${group.name}` : "\u65B0\u589E Model Group";
      const opts = (this.data.models || []).map((m2) => typeof m2 === "string" ? { customModel: m2 } : m2);
      const err = this.error || this.data.error || "";
      const filtered = opts.filter((m2) => m2.customModel.toLowerCase().includes(this.filter.toLowerCase()));
      return b2`
${pageHeader({ eyebrow: "MODEL GROUP", title, subtitle: "\u6A21\u578B\u7EC4\u53EF\u4F5C\u4E3A API model \u4F7F\u7528\uFF0C\u6309\u987A\u5E8F\u9009\u62E9\u591A\u4E2A\u6A21\u578B\u5B9E\u73B0 fallback", actions: b2`<a class="ui-btn" href="/admin/model-groups">返回模型组</a>` })}
${err ? notice(err, "error") : ""}${this.data.success ? notice(this.data.success, "success") : ""}
${panel("", "", b2`<div class="form-card"><form method="POST" action=${isEdit ? `/admin/model-groups/edit/${encodeURIComponent(group.name)}` : "/admin/model-groups/add"}>
  <input type="hidden" name="originalName" value=${group.name || ""}>
  <div class="form-group"><label class="form-label" for="name">组名</label><input class="form-input" id="name" name="name" value=${group.name || ""} placeholder="例如：my-group" required></div>
  <div class="form-group"><label class="form-label" for="desc">描述</label><input class="form-input" id="desc" name="desc" value=${group.desc || ""} placeholder="可选"></div>
  <div class="form-group"><label class="form-label" for="new-model-filter">筛选模型</label><input class="form-input" id="new-model-filter" placeholder="输入模型名过滤" @input=${(e4) => {
        this.filter = e4.target.value;
        this.requestUpdate();
      }}></div>
  <div class="model-selector"><div><h3 class="model-list-title">可用模型</h3><div class="model-list" id="all-models">${filtered.map((m2) => b2`<label class="model-item" data-name=${m2.customModel}><input type="checkbox" name="modelCheckbox" value=${m2.customModel} ?checked=${this.selected.includes(m2.customModel)} @change=${() => this.sync()}> <span class="model-item-name">${m2.customModel}</span><span class="model-item-desc">${m2.desc || ""}</span></label>`)}</div></div>
  <div><h3 class="model-list-title">已选模型（按顺序）</h3><div class="model-list" id="selected-models">${this.selected.length ? this.selected.map((n4, i5) => b2`<div class="model-item"><span class="selected-index">${i5 + 1}</span><span class="model-item-name">${n4}</span><button type="button" class="btn btn-small btn-danger" @click=${() => this.removeModel(i5)}>移除</button></div>`) : b2`<p class="model-list-empty">尚未选择模型</p>`}</div>${isEdit ? b2`<div class="model-actions"><a class="btn btn-small" href=${`/admin/model-groups/edit/${encodeURIComponent(group.name)}/remove-model?model=${encodeURIComponent(this.selected[0] || "")}`}>移除首个模型</a></div>` : ""}</div></div>
  <input name="models" type="hidden" .value=${JSON.stringify(this.selected)}>
  <div class="form-actions"><button class="btn btn-primary" type="submit">保存模型组</button><a class="btn btn-secondary" href="/admin/model-groups">取消</a></div>
</form></div>`)}
`;
    }
  };
  GwGroupFormPage.styles = [uiCSS];
  GwGroupFormPage.properties = { data: { state: true }, error: { state: true }, selected: { state: true }, filter: { state: true } };
  if (!customElements.get("gw-group-form-page")) customElements.define("gw-group-form-page", GwGroupFormPage);

  // web/src/components/pages/gw-user-form-page.ts
  var GwUserFormPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = { models: [] };
      this.error = "";
    }
    render() {
      const user = this.data.user || {};
      const isEdit = !!user.name;
      const title = isEdit ? "\u7F16\u8F91\u7528\u6237" : "\u65B0\u589E\u7528\u6237";
      const groups = Array.isArray(user.allowedModels) ? user.allowedModels : Array.isArray(user.groups) ? user.groups : [];
      const opts = (this.data.models || []).map((g2) => typeof g2 === "string" ? { name: g2, desc: "" } : g2);
      const err = this.error || this.data.error || "";
      return b2`
${pageHeader({ eyebrow: "USER", title, subtitle: isEdit ? `\u7528\u6237\uFF1A${user.name || ""}` : "\u521B\u5EFA\u7528\u6237\u5E76\u5206\u914D\u7528\u6237\u7EC4", actions: b2`<a class="ui-btn" href="/admin/users">返回用户列表</a>` })}
${err ? notice(err, "error") : ""}${this.data.success ? notice(this.data.success, "success") : ""}
${panel("", "", b2`<div class="form-card"><form method="POST" action=${isEdit ? `/admin/users/edit/${encodeURIComponent(user.name)}` : "/admin/users/add"}>
  <div class="form-group"><label class="form-label" for="name">用户名</label><input class="form-input" id="name" name="name" value=${user.name || ""} ?readonly=${isEdit}></div>
  <div class="form-group"><label class="form-label" for="description">描述</label><input class="form-input" id="description" name="description" value=${user.description || ""}></div>
  <div class="form-group"><label class="form-label" for="apiKey">API Key</label><input class="form-input" id="apiKey" name="apiKey" value=${user.apikey || user.apiKey || ""} placeholder="留空自动生成"></div>
  <div class="form-group"><label class="form-label">模型权限</label><div class="checkbox-list">${opts.map((g2) => b2`<label class="checkbox-item"><input type="checkbox" name="allowedModels" value=${g2.name} ?checked=${groups.includes(g2.name)}> ${g2.name} <span class="model-item-desc">${g2.desc || ""}</span></label>`)}<span class="form-hint">不选择任何模型表示不限制</span></div></div>
  <div class="form-actions"><button class="btn btn-primary" type="submit">保存用户</button><a class="btn btn-secondary" href="/admin/users">取消</a></div>
</form></div>`)}
`;
    }
  };
  GwUserFormPage.styles = [uiCSS];
  GwUserFormPage.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-user-form-page")) customElements.define("gw-user-form-page", GwUserFormPage);

  // web/src/components/pages/gw-model-limits-page.ts
  var GwModelLimitsPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.model = "";
      this.data = [];
      this.error = "";
      this.success = "";
      this.isCost = false;
    }
    firstUpdated() {
      this.handleTypeChange();
    }
    handleTypeChange() {
      const t3 = this.shadowRoot.querySelector("#type")?.value || "rpm";
      this.isCost = t3 === "cost";
      this.requestUpdate();
    }
    editLimit(i5) {
      const l3 = this.data[i5];
      const sr = this.shadowRoot;
      sr.querySelector("#editForm").action = `/api/admin/models/${encodeURIComponent(this.model)}/limits/edit/${i5}`;
      sr.querySelector("#editIndex").value = String(i5);
      sr.querySelector("#editType").value = l3.type;
      sr.querySelector("#editPeriod").value = l3.period;
      sr.querySelector("#editPeriodValue").value = String(l3.periodValue);
      sr.querySelector("#editMax").value = String(l3.max);
      sr.querySelector("#editCostMax").value = String(l3.costMax);
      sr.querySelector("#editGroupName").value = l3.groupName;
    }
    render() {
      const m2 = this.model;
      const rows = this.data.map((l3, i5) => b2`<tr><td>${l3.type}</td><td>${l3.period}</td><td>${l3.periodValue}</td><td>${l3.type === "cost" ? l3.costMax : l3.max}</td><td>${l3.groupName || ""}</td><td>${l3.enabled ? "\u542F\u7528" : "\u7981\u7528"}</td><td><div class="actions-cell"><button class="btn btn-small" type="button" @click=${() => this.editLimit(i5)}>编辑</button><form method="POST" action=${`/api/admin/models/${encodeURIComponent(m2)}/limits/delete/${i5}`} style="display:inline"><button class="btn btn-small btn-danger" type="submit">删除</button></form></div></td></tr>`);
      return b2`
${pageHeader({ eyebrow: "MODEL LIMITS", title: `\u9650\u5236\u89C4\u5219\u7BA1\u7406 - ${m2}`, subtitle: "\u8BBE\u7F6E\u6BCF\u5206\u949F/\u6BCF\u5C0F\u65F6\u8BF7\u6C42\u6570\u3001token \u6570\u6216\u8D39\u7528\u9650\u5236", actions: b2`<a class="ui-btn" href="/admin/models">返回模型</a>` })}
${this.error ? b2`<div class="error-banner">${this.error}</div>` : ""}${this.success ? b2`<div class="success-banner">${this.success}</div>` : ""}
${panel("\u9650\u5236\u89C4\u5219", "", b2`<div class="limits-card"><h2 class="limits-title">限制规则管理</h2>${this.data.length ? b2`<table class="limits-table"><thead><tr><th>类型</th><th>周期</th><th>周期值</th><th>上限</th><th>用户组</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table>` : empty("\u6682\u65E0\u9650\u5236\u89C4\u5219")}
<h3 class="section-title">新增规则</h3><form method="POST" action=${`/api/admin/models/${encodeURIComponent(m2)}/limits/add`}><input type="hidden" name="model" value=${m2}><div class="form-grid">
  <div class="form-group"><label class="form-label" for="type">类型</label><select class="form-select" id="type" name="type" @change=${() => this.handleTypeChange()}><option value="rpm">请求数/分钟</option><option value="tpm">Token/分钟</option><option value="cost">费用</option></select></div>
  <div class="form-group"><label class="form-label" for="period">周期</label><select class="form-select" id="period" name="period"><option value="minute">分钟</option><option value="hour">小时</option><option value="day">天</option></select></div>
  <div class="form-group"><label class="form-label" for="periodValue">周期值</label><input class="form-input" id="periodValue" name="periodValue" type="number" value="1"></div>
  <div class="form-group" id="maxField" style=${this.isCost ? "display:none" : ""}><label class="form-label" for="max">上限</label><input class="form-input" id="max" name="max" type="number"></div>
  <div class="form-group" id="costMaxField" style=${this.isCost ? "" : "display:none"}><label class="form-label" for="costMax">费用上限</label><input class="form-input" id="costMax" name="costMax" type="number" step="0.01"></div>
  <div class="form-group"><label class="form-label" for="groupName">用户组</label><input class="form-input" id="groupName" name="groupName" value="default"></div>
  <div class="form-group"><label><input type="checkbox" id="enabled" name="enabled" value="true" checked> 启用</label></div>
</div><div class="form-actions"><button class="btn btn-primary" type="submit">添加规则</button></div></form>
<h3 class="section-title">修改规则</h3><form id="editForm" method="POST" action=""><div class="form-grid">
  <div class="form-group"><label class="form-label">索引</label><input class="form-input" id="editIndex" name="index" type="number" readonly></div>
  <div class="form-group"><label class="form-label">类型</label><select class="form-select" id="editType" name="type"><option value="rpm">rpm</option><option value="tpm">tpm</option><option value="cost">cost</option></select></div>
  <div class="form-group"><label class="form-label">周期</label><select class="form-select" id="editPeriod" name="period"><option value="minute">minute</option><option value="hour">hour</option><option value="day">day</option></select></div>
  <div class="form-group"><label class="form-label">周期值</label><input class="form-input" id="editPeriodValue" name="periodValue" type="number"></div>
  <div class="form-group"><label class="form-label">上限</label><input class="form-input" id="editMax" name="max" type="number"></div>
  <div class="form-group"><label class="form-label">费用上限</label><input class="form-input" id="editCostMax" name="costMax" type="number" step="0.01"></div>
  <div class="form-group"><label class="form-label">用户组</label><input class="form-input" id="editGroupName" name="groupName"></div>
</div><div class="form-actions"><button class="btn btn-primary" type="submit">保存修改</button></div></form></div>`)}
`;
    }
  };
  GwModelLimitsPage.styles = [uiCSS];
  GwModelLimitsPage.properties = { data: { state: true }, error: { state: true }, success: { state: true }, model: { state: true } };
  if (!customElements.get("gw-model-limits-page")) customElements.define("gw-model-limits-page", GwModelLimitsPage);

  // web/src/format.ts
  function formatNumber(n4) {
    return Number(n4 || 0).toLocaleString("en-US");
  }
  function formatDuration(ms) {
    const v2 = Number(ms || 0);
    if (v2 < 1e3) return `${v2}ms`;
    if (v2 < 6e4) return `${(v2 / 1e3).toFixed(1)}s`;
    return `${Math.floor(v2 / 6e4)}m ${Math.floor(v2 % 6e4 / 1e3)}s`;
  }

  // web/src/components/pages/gw-stats-page.ts
  var colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  var GwStatsPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = {};
      this.error = "";
      this.tipText = "";
      this.tipX = 0;
      this.tipY = 0;
      this.tipVisible = false;
    }
    setDays(days) {
      const sr = this.shadowRoot;
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getTime() - days * 864e5);
      sr.querySelector("#start").value = start.toISOString().slice(0, 10);
      sr.querySelector("#end").value = end.toISOString().slice(0, 10);
      sr.querySelector("#stats-filter-form").submit();
    }
    showTip(e4, text) {
      this.tipText = text;
      this.tipVisible = true;
      const me = e4;
      this.tipX = me.clientX;
      this.tipY = me.clientY;
      this.requestUpdate();
    }
    hideTip() {
      this.tipVisible = false;
      this.requestUpdate();
    }
    render() {
      const s4 = this.data;
      const pct = s4.totalRequests ? s4.successfulRequests / s4.totalRequests * 100 : 0;
      const cards = [
        ["\u603B\u8BF7\u6C42", formatNumber(s4.totalRequests), s4.dateRange || ""],
        ["\u6210\u529F\u8BF7\u6C42", formatNumber(s4.successfulRequests), `${pct.toFixed(1)}% \u6210\u529F\u7387`],
        ["\u5931\u8D25\u8BF7\u6C42", formatNumber(s4.failedRequests), `${(100 - pct).toFixed(1)}% \u5931\u8D25\u7387`],
        ["\u5E73\u5747\u5EF6\u8FDF", formatDuration(s4.avgDuration), "\u6240\u6709\u8BF7\u6C42"]
      ];
      const tokens = [["\u8F93\u5165", s4.totalInputTokens], ["\u7F13\u5B58\u8F93\u5165", s4.totalCachedTokens], ["\u8F93\u51FA", s4.totalOutputTokens], ["\u603B\u8BA1", s4.totalTokens]];
      const days = Array.isArray(s4.dailyHeatmap) ? s4.dailyHeatmap : [];
      const maxTokens = Math.max(1, ...days.map((d3) => d3.totalTokens || 0));
      const levelOf = (t3) => t3 <= 0 ? 0 : t3 < maxTokens * 0.25 ? 1 : t3 < maxTokens * 0.5 ? 2 : t3 < maxTokens * 0.75 ? 3 : 4;
      const start = /* @__PURE__ */ new Date(`${days[0]?.date || s4.heatmapStart || s4.startDate}T00:00:00`);
      const leadBlanks = Number.isFinite(start.getTime()) ? start.getDay() : 0;
      const cells = [];
      for (let i5 = 0; i5 < leadBlanks; i5++) cells.push({ key: `blank-${i5}` });
      days.forEach((d3) => cells.push({ key: d3.date, date: d3.date, requests: d3.requests, totalTokens: d3.totalTokens }));
      const weeks = [];
      for (let i5 = 0; i5 < cells.length; i5 += 7) weeks.push(cells.slice(i5, i5 + 7));
      const monthLabels = [];
      let lastMonth = "";
      weeks.forEach((week, col) => {
        const first = week.find((c4) => c4.date);
        if (!first?.date) return;
        const m2 = first.date.slice(0, 7);
        if (m2 !== lastMonth) {
          lastMonth = m2;
          monthLabels.push({ col, label: `${Number(first.date.slice(5, 7))}\u6708` });
        }
      });
      const totalHeatTokens = days.reduce((sum, d3) => sum + (d3.totalTokens || 0), 0);
      const rangeText = s4.heatmapStart && s4.heatmapEnd ? ` \xB7 ${s4.heatmapStart} ~ ${s4.heatmapEnd}` : "";
      const models = Object.entries(s4.byModel || {}).map(([m2, v2]) => b2`<div class="ui-row" style="padding:8px 0;border-bottom:1px solid var(--ui-line)"><strong>${m2}</strong><span class="ui-spacer"></span><span class="ui-mono">${formatNumber(v2.requests)} 请求</span><span class="ui-field-hint">${formatNumber(v2.totalTokens)} tokens</span></div>`);
      const detailRows = (s4.details || []).filter((r4) => r4 && r4.timestamp).map((r4) => b2`<tr><td>${new Date(r4.timestamp).toLocaleString()}</td><td>${r4.userName || "-"}</td><td>${r4.customModel}</td><td>${r4.modelGroup || "\u2014"}</td><td>${r4.statusCode}</td><td>${formatDuration(r4.durationMs)}</td><td>${r4.ttftMs != null ? formatDuration(r4.ttftMs) : "\u2014"}</td><td>${r4.tps != null ? r4.tps.toFixed(1) : "\u2014"}</td><td>${formatNumber(r4.completionTokens)}</td></tr>`);
      return b2`
${pageHeader({ eyebrow: "Analytics", title: "\u7EDF\u8BA1 Dashboard", subtitle: `${s4.dateRange || ""} \xB7 \u5E73\u5747\u5EF6\u8FDF ${formatDuration(s4.avgDuration)}` })}
<form method="get" action="/admin/stats" class="ui-row" id="stats-filter-form"><input class="ui-input" style="width:auto" type="date" id="start" name="startDate" value=${s4.startDate}><input class="ui-input" style="width:auto" type="date" id="end" name="endDate" value=${s4.endDate}><input class="ui-input" style="width:150px" name="userName" placeholder="用户" value=${s4.userName || ""}><input class="ui-input" style="width:180px" name="model" placeholder="模型" value=${s4.model || ""}><button class="ui-btn ui-btn-primary">查询</button><button type="button" class="ui-btn" data-days="1" @click=${() => this.setDays(1)}>今天</button><button type="button" class="ui-btn" data-days="7" @click=${() => this.setDays(7)}>7天</button><button type="button" class="ui-btn" data-days="30" @click=${() => this.setDays(30)}>30天</button></form>
<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards.map(([label, value, sub]) => b2`<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${label}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${value}</div><div class="ui-field-hint">${sub}</div></div>`)}</div><div style="height:16px"></div>
${panel("Token \u7528\u91CF", "", b2`<div class="ui-grid ui-grid-auto">${tokens.map(([k2, v2]) => b2`<div><div class="ui-field-hint">${k2}</div><div class="ui-mono" style="font-size:18px;font-weight:700">${formatNumber(v2 || 0)}</div></div>`)}</div>`)}
${days.length ? b2`<div class="stats-section-card"><h2 class="stats-section-title">🗓️ 每日 Token 消耗</h2><div style="font-size:12px;color:var(--ui-muted);margin-bottom:10px">过去 ${days.length} 天 · 共 ${formatNumber(totalHeatTokens)} tokens${rangeText}</div><div class="heatmap-scroll"><div class="heatmap-months">${weeks.map((_2, col) => {
        const lbl = monthLabels.find((l3) => l3.col === col);
        return b2`<span>${lbl ? lbl.label : ""}</span>`;
      })}</div><div class="heatmap-grid" data-heatmap-grid>${weeks.map((week) => b2`<div class="heatmap-col">${week.map((c4) => c4.date ? b2`<span class="heatmap-cell" data-tip=${`${c4.date} \xB7 ${c4.requests || 0} \u6B21\u8BF7\u6C42 \xB7 ${formatNumber(c4.totalTokens || 0)} tokens`} style=${`background:${colors[levelOf(c4.totalTokens || 0)]}`} @mouseenter=${(e4) => this.showTip(e4, `${c4.date} \xB7 ${c4.requests || 0} \u6B21\u8BF7\u6C42 \xB7 ${formatNumber(c4.totalTokens || 0)} tokens`)} @mousemove=${(e4) => this.showTip(e4, `${c4.date} \xB7 ${c4.requests || 0} \u6B21\u8BF7\u6C42 \xB7 ${formatNumber(c4.totalTokens || 0)} tokens`)} @mouseleave=${() => this.hideTip()}></span>` : b2`<span class="heatmap-cell" style="visibility:hidden"></span>`)}</div>`)}</div><div class="heatmap-legend"><span>Less</span>${colors.map((c4) => b2`<span class="heatmap-cell" style=${`background:${c4}`}></span>`)}<span>More</span><span style="margin-left:8px">深浅按当日 token 量相对最大值划分</span></div></div></div>` : ""}
${panel("\u6309\u6A21\u578B\u7EDF\u8BA1", "", models.length ? models : "\u6682\u65E0\u6570\u636E")}
${(s4.details || []).length ? b2`<div class="pagination">${panel("\u6700\u8FD1\u8BF7\u6C42", `${s4.details.length} \u6761`, table(["\u65F6\u95F4", "\u7528\u6237", "\u6A21\u578B", "\u5206\u7EC4", "\u72B6\u6001", "\u8017\u65F6", "TTFT", "TPS", "\u8F93\u51FA"], detailRows))}</div>` : ""}
<div class="heatmap-tip" style=${`display:${this.tipVisible ? "block" : "none"};left:${this.tipX + 12}px;top:${this.tipY + 12}px`}>${this.tipText}</div>
`;
    }
  };
  GwStatsPage.styles = [uiCSS, i`.heatmap-tip{position:fixed;z-index:9999;pointer-events:none;background:#101828;color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;display:none;box-shadow:0 6px 18px rgba(16,24,40,.22)}`];
  GwStatsPage.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-stats-page")) customElements.define("gw-stats-page", GwStatsPage);

  // web/src/components/pages/gw-user-home-page.ts
  var GwUserHomePage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = { models: [], modelGroups: [] };
      this.error = "";
      this.copiedId = "";
    }
    async copy(e4, id) {
      const el = this.shadowRoot.querySelector("#" + id);
      if (el && navigator.clipboard) await navigator.clipboard.writeText(el.textContent || "");
      const btn = e4.currentTarget;
      this.copiedId = id;
      this.requestUpdate();
      setTimeout(() => {
        this.copiedId = "";
        this.requestUpdate();
      }, 1500);
    }
    render() {
      const p3 = this.data || { models: [], modelGroups: [] };
      const models = p3.models || [];
      const groups = p3.modelGroups || [];
      const cfg = JSON.stringify({ openai: { baseURL: location.origin + "/v1", apiKey: "sk-your-api-key" } }, null, 2);
      const items = groups.length ? groups : models;
      const copy = (id) => b2`<button class="ui-btn ui-btn-sm copy-btn" data-copy=${id} @click=${(e4) => this.copy(e4, id)}>${this.copiedId === id ? "\u5DF2\u590D\u5236" : "\u590D\u5236"}</button>`;
      return b2`
<div class="ui-page-head"><div><div class="ui-eyebrow">Getting started</div><h1 class="ui-title">🚀 LLM Gateway</h1><p class="ui-subtitle">统一的大模型 API 网关，兼容 OpenAI / Anthropic / Responses 格式</p></div>${p3.userName ? b2`<div class="ui-row">欢迎，${p3.userName}</div>` : ""}</div>
${p3.announcement ? b2`<div class="ui-notice ui-notice-info">${p3.announcement}</div>` : ""}
<div class="ui-grid ui-grid-2">
  ${panel("JSON \u914D\u7F6E", "\u590D\u5236\u5230\u4F60\u7684 OpenAI \u517C\u5BB9\u5BA2\u6237\u7AEF", b2`<pre class="ui-input ui-mono" id="json-config" style="white-space:pre-wrap;min-height:160px">${cfg}</pre><div style="height:10px"></div>${copy("json-config")}`)}
  ${panel("Base URL", "\u7F51\u5173\u5730\u5740", b2`<div class="ui-mono" id="base-url">${location.origin}/v1</div><div style="height:10px"></div>${copy("base-url")}`)}
</div>
${panel("\u53EF\u7528\u6A21\u578B", `${models.length} \u4E2A\u6A21\u578B / ${groups.length} \u4E2A\u6A21\u578B\u7EC4`, b2`<div class="ui-mono" id="model-value">${items[0] || ""}</div><div style="height:10px"></div>${copy("model-value")}<div class="ui-row" style="margin-top:14px">${items.map((m2) => b2`<span class="ui-badge">${m2}</span>`)}</div>`)}
`;
    }
  };
  GwUserHomePage.styles = [uiCSS];
  GwUserHomePage.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-user-home-page")) customElements.define("gw-user-home-page", GwUserHomePage);

  // web/src/components/pages/gw-user-stats-page.ts
  var GwUserStatsPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = {};
      this.error = "";
    }
    render() {
      const s4 = this.data;
      const pct = s4.totalRequests ? s4.successfulRequests / s4.totalRequests * 100 : 0;
      const filter = b2`<form method="get" action="/user/stats" class="ui-row"><input class="ui-input" style="width:auto" type="date" name="startDate" value=${s4.start}><input class="ui-input" style="width:auto" type="date" name="endDate" value=${s4.end}><button class="ui-btn ui-btn-primary">查询</button></form>`;
      if (!s4.totalRequests) {
        return b2`
${pageHeader({ eyebrow: "Analytics", title: `\u4F7F\u7528\u7EDF\u8BA1 \u2014 ${s4.userName || ""}`, subtitle: "\u67E5\u770B API \u4F7F\u7528\u60C5\u51B5\u4E0E\u7EDF\u8BA1\u6570\u636E" })}
${filter}<div style="height:16px"></div>
${panel("\u7EDF\u8BA1\u7ED3\u679C", "", empty("\u6682\u65E0\u7EDF\u8BA1\u6570\u636E", "\u53D1\u8D77\u4E00\u6B21\u8BF7\u6C42\u540E\u5373\u53EF\u770B\u5230\u7528\u91CF\u3002"))}
`;
      }
      const cards = [["\u603B\u8BF7\u6C42", formatNumber(s4.totalRequests)], ["\u6210\u529F\u7387", `${pct.toFixed(1)}%`], ["\u603B Token", formatNumber(s4.totalTokens)], ["\u5E73\u5747\u5EF6\u8FDF", formatDuration(s4.avgDuration)]];
      const rows = Object.entries(s4.byModel || {}).map(([m2, v2]) => b2`<tr><td>${m2}</td><td>${v2.requests}</td><td>${formatNumber(v2.totalTokens)}</td></tr>`);
      return b2`
${pageHeader({ eyebrow: "Analytics", title: `\u4F7F\u7528\u7EDF\u8BA1 \u2014 ${s4.userName || ""}`, subtitle: `${s4.start} \u81F3 ${s4.end}` })}
${filter}<div style="height:14px"></div><div class="ui-grid ui-grid-auto">${cards.map(([k2, v2]) => b2`<div class="ui-panel" style="margin:0;padding:16px 18px"><div class="ui-field-hint">${k2}</div><div class="ui-mono" style="font-size:22px;font-weight:800;margin-top:4px">${v2}</div></div>`)}</div><div style="height:16px"></div>
${panel("Token \u7528\u91CF\u660E\u7EC6", "", table(["\u6A21\u578B", "\u8BF7\u6C42\u6570", "Token"], rows))}
`;
    }
  };
  GwUserStatsPage.styles = [uiCSS];
  GwUserStatsPage.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-user-stats-page")) customElements.define("gw-user-stats-page", GwUserStatsPage);

  // web/src/components/pages/gw-login-page.ts
  var GwLoginPage = class extends i4 {
    constructor() {
      super(...arguments);
      this.mode = "admin-login";
      this.error = "";
    }
    render() {
      const setup = this.mode === "admin-setup";
      const isAdmin = this.mode !== "user-login";
      const heading = setup ? "\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : isAdmin ? "\u7BA1\u7406\u5458\u767B\u5F55" : "\u7528\u6237\u767B\u5F55";
      const sub = setup ? "\u9996\u6B21\u4F7F\u7528\u8BF7\u8BBE\u7F6E\u7BA1\u7406\u5458\u5BC6\u7801" : isAdmin ? "\u767B\u5F55\u540E\u7BA1\u7406\u6A21\u578B\u3001\u5BC6\u94A5\u4E0E\u7EDF\u8BA1\u4FE1\u606F\u3002" : "\u4F7F\u7528\u7528\u6237 API Key \u67E5\u770B\u53EF\u7528\u6A21\u578B\u4E0E\u7528\u91CF\u3002";
      const action = isAdmin ? "/api/admin/login" : "/api/user/login";
      const label = isAdmin ? "\u5BC6\u7801" : "API Key";
      const name = isAdmin ? "password" : "apikey";
      const btn = setup ? "\u8BBE\u7F6E\u5BC6\u7801" : "\u767B\u5F55";
      return b2`<div class="ui-login-wrap"><div class="ui-login-card"><div class="ui-login-mark">L</div><h1 class="ui-login-title">${heading}</h1>
<p class="ui-login-sub">${sub}</p>
${this.error ? b2`<div class="ui-notice ui-notice-error">${this.error}</div>` : ""}
<form method="POST" action=${action}><label class="ui-field"><span class="ui-field-label">${label}</span><input class="ui-input" type="password" name=${name} placeholder=${isAdmin ? "\u8BF7\u8F93\u5165\u5BC6\u7801" : "\u8BF7\u8F93\u5165 API Key"} required></label><button class="ui-btn ui-btn-primary" style="width:100%">${btn}</button></form>
</div></div>`;
    }
  };
  GwLoginPage.styles = [uiCSS, i`
  :host{display:block}
  .ui-login-wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
  .ui-login-card{width:min(100%,420px);background:#fff;border:1px solid var(--ui-line);border-radius:16px;box-shadow:0 24px 60px rgba(16,24,40,.10);padding:28px}
  .ui-login-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--ui-accent);color:#fff;font-weight:800;margin-bottom:16px}
  .ui-login-title{font-size:22px;margin:0 0 6px}.ui-login-sub{margin:0 0 22px;color:var(--ui-muted);font-size:13px}
  `];
  GwLoginPage.properties = { error: { state: true }, mode: { state: true } };
  if (!customElements.get("gw-login-page")) customElements.define("gw-login-page", GwLoginPage);

  // web/src/components/gw-app.ts
  function routeForPath(pathname) {
    if (pathname === "/") return "gw-models-page";
    if (/^\/admin\/models\/edit\//.test(pathname)) return "gw-model-form-page";
    if (/^\/admin\/models\/[^/]+\/limits$/.test(pathname)) return "gw-model-limits-page";
    if (pathname === "/admin/models/new") return "gw-model-form-page";
    if (pathname === "/admin/model-groups/new" || /^\/admin\/model-groups\/edit\//.test(pathname)) return "gw-group-form-page";
    if (pathname === "/admin/users/new" || /^\/admin\/users\/edit\//.test(pathname)) return "gw-user-form-page";
    if (/^\/admin\/api-keys\/edit\//.test(pathname)) return "gw-api-keys-page";
    const map = {
      "/admin/models": "gw-models-page",
      "/admin/model-groups": "gw-groups-page",
      "/admin/users": "gw-users-page",
      "/admin/api-keys": "gw-api-keys-page",
      "/admin/password": "gw-password-page",
      "/admin/privacy": "gw-privacy-page",
      "/admin/announcement": "gw-announcement-page",
      "/admin/stats": "gw-stats-page",
      "/admin/login": "gw-login-page",
      "/user/login": "gw-login-page",
      "/user/main": "gw-user-home-page",
      "/user/stats": "gw-user-stats-page"
    };
    return map[pathname] || "gw-models-page";
  }
  var q = (name) => new URLSearchParams(location.search).get(name) || "";
  var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  async function loadPageData(pathname) {
    if (pathname === "/") return [];
    if (pathname === "/admin/models") return (await api("/api/admin/models")).data || [];
    if (pathname === "/admin/model-groups") return (await api("/api/admin/model-groups")).data || [];
    if (pathname === "/admin/users") return (await api("/api/admin/users")).data || [];
    if (pathname === "/admin/api-keys") return (await api("/api/admin/api-keys")).data || [];
    if (pathname === "/admin/privacy") return (await api("/api/admin/privacy")).data?.settings || { enabled: false, stripUserField: false, sanitizeFilePaths: false, whitelistFilter: false, pathPlaceholder: "USER" };
    if (pathname === "/admin/announcement") return (await api("/api/admin/announcement")).data?.content || "";
    if (pathname === "/admin/models/new") return (await api("/api/admin/api-keys")).data || [];
    if (pathname === "/admin/model-groups/new") return (await api("/api/admin/models")).data || [];
    if (pathname === "/admin/users/new") return (await api("/api/admin/models")).data || [];
    if (pathname === "/admin/stats") {
      const search = location.search;
      const d3 = (await api("/api/admin/stats" + search)).data || {};
      return {
        startDate: q("startDate") || today(),
        endDate: q("endDate") || q("startDate") || today(),
        dateRange: d3.dateRange || "",
        userName: q("userName"),
        model: q("model"),
        totalRequests: d3.totalRequests || 0,
        successfulRequests: d3.successfulRequests || 0,
        failedRequests: d3.failedRequests || 0,
        totalInputTokens: d3.totalInputTokens || 0,
        totalOutputTokens: d3.totalOutputTokens || 0,
        totalTokens: d3.totalTokens || 0,
        totalCachedTokens: d3.totalCachedTokens || 0,
        avgDuration: d3.avgDuration || 0,
        byModel: d3.byModel || {},
        byDate: d3.byDate || {},
        byHour: d3.byHour || {},
        dailyHeatmap: d3.dailyHeatmap || [],
        heatmapStart: d3.heatmapStart || "",
        heatmapEnd: d3.heatmapEnd || "",
        page: d3.page,
        totalPages: d3.totalPages,
        details: d3.details || []
      };
    }
    if (pathname === "/admin/login") return !(await api("/api/admin/auth-status")).data?.passwordConfigured;
    if (pathname === "/user/main") {
      const d3 = (await api("/api/user/config")).data || {};
      return { models: (d3.models || []).map((m3) => m3.customModel), modelGroups: (d3.modelGroups || []).map((g2) => g2.name), announcement: d3.announcement, userName: q("userName") };
    }
    if (pathname === "/user/stats") {
      const d3 = (await api("/api/user/stats" + location.search)).data || {};
      return { userName: q("userName") || "User", start: q("startDate") || today(), end: q("endDate") || today(), totalRequests: d3.total || 0, successfulRequests: d3.successful || 0, totalTokens: d3.totalTokens || 0, avgDuration: d3.avgDuration || 0, byModel: d3.byModel || {}, byDate: d3.byDate || {} };
    }
    if (pathname === "/user/login" || pathname === "/admin/password") return void 0;
    let m2;
    if (m2 = pathname.match(/^\/admin\/models\/edit\/(.+)$/)) {
      const models = (await api("/api/admin/models")).data || [];
      const model = models.find((x2) => x2.customModel === decodeURIComponent(m2[1]));
      const keys = (await api("/api/admin/api-keys")).data || [];
      const ref = model?.apiKey?.startsWith("$$") && model.apiKey.endsWith("$$") ? model.apiKey.slice(2, -2) : "";
      return { model, keys, version: "1.15.0", ref };
    }
    if (m2 = pathname.match(/^\/admin\/models\/([^/]+)\/limits$/)) return (await api(`/api/admin/models/${m2[1]}/limits`)).data || [];
    if (m2 = pathname.match(/^\/admin\/model-groups\/edit\/(.+)$/)) {
      const groups = (await api("/api/admin/model-groups")).data || [];
      const g2 = groups.find((x2) => x2.name === decodeURIComponent(m2[1]));
      return { group: g2, models: (await api("/api/admin/models")).data || [] };
    }
    if (m2 = pathname.match(/^\/admin\/users\/edit\/(.+)$/)) {
      const users = (await api("/api/admin/users")).data || [];
      const u3 = users.find((x2) => x2.name === decodeURIComponent(m2[1]));
      return { user: u3, models: ((await api("/api/admin/models")).data || []).map((x2) => x2.customModel) };
    }
    if (m2 = pathname.match(/^\/admin\/api-keys\/edit\/(.+)$/)) {
      const all = (await api("/api/admin/api-keys")).data || [];
      const k2 = all.find((x2) => x2.id === decodeURIComponent(m2[1]));
      return { keys: all, error: k2 ? void 0 : "\u672A\u627E\u5230\u8BE5 API Key", edit: k2 ? { id: k2.id, name: k2.name, keyHint: k2.keyHint || "*****" } : void 0 };
    }
    return [];
  }
  var GwApp = class extends i4 {
    constructor() {
      super(...arguments);
      this.data = [];
      this.error = "";
      this.path = location.pathname;
    }
    connectedCallback() {
      super.connectedCallback();
      if (this.path === "/") {
        location.replace("/admin/models");
        return;
      }
      this.load();
    }
    async load() {
      try {
        this.data = await loadPageData(this.path);
      } catch (e4) {
        this.error = e4.message;
      }
    }
    updated() {
      const host = this.shadowRoot?.querySelector(".gw-page-host");
      if (!host) return;
      const tag = routeForPath(this.path);
      const isLogin = this.path === "/admin/login" || this.path === "/user/login";
      let shell = host.firstElementChild;
      if (!shell || shell.tagName.toLowerCase() !== (isLogin ? tag : "gw-shell")) {
        host.innerHTML = "";
        if (isLogin) {
          shell = document.createElement(tag);
        } else {
          shell = document.createElement("gw-shell");
          const page2 = document.createElement(tag);
          shell.appendChild(page2);
        }
        host.appendChild(shell);
      }
      const page = isLogin ? shell : shell.firstElementChild;
      page.data = this.data;
      if ("error" in page) page.error = this.error;
      if (!isLogin) {
        const isUser = this.path.startsWith("/user/");
        shell.title = document.title.split(" \xB7 ")[0];
        shell.path = this.path;
        shell.nav = isUser ? userNav : adminNav;
        shell.width = isUser ? 980 : 1180;
      }
      if ("hasPassword" in page && this.path === "/admin/password") page.hasPassword = !!this.data;
      if ("mode" in page) {
        page.mode = this.path === "/admin/login" ? this.data ? "admin-setup" : "admin-login" : "user-login";
      }
      if ("model" in page) {
        const m2 = this.path.match(/^\/admin\/models\/([^/]+)\/limits$/);
        if (m2) page.model = decodeURIComponent(m2[1]);
      }
    }
    render() {
      return b2`<div class="gw-page-host"></div>`;
    }
  };
  GwApp.styles = i`${globalCSS}:host{display:block}`;
  GwApp.properties = { data: { state: true }, error: { state: true } };
  if (!customElements.get("gw-app")) customElements.define("gw-app", GwApp);

  // web/src/admin.ts
  if (!customElements.get("gw-app")) customElements.define("gw-app", GwApp);
  function startWhenReady(doc, start) {
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }
  function bootstrap() {
    if (!document.querySelector("gw-app")) {
      document.body.appendChild(document.createElement("gw-app"));
    }
  }
  if (typeof document !== "undefined") startWhenReady(document, bootstrap);
})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
