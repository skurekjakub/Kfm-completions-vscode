import { HeaderDefinition } from './types';

import { redirectFromAttributeDefinition } from './redirect_from/attributeDefinition';
import { tocAttributeDefinition } from './toc/attributeDefinition';
import { relatedPagesAttributeDefinition } from './related_pages/attributeDefinition';
import { licenseAttributeDefinition } from './license/attributeDefinition';
import { orderAttributeDefinition } from './order/attributeDefinition';
import { titleAttributeDefinition } from './title/attributeDefinition';
import { identifierAttributeDefinition } from './identifier/attributeDefinition';
import { personaAttributeDefinition } from './persona/attributeDefinition';
import { searchableAttributeDefinition } from './searchable/attributeDefinition';

// --- The Header Definition ---

export const markdownHeaderDefinition: HeaderDefinition = {
  definitionType: 'markdownHeader',
  attributes: [
    titleAttributeDefinition,
    identifierAttributeDefinition,
    personaAttributeDefinition,
    orderAttributeDefinition,
    licenseAttributeDefinition,
    relatedPagesAttributeDefinition,
    redirectFromAttributeDefinition,
    tocAttributeDefinition,
    searchableAttributeDefinition
    // Add other known attributes like 'category' if needed
  ]
};
