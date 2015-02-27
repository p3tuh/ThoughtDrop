angular.module('thoughtdrop.privateController', [])

.controller('privateController', function($scope, $timeout, $ionicModal, Private, Geolocation, $window, $localStorage, $cordovaContacts) {
  //TODO: change 'findNearby' to 'findNearbyMessages' (more intuitive)
        //limit number of times user can upvote and downvote to one per message
        //modularize all http requests to services
        //look into using socket.io to handle simultaneous upvote/downvote requests from clients
  $scope.message = {};
  $scope.message.text = '';
  $scope.page = 'new';
  $scope.recipients = [5106047443]; //store phoneNumbers of recipients
  $scope.privateMessages = {};
  $scope.data = {selectedContacts: []};

  $ionicModal.fromTemplateUrl('templates/tab-privatePost.html', {
    scope: $scope
  }).then(function(modal) {
  $scope.modalNewMessage = modal;
  });

  $scope.setPage = function(page) {
    $scope.page = page;
  };

  $scope.sendMessage = function() {
    console.log('sendMessage!');
    console.log('userInfo: ' + JSON.stringify($localStorage.userInfo));

    Geolocation.getPosition()
      .then(function(position) {
        // console.log('located!: ' + JSON.stringify(position));
        // console.log([position.coords.longitude, position.coords.latitude]);
        // console.log(typeof position);
        // var creator = $localStorage.userInfo.name; //CHANGE THIS BACK TO THIS!!!
        var creator = 'peter!!!!'
        // console.log(creator);
        // console.log(typeof creator);
        // console.log('Message is: ' + $scope.message.text);
        // console.log('recipients are: ' + $scope.recipients);

        var messageData = {
          _id: Math.floor(Math.random()*100000),
          location: { coordinates: [ position.coords.longitude, position.coords.latitude], type: 'Point' },
          message: $scope.message.text,
          _creator: creator,
          recipients: $scope.recipients,
          isPrivate: true
        };

        // console.log('message data: ' + JSON.stringify(messageData));

        $scope.message.text = ''; //clear the message  for next message
        console.log($scope.message);
        $scope.recipients = []; //clear the recipients array for next message
        $scope.closeMessageBox();
        $scope.data = {selectedContacts: []}; //clear contacts for next message

        Private.saveMessage(messageData)
        .then(function(resp) {
          console.log('Message ' + "'" + resp + "'" + ' was successfully posted to server');
          //return resp;
        })
        .catch(function(err) {
          console.log('Error posting private message: ',  JSON.stringify(err));
        });
      })
      .then(function() {
        // $scope.findNearby('nearby');
        $scope.closeMessageBox();
      })
  };

  $scope.closeMessageBox = function(time) {
    var time = time || 250;
    $timeout(function() {
      $scope.modalNewMessage.hide();
    }, time);
  };

  $scope.newMessage = function() {
    $scope.modalNewMessage.show();
  };

  $scope.pickContact = function() {

    Private.pickContact()
      .then(function(contact) {
          $scope.data.selectedContacts.push(contact);
          // console.log(JSON.stringify(contact.phones[0].value));
          var number = contact.phones[0].value.replace(/\W+/g, "");
          console.log(' # before regex & slice' + number);
          var phoneNumber;

          if (number.length > 10) {  
            phoneNumber = number.slice(1);
            $scope.recipients.push(phoneNumber);
          } else {
            $scope.recipients.push(phoneNumber);
          }

          // $scope.recipients.push(contact.phones[0].value));

          console.log('RECIPIENT!: ' + $scope.recipients);

        },
        function(failure) {
            console.log("Bummer.  Failed to pick a contact");
        });

  };

  //send coordinates & users's phone number
  $scope.findPrivateMessages = function () {
    var userPhone;

    if ($localStorage.userInfo === undefined) {  //get user's phone number
      userPhone = 5106047443; 
    } else {
      userPhone = $localStorage.userInfo.phoneNumber;
    }

    Geolocation.getPosition()     //get users's position
      .then(function(position) {
          
        var data = {  //send user phoneNumber & coordinates
          latitude: position.coords.longitude, 
          longitude: position.coords.latitude,
          userPhone: userPhone
        };

        Private.getPrivate(data) //fetch private messages
        .then(function(resp) {
          $scope.privateMessages.messages = resp.data;
          console.log('$scope.privateMessages: ' + JSON.stringify($scope.privateMessages.messages));
        })
        .catch(function(err) {
          console.log('Error posting message: ' +  JSON.stringify(err));
        });
      })
  };

  $scope.findPrivateMessages();

});