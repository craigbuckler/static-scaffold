---
title: Welcome
menu: home
description: This is a demonstration site.
priority: 1.0
---

Resources:

* [Git repository](https://github.com/craigbuckler/static-scaffold)
* [Gulp](http://gulpjs.com/)
* [Gulp introduction](https://www.sitepoint.com/introduction-gulp-js/)
* [Metalsmith](http://www.metalsmith.io/)
* [gulpsmith](https://www.npmjs.com/package/gulpsmith)
* [EJS template](http://ejs.co/)

Hosting:

* [Cloudflare](https://www.cloudflare.com/)
* [staticland](https://static.land/)

Content is added in markdown format to basic files.

## Shortcodes
The shortcodes **name**, **version**, **url**, **root**, **rootURL**, **menu**, **nowYear** and **dateFormatted** can be used between [ and ] brackets, e.g.

* [**version**]: [version]
* [**name**]: [name]
* [**menu**]: [menu]
* [**dateFormatted**]: [dateFormatted]
* [**nowYear**]: [nowYear]
* [**url**]: [url]
* [**root**]: [root]
* [**rootURL**]: [rootURL]

These can be added to markdown files (they are already available as variables to view templates).

## H2 heading
More information.

> A blockquote

### H3 heading
Table:

| name | description |
|-|-|
| r1c1 | row 1, column 2 |
| r2c1 | row 2, column 2 |

Single `code` snippet.

```html
<p>Code in ``` blocks automatically escaped.</p>

```

<div id="realcode">
  <p>Standard HTML can also be used.</p>
</div>

<form method="post">

  <fieldset>
    <legend>test form</legend>

  <div class="field">
    <input type="text" id="name" name="name" placeholder="" />
    <label for="name">name</label>
  </div>

  <div class="field">
    <input type="email" id="email" name="email" placeholder="" />
    <label for="email">email</label>
  </div>

  <div class="field tall">
    <textarea id="comments" name="comments" rows="3" cols="20"></textarea>
    <label for="comments">comments</label>
  </div>

  <div class="field">
    <input type="checkbox" id="subscribe" name="subscribe" />
    <label for="subscribe">subscribe</label>
  </div>

  <button type="submit">submit</button>

  </fieldset>

</form>

markdowned image:
[![Craig]([root]images/craig.jpg)]([root]contact/)

progressive image (inlined with `data-inline="1"`):
<a href="[root]images/craig.jpg" class="progressive replace">
  <img src="[root]images/craig-pv.jpg" alt="Craig" class="preview" />
</a>
