'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('apreview', function() {
  	function link(scope, element, attrs) {
  		element.css("left", scope.preview.x() + 'px');
  		element.css("top", scope.preview.y() + 'px');
  	}

    return {
    	restrict: 'E',
      scope: true,
    	link: link
    };
  }).directive('alist', function () {
  	return {
  		restrict: 'E',
      scope: true,
	  	templateUrl: "partials/note.html"
 	};
  }).directive('aviewer', function () {
    return {
      restrict: 'EA',
      scope: {
        article: '='
      },
      templateUrl: "partials/viewer.html"
    }
  });
