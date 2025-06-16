import { registerTagDefinition } from './definitionRegister';
import { TagDefinition } from './tags/types';

import { bannerTagDefinition } from './tags/block/banner/banner.types';
import { cardTagDefinition } from './tags/block/card/card.types';
import { codeTagDefinition } from './tags/block/code/code.types';
import { gridItemTagDefinition } from './tags/block/gridItem/gridItem.types';
import { gridTagDefinition } from './tags/block/grid/grid.types';
import { panelTagDefinition } from './tags/block/panel/panel.types';

import { iconTagDefinition } from './tags/inline/icon/icon.types';
import { statusTagDefinition } from './tags/inline/status/status.types';
import { pageTreeTagDefinition } from './tags/inline/pageTree/pageTree.types';
import { rawTagDefinition } from './tags/inline/raw/raw.types';
import { tocTagDefinition } from './tags/inline/tableOfContents/toc.types';

import { imageTagDefinition } from './tags/assets/image/image.types';
import { videoTagDefinition } from './tags/assets/video/video.types';
import { fileTagDefinition } from './tags/assets/file/file.types';

import { infoTagDefinition } from './tags/admonitions/info/info.types';
import { noteTagDefinition } from './tags/admonitions/note/note.types';
import { warningTagDefinition } from './tags/admonitions/warning/warning.types';
import { tipTagDefinition } from './tags/admonitions/tip/tip.types';

import { rowTagDefinition } from './tags/tables/row/row.types';
import { cellTagDefinition } from './tags/tables/cell/cell.types';
import { tableTagDefinition } from './tags/tables/table/table.types';

import { inpageLinkTagDefinition } from './tags/links/inpageLink/inpageLink.types';
import { buttonLinkTagDefinition } from './tags/links/buttonLink/buttonLink.types';
import { externalLinkTagDefinition } from './tags/links/externalLink/externalLink.types';
import { pageLinkTagDefinition } from './tags/links/pageLink/pageLink.types';

import { getAllTagDefinitions } from './definitionRegister';

/**
 * Imports all tag definitions and registers them with the central registry.
 * Should be called once during extension activation.
 */
export function registerAllTagDefinitions(): void {
    console.log("Registering all tag definitions centrally...");

    const definitionsToRegister: TagDefinition[] = [
        bannerTagDefinition, cardTagDefinition, cellTagDefinition, codeTagDefinition,
        externalLinkTagDefinition, fileTagDefinition, gridItemTagDefinition, gridTagDefinition,
        iconTagDefinition, imageTagDefinition, infoTagDefinition, inpageLinkTagDefinition,
        noteTagDefinition, pageLinkTagDefinition, pageTreeTagDefinition, panelTagDefinition,
        rawTagDefinition, rowTagDefinition, statusTagDefinition, tableTagDefinition,
        tipTagDefinition, tocTagDefinition, videoTagDefinition, warningTagDefinition,
        buttonLinkTagDefinition
        // Add others here
    ];

    definitionsToRegister.forEach(registerTagDefinition);

    console.log(`Central registration complete. Total: ${getAllTagDefinitions().length}`);
}
