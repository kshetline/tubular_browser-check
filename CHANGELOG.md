## 1.4.0

* Add ES2022 tests.

## 1.3.0

* Add `tb-bc-skip=true` URL parameter option to skip over browser check.

## 1.2.0

* Added ability to mark the browser check script tag using `id` (`id="tb-browser-check"`) so that browsers too old to support `querySelector` can be tested. (Some old versions of IE support `querySelector`, but lose that support when running in quirks mode.) 

## 1.1.0

* Full version checking (not just major version comparison) for all browsers.

## 1.0.3

* Fix AppleWebKit detection problem.

## 1.0.2

* Give warning message about a particular browser not being supported priority over an ES level error message.

## 1.0.1

* Add work-around for Internet Explorer `<base href=...>` bug.

## 1.0.0

* Original release
