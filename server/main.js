/**
 * Created by gonzalogarcia on 3/11/16.
 */
//La aplicacion
var express = require('express');
var app = express();

//El servidor
var server  = require('http').Server(app);
var io = require('socket.io')(server);

//La parte publica de la aplicacion
app.use(express.static('public'));
var router = express.Router();
app.use(router);

var bodyParser = require('body-parser');
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse the raw data
app.use(bodyParser.raw());
// parse text
app.use(bodyParser.text());


//Spotify
var SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
    clientId : '4a3e7b2dc9ac41ba93371446e475cbcc',
    clientSecret : '262b7ed0bbd7443b8f3eed1490c4f451',
    redirectUri : 'http://mydj.ladespensa.es:8080/anfitrion'
};
var spotifyApi = new SpotifyWebApi(credentials);

//BBDD
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

//Sesiones
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const session = require('express-session');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


/*
app.use(express.cookieParser());
app.use(express.session({ secret: 'secretw4riou4dn' }));
*/



// --------------------- RUTAS ----------------------
// Rutas de la aplicacion
app.get('/', function(req, res){
    res.status(200).send('Hola anfitrion');
});

app.get('/party', function(req, res){
   var tokenFiesta =  req.param('token');
    res.sendfile('public/home-invitado.html');

});

app.get('/anfitrion', function(req, res){
    var code =  req.param('code');
    var token =  req.param('state');

    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code)
        .then(function(data) {

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);

            spotifyApi.refreshAccessToken()
                .then(function(data) {
                    console.log('The access token has been refreshed!');
                    spotifyApi.setAccessToken(data.body['access_token']);

                    var email_usuario = false;

                    spotifyApi.getMe().then(function(data){
                        console.log('----------- ME -----------');

                        var user = {};
                        user.nombre = data.body['display_name'];
                        user.email = data.body['email'];
                        user.idSpotify = data.body['id'];
                        user.anfitrion = 1;

                        //CREACION USUARIO
                        var queryPartyUsuarios = connection.query('INSERT INTO usuarios(nombre, id_spotify, email, anfitrion) VALUES(?, ?, ?, ?)', [user.nombre, user.idSpotify, user.email, user.anfitrion], function(error, result){
                            if(error){
                                console.log(error);
                                throw error;
                            }else{
                                console.log(result.insertId);
                                if(result.insertId){
                                    //CANCIONES DEL ANFITRION
                                    spotifyApi.getMyTopTracks().then(function(datos) {
                                        var i=0;

                                        for(i in datos.body.items){
                                            var cancion = {};
                                            cancion.nombre = datos.body.items[i].album['name'];
                                            cancion.id_spotify = datos.body.items[i].album['id'];
                                            cancion.id_usuario = result.insertId;

                                            req.session.id_usuario = result.insertId;
                                            req.session.save();
                                            //CREACION CANCIONES ANFITRION
                                            addSong(cancion);
                                            i = i+1;
                                        }

                                    }, function(err) {
                                        console.log('Could not refresh access token', err);
                                    });
                                }

                            }
                        });

                    });

                }, function(err) {
                    console.log('Something went wrong!', err);
                });


        }, function(err) {
            console.log('Something went wrong!', err);
        });

    res.sendfile('public/crear-sesion.html');

});

crearFiesta = function(req, res) {
    //Creamos token para la fiesta
    var rand = function() {
        return Math.random().toString(36).substr(2);
    };
    var tokenParty = rand();
    var idUserAnfitrion = req.session.id_usuario;

    //Guargamos el token en sesion
    req.session.tokenParty = tokenParty;
    req.session.save();


    //Creamos al usuario anfitrion
    var queryPartyUsuarios = connection.query('INSERT INTO sesiones(nombre, id_usuario_anfitrion, token) VALUES(?, ?, ?)', [req.body.nombre, idUserAnfitrion, tokenParty], function(error, result){
        if(error){
            res.json(error);

        }else{
            res.json({'response':'Creada!'});
        }
    });

};

app.post('/crear-sesion', crearFiesta);


// ----------------------- SOCKETS -------------------------
// Comunicación con sokets, aqui manejamos la escucha de los eventos que emitirá la parte publica.
io.on('connection', function(socket){
   console.log('alguien se ha conectado con sokets');

    //escuchamos emision
    socket.on('login-anfitrion', function(data){
        var urlLogin = goLogin(data);
        console.log(urlLogin);

        redirigirAnfitrion(urlLogin);

    });
    //escuchamos emision
    socket.on('new-party', function(data){
        crearFiesta(data);
    });
    //escuchamos emision
    socket.on('new-user', function(data){

        crearUsuario(data);
        getSongsOfUser(data.token);

    });

});

// ----------------------- FUNCIONES -----------------------
// Funciones generales de la parte del servidor (BACK-FLOW)
function redirigirAnfitrion(urlLogin){
    io.sockets.emit('redirect-anfitrion', urlLogin);
    return false;
}


function getIdAnfitrionByEmail(email){
    var query = connection.query('SELECT id FROM usuarios WHERE email = ? AND anfitrion = ?', [email, 1], function(error, result){
        if(error){
            console.log(error);
            return false;
        }else{
            //console.log(result[0].id);
            if(result.length > 0){
                return result[0].id;
            }else{
                console.log('Registro no encontrado');
                return false;
            }
        }
    });
}

function addSong(data){
    //Creamos al usuario anfitrion
    var queryPartyUsuarios = connection.query('INSERT INTO canciones(nombre, id_spotify, id_usuario) VALUES(?, ?, ?)', [data.nombre, data.id_spotify, data.id_usuario], function(error, result){
        if(error){
            console.log(error);
            return false;
        }else{
            return true;
        }
    });
}

function goLogin(token){

    var scopes = ['user-read-private', 'user-read-email', 'user-library-read', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private'],
        redirectUri = 'http://mydj.ladespensa.es:8080/anfitrion',
        clientId = '4a3e7b2dc9ac41ba93371446e475cbcc',
        state = 'rfger';

    // Create the authorization URL
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

    return authorizeURL;
}

//Se deja al final del fichero
server.listen(8080, function(){
    console.log('funcionando');
});
