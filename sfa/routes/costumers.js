var express = require('express');
var router = express.Router();

/* GET. */
router.get('/', function(req, res, next) {
  res.render('costumers', {title: 'Clientes', breadcrum: 'Clientes'});
});

module.exports = router;