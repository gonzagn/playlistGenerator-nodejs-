/**
 * Created by gonzalogarcia on 3/11/16.
 */

var socket = io.connect('http://localhost:8080', { 'forceNew' : true});

socket.on('messages', function(data){
    render(data);
});

socket.on('party-creada', function(token){
    showToken(token);
});

function render(data){

    var html = data.map(function(elem, index){
        return(`<div>
                   <strong>${elem.author}: </strong>
                   <span>${elem.text}</span>
                </div>`);
    }).join(" ");


    $('#mensajes').html(html);
}

function addMessage(e){
    var payload = {
        author: $('#username').val(),
        text: $('#text').val()
    };

    socket.emit('new-mensaje', payload);
    return false;
}

function createPartyPlaylist(e){
    var party = {
        author: $('#author').val(),
        name: $('#nameParty').val()
    };

    socket.emit('new-party', party);
    return false;
}

function showToken(token){

    var html =`<div style="width: 150px; margin: 0 auto;">
                   <input type="text" value="${token}"> </input><br>
                   <button>COPY TO SHARE</button>
                </div>`;



    $('#token').html(html);
    $('#token').slideDown();
}