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
      (test('let') || minVers) && eval('let a = "a"; const b = 5');
      (test('arrow') || minVers) && eval('(y = 0) => -y');
      (test('for_of') || minVers) && eval(`for (a of [1, 2]) {}`);
      (test('map') || minVers) && eval(`new Map(); new Set();`);
      (test('class') || minVers) && eval(`class MyClass { constructor() {} }`);
      (test('promise') || minVers) && eval('new Promise(resolve => resolve()).catch()');
      (test('symbol') || minVers) && eval('Symbol("symbol")');
      (test('def_params') || minVers) && eval('function foo(a = 5) {}');
      (test('rest_param') || minVers) && eval('function foo(...a) {}');
      (test('string') || minVers) &&
        !(''.includes && ''.startsWith && ''.endsWith) && throwMsg('Missing string methods');
      (test('array') || minVers) &&
        !(Array.from && [].keys && [].find && [].findIndex) && throwMsg('Missing array methods');
      (test('template') || minVers) && eval('let a = 5; let b =`x${a}y`;');
      (test('ds') || minVers) && eval('const [x, y] = [1, 2]');

      if (minVers) { tb_bc_info.es = 2015; if (minVers === 2015) minVers = 0; }

      (test('exp') || minVers) && eval('let a = 2 ** 7;');
      (test('array2016') || minVers) && ![].includes && throwMsg('Missing array 2016 methods');

      if (minVers) { tb_bc_info.es = 2016; if (minVers === 2016) minVers = 0; }

      (test('string2017') || minVers) && !(''.padStart && ''.padEnd) && throwMsg('Missing string 2017 methods');
      (test('object') || minVers) && !(Object.entries && Object.values) && throwMsg('Missing Object methods');
      (test('async') || minVers) && eval('async function foo() {}');

      if (minVers) { tb_bc_info.es = 2017; if (minVers === 2017) minVers = 0; }

      (test('promise_finally') || minVers) && eval('new Promise(resolve => resolve()).finally()');
      (test('rest_prop') || minVers) && eval('let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };');
      (test('for_await') || minVers) && eval('async function foo() { for await (const a of []) {} }');
      (test('regex') || minVers) && eval(String.raw`/(?<=f)\p{L}+./su.test("foo\n")`);

      if (minVers) { tb_bc_info.es = 2018; if (minVers === 2018) minVers = 0; }

      (test('array2019') || minVers) && !([].flat && [].flatMap) && throwMsg('Missing array 2019 methods');
      (test('object2019') || minVers) && !(Object.fromEntries) && throwMsg('Missing Object 2019 methods');
      (test('string2019') || minVers) && !(''.trimStart && ''.trimEnd) && throwMsg('Missing string 2019 methods');
      (test('catch') || minVers) && !('try { var a = 5; } catch {}');

      if (minVers) { tb_bc_info.es = 2019; if (minVers === 2019) minVers = 0; }

      (test('null') || minVers) && !eval('null?.a; undefined ?? 7;');
      (test('bigint') || minVers) && eval('123n + 456n;');
      (test('all_settled') || minVers) && !Promise.allSettled && throwMsg('Missing Promise.allSettled');
      (test('global_this') || minVers) && globalThis !== window && throwMsg('Missing Promise.global_this');

      if (minVers) { tb_bc_info.es = 2020; if (minVers === 2021) minVers = 0; }

      (test('promise_any') || minVers) && !Promise.any && throwMsg('Missing Promise.any');
      (test('underscores') || minVers) && eval('let a = 123_456;');
      (test('logical') || minVers) && eval('let a = true; let b = false; b &&= a; b ||= a; b ??= a;');

      if (minVers) { tb_bc_info.es = 2021; if (minVers === 2021) minVers = 0; }

      (test('regex2022') || minVers) && eval(String.raw`/(\bB\b).*(\bD\b)/d.exec('A B C D E')`);
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
