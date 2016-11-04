/**
 * Created by gonzalogarcia on 3/11/16.
 */

var express = require('express');
var app = express();

var server  = require('http').Server(app);
var io = require('socket.io')(server);

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'MyDJ',
    port: 3306
});
connection.connect(function(error){
    if(error){
        throw error;
    }else{
        console.log('Conexion correcta.');
    }
});

var messages = [{
    'id': 1,
    'author': "Gonzalo",
    'text': "Hola!!!!"
}];

var users = [];
var partys = [{
    'token': "",
    'idUser': 1,
    'name': "",
    'users': []
}];

app.use(express.static('public'));

app.get('/', function(req, res){
    res.status(200).send('Hola anfitrion');
});

app.get('/party', function(req, res){
    tokenFiesta =  req.param('token');
    res.sendfile('public/home-invitado.html');

});


io.on('connection', function(socket){
   console.log('alguien se ha conectado con sokets');
    //emitimos mensajes para el anfitrion
    socket.emit('messages', messages);

    //escuchamos emision
    socket.on('new-party', function(data){

        crearFiesta(data);

    });

});



//Se deja al final del fichero
server.listen(8080, function(){
    console.log('funcionando');
});


// Funciones

function crearFiesta(data){

    //Creamos token para la fiesta
    var rand = function() {
        return Math.random().toString(36).substr(2);
    };
    var tokenParty = rand();

    var idUserAnfitrion = null;

    //Creamos al usuario anfitrion
    var queryPartyUsuarios = connection.query('INSERT INTO partys_usuarios(nombre, idSpotify, tokenParty, anfitrion) VALUES(?, ?, ?, ?)', [data.author, '######## ANFITRION #######', tokenParty, 1], function(error, result){
            if(error){
                connection.end();
                return false;
            }else{
                idUserAnfitrion = result.insertId;
                var query = connection.query('INSERT INTO partys(token, nombre, idUser) VALUES(?, ?, ?)', [tokenParty, data.name, idUserAnfitrion], function(error, result){
                        if(error){
                            console.log(error);
                            return false;
                        }else{
                            connection.end();
                            io.sockets.emit('party-creada', tokenParty);

                        }
                    }
                );
            }
        }
    );





}