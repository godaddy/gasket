<!-- Notes incase anyone finds them useful -->

# Goals
- Speed up the creation of new apps
- Simplify the creation of new apps
- Simplify maintenance of the tool, plugins, and presets
- Centralize prompts and app shape logic

# CLI
- CLI loads preset to tmp dir
  - Potential to drop `runShellCommand`
  - Opt to use `npm` or `pnpm`
- Makes the app dir
- REVISIT: Lays down the files(can the cli laydown the files?? If it does we would likely need a preset for each app shape vs a single preset for multiple app shapes)
 - We can literally now use `fs.cp` greatly simplifying the code
- CLI runs the function passes the context
- CreateContext still applicable? Leaning yes
- How should the context look? Likely can be slimmed down

# Gasket reshaping
- remove `prompt`
- remove `create`
- remove `presetPrompt`
- remove `presetConfig`
- remove `postCreate`

# Presets
- Default export of preset is a function
- Should be the arbiter of the prompts
- Should manage the context?
- No dependencies(potentially)
  - We have app shape agnostic prompts or global prompts(typescript)
- Delivers app shape
- Executes prompts
- Executes create hooks(mutations)
  - Remove templating engine in favor of string manipulation through native APIs?
- REVISIT: Presets need to be aware of what plugins to add and their versions

# Mutation utils
- `package.json` mutation can occur via native JSON parsing and object definition
  - Should alphabitize keys?
- `gasket.js` mutation?
  - Should it be generated? It's possible it might be less complex to generate the file
  - Cumbersome string manipulation but possible
  - Utils for adding:
    - imports
    - plugins to the plugins array
    - general config objects
    - expressions?(gasketData)
- Handlebars template engine
  - The need for conditionals should decrease
  - We could use the same signature but use native string manipulation
    - `{{%appName%}}` -> `createContext.appName`
    - I want intl
      - parsing a if statement
      - inject the intl imports in the base file
          - `{{%hasIntl%}}` -> `import { FormattedMessage } from 'react-intl'`
