PATH := ./node_modules/.bin:$(PATH)

LINT := tslint
LINT_FLAGS := --config ./.tslintrc.json

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

SOURCES := $(patsubst %, ./lib/%.ts, $(SOURCE_NAMES))
TESTS := $(patsubst %, ./test/%.ts, $(TEST_NAMES))

.PHONY: lint

lint: $(SOURCES) $(TESTS)
	$(LINT) $(LINT_FLAGS) $^
