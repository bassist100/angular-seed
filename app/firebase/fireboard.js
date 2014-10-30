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

    function clone(article) {
        var article2 = new Object(article);
        for (var key in article2) {
            if (key.match(/^\$/)) {
                delete article2[key];
            }
        }
        return article2;
    }

    board.factory('FireBoardFactory', [
        '$window', '$firebase',
        
        function($window, $firebase) {
            //var ref = new $window.Firebase('https://dailyjs.firebaseio.com/');

            var factory = function(projectName) {
                
                var allSync;
                if (projectName !== 'all') {
                    allSync = new factory("all");
                }
                
                var ref = this.ref = new $window.Firebase('https://dailyjs.firebaseio.com/' + projectName);
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

                    // save
                    var result = sync.$asArray().$add(article);

                    // save to all
                    if (allSync) { 
                        result.then(function(ref) {
                            var $id = ref.name();
                            article.__id      = $id;
                            article.__project = projectName;
                            //allSync.ref.save(article); 
                            allSync.ref.child($id).set(article);
                        });
                    }

                    return result;
                };
                
                this.save = function(article) {
                    if (!article.content) {
                        throw new Error("article requires `content`");
                    }
                    article.last_modified_at = article.last_modified_at || new Date();

                    var result = sync.$asArray().$save(article);

                    if (allSync) {
                        //allSync.save(article); 
                        allSync.ref.child(article.$id).set(clone(article));
                    }

                    return result;
                };

                this.remove = function(article) {
                    if (allSync) { 
                        //allSync.remove(article); 
                        allSync.ref.child(article.$id).remove();
                    }
                    return sync.$asArray().$remove(article);                    
                };

                // 
                // event watch:
                //      see https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-firebasearray-watch-cb-context
                //
                this.watch = function(callback, context) {
                    return sync.$asArray().$watch(function(event, key, prevChild) {
                        console.log('event:', event, key, prevChild);
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
