/* global _BD_, IP_SERVIDOR_NODE, _BDH_, MENSAJE_DEPRECATE */

var cnf = require('./config.js');
var router = require('express').Router();

router.post('/listar/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return listarDemandas(req, res);
    return res.status(320).send({m: 'versión'});
});


function listarDemandas(req, res) {
//    var idAdministrador = req.body.idAdministrador;
    var desde = req.body.desde;
    var cuantos = req.body.cuantos;
    var idUsuario = req.body.idUsuario;
    var misDemandas = req.body.misDemandas;

    if (!idUsuario)
        return res.status(400).send({en: -1, param: 'idUsuario'});
    if (!desde)
        return res.status(400).send({error: 1, param: 'desde'});
    if (!cuantos)
        return res.status(400).send({error: 1, param: 'cuantos'});
    var filtro = "and od.estado=1 having (numPostularon = 0 or isFavorito =1)  ";
    if (misDemandas && misDemandas == 1)
        filtro = "and u.idUsuario= " + idUsuario;


    var SQL_OFERTAS = "SELECT if((select count(*) from bancodt.favorito where idOfertaDemanda=od.idOfertasDemandas and idUsuario=? and estado=1 ) >0,1,0) as isFavorito,(select count(idOfertaDemanda) from favorito where idOfertaDemanda =od.idOfertasDemandas and estado=1) as numPostularon,  if(u.idUsuario=?,0,1) as pagar, od.idOfertasDemandas,od.fecha_creacion ,od.descripcion_actividad,od.titulo,u.idUsuario,u.calificacion, p.nombres, p.apellidos,c.idCategoria,c.categoria,p.email,p.imagen,p.telefono,od.estado FROM bancodt.ofertas_demandas od  inner join usuario u on od.id_ofertante = u.idUsuario inner join persona p on u.id_persona = p.id_persona inner join categoria c on c.idCategoria= od.idCategoria where od.tipo=2  " + filtro + " order by isFavorito desc,od.fecha_creacion  desc LIMIT ?, ?;";



    cnf.ejecutarResSQL(SQL_OFERTAS, [idUsuario, idUsuario, parseInt(desde), parseInt(cuantos)], function (movmientos) {
        if (movmientos.length <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos pero no se encuentran demandas registradas'});

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
    if (estado == 1)
        cnf.ejecutarResSQL(SQL_EXISTE, [idOfertaDemanda], function (antena) {
            if (antena.length > 0)
                return res.status(200).send({en: -1, m: 'Lo sentimos la demandaa ya fue aplicada'});
            cnf.ejecutarResSQL(SQL_INSERT_FAV, [idUsuario, idOfertaDemanda, estado, estado], function (ofertas_demandas) {
                console.log(ofertas_demandas);
                if (ofertas_demandas['affectedRows'] <= 0)
                    return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

                return res.status(200).send({en: 1, m: 'Registro realizado correctamente.'});
            }, res);
        }, res);
    else
        cnf.ejecutarResSQL(SQL_INSERT_FAV, [idUsuario, idOfertaDemanda, estado, estado], function (ofertas_demandas) {
            if (ofertas_demandas['affectedRows'] <= 0)
                return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

            return res.status(200).send({en: 1, m: 'Registro realizado correctamente'});
        }, res);

}
const SQL_EXISTE =
        "SELECT idUsuario FROM bancodt.favorito where idOfertaDemanda=? and estado = 1";

var SQL_INSERT_FAV = "INSERT INTO bancodt.favorito (idUsuario, idOfertaDemanda, estado) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE estado=?";

router.post('/registrar/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return registrarDemanda(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function registrarDemanda(req, res) {
    var descripcionActividad = req.body.descripcionActividad;
    var idCategoria = req.body.idCategoria;
    var idUsuario = req.body.idUsuario;
    var titulo = req.body.titulo;

    if (!descripcionActividad)
        return res.status(400).send({en: -1, param: 'descripcionActividad'});
    if (!titulo)
        return res.status(400).send({en: -1, param: 'titulo'});
    if (!idCategoria)
        return res.status(400).send({en: -1, param: 'idCategoria'});
    if (!idUsuario)
        return res.status(400).send({en: -1, param: 'idUsuario'});


    cnf.ejecutarResSQL(SQL_INSERT_DEMANDA, [descripcionActividad, idCategoria, idUsuario, titulo], function (ofertas_demandas) {
        if (ofertas_demandas['insertId'] <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

        return res.status(200).send({en: 1, m: 'Registro realizado correctamente'});
    }, res);
}

var SQL_INSERT_DEMANDA = "INSERT INTO bancodt.ofertas_demandas ( descripcion_actividad, idCategoria, id_ofertante, titulo,tipo) VALUES ( ?, ?, ?,?,2)";

router.post('/editar/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return actualizarTicket(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function actualizarTicket(req, res) {
    var descripcionActividad = req.body.descripcionActividad;
    var idCategoria = req.body.idCategoria;
    var titulo = req.body.titulo;
    var idOfertasDemandas = req.body.idOfertasDemandas;
    var estado = req.body.estado;



    if (!descripcionActividad)
        return res.status(400).send({en: -1, param: 'descripcionActividad'});
    if (!titulo)
        return res.status(400).send({en: -1, param: 'titulo'});
    if (!idCategoria)
        return res.status(400).send({en: -1, param: 'idCategoria'});
    if (!idOfertasDemandas)
        return res.status(400).send({en: -1, param: 'idOfertasDemandas'});
    if (!estado)
        return res.status(400).send({en: -1, param: 'estado'});


    cnf.ejecutarResSQL(SQL_UPDATE_ADICIONAL, [titulo, descripcionActividad, idCategoria, estado, idOfertasDemandas], function (movimiento) {
        if (movimiento['affectedRows'] <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

        return res.status(200).send({en: 1, m: 'Registro actualizado correctamente.'});

    }, res);


}

var SQL_UPDATE_ADICIONAL = "UPDATE bancodt.ofertas_demandas SET titulo=?, descripcion_actividad=?, idCategoria=?, estado=? WHERE idOfertasDemandas=? and tipo = 2;";

router.post('/quitar_postulante/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return quitarFavorito(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function quitarFavorito(req, res) {
    var idOfertaDemanda = req.body.idOfertaDemanda;
      if (!idOfertaDemanda)
        return res.status(400).send({en: -1, param: 'idOfertasDemandas'});



    if (!idOfertaDemanda)
        return res.status(400).send({en: -1, param: 'idOfertaDemanda'});
    cnf.ejecutarResSQL(SQL_QUITAR_FAV, [idOfertaDemanda], function (ofertas_demandas) {
        if (ofertas_demandas['affectedRows'] <= 0)
            return res.status(200).send({en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'});

        return res.status(200).send({en: 1, m: 'Registro realizado correctamente'});
    }, res);

}

var SQL_QUITAR_FAV = "UPDATE bancodt.favorito SET estado=0 WHERE idOfertaDemanda=?";


module.exports = router;
