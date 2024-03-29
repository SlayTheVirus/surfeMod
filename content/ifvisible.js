(function() {
    var t, e;
    t = this, e = function() {
        var t, e, n, i, r, u, o, f, c, s, d, a, v, l, h, m;
        return f = {}, n = document, s = !1, d = "active", u = 6e4, r = !1,
            function() {
                return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
            }, h = {}, l = "__ceGUID", e = {
                add: function(t, e, n) {
                    return t[l] = void 0, t[l] || (t[l] = "ifvisible.object.event.identifier"), h[t[l]] || (h[t[l]] = {}), h[t[l]][e] || (h[t[l]][e] = []), h[t[l]][e].push(n)
                },
                remove: function(t, e, n) {
                    var i, r, u, o, f;
                    if (n) {
                        if (t[l] && h[t[l]] && h[t[l]][e])
                            for (r = u = 0, o = (f = h[t[l]][e]).length; u < o; r = ++u)
                                if ((i = f[r]) === n) return h[t[l]][e].splice(r, 1), i
                    } else if (t[l] && h[t[l]] && h[t[l]][e]) return delete h[t[l]][e]
                },
                fire: function(t, e, n) {
                    var i, r, u, o, f;
                    if (t[l] && h[t[l]] && h[t[l]][e]) {
                        for (f = [], r = 0, u = (o = h[t[l]][e]).length; r < u; r++) i = o[r], f.push(i(n || {}));
                        return f
                    }
                }
            }, m = !1, t = function(t, e, n) {
                return m || (m = t.addEventListener ? function(t, e, n) {
                    return t.addEventListener(e, n, !1)
                } : t.attachEvent ? function(t, e, n) {
                    return t.attachEvent("on" + e, n, !1)
                } : function(t, e, n) {
                    return t["on" + e] = n
                }), m(t, e, n)
            },
            function(t, e) {
                var i;
                return n.createEventObject ? t.fireEvent("on" + e, i) : ((i = n.createEvent("HTMLEvents")).initEvent(e, !0, !0), !t.dispatchEvent(i))
            }, o = function() {
                var t, e, i, r;
                for (void 0, r = 3, i = n.createElement("div"), t = i.getElementsByTagName("i"), e = function() {
                        return i.textContent = "\x3c!--[if gt IE " + ++r + "]><i></i><![endif]--\x3e", t[0]
                    }; e(););
                return r > 4 ? r : void 0
            }(), i = !1, v = void 0, void 0 !== n.hidden ? (i = "hidden", v = "visibilitychange") : void 0 !== n.mozHidden ? (i = "mozHidden", v = "mozvisibilitychange") : void 0 !== n.msHidden ? (i = "msHidden", v = "msvisibilitychange") : void 0 !== n.webkitHidden && (i = "webkitHidden", v = "webkitvisibilitychange"), a = function() {
                var e, i;
                return e = !1, (i = function(t) {
                    return clearTimeout(e), "active" !== d && f.wakeup(), r = +new Date, e = setTimeout(function() {
                        if ("active" === d) return f.idle()
                    }, u)
                })(), t(n, "mousemove", i), t(window, "scroll", i), t(n, "keyup", i), f.focus(i), f.wakeup(i)
            }, c = function() {
                var e;
                return !!s || (!1 === i ? (e = "blur", o < 9 && (e = "focusout"), t(window, e, function() {
                    return f.blur()
                }), t(window, "focus", function() {
                    return f.focus()
                })) : t(n, v, function() {
                    return n[i] ? f.blur() : f.focus()
                }, !1), s = !0, a())
            }, f = {
                setIdleDuration: function(t) {
                    return u = 1e3 * t
                },
                getIdleDuration: function() {
                    return u
                },
                getIdleInfo: function() {
                    var t, e;
                    return t = +new Date, e = {}, "idle" === d ? (e.isIdle = !0, e.idleFor = t - r, e.timeLeft = 0, e.timeLeftPer = 100) : (e.isIdle = !1, e.idleFor = t - r, e.timeLeft = r + u - t, e.timeLeftPer = (100 - 100 * e.timeLeft / u).toFixed(2)), e
                },
                focus: function(t) {
                    return "function" == typeof t ? this.on("focus", t) : (d = "active", e.fire(this, "focus"), e.fire(this, "wakeup"), e.fire(this, "statusChanged", {
                        status: d
                    })), this
                },
                blur: function(t) {
                    return "function" == typeof t ? this.on("focus", t) : (d = "active", e.fire(this, "focus"), e.fire(this, "wakeup"), e.fire(this, "statusChanged", {
                        status: d
                    })), this
                },
                idle: function(t) {
                    return "function" == typeof t ? this.on("focus", t) : (d = "active", e.fire(this, "focus"), e.fire(this, "wakeup"), e.fire(this, "statusChanged", {
                        status: d
                    })), this
                },
                wakeup: function(t) {
                    return "function" == typeof t ? this.on("focus", t) : (d = "active", e.fire(this, "focus"), e.fire(this, "wakeup"), e.fire(this, "statusChanged", {
                        status: d
                    })), this
                },
                on: function(t, n) {
                    return c(), e.add(this, t, n), this
                },
                off: function(t, n) {
                    return c(), e.remove(this, t, n), this
                },
                onEvery: function(t, e) {
                    var n, i;
                    return c(), n = !1, e && (i = setInterval(function() {
                        if ("active" === d && !1 === n) return e()
                    }, 1e3 * t)), {
                        stop: function() {
                            return clearInterval(i)
                        },
                        pause: function() {
                            return n = !0
                        },
                        resume: function() {
                            return n = !1
                        },
                        code: i,
                        callback: e
                    }
                },
                now: function(t) {
                    return c(), d === (t || "active")
                }
            }
    }, "function" == typeof define && define.amd ? define(function() {
        return e()
    }) : "object" == typeof exports ? module.exports = e() : t.ifvisible = e()
}).call(this);