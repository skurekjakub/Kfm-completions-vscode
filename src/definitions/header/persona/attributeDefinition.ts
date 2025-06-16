import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";

export const personaAttributeDefinition: HeaderAttribute =
{
  name: 'persona',
  required: true,
  description: 'Target audience persona.',
  dataType: AttributeDataType.String,
  values: ['developer', 'business', 'architect', 'admin', 'all']
};
