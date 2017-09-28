var dust = require('dust')();
var serand = require('serand');

var user;

var context;

var sandbox;

var login = function () {
    var el = $('.navigation', context.sandbox);
    dust.renderSource(require('./user-logged-ui'), user, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var anon = function () {
    var el = $('.navigation', sandbox);
    dust.renderSource(require('./user-anon-ui'), {}, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var render = function (links, done) {
    context.destroy();
    if (!done) {
        done = function () {

        };
    }
    dust.render('navigation-ui', {
        user: user,
        menu: links
    }, function (err, out) {
        if (err) {
            return done(err);
        }
        var el = context.sandbox;
        el.append(out);
        $('.navigation-user-ui', el).on('click', '.logout', function () {
            serand.emit('user', 'logout', user);
        });
        done();
    });
};

dust.loadSource(dust.compile(require('./template'), 'navigation-ui'));

//TODO: fix navigation issue here ruchira
module.exports = function (sandbox, fn, options) {
    var destroy = function () {
        $('.navigation', sandbox).remove();
    };
    context = {
        sandbox: sandbox,
        options: options,
        destroy: destroy
    };
    render(options, function (err) {
        fn(err, destroy);
    });
};

serand.on('user', 'ready', function (usr) {
    user = usr;
    if (!context) {
        return;
    }
    user ? login() : anon();
});

serand.on('user', 'logged in', function (usr) {
    user = usr;
    if (!context) {
        return;
    }
    login();
});

serand.on('user', 'logged out', function (usr) {
    user = null;
    if (!context) {
        return;
    }
    anon();
});

serand.on('navigation', 'render', render);
