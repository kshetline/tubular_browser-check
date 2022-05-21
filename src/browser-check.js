(function () {
  function throwMsg(s) { throw s; }

  function trim(s) { return !s ? s : s.trim ? s.trim() : s.replace(/^\s+/, '').replace(/\s+$/, ''); }

  function split(s, delim) {
    if (!s)
      return s;
    else if (s.split)
      return s.split(delim);

    var result = [];

    while (s) {
      var pos = s.indexOf(delim);

      if (s >= 0) {
        result.push(s.substring(0, pos));
        s = s.substring(pos + delim.length);
      }
      else {
        result.push(s);
        break;
      }
    }

    return result;
  }

  function highlightVersion(agent, re, name, version) {
    agent = agent.replace(re, '$1<span style="font-weight: bold; color: magenta;">$2$3</span>$4')
      .replace(/\$[34]/g, '');

    return 'Your browser: ' + agent + '<br><br>\n' + name + ' version must be ' + version + ' or later';
  }

  var script = document.currentScript || document.querySelector('script[data-bc-vers]') ||
    document.querySelector('script[data-bc-min-es]') || document.querySelector('script[data-bc-globals]');
  var url = script.getAttribute('data-bc-fail-url');
  var minEsVers = parseInt(script.getAttribute('data-bc-min-es') || '0');
  var versionList = script.getAttribute('data-bc-vers');
  var v = { IE: 0, LegacyEdge: 1, Chrome: 2, Firefox: 3, Safari: 4 };
  versionList = versionList ? split(versionList, ',') : [];
  var args = [];

  for (var i = 0; i < versionList.length; ++i)
    args.push(parseFloat(versionList[i]));

  if (minEsVers === 5)
    minEsVers = 2009;
  else if (minEsVers === 6)
    minEsVers = 2015;

  var minVers = minEsVers;
  var globalsOpt = script.getAttribute('data-bc-globals');
  var globals = (globalsOpt === '' || /^1ty/i.test(globalsOpt || ''));
  var features = {};
  var lastFeatureTested = '';
  var za = ['0', '0', '0'];
  var tb_bc_info = { browser: 'Unrecognized', version: null, es: 3, msg: '' };
  var featuresOpt = script.getAttribute('data-bc-features');
  var featureList = (featuresOpt ? split(featuresOpt, ',') : []);
  var featureCount = featureList.length;
  var re;

  for (i = 0; i < featureCount; ++i)
    features[trim(featureList[i])] = true;

  (function () {
    var ua = navigator.userAgent;
    var ieVersion = parseInt(((re = /(\bMSIE )(\d+)/).exec(ua) ||
                              (re = /(\bWindows NT\b.+\brv:0)(\d+)/).exec(ua) || za)[2]);

    if (/\b(Firefox|Chrome|HeadlessChrome)\b/.test(ua))
      ieVersion = 0;

    if (ieVersion) {
      tb_bc_info.browser = 'IE';
      tb_bc_info.version = ieVersion;

      if (args[v.IE] === 0)
        tb_bc_info.msg = 'Internet Explorer is not supported';
      else if (ieVersion && args[v.IE] > 0 && ieVersion < args[v.IE])
        tb_bc_info.msg = highlightVersion(ua, re, 'Internet Explorer', args[v.IE]);

      return;
    }

    var legacyEdgeVersion = parseInt(((re = /(\bEdge\/)(\d+)([.\d]+)?/).exec(ua) || za)[2]);

    if (legacyEdgeVersion) {
      tb_bc_info.browser = 'Legacy Edge';
      tb_bc_info.version = legacyEdgeVersion;

      if (args[v.LegacyEdge] === 0)
        tb_bc_info.msg = 'Legacy Edge is not supported';
      else if (legacyEdgeVersion && args[v.LegacyEdge] > 0 && legacyEdgeVersion < args[v.LegacyEdge])
        tb_bc_info.msg = highlightVersion(ua, re, 'Legacy Edge', args[v.LegacyEdge]);

      return;
    }

    var chromeVersion = parseInt(((re = /(\b(?:Headless)?Chrome\/)(\d+)([.\d]+)?/).exec(ua) || za)[2]);

    if (chromeVersion) {
      tb_bc_info.browser = 'Chrome';
      tb_bc_info.version = chromeVersion;

      if (args[v.Chrome] === 0)
        tb_bc_info.msg = 'Chrome is not supported, nor related Chromium-derived browsers';
      else if (chromeVersion && args[v.Chrome] > 0 && chromeVersion < args[v.Chrome])
        tb_bc_info.msg = highlightVersion(ua, re, 'Chrome', args[v.Chrome]);

      if (navigator.userAgentData && navigator.userAgentData.brands && navigator.userAgentData.brands.length > 1) {
        var brands = navigator.userAgentData.brands;
        var brand = brands[brands.length - 1];

        if (brand.brand)
          tb_bc_info.browser = 'Chrome variant (' + brand.brand + ')';
      }
      else if (/\bEdg\//.test(ua))
        tb_bc_info.browser = 'Chrome variant (Windows Edge)';
      else if (/\bOPR\/\b/.test(ua))
        tb_bc_info.browser = 'Chrome variant (Opera)';
      else if (/\b(SamsungBrowser|SAMSUNG)\b/.test(ua))
        tb_bc_info.browser = 'Chrome variant (Samsung)';
      else if (/\bUCBrowser\//.test(ua))
        tb_bc_info.browser = 'Chrome variant (UC Browser)';
      else if (/\bYaBrowser\//.test(ua))
        tb_bc_info.browser = 'Chrome variant (Yandex)';

      return;
    }

    var firefoxVersion = parseInt(((re = /(\bFirefox\/)(\d+)([.\d]+)?/).exec(ua) || za)[2]);

    if (firefoxVersion) {
      tb_bc_info.browser = 'Firefox';
      tb_bc_info.version = firefoxVersion;

      if (args[v.Firefox] === 0)
        tb_bc_info.msg = 'Firefox is not supported';
      else if (firefoxVersion && args[v.Firefox] > 0 && firefoxVersion < args[v.Firefox])
        tb_bc_info.msg = highlightVersion(ua, re, 'Firefox', args[v.Firefox]);

      return;
    }

    var safariVersion = parseFloat(((re = /(\bVersion\/)(\d+(?:\.\d+)?)([.\d]+)?(.*\bSafari\/\d+)/).exec(ua) || za)[2]);

    if (/\b(Android|Linux)\b/.test(ua))
      safariVersion = 0;

    if (safariVersion) {
      tb_bc_info.browser = 'Safari';
      tb_bc_info.version = safariVersion;

      if (args[v.Safari] === 0)
        tb_bc_info.msg = 'Safari is not supported';
      else if (safariVersion && args[v.Safari] > 0 && safariVersion < args[v.Safari])
        tb_bc_info.msg = highlightVersion(ua, re, 'Safari', args[v.Safari]);
    }
  })();

  if (!tb_bc_info.msg || minEsVers || featureCount > 0) {
    function test(name) { lastFeatureTested = name; return features[name]; }

    try {
      var prom = (typeof Promise !== 'undefined' ? Promise : {});

      (test('array2009') || minVers) &&
        !([].forEach && [].map && [].filter && [].reduce && [].sort) && throwMsg('Missing array 2009 methods');
      (test('object2009') || minVers) &&
        !(Object.create && Object.freeze && Object.keys) && throwMsg('Missing Object 2009 methods');

      if (minVers) { tb_bc_info.es = 2009; if (minVers === 2009) minVers = 0; }

      (test('let_const') || minVers) && eval('let a = "a"; const b = 5');
      (test('arrow') || minVers) && eval('(y = 0) => -y');
      (test('for_of') || minVers) && eval('for (a of [1, 2]) {}');
      (test('map_set') || minVers) && eval('new Map(); new Set();');
      (test('class') || minVers) && eval('class MyClass { constructor() {} }');
      (test('promise') || minVers) && eval('new prom(resolve => resolve()).catch()');
      (test('symbol') || minVers) && eval('Symbol("symbol")');
      (test('def_params') || minVers) && eval('function foo(a = 5) {}');
      (test('rest_param') || minVers) && eval('function foo(...a) {}');
      (test('string2015') || minVers) &&
        !(''.includes && ''.startsWith && ''.endsWith) && throwMsg('Missing string 2015 methods');
      (test('array2015') || minVers) &&
        !(Array.from && [].keys && [].find && [].findIndex) && throwMsg('Missing array 2015 methods');
      (test('template') || minVers) && eval('let a = 5; let b =`x${a}y`;');
      (test('destructuring') || minVers) && eval('const [x, y] = [1, 2]');

      if (minVers) { tb_bc_info.es = 2015; if (minVers === 2015) minVers = 0; }

      (test('exp_op') || minVers) && eval('let a = 2 ** 7;');
      (test('array2016') || minVers) && ![].includes && throwMsg('Missing array 2016 methods');

      if (minVers) { tb_bc_info.es = 2016; if (minVers === 2016) minVers = 0; }

      (test('string2017') || minVers) && !(''.padStart && ''.padEnd) && throwMsg('Missing string 2017 methods');
      (test('object2017') || minVers) && !(Object.entries && Object.values) && throwMsg('Missing Object 2017 methods');
      (test('async') || minVers) && eval('async function foo() {}');

      if (minVers) { tb_bc_info.es = 2017; if (minVers === 2017) minVers = 0; }

      (test('promise_finally') || minVers) && eval('new prom(resolve => resolve()).finally()');
      (test('rest_prop') || minVers) && eval('let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };');
      (test('for_await') || minVers) && eval('async function foo() { for await (const a of []) {} }');
      (test('regex2018') || minVers) && eval('/(?<=f)\\p{L}+./su.test("foo\\n")');

      if (minVers) { tb_bc_info.es = 2018; if (minVers === 2018) minVers = 0; }

      (test('array2019') || minVers) && !([].flat && [].flatMap) && throwMsg('Missing array 2019 methods');
      (test('object2019') || minVers) && !(Object.fromEntries) && throwMsg('Missing Object 2019 methods');
      (test('string2019') || minVers) && !(''.trimStart && ''.trimEnd) && throwMsg('Missing string 2019 methods');
      (test('catch_unbound') || minVers) && !('try { var a = 5; } catch {}');

      if (minVers) { tb_bc_info.es = 2019; if (minVers === 2019) minVers = 0; }

      (test('null_ops') || minVers) && !eval('null?.a; undefined ?? 7;');
      (test('bigint') || minVers) && eval('123n + 456n;');
      (test('all_settled') || minVers) && !prom.allSettled && throwMsg('Missing Promise.allSettled');
      (test('global_this') || minVers) && globalThis !== window && throwMsg('Missing Promise.global_this');

      if (minVers) { tb_bc_info.es = 2020; if (minVers === 2021) minVers = 0; }

      (test('promise_any') || minVers) && !prom.any && throwMsg('Missing Promise.any');
      (test('underscores') || minVers) && eval('let a = 123_456;');
      (test('logical_assigns') || minVers) && eval('let a = true; let b = false; b &&= a; b ||= a; b ??= a;');

      if (minVers) { tb_bc_info.es = 2021; if (minVers === 2021) minVers = 0; }

      (test('regex2022') || minVers) && eval('/(\\bB\\b).*(\\bD\\b)/d.exec("A B C D E")');
    }
    catch (e) {
      tb_bc_info.msg = tb_bc_info.msg || (minVers > 0 ? '' :
        lastFeatureTested ? 'Feature failed: ' + lastFeatureTested : e.message || e.toString());
    }
  }

  if (!tb_bc_info.msg && minEsVers > 0 && tb_bc_info.es < minEsVers)
    tb_bc_info.msg = 'Insufficient ES level. Needed: ' + minEsVers + ', found: ' + tb_bc_info.es;

  if (tb_bc_info.msg && url) {
    // Try to clear body and remove other scripts before forwarding to fail URL.
    try {
      document.body.innerHTML = '';

      var scripts = document.querySelectorAll('script');

      for (i = 0; i < scripts.length; ++i) {
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
