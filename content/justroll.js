var cm=new CommonMemory(),
_domain_ = 'surfe.be',
justroll = {
  state: 'loading',
  page: 'loading',
  token: null,
  version: '1_1_0',
  onfocus: false,
  infocus: true,
  progress: 0,
  track: false,
  animation: true,
  _d: null,
  tabId: 0,
  captcha_check: false,

  tpl: {
    t1: {
      "tag":"span",
      "id":"jr-adv-${id}",
      "class":"jr-adv jr-t1",
      "children":[
        {
          "tag":"i",
          "data-id":"${id}",
          "title":chrome.i18n.getMessage('blockBanner'),
          "html":"&times;"
        },
        {
          "tag":"a",
          "target":"_blank",
          "href":"\/\/surfe.be\/ext\/click?id=${id}",
          "html":"<img id=\"justroll-adv-img\" src=\"\/\/surfe.be\/ext\/banner?key=${key}\" \/>"
        }
      ]
    }
  },
  













  //
  init : function(token)
  {

    if(token)
      justroll.token = token;
    else if(justroll.token)
      token = justroll.token;
    else
    {
      chrome.storage.local.get("token", function(d) {
        if(d.token)
          justroll.init(d.token);
        else
          justroll.auth();
      });
      return;
    }

    if(!justroll.infocus)
      return;

    if(cm.get('justroll-disabled'))
    {
      if($('#justroll').length)
        $('#justroll').remove();
      return;
    }

    if($('#justroll-notify').length)
      return;

    // if($('#justroll-captcha').length)
    //   $('#justroll-captcha').remove();

    if($('#justroll-close_dialog').length)
      return;

    if( cm.get('justroll-noamin') )
      justroll.animation = false;

    justroll.ajax('//'+_domain_+'/ext/init',
      {token:token,href:btoa(location.href)},
      function(d){
        justroll._d = d;

        if(d.visits >= 0 && justroll.visits(d.visits))
          return;

        if(d.notify)
        {
          justroll.notify(d.notify.msg,d.notify.timeout);
          return;
        }

        if(d.adv)
        {
          justroll.panel(d);

          if( !justroll.track )
          {
            $('head').append('<script src="//static.surfe.be/js/net.js"></script>');
            justroll.track = true;
          }
        }

        if(d.error)
          justroll.error(d);

      });
  },















  // ask token
  auth : function(count)
  {
    justroll.ajax('//'+_domain_+'/ext/auth', {count:count},
      function(d){

        if(d.token)
        {
          chrome.storage.local.set(d);
          justroll.init(d.token);
        }

        if(d.error)
          justroll.error(d);


        if(d.notify)
          justroll.notify(d.notify.msg,d.notify.timeout);

    });
  },











  error : function (d) 
  {
    if(typeof d === 'string')
      d = {error:d}; 

    if(d.error === 'token_expired')
    {
      chrome.storage.local.remove('token');
      justroll.auth();
    }
    
    if(d.error === 'guest')
      justroll.guest();

    if(d.error === 'captcha')
      justroll.captcha(d);

    if(d.error === 'disallowed')
      $('#justroll').remove();

    if(d.error === 'break_onfocus' && justroll.onfocus)
    {
      clearTimeout(justroll.onfocus);
      justroll.onfocus = false;
    }
  },












  guest : function()
  {

    if($('#justroll-guest').length)
      return;

    $('body').append('<div id="justroll-guest" class="_hovered">\
        <p><i>'+chrome.i18n.getMessage('unauthMsg')+'</i></p>\
        <div id="justroll-panel-close" title="'+chrome.i18n.getMessage('hidePanel')+'">&times;</div>\
        <div id="justroll-btn-sign-in">'+chrome.i18n.getMessage('signin')+'</div>\
        <div id="justroll-btn-sign-up">'+chrome.i18n.getMessage('signup')+'</div>\
      </div>');

    $('#justroll-btn-sign-in').click(function(){
      window.open('https://surfe.be/login');
    });
    $('#justroll-btn-sign-up').click(function(){
      window.open('https://surfe.be/register');
    });
    $('#justroll-panel-close').click(function(){
      $('#justroll-guest').remove();
    });

    setTimeout(function(){$('#justroll-guest').removeClass('_hovered');},1000);
  },














  captcha : function(d)
  {
    justroll.notify('https://'+_domain_+'/ext/iframe/captcha',d.timeout || null);
  },










  close_dialog : function(m)
  {
    $('#justroll-close_dialog').remove();
    if(!m)
    {
      $('body').append('<div id="justroll-close_dialog" >\
        <div id="justroll-close_dialog-close" title="'+chrome.i18n.getMessage('hidePanel')+'">&times;</div>\
        <div class="jr-close_dialog-li" id="jr_cd-otw">'+chrome.i18n.getMessage('hidePanel_onthiswebsite')+'</div>\
        <div class="jr-close_dialog-li" id="jr_cd-otp">'+chrome.i18n.getMessage('hidePanel_onthiswebpage')+'</div>\
        <div class="jr-close_dialog-li" id="jr_cd-tt">'+chrome.i18n.getMessage('hidePanel_temporary')+'</div>\
      </div>');


      $('#jr_cd-otw').click(function(){
        justroll.bg({ajax:{
          adr: 'https://'+_domain_+'/ext/hide',
          args: {type:1,val:location.host}
        }});
        justroll.close_dialog('ok');
      });
      $('#jr_cd-otp').click(function(){
        justroll.bg({ajax:{
          adr: 'https://'+_domain_+'/ext/hide',
          args: {type:2,val:location.href}
        }});
        justroll.close_dialog('ok');
      });
      $('#jr_cd-tt').click(function(){
        justroll.close_dialog('temp');
      });
      $('#justroll-close_dialog-close').click(function(){
        $('#justroll-close_dialog').remove();
      });
    }

    if(m === 'temp')
    {
      $('body').append('<div id="justroll-close_dialog" >\
        <div id="justroll-close_dialog-close" title="'+chrome.i18n.getMessage('hidePanel')+'">&times;</div>\
        <div class="jr-close_dialog-li" id="jr_cd-tt_3h">'+chrome.i18n.getMessage('hidePanel_tt_3h')+'</div>\
        <div class="jr-close_dialog-li" id="jr_cd-tt_1h">'+chrome.i18n.getMessage('hidePanel_tt_1h')+'</div>\
        <div class="jr-close_dialog-li" id="jr_cd-tt_15m">'+chrome.i18n.getMessage('hidePanel_tt_15m')+'</div>\
      </div>');


      $('#jr_cd-tt_3h').click(function(){
        cm.set('justroll-disabled',1,3600*3);
        justroll.close_dialog('temp_ok');
      });
      $('#jr_cd-tt_1h').click(function(){
        cm.set('justroll-disabled',1,3600);
        justroll.close_dialog('temp_ok');
      });
      $('#jr_cd-tt_15m').click(function(){
        cm.set('justroll-disabled',1,900);
        justroll.close_dialog('temp_ok');
      });
      $('#justroll-close_dialog-close').click(function(){
        $('#justroll-close_dialog').remove();
      });
    }

    if(m === 'temp_ok')
    {
      $('body').append('<div id="justroll-close_dialog" >\
        <div>'+chrome.i18n.getMessage('hidePanel_temp_ok')+'</div>\
      </div>');

      setTimeout(function(){
        $('#justroll-close_dialog').remove();
      },6000);
    }

    if(m === 'ok')
    {
      $('body').append('<div id="justroll-close_dialog" >\
        <div class="jr-close_dialog-ok"></div>\
      </div>');

      setTimeout(function(){
        $('#justroll-close_dialog').remove();
      },2000);
    }
  },













  panel : function(d)
  {
    if($('#justroll-captcha').length)
      $('#justroll-captcha').remove();

    if( !d.adv || !d.adv.length )
      return;

    if(!$('#justroll').length)
    {
      var opened = cm.get('justroll-user-hider_opened'),
      panel_top = cm.get('justroll_top'),
      panel_class = panel_top ? 'jr_top':'jr_bottom';
      if( justroll.animation )
        panel_class += ' anim';

      $('body').append('<div id="justroll" class="'+panel_class+'">\
          <div id="justroll-panel-close" title="'+chrome.i18n.getMessage('hidePanel')+'">&times;</div>\
          <div id="justroll-panel-position" title="'+chrome.i18n.getMessage(panel_top?'panelbottom':'paneltop')+'">&#10095;</div>\
          <div id="justroll-panel-anim" title="'+chrome.i18n.getMessage(justroll.animation?'animoff':'animon')+'">FX</div>\
          <div id="justroll-user" '+(opened?'class="opened"':'')+' data-uid="'+d.user.uid+'">\
            <div id="justroll-user-balance">$ <span id="justroll-user-balance-target">'+d.user.balance.toFixed(7)+'<span></div>\
            <div id="justroll-logo"></div>\
            <div id="justroll-user-hider">'+(opened?'&lsaquo;':'&rsaquo;')+'</div>\
          </div>\
          <div id="justroll-adv"></div>\
          <div id="justroll-ver">v. '+justroll.version.replace(/_/g,'.')+'</div>\
        </div>');

      $('#justroll-panel-close').click(function(){
        justroll.error('break_onfocus');
        $('#justroll').remove();
        justroll.close_dialog();
      });
      $('#justroll-panel-position').click(function(){
        justroll.error('break_onfocus');
        var panel_top = !cm.get('justroll_top');
        cm.set('justroll_top',panel_top);
        $('#justroll-panel-position').attr('title',chrome.i18n.getMessage(panel_top?'panelbottom':'paneltop'));
        $('#justroll').removeAttr('class').addClass(panel_top?'jr_top':'jr_bottom');
        if( justroll.animation )
          $('#justroll').addClass('anim');
      });
      $('#justroll-panel-anim').click(function(){
        if( justroll.animation )
        {
          $('#justroll').removeClass('anim');
          cm.set('justroll-noamin',1,86400*30);
          $(this).attr('title',chrome.i18n.getMessage('animon'));
        }
        else
        {
          $('#justroll').addClass('anim');
          cm.remove('justroll-noamin');
          $(this).attr('title',chrome.i18n.getMessage('animoff'));
        }

        justroll.animation = !justroll.animation;
      });

      $('#justroll-user-balance').click(function(){
        window.open('//'+_domain_+'/login');
      });
      $('#justroll-logo').click(function(){
        window.open('//'+_domain_+'/login');
      });

      $('#justroll-user-hider').click(function(){
        justroll.error('break_onfocus');
        var o = $('#justroll-user').hasClass('opened');
        if(o)
        {
          $(this).html('&rsaquo;');
          $('#justroll-user').removeClass('opened');
          cm.remove('justroll-user-hider_opened');
        }
        else
        {
          $(this).html('&lsaquo;');
          $('#justroll-user').addClass('opened');
          cm.set('justroll-user-hider_opened',1);
        }
      });
    }
    else
    {
      $('.jr-adv').remove();
      // $('#justroll-minus-wrap').remove();
      // $('#justroll-plus-wrap').remove();

      if($('#justroll-user').hasClass('opened') && justroll.animation)
      {
        var ubal = new CountUp(
          'justroll-user-balance-target', 
          parseFloat($('#justroll-user-balance-target').text()), 
          d.user.balance.toFixed(7), 7, 2.5, {
          useEasing: true, 
          useGrouping: false, 
          separator: '', 
          decimal: '.'
        });
        if (!ubal.error) {
          ubal.start();
        } else {
          $('#justroll-user-balance-target').text(d.user.balance.toFixed(7));
          console.error(ubal.error);
        }
      }
      else
        $('#justroll-user-balance-target').text(d.user.balance.toFixed(7));
    }

    // if(d.adv.length > 1)
    //   $('#justroll-adv').prepend('<div id="justroll-minus-wrap"><div id="justroll-minus">&ndash;</div></div>');




    for( var i in d.adv )
    {
      var ad = d.adv[i];

      // if( $('#jr-adv-'+ad.bid).length )
      //   continue;

      if( ad.vip )
      {
        $('#justroll').addClass('vip');
      }

      var el = $('#justroll-adv').json2html(
        ad,
        ad.tpl ? ad.tpl : justroll.tpl['t'+ad.type],
        {'output':'jquery'}
      );

      if( ad.type === 0 )
        el.children('*:last-child')
        .attr('id','jr-adv-'+String( parseInt(ad.id) ) )
        .data('key',ad.key)
        .addClass('jr-adv jr-t'+ad.type);
      if( ad.type > 9 )
        el.children('*:last-child')
        .attr('id','jr-adv-'+ad.bid)
        .addClass('jr-script jr-t'+ad.type);
    }



    // if($('.jr-adv').length > d.user.banners)
    // {
    //   $('.jr-t0').remove();
    // }

    $('#justroll-adv span').each(function(){
      $(this).find('i').click(function(){
        var id = $(this).data('id');
        document.getElementById('jr-adv-'+id).remove();
        justroll.bg({ajax:{
          adr: 'https://'+_domain_+'/ext/hide',
          args: {type:3,val:id}
        }});
      });
    });

    // if(d.user.banners < 2)
    //   $('#justroll-adv').append('<div id="justroll-plus-wrap"><div id="justroll-plus">+</div></div>');

    

    var h = $('#justroll').height();
    $('#justroll-user-hider').css('line-height',h+'px');

    $('#justroll-plus,#justroll-user-banners span.jr-plus').click(function(){
      justroll.error('break_onfocus');
      justroll.auth(1);
    });

    $('#justroll-minus,#justroll-user-banners span.jr-minus').click(function(){
      justroll.error('break_onfocus');
      justroll.auth(-1);
    });

  },












  progressbar : function(v)
  {
    if( $('#justroll').length && !justroll.nanobar )
    {
      if(!$('#justroll-progressbar').length)
        $('#justroll').append('<div id="justroll-progressbar"></div>');

      justroll.nanobar = new Nanobar( {
        id : 'justroll-progressbar',
        className : 'justroll-progressbar',
        target : $('#justroll-progressbar')[0]
      } );
    }
    else if($('#justroll-adv').children('.jr-adv').length)
    {
      justroll.progress += 100/30*v;
      if(justroll.progress > 100)
        justroll.progress = 100;
      justroll.nanobar.go( justroll.progress );

      if(justroll.progress === 100)
      {
        justroll.progress = 0.1;
        justroll.init();
      }
    }
  },











  visits: function(cnt)
  {
    justroll.bg({visits:cnt});
    // если стало больше чем было
    // то показываем уведомление
    if(cm.get('visits_cnt') < cnt)
    {
      justroll.notify('<div style="margin:5px 0;font-size:16px;font-weight:bold">'+
        chrome.i18n.getMessage('visitsAvailable')+
        '</div><span style="font-size:12px">'+
        chrome.i18n.getMessage('visitsClick')+'</span>',10000);
      cm.set('visits_cnt',cnt,21600);
      return true;
    }
    cm.set('visits_cnt',cnt,21600);

  },










  notify : function(msg, autoclose)
  {
    if( autoclose === null )
      autoclose = 30000;

    if($('#justroll').length)
      $('#justroll').remove();

    if(msg.substr(0,4) === 'http')
      msg = '<iframe class="justroll-notify-msg" src="'+msg+'" frameborder="0" allowfullscreen="" noscroll=""></iframe>'
    else
      msg = '<div class="justroll-notify-msg">'+msg+'</div>';

    if($('#justroll-notify').length)
      $('.justroll-notify-msg').replaceWith(msg);
    else
    {
      $('body').append('<div id="justroll-notify">\
          <div id="justroll-notify-logo"></div>\
          <div id="justroll-notify-close">&times;</div>\
          '+msg+'\
        </div>');

      $('#justroll-notify-close').click(function(){
        $('#justroll-notify').removeClass('show');
        setTimeout(function(){
          $('#justroll-notify').remove();
          if(justroll._d)
            justroll.panel(justroll._d);
        },500);
      });

      setTimeout(function(){
        $('#justroll-notify').addClass('show');
      },500);
    }

    if( autoclose )
      setTimeout(function(){
        $('#justroll-notify-close').click();
      },autoclose);


  },







  // отправка данных в bg.js
  bg: function (msg)
  {
    chrome.runtime.sendMessage(msg);
  },










  
  ajax : function (adr, args, handl, errf) 
  {
    var oXmlHttp = new XMLHttpRequest();
    
    if(/\?/.test(adr))adr += '&ver='+justroll.version;
    else adr += '?ver='+justroll.version;

    $.ajax({
       url: adr,
       method: 'POST',
       data: args,
       xhrFields: {
          withCredentials: true
       },
    }).done(function(d){
      try{d=JSON.parse(d)}catch(e){}
      handl(d);
    }).fail(function(d){
      try{d=JSON.parse(d)}catch(e){}
      errf(d);
    })
    .setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  }
};



