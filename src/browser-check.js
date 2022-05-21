(function () {
  function throwMsg(s) { throw s; }

  function highlightVersion(agent, re, name, version) {
    agent = agent.replace(re, '$1<span style="font-weight: bold; color: magenta;">$2$3</span>$4')
      .replace(/\$[34]/g, '');

    return 'Your browser: ' + agent + '<br><br>\n' + name + ' version must be ' + version + ' or later';
  }

  var script = document.currentScript || document.querySelector('script[data-bc-vers]') ||
    document.querySelector('script[data-bc-min-es]') || document.querySelector('script[data-bc-globals]');
  var versionList = script.getAttribute('data-bc-vers');
  var args = versionList ? versionList.split(',').map(function (arg) { return parseFloat(arg); }) : [];
  var url = script.getAttribute('data-bc-fail-url');
  var minEsVers = parseInt(script.getAttribute('data-bc-min-es') || '0');
  var minVers = minEsVers;
  var globalsOpt = script.getAttribute('data-bc-globals');
  var globals = (globalsOpt === '' || /^1ty/i.test(globalsOpt || ''));
  var features = {};
  var featureCount = 0;
  var lastFeatureTested = '';
  var za = ['0', '0', '0'];
  var tb_bc_info = { browser: 'Unrecognized', version: null, es: 0, msg: '' };
  var featureList = script.getAttribute('data-bc-features');
  var re;

  (featureList ? featureList.split(',') : []).forEach(function (f) { ++featureCount; features[f.trim()] = true; });

  (function () {
    var ua = navigator.userAgent;
    var ieVersion = parseInt(((re = /(\bMSIE )(\d+)/).exec(ua) ||
                              (re = /(\bWindows NT\b.+\brv:0)(\d+)/).exec(ua) || za)[2]);

    if (/\b(Firefox|Chrome|HeadlessChrome)\b/.test(ua))
      ieVersion = 0;

    if (ieVersion) {
      tb_bc_info.browser = 'IE';
      tb_bc_info.version = ieVersion;

      if (args[0] === 0)
        tb_bc_info.msg = 'Internet Explorer is not supported';
      else if (ieVersion && args[0] > 0 && ieVersion < args[0])
        tb_bc_info.msg = highlightVersion(ua, re, 'Internet Explorer', args[0]);

      return;
    }

    var chromeVersion = parseInt(((re = /(\b(?:Headless)?Chrome\/)(\d+)([.\d]+)?/).exec(ua) || za)[2]);

    if (chromeVersion) {
      tb_bc_info.browser = 'Chrome';
      tb_bc_info.version = chromeVersion;

      if (args[1] === 0)
        tb_bc_info.msg = 'Chrome is not supported, nor related Chromium-derived browsers';
      else if (chromeVersion && args[1] > 0 && chromeVersion < args[1])
        tb_bc_info.msg = highlightVersion(ua, re, 'Chrome', args[1]);

      return;
    }

    var firefoxVersion = parseInt(((re = /(\bFirefox\/)(\d+)([.\d]+)?/).exec(ua) || za)[2]);

    if (firefoxVersion) {
      tb_bc_info.browser = 'Firefox';
      tb_bc_info.version = firefoxVersion;

      if (args[2] === 0)
        tb_bc_info.msg = 'Firefox is not supported';
      else if (firefoxVersion && args[2] > 0 && firefoxVersion < args[2])
        tb_bc_info.msg = highlightVersion(ua, re, 'Firefox', args[2]);

      return;
    }

    var safariVersion = parseFloat(((re = /(\bVersion\/)(\d+)(\.\d+)(.*\bSafari\/\d+)/).exec(ua) || za)[2]);

    if (safariVersion) {
      tb_bc_info.browser = 'Firefox';
      tb_bc_info.version = safariVersion;

      if (args[3] === 0)
        tb_bc_info.msg = 'Safari is not supported';
      else if (safariVersion && args[3] > 0 && safariVersion < args[3])
        tb_bc_info.msg = highlightVersion(ua, re, 'Safari', args[3]);
    }
  })();

  if (!tb_bc_info.msg || minEsVers || featureCount > 0) {
    function test(name) { lastFeatureTested = name; return features[name]; }

    try {
      (minVers || test('let')) && eval('let a = "a"; const b = 5');
      (minVers || test('arrow')) && eval('(y = 0) => -y');
      (minVers || test('for_of')) && eval(`for (a of [1, 2]) {}`);
      (minVers || test('map')) && eval(`new Map(); new Set();`);
      (minVers || test('class')) && eval(`class MyClass { constructor() {} }`);
      (minVers || test('promise')) && eval('new Promise(resolve => resolve()).catch()');
      (minVers || test('symbol')) && eval('Symbol("symbol")');
      (minVers || test('def_params')) && eval('function foo(a = 5) {}');
      (minVers || test('rest_param')) && eval('function foo(...a) {}');
      (minVers || test('string')) &&
        !(''.includes && ''.startsWith && ''.endsWith) && throwMsg('Missing string methods');
      (minVers || test('array')) &&
        !(Array.from && [].keys && [].find && [].findIndex) && throwMsg('Missing array methods');
      (minVers || test('template')) && eval('let a = 5; let b =`x${a}y`;');
      (minVers || test('ds')) && eval('const [x, y] = [1, 2]');

      if (minVers) { tb_bc_info.es = 2015; if (minVers === 2015) minVers = 0; }

      (minVers || test('exp')) && eval('let a = 2 ** 7;');
      (minVers || test('array2016')) && ![].includes && throwMsg('Missing array 2016 methods');

      if (minVers) { tb_bc_info.es = 2016; if (minVers === 2016) minVers = 0; }

      (minVers || test('string2017')) && !(''.padStart && ''.padEnd) && throwMsg('Missing string 2017 methods');
      (minVers || test('object')) && !(Object.entries && Object.values) && throwMsg('Missing Object methods');
      (minVers || test('async')) && eval('async function foo() {}');

      if (minVers) { tb_bc_info.es = 2017; if (minVers === 2017) minVers = 0; }

      (minVers || test('promise_finally')) && eval('new Promise(resolve => resolve()).finally()');
      (minVers || test('rest_prop')) && eval('let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };');
      (minVers || test('for_await')) && eval('async function foo() { for await (const a of []) {} }');
      (minVers || test('regex')) && eval(String.raw`/(?<=f)\p{L}+./su.test("foo\n")`);

      if (minVers) { tb_bc_info.es = 2018; if (minVers === 2018) minVers = 0; }

      (minVers || test('array2019')) && !([].flat && [].flatMap) && throwMsg('Missing array 2019 methods');
      (minVers || test('object2019')) && !(Object.fromEntries) && throwMsg('Missing Object 2019 methods');
      (minVers || test('string2019')) && !(''.trimStart && ''.trimEnd) && throwMsg('Missing string 2019 methods');
      (minVers || test('catch')) && !('try { var a = 5; } catch {}');

      if (minVers) { tb_bc_info.es = 2019; if (minVers === 2019) minVers = 0; }

      (minVers || test('null')) && !eval('null?.a; undefined ?? 7;');
      (minVers || test('bigint')) && eval('123n + 456n;');
      (minVers || test('all_settled')) && !Promise.allSettled && throwMsg('Missing Promise.allSettled');
      (minVers || test('global_this')) && globalThis !== window && throwMsg('Missing Promise.global_this');

      if (minVers) { tb_bc_info.es = 2020; if (minVers === 2021) minVers = 0; }

      (minVers || test('promise_any')) && !Promise.any && throwMsg('Missing Promise.any');
      (minVers || test('underscores')) && eval('let a = 123_456;');
      (minVers || test('logical')) && eval('let a = true; let b = false; b &&= a; b ||= a; b ??= a;');

      if (minVers) { tb_bc_info.es = 2021; if (minVers === 2021) minVers = 0; }

      (minVers || test('regex2020')) && eval(String.raw`/(\bB\b).*(\bD\b)/d.exec('A B C D E')`);
    }
    catch (e) {
      tb_bc_info.msg = tb_bc_info.msg || (lastFeatureTested ? 'Feature failed: ' + lastFeatureTested :
        e.message || e.toString());
    }
  }

  if (tb_bc_info.msg && url) {
    // Try to clear body and remove other scripts before forwarding to fail URL.
    try {
      document.body.innerHTML = '';

      var scripts = document.querySelectorAll('script');

      for (var i = 0; i < scripts.length; ++i) {
        if (scripts[i] !== script)
          script.remove();
      }
    }
    catch (e) {}

    location.href = url + '?msg=' + encodeURIComponent(tb_bc_info.msg);
  }
  else if (globals)
    window.tb_bc_info = tb_bc_info;
})();
