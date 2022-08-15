/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { execSync } from 'child_process';

/**
 * Gets the commit in target branch that the current feature branch is based on.
 */
export function getBaselineCommit(): string {
  return execSync(`git merge-base origin/${process.env.TARGET_BRANCH_NAME} HEAD`).toString().trim();
}

export function getPriorCommit(baseCommit: string): string {
  return execSync(`git log --pretty=format:"%H" -1 ${baseCommit}~1`).toString().trim();
}