cm.set('version',justroll.version,86400*7);







chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  
  if(request.token)
    justroll.token = request.token;

  if(request.ext_init)
    justroll.init();

  if(request.notify)
    justroll.notify(request.notify.msg,request.notify.autoclose);

  if(request.ping)
    sendResponse({pong:1});

  if(request.captcha_check)
  {
    if( justroll.captcha_check === false )
    {
      justroll.captcha_check = 0;
      var p = document.createElement("iframe");
      p.style = 'position:absolute;left:-9999px;width:1px;height:1px;';
      p.src = 'https://captcha.surfe.be';
      document.body.appendChild(p);
    }
    else
      sendResponse({ok:justroll.captcha_check});
    
  }

});
chrome.storage.onChanged.addListener(function(changes) {
  if(changes.token) justroll.token = changes.token.newValue;
});





window.addEventListener('blur', function(e){
  justroll.infocus = false;
});

window.addEventListener('focus', function(e){
  justroll.infocus = true;
  justroll.animation = !cm.get('justroll-noamin');
  if( justroll.animation )
  {
    $('#justroll').addClass('anim');
    $('#justroll-panel-anim').attr('title',chrome.i18n.getMessage('animoff'));    
  }
  else
  {
    $('#justroll').removeClass('anim');
    $('#justroll-panel-anim').attr('title',chrome.i18n.getMessage('animon'));
  }
  // justroll.onfocus = setTimeout(function(){
  //   justroll.init();
  //   justroll.onfocus = false;
  // },500);
});


