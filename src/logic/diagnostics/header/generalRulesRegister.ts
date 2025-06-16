import { validateAttributeAllowedValues, validateAttributeType, validateNestedAttributes, validateRequiredAttribute } from "./headerValidationRules";
import { HeaderValidationRuleFn } from "./types";

// List of all rule functions to run
export const allHeaderValidationRules: HeaderValidationRuleFn[] = [
  validateRequiredAttribute,
  validateAttributeType,
  validateAttributeAllowedValues,
  validateNestedAttributes
];