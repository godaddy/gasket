### Issues

- `runShellCommand` cross-spawn fails when running `gasket create` on an existing application
```json
// Command results in non-zero code
{
  "cmd": "git",
  "argv": [
    "checkout",
    "-b",
    "main"
  ],
  "opts": {
    "cwd": "/Users/mmason2/Development/zzz-cool-app"
  },
  "debug": false
}
```
