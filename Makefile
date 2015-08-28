PATH := ./node_modules/.bin:$(PATH)

LINT := tslint
LINT_FLAGS := --config ./.tslintrc.json

CC := tsc
FLAGS := --module commonjs --target ES5 --noImplicitAny --noEmitOnError --suppressImplicitAnyIndexErrors --removeComments

TESTER := _mocha
TEST_FLAGS := --reporter spec --timeout 1000 --ui bdd

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

.PHONY: lint build all clean test

build: $(LAST_BUILD)

$(LAST_BUILD): $(SOURCES)
	$(CC) $(FLAGS) -d $? $(LIBS)
	@touch $@

all: $(LAST_BUILD_ALL)

$(LAST_BUILD_ALL): $(SOURCES) $(TESTS)
	$(CC) $(FLAGS) $? $(LIBS)
	@touch $@

lint: $(SOURCES) $(TESTS)
	$(LINT) $(LINT_FLAGS) $^

test: $(LAST_BUILD_ALL)
	$(TESTER) $(TEST_FLAGS)

clean:
	rm -f $(JS) $(DECLARES)
	@rm -f $(LAST_BUILD_ALL) $(LAST_BUILD)
