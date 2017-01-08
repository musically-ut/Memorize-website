.PHONY: build

build:
	@rm -rf build/
	@mkdir -p build
	@cp favicon.ico index.html build/
	@mkdir -p build/css
	@cp css/*.css  build/css/
	@cp -r css/et-book  build/css/
	@mkdir -p build/data
	@cp -r data/*.json build/data/
	@mkdir -p build/js
	@cp -r js/*.js   build/js/
	@mkdir -p build/img
	@cp -r img/*  build/img/
	@echo "Done."
