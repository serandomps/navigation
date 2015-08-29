var dust = require('dust')();
var serand = require('serand');

var user;

var context;

var sanbox;

var login = function (fn) {
    var el = $('.navigation', sanbox);
    dust.renderSource(require('./user-logged-ui'), user, function (err, out) {
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
    dust.renderSource(require('./user-anon-ui'), {}, function (err, out) {
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

dust.loadSource(dust.compile(require('./template'), 'navigation-ui'));

module.exports = function (sandbox, fn, options) {
    var destroy = function () {
        $('.navigation', sandbox).remove();
    };
    context = {
        sandbox: sandbox,
        options: options,
        destroy: destroy
    };
    fn(false, destroy);
};

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

serand.on('navigation', 'render', function(links) {
    links.user = user;
    dust.render('navigation-ui', links, function (err, out) {
        if (err) {
            return;
        }
        context.destroy();
        $(out).appendTo(context.sandbox);
    });
});
