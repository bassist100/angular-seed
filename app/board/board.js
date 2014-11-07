'use strict';

angular.module('myApp.board', ['ngRoute', 'fireboard'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/board', {
        templateUrl: 'board/board.html',
        controller: 'BoardController'
    });
}])

.filter('nl2br', function($sce){
    return function(msg,is_xhtml) {
        var is_xhtml = is_xhtml || true;
        var breakTag = (is_xhtml) ? '<br />' : '<br>';
        var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        return $sce.trustAsHtml(msg);
    }
})

.controller('BoardController', ['$scope', 'FireBoardFactory', function($scope, FireBoard) {
    var board = new FireBoard("queue");
    $scope.articles = board.getList();

    $scope.save = function(article) {
        if (angular.isUndefined(article.created_at)) {
            article.no = $scope.articles.length + 1;
            if (angular.isUndefined(article.tags)) {
              article.tags = [];
            } else {
              article.tags = article.tags.split(",");
            }
            article.created_at = new Date().getTime();
            board.add(article);
        } else {
            board.save(article);
        }
        $scope.article = {};
    };

    $scope.reset = function() {
        $scope.article = {};
    };

    $scope.delete = function(article) {
        board.remove(article);
    };

    $scope.show = function(article) {
        $scope.article = angular.copy(article);
    }

    $scope.save_reply = function(comment) {
        if (angular.isUndefined($scope.article.comments)) {
          $scope.article.comments = [];
        }
        $scope.article.comments.push(comment);
        board.save($scope.article);
    };

    $scope.reset();
}]);
