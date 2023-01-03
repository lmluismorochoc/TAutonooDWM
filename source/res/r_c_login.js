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
        "SELECT (select count(idOfertasDemandas) from ofertas_demandas where id_ofertante = pr.idUsuario) as num_publicaciones,p.id_persona,p.nombres,p.apellidos, p.telefono,pr.usuario,pr.idUsuario,pr.tiempo,p.direccion,p.email,p.imagen,pr.calificacion FROM bancodt.persona p inner join usuario pr on pr.id_persona=p.id_persona where pr.id_rol=2 and usuario=? and password = ?"

router.post('/usuariobycelular/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return buscarUsuario(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function buscarUsuario(req, res) {
    var celular = req.body.celular;
    var idUsuario = req.body.idUsuario;


    if (!celular)
        return res.status(400).send({error: 1, param: 'usuario'});

    if (!idUsuario)
        return res.status(400).send({error: 1, param: 'idUsuario'});



    cnf.ejecutarResSQL(SQL_BUSCAR_USUAURIO, [celular, idUsuario], function (usuarios) {
        if (usuarios.length <= 0)
            return res.status(200).send({en: -1, m: 'Número de celular no registrado'});
        return res.status(200).send({en: 1, usuario: usuarios[0]});
    }, res);
}

const SQL_BUSCAR_USUAURIO =
        "SELECT p.id_persona,p.nombres,p.apellidos, p.telefono,pr.usuario,pr.idUsuario FROM bancodt.persona p inner join usuario pr on pr.id_persona=p.id_persona where pr.id_rol=2 and p.telefono=? and pr.idUsuario <> ?"


router.post('/transferir/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return tranferir(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function tranferir(req, res) {
    var idUsuarioPaga = req.body.idUsuarioPaga;
    var idUsuarioRecibe = req.body.idUsuarioRecibe;
    var detalle = req.body.detalle;
    var valoracion = req.body.valoracion;
    var monto = req.body.monto;


    if (!idUsuarioPaga)
        return res.status(400).send({error: 1, param: 'idUsuarioPaga'});

    if (!idUsuarioRecibe)
        return res.status(400).send({error: 1, param: 'idUsuarioRecibe'});

    if (!monto)
        return res.status(400).send({error: 1, param: 'monto'});
    if (!detalle)
        return res.status(400).send({error: 1, param: 'detalle'});
    if (!valoracion)
        return res.status(400).send({error: 1, param: 'valoracion'});



    cnf.ejecutarResSQL(SQL_VALIIDAR_SALDO, [monto, idUsuarioPaga], function (usuarios) {
        if (usuarios.length <= 0)
            return res.status(200).send({en: -1, m: 'Número de horas insuficientes'});
        cnf.ejecutarResSQL(SQL_insertar_transaccion, [monto, detalle, idUsuarioPaga, idUsuarioRecibe, valoracion], function (ofertas_demandas) {
            if (ofertas_demandas['insertId'] <= 0)
                return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

            return res.status(200).send({en: 1, m: 'Pago realizado correctamente'});
        }, res);
    }, res);
}

const SQL_VALIIDAR_SALDO =
        "SELECT idUsuario FROM bancodt.usuario where tiempo >=? and idUsuario =?;"

const SQL_insertar_transaccion =
        "INSERT INTO bancodt.transacciones_tiempo (numero_horas, descripcion_actividad, id_ofertante, id_demandante, valoracion) VALUES (?, ?, ?, ?, ?);";




router.post('/movimientos/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return movimientos(req, res);
    return res.status(320).send({m: 'versión'});
});


function movimientos(req, res) {
//    var idAdministrador = req.body.idAdministrador;
    var desde = req.body.desde;
    var cuantos = req.body.cuantos;
    var idUsuario = req.body.idUsuario;

    if (!desde)
        return res.status(400).send({error: 1, param: 'desde'});
    if (!cuantos)
        return res.status(400).send({error: 1, param: 'cuantos'});
    if (!idUsuario)
        return res.status(400).send({error: 1, param: 'idUsuario'});
    
    var SQL_OFERTAS = "SELECT if(id_demandante=?,'1','0') as tipo,tt.id_transaccion,tt.numero_horas,tt.fechaRegistro,tt.descripcion_actividad,p.nombres,p.apellidos,pp.nombres as nombres2, pp.apellidos as apellidos2 FROM bancodt.transacciones_tiempo tt inner join usuario u on tt.id_demandante=u.idUsuario inner join persona p on p.id_persona= u.id_persona inner join usuario uu on tt.id_ofertante=uu.idUsuario inner join persona pp on pp.id_persona= uu.id_persona where tt.id_ofertante=? or tt.id_demandante=? order by tt.fechaRegistro  desc LIMIT ?, ?;";


    cnf.ejecutarResSQL(SQL_OFERTAS, [idUsuario,idUsuario,idUsuario,parseInt(desde), parseInt(cuantos)], function (movmientos) {
        if (movmientos.length <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos pero no se encuentran movimientos para los parametros enviados.'});

        return res.status(200).send({en: 1, lM: movmientos});
    }, res);


}



router.post('/miembros/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return buscarUsuario(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function buscarUsuario(req, res) {
    var celular = req.body.celular;
    var idUsuario = req.body.idUsuario;

    if (!idUsuario)
        return res.status(400).send({error: 1, param: 'idUsuario'});

    cnf.ejecutarResSQL(SQL_BUSCAR_USUARIOS, [idUsuario], function (usuarios) {
        if (usuarios.length <= 0)
            return res.status(200).send({en: -1, m: 'No existen miembres registrados '});
        return res.status(200).send({en: 1, miembros: usuarios});
    }, res);
}

const SQL_BUSCAR_USUARIOS =
        "SELECT u.idUsuario,p.nombres,p.apellidos,p.email,p.imagen,p.telefono,u.usuario,u.calificacion,u.tiempo FROM bancodt.persona p INNER JOIN bancodt.usuario u ON u.id_persona = p.id_persona WHERE u.id_rol = 2 AND u.idUsuario <> ? AND idUsuario <> 1"
     
module.exports = router;