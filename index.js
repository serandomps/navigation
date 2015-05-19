var dust = require('dust')();
var serand = require('serand');

var user;

var sanbox;

var login = function (fn) {
    var el = $('.navigation', sanbox);
    dust.renderSource(require('./user-logged-ui.html'), user, function (err, out) {
        $('.navbar-right', el).html(out);
        $('.navigation-user-ui', el).on('click', '.logout', function () {
            serand.emit('user', 'logout', user);
        });
        if (!fn) {
            return;
        }
        fn(false, function () {
            $('.user-logged-ui', sanbox).remove();
            sanbox = null;
        });
    });
};

var anon = function (fn) {
    var el = $('.navigation', sanbox);
    dust.renderSource(require('./user-anon-ui.html'), {}, function (err, out) {
        $('.navbar-right', el).html(out);
        if (!fn) {
            return;
        }
        fn(false, function () {
            $('.user-anon-ui', sanbox).remove();
            sanbox = null;
        })
    });
};

dust.loadSource(dust.compile(require('./template.html'), 'navigation-ui'));

module.exports = function (sandbox, fn, options) {
    dust.render('navigation-ui', options, function (err, out) {
        if (err) {
            fn(err);
            return;
        }
        $(out).appendTo(sandbox.empty());
        sanbox = sandbox;
        user ? login(fn) : anon(fn);
    });
};

serand.on('boot', 'page', function (ctx) {

});

serand.on('user', 'logged in', function (data) {
    console.log('navigation user logged in');
    console.log(data);
    user = data;
    login(null);
});

serand.on('user', 'logged out', function (data) {
    user = null;
    anon(null);
});
