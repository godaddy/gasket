# Compliance

Code that is well testing and that conforms to familiar styles helps the
collaboration process within teams and across organizations. Gasket apps come
with some tooling options and configurations to assist in this important area.

## Unit Tests

When creating a new Gasket app, developers will have the option to choose the
unit test suite for their app. Choices are [Jest] or [Mocha] with either
the [chai] or [assume] assertion libraries. Both options also provide solutions
for generating coverage reports. Gasket apps will be created with some
boilerplate tests, based on suite choice, to help developers get started.

## Code Style

### Javascript

Gasket apps are preconfigured with `eslint` and [godaddy-style] presets to
standardize on React and ES6 code style.

### CSS/SCSS

Gasket apps are preconfigured with `stylelint` and [stylelint-config-godaddy]
presets to standardize on stylesheets code style.

[jest]:https://facebook.github.io/jest/
[mocha]:https://mochajs.org/
[chai]:http://www.chaijs.com/
[assume]:https://github.com/bigpipe/assume#assume
[godaddy-style]:https://github.com/godaddy/javascript
[stylelint-config-godaddy]:https://github.com/godaddy/stylelint-config-godaddy