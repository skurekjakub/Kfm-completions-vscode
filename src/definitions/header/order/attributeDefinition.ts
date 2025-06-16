import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";

export const orderAttributeDefinition: HeaderAttribute =
{ 
  name: 'order',
  required: true,
  description: 'Order for navigation/sorting.',
  dataType: AttributeDataType.Number
};