# cincypipesanddrums.org #

This repository contains the source for the public-facing website for the Cincinnati Caledonian Pipes and Drums Band.  The site is currently comprised of static content only, having been converted from WordPress in early 2022.

## Local Development

Follow these steps to download the content in this repository for local development.

1. Open a command prompt
2. Navigate to a directory where you'd like to store the content e.g. `cd c:\git`.
3. Clone this repository using `git clone https://github.com/Cincinnati-Caledonian-Pipes-Drums-Band/website.git`
4. Edit the files with your favorite text editor e.g. Visual Studio Code, Sublime, Notepad, etc.
5. Start a local web server to view your changes prior to updating on GitHub.
    * Start a command prompt and navigate to the root directory with the site's files e.g. `cd c:\git\CCPD.org`
    * Start a local web server to browse the site's contents based on your local copy of the site's files.  For example, to start a python-based server, from the command line execute: `python -m http.server 8000`
    * Then in a browser, navigate to http://localhost:8000.

## Deploying to Production

As of early 2022, the static site is deployed on [Render.com](https://render.com).  The Render.com GitHub app is installed and configured against this repository such that whenever any change makes it to the "main" branch, Render.com will auto-deploy the change.  This auto-deployment behavior and other Production server settings can be changed by logging in to [Render.com](https://render.com) using the credentials maintained by the band (contact the president, or another officer for details).

## Site History

* Circa 2006, the site was a static site deployed on GoDaddy.com.
* Circa 2007, the site was migrated to Drupal CMS
* Circa ???, the site was migrated to WordPress
* In early 2022, the site was migrated from WordPress back to static files using the Simply Static plugin, and the host changed from A2Hosting.com to Render.com.