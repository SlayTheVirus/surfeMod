var cm = new CommonMemory;

var popup = {



	init: function()
	{
    popup.resize();

		$('.pointer').on('click',function(){
			var href = $(this).data('href');
			if(href)
				window.open(href);
		});


		if( cm.get('justroll-disabled') )
		{
      $('.dblock.visit').remove();
			$('.logo').after('<div class="dblock warning"><div class="col-4 tac"><div class="icon"></div></div>\
<div class="col-8"><div class="mb-10">'+chrome.i18n.getMessage('adServingDisabled')+'</div><span class="link btn" data-ext_init="1">'+chrome.i18n.getMessage('enable')+'</span></div></div>');
			$('.rise').removeClass('rise');
			$('.deep').removeClass('deep');
		}


    $('.btn').unbind( "click" );
		$('.btn').on('click',function(){
			popup.bg($(this).data());
		});
		$('.version').text('v. '+cm.get('version').replace(/_/g,'.'));

    if($('#badge').length)
      popup.bg({ 
        visits : parseInt($('#badge').data('value'))
      });
	},



	resize: function() 
	{
    var h = $('#main').height();
    if(h > 600)
    {
      $("body").css('height','600px').mCustomScrollbar({
        theme:'minimal',
        scrollInertia: 100
      });
    }
    else
      $("body").css('height',h+'px');

    
	},




	bg: function(msg)
	{
		chrome.runtime.sendMessage(msg, function(response) {
			if( response.reload )
				load();
		});
	}



};






$('.btn').on('click',function(){
	popup.bg($(this).data());
});



$('.settings .btn').text(chrome.i18n.getMessage('extReset'));
setTimeout(function(){
	$('.version').text('v. '+cm.get('version').replace(/_/g,'.'));
},100);



function load(){
  // var domain = chrome.runtime.id === 'manjolceoachljppbjhfgkoomnlidkna' ? 'surfe.be' : 'dev.surfe.be';
  var domain = 'surfe.be';
	ajax('https://'+domain+'/ext/popup',null,function(d){
    $('.version,.settings').remove();
		$('#main').html(d);
		popup.init();
	});
}
load();




function ajax(adr, args, handl, errf) 
{
  var oXmlHttp = createXMLHttp();

  oXmlHttp.open("POST", adr, true);
  oXmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  oXmlHttp.onreadystatechange = function() {
    if(oXmlHttp.readyState == 4) {
      if(oXmlHttp.status == 200) {
        handl(oXmlHttp.responseText);
      }
      else {
        errf(oXmlHttp.statusText);
      }
      delete oXmlHttp;
    }
  };
  if(typeof args == 'object'){
    var _args = [];
    for(var n in args){
      _args.push(n+'='+encodeURIComponent(args[n]));
    }
    args = _args.join('&');
  }

  oXmlHttp.send(args);
  function createXMLHttp() {
    if(typeof XMLHttpRequest != "undefined") { 
      return new XMLHttpRequest();
    }
    else if(window.ActiveXObject) { 
      var aVersions = ["MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0",
      "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp",
      "Microsoft.XMLHttp"];
      for (var i = 0; i < aVersions.length; i++) {
        try { //
          var oXmlHttp = new ActiveXObject(aVersions[i]);
          return oXmlHttp;
        } catch (oError) {}
      }
    }
  }
}