window.addEventListener("message", function(e)
{

  if (e["data"]["data"] && e["data"]["event"]) {

    var taskCallbacks = e["data"]["event"];
    var data = e["data"]["data"];

    if (void 0 !== data["stream"] ) {

      if ("data_loaded" === taskCallbacks) {
        if(data.result)
          $('#justroll-adv').append('<div class="js-adv" style="display:none"><img src="//surfe.be/ext/banner?key='+$('#jr-adv-1').data('key')+'"/></div>');
        else
          $('.jr-t0').remove();
      } else {
        if ("click_action" === taskCallbacks) {
          $('#justroll-adv').append('<div class="js-adv" style="display:none"><img src="//surfe.be/ext/click?id=1"/></div>');
          // console.log('click',data);
        }
      }
    }

  }
  
  if(e.data === 'captcha_check')
    justroll.captcha_check = 1;

  if( !e.data || e.data.target !== _domain_)
    return;

  if(e.data.cmd === 'auth')
  {
    setTimeout(function(){
      justroll.auth();
    },3000);
  }
  if(e.data.cmd === 'ntf_close')
  {
    setTimeout(function(){
      $('#justroll-notify-close').click();
    },1500);
  }

}, false);



$(function(){

  if(window.location.host === _domain_ && $('#notify_ext_install').length)
    $('#notify_ext_install').remove();

  if(location.host === _domain_ && location.pathname === '/loader.html')
    return;

  chrome.runtime.sendMessage({getTask:1}, function(resp) {

    if( resp.task )
      return;

    chrome.storage.local.get("token", function(d) {
      if(d.token)
        justroll.init(d.token);
      else
        justroll.auth();
    });

  });
  
  ifvisible.setIdleDuration(35);
  var interval = ifvisible.onEvery(1, function() {
    if(justroll.infocus)
      justroll.progressbar(1);
  });

});
