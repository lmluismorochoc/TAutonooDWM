/* global ID_APP, ID_APP_CLIPP, MYSQL, PORT_SERVER_HTTP, IS_DESARROLLO, HOST_REDIS, PORT_REDIS, EMIT, IP_SERVIDOR_NODE, URI_MONGO, VERSION, __dirname, LLAVE_ECRIP, IMPUESTOS, MYSQL_DISCONNECT */

const expressip = require('express-ip');
global.VERSION = '0.0.1';
global.MOMENT = require('moment-timezone');

global.IS_DESARROLLO = (process.argv[2] ? (process.argv[2] === 'true') : false);
global.IP_SERVIDOR_NODE = (process.argv[3] ? process.argv[3] : '-.-.-.-');
global.PORT_SERVER_HTTP = (process.argv[4] ? parseInt(process.argv[4]) : -1);
global.PORT_REDIS = (process.argv[5] ? parseInt(process.argv[5]) : -1);
global.HOST_REDIS = (process.argv[6] ? process.argv[6] : '-.-.-.-');
let TOKEN_SIDER = (process.argv[7] ? process.argv[7] : 'LKJjhKJHBJHGjgVJHGHGvjhgvjhg67431Hj');


global._BD_;
global._BDH_;
ID_APP = 1;
ID_APP_CLIPP = 1;
require('./VAR_GLOBAL.js');

_BD_ = 'bancodt';

var administrador = require('./administrador_functions');
administrador.imprimirOneLogs('Param: ' + process.argv);
administrador.imprimirOneLogs('IS_DESARROLLO: ' + IS_DESARROLLO);
administrador.imprimirOneLogs('IP_SERVIDOR_NODE: ' + IP_SERVIDOR_NODE);
administrador.imprimirOneLogs('PORT_SERVER_HTTP: ' + PORT_SERVER_HTTP);
administrador.imprimirOneLogs('ID_APP: ' + ID_APP);
administrador.imprimirOneLogs('PORT_REDIS: ' + PORT_REDIS);
administrador.imprimirOneLogs('HOST_REDIS: ' + HOST_REDIS);

var http = require('http');

var configuraciones = require('./config.js');
//var monitoreador = require('./monitoreador');
var IO = require('socket.io-client');
//var configuraciones_mongo = require('./config_mongo.js');

configuraciones.on(function (activar) {
    if (activar) {
        administrador.imprimirOneLogs('DELETE BASURA...');
        setTimeout(function () {
            var express = require('express');
            var app = express();
            var bodyParser = require('body-parser');
            var serveStatic = require('serve-static');
            app.use(bodyParser.json({
                limit: "1mb"
            }));
//            app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
            app.use(bodyParser.urlencoded({
                limit: "1mb",
                extended: true,
                parameterLimit: 50
            }));
            app.use(bodyParser.json());
            app.use(require('./r_a_espacios'));
            app.use(require('./r_a_ticket'));
            app.use(require('./r_a_categoria'));
            app.use(require('./r_c_login'));
            app.use(require('./r_a_login'));
            app.use(require('./r_a_demanda'));
            app.get('/', function (req, res) {
                res.status(200).send({
                    EC: 'ECUADOR',
                    ENVIRONMENT: IS_DESARROLLO,
                    IDENTIFICADOR: ID_APP,
                    VERSION: VERSION,
                    BY: 'Luis',
                    PROJECT: 'Banco del Tiempo',
                    ARCHITECT: ''
                });
            });
            app.use(express.static(__dirname + '/public'));
            app.use(expressip().getIpInfoMiddleware);
            var http = require('http').Server(app);


            http.listen(PORT_SERVER_HTTP, function () {
                administrador.imprimirOneLogs('Server escuchando el puerto :' + PORT_SERVER_HTTP);
            });

            var compression = require('compression');
            app.use(compression());
            if (IS_DESARROLLO) {
                app.use('/api/bnl', serveStatic('../apidoc/rest/api', {
                    'index': ['index.html']
                }));
                app.use('/doc/api', serveStatic('../apidoc/api', {
                    'index': ['index.html']
                }));
                app.use('/doc/res', serveStatic('../apidoc/res', {
                    'index': ['index.html']
                }));
                app.use('/doc/sokect', serveStatic('../apidoc/sokect', {
                    'index': ['index.html']
                }));
            }

            app.use('/oferta', require('./r_a_oferta'));
            app.use('/oferta', require('./r_a_ticket'));
            app.use('/categoria', require('./r_a_categoria'));
            app.use('/usuario', require('./r_c_login'));
            app.use('/admin', require('./r_a_login'));
            app.use('/demanda', require('./r_a_demanda'));
            



        }, 0); //Se retarla el levantado del servidor durante dos segundos para evitar bloqueos en el servidor.
    } else {
        administrador.imprimirErrLogs('EL SERVIDOR NO SE PUDO LEVANTAR POR PROBLEMAS CON LA BASE DE DATOS.');
        setTimeout(function () {
            throw "ERROR GRAVE...";
        }, 10000);
    }
});


var exec = require('child_process').exec,
        child;

setTimeout(function () {
    setInterval(function () {
        liberarMemoria();
    }, 1000 * 60 * 45);
}, 30000);

function liberarMemoria() {
    child = exec('sync && sudo sysctl -w vm.drop_caches=3', function (error, stdout) {
        administrador.imprimirOneLogs(stdout);
        if (error !== null)
            administrador.imprimirErrLogs('liberarMemoria error: ' + error);
    });
}

