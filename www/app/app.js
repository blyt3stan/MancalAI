var app = angular.module('app', []);

app.controller('game', [
    '$scope',
    '$interval',
    function (
        $scope,
	$interval) {

	var turn = 1;

        var holeCnt = 6;
        var initCount = 7;

        var p1holes = [];
        var p2holes = [];

        var p1Home = { count: 0 };
        var p2Home = { count: 0 };

        for (var i = 0; i < holeCnt; i++) {
            p1holes.push({ count: initCount });
            p2holes.push({ count: initCount });
        }

        $scope.holes = [];

        for (var i = 0; i < holeCnt; i++) {
            $scope.holes.push(p1holes[i]);
        }
        $scope.holes.push(p1Home);


        for (var i = 0; i < holeCnt; i++) {
            $scope.holes.push(p2holes[i]);
        }
        $scope.holes.push(p2Home);



        $scope.pick = function (i) {
	    if($scope.holes[i].count == 0)
		return;
	    if(turn == 1 && i > 6)
		return;
	    if(turn == 2 && i < 7)
		return;

            var hand = $scope.holes[i].count;
            $scope.holes[i].count = 0;
            var next = i;

            var stop = $interval(function () {

		if (hand == 0 && $scope.holes[next].count == 1) {
                    $interval.cancel(stop);
                    stop = undefined;

		    turn++;
		    if(turn > 2)
			turn = 1;

                } else if(hand == 0 && next == 6) {
			$interval.cancel(stop);
                        stop = undefined;
		} else if(hand == 0 && next == 13) {
			$interval.cancel(stop);
                    	stop = undefined;			
		} else if(hand == 0 && $scope.holes[next].count > 1) {
			hand = $scope.holes[next].count;
			$scope.holes[next].count = 0;
		} else {

	                next++;

			if(turn == 1 && next == 13)
			    next++;
			if(turn == 2 && next == 6)
			    next++;

			if (next > 13)
                	    next = 0;
        	        if (next < 0)
	                    next = 13;


        	        $scope.holes[next].count++;
	                hand--;
			console.log(hand);
		}

            }, 100);
        }

    }]);