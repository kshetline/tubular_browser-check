# @Tubular Browser Check

## (The Art of Giving Up Gracefully)

As a web developer you likely know the pain of wanting to use flashy new web browser features, but feeling like you have to hold back until very few users will be inconvenienced by any browser incompatibilities that might arise from using the latest and greatest that browsers have to offer.

Fortunately these days, a majority of web users have switched to “evergreen” browsers which frequently self-update, allowing you to employ new features of JavaScript, HTML, and CSS with reasonable confidence.

There are still, however, even at the time I’m writing this documentation (May 2022), people clinging to Windows 7. There are users with old desktops and mobile devices with limited capacity for updates and upgrades. Ideally, instead of leaving such users out in the cold, you selectively downgrade the capabilities of your websites a little, still providing most of the desired experience on older browsers &mdash; perhaps a little less stylishly, without all the bells and whistles.

There are times, however, when only relatively up-to-date web browsers will do. There need to be some cut-off points, below which you have to say to your users (much more diplomatically, of course) they are 💩 out of luck.

Preferably this message of misfortune is conveyed gracefully, not left to the user to deduce by way of frozen screens, confusing error messages, endlessly spinning spinners, jumbled page layouts, and other assorted technical failures. A polite, friendly, human-readable message explaining the problem, and perhaps even how to remedy the issue, is a much better way to go.

This is where **@tubular/browser-check** comes in.

This is a script written in lowest-common-denominator JavaScript (requiring nothing that cannot be done under the ancient standard of ES3) for assessing what a web browser is or is not capable of, providing an opportunity to redirect to an incompatibility message page as needed.

Using **@tubular/browser-check**, you can specify a minimum ES level (6/2015, 2016, 2017, etc.), particular features required (such as grid layout or WebGL), and/or minimum version numbers for popular web browsers. You can also rule out some web browsers (such as Internet Explorer and pre-Chromium Legacy Edge) entirely.

## Installation/Use

**@tubular/browser-check** should be invoked via a `<script>` tag, before any other possibly incompatible JavaScript has a chance to run. This likely means being the first, or close to the first, script in the `<head>` section of a web page.

### Via npm

```
npm i -D @tubular/browser-check
```

Since this code is meant as a pre-check process, not part of a web application itself, it makes the most sense to install it under `devDependencies`, not `dependencies`, then copy either `browser-check.js` or `browser-check.min.js` from `node_modules` as part of your build process. For example, here is how I’m using the script in an Angular project, as seen in a snippet of `angular.json`:

```json5
{
  // ...
            "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "browser-check.min.js*",
                "input": "./node_modules/@tubular/browser-check/dist/",
                "output": "./assets/"
              }
            ],
  // ...
}
```

The script is pulled into the `<head>` section of the project’s `index.html` like this:

```html
  <script src="assets/browser-check.min.js" type="text/javascript"
          data-bc-vers="0,79,79,13.1,605" data-bc-min-es="2017"
          data-bc-fail-url="assets/incompatible.html"></script>
```

### Via unpkg.com

```html
  <script src="https://unpkg.com/@tubular/browser-check/dist/browser-check.min.js" type="text/javascript"
          data-bc-vers="0,79,79,13.1,605" data-bc-min-es="2017"
          data-bc-fail-url="assets/incompatible.html"></script>
```

## Options

Options are passed to **@tubular/browser-check** via various `data-bc-` attributes of the `<script>` tag.

### `data-bc-fail-url`

This is the URL to which the user will be forwarded if the browser check fails. If this setting is omitted, **@tubular/browser-check** merely gathers information about the browser without taking any action.

### `data-bc-min-es`

This is the minimum acceptable ES compliance level. Nothing earlier than ES3 will be reported or detected. *(Very few browsers should rate lower than ES2009 (ES5).)*

When set to a specific ES version (for example, `2018`), **@tubular/browser-check** will stop checking for higher ES levels as soon as 2018 compliance is determined (although individual higher-level features can still be checked). If `data-bc-min-es` is set to `0`, no ES level checking will be performed. If `data-bc-min-es` is set to `-1`, **@tubular/browser-check** will seek the highest level of support.

Not every ES feature is tested, of course, only a representative sample sufficient to determine the level of support with reasonable certainty.

