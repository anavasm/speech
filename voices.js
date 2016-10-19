var watson = require('watson-developer-cloud');
var text_to_speech = watson.text_to_speech({
  username: '{username}', //nombre de usuario de la API watson
  password: '{password}', //contraseña de la API
  version: 'v1'
});

//objeto text_to_speech
exports.get=text_to_speech;

//función que devuelte una lista de todos los idiomas disponibles
exports.getVoices= function getVoices(callback)
{
  var availableVoices={};
  text_to_speech.voices(null, function(error, voices) {
    if (error)
    {
      console.log('error:', error);
    }
    else
    {
        for (var i=0; i<voices.voices.length;i++)
        {
          var voice=voices.voices[i];
          var name=voice.name;
          var description=voice.language+' ('+voice.gender+'). '+voice.description;
          availableVoices[name]=description;
        }

    }
    callback(availableVoices);
  });
}
