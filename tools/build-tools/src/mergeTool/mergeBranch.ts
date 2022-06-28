/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Octokit } from "@octokit/core";
import { GitRepo } from "../bumpVersion/gitRepo";
import { getResolvedFluidRoot } from "../common/fluidUtils";

interface IntegrateParams {
    fromBranch: string,
    toBranch: string,
    featureBranch?: string,
    repoRoot?: string,
    owner?: string,
    repoName?: string,
}

// async function findAssignee(sha: string) { }

async function createPullRequest(params: IntegrateParams, prBranch: string, assignee: string) {
    const octokit = new Octokit({ auth: "${{ secrets.GITHUB_TOKEN }}" })
    const newPr = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
        owner: 'microsoft',
        repo: 'FluidFramework',
        title: 'Main Next Integrate',
        body: 'This commit is queued for getting merged with the next branch. Please make sure to resolve any conflicts/CI failures seen on this PR. Thank you!',
        head: prBranch,
        base: params.toBranch
    });
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', {
        owner: 'microsoft',
        repo: 'FluidFramework',
        issue_number: newPr.data.number,
        assignees: [ assignee ]
    });
    return newPr.data.number;
}

async function main(params: IntegrateParams) {
    const resolvedRoot = params.repoRoot ?? await getResolvedFluidRoot();
    console.log(resolvedRoot);
    const gitRepo = new GitRepo(resolvedRoot);

    const status = await gitRepo.getStatus();
    if(status !== ""){
        throw new Error("Local repo must have no changes")
    }

    const commitId: any = await gitRepo.mergeBase(params.fromBranch, params.toBranch);
    console.log("commit id: ", commitId);

    // if(!commitId) {
    //     throw new Error(params.fromBranch + " is in sync with " + params.toBranch);
    // }

    const str: any = await gitRepo.listCommit(commitId);
    console.log("list of commits: ", str);

    // if(arrCommit === "") { }

    const arrCommits: Array<string> = str.split(",");
    params.featureBranch = "main-next-" + arrCommits[arrCommits.length/2];

    const currentBranch = await gitRepo.getCurrentBranchName();
    if(currentBranch !== params.toBranch){
        await gitRepo.switchBranch(params.toBranch);
        await gitRepo.createBranch(params.featureBranch);
        await gitRepo.resetBranch(arrCommits[arrCommits.length/2]);
    }

    const prNumber = await createPullRequest(params, params.featureBranch, "sonalivdeshpande");
    console.log("pr number: ", prNumber);

    if(prNumber !== undefined) {
        try {
            await gitRepo.mergeBranch(params.toBranch);
            await gitRepo.commit("Main to next", "Error while commiting changes");
        } catch(err) {
            await gitRepo.mergeAbort(params.toBranch);
            console.log("merge abort");
        }
    }
}


main({
    fromBranch: "main",
    toBranch: "next",
    repoRoot: "",
}).catch((err) => {
    console.log(err);
}).then((response) => console.log(response));

