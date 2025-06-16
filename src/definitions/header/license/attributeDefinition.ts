import { getLicenseCompletions } from "./licenseDataProvider";
import { HeaderAttribute } from "../types";
import { getMissingLicenseAttributeCompletion } from "./licenseMissingDataProvider";
import { AttributeDataType } from "../../common/types";

export const licenseAttributeDefinition: HeaderAttribute = {
  name: 'license',
  required: true,
  description: 'Associated license tier.',
  dataType: AttributeDataType.Number,
  loadSupportedValues: getLicenseCompletions,
  getMissingAttributeCompletion: getMissingLicenseAttributeCompletion
};
