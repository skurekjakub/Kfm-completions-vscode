import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";

export const identifierAttributeDefinition: HeaderAttribute =
{
  name: 'identifier',
  required: true,
  description: 'Unique page identifier.',
  dataType: AttributeDataType.String
};
