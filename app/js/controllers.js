'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('ListCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {

    $scope.windowHeight = $window.innerHeight;

    angular.element($window).bind('resize', function(event){
      $scope.windowHeight = $window.innerHeight;
      $scope.$apply();
    });

    $scope.baseHieght = 30;

    //sizing functions
    $scope.numRows = function(){
      return Math.min(Math.floor($scope.windowHeight / 200), Math.floor($scope.windowHeight / Math.floor($scope.windowHeight / 4)));
    }

    $scope.width = function(){
      return 400;
    }

    $scope.height = function(){
      return $scope.windowHeight / $scope.numRows();
    }


//remove me - im for testing only
    $scope.addArticle = function () {
      var note = {
        title: "Test title",
        body : "test body",
        p    : $scope.previewList.length,
        x : function(){ //use functions to allow for recalculations
          return Math.floor(this.p / $scope.numRows()) * $scope.width();
        },
        y : function(){ 
          return (this.p % $scope.numRows()) * $scope.height() + $scope.baseHieght;
        }
      }
      $scope.previewList.push(note);
    }

    $scope.removeArticle = function () {
      $scope.previewList.pop();
    }
////end remove

    $scope.previewList = [];

    $scope.notActive = true;

    $scope.currentArticle;

    $scope.open = function(id){
      console.log(id);
      $scope.notActive = false;
      $http.get('db/?id=' + id).then(function(result){
        $scope.currentArticle = result.data;
      });
      console.log($scope.currentArticle);
    }

  	$http.get('db/?id=all').then( function (result) {
      $scope.previewList = result.data;
      
      for (var i = 0; i < $scope.previewList.length; i++) {
        $scope.previewList[i].p = i;

        $scope.previewList[i].x = function(){ //use functions to allow for recalculations
          return Math.floor(this.p / $scope.numRows()) * $scope.width();
        } 

        $scope.previewList[i].y = function(){ 
          return (this.p % $scope.numRows()) * $scope.height() + $scope.baseHieght;
        }
      }

      console.log($scope.previewList);
    });

  }]);