/* global _BD_, IP_SERVIDOR_NODE, _BDH_, MENSAJE_DEPRECATE */

var cnf = require('./config.js');
var router = require('express').Router();

router.post('/listar/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return listarOfertas(req, res);
    return res.status(320).send({m: 'versión'});
});


function listarOfertas(req, res) {
//    var idAdministrador = req.body.idAdministrador;
    var desde = req.body.desde;
    var cuantos = req.body.cuantos;
    var idUsuario = req.body.idUsuario;
    var misOfertas = req.body.misOfertas;

    if (!idUsuario)
        return res.status(400).send({en: -1, param: 'idUsuario'});
    if (!desde)
        return res.status(400).send({error: 1, param: 'desde'});
    if (!cuantos)
        return res.status(400).send({error: 1, param: 'cuantos'});
    var filtro="and od.estado=1";
    if (misOfertas && misOfertas==1)
        filtro = "and u.idUsuario= "+idUsuario;


    var SQL_OFERTAS = "SELECT if((select count(*) from bancodt.favorito where idOfertaDemanda=od.idOfertasDemandas and idUsuario=? and estado=1 ) >0,1,0) as isFavorito,(select count(idOfertaDemanda) from favorito where idOfertaDemanda =od.idOfertasDemandas and estado=1) as numPostularon, if(u.idUsuario=?,0,1) as pagar, od.idOfertasDemandas,od.fecha_creacion ,od.descripcion_actividad,od.titulo,u.idUsuario,u.calificacion, p.nombres, p.apellidos,c.idCategoria,c.categoria,p.email,p.imagen,p.telefono,od.estado FROM bancodt.ofertas_demandas od  inner join usuario u on od.id_ofertante = u.idUsuario inner join persona p on u.id_persona = p.id_persona inner join categoria c on c.idCategoria= od.idCategoria  where od.tipo=1 "+filtro+" order by isFavorito desc,od.fecha_creacion  desc LIMIT ?, ?;";



    cnf.ejecutarResSQL(SQL_OFERTAS, [idUsuario,idUsuario,parseInt(desde), parseInt(cuantos)], function (movmientos) {
        if (movmientos.length <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos pero no se encuentran ofertas registradas'});

        return res.status(200).send({en: 1, lM: movmientos});
    }, res);


}
router.post('/reg-favorito/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return registrarFavorito(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function registrarFavorito(req, res) {
    var idOfertaDemanda = req.body.idOfertaDemanda;
    var idUsuario = req.body.idUsuario;
    var estado = req.body.estado;



    if (!idOfertaDemanda)
        return res.status(400).send({en: -1, param: 'idOfertaDemanda'});
    if (!idUsuario)
        return res.status(400).send({en: -1, param: 'idUsuario'});
    if (!estado)
        return res.status(400).send({en: -1, param: 'estado'});


    cnf.ejecutarResSQL(SQL_INSERT_TICKET, [idUsuario,idOfertaDemanda,estado,estado ], function (ofertas_demandas) {
        if (ofertas_demandas['affectedRows'] <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

        return res.status(200).send({en: 1, m: 'Registro realizado correctamente'});
    }, res);
}

var SQL_INSERT_TICKET = "INSERT INTO bancodt.favorito (idUsuario, idOfertaDemanda, estado) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE estado=?";

router.post('/listar-aplicaron/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return listarAplicaron(req, res);
    return res.status(320).send({m: 'versión'});
});


function listarAplicaron(req, res) {
    var idOfertasDemandas = req.body.idOfertasDemandas;

    if (!idOfertasDemandas)
        return res.status(400).send({en: -1, param: 'idOfertasDemandas'});
    


    var SQL_APLICARON = "select p.nombres,p.apellidos,p.telefono,p.email,p.imagen,u.idUsuario from favorito f inner join bancodt.usuario u on u.idUsuario=f.idUsuario inner join bancodt.persona p on p.id_persona=u.id_persona where idOfertaDemanda = ? and estado=1;";



    cnf.ejecutarResSQL(SQL_APLICARON, [idOfertasDemandas], function (movmientos) {
        if (movmientos.length <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos pero no se encuentran postulantes'});

        return res.status(200).send({en: 1, lM: movmientos});
    }, res);


}
module.exports = router;
