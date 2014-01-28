'use strict';

/* Services */


// Demonstrate how to register services
// In articleService case it is a simple value service.
angular.module('myApp.services', []).
  factory('articleService', ['$http', '$q', function ($http, $q) {
  	var articleService = this;

    articleService.articles = [];

  	articleService.getArticleBlurbs = function () {
      var defered = $q.defer();

  	  $http.get('db/?id=all').then(function(result){
        articleService.articles = result.data;
        defered.resolve(result.data);
      });

      return defered.promise; 
  	}

    articleService.createArticle = function(){
      var defered = $q.defer();

      console.log("Attempting to createArticle")

      $http.get('db/?id=new').then(function(result){
        articleService.articles = result.data;
        defered.resolve(result.data);
      });

      return defered.promise;
    }

  	articleService.saveArticle = function(newTitle, newBody, id) {
      var defered = $q.defer();

      for(var i = 0; i < articleService.articles.length; i++){
        if(articleService.articles[i]._id = id){
  		    articleService.articles[i].title = newTitle;
          articleService.articles[i].body = newBody;
          $http.post('save/?id='+id+'&title='+newTitle+'&body='+newBody).then(function(result){
            defered.resolve(result.data);
          });
        }
      }

      return defered.promise;
  	}

    articleService.removeArticle = function(id) {
      articleService.articles.splice(id, 1);
    }

  	articleService.getArticleByID = function(id) {
  		var defered = $q.defer();

      $http.get('db/?id='+id).then(function(result){
        articleService.articles = result.data;
        defered.resolve(result.data)
      });

      return defered.promise; 
  	}

  	return articleService;

  }]);
