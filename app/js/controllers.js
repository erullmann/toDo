'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  
  controller('ListCtrl', ['$scope', 'articleService', function($scope, articleService) {

    $scope.articleList = [];

    articleService.getArticleBlurbs().then(function(data) {
      $scope.articleList = data;
    });

    $scope.removeArticle = function(id) {
      articleService.removeArticle(id);
    }
  }]).
  
  controller('DetailCtrl', ['$scope', 'articleService', '$routeParams', function($scope, articleService, $routeParams){
    $scope.article = {};

    articleService.getArticleByID($routeParams.articleID).then(function(data){
      $scope.article = data;
    });
  }]).
  
  controller('MenuCtrl', ['$scope', '$location', 'articleService', function($scope, $location, articleService){
    $scope.createArticle = function(){
      articleService.createArticle().then(function(data){
        $location.path('/edit/'+data._id);
      });
    }
  }]).

  controller('EditCtrl', ['$scope', 'articleService', '$routeParams', function($scope, articleService, $routeParams){
    $scope.article = {}; 
    $scope.saveStatus = "Not Saved";

    $scope.saveArticle = function(){
      articleService.saveArticle($scope.article.title, $scope.article.body, $routeParams.articleID).then(function(data){
        $scope.saveStatus = data;
      });
    }

    //add listener for changes made to check save status

    articleService.getArticleByID($routeParams.articleID).then(function(data){
      $scope.article = data;
    });

  }]);