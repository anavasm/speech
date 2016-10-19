var express = require('express');
var router = express.Router();
var voices= require('../voices');

/* GET home page. */
router.get('/', function(req, res, next) {
  var text_to_speech=voices.get;
  var data=require('../public/js/data');
  //obtener lista de idiomas y renderizar vista
  voices.getVoices(function (languages){
    res.render('index', { title: 'Voice' , messages: data.messages,languages: languages});
  });
});

/* Función que obtiene el mensaje especificado de la lista */
function getMessage(id, messages)
{
  for(var i = 0; i < messages.length; i++)
  {
    if(messages[i].id == id)
    {
      return messages[i];
    }
  }
}

/* Genera el archivo de audio y lo guarda en la ruta especificada */
router.post('/', function(req, res){
  var fs = require('fs');
  var path = require('path');
  var fileName = path.join(__dirname, '../public/js/data.json');
  var file = require(fileName);
  var jsonData= req.body;

  var currentMessage=getMessage(jsonData.id, file.messages);
//actualizar mensaje e idioma
  currentMessage.message=jsonData.message;
  currentMessage.language=jsonData.language;

//obtener archivo de audio
var text_to_speech=voices.get;

var params = {
  text: jsonData.message,
  voice: jsonData.language,
  accept: 'audio/wav'
};

var audioFile= path.join(__dirname, '../public/audio/'+jsonData.id+'.wav');
// obtiene el texto sintetizado y lo guarda en un archivo
text_to_speech.synthesize(params).pipe(fs.createWriteStream(audioFile));
//modificar estado
currentMessage.status=2;
//guardamos la ruta del archivo
currentMessage.path=audioFile;
//guardar cambios en el archivo
  fs.writeFile(fileName, JSON.stringify(file, null, 4), function (err) {
    if (err)
    {
      res.json({'code':500, 'message':err});
    } else{
      res.json({'code':200, 'message': 'Save completed succesfully', 'path':jsonData.id});
    }

  });
});

module.exports = router;
