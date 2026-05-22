# PixivHelper

Chrome extension for the local PictureSpider listener.

## Features

- Adds a `关注(Queue)` context-menu item on supported site pages.
- Sends the current page URL to `http://127.0.0.1:5678/` so PictureSpider can queue the matching author/user.
- Periodically sends Pixiv and Twitter/X browser cookies to the local listener for database-backed auth state.
- Shows a small in-page notification when a queue request succeeds or fails.

## Supported Sites

- Pixiv: `https://www.pixiv.net/`
- Hitomi: `https://hitomi.la/`
- Kemono: `https://kemono.su/`
- Twitter/X: `https://twitter.com/`, `https://x.com/`

## Notes

PictureSpider must be running locally and listening on `127.0.0.1:5678`.
Cookie values are sent only to that local listener.
