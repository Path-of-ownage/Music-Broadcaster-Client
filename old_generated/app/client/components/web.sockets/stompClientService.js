/**
 * Created by Kelv on 15/02/2015.
 */
/*globals console, Stomp, SockJS, angular, setTimeout */
angular.module('app').service('stompClientService', function ($q, $rootScope, userService) {
    'use strict';
    var stompClient,
        player = null,
        roomName = null,
        self = this;

    this.connect = function (roomNameParam, connectionCallback) {
        var socket = new SockJS('http://localhost:8080/channels'),
            deferred = $q.defer();

        self.stompClient = Stomp.over(socket);
        self.stompClient.heartbeat.outgoing = 5000; // if 5000 means client will send heart beat every 5000ms
        self.stompClient.heartbeat.incoming = 5000; // if 0 means client does not want to receive heartbeats from server
        self.stompClient.connect({}, function (frame) {
            self.roomName = roomNameParam;
            self.stompClient.subscribe('/room/' + roomNameParam, connectionCallback);
            $rootScope.$broadcast('setRoom');
            deferred.resolve();
        });
        return deferred.promise;
    };

    this.addToQueue = function (videoId, length, displayName, thumbnailUrl) {
        self.stompClient.send("/app/room/" + self.roomName + "/add", {}, JSON.stringify({
            'id': videoId,
            'length': length,
            'displayName': displayName,
            'thumbnailUrl': thumbnailUrl
        }));
    };

    this.sendPlay = function () {
        self.stompClient.send('/app/room/' + self.roomName + '/play', {});
    };

    this.sendPause = function () {
        self.stompClient.send('/app/room/' + self.roomName + '/pause', {});
    };

    this.getRoomName = function () {
        return self.roomName;
    };

    this.sendHeartBeat = function (milliseconds) {
        self.stompClient.send('/app/room/' + self.roomName + "/heart-beat", {
            "heart-beat": true
        }, JSON.stringify({
            'seek': {
                'milliseconds': milliseconds
            },
            'user': {
                'id': userService.id
            }
        }));
    };
});