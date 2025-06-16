# Change Log

All notable changes to the "kc-mdcompletions" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.0]

- Refactor plugin internals, should offer better completions more reliably, not spam unwanted ones based on other tags present on the current line.
- Added completions for some of the newly added learn portal tags.

## [1.0.0]

Initial release. Includes:

- vscode snippets for custom Liquid tags
- autocomplete for
  - page_link page Ids
  - icon names
  - inpage_link headings
  - asset files included in the page's corresponding docsassets directory

## [1.0.2]

Only suggests icons from XP.

## [1.1]

- Code highlight for stuff inside {% code %} tags.
- General highlighting changes for kfm syntax.

## [1.1.1]

- Load page idenitifiers from _tutorial and _api as well.
- Page ids in page_link autocomplete now show which collection they're from in brackets at the end of the suggestion.
- Provide docsassets completions for _tutorial and _api as well.
- Added {% table/row/cell %} completions.
- Added {% raw/endraw %} completion.
- Added {% external_link %} completion.
- {% page_link ... %} autocomplete now inserts the collection parameter as well if you're autocompleting links to pages in a different collection than the page you're on.
- More intelligent extension activation condition.
- Fixed an issue with {% page_link ... %} autocomplete.
- {% toc %} is now being highlighted.
- Added {% page_tree %} completion.
- Added {% page_tree %} highlighting.
- Added {% panel %} tag autocompletion and highlighting.
- Added {% video %} tag highlighting.

## [1.1.2]

- Icon name completions for XP link to storybook.
- Added icon tag completion.
- Selected text before page_link is applied transfered to 'linkText'.
- fixed typo in {% table %} tag completion.
- fixed typo in {% row %} tag completion.
- Added {% status %} tag highlighting.


## [1.1.5]

- fix a bug with file parsing causing the addon to crash on startup

## [1.1.7]

- Added changelog categories completion.
- Added code highlighting support for the sql, text, and cmd languages.