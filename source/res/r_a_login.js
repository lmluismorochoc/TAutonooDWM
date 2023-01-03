/* global _BD_, IP_SERVIDOR_NODE, _BDH_, MENSAJE_DEPRECATE */

var cnf = require('./config.js');
var router = require('express').Router();



/**
 * @api {post} /c/login/autenticar autenticar
 * @apiGroup C>LOGIN
 * @apiVersion 3.1.1 
 * 
 * @apiParam {int} idAplicativo
 * @apiParam {String} usuario sera el correo electronico o el celular con el que se registro
 * @apiParam {String} clave deberá ser enviada con un MD5
 * @apiParam {String} idFacebook en caso de autenticarce con facebook, si no se logea con facebook no se enviara la clave idFacebook
 * 
 * @apiParam {String} token token de firebase
 * 
 * @apiParam {int} idPlataforma iOs, Android, WEB
 * @apiParam {String} imei
 * @apiParam {String} marca marca del dispositivo. Maximo 45 caracteres
 * @apiParam {String} modelo del del dispositivo. Maximo 45 caracteres
 * @apiParam {String} so sistema operativo del dispositivo. Maximo 45 caracteres
 * @apiParam {String} vs version del APP formato obligatorio (numbre.numbre.number). Maximo 45 caracteres
 *  
 * @apiSuccess {json} json {en: 1, usuario: {idCliente, celular, correo, nombres, apellidos, cedula}}
 * @apiSuccessExample Success-Response:
 *   Fujo normal de eventos: Si cambiarClave = 2 se mostrara pantalla de cambio de clave caso contrario se ingresara normalmente.
 *   
 * @apiSuccess (Execpcional_1) {json} json {en: -1, m: 'Usuario y/o contraseñas incorrectas'}
 * @apiSuccessExample Execpcional_1:
 *      Flujo alterno de eventos:
 *   
 * @apiError {json} json {error: CODIGO_ERROR};
 * @apiErrorExample Error-Response:
 *   Los errores devuelve desde el estado de error -200 y menores
 */
router.post('/autenticar/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return autenticar(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function autenticar(req, res) {
    var usuario = req.body.usuario;
    var clave = req.body.clave;


    if (!usuario)
        return res.status(400).send({error: 1, param: 'usuario'});
    if (!clave)
        return res.status(400).send({error: 1, param: 'clave'});


    cnf.ejecutarResSQL(SQL_AUTENTICAR, [usuario, clave], function (usuarios) {
        if (usuarios.length <= 0)
            return res.status(200).send({en: -1, m: 'Usuario y/o contraseñas incorrectas'});
        return res.status(200).send({en: 1, usuario: usuarios[0]});
    }, res);
}

const SQL_AUTENTICAR =
        "SELECT idAdministrador,nombres,apellidos,imagen FROM " + _BD_ + ".administrador where usuario=? and contrasenia=MD5(CONCAT(? , 'd2be0658f23e36fdf58c408302faabbb')) and bloqueado=0;"


module.exports = router;