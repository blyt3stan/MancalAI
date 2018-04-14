var app = angular.module('app', []);

app.controller('game', [
    '$scope',
    '$interval',
    function (
        $scope,
	    $interval) {

        var oppMap = [12, 11, 10, 9, 8, 7, -1, 5, 4, 3, 2, 1, 0, -1];
	    var turn = 1;
        var running = false;

        $scope.started = false;
        $scope.beads = 6;
        $scope.status = '';
        $scope.end = false;
        $scope.level = 1;
        $scope.speed = 100;
        

        $scope.aiPlayerTurn = function() {

            var ids = [];

            var maxGen = 0;
            var len = 0;

            for(var i = 7; i < 13;i++){
                if($scope.holes[i].count > 0){
                    maxGen++;
                }
            }

            if(maxGen <  $scope.level) {
                len = maxGen;
            }else{
                len =  $scope.level;
            }

            while(ids.length != len) {
                var id = 6 + generate();

                if(ids.indexOf(id) == -1 && $scope.holes[id].count > 0){
                    ids.push(id);
                }
            }

            ids.sort(function(a,b) {return a < b});

            var id = $scope.analyzeIds(ids);
            $scope.pick(id);
        }

        $scope.start = function() {
            turn = 1;
            running = false;
            $scope.end = false;
            
            var holeCnt = 6;
            var initCount = Number.parseInt($scope.beads);
    
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

            $scope.started = true;

            updateTurnStatus();
        }

        var updateTurnStatus = function() {
            if(turn == 1) {
                $scope.status = "Player Turn"
            }else if(turn == 2){
                $scope.status = "AI Turn"
            }
        }
        
        var showWin = function() {
            $scope.end = true;

            for(var i =0; i < 6;i++){
                $scope.holes[6].count += $scope.holes[i].count;
                $scope.holes[i].count = 0;
            }

            for(var i =7; i < 13;i++){
                $scope.holes[13].count += $scope.holes[i].count;
                $scope.holes[i].count = 0;
            }

            var p1 = $scope.holes[6].count;
            var p2 = $scope.holes[13].count;

            if(p1 > p2){
                $scope.status = 'Player Wins!';
            }else if(p1 < p2) {
                $scope.status = 'AI Wins!';
            }else{
                $scope.status = 'Draw';
            }

        }

        $scope.reset = function() {
            $scope.started = false;
        }

        var isGameEnd = function() {
            var cnt = 0;

            for(var i =0; i < 6;i++){
                cnt+= $scope.holes[i].count;
            }

            if(cnt == 0){
                return true;
            }

            cnt = 0;
            for(var i =7; i < 13;i++){
                cnt+= $scope.holes[i].count;
            }

            if(cnt == 0){
                return true;
            }

            return false;
        }

        var generate = function() {
            return Math.floor(Math.random() * 6) + 1;
        }

        $scope.pick = function (i) {
            if(running)
                return;
            if($scope.holes[i].count == 0)
                return;
            if(turn == 1 && i > 6)
                return;
            if(turn == 2 && i < 7)
                return;

            running = true;
            var hand = $scope.holes[i].count;
            $scope.holes[i].count = 0;
            var next = i;

            var stop = $interval(function () {
                if(!$scope.started) {
                    $interval.cancel(stop);
                    stop = undefined;
                    running = false;
                }else if(hand == 0 && next == 6) {
                    $interval.cancel(stop);
                    stop = undefined;
                    running = false;

                    if(isGameEnd()) {
                        showWin();
                    }
                } else if(hand == 0 && next == 13) {
                    $interval.cancel(stop);
                    stop = undefined;	
                    running = false;
                    

                    if(isGameEnd()) {
                        showWin();
                    } else{
                        $scope.aiPlayerTurn();
                    }

                } else if (hand == 0) {
                    $interval.cancel(stop);
                    stop = undefined;
                    running = false;

                    var opp = oppMap[next];
                    if(turn == 1 && next >= 0 && next <= 6 && $scope.holes[next].count == 1 && $scope.holes[opp].count > 0) {
                        $scope.holes[6].count += $scope.holes[opp].count + 1;
                        $scope.holes[next].count = 0;
                        $scope.holes[opp].count = 0;
                    }else if(turn == 2 && next >= 7 && next <= 12 && $scope.holes[next].count == 1 && $scope.holes[opp].count > 0) {
                        $scope.holes[13].count += $scope.holes[opp].count + 1;
                        $scope.holes[next].count = 0;
                        $scope.holes[opp].count = 0;
                    }

                    turn++;

                    if(isGameEnd()) {
                        showWin();
                    } else{
                        if(turn > 2)
                            turn = 1;
                        else
                            $scope.aiPlayerTurn();

                        updateTurnStatus();
                    }
                    
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
                }

            }, $scope.speed);

            $scope.analyzeIds = function(ids) {
                var nId = -1;
                var neg = 0;

                var max = -1;
                var mId = 0;
                var mCnt = 0;
                
                angular.forEach(ids, function(id) {
                    if($scope.holes[id].count > 0) {
                        var cnt  = $scope.simulate(id);
                        if(cnt < neg){
                            neg = cnt;
                            nId = id;
                        }
                        if(cnt > max) {
                            max = cnt;
                            mId = id;
                            mCnt = $scope.holes[id].count;
                        }else if(cnt == max){
                            if($scope.holes[id].count > mCnt) {
                                mId = id;
                                mCnt = $scope.holes[id].count;
                            }
                        }
                    }
                });

                if(nId != -1) {
                    if(nId > mId) {
                        return nId;
                    }else if(nId < mId && max == 1) {
                        return nId;
                    }else{
                        return mId;
                    }
                }else{
                    return mId;
                }
            }

            $scope.simulate = function(i) {

                var temp = angular.copy($scope.holes);
                var hand = temp[i].count;
                temp[i].count = 0;
                var next = i;
                var prev = temp[13].count;
                if(temp[i] == 0)
                    return 0;
                while(true) {
                    if(hand == 0 && next == 13) {
                        return -(temp[13].count - prev);			
                    } else if (hand == 0) {

                        var opp = oppMap[next];
                        if(next >= 7 && next <= 12 && temp[next].count == 1 && temp[opp].count > 0) {
                            temp[13].count += temp[opp].count + 1;
                        }

                        return temp[13].count - prev;	
                    } else {

                        next++;

                        if(next == 6)
                            next++;

                        if (next > 13)
                            next = 0;
                        if (next < 0)
                            next = 13;

                        temp[next].count++;
                        hand--;
                    }
                }
            }
        }

    }]);