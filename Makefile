NODE_MODULES_PATH := $(shell pwd)/node_modules
PATH := $(NODE_MODULES_PATH)/.bin:$(PATH)

LINT := tslint
LINT_FLAGS := --config ./.tslintrc.json

CC := tsc
FLAGS := --module commonjs --target ES5 --noImplicitAny --noEmitOnError --suppressImplicitAnyIndexErrors --removeComments

TESTER := _mocha
TEST_FLAGS := --reporter spec --timeout 1000 --ui bdd

COVER := istanbul
COVER_FLAGS := --statements 100 --functions 100 --branches 100 --lines 100

SOURCE_NAMES := future
TEST_NAMES := andThen \
    apply \
	collect \
	denodify \
	failed \
	fallbackTo \
	filter \
	find \
	firstCompletedOf \
	flatMap \
	fold \
	foreach \
	fromTry \
	map \
	nodify \
	onComplete \
	onFailure \
	onSuccess \
	recover \
	recoverWith \
	reduce \
	sequence \
	should \
	successful \
	transform \
	traverse \
	withFilter \
	zip
LIB_NAMES := es6-promise \
	mocha \
	node

SOURCES := $(patsubst %, ./lib/%.ts, $(SOURCE_NAMES))
DECLARES := $(patsubst %, ./lib/%.d.ts, $(SOURCE_NAMES))
TESTS := $(patsubst %, ./test/%.ts, $(TEST_NAMES))
LIBS := $(foreach LIB, $(LIB_NAMES), ./lib.d/$(LIB)/$(LIB).d.ts)
JS := $(patsubst %.ts, %.js, $(SOURCES) $(TESTS))

LAST_BUILD_ALL := ./.last_build_all
LAST_BUILD := ./.last_build
COVERAGE_RESULT := ./coverage/coverage-final.json

.PHONY: lint build all clean test cover modules
.DEFAULT: build

build: modules $(LAST_BUILD)

$(LAST_BUILD): $(SOURCES)
	$(CC) $(FLAGS) -d $? $(LIBS)
	@touch $@

all: modules $(LAST_BUILD_ALL)

$(LAST_BUILD_ALL): $(SOURCES) $(TESTS)
	$(CC) $(FLAGS) $? $(LIBS)
	@touch $@

lint: modules lint-internal

lint-internal: $(SOURCES) $(TESTS)
	$(LINT) $(LINT_FLAGS) $^

test: modules $(LAST_BUILD_ALL)
	$(TESTER) $(TEST_FLAGS)

cover: modules $(COVERAGE_RESULT)
	$(COVER) check-coverage $(COVER_FLAGS)

$(COVERAGE_RESULT): $(LAST_BUILD_ALL)
	$(COVER) cover $(TESTER) -- $(TEST_FLAGS)

clean:
	rm -f $(JS) $(DECLARES)
	@rm -f $(LAST_BUILD_ALL) $(LAST_BUILD)

modules: $(NODE_MODULES_PATH)

$(NODE_MODULES_PATH):
	npm install
