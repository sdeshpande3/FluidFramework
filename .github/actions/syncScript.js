const { Octokit } = require("@octokit/action");

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

// See https://developer.github.com/v3/issues/#create-an-issue
// const { data } = await octokit.request("POST /repos/{owner}/{repo}/issues", {
//   owner,
//   repo,
//   title: "My test issue",
// });
// console.log("Issue created: %s", data.html_url);

const { data } = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    title: 'Merge conflict with next branch',
    body: 'This pull request is a test!',
    head: 'my-feature-branch',
    base: 'next',
  });
  console.log("PR created: %s", data.html_url);
