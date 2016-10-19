var appInitialized= false;
// Initialize your app
var myApp = new Framework7({
   material: true,
   onAjaxStart: function(xhr) {
      myApp.showIndicator();
    },
    onAjaxComplete: function(xhr) {
      myApp.hideIndicator();
    }
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    //dynamicNavbar: true
});

/*
// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    $$('.create-page').on('click', function () {
        createContentPage();
    });
});

*/

myApp.onPageInit('index', function (page) {
  var numErrors=0;

  $$('.btnDownload').on('click',function(){
    var id=$$(this).data('id');
    var message=document.getElementById('mmessage'+id).value;
    if (message===null || message==='')
    {
        $$('#mmessage'+id).focus();
        return;
    }

    var language=document.getElementById('lmessage'+id).value;
    myApp.showIndicator();
    var formData = {'id':id, 'message':message, 'language':language};

    updateStatus(1, '#emessage'+id, '.emessage'+id);

    Dom7.post('/', formData, function (data) {
      var jsonData=JSON.parse(data);
      myApp.hideIndicator();
      if (jsonData.code==200)
      {
        showNotification(jsonData.message);

        var playBtn='#pmessage'+id;
        updateStatus(2, '#emessage'+id, '.emessage'+id);

        $$(playBtn).data('id',jsonData.id);
        $$(playBtn).removeAttr('disabled');
      }else{
        showNotification('Error. '+jsonData.message);
        updateStatus(0, '#emessage'+id, '.emessage'+id);
      }

    });
  });

  $$('.btnPlay').on('touchend', function(){
    numErrors=0;
    var file=$$(this).data('id');
    resetBtnPlay();

    var player=document.getElementById('player');

    var fileNameIndex = player.src.lastIndexOf("/") + 1;
    var fileName = player.src.substr(fileNameIndex);

    try{
      if (fileName!=file+'.wav')
      {
          player.src='../audio/'+file+'.wav?cb=' + new Date().getTime();
      }

      if (player.paused)
      {
          player.load();
          $$(this).html('Playing ...');
          $$(this).addClass('playing');

          player.play();

      }else{
          player.pause();
      }

    }catch(e){
      console.log(e.err());
    }

    //FIX para IOS. En dispositivos IOS no funciona el evento onError. Asi que se reinicia el botón play manualmente pasado unos segundos.
    if (myApp.device.ios)
    {
      resetPlay();
    }

  });

  $$('#player').on('error', function(e){
    //evita que se muestre más de un error a la vez
    if (numErrors==0)
    {
        showError('File not found');
        numErrors++;
    }

  });

  $$('#player').on('pause', function(){
    resetBtnPlay();
  });

  $$('.inputMessage').on('input',function(){
    var id=$$(this).data('id');
    updateStatus(3, '#emessage'+id, '.emessage'+id);
  });


}).trigger();

myApp.onPageInit('settings', function (page) {

  if ($$('#numMessages').val()!='')
  {
    $$('#btnSettings').removeClass('disabled');
  }else{

    $$('#btnSettings').addClass('disabled');
  }

  $$('#numMessages').on('input', function(){
    if ($$(this).val()!='')
    {
      $$('#btnSettings').removeClass('disabled');
    }else{

      $$('#btnSettings').addClass('disabled');
    }

  });

  $$('#btnSettings').on('click',function(){
    myApp.confirm('Are you sure?', 'Confirm', function () {
      //confirmado
      myApp.showIndicator();
      var formData = myApp.formToJSON('#settingsForm');
      Dom7.post('settings', formData, function (data) {
        var jsonData=JSON.parse(data);
        myApp.hideIndicator();
        if (jsonData.code==200)
        {
          showNotification(jsonData.message);
          mainView.router.loadPage('/');
        }else if (jsonData.code===400){
          myApp.alert(jsonData.message, 'Error');
        }else{
          showNotification('Error. '+jsonData.message);
        }

      });
    });
  });

});


function showNotification(message)
{
  var flash=myApp.addNotification({
        message: message,
        button: {
          text: 'Close',
          color: 'amber'
        }
   });

  setTimeout(function () {
      myApp.closeNotification(flash);
  }, 3000);
}

function showError(error)
{
  var flash=myApp.addNotification({
        message: error,
        button: {
            text: 'Close',
            color: 'red'
        }
   });

  setTimeout(function () {
      myApp.closeNotification(flash);
  }, 4000);
}

function updateStatus(status, item, icon)
{
  switch (status){
    case 0:$$(icon).removeClass('color-blue color-green color-orange');$$(icon).addClass('color-red');$$(item).find('span').html('Not available');break;
    case 1:$$(icon).removeClass('color-red color-green color-orange');$$(icon).addClass('color-blue');$$(item).find('span').html('In progress');break;
    case 2:$$(icon).removeClass('color-blue color-red color-orange');$$(icon).addClass('color-green');$$(item).find('span').html('Completed');break;
    case 3:$$(icon).removeClass('color-blue color-red color-green');$$(icon).addClass('color-orange');$$(item).find('span').html('Changed message');break;
  }

}

function resetPlay()
{
  var cont=0;
  var resetInterval=setInterval(function(){
    if (cont>2)
    {
      resetBtnPlay();
      clearInterval(resetInterval);
      cont=0;
    }
    cont++;
  },750);
}

function resetBtnPlay()
{
  $$('.playing').html('<i class="icon ion-play" style="margin-right:10px"></i> PLAY');
  $$('.playing').removeClass('playing');
}
