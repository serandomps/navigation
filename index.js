var dust = require('dust')();
var serand = require('serand');

var user;

var context;

var login = function (context) {
    var el = $('.navigation', context.sandbox);
    dust.renderSource(require('./user-logged-ui'), context.ctx.user, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var anon = function (context) {
    var el = $('.navigation', context.sandbox);
    dust.renderSource(require('./user-anon-ui'), {}, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var render = function (ctx, links, done) {
    context.destroy();
    if (!done) {
        done = function () {

        };
    }
    dust.render('navigation-ui', {
        user: ctx.user,
        menu: links
    }, function (err, out) {
        if (err) {
            return done(err);
        }
        var el = context.sandbox;
        el.append(out);
        $('.navigation-user-ui', el).on('click', '.logout', function () {
            serand.emit('user', 'logout', ctx.user);
        });
        done();
    });
};

dust.loadSource(dust.compile(require('./template'), 'navigation-ui'));

//TODO: fix navigation issue here ruchira
module.exports = function (ctx, sandbox, options, done) {
    var destroy = function () {
        $('.navigation', sandbox).remove();
    };
    context = {
        ctx: ctx,
        sandbox: sandbox,
        options: options,
        destroy: destroy
    };
    render(ctx, options, function (err) {
        done(err, destroy);
    });
};

/*serand.on('user', 'ready', function (usr) {
    user = usr;
    if (!context) {
        return;
    }
    user ? login(context) : anon(context);
});

serand.on('user', 'logged in', function (usr) {
    user = usr;
    if (!context) {
        return;
    }
    login(context);
});

serand.on('user', 'logged out', function (usr) {
    user = null;
    if (!context) {
        return;
    }
    anon(context);
});*/

serand.on('navigation', 'render', render);
