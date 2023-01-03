/* global _BD_, IP_SERVIDOR_NODE, _BDH_, MENSAJE_DEPRECATE */

var cnf = require('./config.js');
var router = require('express').Router();


/**
 * @api {post} /a/lugar/editar editar
 * @apiGroup A>ESPACIOS
 * @apiVersion 1.0.0 
 * 
 * @apiParam {int} idAdicionalProducto
 * @apiParam {int} idSucursal
 * @apiParam {String} adicional
 * @apiParam {String} descripcion
 * @apiParam {int} idAdministrador
 * 
 * @apiParam {String} auth
 * @apiParam {int} idPlataforma
 * @apiParam {String} imei
 * @apiParam {String} marca
 * @apiParam {String} modelo
 * @apiParam {String} so
 * @apiParam {String} vs
 * @apiParam {int} idAplicativo
 * 
 * @apiSuccess {json} json {en: 1, m: 'Adicional actualizado correctamente.'}
 * @apiSuccessExample Success-Response:
 *      Flujo normal de enventos.
 *        
 * @apiSuccess (Execpcional_1) {json} json {en: -1, m: 'Lo sentimos, por favor intenta de nuevo más tarde.'}
 * @apiSuccessExample Execpcional_1:
 *      Flujo alterno de eventos: 
 *        
 * @apiError {json} json {error: CODIGO_ERROR};
 * @apiErrorExample Error-Response:
 *      Los errores devuelve desde el estado de error -200 y menores
 */
router.post('/listar/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return listarCategorias(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function listarCategorias(req, res) {

    cnf.ejecutarResSQL(SQL_CATEGORIAS, [], function (lugar) {
        if (lugar.length <= 0)
            return res.status(200).send({en: -1, m: 'No Existen Categorias.'});
        return res.status(200).send({en: 1, t: lugar.length, ls: lugar});
    }, res);
}


const SQL_CATEGORIAS =
        "SELECT idCategoria,categoria,logo,descripcion FROM bancodt.categoria where idCategoria=0 or idCategoria in (SELECT idCategoria FROM bancodt.ofertas_demandas where tipo=1 and estado = 1 group by idCategoria)";

router.post('/listar-todas/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return listarCategoriasTodas(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function listarCategoriasTodas(req, res) {

    cnf.ejecutarResSQL(SQL_CATEGORIAS3, [], function (lugar) {
        if (lugar.length <= 0)
            return res.status(200).send({en: -1, m: 'No Existen Categorias.'});
        return res.status(200).send({en: 1, t: lugar.length, ls: lugar});
    }, res);
}


const SQL_CATEGORIAS3 =
        "SELECT idCategoria,categoria,logo,descripcion FROM bancodt.categoria where habilitado = 1 and idCategoria>0";

router.post('/listar_demandas/', function (req, res) {
    var version = req.headers.version;
    if (version === '1.0.0')
        return listarCategoriasDemandas(req, res);
    return res.status(320).send({m: MENSAJE_DEPRECATE});
});

function listarCategoriasDemandas(req, res) {

    cnf.ejecutarResSQL(SQL_CATEGORIAS2, [], function (lugar) {
        if (lugar.length <= 0)
            return res.status(200).send({en: -1, m: 'No Existen Categorias.'});
        return res.status(200).send({en: 1, t: lugar.length, ls: lugar});
    }, res);
}


const SQL_CATEGORIAS2 =
        "SELECT idCategoria,categoria,logo,descripcion FROM bancodt.categoria where idCategoria=0 or idCategoria in (SELECT idCategoria FROM bancodt.ofertas_demandas where tipo=2 and estado = 1 group by idCategoria)";

module.exports = router;
