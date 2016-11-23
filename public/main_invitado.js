/**
 * Created by gonzalogarcia on 3/11/16.
 */

var socket = io.connect('http://mydj.ladespensa.es:8080', { 'forceNew' : true});

socket.on('invitado-creado', function(urlAuth){
    finUsuarioInvitado(urlAuth);
});

function addUserToParty(e){
    var user = {
        name: $('#author').val(),
        token : new RegExp('[\?&]token=([^&#]*)').exec(window.location.href)[1]
    };

    socket.emit('new-user', user);
    return false;
}

function finUsuarioInvitado(urlAuth){
    window.location.href = urlAuth;
    alert('FIN');
}

