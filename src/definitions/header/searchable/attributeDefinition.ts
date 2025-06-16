import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";

export const searchableAttributeDefinition: HeaderAttribute = {
  name: 'searchable',
  required: false,
  description: 'Defines if the page appears in search results',
  dataType: AttributeDataType.Boolean,
  values: [true, false]
};
