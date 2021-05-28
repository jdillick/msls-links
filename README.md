# Multisite Language Switcher Links

This repository is just a simple node.js script to help automatically create linkage for the WordPress [Multisite Language Switcher](https://wordpress.org/plugins/multisite-language-switcher/) plugin, used in conjunction with the [NS Cloner - Site Copier](https://wordpress.org/plugins/ns-cloner-site-copier/).

## Multisite Language Switcher plugin

Briefly, the [MSLS plugin](https://wordpress.org/plugins/multisite-language-switcher/) allows you to create a WordPress network install for the purpose of supporting multiple locales. One chief benefit to this approach is that very little is done to change the WordPress environment to accomplish this goal. MSLS facilitates linkage between posts and taxonomies of peer sites on the network install, and makes it easy to switch between content.

All other features of WordPress work the same as you would expect, and you can manage each site independently. This is much safer and easier than plugins that provide translation interfaces on top of WordPress.

## NS Cloner

[NS Cloner - Site Copier](https://wordpress.org/plugins/ns-cloner-site-copier/) makes cloning a site with all options, content, and taxonomies intact (in fact, all database tables) within a WordPress network very easy.

## msls-links

This script will assume that sites within your WordPress network (configured in config.json) are exact clones of each other, created by [NS Cloner - Site Copier](https://wordpress.org/plugins/ns-cloner-site-copier/) plugin.

## Installation

First, install Node.js and using the `npm` command-line tool, install any package dependencies:

From the msls-links root:

```
npm install
```

Now modify the included `config.json` file, setting the language/locale code (e.g. en_US, en_CA, fr_CA), along with the blog id of the network site.

```
{
  ...
  "blogs": {
    "en_US": 1,
    "en_GB": 2
  }
}
```

In the post_types property, list any post types you wish to have mapped between sites, and fill in your database credentials.

## Run the Script

After installation, run the script using node.js:

```
node ./index.js
```
