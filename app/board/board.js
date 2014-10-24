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

    $scope.master = {};


    $scope.save = function(user) {
        user.no = $scope.articles.length +1;
        $scope.articles.push(user);
        $scope.user = {};
    };

    $scope.reset = function() {
        $scope.user = {};
    };

    $scope.delete = function(index) {
        $scope.articles.splice(index,1);
    };

    $scope.reset();
}]);
