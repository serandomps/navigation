var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');

var user;

var context;

var loader = null;

var login = function (context) {
    var el = $('.navigation', context.sandbox);
    dust.renderSource(require('./user-logged-ui'), context.ctx.token.user, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var anon = function (context) {
    var el = $('.navigation', context.sandbox);
    dust.renderSource(require('./user-anon-ui'), {}, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var render = function (ctx, container, links, done) {
    context.destroy();
    if (!done) {
        done = function () {

        };
    }
    if (sera.is('admin')) {
        links.local.unshift({
            url: 'admin://',
            title: 'Admin'
        });
    }
    dust.render('navigation-ui', {
        _: {
            container: container.id,
        },
        user: ctx.token && ctx.token.user,
        menu: links
    }, function (err, out) {
        if (err) {
            return done(err);
        }
        var el = context.sandbox;
        el.append(out);
        $('.logout', el).on('click', function () {
            serand.emit('user', 'logout', ctx.token.user);
        });
        done();
    });
};

dust.loadSource(dust.compile(require('./template'), 'navigation-ui'));

//TODO: fix navigation issue here ruchira
module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    var destroy = function () {
        $('.navigation', sandbox).remove();
    };
    context = {
        ctx: ctx,
        sandbox: sandbox,
        options: options,
        destroy: destroy
    };
    render(ctx, container, options, function (err) {
        done(err, destroy);
    });
};

serand.on('loader', 'start', function (o) {
    clearTimeout(loader);
    loader = setTimeout(function () {
        $('.navigation').find('.homer').addClass('hidden').end()
            .find('.loader').removeClass('hidden');
    }, o.delay || 0);
});

serand.on('loader', 'end', function (o) {
    $('.navigation').find('.loader').addClass('hidden').end()
        .find('.homer').removeClass('hidden');
});

serand.on('page', 'ready', function () {
    clearTimeout(loader);
    loader = null;
});
