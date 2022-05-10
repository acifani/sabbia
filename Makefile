SHELL=/bin/bash

prepare_www:
	cd www && npm install

build_www: prepare_www
	cd www && npm run build

build_pkg:
	wasm-pack build

build: build_pkg build_www

run: build_pkg prepare_www
	cd www && npm run start
