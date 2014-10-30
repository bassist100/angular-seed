'use strict';

angular.module('myApp.board', ['ngRoute', 'fireboard'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/board', {
        templateUrl: 'board/board.html',
        controller: 'BoardController'
    });
}])

.controller('BoardController', ['$scope', 'FireBoardFactory', function($scope, FireBoard) {
    var board = new FireBoard("queue");
    $scope.articles = board.getList();

    $scope.save = function(article) {
        article.no = $scope.articles.length + 1;
        if (angular.isUndefined(article.tags)) {
          article.tags = [];
        } else {
          article.tags = article.tags.split(",");
        }
        board.add(article);
        $scope.article = {};
    };

    $scope.reset = function() {
        $scope.article = {};
    };

    $scope.delete = function(article) {
        board.remove(article);
    };

    $scope.reset();
}]);
