var express = require('express');
var router = express.Router();

/* GET ?id=clienteID. */
router.get('/', function(req, res, next) {
  res.render('customer', {title: 'Cliente', breadcrumb: 'Cliente', customerId: req.query.id});
});

module.exports = router;