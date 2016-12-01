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

app.set('view engine', 'ejs');


//Spotify
var SpotifyWebApi = require('spotify-web-api-node');
var credentials = {
    clientId : '4a3e7b2dc9ac41ba93371446e475cbcc',
    clientSecret : '262b7ed0bbd7443b8f3eed1490c4f451',
    redirectUri : 'http://mydj.ladespensa.es:8080/usuario'
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


// --------------------- RUTAS ----------------------
// Rutas de la aplicacion
app.get('/', function(req, res){
    res.status(200).send('Hola anfitrion');
});


app.get('/usuario', function(req, res){
    var code =  req.param('code');
    var token =  req.param('state');

    req.session.access_token = token;
    req.session.save();

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

                        if(req.session.usuario) res.render('pages/home', {nombre: req.usuario.nombre});
                        else
                            var user = {};
                            user.nombre = data.body['display_name'];
                            user.email = data.body['email'];
                            user.idSpotify = data.body['id'];

                                getUserByEmail(user.email, function (result, error) {
                                    if(error){
                                        console.log(error);
                                    }else{ // Existe
                                        if(result[0]){
                                            // Login
                                            doLogin(req, res, result[0], function(){});
                                        }else{

                                            // Creamos al usuario
                                            crearUsuario(user, function (result, error) {
                                                if(error){
                                                    console.log(error);
                                                }else{
                                                    // Logamos al usuario
                                                    doLogin(req, res,  user, function(){});
                                                }
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

    //res.sendfile('public/crear-sesion.html');


});

crearFiesta = function(req, res) {
    //Creamos token para la fiesta
    var rand = function() {
        return Math.random().toString(36).substr(2);
    };
    var tokenParty = rand();
    var idUserAnfitrion = req.session.usuario.id;

    //Guargamos el token en sesion
    req.session.tokenParty = tokenParty;
    req.session.save();
    spotifyApi.createPlaylist(req.session.usuario.id_spotify, req.body.nombre, { 'public' : false })
        .then(function(data) {
            //Creamos al usuario anfitrion
            var queryPartyUsuarios = connection.query('INSERT INTO sesiones(nombre, id_usuario_anfitrion, token, id_spotify) VALUES(?, ?, ?, ?)', [req.body.nombre, idUserAnfitrion, tokenParty, data.body.id], function(error, result) {
                if (error) {
                    res.json(error);
                } else {
                    var query = connection.query('INSERT INTO usuarios_sesiones (id_usuario, id_sesion) VALUES (?, ?)', [idUserAnfitrion, result.insertId], function (error, result) {
                        if (error) {
                            console.log(error)
                        } else {
                            res.json({'token': tokenParty});
                        }
                    });
                }
            });

        }, function(err) {
            console.log('Something went wrong!', err);
        });

};

app.post('/crear-sesion', crearFiesta);

adminSesion = function(req, res) {

    var token = req.params.token;
    var usuarioLogado = req.session.usuario;
    if(usuarioLogado){

        var idUser = req.session.usuario.id;
        //Cogemos la sesión
        var query = connection.query('SELECT * FROM canciones WHERE id_usuario = ?', [idUser], function(error, result){
            if(error){
                console.log(error)
            }else{
                var query = connection.query('SELECT id, id_usuario_anfitrion, id_spotify FROM sesiones WHERE token = ?', [token], function(error, resultSesion) {
                    if (error) {
                        console.log(error)
                    } else {
                        //Guargamos el id de la sesion en sesion
                        req.session.idParty = resultSesion[0].id;

                        //Guargamos el token en sesion
                        req.session.tokenParty = token;
                        req.session.save();

                        if(result.length == 0){
                            console.log('------------ ID Usuario -----------');
                            console.log(idUser);
                            //No tenemos las canciones del usuario en la sesion
                            getSongs(idUser, resultSesion[0],  function(){
                                console.log('GET SONGS USER');
                                loadSesion(res, token);
                            });
                        }else{
                            console.log('YA TENEMOS LAS CANCIONES');
                            loadSesion(res, token);
                        }
                    }
                });
            }
        });

    }else{
        req.session.callback = '/sesion/'+token;
        req.session.save();
        res.redirect('/');
    }


};

app.get('/sesion/:token', adminSesion);

logout = function(req, res) {
    req.session.usuario = null;
    req.session.save();
    res.redirect('/');
};

app.get('/usuario/logout', logout);

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


});

// ----------------------- FUNCIONES -----------------------
// Funciones generales de la parte del servidor (BACK-FLOW)
function redirigirAnfitrion(urlLogin){
    io.sockets.emit('redirect-anfitrion', urlLogin);
    return false;
}

function doLogin(req, res, usuario, callback){
    //Guargamos el usuario en sesion
    req.session.usuario = usuario;
    console.log('------- SAVE SESION USER -----');
    console.log(usuario);
    req.session.save();
    if (typeof callback === "function") {

        // Venia de una sesion
        if(req.session.callback) res.redirect(req.session.callback);
        else res.render('pages/home', {nombre: usuario.nombre});

        req.session.callback = null;
        req.session.save();
        // Execute the callback function and pass the parameters to it​
        callback();
    }

}

function loadSesion(res, token){
    //Cogemos la sesión
    var query = connection.query('SELECT sesiones.id, sesiones.nombre AS nombre_ses , usuarios.nombre AS nombre_user,  usuarios.id AS id_user FROM sesiones INNER JOIN usuarios ON sesiones.id_usuario_anfitrion=usuarios.id  WHERE token = ?', [token], function(error, result){
        if(error){
            console.log(error)
        }else{

            var sesion = result[0];
            var creador = sesion.nombre_user;
            //Aqui debemos traer las canciones de los usuarios que pertenecen a la sesion
            var query = connection.query('SELECT * FROM canciones WHERE id_usuario IN (SELECT id_usuario FROM usuarios_sesiones WHERE id_sesion = ?)',[sesion.id], function(error, resultCanciones){
                if(error){
                    console.log(error)
                }else{
                    console.log('GO TO SESION');
                    res.render('pages/sesion', {nombre: sesion.nombre_ses, canciones: resultCanciones, creador: creador});
                }
            });
        }
    });
}
function getUserByEmail(email, callback){

    var query = connection.query('SELECT id, nombre, id_spotify, email FROM usuarios WHERE email ="' + email + '"' , function(error, result){
        if (typeof callback === "function") {
            // Execute the callback function and pass the parameters to it​
            callback(result, error);
        }
    });

}

function getSong(result, callback){
    if(canciones.length<= 0) var canciones = [];
    var errorQuery = false;
    for(var i=0; i<result.length; i++) {

        var query = connection.query('SELECT * FROM canciones WHERE id = '+result[i].id_cancion, function(error, result_song){
            if(error){
                errorQuery = true;
                console.log(error)
            }else{
               canciones[i] = result_song;
            }
        });

    }

    if (typeof callback === "function" && canciones.length == result.length) {
        // Execute the callback function and pass the parameters to it​
        callback(canciones, errorQuery);
    }else{
        getSong(result);
    }


}

function crearUsuario(usuario, callback){

    var query = connection.query('INSERT INTO usuarios(nombre, id_spotify, email) VALUES(?, ?, ?)', [usuario.nombre, usuario.idSpotify, usuario.email ], function(error, result){
        if (typeof callback === "function") {
            // Execute the callback function and pass the parameters to it​
            callback(result, error);
        }
    });

}


function getSongs(id_usuario, sesion, callback){
    spotifyApi.getMyTopTracks().then(function(datos) {
        var i=0;
        var errorInsert = true;
        spotifyApi.refreshAccessToken()
            .then(function(data) {
                console.log('The access token has been refreshed!');
                spotifyApi.setAccessToken(data.body['access_token']);

                for(i in datos.body.items){
                    var cancion = {};
                    cancion.nombre = datos.body.items[i].album['name'];
                    cancion.id_spotify = datos.body.items[i].uri;
                    cancion.id_usuario = id_usuario;
                    //CREACION CANCIONES ANFITRION
                    errorInsert = addSong(cancion, sesion);

                    i = i+1;

                }
                if (typeof callback === "function") {
                    var idsCanciones = datos.body.items.map( function(ids) { return ids.uri; });
                    console.log(idsCanciones);
                    spotifyApi.addTracksToPlaylist('gonzagn', sesion.id_spotify, [idsCanciones])
                        .then(function(data) {
                            console.log('Added tracks to playlist!');
                        }, function(err) {
                            console.log(err);
                        });
                    // Execute the callback function and pass the parameters to it​
                    callback(errorInsert);
                }
            });

    }, function(err) {
        console.log('Could not refresh access token', err);
    });
}



function addSong(data, sesion){
    //Creamos al usuario anfitrion
    var queryPartyUsuarios = connection.query('INSERT INTO canciones(nombre, id_spotify, id_usuario) VALUES(?, ?, ?)', [data.nombre, data.id_spotify, data.id_usuario], function(error, result){
        if(error){
            console.log(error);
            return false;
        }else{

            //Cogemos el nombre del usuario anfitrion

            var queryPartyUsuarios = connection.query('SELECT * FROM usuarios WHERE id = '+sesion.id_usuario_anfitrion, function(error, result){
                if(error){
                    console.log(error);
                    return false;
                }else{ console.log(data.id_spotify);
                    // Add tracks to a playlist

            /*        spotifyApi.addTracksToPlaylist('gonzagn', sesion.id_spotify, [data.id_spotify])
                        .then(function(data) {
                            console.log('Added tracks to playlist!');
                        }, function(err) {
                            console.log('Something went wrong!', err);
                        });
*/


                    return true;

                }
            });
        }
    });
}

function goLogin(token){

    var scopes = ['user-read-private', 'user-read-email', 'user-library-read', 'user-top-read', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-collaborative'],
        redirectUri = 'http://mydj.ladespensa.es:8080/usuario',
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
