module.exports = {
  branches: [
    "main",
    "master",
    {
      name: "develop",
      prerelease: true
    },
    {
      name: "release",
      prerelease: true
    }
  ],
  plugins: [
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator"
  ]
};
