/**
 * Created by gonzalogarcia on 3/11/16.
 */

var socket = io.connect('http://localhost:8080', { 'forceNew' : true});

socket.on('invitado-creado', function(){
    getSpotify();
});

function addUserToParty(e){
    var user = {
        name: $('#author').val(),
        token : new RegExp('[\?&]token=([^&#]*)').exec(window.location.href)[1]

};

    socket.emit('new-user', user);
    return false;
}

function getSpotify(e){
    $('#login-spotify').slideDown();
}

function loginSpotify(e){
    var userSpotify = {
        usernaname: $('#username').val(),
        password: $('#password').val()
    };


}