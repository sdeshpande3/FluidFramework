/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Editor, FlowDocument } from "@chaincode/webflow";
import { Scheduler, Template, View } from "@prague/flow-util";
import * as styles from "./index.css";

const template = new Template({
    tag: "div",
    props: { className: styles.page, tabIndex: 0 },
    children: [
        { tag: "div", ref: "slot", props: { className: styles.slot }},
    ],
});

// tslint:disable-next-line:no-empty-interface
interface IPageProps {}

interface IPageInit extends IPageProps {
    doc: FlowDocument;
    scheduler: Scheduler;
}

export class Page extends View<IPageInit, IPageProps> {
    private state?: {
        slot: HTMLElement;
        editor: Editor;
    };

    public get editor() { return this.state.editor; }

    protected onAttach(props: Readonly<IPageInit>) {
        const root = template.clone() as HTMLElement;
        const slot = template.get(root, "slot") as HTMLElement;

        const editor = new Editor();
        const { doc, scheduler } = props;

        slot.appendChild(
            editor.mount({
                doc,
                scheduler,
                eventSink: root,
                trackedPositions: [],
            }),
        );

        this.state = {
            slot,
            editor,
        };

        return root;
    }

    protected onUpdate(props: IPageProps) {
        Object.assign(this.state, props);
    }

    protected onDetach() {
        this.state.editor.unmount();
    }
}
