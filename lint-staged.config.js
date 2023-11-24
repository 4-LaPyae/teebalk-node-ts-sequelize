module.exports = {
  "*.{ts}": [
    "prettier --check --write",
    "eslint --fix",
    "git add"
  ],
  "*.{json,md}": [
    "prettier --write",
    "git add"
  ]
};
