'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  factory('articleService', ['$http', function ($http) {
  	var articleService = {};

  	articleService.getArticleBlurbs = function () {
  		var a = this.articles;
  		for (var i = 0; i < a.length; i++){
  			a[i].contents = a[i].contents.substring(0, 200);
  		}
  		return a;
  	}

  	articleService.addArticle = function (newName, newContents) {
  		this.articles.push({name: newName, contents: newContents, id: this.articles.length});
  	}

  	articleService.getArticleByID = function (id) {
  		var a = {};
  		for (var i = 0; i < this.articles.length; i++){
  			if (this.articles[i].id == id){
  				a = this.articles[i];
  				break;
  			}
  		}
  		return a;
  	}

  	articleService.articles = [{name: "My First Article", contents: "This is my first article", id: 0},
  					{name: "A study in scarlet", contents: "This is my secound article", id: 1},
  					{name: "Comparing Apples to Oranges: an exercise in fruitility", contents: "what a joke", id: 2},
  					{name: "AngularJS is great!", contents: "This is my last article!", id: 3}];

  	return articleService;

  }]);
