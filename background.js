var cm = new CommonMemory, task = null, visit_status = 0, visit_retry = 0;
// var domain = chrome.runtime.id === 'manjolceoachljppbjhfgkoomnlidkna' ? 'surfe.be' : 'dev.surfe.be';
var domain = 'surfe.be';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

  console.log(request);

  if('reset' in request)
  {
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    alert(chrome.i18n.getMessage('extWasReseted'));
  }
  


  if('icon' in request)
  {
    chrome.browserAction.setIcon({path:request.icon});
  }



  if('visits' in request && request.visits >= 0)
  {
    // если больше 0
    // то устанавливаем бейдж с кол-вом на красном фоне
    // иначе удаляем бейдж
    var cnt = request.visits;
    if(cnt > 0)
      setBadge(cnt,'#d00');
    else
      setBadge("");
  }


  if('getTask' in request)
    sendResponse({task:task});



  if('visit_start' in request)
  {
    // создаем вкладку с ключем в параметрах
    chrome.tabs.create({
      url:'https://'+domain+'/loader.html?vsid='+request.visit_start
    });
    
  }
  


  if('ext_init' in request)
  {
    cm.remove('justroll-disabled');
    sendResponse({reload:1});
  }


  if('ajax' in request)
  {
    if('args' in request.ajax && 'handl' in request.ajax && 'errf' in request.ajax)
      ajax(request.ajax.adr,request.ajax.args,request.ajax.handl,request.ajax.errf);
    else if('args' in request.ajax && 'handl' in request.ajax)
      ajax(request.ajax.adr,request.ajax.args,request.ajax.handl);
    else if('args' in request.ajax)
      ajax(request.ajax.adr,request.ajax.args);
    else 
      ajax(request.ajax.adr);
  }

});



chrome.webNavigation.onCompleted.addListener(function(e){

  var link = parseURL(e.url);

  if(link.host == domain && link.search.vsid)
    visitStart(link.search.vsid, e.tabId);

});



chrome.webNavigation.onBeforeNavigate.addListener(function(nav){

  if(task && task.start == false && nav.frameId == 0)
  {
    var navurl = parseURL(nav.url);
    var taskurl = parseURL(task.url);
    
    if(navurl.host == taskurl.host)
    {
      task.start = true;
      task.client = false;
       //сохранение в обратно
    }
  }

  if(task && task.captcha === 2)
  {
    task.captcha = 1;
    if( !task.timer )
      task.timer = 3;
  }
});



chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({
          url: 'https://'+domain+'/goal_installed'
        });
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});
chrome.runtime.setUninstallURL('https://'+domain+'/goal_uninstalled');


setBadge("");
taskTimer();








function visitStart(hash, tabId)
{
  visit_status = 0;
  ajax('https://'+domain+'/ext/visit?state=0&hash='+hash,null,function(d){
    d = JSON.parse(d);
    if(d.error)
    {
      alert(d.error_msg);
      chrome.tabs.remove(tabId);
      return;
    }
    else
    {
      var ltime = (new Date()).valueOf();
      
      task = new Object();
      
      task.start = false;
      task.client = false;
      task.key = d.key;
      task.url = d.url;
      task.timer = d.time;
      task.captcha = d.captcha;
      task.tabId = tabId;
      task.stime = parseInt(ltime/1000);
      task.ttl = d.ttl
      
      chrome.tabs.update(tabId, {url: task.url});
      return;
    }
    close();
  },close);

  function close()
  {
      alert(chrome.i18n.getMessage('InternalError'));
      chrome.tabs.remove(tabId);
  }

}



