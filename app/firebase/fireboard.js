(function() {
    var board = angular.module('fireboard', ['firebase']);

    //
    // var article = {
    //   id              : "user may save any id (optional)",
    //   title           : "article title (optional)"
    //   content         : "article content. REQUIRED",
    //
    //   created_at      : "time created. (optional) will be set automatically if not set.",
    //   last_modified_at: "time last modified. (optional) will be set automatically if not set."
    // }
    //

    board.factory('Article', [
        '$firebase', '$FirebaseArray',
        function($firebase, $FirebaseArray) {
            var _default = {
                title: "",
                content: "",
            };

            function Article(data, parent) {
                this.$parent = parent;

                angular.extend(this, _default, data);
            }
            Article.prototype = {
                save: function() {
                    throw new Error("not implemented yet.");
                },
                remove: function() {
                    throw new Error("not implemented yet.");
                }
            };

            return Article;
        }
    ]);

    board.factory('ArticleFactory', [
        '$FirebaseArray', '$firebaseUtils', 'Article',
        function($FirebaseArray, $firebaseUtils, Article) {
            return $FirebaseArray.$extendFactory({
                $$added: function(snap, prevChild) {
                    var i = this.$indexFor(snap.name());

                    if ( i !== -1 )
                        return;

                    var rec = snap.val();
                    if( !angular.isObject(rec) )
                        rec = { $value: rec };

                    rec = new Article(rec, this);
                    rec.$id = snap.name();
                    rec.$priority = snap.getPriority();

                    $firebaseUtils.applyDefaults(rec, this.$$defaults);

                    this._process('child_added', rec, prevChild);
                },
            });
        }
    ]);

    function clone(article) {
        // var article2 = new Object(article);
        var article2 = angular.copy(article);
        for (var key in article2) {
            if (key.match(/^\$/)) {
                delete article2[key];
            }
        }
        return article2;
    }

    board.factory('FireBoardFactory', [
        '$window', '$firebase', 'ArticleFactory',

        function($window, $firebase, ArticleFactory) {
            var refAll = new $window.Firebase('https://dailyjs.firebaseio.com/all');

            var factory = function(projectName) {
                var allSync;
                if (projectName !== 'all') {
                    allSync = new factory("all");
                }

                var ref = this.ref = new $window.Firebase('https://dailyjs.firebaseio.com/' + projectName);
                // var sync = $firebase(ref, {arrayFactory: ArticleFactory});
                var sync = $firebase(ref);

                this.getList = function() {
                    return sync.$asArray();
                };

                this.add = function(article) {
                    if (!article.content) {
                        throw new Error("article requires `content`");
                    }
                    article.created_at       = article.created_at || new Date();
                    article.last_modified_at = article.last_modified_at || article.created_at;

                    return sync.$asArray().$add(article)
                        .then(function(ref) {
                            var $id = ref.name();
                            var o = clone(article);
                            o.ref = {
                                id: $id,
                                project: projectName,
                            }

                            refAll.child($id).set(o);

                            return ref;
                        });
                };

                this.save = function(article) {
                    if (!article.content) {
                        throw new Error("article requires `content`");
                    }
                    article.last_modified_at = article.last_modified_at || new Date();

                    return sync.$asArray().$save(article)
                        .then(function(ref) {
                            var o = clone(article);
                            o.ref = {
                                id: article.$id,
                                project: projectName,
                            }

                            refAll.child(article.$id).set(o);

                            return ref;
                        });
                };

                this.remove = function(article) {
                    return sync.$asArray().$remove(article)
                        .then(function(ref) {
                            refAll.child(article.$id).remove();

                            return ref;
                        });
                };

                //
                // event watch:
                //      see https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-firebasearray-watch-cb-context
                //
                this.watch = function(callback, context) {
                    context = context || this;
                    return sync.$asArray().$watch(function(event, key, prevChild) {
                        callback.apply(context, [event]);
                    }, context);
                };

                this.onAdd = function(callback, context) {
                    context = context || this;
                    return sync.$asArray().$watch(function(data) {
                        if (data.event !== 'child_added') {
                            return;
                        }
                        var article     = sync.$asArray().$getRecord(data.key),
                            prevArticle = sync.$asArray().$getRecord(data.prevChild);
                        callback.apply(context, [article, prevArticle]);
                    });
                };
                this.onRemove = function(callback, context) {
                    context = context || this;
                    return sync.$asArray().$watch(function(data) {
                        if (data.event !== 'child_removed') {
                            return;
                        }
                        var article = sync.$asArray().$getRecord(data.key);
                        callback.apply(context, [article]);
                    });
                };
                this.onChange = function(callback, context) {
                    context = context || this;
                    return sync.$asArray().$watch(function(data) {
                        if (data.event !== 'child_changed') {
                            return;
                        }
                        var article = sync.$asArray().$getRecord(data.key);
                        callback.apply(context, [article]);
                    });
                };
                this.onMove = function(callback, context) {
                    context = context || this;
                    return sync.$asArray().$watch(function(data) {
                        if (data.event !== 'child_moved') {
                            return;
                        }

                        var article     = sync.$asArray().$getRecord(data.key),
                            prevArticle = sync.$asArray().$getRecord(data.prevChild);
                        callback.apply(context, [article, prevArticle]);
                    });
                };

            }

            return factory;
        }
    ]);
})();
