REQUIREMENTS
  - Ruby
  - node.js

Test if these exist by running the following commands:
  For ruby:
    $ gem -v
    (Good to have, version >= 2.0.14)

  For node.js:
    $ npm -v
    (Good to have, version >= 2.13.1)

The rest comes easy.

GETTING STARTED
  1. Install bundler, a package manager for ruby. This will install all the
  neccessary gems we need including jekyll.
    $ gem install bundler

  2. Tell bundler to download all your gems
    $ bundle install

  3. Install neccessary npm plugins for front-end tasks.
    $ npm install

  4. Install gulp globally
    $ npm install --global gulp

DEVELOPING

  GENERATING JEKYLL
  Use bundler to run the commands, this will assure we're running commands from
  the specified plugins.

  To generate:
  $ bundle exec jekyll build

  To generate and watch for changes and serve on a server:
  $ bundle exec jekyll serve

  COMPILING LESS
  Here we use gulp to manage our front-end tasks. To view and add tasks with
  gulp see gulpfile.js

  To compile:
  $ gulp

  To compile and watch:
  $ gulp watch

  To stop any watch commands:
  In the command line.
  [control]+['C']

GIT IGNORES
  In order to reduce the size of the repo we ignore "_site", Jekyll will
  generate you a fresh one using command from above
  ($ bundle exec jekyll build). We also ignore "node_modules" which generates
  after the initial "npm install". Below is the full list.

  FILES
  # Ignore jekyll meta data
  *.jekyll-metadata
  DIRECTORIES
    _site/
    node_modules/

JEKYLL IGNORES
  [vendor,"less", "Rakefile", "Gemfile", "Gemfile.lock", "reference",
"gulpfile.js","package.json", "README.txt", "node_modules"]