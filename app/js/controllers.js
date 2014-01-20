'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('ListCtrl', ['$scope', 'articleService', function($scope, articleService) {
    $scope.article_list = articleService.getArticleBlurbs();
  }]).
  controller('DetailCtrl', ['$scope', 'articleService', '$routeParams', function($scope, articleService, $routeParams){
    $scope.article = articleService.getArticleByID($routeParams.articleID);
  }]).
  controller('MenuCtrl', ['$scope', 'articleService', function($scope, articleService){
    $scope.articleName = "";
    $scope.articleText = "";

    $scope.addArticle = function () {
      articleService.addArticle($scope.articleName, $scope.articleText);
    }
  }]);