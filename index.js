var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var watcher = require('watcher');

var user;

var context;

var loader = null;

var login = function (context) {
    var el = $('.navigation', context.container.sandbox);
    dust.renderSource(require('./user-logged-ui'), context.ctx.token.user, function (err, out) {
        $('.navbar-right', el).html(out);
    });
};

var anon = function (context) {
    var el = $('.navigation', context.container.sandbox);
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
    if (sera.is('admin') && utils.subdomain().indexOf('admin.') === -1) {
        links.local.unshift({
            url: 'admin://',
            title: 'Admin'
        });
    }
    if (links.signin) {
        links.signin.url = utils.query(links.signin.url, {
            redirect_uri: ctx.path
        });
    }
    utils.cdn('statics', '/logo/master/logo.png', function (err, url) {
        if (err) {
            return done(err);
        }
        dust.render('navigation-ui', serand.pack({
            logo: url,
            user: ctx.token && ctx.token.user,
            menu: links
        }, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var el = container.sandbox;
            el.append(out);
            $('.logout', el).on('click', function (e) {
                watcher.emit('user', 'logout', ctx.token.user);
                return false
            });
            done();
        });
    });
};

dust.loadSource(dust.compile(require('./template'), 'navigation-ui'));

module.exports = function (ctx, container, options, done) {
    var destroy = function () {
        $('.navigation', container.sandbox).remove();
    };
    context = {
        ctx: ctx,
        container: container,
        options: options,
        destroy: destroy
    };
    render(ctx, container, options, function (err) {
        done(err, destroy);
    });
};

watcher.on('loader', 'start', function (o) {
    clearTimeout(loader);
    loader = setTimeout(function () {
        $('.navigation').find('.homer').addClass('hidden').end()
            .find('.loader').removeClass('hidden');
    }, o.delay || 0);
});

watcher.on('loader', 'end', function (o) {
    clearTimeout(loader);
    $('.navigation').find('.loader').addClass('hidden').end()
        .find('.homer').removeClass('hidden');
});

watcher.on('page', 'ready', function () {
    clearTimeout(loader);
    loader = null;
});
