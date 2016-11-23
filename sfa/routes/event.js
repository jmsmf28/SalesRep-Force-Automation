var express = require('express');
var router = express.Router();

/* GET ?id=eventoId. */
router.get('/', function(req, res, next) {
    res.render('event', {title: 'Evento', breadcrumb: 'Evento', id: req.query.id});
    console.log(req.query.id);
});

module.exports = router;
