# Static site scaffold

A static site scaffold built using Gulp, Metalsmith and custom plugins.
Used for the basis of static websites.


## Development
Build in development mode and watch for file changes:

```
gulp
```

or `gulp build` to just build development files.


## Production
Build files for production deployment:

```
NODE_ENV=production gulp build
```


## Deployment
Upload using FTP (not ideal but works on most hosts):

```
gulp deploy -u <ID> -p <PW>
```

## Browser testing
Test in Windows Chrome:

```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --incognito --auto-open-devtools-for-tabs http://localhost:8000/
```



## Configuration
Set in the `"site"` section of `package.json`.

Values are passed to Metalsmith metadata.


## Front-matter
The following properties are supported:

|name|description|
|-|-|
|title|the main heading|
|menu|the name to use in menus [default is the title]|
|description|description for meta tags and article lists|
|date|the date written|
|publish|the date to publish (or `private` or `draft`)|
|layout|the template [`page.html`]|
|priority|1.0 to 0.0, determines menu hierarchy and sitemaps|
|orderby|the priority factor [`priority`])
|reverse|true to reverse the ordering|
|private|page will not appear in navigation|
|nomenu|page will not show sub-menus (such as an article list page)|
|tag|comma-separated list of tags used to generate tag pages|
|hero|the hero image|
|thumb|the thumbnail image [first image on page or hero]|


## files[] properties
Available within scripts and EJS `<%= %>` templates:

|name|description|
|-|-|
|title|the main heading|
|menu|the name to use in menus|
|description|description for meta tags and article lists|
|date|the date written|
|dateFormatted|formatted date|
|publish|the date to publish (or `private` or `draft`)|
|layout|the template [`page.html`]|
|priority|1.0 to 0.0, determines menu hierarchy and sitemaps|
|orderby|the priority factor [`priority`])
|reverse|true to reverse the ordering|
|private|page will not appear in navigation|
|url|URL (relative or absolute from root)|
|root|root path|
|hero|hero image URL|
|image1|first image URL|
|thumb|thumbnail image URL [`thumb` || `image1` || `hero`]|
|tag|array of tags|
|navrel|object containing hierarchy links|

### navrel object
Provides the following properties

|name|description|
|-|-|
|.parent|.title and .url of parent page|
|.back|.title and .url of previous sibling|
|.next|.title and .url of next sibling|
|.child|array of child objects (.title, .description, .url, .date, .dateF)|


## meta properties
Available in `metalsmith.metadata()`:

|name|description|
|-|-|
|nav|array of menu items. Each item contains a `.child` array of sub-items|
|tag|array of all tags|


## Shortcodes
Shortcodes are translated in markdown files and templates:

|name|description|
|-|-|
|version|site version|
|name|site name|
|menu|the page menu title|
|dateFormatted|the page publication date|
|nowYear|the full year|
|url|the URL of the page relative to the root|
|root|the root path|
|rootURL|the fully qualified root path including the domain|
