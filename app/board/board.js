'use strict';

angular.module('myApp.board', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/board', {
        templateUrl: 'board/board.html',
        controller: 'BoardController'
    });
}])

.controller('BoardController', ['$scope', function($scope) {
    $scope.articles = [];

    $scope.save = function(article) {
        article.no = $scope.articles.length +1;
        if (angular.isUndefined(article.tags)) {
          article.tags = [];
        } else {
          article.tags = article.tags.split(",");
        }
        $scope.articles.push(article);
        $scope.article = {};
    };

    $scope.reset = function() {
        $scope.article = {};
    };

    $scope.delete = function(index) {
        $scope.articles.splice(index,1);
    };

    $scope.reset();
}]);
