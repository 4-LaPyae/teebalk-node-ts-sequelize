module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "globals": {},
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "@typescript-eslint/tslint",
    "import"
  ],
  "rules": {
    "arrow-body-style": "off",
    "block-scoped-var": "error",
    "complexity": "error",
    "constructor-super": "error",
    "curly": "error",
    "default-case": "off",
    "no-case-declarations": "off",
    "dot-notation": "error",
    "eol-last": "error",
    "eqeqeq": "error",
    "guard-for-in": "error",
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "max-classes-per-file": "off",
    "newline-per-chained-call": "error",
    "new-parens": "error",
    "no-alert": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": "error",
    "no-else-return": "error",
    "no-empty": "off",
    "no-empty-functions": "off",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-fallthrough": "error",
    "no-floating-decimal": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-invalid-this": "off", // TODO: enable or remove
    "no-iterator": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-loop-func": "error",
    "no-magic-numbers": ["off", {"ignoreArrayIndexes": true}], // TODO: enable or remove
    "no-multi-spaces": "error",
    "no-multi-str": "error",
    "no-multiple-empty-lines": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "error",
    "no-proto": "error",
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "no-undef-init": "error",
    "no-unsafe-finally": "error",
    "no-unused-expressions": "error",
    // "no-unused-vars": ["error", {"varsIgnorePattern": "ctx"}],
    "no-use-before-define": "error",
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-void": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "padding-line-between-statements": "error",
    "prefer-const": "error",
    "quote-props": [
      "error",
      "as-needed"
    ],
    "radix": "error",
    "require-await": "error",
    "sort-imports": [
      "error",
      {
        "ignoreCase": true,
        "ignoreDeclarationSort": true,
        "ignoreMemberSort": false
      }
    ],
    "space-before-function-paren": [
      "error",
      {
        "anonymous": "never",
        "asyncArrow": "always",
        "named": "never"
      }
    ],
    "use-isnan": "error",
    "yoda": "error",
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/class-name-casing": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-definitions": "error",
    "@typescript-eslint/explicit-function-return-type": "off", // TODO: enable or remove
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      {
        "overrides": {
          "constructors": "off"
        }
      }
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-unused-vars": "off", // TODO: enable or remove
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/type-annotation-spacing": "error",
    "@typescript-eslint/unified-signatures": "error",
    "@typescript-eslint/tslint/config": [
      "error",
      {
        "rulesDirectory": [
          "node_modules/tslint-config-security/dist/rules"
        ],
        "rules": {
          "align": [
            true,
            "parameters",
            "statements"
          ],
          "comment-format": [
            true,
            "check-space"
          ],
          "deprecation": true,
          "import-blacklist": [
            true,
            "rxjs/Rx"
          ],
          "import-spacing": true,
          "jsdoc-format": true,
          "max-line-length": [
            true,
            140
          ],
          "no-redundant-jsdoc": true,
          "no-reference-import": true,
          "no-shadowed-variable": true,
          "no-trailing-whitespace": true,
          "no-unused-expression": true,
          "one-line": [
            true,
            "check-open-brace",
            "check-catch",
            "check-else",
            "check-whitespace"
          ],
          "only-arrow-functions": [
            true,
            "allow-declarations",
            "allow-named-functions"
          ],
          "quotemark": [
            true,
            "single"
          ],
          "semicolon": [
            true,
            "always"
          ],
          "trailing-comma": [
            true,
            {
              "multiline": "never",
              "singleline": "never"
            }
          ],
          "triple-equals": [
            true,
            "allow-null-check"
          ],
          "tsr-detect-buffer-noassert": true,
          "tsr-detect-child-process": true,
          "tsr-detect-eval-with-expression": true,
          "tsr-detect-no-csrf-before-method-override": true,
          "tsr-detect-non-literal-buffer": true,
          "tsr-detect-non-literal-fs-filename": true,
          "tsr-detect-non-literal-regexp": true,
          "tsr-detect-non-literal-require": true,
          "tsr-detect-pseudo-random-bytes": true,
          "tsr-detect-sql-literal-injection": true,
          "tsr-detect-unsafe-cross-origin-communication": true,
          "tsr-detect-unsafe-properties-access": true,
          "tsr-detect-unsafe-regexp": true,
          "tsr-disable-mustache-escape": true,
          "whitespace": [
            true,
            "check-branch",
            "check-module",
            "check-decl",
            "check-operator",
            "check-separator",
            "check-type"
          ]
        }
      }
    ],
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "newlines-between": "always",
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"]
      }
    ]
  },
  "overrides": [
    {
      "files": [
        "**/*.spec.ts"
      ],
      "env": {
        "jest": true
      }
    }
  ]
};
