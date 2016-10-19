var express = require('express');
var router = express.Router();
var voices= require('../voices');

/* GET home page. */
router.get('/', function(req, res, next) {
  var data=require('../public/js/data');

  //obtener lista de idiomas y renderizar vista
  voices.getVoices(function (languages){
    res.render('settings', { title: 'Settings' , num_messages:data.num_messages, main_language:data.main_language , languages: languages});
  });

});

router.post('/', function(req, res){
  var fs = require('fs');
  var path = require('path');
  var fileName = path.join(__dirname, '../public/js/data.json');
  var file = require(fileName);
  var jsonData= req.body;
  //modificar datos
  var totalFloors=parseInt(jsonData.numMessages);

  var mainLanguage=jsonData.mainLanguage;


  if (totalFloors>0)
  {
    file.num_messages=totalFloors;
    file.main_language=mainLanguage;

    file.messages=[];
    for(var i=1; i<=totalFloors;i++)
    {

      file.messages.push({
          "id":i,
          "message":"",
          "language": mainLanguage,
          "status":0,
          "path":""
      });
    }


    fs.writeFile(fileName, JSON.stringify(file, null, 4), function (err) {
      if (err)
      {
        res.json({'code':500, 'message':err});
      } else{
        res.json({'code':200, 'message': 'Save completed succesfully'});
      }

    });
  }else{
    res.json({'code':400, 'message':'Invalid number of messages.'});
  }


});

module.exports = router;