<table>
  <tr>
    <th colspan=2>ES2009 (ES5) tests</th>
  </tr>
  <tr>
    <td><code>array2009</code></td>
    <td>Array methods <code>forEach</code>, <code>map</code>, <code>filter</code>,
      <code>reduce</code>, and <code>sort</code></td>
  </tr>
  <tr>
    <td><code>object2009</code></td>
    <td>Object methods <code>create</code>, <code>freeze</code>, and <code>keys</code></td>
  </tr>
  <tr>
    <th colspan=2>ES2015 (ES6) tests</th>
  </tr>
  <tr>
    <td><code>array2015</code></td>
    <td>Array methods such as <code>Array.from</code>, <code>keys</code>, <code>find</code>, and <code>findIndex</code></td>
  </tr>
  <tr>
    <td><code>arrow</code></td>
    <td>Arrow functions</td>
  </tr>
  <tr>
    <td><code>class</code></td>
    <td><code>class</code> declarations</td>
  </tr>
  <tr>
    <td><code>def_params</code></td>
    <td>Default function parameter values, e.g. <code>function foo(a = 5)</code></td>
  </tr>
  <tr>
    <td><code>destructuring</code></td>
    <td>Destructuring, e.g. <code>let [a, b, c] = [1, 2, 3]</code></td>
  </tr>
  <tr>
    <td><code>for_of</code></td>
    <td><code>for</code>/<code>of</code> loops</td>
  </tr>
  <tr>
    <td><code>let_const</code></td>
    <td><code>let</code> and <code>const</code> keywords</td>
  </tr>
  <tr>
    <td><code>map_set</code></td>
    <td><code>Map</code> and <code>Set</code> classes</td>
  </tr>
  <tr>
    <td><code>promise</code></td>
    <td>Native <code>Promise</code></td>
  </tr>
  <tr>
    <td><code>regex2015</code></td>
    <td>Unicode-aware regular expressions, with <code>u</code> flag</td>
  </tr>
  <tr>
    <td><code>rest_param</code></td>
    <td>Rest function parameters, e.g. <code>function foo(a, ...b)</code></td>
  </tr>
  <tr>
    <td><code>string2015</code></td>
    <td>String methods such as <code>includes</code>, <code>startsWith</code>, and <code>endsWith</code></td>
  </tr>
  <tr>
    <td><code>symbol</code></td>
    <td><code>Symbol</code>s</td>
  </tr>
  <tr>
    <td><code>template</code></td>
    <td>Template strings, marked with back ticks, e.g. <code>`You have ${count} cats.`</code></td>
  </tr>

  <tr>
    <th colspan=2>ES2016 tests</th>
  </tr>
  <tr>
    <td><code>array2016</code></td>
    <td>The array <code>includes</code> method</td>
  </tr>
  <tr>
    <td><code>exp_op</code></td>
    <td>The <code>**</code> exponentiation operator</td>
  </tr>

  <tr>
    <th colspan=2>ES2017 tests</th>
  </tr>
  <tr>
    <td><code>async</code></td>
    <td><code>async</code>/<code>await</code> support</td>
  </tr>
  <tr>
    <td><code>object2017</code></td>
    <td><code>Object.entries</code> and <code>Object.values</code></td>
  </tr>
  <tr>
    <td><code>string2017</code></td>
    <td>String methods <code>padStart</code> and <code>padEnd</code></td>
  </tr>

  <tr>
    <th colspan=2>ES2018 tests</th>
  </tr>
  <tr>
    <td><code>for_await</code></td>
    <td><code>for</code>/<code>await</code> loops</td>
  </tr>
  <tr>
    <td><code>promise_finally</code></td>
    <td><code>Promise</code> <code>finally</code> method</td>
  </tr>
  <tr>
    <td><code>regex2018</code></td>
    <td>Support for look-behind, Unicode character classes, and the dot-all flag, e.g. <code>/(?<=f)\p{L}+./su</code></td>
  </tr>
  <tr>
    <td><code>rest_prop</code></td>
    <td></td>
  </tr>

  <tr>
    <th colspan=2>ES2019 tests</th>
  </tr>
  <tr>
    <td><code>array2019</code></td>
    <td>Array <code>flat</code> and <code>flapMap</code> methods</td>
  </tr>
  <tr>
    <td><code>catch_unbound</code></td>
    <td><code>catch</code> clause in <code>try</code>/<code>catch</code> doesn’t need to be bound to a variable</td>
  </tr>
  <tr>
    <td><code>object2019</code></td>
    <td><code>Object.fromEntries</code> method</td>
  </tr>
  <tr>
    <td><code>string2019</code></td>
    <td>String <code>trimStart</code> and <code>trimEnd</code> methods</td>
  </tr>

  <tr>
    <th colspan=2>ES2020 tests</th>
  </tr>
  <tr>
    <td><code>all_settled</code></td>
    <td><code>Promise.allSettled</code> method</td>
  </tr>
  <tr>
    <td><code>bigint</code></td>
    <td>Native big integers, e.g. <code>12345678901234567890n</code></td>
  </tr>
  <tr>
    <td><code>global_this</code></td>
    <td><code>globalThis</code> is defined</td>
  </tr>
  <tr>
    <td><code>null_ops</code></td>
    <td>Support for <code>?.</code> optional chaining and <code>??</code> null-coalescing operators</td>
  </tr>

  <tr>
    <th colspan=2>ES2021 tests</th>
  </tr>
  <tr>
    <td><code>logical_assigns</code></td>
    <td>Support for <code>&&=</code>, <code>||=</code>, and <code>??=</code> assignment operators</td>
  </tr>
  <tr>
    <td><code>promise_any</code></td>
    <td><code>Promise.any</code> method</td>
  </tr>
  <tr>
    <td><code>underscores</code></td>
    <td>Underscores allowed in numeric constants, such as 86_400_000</td>
  </tr>

  <tr>
    <th colspan=2>Incomplete ES2022 tests</th>
  </tr>
  <tr>
    <td><code>regex2022</code></td>
    <td>Regular expression <code>d</code> flag, providing start and end positions for matched groups</td>
  </tr>
</table>

### `data-bc-features`

### `data-bc-vers`

### `data-bc-globals`

