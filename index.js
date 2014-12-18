var dust = require('dust')();
var serand = require('serand');

var user;

var elems = [];

var login = function (sandbox, el, fn) {
    dust.renderSource(require('./user-logged-ui'), user, function (err, out) {
        $('.navbar-right', el).html(out);
        $('.navigation-user-ui', el).on('click', '.logout', function () {
            serand.emit('user', 'logout', user);
        });
        if (!fn) {
            return;
        }
        fn(false, function () {
            $('.navigation', sandbox).remove();
        });
    });
};

var anon = function (sandbox, el, fn) {
    dust.renderSource(require('./user-anon-ui'), {}, function (err, out) {
        $('.navbar-right', el).html(out);
        if (!fn) {
            return;
        }
        fn(false, function () {
            $('.navigation', sandbox).remove();
        })
    });
};

dust.loadSource(dust.compile(require('./template'), 'navigation-ui'));

module.exports = function (sandbox, fn, options) {
    dust.render('navigation-ui', options, function (err, out) {
        if (err) {
            fn(err);
            return;
        }
        var el = $(out).appendTo(sandbox.empty());
        elems.push({
            sandbox: sandbox,
            el: el
        });
        user ? login(sandbox, el, fn) : anon(sandbox, el, fn);
        /*fn(false, function () {
         sandbox.remove('.navigation');
         });*/
    });
};

serand.on('boot', 'page', function (ctx) {
    elems = [];
});

serand.on('user', 'logged in', function (data) {
    user = data;
    elems.forEach(function (o) {
        login(o.sandbox, o.el);
    });
});

serand.on('user', 'logged out', function (data) {
    user = null;
    elems.forEach(function (o) {
        anon(o.sandbox, o.el);
    });
});