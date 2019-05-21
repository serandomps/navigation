var dust = require('dust')();
var serand = require('serand');

var user;

var context;

var loaders = {};

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

var render = function (ctx, container, links, done) {
    context.destroy();
    if (!done) {
        done = function () {

        };
    }
    dust.render('navigation-ui', {
        _: {
            container: container.id,
        },
        user: ctx.user,
        menu: links
    }, function (err, out) {
        if (err) {
            return done(err);
        }
        var el = context.sandbox;
        el.append(out);
        $('.logout', el).on('click', function () {
            serand.emit('user', 'logout', ctx.user);
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
    clearTimeout(loaders[o.name]);
    loaders[o.name] = setTimeout(function () {
        $('.sandbox-' + o.name).find('.homer').addClass('hidden').end()
            .find('.loader').removeClass('hidden');
    }, o.delay || 0);
});

serand.on('loader', 'end', function (o) {
    $('.sandbox-' + o.name).find('.loader').addClass('hidden').end()
        .find('.homer').removeClass('hidden');
});

serand.on('page', 'ready', function () {
    Object.keys(loaders).forEach(function (handler) {
        clearTimeout(loaders[handler]);
    });
    loaders = {};
});
