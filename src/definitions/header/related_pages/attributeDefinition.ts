import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";
import { getRelatedPagesCompletions } from "./relatedPagesDataProvider";
import { getRelatedPagesMissingAttributeCompletion } from "./relatedPagesMissingAttributeDataProvider";

export const relatedPagesAttributeDefinition: HeaderAttribute = {
  name: 'related_pages',
  required: false,
  description: 'List of related page identifiers.',
  dataType: AttributeDataType.StringArray,
  loadSupportedValues: getRelatedPagesCompletions,
  getMissingAttributeCompletion: getRelatedPagesMissingAttributeCompletion
};