function taskTimer()
{
  var time = (new Date()).valueOf();

  
  if(task && task.start == true)
    chrome.tabs.get(task.tabId, function(tab)
    {

      if( chrome.runtime.lastError )
      {
        onVisitFinish();
        // Отправляем уведомление вы ушли с вкладки
        alert(chrome.i18n.getMessage('visitClosed'));
        return;
      }
      
      if( typeof tab === "object" )
      {
        var tid = tab.id;

        if( task.timer < 3 && !task.client )
        {
          chrome.tabs.sendMessage(tid,{ping:1},function(resp){
            if( resp && resp.pong )
              task.client = true;
          });
        }

        if( task.captcha === 1 )
        {
          chrome.tabs.sendMessage(tid,{captcha_check:1},function(resp){
            if( resp && resp.ok > 0 )
              task.captcha = 2;
          });
        }

        if(task.timer <= 0)
        {
          // если клиентский скрипт вообще не ответил 
          // или если пробная капча на клиенте не заргузилась
          if( !task.client || task.captcha === 1 )
            chrome.tabs.update(task.tabId, {
              url: 'https://'+domain+'/loader.html'
            }, function(){
              task.captcha = 2;
              setTimeout(function(){
                visitDone(tid);
              },1000);
            });
          else
            visitDone(tid);
        }
        else
        {
          chrome.windows.get(tab.windowId, function (response)
          {
            if(response.focused == true && tab.active == true)
            {
              task.timer--;
              setBadge(task.timer, "#0af");

              chrome.tabs.sendMessage(tid,{
                notify: {
                  msg: chrome.i18n.getMessage('visitDontClose')+task.timer+chrome.i18n.getMessage('sec'),
                  autoclose: false
                }
              });
            }
            else
            {
              setBadge(task.timer, "#FA0");
            }
          });
        }
        
      }
      
    });
      
  timer_check = setTimeout(function() { taskTimer(); }, 1000);
}

function visitDone(tid)
{
  if(visit_status !== 0)
    return;

  visit_status = 1; // sending final request

  // сообщение о завершении задания
  chrome.tabs.sendMessage(tid,{
    notify: {
      msg: chrome.i18n.getMessage('visitDoneLoading'),
      autoclose: false
    }
  });

  ajax('https://'+domain+'/ext/visit?state=1&hash='+task.key,null,function(d)
  {
    try {
      d = JSON.parse(d);
    }catch(e){
      console.error('JSON parsing error',e);
      onError();
      return;
    }
    

    if(d.error)
    {
      alert(d.error_msg);
      chrome.tabs.remove(task.tabId);
    }
    else
    {
      chrome.tabs.sendMessage(task.tabId,{
        notify: {
          msg: d.msg,
          autoclose: d.autoclose
        }
      });
    }
    
    onVisitFinish();

  },onError);



  function onError()
  {
    setTimeout(function(){
      visit_status = 0;
    },2000 * ++visit_retry)

    console.error(chrome.i18n.getMessage('connectionErrorRetry'));
    
    chrome.tabs.sendMessage(task.tabId,{
        notify: {
          msg: chrome.i18n.getMessage('connectionErrorRetry'),
          autoclose: false
        }
    });
  }

}

function onVisitFinish()
{
  task = null;
  visit_retry = 0;

  var visits_cnt = cm.get('visits_cnt');
  if( visits_cnt !== null && visits_cnt > 1 )
  {
    cm.set('visits_cnt',visits_cnt-1,21600);
    setBadge(visits_cnt-1, '#d00');
  }
  else
    setBadge('');

}


function setBadge(a, b)
{
  chrome.browserAction.setBadgeText({"text": a.toString()});
  chrome.browserAction.setBadgeBackgroundColor({"color": b ? b : "#000"});
}

function ajax(adr, args, handl, errf) 
{
  var oXmlHttp = createXMLHttp();

  oXmlHttp.open("POST", adr, true);
  oXmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  oXmlHttp.timeout = 10000;
  oXmlHttp.ontimeout = function (e) {
    errf(e);
  };

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

function parseURL(url)
{
    var parser = document.createElement('a'), searchObject = {}, queries, split, i;
    parser.href = url;
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ )
  {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
  var newhost = parser.host.split('.');
  if(in_array("www", newhost))
  {
    if(newhost.length >= 3)
    {
      var domain = parser.host.split('www.');
      parser.host = domain[1];
    }
  }
  return {
        url: parser.protocol + '//' + parser.host + parser.pathname + parser.search + parser.hash,
    host: parser.hostname,
    search: searchObject,
    }
}

function in_array(needle, haystack, strict)
{
  var found = false, key, strict = !!strict;
  for (key in haystack) {
    if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
      found = true;
      break;
    }
  }
  return found;
}




