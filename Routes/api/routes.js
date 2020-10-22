var express = require("express");
var router = express.Router();
router.get("/test", (req, res) => {
  res.status(200).send("Working Fine!");
});
module.exports = router;
