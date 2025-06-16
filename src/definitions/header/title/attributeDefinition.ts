import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";

export const titleAttributeDefinition: HeaderAttribute = 
{
  name: 'title',
  required: true,
  description: 'The main title of the page.',
  dataType: AttributeDataType.String
};
