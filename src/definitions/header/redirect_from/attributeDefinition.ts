import { AttributeDataType } from "../../common/types";
import { HeaderAttribute } from "../types";
import { getRedirectFromCompletion } from "./redirectFromDataProvider";
import { getRedirectFromMissingAttributeCompletion } from "./redirectFromMissingAttributeDataProvider";

export const redirectFromAttributeDefinition: HeaderAttribute =
{
    name: 'redirect_from',
    required: true,
    description: 'Previous URLs for redirection.',
    dataType: AttributeDataType.StringArray, /* Or string */
    loadSupportedValues: getRedirectFromCompletion,
    getMissingAttributeCompletion: getRedirectFromMissingAttributeCompletion
};